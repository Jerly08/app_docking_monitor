/**
 * Test Script untuk Reproduksi Masalah "Add Realization Item" Stuck di Loading
 * 
 * Script ini akan test proses create realization item dengan berbagai skenario
 * untuk identify exact error yang menyebabkan loading stuck
 */

const fetch = require('node-fetch')

// Configuration
const BASE_URL = 'http://localhost:3000'
const API_ENDPOINT = `${BASE_URL}/api/work-items`

// Test data
const testScenarios = [
  {
    name: 'Basic Realization Item',
    data: {
      title: 'Test realization - kapal ringan sebagai berikut',
      description: 'SELESAI 100%',
      package: 'PELAYANAN UMUM',
      volume: 1,
      unit: 'ls',
      durationDays: 17,
      resourceNames: 'test02',
      isMilestone: false,
      startDate: '',
      finishDate: '',
      completion: 0,
      projectId: 'test-project-id',
      parentId: 'test-parent-id'
    }
  },
  {
    name: 'Realization Item with Dates',
    data: {
      title: 'Test realization with dates',
      description: 'IN PROGRESS',
      package: 'PELAYANAN UMUM',
      volume: 1,
      unit: 'set',
      durationDays: 5,
      resourceNames: 'Team A',
      isMilestone: false,
      startDate: '2024-01-15',
      finishDate: '2024-01-20',
      completion: 50,
      projectId: 'test-project-id',
      parentId: 'test-parent-id'
    }
  },
  {
    name: 'Minimal Realization Item',
    data: {
      title: 'Minimal test',
      projectId: 'test-project-id',
      parentId: 'test-parent-id'
    }
  },
  {
    name: 'Realization with Invalid Dates',
    data: {
      title: 'Test invalid dates',
      description: 'Testing invalid date handling',
      durationDays: 0,
      startDate: 'invalid-date',
      finishDate: '2024-13-45', // Invalid date
      projectId: 'test-project-id',
      parentId: 'test-parent-id'
    }
  }
]

async function testCreateRealizationItem(scenario) {
  console.log(`\n🧪 Testing: ${scenario.name}`)
  console.log(`📤 Request data:`, JSON.stringify(scenario.data, null, 2))
  
  const startTime = Date.now()
  let timeoutId
  
  try {
    // Setup timeout for the request
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Request timeout after 30 seconds'))
      }, 30000)
    })
    
    // Make the actual request
    const requestPromise = fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scenario.data)
    })
    
    const response = await Promise.race([requestPromise, timeoutPromise])
    clearTimeout(timeoutId)
    
    const duration = Date.now() - startTime
    console.log(`⏱️ Request completed in ${duration}ms`)
    console.log(`📊 Response status: ${response.status} ${response.statusText}`)
    
    const responseText = await response.text()
    console.log(`📥 Response length: ${responseText.length} characters`)
    
    if (response.ok) {
      const responseData = JSON.parse(responseText)
      console.log(`✅ SUCCESS: Work item created`)
      console.log(`🆔 Generated ID: ${responseData.workItem?.id || 'N/A'}`)
    } else {
      console.log(`❌ ERROR: ${response.status}`)
      console.log(`📄 Error response:`, responseText.substring(0, 500))
      
      try {
        const errorData = JSON.parse(responseText)
        if (errorData.validationErrors) {
          console.log(`🚫 Validation errors:`, errorData.validationErrors)
        }
      } catch (e) {
        // Response is not JSON
        console.log(`📝 Raw error response: ${responseText}`)
      }
    }
    
  } catch (error) {
    clearTimeout(timeoutId)
    const duration = Date.now() - startTime
    console.log(`💥 REQUEST FAILED after ${duration}ms:`)
    console.log(`❌ Error type: ${error.constructor.name}`)
    console.log(`❌ Error message: ${error.message}`)
    
    if (error.code) {
      console.log(`❌ Error code: ${error.code}`)
    }
  }
}

async function checkServerHealth() {
  console.log(`🏥 Checking server health at ${BASE_URL}`)
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      timeout: 5000
    })
    
    if (response.ok) {
      console.log(`✅ Server is healthy`)
      return true
    } else {
      console.log(`⚠️ Server responded with status: ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Server health check failed: ${error.message}`)
    
    // Try basic connection test
    try {
      const basicTest = await fetch(BASE_URL, { timeout: 5000 })
      console.log(`🔍 Basic connection test: ${basicTest.status}`)
    } catch (basicError) {
      console.log(`❌ Basic connection also failed: ${basicError.message}`)
    }
    
    return false
  }
}

async function runTests() {
  console.log(`🚀 Starting Realization Item Creation Test Suite`)
  console.log(`🎯 Target endpoint: ${API_ENDPOINT}`)
  console.log(`📅 Test started at: ${new Date().toISOString()}`)
  
  // Check server health first
  const serverHealthy = await checkServerHealth()
  
  if (!serverHealthy) {
    console.log(`🛑 Stopping tests due to server health issues`)
    console.log(`💡 Please ensure the Next.js development server is running on ${BASE_URL}`)
    process.exit(1)
  }
  
  console.log(`\n📋 Running ${testScenarios.length} test scenarios...`)
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i]
    console.log(`\n[${ i + 1}/${testScenarios.length}] =====================================`)
    await testCreateRealizationItem(scenario)
    
    // Wait a bit between tests to avoid overwhelming the server
    if (i < testScenarios.length - 1) {
      console.log(`⏳ Waiting 2 seconds before next test...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  console.log(`\n🏁 Test suite completed`)
  console.log(`📊 Total scenarios tested: ${testScenarios.length}`)
  console.log(`📅 Test completed at: ${new Date().toISOString()}`)
}

// Additional diagnostic functions
async function testIdGeneration() {
  console.log(`\n🔬 Testing ID Generation Service...`)
  
  try {
    const response = await fetch(`${BASE_URL}/api/test-id-generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectId: 'test-project',
        parentId: 'WP-TST-001'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ ID Generation test passed`)
      console.log(`🆔 Generated IDs:`, data)
    } else {
      console.log(`❌ ID Generation test failed: ${response.status}`)
      const error = await response.text()
      console.log(`📄 Error:`, error)
    }
    
  } catch (error) {
    console.log(`💥 ID Generation test error:`, error.message)
  }
}

// Run the tests
if (require.main === module) {
  runTests()
    .then(() => {
      console.log(`\n✅ All tests completed successfully`)
      process.exit(0)
    })
    .catch((error) => {
      console.error(`\n💥 Test suite failed:`, error)
      process.exit(1)
    })
}

module.exports = {
  testCreateRealizationItem,
  runTests,
  checkServerHealth,
  testIdGeneration
}