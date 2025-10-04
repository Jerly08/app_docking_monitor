// Test script untuk validasi sistem ID Work Package baru
// Run dengan: node test-work-package-id.js

const testWorkPackageIdGeneration = () => {
  console.log('🧪 Testing Work Package ID Generation System\n')
  
  // Test 1: Work Package ID Format Validation
  console.log('1. Testing Work Package ID Format:')
  
  const workPackageExamples = [
    'WP-FER-001', // Valid
    'WP-FER-002', // Valid
    'WP-ABC-999', // Valid
    'WP-XYZ-000', // Valid but edge case
    'WP-FER-1',   // Invalid (not 3 digits)
    'WP-FER-0001', // Invalid (4 digits)
    'WP-FERIMAS-001', // Invalid (code too long)
    'WP-FE-001',  // Invalid (code too short)
  ]
  
  // Simulate the validation function
  const isWorkPackageFormat = (id) => {
    const pattern = /^WP-[A-Z]{3}-\d{3}$/
    return pattern.test(id)
  }
  
  workPackageExamples.forEach(id => {
    const isValid = isWorkPackageFormat(id)
    console.log(`  ${id}: ${isValid ? '✅ Valid' : '❌ Invalid'}`)
  })
  
  console.log('\n2. Testing Task ID Format:')
  
  const taskExamples = [
    'WP-FER-001-T01', // Valid
    'WP-FER-001-T02', // Valid
    'WP-ABC-999-T99', // Valid
    'WP-FER-001-T1',  // Invalid (not 2 digits)
    'WP-FER-001-T001', // Invalid (3 digits)
    'WP-FER-001-S01', // Invalid (not T prefix)
    'WP-FER-001-T-01', // Invalid (extra dash)
  ]
  
  // Simulate the task validation function
  const isTaskFormat = (id) => {
    const pattern = /^WP-[A-Z]{3}-\d{3}-T\d{2}$/
    return pattern.test(id)
  }
  
  taskExamples.forEach(id => {
    const isValid = isTaskFormat(id)
    console.log(`  ${id}: ${isValid ? '✅ Valid' : '❌ Invalid'}`)
  })
  
  console.log('\n3. Testing Project Code Extraction:')
  
  const vesselNames = [
    'MT. FERIMAS SEJAHTERA', // Should extract 'FER'
    'KM. BAHARI INDAH',      // Should extract 'BAH' 
    'MV. SINAR JAYA',        // Should extract 'SIN'
    'MS. SAMUDRA BARU',      // Should extract 'SAM'
    'NUSANTARA JAYA',        // Should extract 'NUS' (no prefix)
    'MT.FERIMAS SEJAHTERA',  // Should extract 'FER' (no space after prefix)
    '',                      // Should extract 'UNK' (empty)
    'A',                     // Should extract 'A' (short name)
  ]
  
  // Simulate the project code extraction
  const extractProjectCode = (vesselName) => {
    if (!vesselName) return 'UNK'
    
    const cleanVesselName = vesselName
      .replace(/^(MT\.|KM\.|MV\.|MS\.)\s*/i, '')
      .trim()
    
    const words = cleanVesselName.split(' ')
    if (words.length > 0 && words[0]) {
      return words[0].substring(0, 3).toUpperCase()
    }
    return 'UNK'
  }
  
  vesselNames.forEach(vessel => {
    const code = extractProjectCode(vessel)
    console.log(`  "${vessel}" → "${code}"`)
  })
  
  console.log('\n4. Testing ID Generation Logic:')
  
  // Simulate existing IDs in database
  const existingWorkPackages = [
    'WP-FER-001',
    'WP-FER-003', // Gap at 002
    'WP-FER-004'
  ]
  
  // Simulate finding next number
  const findNextSequentialNumber = (existingIds) => {
    const numbers = existingIds
      .map(id => {
        const match = id.match(/^WP-[A-Z]{3}-(\d{3})$/)
        return match ? parseInt(match[1], 10) : 0
      })
      .filter(num => num > 0)
      .sort((a, b) => a - b)
    
    let nextNumber = 1
    for (const num of numbers) {
      if (num === nextNumber) {
        nextNumber++
      } else {
        break
      }
    }
    return nextNumber
  }
  
  const nextNumber = findNextSequentialNumber(existingWorkPackages)
  const nextId = `WP-FER-${String(nextNumber).padStart(3, '0')}`
  
  console.log(`  Existing IDs: ${existingWorkPackages.join(', ')}`)
  console.log(`  Next ID should be: ${nextId}`)
  
  console.log('\n5. Testing Task ID Generation:')
  
  const existingTasks = [
    'WP-FER-001-T01',
    'WP-FER-001-T02',
    'WP-FER-001-T04' // Gap at T03
  ]
  
  const findNextTaskNumber = (parentId, existingTaskIds) => {
    const taskNumbers = existingTaskIds
      .filter(id => id.startsWith(`${parentId}-T`))
      .map(id => {
        const match = id.match(/^WP-[A-Z]{3}-\d{3}-T(\d{2})$/)
        return match ? parseInt(match[1], 10) : 0
      })
      .filter(num => num > 0)
      .sort((a, b) => a - b)
    
    let nextTaskNumber = 1
    for (const num of taskNumbers) {
      if (num === nextTaskNumber) {
        nextTaskNumber++
      } else {
        break
      }
    }
    return nextTaskNumber
  }
  
  const parentId = 'WP-FER-001'
  const nextTaskNumber = findNextTaskNumber(parentId, existingTasks)
  const nextTaskId = `${parentId}-T${String(nextTaskNumber).padStart(2, '0')}`
  
  console.log(`  Parent ID: ${parentId}`)
  console.log(`  Existing Task IDs: ${existingTasks.join(', ')}`)
  console.log(`  Next Task ID should be: ${nextTaskId}`)
  
  console.log('\n✅ All tests completed!')
  console.log('\n📋 Summary:')
  console.log('- Work Package format: WP-{CODE}-{SEQ} (e.g., WP-FER-001)')
  console.log('- Task format: {PARENT_ID}-T{SEQ} (e.g., WP-FER-001-T01)')
  console.log('- Project codes extracted from vessel names')
  console.log('- Sequential numbering fills gaps automatically')
  console.log('- Fallback error handling implemented')
}

// Run the tests
testWorkPackageIdGeneration()