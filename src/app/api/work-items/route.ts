import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/work-items - Fetch all work items
export async function GET(request: NextRequest) {
  try {
    const workItems = await prisma.workItem.findMany({
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true
              }
            }
          }
        },
        parent: true,
        tasks: true
      },
      orderBy: [
        { number: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json(workItems)
  } catch (error) {
    console.error('Error fetching work items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work items' },
      { status: 500 }
    )
  }
}

// POST /api/work-items - Create new work item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const workItem = await prisma.workItem.create({
      data: {
        id: body.id,
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
        number: body.number,
        category: body.category,
        volume: body.volume,
        unit: body.unit,
        status: body.status,
        imageUrl: body.imageUrl,
        dependsOnIds: body.dependsOnIds
      },
      include: {
        children: true,
        parent: true,
        tasks: true
      }
    })

    return NextResponse.json(workItem, { status: 201 })
  } catch (error) {
    console.error('Error creating work item:', error)
    return NextResponse.json(
      { error: 'Failed to create work item' },
      { status: 500 }
    )
  }
}