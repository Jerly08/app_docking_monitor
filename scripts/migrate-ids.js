const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Utility functions for ID generation
class IdGeneratorService {
  static isNewFormat(id) {
    const pattern = /^\d{2}\/\d{2}\/\d{2}\/\d{3}$/
    return pattern.test(id)
  }

  static async generateWorkItemId(projectId, date = new Date()) {
    try {
      // Format date as DD/MM/YY
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = String(date.getFullYear()).slice(-2)
      const datePrefix = `${day}/${month}/${year}`

      // Get the start and end of the current day for filtering
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      // Find all work items for this project created today with the new ID format
      const existingWorkItems = await prisma.workItem.findMany({
        where: {
          projectId: projectId,
          id: {
            startsWith: datePrefix
          },
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        select: {
          id: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      // Extract sequential numbers from existing IDs
      const existingNumbers = existingWorkItems
        .map(item => {
          const parts = item.id.split('/')
          if (parts.length === 4) {
            const sequentialPart = parts[3]
            const number = parseInt(sequentialPart, 10)
            return isNaN(number) ? 0 : number
          }
          return 0
        })
        .filter(num => num > 0)
        .sort((a, b) => a - b)

      // Find the next sequential number
      let nextNumber = 1
      for (const num of existingNumbers) {
        if (num === nextNumber) {
          nextNumber++
        } else {
          break
        }
      }

      // Format the sequential number with leading zeros (3 digits)
      const sequentialNumber = String(nextNumber).padStart(3, '0')

      // Generate the final ID
      const newId = `${datePrefix}/${sequentialNumber}`

      return newId
    } catch (error) {
      console.error('Error generating work item ID:', error)
      // Fallback to timestamp-based ID if there's an error
      const timestamp = date.getTime()
      const random = Math.random().toString(36).substr(2, 9)
      return `WI-${projectId}-${timestamp}-${random}`
    }
  }

  static async generateBatchWorkItemIds(projectId, count, date = new Date()) {
    const ids = []
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    const datePrefix = `${day}/${month}/${year}`
    
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    const existingCount = await prisma.workItem.count({
      where: {
        projectId: projectId,
        id: {
          startsWith: datePrefix
        },
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })
    
    let nextNumber = existingCount + 1
    
    for (let i = 0; i < count; i++) {
      const sequentialNumber = String(nextNumber + i).padStart(3, '0')
      const newId = `${datePrefix}/${sequentialNumber}`
      ids.push(newId)
    }
    
    return ids
  }
}

// Migration functions
async function analyzeExistingIds() {
  console.log('🔍 Analyzing existing work item IDs...')
  
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

  const oldFormatIds = []
  const newFormatIds = []

  allWorkItems.forEach(item => {
    if (IdGeneratorService.isNewFormat(item.id)) {
      newFormatIds.push(item.id)
    } else {
      oldFormatIds.push(item.id)
    }
  })

  const analysis = {
    totalWorkItems: allWorkItems.length,
    oldFormatCount: oldFormatIds.length,
    newFormatCount: newFormatIds.length,
    oldFormatIds,
    newFormatIds,
    sampleOldIds: oldFormatIds.slice(0, 5),
    sampleNewIds: newFormatIds.slice(0, 5)
  }

  console.log(`📊 Analysis Results:`)
  console.log(`   Total Work Items: ${analysis.totalWorkItems}`)
  console.log(`   Old Format: ${analysis.oldFormatCount} (${Math.round((analysis.oldFormatCount / analysis.totalWorkItems) * 100)}%)`)
  console.log(`   New Format: ${analysis.newFormatCount} (${Math.round((analysis.newFormatCount / analysis.totalWorkItems) * 100)}%)`)
  
  if (analysis.sampleOldIds.length > 0) {
    console.log(`   Sample Old IDs: ${analysis.sampleOldIds.join(', ')}`)
  }
  if (analysis.sampleNewIds.length > 0) {
    console.log(`   Sample New IDs: ${analysis.sampleNewIds.join(', ')}`)
  }

  return analysis
}

async function performDryRun() {
  console.log('🧪 Performing dry run migration...')
  
  // Get all work items and filter client-side (MySQL doesn't support regex in Prisma)
  const allWorkItems = await prisma.workItem.findMany({
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
  
  // Filter to old format IDs only
  const workItemsToMigrate = allWorkItems.filter(item => !IdGeneratorService.isNewFormat(item.id))

  if (workItemsToMigrate.length === 0) {
    console.log('✅ No work items need migration!')
    return { migratedCount: 0, migrationMap: {} }
  }

  const migrationMap = {}
  let migratedCount = 0

  // Process each item individually to avoid complex date grouping
  for (const item of workItemsToMigrate) {
    const date = new Date(item.createdAt)
    const projectId = item.projectId || 'unknown-project'
    
    const newId = await IdGeneratorService.generateWorkItemId(projectId, date)
    migrationMap[item.id] = newId
    migratedCount++
  }

  console.log(`🔄 Dry run results: ${migratedCount} items would be migrated`)
  console.log(`📝 Sample migrations:`)
  
  const sampleEntries = Object.entries(migrationMap).slice(0, 5)
  sampleEntries.forEach(([oldId, newId]) => {
    console.log(`   ${oldId} → ${newId}`)
  })

  return { migratedCount, migrationMap }
}

async function performActualMigration() {
  console.log('🚀 Performing actual migration...')
  console.log('⚠️  Creating backup first...')
  
  // Create backup
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

  // Save backup to file
  const fs = require('fs')
  const backupFilename = `work_item_ids_backup_${timestamp}.json`
  fs.writeFileSync(backupFilename, JSON.stringify(backupData, null, 2))
  console.log(`💾 Backup created: ${backupFilename}`)

  // Get all work items and filter client-side (MySQL doesn't support regex in Prisma)
  const allWorkItemsToMigrate = await prisma.workItem.findMany({
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
  
  // Filter to old format IDs only
  const workItemsToMigrate = allWorkItemsToMigrate.filter(item => !IdGeneratorService.isNewFormat(item.id))

  if (workItemsToMigrate.length === 0) {
    console.log('✅ No work items need migration!')
    return { success: true, migratedCount: 0, errors: [] }
  }

  const migrationMap = {}
  const errors = []
  let migratedCount = 0

  // Perform migration in transaction
  try {
    await prisma.$transaction(async (tx) => {
      // Process each work item individually
      for (let i = 0; i < workItemsToMigrate.length; i++) {
        const item = workItemsToMigrate[i]
        
        try {
          const date = new Date(item.createdAt)
          const projectId = item.projectId || 'unknown-project'
          const newId = await IdGeneratorService.generateWorkItemId(projectId, date)
          
          // Update work item with new ID
          await tx.workItem.update({
            where: { id: item.id },
            data: { id: newId }
          })
          
          // Update parent references to preserve hierarchy
          await tx.workItem.updateMany({
            where: { parentId: item.id },
            data: { parentId: newId }
          })
          
          migrationMap[item.id] = newId
          migratedCount++
          
          if (migratedCount % 10 === 0) {
            console.log(`   Migrated ${migratedCount}/${workItemsToMigrate.length} items...`)
          }
          
        } catch (error) {
          errors.push(`Failed to migrate ${item.id}: ${error.message}`)
        }
      }
    })

    console.log(`✅ Migration completed successfully!`)
    console.log(`📊 Results:`)
    console.log(`   Migrated: ${migratedCount} work items`)
    console.log(`   Errors: ${errors.length}`)
    
    if (errors.length > 0) {
      console.log(`❌ Errors encountered:`)
      errors.slice(0, 5).forEach(error => console.log(`   ${error}`))
    }

    return {
      success: true,
      migratedCount,
      errors,
      migrationMap,
      backupFile: backupFilename
    }

  } catch (error) {
    console.error('💥 Migration failed:', error)
    return {
      success: false,
      migratedCount: 0,
      errors: [error.message],
      migrationMap: {},
      backupFile: backupFilename
    }
  }
}

async function validateMigration() {
  console.log('🔍 Validating migration results...')
  
  const allWorkItems = await prisma.workItem.findMany({
    select: {
      id: true,
      parentId: true,
      children: {
        select: { id: true }
      }
    }
  })

  const validNewFormatIds = []
  const invalidIds = []
  const allIds = new Set()
  const duplicateIds = []
  const orphanedChildren = []

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

  const isValid = invalidIds.length === 0 && duplicateIds.length === 0 && orphanedChildren.length === 0

  console.log(`📊 Validation Results:`)
  console.log(`   Total Items: ${allWorkItems.length}`)
  console.log(`   Valid New Format: ${validNewFormatIds.length}`)
  console.log(`   Invalid IDs: ${invalidIds.length}`)
  console.log(`   Duplicate IDs: ${duplicateIds.length}`)
  console.log(`   Orphaned Children: ${orphanedChildren.length}`)
  console.log(`   Overall Status: ${isValid ? '✅ VALID' : '❌ ISSUES FOUND'}`)

  if (invalidIds.length > 0) {
    console.log(`❌ Sample invalid IDs: ${invalidIds.slice(0, 3).join(', ')}`)
  }

  return {
    isValid,
    totalItems: allWorkItems.length,
    validNewFormatIds: validNewFormatIds.length,
    invalidIds,
    duplicateIds,
    orphanedChildren
  }
}

// Main migration script
async function main() {
  console.log('🚀 Starting Work Item ID Migration')
  console.log('=' .repeat(50))
  
  try {
    // Step 1: Analyze current state
    const analysis = await analyzeExistingIds()
    
    if (analysis.oldFormatCount === 0) {
      console.log('✅ All work items are already using the new format!')
      await prisma.$disconnect()
      return
    }

    // Step 2: Perform dry run
    console.log('\n' + '=' .repeat(50))
    const dryRunResults = await performDryRun()
    
    // Step 3: Ask for confirmation
    console.log('\n' + '=' .repeat(50))
    console.log('⚠️  Ready to perform actual migration')
    console.log(`📊 ${dryRunResults.migratedCount} work items will be migrated`)
    console.log('💾 Backup will be created automatically')
    console.log('🔄 Parent-child relationships will be preserved')
    
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const shouldProceed = await new Promise((resolve) => {
      rl.question('Do you want to proceed with the migration? (yes/no): ', (answer) => {
        rl.close()
        resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y')
      })
    })

    if (!shouldProceed) {
      console.log('🚫 Migration cancelled by user')
      await prisma.$disconnect()
      return
    }

    // Step 4: Perform actual migration
    console.log('\n' + '=' .repeat(50))
    const migrationResults = await performActualMigration()
    
    // Step 5: Validate results
    console.log('\n' + '=' .repeat(50))
    const validation = await validateMigration()
    
    // Summary
    console.log('\n' + '=' .repeat(50))
    console.log('🎉 Migration Summary')
    console.log(`✅ Status: ${migrationResults.success ? 'SUCCESS' : 'FAILED'}`)
    console.log(`📊 Migrated: ${migrationResults.migratedCount} work items`)
    console.log(`💾 Backup: ${migrationResults.backupFile}`)
    console.log(`🔍 Validation: ${validation.isValid ? 'PASSED' : 'ISSUES FOUND'}`)
    
    if (migrationResults.errors.length > 0) {
      console.log(`❌ Errors: ${migrationResults.errors.length}`)
    }

    console.log('\n✨ Migration completed! All new work items will now use DD/MM/YY/### format.')

  } catch (error) {
    console.error('💥 Migration script failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
main().catch(console.error)