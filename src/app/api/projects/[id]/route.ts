import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/projects/[id] - Get specific project details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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
    const { id } = params
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
    const { id } = params

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

    // Check if project has work items and is active
    if (project._count.workItems > 0 && project.status === 'ACTIVE') {
      return NextResponse.json(
        { 
          error: 'Cannot delete active project with work items',
          project: {
            id: project.id,
            name: project.projectName,
            workItemsCount: project._count.workItems,
            status: project.status
          }
        },
        { status: 409 }
      )
    }

    // Delete project (this will cascade delete work items due to foreign key constraints)
    await prisma.project.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Project deleted successfully',
      deletedProject: {
        id: project.id,
        name: project.projectName
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