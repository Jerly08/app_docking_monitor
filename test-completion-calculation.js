/**
 * Test Script for Completion Calculation Functionality
 * 
 * This script tests the cumulative completion percentage calculation
 * Run with: node test-completion-calculation.js
 */

// Mock data structure that mimics the work items table
const testWorkItems = [
  {
    id: '05/10/25/001',
    title: 'Setibanya di muara, kapal dipandu masuk perairan galangan',
    completion: 20,
    parentId: null,
    children: [
      {
        id: '05/10/25/001-R1',
        title: 'Realisasi: Kapal dipandu menggunakan 1 tugboat',
        completion: 100,
        parentId: '05/10/25/001',
        children: []
      },
      {
        id: '05/10/25/001-R2',
        title: 'Realisasi: Dokumentasi proses pandu',
        completion: 0,
        parentId: '05/10/25/001',
        children: []
      }
    ]
  },
  {
    id: '05/10/25/002',
    title: 'Selesai docking dipandu kembali keluar dari area Galangan',
    completion: 10,
    parentId: null,
    children: [
      {
        id: '05/10/25/002-R1',
        title: 'Realisasi: Proses keluar area galangan',
        completion: 50,
        parentId: '05/10/25/002',
        children: []
      },
      {
        id: '05/10/25/002-R2', 
        title: 'Realisasi: Verifikasi keselamatan',
        completion: 25,
        parentId: '05/10/25/002',
        children: []
      },
      {
        id: '05/10/25/002-R3',
        title: 'Realisasi: Laporan akhir',
        completion: 0,
        parentId: '05/10/25/002',
        children: []
      }
    ]
  }
]

/**
 * Calculate completion percentage for a parent based on its children
 * This mimics the logic from CompletionCalculationService.calculateParentCompletion
 */
function calculateParentCompletion(children) {
  if (!children || children.length === 0) {
    return 0
  }

  // Calculate the average completion of all children
  const totalCompletion = children.reduce((sum, child) => {
    // If this child also has children, calculate its completion first
    let childCompletion = child.completion
    if (child.children && child.children.length > 0) {
      childCompletion = calculateParentCompletion(child.children)
    }
    return sum + childCompletion
  }, 0)

  // Return the average, rounded to nearest integer
  return Math.round(totalCompletion / children.length)
}

/**
 * Test scenarios to verify the calculation logic
 */
function runTests() {
  console.log('🧪 Running Completion Calculation Tests')
  console.log('=====================================\n')

  // Test Case 1: Basic parent-child calculation
  console.log('Test Case 1: Basic Parent-Child Calculation')
  console.log('-------------------------------------------')
  
  const testCase1Children = [
    { completion: 100 },
    { completion: 0 },
    { completion: 50 }
  ]
  
  const expectedResult1 = Math.round((100 + 0 + 50) / 3) // Should be 50
  const actualResult1 = calculateParentCompletion(testCase1Children)
  
  console.log(`Children completions: [${testCase1Children.map(c => c.completion + '%').join(', ')}]`)
  console.log(`Expected parent completion: ${expectedResult1}%`)
  console.log(`Actual parent completion: ${actualResult1}%`)
  console.log(`✅ Test ${actualResult1 === expectedResult1 ? 'PASSED' : 'FAILED'}\n`)

  // Test Case 2: Real-world example from mock data
  console.log('Test Case 2: Real-world Example')
  console.log('-------------------------------')
  
  testWorkItems.forEach((parentItem, index) => {
    const calculatedCompletion = calculateParentCompletion(parentItem.children)
    console.log(`\nParent Item: ${parentItem.id}`)
    console.log(`Title: "${parentItem.title.substring(0, 50)}..."`)
    console.log(`Current completion: ${parentItem.completion}%`)
    console.log(`Child completions: [${parentItem.children.map(c => c.completion + '%').join(', ')}]`)
    console.log(`Calculated completion: ${calculatedCompletion}%`)
    
    if (parentItem.completion !== calculatedCompletion) {
      console.log(`🔄 Parent completion should be updated from ${parentItem.completion}% to ${calculatedCompletion}%`)
    } else {
      console.log(`✅ Parent completion is already correct`)
    }
  })

  // Test Case 3: Edge cases
  console.log('\n\nTest Case 3: Edge Cases')
  console.log('----------------------')
  
  // Empty children array
  const emptyResult = calculateParentCompletion([])
  console.log(`Empty children array: ${emptyResult}% (Expected: 0%) - ${emptyResult === 0 ? '✅ PASSED' : '❌ FAILED'}`)
  
  // All children at 100%
  const allComplete = calculateParentCompletion([
    { completion: 100 },
    { completion: 100 },
    { completion: 100 }
  ])
  console.log(`All children 100%: ${allComplete}% (Expected: 100%) - ${allComplete === 100 ? '✅ PASSED' : '❌ FAILED'}`)
  
  // All children at 0%
  const allIncomplete = calculateParentCompletion([
    { completion: 0 },
    { completion: 0 },
    { completion: 0 }
  ])
  console.log(`All children 0%: ${allIncomplete}% (Expected: 0%) - ${allIncomplete === 0 ? '✅ PASSED' : '❌ FAILED'}`)

  // Test Case 4: Multi-level hierarchy
  console.log('\n\nTest Case 4: Multi-level Hierarchy')
  console.log('---------------------------------')
  
  const multiLevelParent = {
    completion: 0,
    children: [
      {
        completion: 75,
        children: [
          { completion: 100 },
          { completion: 50 }
        ]
      },
      { completion: 25 },
      {
        completion: 0,
        children: [
          { completion: 60 },
          { completion: 40 }
        ]
      }
    ]
  }
  
  const multiLevelResult = calculateParentCompletion(multiLevelParent.children)
  
  // Manual calculation:
  // Child 1: (100 + 50) / 2 = 75% (calculated from grandchildren)
  // Child 2: 25% (no children)
  // Child 3: (60 + 40) / 2 = 50% (calculated from grandchildren) 
  // Parent: (75 + 25 + 50) / 3 = 50%
  
  console.log(`Multi-level parent calculated completion: ${multiLevelResult}%`)
  console.log(`Expected: 50% - ${multiLevelResult === 50 ? '✅ PASSED' : '❌ FAILED'}`)

  // Test Case 5: Performance with many children
  console.log('\n\nTest Case 5: Performance Test')
  console.log('-----------------------------')
  
  const manyChildren = Array.from({ length: 1000 }, (_, i) => ({ completion: i % 101 }))
  const startTime = Date.now()
  const manyChildrenResult = calculateParentCompletion(manyChildren)
  const endTime = Date.now()
  
  console.log(`Calculated completion for 1000 children in ${endTime - startTime}ms`)
  console.log(`Result: ${manyChildrenResult}% (Expected: ~50%) - ${Math.abs(manyChildrenResult - 50) <= 1 ? '✅ PASSED' : '❌ FAILED'}`)

  console.log('\n🎉 All tests completed!')
  console.log('\n💡 How to use in your application:')
  console.log('1. When a child work item completion is updated, the system automatically recalculates parent completion')
  console.log('2. Use the CompletionRecalculator component for manual bulk recalculation')
  console.log('3. The calculation is hierarchical - grandchildren affect grandparents through their parents')
  console.log('4. All percentages are rounded to the nearest integer for consistency')
}

// Run the tests
runTests()

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateParentCompletion,
    testWorkItems
  }
}