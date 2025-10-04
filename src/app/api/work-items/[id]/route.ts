import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { CompletionCalculationService } from '@/lib/completionCalculationService'
import { DateCalculationService } from '@/lib/dateCalculationService'

const prisma = new PrismaClient()

interface Params {
  params: {
    id: string
  }
}

// GET /api/work-items/[id] - Get single work item
export async function GET(request: NextRequest, { params }: Params) {
  try {
    // Await params for Next.js 15 compatibility
    const resolvedParams = await params
    // Decode the ID to handle encoded IDs with special characters
    const decodedId = decodeURIComponent(resolvedParams.id)
    const workItem = await prisma.workItem.findUnique({
      where: { id: decodedId },
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
    
    // Await params for Next.js 15 compatibility
    const resolvedParams = await params
    // Decode the ID to handle encoded IDs with special characters
    const decodedId = decodeURIComponent(resolvedParams.id)
    
    console.log('🔧 PUT /api/work-items/[id] - Incoming request:')
    console.log('  Work Item ID:', decodedId)
    console.log('  Request body:', JSON.stringify(body, null, 2))
    
    // Get the current work item to compare changes
    const currentWorkItem = await prisma.workItem.findUnique({
      where: { id: decodedId },
      select: {
        startDate: true,
        finishDate: true,
        durationDays: true
      }
    })
    
    // Determine which date field was changed and calculate others automatically
    let calculatedDates = {
      startDate: body.startDate,
      finishDate: body.finishDate,
      durationDays: body.durationDays
    }
    
    // Only calculate if date-related fields are being updated
    if (body.startDate !== undefined || body.finishDate !== undefined || body.durationDays !== undefined) {
      let changedField: 'startDate' | 'finishDate' | 'durationDays' | undefined
      
      // Detect which field was changed
      if (body.startDate !== undefined && body.startDate !== currentWorkItem?.startDate) {
        changedField = 'startDate'
      } else if (body.finishDate !== undefined && body.finishDate !== currentWorkItem?.finishDate) {
        changedField = 'finishDate'
      } else if (body.durationDays !== undefined && body.durationDays !== currentWorkItem?.durationDays) {
        changedField = 'durationDays'
      }
      
      // Calculate missing date fields
      // Handle empty strings and 'mm/dd/yyyy' as null for date calculation
      const startDateForCalc = body.startDate !== undefined 
        ? (body.startDate === '' || body.startDate === 'mm/dd/yyyy' ? null : body.startDate) 
        : (currentWorkItem?.startDate === '' || currentWorkItem?.startDate === 'mm/dd/yyyy' ? null : currentWorkItem?.startDate)
      
      const finishDateForCalc = body.finishDate !== undefined 
        ? (body.finishDate === '' || body.finishDate === 'mm/dd/yyyy' ? null : body.finishDate) 
        : (currentWorkItem?.finishDate === '' || currentWorkItem?.finishDate === 'mm/dd/yyyy' ? null : currentWorkItem?.finishDate)
      
      const dateCalculation = DateCalculationService.calculateDates(
        startDateForCalc,
        finishDateForCalc,
        body.durationDays !== undefined ? body.durationDays : currentWorkItem?.durationDays,
        changedField
      )
      
      // Use calculated values
      calculatedDates = {
        startDate: dateCalculation.startDate || body.startDate,
        finishDate: dateCalculation.finishDate || body.finishDate,
        durationDays: dateCalculation.durationDays || body.durationDays
      }
      
      // Log the calculation for debugging
      if (dateCalculation.calculatedField) {
        const description = DateCalculationService.getCalculationDescription(dateCalculation)
        console.log(`📅 ${description}`)
      }
      
      // Only validate dates if we have meaningful values (not empty strings or placeholders)
      const hasStartDate = calculatedDates.startDate && calculatedDates.startDate !== '' && calculatedDates.startDate !== 'mm/dd/yyyy'
      const hasFinishDate = calculatedDates.finishDate && calculatedDates.finishDate !== '' && calculatedDates.finishDate !== 'mm/dd/yyyy'
      const hasDuration = calculatedDates.durationDays && calculatedDates.durationDays > 0
      
      // Only validate if we have at least two of the three values
      if ((hasStartDate && hasFinishDate) || (hasStartDate && hasDuration) || (hasFinishDate && hasDuration)) {
        const validationErrors = DateCalculationService.validateDateRange(
          hasStartDate ? calculatedDates.startDate : null,
          hasFinishDate ? calculatedDates.finishDate : null,
          hasDuration ? calculatedDates.durationDays : null
        )
        
        if (validationErrors.length > 0) {
          console.log('Date validation errors:', validationErrors)
          return NextResponse.json(
            { 
              error: 'Date validation failed',
              validationErrors: validationErrors,
              suggestedFix: 'Please check your start date, finish date, and duration values',
              calculatedDates
            },
            { status: 400 }
          )
        }
      }
    }
    const workItem = await prisma.workItem.update({
      where: { id: decodedId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.completion !== undefined && { completion: body.completion }),
        ...(body.package !== undefined && { package: body.package }),
        // Use calculated date values instead of raw body values
        ...(calculatedDates.durationDays !== undefined && { durationDays: calculatedDates.durationDays }),
        ...(calculatedDates.startDate !== undefined && { 
          startDate: calculatedDates.startDate === 'mm/dd/yyyy' ? null : calculatedDates.startDate 
        }),
        ...(calculatedDates.finishDate !== undefined && { 
          finishDate: calculatedDates.finishDate === 'mm/dd/yyyy' ? null : calculatedDates.finishDate 
        }),
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

    // If completion percentage was updated, recalculate parent completion
    if (body.completion !== undefined) {
      try {
        await CompletionCalculationService.updateParentCompletion(decodedId)
        console.log(`✅ Updated parent completion for work item: ${decodedId}`)
      } catch (completionError) {
        console.error('Warning: Failed to update parent completion:', completionError)
        // Don't fail the whole request if completion calculation fails
      }
    }

    return NextResponse.json(workItem)
  } catch (error) {
    console.error('❌ Error updating work item:', error)
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    if (error.code) {
      console.error('Error code:', error.code)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update work item', 
        details: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    )
  }
}

// DELETE /api/work-items/[id] - Delete work item
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    // Await params for Next.js 15 compatibility
    const resolvedParams = await params
    // Decode the ID to handle encoded IDs with special characters
    const decodedId = decodeURIComponent(resolvedParams.id)
    await prisma.workItem.delete({
      where: { id: decodedId }
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