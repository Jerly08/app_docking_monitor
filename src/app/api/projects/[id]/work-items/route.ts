import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { idGeneratorService } from '@/lib/idGeneratorService'

const prisma = new PrismaClient()

// GET /api/projects/[id]/work-items - Get work items for specific project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const packageFilter = searchParams.get('package')
    const statusFilter = searchParams.get('status')
    const includeChildren = searchParams.get('includeChildren') === 'true'

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, projectName: true, vesselName: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Build where clause for filtering
    const where: any = { projectId: id }
    if (packageFilter) where.package = packageFilter
    if (statusFilter) where.status = statusFilter

    // Get work items with hierarchical structure
    const workItems = await prisma.workItem.findMany({
      where,
      include: {
        template: {
          select: {
            id: true,
            packageLetter: true,
            packageName: true,
            level: true,
            itemNumber: true,
            subLetter: true
          }
        },
        children: {
          include: {
            template: {
              select: {
                id: true,
                packageLetter: true,
                packageName: true,
                level: true,
                itemNumber: true,
                subLetter: true
              }
            },
            children: {
              include: {
                template: true
              }
            }
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
        }
      },
      orderBy: [
        { package: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    // Group work items by package for better organization
    const workItemsByPackage = workItems.reduce((acc: any, item) => {
      const packageName = item.package || 'Uncategorized'
      if (!acc[packageName]) {
        acc[packageName] = {
          packageName,
          items: [],
          stats: {
            total: 0,
            completed: 0,
            inProgress: 0,
            planned: 0,
            avgCompletion: 0
          }
        }
      }
      
      acc[packageName].items.push(item)
      acc[packageName].stats.total++
      
      if (item.completion === 100) acc[packageName].stats.completed++
      else if (item.completion > 0) acc[packageName].stats.inProgress++
      else acc[packageName].stats.planned++
      
      return acc
    }, {})

    // Calculate average completion for each package
    Object.keys(workItemsByPackage).forEach(packageName => {
      const packageData = workItemsByPackage[packageName]
      const totalCompletion = packageData.items.reduce((sum: number, item: any) => sum + item.completion, 0)
      packageData.stats.avgCompletion = packageData.items.length > 0 
        ? Math.round(totalCompletion / packageData.items.length) 
        : 0
    })

    // Calculate overall project stats
    const totalCompletion = workItems.reduce((sum, item) => sum + item.completion, 0)
    const averageCompletion = workItems.length > 0 ? Math.round(totalCompletion / workItems.length) : 0

    return NextResponse.json({
      project,
      workItems: workItems.filter(item => !item.parentId), // Return only parent items for clean hierarchy
      workItemsByPackage: Object.values(workItemsByPackage),
      stats: {
        totalWorkItems: workItems.length,
        averageCompletion,
        completedWorkItems: workItems.filter(item => item.completion === 100).length,
        inProgressWorkItems: workItems.filter(item => item.completion > 0 && item.completion < 100).length,
        plannedWorkItems: workItems.filter(item => item.completion === 0).length,
        packagesCount: Object.keys(workItemsByPackage).length
      }
    })
  } catch (error) {
    console.error('Error fetching project work items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project work items' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/work-items - Create work items for project (manual or from template)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, projectName: true, status: true }
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

    // Check if this is a single work item or multiple work items
    if (body.workItems && Array.isArray(body.workItems)) {
      // Multiple work items (bulk create)
      const createdWorkItems = []
      
      // Generate batch IDs for efficiency
      const batchIds = await idGeneratorService.generateBatchWorkItemIds(id, body.workItems.length)
      
      for (let i = 0; i < body.workItems.length; i++) {
        const workItemData = body.workItems[i]
        const workItem = await prisma.workItem.create({
          data: {
            ...workItemData,
            projectId: id,
            id: workItemData.id || batchIds[i]
          },
          include: {
            template: true,
            children: true,
            parent: true
          }
        })
        createdWorkItems.push(workItem)
      }

      return NextResponse.json({
        message: `${createdWorkItems.length} work items created successfully`,
        workItems: createdWorkItems,
        project
      }, { status: 201 })
    } else {
      // Single work item
      const workItemId = body.id || await idGeneratorService.generateWorkItemId(id)
      
      const workItem = await prisma.workItem.create({
        data: {
          ...body,
          projectId: id,
          id: workItemId
        },
        include: {
          template: true,
          children: true,
          parent: true
        }
      })

      return NextResponse.json({
        message: 'Work item created successfully',
        workItem,
        project
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating work items:', error)
    return NextResponse.json(
      { error: 'Failed to create work items' },
      { status: 500 }
    )
  }
}