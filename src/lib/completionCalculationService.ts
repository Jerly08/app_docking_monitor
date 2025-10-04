import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface WorkItemWithChildren {
  id: string
  completion: number
  children?: WorkItemWithChildren[]
}

/**
 * Calculates the cumulative completion percentage for a parent work item
 * based on the completion percentages of its children
 */
export class CompletionCalculationService {
  
  /**
   * Calculate completion percentage for a single parent based on its children
   * @param children - Array of child work items with their completion percentages
   * @returns Calculated completion percentage (0-100)
   */
  static calculateParentCompletion(children: WorkItemWithChildren[]): number {
    if (!children || children.length === 0) {
      return 0
    }

    // Calculate the average completion of all children
    const totalCompletion = children.reduce((sum, child) => {
      // If this child also has children, calculate its completion first
      let childCompletion = child.completion
      if (child.children && child.children.length > 0) {
        childCompletion = this.calculateParentCompletion(child.children)
      }
      return sum + childCompletion
    }, 0)

    // Return the average, rounded to nearest integer
    return Math.round(totalCompletion / children.length)
  }

  /**
   * Recursively update completion percentages for all parent work items
   * starting from a given work item and going up the hierarchy
   * @param workItemId - The ID of the work item that was updated
   */
  static async updateParentCompletion(workItemId: string): Promise<void> {
    try {
      // Get the work item and its parent
      const workItem = await prisma.workItem.findUnique({
        where: { id: workItemId },
        select: {
          id: true,
          parentId: true,
          completion: true,
          parent: {
            select: {
              id: true,
              completion: true,
              children: {
                select: {
                  id: true,
                  completion: true,
                  children: {
                    select: {
                      id: true,
                      completion: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!workItem || !workItem.parent) {
        // No parent to update
        return
      }

      // Calculate new completion for the parent
      const newParentCompletion = this.calculateParentCompletion(workItem.parent.children)

      // Update the parent's completion if it has changed
      if (workItem.parent.completion !== newParentCompletion) {
        await prisma.workItem.update({
          where: { id: workItem.parent.id },
          data: { completion: newParentCompletion }
        })

        console.log(`🔄 Updated parent completion: ${workItem.parent.id} from ${workItem.parent.completion}% to ${newParentCompletion}%`)

        // Recursively update the parent's parent if it exists
        await this.updateParentCompletion(workItem.parent.id)
      }
    } catch (error) {
      console.error('Error updating parent completion:', error)
      throw error
    }
  }

  /**
   * Recalculate completion for all work items in a project
   * Useful for bulk updates or data migration
   * @param projectId - The project ID to recalculate
   */
  static async recalculateProjectCompletion(projectId: string): Promise<void> {
    try {
      console.log(`🔄 Recalculating completion for project: ${projectId}`)

      // Get all work items for the project with hierarchical structure
      const workItems = await prisma.workItem.findMany({
        where: { 
          projectId: projectId,
          parentId: null // Start with root items
        },
        select: {
          id: true,
          completion: true,
          children: {
            select: {
              id: true,
              completion: true,
              children: {
                select: {
                  id: true,
                  completion: true,
                  children: {
                    select: {
                      id: true,
                      completion: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      // Process each root work item
      for (const workItem of workItems) {
        await this.recalculateWorkItemTree(workItem)
      }

      console.log(`✅ Completed recalculation for project: ${projectId}`)
    } catch (error) {
      console.error('Error recalculating project completion:', error)
      throw error
    }
  }

  /**
   * Recursively recalculate completion for a work item and all its descendants
   * @param workItem - The work item to recalculate (with children)
   */
  private static async recalculateWorkItemTree(workItem: WorkItemWithChildren): Promise<void> {
    // First, recalculate all children
    if (workItem.children && workItem.children.length > 0) {
      for (const child of workItem.children) {
        await this.recalculateWorkItemTree(child)
      }

      // Then calculate this item's completion based on updated children
      const newCompletion = this.calculateParentCompletion(workItem.children)
      
      if (workItem.completion !== newCompletion) {
        await prisma.workItem.update({
          where: { id: workItem.id },
          data: { completion: newCompletion }
        })
        
        console.log(`📊 Updated completion: ${workItem.id} from ${workItem.completion}% to ${newCompletion}%`)
        
        // Update the local object for further calculations
        workItem.completion = newCompletion
      }
    }
  }

  /**
   * Get completion statistics for a project
   * @param projectId - The project ID
   * @returns Statistics about completion percentages
   */
  static async getProjectCompletionStats(projectId: string): Promise<{
    totalItems: number
    averageCompletion: number
    completedItems: number
    inProgressItems: number
    notStartedItems: number
  }> {
    try {
      const workItems = await prisma.workItem.findMany({
        where: { projectId: projectId },
        select: { completion: true }
      })

      const totalItems = workItems.length
      const totalCompletion = workItems.reduce((sum, item) => sum + item.completion, 0)
      const averageCompletion = totalItems > 0 ? Math.round(totalCompletion / totalItems) : 0
      
      const completedItems = workItems.filter(item => item.completion === 100).length
      const inProgressItems = workItems.filter(item => item.completion > 0 && item.completion < 100).length
      const notStartedItems = workItems.filter(item => item.completion === 0).length

      return {
        totalItems,
        averageCompletion,
        completedItems,
        inProgressItems,
        notStartedItems
      }
    } catch (error) {
      console.error('Error getting project completion stats:', error)
      throw error
    }
  }
}

export const completionCalculationService = new CompletionCalculationService()