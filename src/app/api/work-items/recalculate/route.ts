import { NextRequest, NextResponse } from 'next/server'
import { CompletionCalculationService } from '@/lib/completionCalculationService'

/**
 * POST /api/work-items/recalculate - Recalculate completion percentages
 * 
 * Body parameters:
 * - projectId: string (optional) - If provided, recalculates only for this project
 * - workItemId: string (optional) - If provided, recalculates only for this work item and its parents
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, workItemId } = body

    if (workItemId) {
      // Recalculate for a specific work item and its parents
      await CompletionCalculationService.updateParentCompletion(workItemId)
      
      return NextResponse.json({
        message: 'Completion percentage updated successfully',
        workItemId,
        type: 'single_item_update'
      })
    } else if (projectId) {
      // Recalculate for an entire project
      await CompletionCalculationService.recalculateProjectCompletion(projectId)
      
      // Get project statistics after recalculation
      const stats = await CompletionCalculationService.getProjectCompletionStats(projectId)
      
      return NextResponse.json({
        message: 'Project completion percentages recalculated successfully',
        projectId,
        type: 'project_recalculation',
        statistics: stats
      })
    } else {
      return NextResponse.json(
        { 
          error: 'Either projectId or workItemId must be provided',
          usage: {
            projectId: 'Recalculate all work items in a project',
            workItemId: 'Recalculate a specific work item and update its parents'
          }
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in recalculate endpoint:', error)
    return NextResponse.json(
      { 
        error: 'Failed to recalculate completion percentages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/work-items/recalculate?projectId=xxx - Get completion statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId query parameter is required' },
        { status: 400 }
      )
    }

    const stats = await CompletionCalculationService.getProjectCompletionStats(projectId)
    
    return NextResponse.json({
      projectId,
      statistics: stats
    })
  } catch (error) {
    console.error('Error getting completion statistics:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get completion statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}