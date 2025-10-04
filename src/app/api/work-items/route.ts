import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { idGeneratorService } from '@/lib/idGeneratorService'

const prisma = new PrismaClient()

// GET /api/work-items - Fetch work items with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const packageFilter = searchParams.get('package')
    const statusFilter = searchParams.get('status')
    const completionFilter = searchParams.get('completion')
    const parentOnly = searchParams.get('parentOnly') === 'true'
    const includeTemplate = searchParams.get('includeTemplate') === 'true'
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    // Build where clause for filtering
    const where: any = {}
    if (projectId) where.projectId = projectId
    if (packageFilter) where.package = packageFilter
    if (statusFilter) where.status = statusFilter
    if (completionFilter) {
      const completion = parseInt(completionFilter)
      if (!isNaN(completion)) {
        where.completion = completion
      }
    }
    if (parentOnly) where.parentId = null

    // Build include clause
    const include: any = {
      children: {
        include: {
          children: {
            include: {
              children: true
            }
          },
          template: includeTemplate
        }
      },
      parent: {
        select: {
          id: true,
          title: true
        }
      },
      tasks: {
        select: {
          id: true,
          name: true,
          status: true,
          completion: true
        }
      },
      project: {
        select: {
          id: true,
          projectName: true,
          vesselName: true
        }
      }
    }

    if (includeTemplate) {
      include.template = {
        select: {
          id: true,
          packageLetter: true,
          packageName: true,
          level: true,
          itemNumber: true,
          subLetter: true
        }
      }
    }

    // Build query options
    const queryOptions: any = {
      where,
      include,
      orderBy: [
        { package: 'asc' },
        { number: 'asc' },
        { createdAt: 'asc' }
      ]
    }

    // Add pagination if specified
    if (limit) queryOptions.take = parseInt(limit)
    if (offset) queryOptions.skip = parseInt(offset)

    const workItems = await prisma.workItem.findMany(queryOptions)

    // Calculate statistics for filtered results
    const stats = {
      totalWorkItems: workItems.length,
      averageCompletion: workItems.length > 0 
        ? Math.round(workItems.reduce((sum, item) => sum + item.completion, 0) / workItems.length)
        : 0,
      completedWorkItems: workItems.filter(item => item.completion === 100).length,
      inProgressWorkItems: workItems.filter(item => item.completion > 0 && item.completion < 100).length,
      plannedWorkItems: workItems.filter(item => item.completion === 0).length,
      packagesCount: [...new Set(workItems.map(item => item.package))].length,
      projectsCount: [...new Set(workItems.map(item => item.projectId))].length
    }

    // Group by package for better organization
    const workItemsByPackage = workItems.reduce((acc: any, item) => {
      const packageName = item.package || 'Uncategorized'
      if (!acc[packageName]) {
        acc[packageName] = []
      }
      acc[packageName].push(item)
      return acc
    }, {})

    return NextResponse.json({
      workItems,
      workItemsByPackage: Object.entries(workItemsByPackage).map(([packageName, items]) => ({
        package: packageName,
        items,
        count: (items as any[]).length
      })),
      stats,
      filters: {
        projectId,
        packageFilter,
        statusFilter,
        completionFilter,
        parentOnly
      }
    })
  } catch (error) {
    console.error('Error fetching work items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work items' },
      { status: 500 }
    )
  }
}

// POST /api/work-items - Create new work item with project association
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Validate project exists if projectId is provided
    if (body.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: body.projectId },
        select: { id: true, status: true }
      })
      
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
      
      if (project.status === 'COMPLETED') {
        return NextResponse.json(
          { error: 'Cannot add work items to completed project' },
          { status: 409 }
        )
      }
    }

    // Validate template exists if templateId is provided
    if (body.templateId) {
      const template = await prisma.workItemTemplate.findUnique({
        where: { id: body.templateId },
        select: { id: true, isActive: true }
      })
      
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }
      
      if (!template.isActive) {
        return NextResponse.json(
          { error: 'Template is not active' },
          { status: 409 }
        )
      }
    }

    // Validate parent work item if parentId is provided
    if (body.parentId) {
      const parentWorkItem = await prisma.workItem.findUnique({
        where: { id: body.parentId },
        select: { id: true, projectId: true }
      })
      
      if (!parentWorkItem) {
        return NextResponse.json(
          { error: 'Parent work item not found' },
          { status: 404 }
        )
      }
      
      // Ensure parent and child belong to same project
      if (body.projectId && parentWorkItem.projectId !== body.projectId) {
        return NextResponse.json(
          { error: 'Parent and child work items must belong to the same project' },
          { status: 409 }
        )
      }
    }

    // Generate new ID using the new Work Package format if not provided
    const workItemId = body.id || await idGeneratorService.generateWorkItemIdNew(body.projectId || 'default', body.parentId)
    
    const workItem = await prisma.workItem.create({
      data: {
        id: workItemId,
        title: body.title,
        description: body.description,
        completion: body.completion || 0,
        package: body.package,
        durationDays: body.durationDays,
        startDate: body.startDate,
        finishDate: body.finishDate,
        resourceNames: body.resourceNames || '',
        isMilestone: body.isMilestone || false,
        parentId: body.parentId,
        projectId: body.projectId, // Support project association
        templateId: body.templateId, // Support template association
        number: body.number,
        category: body.category,
        volume: body.volume,
        unit: body.unit,
        status: body.status,
        imageUrl: body.imageUrl,
        dependsOnIds: body.dependsOnIds
      },
      include: {
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
        },
        tasks: {
          select: {
            id: true,
            name: true,
            status: true,
            completion: true
          }
        },
        project: {
          select: {
            id: true,
            projectName: true,
            vesselName: true
          }
        },
        template: {
          select: {
            id: true,
            packageLetter: true,
            packageName: true,
            level: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Work item created successfully',
      workItem
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating work item:', error)
    return NextResponse.json(
      { error: 'Failed to create work item' },
      { status: 500 }
    )
  }
}
