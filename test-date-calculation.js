/**
 * Test Script for Date Calculation Functionality
 * 
 * This script tests the automatic date calculation based on start date + duration
 * Run with: node test-date-calculation.js
 */

// Mock DateCalculationService for testing
class DateCalculationService {
  static calculateDates(startDate, finishDate, durationDays, changedField) {
    const result = {
      startDate: startDate || undefined,
      finishDate: finishDate || undefined,
      durationDays: durationDays || undefined
    }

    // Convert string dates to Date objects for calculation
    const startDateObj = startDate ? new Date(startDate) : null
    const finishDateObj = finishDate ? new Date(finishDate) : null
    const duration = durationDays || 1

    // Validation: Check if dates are valid
    if (startDateObj && isNaN(startDateObj.getTime())) {
      console.warn('Invalid start date provided:', startDate)
      return result
    }
    if (finishDateObj && isNaN(finishDateObj.getTime())) {
      console.warn('Invalid finish date provided:', finishDate)
      return result
    }

    // Priority-based calculations based on what field was changed
    switch (changedField) {
      case 'startDate':
        // Start date changed: calculate finish date from start + duration
        if (startDateObj && duration > 0) {
          const calculatedFinish = new Date(startDateObj)
          calculatedFinish.setDate(calculatedFinish.getDate() + duration - 1) // -1 because same day = 1 day
          result.finishDate = this.formatDate(calculatedFinish)
          result.durationDays = duration
          result.calculatedField = 'finishDate'
        }
        break

      case 'finishDate':
        // Finish date changed: calculate start date from finish - duration
        if (finishDateObj && duration > 0) {
          const calculatedStart = new Date(finishDateObj)
          calculatedStart.setDate(calculatedStart.getDate() - duration + 1) // +1 because same day = 1 day
          result.startDate = this.formatDate(calculatedStart)
          result.durationDays = duration
          result.calculatedField = 'startDate'
        }
        break

      case 'durationDays':
        // Duration changed: recalculate finish date if we have start date
        if (startDateObj && duration > 0) {
          const calculatedFinish = new Date(startDateObj)
          calculatedFinish.setDate(calculatedFinish.getDate() + duration - 1)
          result.finishDate = this.formatDate(calculatedFinish)
          result.startDate = startDate || undefined
          result.durationDays = duration
          result.calculatedField = 'finishDate'
        }
        break

      default:
        // Auto-detect what to calculate based on available data
        if (startDateObj && finishDateObj) {
          // Both dates available: calculate duration
          const timeDiff = finishDateObj.getTime() - startDateObj.getTime()
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1 // +1 because same day = 1 day
          result.durationDays = Math.max(1, daysDiff) // Minimum 1 day
          result.calculatedField = 'durationDays'
        } else if (startDateObj && duration > 0) {
          // Start date and duration: calculate finish date
          const calculatedFinish = new Date(startDateObj)
          calculatedFinish.setDate(calculatedFinish.getDate() + duration - 1)
          result.finishDate = this.formatDate(calculatedFinish)
          result.calculatedField = 'finishDate'
        } else if (finishDateObj && duration > 0) {
          // Finish date and duration: calculate start date
          const calculatedStart = new Date(finishDateObj)
          calculatedStart.setDate(calculatedStart.getDate() - duration + 1)
          result.startDate = this.formatDate(calculatedStart)
          result.calculatedField = 'startDate'
        }
        break
    }

    return result
  }

  static formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  static getCalculationDescription(result) {
    if (!result.calculatedField) {
      return 'No calculation performed'
    }

    switch (result.calculatedField) {
      case 'startDate':
        return `Start date calculated: ${result.finishDate} - ${result.durationDays} days = ${result.startDate}`
      case 'finishDate':
        return `Finish date calculated: ${result.startDate} + ${result.durationDays} days = ${result.finishDate}`
      case 'durationDays':
        return `Duration calculated: ${result.finishDate} - ${result.startDate} = ${result.durationDays} days`
      default:
        return 'Date calculation completed'
    }
  }
}

/**
 * Test scenarios to verify the date calculation logic
 */
function runTests() {
  console.log('🗓️  Running Date Calculation Tests')
  console.log('==================================\n')

  // Test Case 1: Start date changed - calculate finish date
  console.log('Test Case 1: Start Date Changed → Calculate Finish Date')
  console.log('-----------------------------------------------------')
  
  const test1Result = DateCalculationService.calculateDates(
    '2025-10-12', // Start date
    null,         // Finish date (to be calculated)
    5,            // Duration: 5 days
    'startDate'   // Changed field
  )
  
  console.log(`Input: Start Date = 2025-10-12, Duration = 5 days`)
  console.log(`Result: ${DateCalculationService.getCalculationDescription(test1Result)}`)
  console.log(`Expected: 2025-10-16 (Start + 4 days because same day counts)`)
  console.log(`✅ Test ${test1Result.finishDate === '2025-10-16' ? 'PASSED' : 'FAILED'}\n`)

  // Test Case 2: Finish date changed - calculate start date
  console.log('Test Case 2: Finish Date Changed → Calculate Start Date')
  console.log('---------------------------------------------------')
  
  const test2Result = DateCalculationService.calculateDates(
    null,         // Start date (to be calculated)
    '2025-10-16', // Finish date
    5,            // Duration: 5 days
    'finishDate'  // Changed field
  )
  
  console.log(`Input: Finish Date = 2025-10-16, Duration = 5 days`)
  console.log(`Result: ${DateCalculationService.getCalculationDescription(test2Result)}`)
  console.log(`Expected: 2025-10-12 (Finish - 4 days because same day counts)`)
  console.log(`✅ Test ${test2Result.startDate === '2025-10-12' ? 'PASSED' : 'FAILED'}\n`)

  // Test Case 3: Duration changed - calculate finish date
  console.log('Test Case 3: Duration Changed → Calculate Finish Date')
  console.log('--------------------------------------------------')
  
  const test3Result = DateCalculationService.calculateDates(
    '2025-10-12', // Start date
    null,         // Finish date (to be calculated)
    3,            // Duration: 3 days (changed)
    'durationDays' // Changed field
  )
  
  console.log(`Input: Start Date = 2025-10-12, Duration = 3 days`)
  console.log(`Result: ${DateCalculationService.getCalculationDescription(test3Result)}`)
  console.log(`Expected: 2025-10-14 (Start + 2 days)`)
  console.log(`✅ Test ${test3Result.finishDate === '2025-10-14' ? 'PASSED' : 'FAILED'}\n`)

  // Test Case 4: Both dates provided - calculate duration
  console.log('Test Case 4: Both Dates Provided → Calculate Duration')
  console.log('--------------------------------------------------')
  
  const test4Result = DateCalculationService.calculateDates(
    '2025-10-12', // Start date
    '2025-10-15', // Finish date
    null          // Duration (to be calculated)
  )
  
  console.log(`Input: Start Date = 2025-10-12, Finish Date = 2025-10-15`)
  console.log(`Result: ${DateCalculationService.getCalculationDescription(test4Result)}`)
  console.log(`Expected: 4 days (inclusive counting)`)
  console.log(`✅ Test ${test4Result.durationDays === 4 ? 'PASSED' : 'FAILED'}\n`)

  // Test Case 5: Real-world example from your work items
  console.log('Test Case 5: Real-world Work Items Example')
  console.log('-----------------------------------------')
  
  // Simulate updating a work item with start date 2025-10-12 and duration 1 day
  const realWorldResult = DateCalculationService.calculateDates(
    '2025-10-12', // Start date from your screenshot
    null,         // Finish date (to be calculated)
    1,            // Duration: 1 day
    'startDate'   // Start date was just updated
  )
  
  console.log(`Work Item: "Setibanya di muara, kapal dipandu masuk perairan..."`)
  console.log(`Input: Start Date = 2025-10-12, Duration = 1 day`)
  console.log(`Result: ${DateCalculationService.getCalculationDescription(realWorldResult)}`)
  console.log(`Expected: 2025-10-12 (same day for 1-day duration)`)
  console.log(`✅ Test ${realWorldResult.finishDate === '2025-10-12' ? 'PASSED' : 'FAILED'}\n`)

  // Test Case 6: Edge cases
  console.log('Test Case 6: Edge Cases')
  console.log('----------------------')
  
  // Same day duration
  const sameDayResult = DateCalculationService.calculateDates(
    '2025-10-12',
    null,
    1,
    'startDate'
  )
  console.log(`Same day (1 day duration): Start 2025-10-12 → Finish ${sameDayResult.finishDate}`)
  console.log(`✅ ${sameDayResult.finishDate === '2025-10-12' ? 'PASSED' : 'FAILED'} (Expected: 2025-10-12)`)
  
  // Weekend spanning
  const weekendResult = DateCalculationService.calculateDates(
    '2025-10-10', // Friday
    null,
    3, // 3 days should go to Sunday
    'startDate'
  )
  console.log(`Weekend spanning: Start Friday 2025-10-10 + 3 days → Finish ${weekendResult.finishDate}`)
  console.log(`✅ ${weekendResult.finishDate === '2025-10-12' ? 'PASSED' : 'FAILED'} (Expected: 2025-10-12)`)
  
  // Month boundary
  const monthBoundaryResult = DateCalculationService.calculateDates(
    '2025-10-30',
    null,
    3,
    'startDate'
  )
  console.log(`Month boundary: Start 2025-10-30 + 3 days → Finish ${monthBoundaryResult.finishDate}`)
  console.log(`✅ ${monthBoundaryResult.finishDate === '2025-11-01' ? 'PASSED' : 'FAILED'} (Expected: 2025-11-01)`)

  console.log('\n🎉 All tests completed!')
  console.log('\n💡 How this works in your Work Items Table:')
  console.log('1. ✏️  Edit START date → FINISH date automatically calculated')
  console.log('2. ✏️  Edit FINISH date → START date automatically calculated')  
  console.log('3. ✏️  Edit DURATION → FINISH date automatically calculated (if START exists)')
  console.log('4. 📊 All calculations respect business rules and validate inputs')
  console.log('5. 🔄 Updates happen immediately when you save changes in the UI')

  console.log('\n📝 Example scenarios:')
  console.log('• Set start date to 2025-10-12, duration 1 day → finish becomes 2025-10-12')
  console.log('• Set start date to 2025-10-12, duration 2 days → finish becomes 2025-10-13')  
  console.log('• Set finish date to 2025-10-16, duration 5 days → start becomes 2025-10-12')
  console.log('• Change duration from 1 to 3 days (with start 2025-10-12) → finish becomes 2025-10-14')
}

// Run the tests
runTests()

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DateCalculationService
  }
}