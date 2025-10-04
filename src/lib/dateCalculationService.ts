/**
 * Date Calculation Service
 * Handles automatic calculation of start/finish dates based on duration
 */

export interface DateCalculationResult {
  startDate?: string
  finishDate?: string
  durationDays?: number
  calculatedField?: 'startDate' | 'finishDate' | 'durationDays'
}

export class DateCalculationService {
  
  /**
   * Calculate missing date field based on the other two fields
   * @param startDate - Start date in YYYY-MM-DD format
   * @param finishDate - Finish date in YYYY-MM-DD format  
   * @param durationDays - Duration in days
   * @param changedField - Which field was just changed to determine calculation priority
   * @returns Calculated dates and duration
   */
  static calculateDates(
    startDate?: string | null,
    finishDate?: string | null,
    durationDays?: number | null,
    changedField?: 'startDate' | 'finishDate' | 'durationDays'
  ): DateCalculationResult {
    
    try {
      console.log('🧮 Calculating dates with inputs:')
      console.log('  Start date:', startDate)
      console.log('  Finish date:', finishDate) 
      console.log('  Duration:', durationDays)
      console.log('  Changed field:', changedField)
      
      // Safety checks for extreme values
      if (durationDays !== null && durationDays !== undefined) {
        if (durationDays > 10000) {
          console.warn('Duration too large, capping at 10000 days')
          durationDays = 10000
        }
        if (durationDays < 0) {
          console.warn('Duration cannot be negative, setting to 1')
          durationDays = 1
        }
      }
      
      const result: DateCalculationResult = {
        startDate: startDate || undefined,
        finishDate: finishDate || undefined,
        durationDays: durationDays || undefined
      }

    // Convert string dates to Date objects for calculation
    let startDateObj: Date | null = null
    let finishDateObj: Date | null = null
    
    // Safe date parsing with validation
    if (startDate && startDate !== '' && startDate !== 'mm/dd/yyyy') {
      startDateObj = new Date(startDate)
      if (isNaN(startDateObj.getTime())) {
        console.warn('Invalid start date provided:', startDate)
        startDateObj = null
      }
    }
    
    if (finishDate && finishDate !== '' && finishDate !== 'mm/dd/yyyy') {
      finishDateObj = new Date(finishDate)
      if (isNaN(finishDateObj.getTime())) {
        console.warn('Invalid finish date provided:', finishDate)
        finishDateObj = null
      }
    }
    
    const duration = Math.max(1, durationDays || 1) // Ensure minimum 1 day
    
    // Additional safety check for reasonable date ranges
    const currentYear = new Date().getFullYear()
    if (startDateObj) {
      const startYear = startDateObj.getFullYear()
      if (startYear < 1900 || startYear > currentYear + 50) {
        console.warn('Start date year out of reasonable range:', startYear)
        startDateObj = null
      }
    }
    if (finishDateObj) {
      const finishYear = finishDateObj.getFullYear()
      if (finishYear < 1900 || finishYear > currentYear + 50) {
        console.warn('Finish date year out of reasonable range:', finishYear)
        finishDateObj = null
      }
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

    console.log('📊 Date calculation completed successfully')
    return result
    } catch (error) {
      console.error('💥 Error in calculateDates:', error)
      console.error('Stack trace:', error.stack)
      
      // Return safe defaults on error - prevent any undefined/null propagation
      const safeResult: DateCalculationResult = {
        startDate: (startDate && startDate !== 'mm/dd/yyyy') ? startDate : undefined,
        finishDate: (finishDate && finishDate !== 'mm/dd/yyyy') ? finishDate : undefined,
        durationDays: (durationDays && durationDays > 0) ? Math.min(durationDays, 1000) : 1 // Cap at 1000 days max
      }
      
      console.log('🛡️ Returning safe fallback result:', safeResult)
      return safeResult
    }
  }

  /**
   * Format a Date object to YYYY-MM-DD string
   * @param date - Date object to format
   * @returns Formatted date string
   */
  private static formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * Calculate business days between two dates (excluding weekends)
   * @param startDate - Start date string
   * @param finishDate - Finish date string
   * @returns Number of business days
   */
  static calculateBusinessDays(startDate: string, finishDate: string): number {
    const start = new Date(startDate)
    const finish = new Date(finishDate)
    
    if (isNaN(start.getTime()) || isNaN(finish.getTime())) {
      return 0
    }

    let businessDays = 0
    const currentDate = new Date(start)

    while (currentDate <= finish) {
      const dayOfWeek = currentDate.getDay()
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return businessDays
  }

  /**
   * Add business days to a start date (excluding weekends)
   * @param startDate - Start date string
   * @param businessDays - Number of business days to add
   * @returns Finish date string
   */
  static addBusinessDays(startDate: string, businessDays: number): string {
    const start = new Date(startDate)
    
    if (isNaN(start.getTime())) {
      return startDate
    }

    let daysAdded = 0
    const currentDate = new Date(start)

    while (daysAdded < businessDays) {
      currentDate.setDate(currentDate.getDate() + 1)
      const dayOfWeek = currentDate.getDay()
      
      // Only count business days (Monday-Friday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++
      }
    }

    return this.formatDate(currentDate)
  }

  /**
   * Validate date range and return any validation errors
   * @param startDate - Start date string
   * @param finishDate - Finish date string
   * @param durationDays - Duration in days
   * @returns Array of validation error messages
   */
  static validateDateRange(
    startDate?: string | null,
    finishDate?: string | null,
    durationDays?: number | null
  ): string[] {
    const errors: string[] = []
    
    console.log('📋 Validating date range:')
    console.log('  Start date:', startDate)
    console.log('  Finish date:', finishDate)
    console.log('  Duration:', durationDays)

    const start = startDate ? new Date(startDate) : null
    const finish = finishDate ? new Date(finishDate) : null
    const duration = durationDays || 0

    // Check for invalid dates
    if (startDate && start && isNaN(start.getTime())) {
      errors.push('Start date is not valid')
    }
    if (finishDate && finish && isNaN(finish.getTime())) {
      errors.push('Finish date is not valid')
    }

    // Check if finish date is before start date
    if (start && finish && finish < start) {
      errors.push('Finish date cannot be before start date')
    }

    // Check if duration is positive
    if (duration <= 0) {
      errors.push('Duration must be at least 1 day')
    }

    // Check if calculated duration matches provided duration (with some tolerance)
    if (start && finish && duration > 0) {
      const timeDiff = finish.getTime() - start.getTime()
      const calculatedDuration = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
      
      if (Math.abs(calculatedDuration - duration) > 1) { // Allow 1 day tolerance
        errors.push(`Duration (${duration} days) doesn't match date range (${calculatedDuration} days)`)
      }
    }

    return errors
  }

  /**
   * Get today's date in YYYY-MM-DD format
   * @returns Today's date string
   */
  static getToday(): string {
    return this.formatDate(new Date())
  }

  /**
   * Check if a date is in the past
   * @param dateString - Date string to check
   * @returns True if the date is in the past
   */
  static isDateInPast(dateString: string): boolean {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    
    return date < today
  }

  /**
   * Get a human-readable description of the date calculation
   * @param result - Date calculation result
   * @returns Description string
   */
  static getCalculationDescription(result: DateCalculationResult): string {
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

export const dateCalculationService = new DateCalculationService()