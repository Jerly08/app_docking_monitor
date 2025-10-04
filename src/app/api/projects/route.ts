import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/projects - List all projects with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerCompany = searchParams.get('customer')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    // Build where clause for filtering
    const where: any = {}
    if (status) where.status = status
    if (customerCompany) where.customerCompany = { contains: customerCompany }

    // Build query options
    const queryOptions: any = {
      where,
      include: {
        workItems: {
          select: {
            id: true,
            title: true,
            completion: true,
            status: true
          }
        },
        _count: {
          select: {
            workItems: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }

    // Add pagination if specified
    if (limit) queryOptions.take = parseInt(limit)
    if (offset) queryOptions.skip = parseInt(offset)

    const projects = await prisma.project.findMany(queryOptions)

    // Calculate completion percentages for each project
    const projectsWithStats = projects.map(project => {
      const workItems = project.workItems || []
      const totalCompletion = workItems.reduce((sum, item) => sum + (item.completion || 0), 0)
      const averageCompletion = workItems.length > 0 ? Math.round(totalCompletion / workItems.length) : 0

      return {
        ...project,
        stats: {
          totalWorkItems: project._count.workItems,
          averageCompletion,
          completedWorkItems: workItems.filter(item => item.completion === 100).length,
          inProgressWorkItems: workItems.filter(item => item.completion > 0 && item.completion < 100).length,
          plannedWorkItems: workItems.filter(item => item.completion === 0).length
        }
      }
    })

    return NextResponse.json({
      projects: projectsWithStats,
      total: projectsWithStats.length
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { projectName, vesselName } = body
    if (!projectName || !vesselName) {
      return NextResponse.json(
        { error: 'Project name and vessel name are required' },
        { status: 400 }
      )
    }

    // Check if project with same vessel name already exists for active projects
    const existingProject = await prisma.project.findFirst({
      where: {
        vesselName: vesselName,
        status: { not: 'COMPLETED' }
      }
    })

    if (existingProject) {
      return NextResponse.json(
        { error: `Active project already exists for vessel ${vesselName}` },
        { status: 409 }
      )
    }

    const project = await prisma.project.create({
      data: {
        projectName,
        vesselName,
        customerCompany: body.customerCompany,
        vesselSpecs: body.vesselSpecs || {},
        status: body.status || 'ACTIVE',
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

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

// PUT /api/projects - Update multiple projects (bulk update)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectIds, data } = body

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json(
        { error: 'Project IDs array is required' },
        { status: 400 }
      )
    }

    // Update multiple projects
    const updateResult = await prisma.project.updateMany({
      where: {
        id: { in: projectIds }
      },
      data: {
        status: data.status,
        notes: data.notes,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      updated: updateResult.count,
      message: `${updateResult.count} project(s) updated successfully`
    })
  } catch (error) {
    console.error('Error updating projects:', error)
    return NextResponse.json(
      { error: 'Failed to update projects' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects - Delete multiple projects (bulk delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectIds = searchParams.get('ids')?.split(',')

    if (!projectIds || projectIds.length === 0) {
      return NextResponse.json(
        { error: 'Project IDs are required' },
        { status: 400 }
      )
    }

    // Check if projects have work items
    const projectsWithWorkItems = await prisma.project.findMany({
      where: {
        id: { in: projectIds }
      },
      include: {
        _count: {
          select: {
            workItems: true
          }
        }
      }
    })

    const projectsWithActiveWorkItems = projectsWithWorkItems.filter(
      p => p._count.workItems > 0 && p.status === 'ACTIVE'
    )

    if (projectsWithActiveWorkItems.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete active projects with work items',
          projectsWithWorkItems: projectsWithActiveWorkItems.map(p => ({
            id: p.id,
            name: p.projectName,
            workItemsCount: p._count.workItems
          }))
        },
        { status: 409 }
      )
    }

    // Delete projects (this will cascade delete work items due to foreign key constraints)
    const deleteResult = await prisma.project.deleteMany({
      where: {
        id: { in: projectIds }
      }
    })

    return NextResponse.json({
      deleted: deleteResult.count,
      message: `${deleteResult.count} project(s) deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting projects:', error)
    return NextResponse.json(
      { error: 'Failed to delete projects' },
      { status: 500 }
    )
  }
}