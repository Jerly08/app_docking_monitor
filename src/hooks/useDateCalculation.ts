'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'

interface UseDateCalculationOptions {
  onDateCalculated?: (field: string, oldValue: any, newValue: any) => void
  showCalculationToast?: boolean
}

export function useDateCalculation(options: UseDateCalculationOptions = {}) {
  const [isCalculating, setIsCalculating] = useState(false)
  const toast = useToast()

  const updateWorkItemWithDateCalculation = useCallback(async (
    workItemId: string,
    field: 'startDate' | 'finishDate' | 'durationDays',
    value: string | number,
    onSuccess?: () => void
  ) => {
    setIsCalculating(true)
    
    try {
      const encodedId = encodeURIComponent(workItemId)
      const updateData = { [field]: field === 'durationDays' ? parseInt(String(value)) || 1 : value }
      
      const response = await fetch(`/api/work-items/${encodedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const updatedItem = await response.json()
        
        // Check if any dates were automatically calculated
        const calculatedFields: string[] = []
        
        if (field === 'startDate' && updatedItem.finishDate) {
          calculatedFields.push('finish date')
        } else if (field === 'finishDate' && updatedItem.startDate) {
          calculatedFields.push('start date')
        } else if (field === 'durationDays') {
          if (updatedItem.startDate && updatedItem.finishDate) {
            calculatedFields.push('finish date')
          }
        }
        
        // Show toast notification if dates were calculated
        if (options.showCalculationToast && calculatedFields.length > 0) {
          toast({
            title: '📅 Dates Calculated',
            description: `Automatically updated ${calculatedFields.join(' and ')} based on your input`,
            status: 'info',
            duration: 3000,
            position: 'top-right'
          })
        }
        
        // Call the callback if provided
        options.onDateCalculated?.(field, value, updatedItem[field])
        
        // Call success callback
        onSuccess?.()
        
        return updatedItem
      } else {
        throw new Error('Failed to update work item')
      }
    } catch (error) {
      console.error('Error updating work item with date calculation:', error)
      
      toast({
        title: 'Update Failed',
        description: 'Failed to update work item dates. Please try again.',
        status: 'error',
        duration: 3000
      })
      
      throw error
    } finally {
      setIsCalculating(false)
    }
  }, [options, toast])

  return {
    updateWorkItemWithDateCalculation,
    isCalculating
  }
}