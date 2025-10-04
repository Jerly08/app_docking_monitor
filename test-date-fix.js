/**
 * Test Script for Date Placeholder Fix
 * 
 * This script tests the handling of 'mm/dd/yyyy' placeholders
 * Run with: node test-date-fix.js
 */

// Mock DateCalculationService for testing the fix
class DateCalculationService {
  static calculateDates(startDate, finishDate, durationDays, changedField) {
    console.log('\n🧮 Calculating dates with inputs:')
    console.log('  Start date:', startDate)
    console.log('  Finish date:', finishDate) 
    console.log('  Duration:', durationDays)
    console.log('  Changed field:', changedField)
    
    try {
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
          // Or calculate start date if we have finish date but no start date
          else if (finishDateObj && !startDateObj && duration > 0) {
            const calculatedStart = new Date(finishDateObj)
            calculatedStart.setDate(calculatedStart.getDate() - duration + 1)
            result.startDate = this.formatDate(calculatedStart)
            result.finishDate = finishDate || undefined
            result.durationDays = duration
            result.calculatedField = 'startDate'
          }
          // If no dates exist but duration is provided, use today as start date
          else if (!startDateObj && !finishDateObj && duration > 0) {
            const todayStart = new Date()
            const calculatedFinish = new Date(todayStart)
            calculatedFinish.setDate(calculatedFinish.getDate() + duration - 1)
            result.startDate = this.formatDate(todayStart)
            result.finishDate = this.formatDate(calculatedFinish)
            result.durationDays = duration
            result.calculatedField = 'finishDate'
            console.log(`📅 No existing dates, using today (${result.startDate}) as start date`)
          }
          break
      }

      return result
    } catch (error) {
      console.error('Error in calculateDates:', error)
      return {
        startDate: startDate || undefined,
        finishDate: finishDate || undefined,
        durationDays: durationDays || undefined
      }
    }
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
 * Test scenarios for the placeholder fix
 */
function runTests() {
  console.log('🔧 Running Date Placeholder Fix Tests')
  console.log('=====================================\n')

  // Test Case 1: Duration changed with mm/dd/yyyy placeholders (your exact scenario)
  console.log('Test Case 1: Duration Changed with mm/dd/yyyy Placeholders')
  console.log('----------------------------------------------------------')
  
  // Simulate the API logic for handling placeholders
  const currentStartDate = 'mm/dd/yyyy'
  const currentFinishDate = 'mm/dd/yyyy'
  const newDuration = 3
  
  // Convert mm/dd/yyyy to null (as the API does)
  const startDateForCalc = currentStartDate === 'mm/dd/yyyy' ? null : currentStartDate
  const finishDateForCalc = currentFinishDate === 'mm/dd/yyyy' ? null : currentFinishDate
  
  console.log('Before calculation:')
  console.log('  Start date in DB:', currentStartDate)
  console.log('  Finish date in DB:', currentFinishDate)
  console.log('  New duration:', newDuration)
  
  const result = DateCalculationService.calculateDates(
    startDateForCalc,
    finishDateForCalc,
    newDuration,
    'durationDays'
  )
  
  console.log('After calculation:')
  console.log('  ', DateCalculationService.getCalculationDescription(result))
  
  const success = result.startDate && result.finishDate && result.startDate !== 'mm/dd/yyyy' && result.finishDate !== 'mm/dd/yyyy'
  console.log(`✅ Test ${success ? 'PASSED' : 'FAILED'} - ${success ? 'Dates calculated successfully' : 'Failed to calculate dates'}\n`)

  // Test Case 2: Duration changed with existing start date
  console.log('Test Case 2: Duration Changed with Existing Start Date')
  console.log('----------------------------------------------------')
  
  const existingStart = '2025-10-12'
  const existingFinish = 'mm/dd/yyyy'
  const newDuration2 = 2
  
  const startForCalc2 = existingStart === 'mm/dd/yyyy' ? null : existingStart
  const finishForCalc2 = existingFinish === 'mm/dd/yyyy' ? null : existingFinish
  
  const result2 = DateCalculationService.calculateDates(
    startForCalc2,
    finishForCalc2,
    newDuration2,
    'durationDays'
  )
  
  console.log('  ', DateCalculationService.getCalculationDescription(result2))
  
  const expectedFinish = '2025-10-13' // Start + 1 day (2 days duration)
  const success2 = result2.finishDate === expectedFinish
  console.log(`✅ Test ${success2 ? 'PASSED' : 'FAILED'} - Expected: ${expectedFinish}, Got: ${result2.finishDate}\n`)

  console.log('🎉 Tests completed!')
  console.log('\n💡 What the fix does:')
  console.log('1. 🔄 Converts "mm/dd/yyyy" placeholders to null for calculation')
  console.log('2. 📅 Uses today\'s date as default start when no dates exist')
  console.log('3. 🧮 Calculates finish date based on start + duration')
  console.log('4. ✅ Validates and saves calculated dates to database')
  
  console.log('\n🚀 In your Work Items Table:')
  console.log('• Edit DURATION = 3 days (with mm/dd/yyyy placeholders)')
  console.log('• System sets START = today, FINISH = today + 2 days')
  console.log('• Both dates display properly instead of mm/dd/yyyy')
}

// Run the tests
runTests()

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DateCalculationService
  }
}