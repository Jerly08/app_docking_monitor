import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Params {
  params: {
    id: string
  }
}

// GET /api/work-items/[id] - Get single work item
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const workItem = await prisma.workItem.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!workItem) {
      return NextResponse.json(
        { error: 'Work item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(workItem)
  } catch (error) {
    console.error('Error fetching work item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work item' },
      { status: 500 }
    )
  }
}

// PUT /api/work-items/[id] - Update work item
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    
    const workItem = await prisma.workItem.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.completion !== undefined && { completion: body.completion }),
        ...(body.package !== undefined && { package: body.package }),
        ...(body.durationDays !== undefined && { durationDays: body.durationDays }),
        ...(body.startDate !== undefined && { startDate: body.startDate }),
        ...(body.finishDate !== undefined && { finishDate: body.finishDate }),
        ...(body.resourceNames !== undefined && { resourceNames: body.resourceNames }),
        ...(body.isMilestone !== undefined && { isMilestone: body.isMilestone }),
        ...(body.parentId !== undefined && { parentId: body.parentId }),
        ...(body.number !== undefined && { number: body.number }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.volume !== undefined && { volume: body.volume }),
        ...(body.unit !== undefined && { unit: body.unit }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.dependsOnIds !== undefined && { dependsOnIds: body.dependsOnIds }),
      },
      include: {
        children: true,
        parent: true,
        tasks: true
      }
    })

    return NextResponse.json(workItem)
  } catch (error) {
    console.error('Error updating work item:', error)
    return NextResponse.json(
      { error: 'Failed to update work item' },
      { status: 500 }
    )
  }
}

// DELETE /api/work-items/[id] - Delete work item
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await prisma.workItem.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Work item deleted successfully' })
  } catch (error) {
    console.error('Error deleting work item:', error)
    return NextResponse.json(
      { error: 'Failed to delete work item' },
      { status: 500 }
    )
  }
}