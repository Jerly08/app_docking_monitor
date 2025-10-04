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
    console.log('Creating new project...')
    
    let body
    try {
      body = await request.json()
      console.log('Request body received:', body)
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    // Validate required fields
    const { projectName, vesselName } = body
    console.log('Validating fields:', { projectName, vesselName })
    
    if (!projectName || !vesselName) {
      const errorMessage = 'Project name and vessel name are required'
      console.error('Validation failed:', errorMessage)
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    if (typeof projectName !== 'string' || typeof vesselName !== 'string') {
      const errorMessage = 'Project name and vessel name must be strings'
      console.error('Type validation failed:', errorMessage)
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    if (projectName.trim().length === 0 || vesselName.trim().length === 0) {
      const errorMessage = 'Project name and vessel name cannot be empty'
      console.error('Empty string validation failed:', errorMessage)
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    console.log('Checking for existing project with vessel name:', vesselName)
    
    // Check for projects with same vessel name and customer to avoid true duplicates
    // But allow same vessel with different customers or different project names
    const existingProject = await prisma.project.findFirst({
      where: {
        vesselName: vesselName.trim(),
        customerCompany: body.customerCompany || null,
        projectName: projectName.trim(),
        status: { not: 'COMPLETED' }
      }
    })

    if (existingProject) {
      const errorMessage = `Identical project already exists: same vessel (${vesselName}), customer (${body.customerCompany}), and project name (${projectName})`
      console.error('Exact duplicate project found:', errorMessage)
      return NextResponse.json(
        { error: errorMessage },
        { status: 409 }
      )
    }
    
    // Optional: Log if there are other projects with same vessel (for monitoring)
    const sameVesselProjects = await prisma.project.findMany({
      where: {
        vesselName: vesselName.trim(),
        status: { not: 'COMPLETED' },
        NOT: {
          AND: [
            { customerCompany: body.customerCompany || null },
            { projectName: projectName.trim() }
          ]
        }
      },
      select: {
        id: true,
        projectName: true,
        customerCompany: true
      }
    })
    
    if (sameVesselProjects.length > 0) {
      console.log(`Info: Creating new project for vessel ${vesselName}. Existing projects for same vessel:`, 
        sameVesselProjects.map(p => `${p.projectName} (${p.customerCompany || 'No customer'})`)
      )
    }

    // Prepare customer information to store in vesselSpecs for now
    const customerInfo = {
      customerId: body.customerId || null,
      customerContactPerson: body.customerContactPerson || null,
      customerPhone: body.customerPhone || null,
      customerEmail: body.customerEmail || null,
      customerAddress: body.customerAddress || null,
      ...(body.vesselSpecs || {})
    }

    console.log('Creating project with data:', {
      projectName: projectName.trim(),
      vesselName: vesselName.trim(),
      customerCompany: body.customerCompany,
      status: body.status || 'ACTIVE'
    })

    const project = await prisma.project.create({
      data: {
        projectName: projectName.trim(),
        vesselName: vesselName.trim(),
        customerCompany: body.customerCompany || null,
        vesselSpecs: customerInfo,
        status: body.status || 'ACTIVE',
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        notes: body.notes || null
      },
      include: {
        _count: {
          select: {
            workItems: true
          }
        }
      }
    })

    console.log('Project created successfully:', project.id)
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    
    // Check if it's a Prisma error
    if (error instanceof Error) {
      // Handle specific Prisma errors
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'A project with this information already exists' },
          { status: 409 }
        )
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Referenced data does not exist' },
          { status: 400 }
        )
      }
      
      // Log the full error for debugging
      console.error('Full error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to create project. Please try again.' },
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