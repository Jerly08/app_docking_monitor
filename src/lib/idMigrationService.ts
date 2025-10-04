import { PrismaClient } from '@prisma/client'
import { IdGeneratorService } from './idGeneratorService'

const prisma = new PrismaClient()

/**
 * Service for migrating existing work item IDs to the new format
 * and providing backward compatibility
 */
export class IdMigrationService {
  private idGenerator: IdGeneratorService

  constructor() {
    this.idGenerator = new IdGeneratorService()
  }

  /**
   * Checks if the current database has work items with old format IDs
   * @returns Promise<object> - Statistics about existing ID formats
   */
  async analyzeExistingIds(): Promise<{
    totalWorkItems: number
    oldFormatCount: number
    newFormatCount: number
    oldFormatIds: string[]
    newFormatIds: string[]
    sampleOldIds: string[]
    sampleNewIds: string[]
  }> {
    try {
      const allWorkItems = await prisma.workItem.findMany({
        select: {
          id: true,
          createdAt: true,
          projectId: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      const oldFormatIds: string[] = []
      const newFormatIds: string[] = []

      allWorkItems.forEach(item => {
        if (IdGeneratorService.isNewFormat(item.id)) {
          newFormatIds.push(item.id)
        } else {
          oldFormatIds.push(item.id)
        }
      })

      return {
        totalWorkItems: allWorkItems.length,
        oldFormatCount: oldFormatIds.length,
        newFormatCount: newFormatIds.length,
        oldFormatIds,
        newFormatIds,
        sampleOldIds: oldFormatIds.slice(0, 5),
        sampleNewIds: newFormatIds.slice(0, 5)
      }
    } catch (error) {
      console.error('Error analyzing existing IDs:', error)
      throw error
    }
  }

  /**
   * Migrates existing work items to use the new ID format
   * WARNING: This is a destructive operation that changes IDs permanently
   * @param dryRun - If true, only simulates the migration without making changes
   * @param preserveHierarchy - If true, maintains parent-child relationships during migration
   * @returns Promise<object> - Migration results
   */
  async migrateToNewFormat(
    dryRun: boolean = true, 
    preserveHierarchy: boolean = true
  ): Promise<{
    success: boolean
    migratedCount: number
    errors: string[]
    migrationMap: Record<string, string>
    skippedCount: number
  }> {
    const results = {
      success: false,
      migratedCount: 0,
      errors: [] as string[],
      migrationMap: {} as Record<string, string>,
      skippedCount: 0
    }

    try {
      // Get all work items with old format IDs
      const workItemsToMigrate = await prisma.workItem.findMany({
        where: {
          id: {
            not: {
              regex: '^\\d{2}/\\d{2}/\\d{2}/\\d{3}$'
            }
          }
        },
        include: {
          children: {
            select: { id: true }
          },
          parent: {
            select: { id: true }
          }
        },
        orderBy: [
          { projectId: 'asc' },
          { createdAt: 'asc' }
        ]
      })

      if (workItemsToMigrate.length === 0) {
        results.success = true
        return results
      }

      // Group by project and date for proper sequential numbering
      const itemsByProjectDate = new Map<string, any[]>()
      
      for (const item of workItemsToMigrate) {
        const date = new Date(item.createdAt)
        const dateKey = `${item.projectId}-${date.toDateString()}`
        
        if (!itemsByProjectDate.has(dateKey)) {
          itemsByProjectDate.set(dateKey, [])
        }
        itemsByProjectDate.get(dateKey)!.push(item)
      }

      // Process migration in transaction if not dry run
      if (!dryRun) {
        await prisma.$transaction(async (tx) => {
          // Process each project-date group
          for (const [dateKey, items] of itemsByProjectDate.entries()) {
            const [projectId, dateStr] = dateKey.split('-', 2)
            const date = new Date(dateStr)
            
            // Generate batch of new IDs for this date
            const newIds = await this.idGenerator.generateBatchWorkItemIds(projectId, items.length, date)
            
            // Update each work item
            for (let i = 0; i < items.length; i++) {
              const item = items[i]
              const newId = newIds[i]
              
              try {
                // Update work item with new ID
                await tx.workItem.update({
                  where: { id: item.id },
                  data: { id: newId }
                })
                
                // Update parent references if preserving hierarchy
                if (preserveHierarchy) {
                  await tx.workItem.updateMany({
                    where: { parentId: item.id },
                    data: { parentId: newId }
                  })
                }
                
                results.migrationMap[item.id] = newId
                results.migratedCount++
                
              } catch (error) {
                results.errors.push(`Failed to migrate ${item.id}: ${error}`)
              }
            }
          }
        })
      } else {
        // Dry run - simulate the migration
        for (const [dateKey, items] of itemsByProjectDate.entries()) {
          const [projectId, dateStr] = dateKey.split('-', 2)
          const date = new Date(dateStr)
          
          const newIds = await this.idGenerator.generateBatchWorkItemIds(projectId, items.length, date)
          
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const newId = newIds[i]
            results.migrationMap[item.id] = newId
            results.migratedCount++
          }
        }
      }

      results.success = true
      return results

    } catch (error) {
      console.error('Error during migration:', error)
      results.errors.push(`Migration failed: ${error}`)
      return results
    }
  }

  /**
   * Creates a backup of work item IDs before migration
   * @returns Promise<object> - Backup information
   */
  async createIdBackup(): Promise<{
    backupFile: string
    itemCount: number
    timestamp: string
  }> {
    try {
      const allWorkItems = await prisma.workItem.findMany({
        select: {
          id: true,
          parentId: true,
          projectId: true,
          title: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupData = {
        timestamp,
        totalItems: allWorkItems.length,
        items: allWorkItems.map(item => ({
          originalId: item.id,
          parentId: item.parentId,
          projectId: item.projectId,
          title: item.title,
          createdAt: item.createdAt.toISOString()
        }))
      }

      // In a real implementation, you might save this to a file
      // For now, we'll just return the backup information
      console.log('ID Backup created:', JSON.stringify(backupData, null, 2))

      return {
        backupFile: `work_item_ids_backup_${timestamp}.json`,
        itemCount: allWorkItems.length,
        timestamp
      }
    } catch (error) {
      console.error('Error creating ID backup:', error)
      throw error
    }
  }

  /**
   * Validates that all work items have valid IDs after migration
   * @returns Promise<object> - Validation results
   */
  async validateMigration(): Promise<{
    isValid: boolean
    totalItems: number
    validNewFormatIds: number
    invalidIds: string[]
    duplicateIds: string[]
    orphanedChildren: string[]
  }> {
    try {
      const allWorkItems = await prisma.workItem.findMany({
        select: {
          id: true,
          parentId: true,
          children: {
            select: { id: true }
          }
        }
      })

      const validNewFormatIds: string[] = []
      const invalidIds: string[] = []
      const allIds = new Set<string>()
      const duplicateIds: string[] = []
      const orphanedChildren: string[] = []

      // Check for valid format and duplicates
      for (const item of allWorkItems) {
        if (allIds.has(item.id)) {
          duplicateIds.push(item.id)
        }
        allIds.add(item.id)

        if (IdGeneratorService.isNewFormat(item.id)) {
          validNewFormatIds.push(item.id)
        } else {
          invalidIds.push(item.id)
        }

        // Check for orphaned children
        if (item.parentId && !allIds.has(item.parentId)) {
          orphanedChildren.push(item.id)
        }
      }

      return {
        isValid: invalidIds.length === 0 && duplicateIds.length === 0 && orphanedChildren.length === 0,
        totalItems: allWorkItems.length,
        validNewFormatIds: validNewFormatIds.length,
        invalidIds,
        duplicateIds,
        orphanedChildren
      }
    } catch (error) {
      console.error('Error validating migration:', error)
      throw error
    }
  }

  /**
   * Gets migration statistics and recommendations
   * @returns Promise<object> - Migration recommendations
   */
  async getMigrationRecommendations(): Promise<{
    shouldMigrate: boolean
    reasons: string[]
    warnings: string[]
    estimatedDuration: string
    affectedProjects: number
    affectedWorkItems: number
  }> {
    try {
      const analysis = await this.analyzeExistingIds()
      
      const shouldMigrate = analysis.oldFormatCount > 0
      const reasons: string[] = []
      const warnings: string[] = []

      if (analysis.oldFormatCount > 0) {
        reasons.push(`${analysis.oldFormatCount} work items are using the old ID format`)
        reasons.push('New ID format provides better organization and date-based tracking')
      }

      if (analysis.oldFormatCount > 100) {
        warnings.push('Large number of items to migrate - consider running during low-usage period')
      }

      if (analysis.newFormatCount > 0) {
        warnings.push('Some items already use new format - migration will preserve existing new format IDs')
      }

      // Get affected projects
      const projectCount = await prisma.project.count({
        where: {
          workItems: {
            some: {
              id: {
                not: {
                  regex: '^\\d{2}/\\d{2}/\\d{2}/\\d{3}$'
                }
              }
            }
          }
        }
      })

      return {
        shouldMigrate,
        reasons,
        warnings,
        estimatedDuration: analysis.oldFormatCount > 500 ? '5-10 minutes' : 
                           analysis.oldFormatCount > 100 ? '1-3 minutes' : 
                           'Less than 1 minute',
        affectedProjects: projectCount,
        affectedWorkItems: analysis.oldFormatCount
      }
    } catch (error) {
      console.error('Error getting migration recommendations:', error)
      throw error
    }
  }
}

export const idMigrationService = new IdMigrationService()