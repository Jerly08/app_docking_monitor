import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

/**
 * Verify JWT token and extract user information
 * @param request - NextRequest object
 * @returns User object or null if invalid
 */
async function verifyToken(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null
    }
    
    const token = authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // Get user from database to get current role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    
    return user
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// GET /api/projects/[id] - Get specific project details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        workItems: {
          include: {
            template: {
              select: {
                id: true,
                packageLetter: true,
                packageName: true,
                level: true
              }
            },
            children: {
              include: {
                template: true
              }
            },
            parent: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: [
            { package: 'asc' },
            { createdAt: 'asc' }
          ]
        },
        _count: {
          select: {
            workItems: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Calculate project statistics
    const workItems = project.workItems || []
    const totalCompletion = workItems.reduce((sum, item) => sum + (item.completion || 0), 0)
    const averageCompletion = workItems.length > 0 ? Math.round(totalCompletion / workItems.length) : 0
    
    // Group work items by package
    const workItemsByPackage = workItems.reduce((acc: any, item) => {
      const packageName = item.package || 'Uncategorized'
      if (!acc[packageName]) {
        acc[packageName] = []
      }
      acc[packageName].push(item)
      return acc
    }, {})

    const projectWithStats = {
      ...project,
      stats: {
        totalWorkItems: project._count.workItems,
        averageCompletion,
        completedWorkItems: workItems.filter(item => item.completion === 100).length,
        inProgressWorkItems: workItems.filter(item => item.completion > 0 && item.completion < 100).length,
        plannedWorkItems: workItems.filter(item => item.completion === 0).length,
        packageDistribution: Object.keys(workItemsByPackage).map(packageName => ({
          package: packageName,
          count: workItemsByPackage[packageName].length,
          avgCompletion: Math.round(
            workItemsByPackage[packageName].reduce((sum: number, item: any) => sum + item.completion, 0) /
            workItemsByPackage[packageName].length
          )
        }))
      },
      workItemsByPackage
    }

    return NextResponse.json(projectWithStats)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id] - Update specific project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const body = await request.json()

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Validate vessel name uniqueness if it's being changed
    if (body.vesselName && body.vesselName !== existingProject.vesselName) {
      const duplicateProject = await prisma.project.findFirst({
        where: {
          vesselName: body.vesselName,
          status: { not: 'COMPLETED' },
          id: { not: id }
        }
      })

      if (duplicateProject) {
        return NextResponse.json(
          { error: `Active project already exists for vessel ${body.vesselName}` },
          { status: 409 }
        )
      }
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        projectName: body.projectName,
        vesselName: body.vesselName,
        customerCompany: body.customerCompany,
        vesselSpecs: body.vesselSpecs,
        status: body.status,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        notes: body.notes
      },
      include: {
        _count: {
          select: {
            workItems: true
          }
        }
      }
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete specific project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const { searchParams } = new URL(request.url)
    const forceDelete = searchParams.get('force') === 'true'

    // Verify user authentication and authorization
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Check if user has permission to delete projects
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only admins and managers can delete projects.' },
        { status: 403 }
      )
    }

    // For force deletion, only admins are allowed
    if (forceDelete && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only administrators can force delete projects.' },
        { status: 403 }
      )
    }

    // Check if project exists and get work items count
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            workItems: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Regular deletion - check if project has work items and is active
    if (!forceDelete && project._count.workItems > 0 && project.status === 'ACTIVE') {
      return NextResponse.json(
        { 
          error: 'Cannot delete active project with work items',
          project: {
            id: project.id,
            name: project.projectName,
            workItemsCount: project._count.workItems,
            status: project.status
          },
          canForceDelete: user.role === 'ADMIN'
        },
        { status: 409 }
      )
    }

    // Log the deletion action
    const deleteAction = forceDelete ? 'force deleted' : 'deleted'
    console.log(`Project ${deleteAction} by ${user.role} user ${user.username}: ${project.projectName} (${project.id})${project._count.workItems > 0 ? ` with ${project._count.workItems} work items` : ''}`)

    // Delete project (this will cascade delete work items due to foreign key constraints)
    await prisma.project.delete({
      where: { id }
    })

    return NextResponse.json({
      message: `Project ${deleteAction} successfully`,
      deletedProject: {
        id: project.id,
        name: project.projectName,
        workItemsCount: project._count.workItems,
        forceDeleted: forceDelete
      }
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
