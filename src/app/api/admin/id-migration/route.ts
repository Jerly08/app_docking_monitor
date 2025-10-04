import { NextRequest, NextResponse } from 'next/server'
import { idMigrationService } from '@/lib/idMigrationService'
import { idGeneratorService } from '@/lib/idGeneratorService'

// GET /api/admin/id-migration - Get migration status and analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'analyze':
        const analysis = await idMigrationService.analyzeExistingIds()
        return NextResponse.json({
          success: true,
          analysis,
          message: `Found ${analysis.totalWorkItems} work items: ${analysis.newFormatCount} new format, ${analysis.oldFormatCount} old format`
        })

      case 'recommendations':
        const recommendations = await idMigrationService.getMigrationRecommendations()
        return NextResponse.json({
          success: true,
          recommendations
        })

      case 'validate':
        const validation = await idMigrationService.validateMigration()
        return NextResponse.json({
          success: true,
          validation,
          message: validation.isValid 
            ? 'All work item IDs are valid' 
            : `Found validation issues: ${validation.invalidIds.length} invalid IDs, ${validation.duplicateIds.length} duplicates, ${validation.orphanedChildren.length} orphaned children`
        })

      default:
        // Default: return current status
        const currentAnalysis = await idMigrationService.analyzeExistingIds()
        const currentRecommendations = await idMigrationService.getMigrationRecommendations()
        
        return NextResponse.json({
          success: true,
          status: {
            totalWorkItems: currentAnalysis.totalWorkItems,
            newFormatCount: currentAnalysis.newFormatCount,
            oldFormatCount: currentAnalysis.oldFormatCount,
            migrationNeeded: currentRecommendations.shouldMigrate,
            newFormatPercentage: currentAnalysis.totalWorkItems > 0 
              ? Math.round((currentAnalysis.newFormatCount / currentAnalysis.totalWorkItems) * 100) 
              : 100
          },
          sampleIds: {
            oldFormat: currentAnalysis.sampleOldIds,
            newFormat: currentAnalysis.sampleNewIds
          }
        })
    }
  } catch (error) {
    console.error('Error in ID migration GET:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get migration status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/id-migration - Perform migration actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, options = {} } = body

    switch (action) {
      case 'dry-run':
        const dryRunResults = await idMigrationService.migrateToNewFormat(true, options.preserveHierarchy !== false)
        return NextResponse.json({
          success: true,
          dryRun: true,
          results: dryRunResults,
          message: `Dry run completed: ${dryRunResults.migratedCount} items would be migrated`
        })

      case 'migrate':
        // Create backup first
        const backup = await idMigrationService.createIdBackup()
        
        // Perform actual migration
        const migrationResults = await idMigrationService.migrateToNewFormat(false, options.preserveHierarchy !== false)
        
        if (migrationResults.success) {
          // Validate migration
          const validation = await idMigrationService.validateMigration()
          
          return NextResponse.json({
            success: true,
            results: migrationResults,
            backup,
            validation,
            message: `Migration completed successfully: ${migrationResults.migratedCount} work items migrated to new format`
          })
        } else {
          return NextResponse.json({
            success: false,
            results: migrationResults,
            backup,
            message: `Migration failed with ${migrationResults.errors.length} errors`
          }, { status: 500 })
        }

      case 'backup':
        const backupResult = await idMigrationService.createIdBackup()
        return NextResponse.json({
          success: true,
          backup: backupResult,
          message: `Backup created: ${backupResult.itemCount} work items backed up`
        })

      case 'test-generation':
        // Test the new ID generation system
        const testProjectId = options.projectId || 'test-project'
        const testDate = options.date ? new Date(options.date) : new Date()
        const testCount = options.count || 5
        
        const testIds = await idGeneratorService.generateBatchWorkItemIds(testProjectId, testCount, testDate)
        
        return NextResponse.json({
          success: true,
          test: {
            projectId: testProjectId,
            date: testDate.toISOString(),
            count: testCount,
            generatedIds: testIds
          },
          message: `Generated ${testIds.length} test IDs successfully`
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in ID migration POST:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Migration operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/id-migration - Update migration settings or perform specific updates
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, workItemId, newId } = body

    switch (action) {
      case 'update-single-id':
        // This would require direct database access to update a single work item ID
        // For now, we'll return a placeholder response
        return NextResponse.json({
          success: false,
          error: 'Single ID update not implemented yet',
          message: 'Use the full migration process for now'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid PUT action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in ID migration PUT:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Update operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}