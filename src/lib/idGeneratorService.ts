import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Service for generating work item IDs in DD/MM/YY/### format
 * where ### is a sequential number that increments daily per project
 */
export class IdGeneratorService {
  
  /**
   * Generates a new work item ID in DD/MM/YY/### format
   * @param projectId - The project ID to generate the ID for
   * @param date - Optional date override (defaults to current date)
   * @returns Promise<string> - The generated ID in DD/MM/YY/### format
   */
  async generateWorkItemId(projectId: string, date?: Date): Promise<string> {
    const currentDate = date || new Date()
    
    // Format date as DD/MM/YY
    const day = String(currentDate.getDate()).padStart(2, '0')
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const year = String(currentDate.getFullYear()).slice(-2) // Last 2 digits
    const datePrefix = `${day}/${month}/${year}`
    
    // Get the start and end of the current day for filtering
    const startOfDay = new Date(currentDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(currentDate)
    endOfDay.setHours(23, 59, 59, 999)
    
    try {
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
      return this.generateFallbackId(projectId, currentDate)
    }
  }
  
  /**
   * Generates a fallback ID using the old format if the new system fails
   * @param projectId - The project ID
   * @param date - The date
   * @returns string - Fallback ID
   */
  private generateFallbackId(projectId: string, date: Date): string {
    const timestamp = date.getTime()
    const random = Math.random().toString(36).substr(2, 9)
    return `WI-${projectId}-${timestamp}-${random}`
  }
  
  /**
   * Validates if an ID follows the new DD/MM/YY/### format
   * @param id - The ID to validate
   * @returns boolean - True if the ID follows the new format
   */
  static isNewFormat(id: string): boolean {
    const pattern = /^\d{2}\/\d{2}\/\d{2}\/\d{3}$/
    return pattern.test(id)
  }
  
  /**
   * Extracts date information from a new format ID
   * @param id - The ID in DD/MM/YY/### format
   * @returns object with day, month, year, and sequential number, or null if invalid
   */
  static parseNewFormatId(id: string): {
    day: number
    month: number
    year: number
    sequentialNumber: number
    fullYear: number
  } | null {
    if (!this.isNewFormat(id)) {
      return null
    }
    
    const parts = id.split('/')
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    const year = parseInt(parts[2], 10)
    const sequentialNumber = parseInt(parts[3], 10)
    
    // Convert 2-digit year to 4-digit year
    // Assume years 00-30 are 2000-2030, and 31-99 are 1931-1999
    const fullYear = year <= 30 ? 2000 + year : 1900 + year
    
    return {
      day,
      month,
      year,
      sequentialNumber,
      fullYear
    }
  }
  
  /**
   * Gets the next available sequential number for a specific date and project
   * @param projectId - The project ID
   * @param date - The date to check
   * @returns Promise<number> - The next available sequential number
   */
  async getNextSequentialNumber(projectId: string, date: Date): Promise<number> {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    const datePrefix = `${day}/${month}/${year}`
    
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    const count = await prisma.workItem.count({
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
    
    return count + 1
  }
  
  /**
   * Batch generate multiple work item IDs for the same project and date
   * @param projectId - The project ID
   * @param count - Number of IDs to generate
   * @param date - Optional date override
   * @returns Promise<string[]> - Array of generated IDs
   */
  async generateBatchWorkItemIds(projectId: string, count: number, date?: Date): Promise<string[]> {
    const currentDate = date || new Date()
    const ids: string[] = []
    
    const day = String(currentDate.getDate()).padStart(2, '0')
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const year = String(currentDate.getFullYear()).slice(-2)
    const datePrefix = `${day}/${month}/${year}`
    
    // Get the starting sequential number
    let nextNumber = await this.getNextSequentialNumber(projectId, currentDate)
    
    // Generate the requested number of IDs
    for (let i = 0; i < count; i++) {
      const sequentialNumber = String(nextNumber + i).padStart(3, '0')
      const newId = `${datePrefix}/${sequentialNumber}`
      ids.push(newId)
    }
    
    return ids
  }
  
  /**
   * Generates a new Work Package ID in WP-{PROJECT_CODE}-{SEQUENCE} format
   * @param projectId - The project ID to generate the ID for
   * @returns Promise<string> - The generated Work Package ID
   */
  async generateWorkPackageId(projectId: string): Promise<string> {
    const startTime = Date.now()
    
    try {
      console.log(`📦 Generating work package ID for project: ${projectId}`)
      
      // Use a timeout to prevent long queries
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Work package ID generation timeout')), 10000) // 10 second timeout
      })
      
      // Get project information to extract project code
      const projectPromise = prisma.project.findUnique({
        where: { id: projectId },
        select: { vesselName: true, projectName: true }
      })
      
      const project = await Promise.race([projectPromise, timeoutPromise])
      
      if (!project) {
        throw new Error(`Project not found: ${projectId}`)
      }
      
      // Extract project code from vessel name (first 3 characters)
      let projectCode = 'UNK' // Default if extraction fails
      if (project.vesselName) {
        // Remove common prefixes like 'MT.', 'KM.', etc.
        const cleanVesselName = project.vesselName
          .replace(/^(MT\.|KM\.|MV\.|MS\.)\s*/i, '')
          .trim()
        
        // Take first 3 characters or first word if shorter
        const words = cleanVesselName.split(' ')
        if (words.length > 0) {
          projectCode = words[0].substring(0, 3).toUpperCase()
        }
      }
      
      // Use simpler count-based approach instead of complex sequence number logic
      const countPromise = prisma.workItem.count({
        where: {
          projectId: projectId,
          id: {
            startsWith: `WP-${projectCode}-`
          },
          parentId: null // Only parent work items (work packages)
        }
      })
      
      const existingCount = await Promise.race([countPromise, timeoutPromise])
      
      // Simple sequential numbering based on count
      const nextNumber = existingCount + 1
      
      // Format the sequential number with leading zeros (3 digits)
      const sequentialNumber = String(nextNumber).padStart(3, '0')
      
      // Generate the final Work Package ID
      const workPackageId = `WP-${projectCode}-${sequentialNumber}`
      
      const duration = Date.now() - startTime
      console.log(`✅ Generated work package ID: ${workPackageId} in ${duration}ms`)
      
      return workPackageId
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ Error generating work package ID after ${duration}ms:`, error)
      
      // Fast fallback to timestamp-based ID
      const timestamp = Date.now()
      const random = Math.random().toString(36).substr(2, 6).toUpperCase()
      const fallbackId = `WP-ERR-${String(timestamp).slice(-6)}-${random}`
      
      console.log(`🆘 Using fallback work package ID: ${fallbackId}`)
      return fallbackId
    }
  }
  
  /**
   * Generates a new Task ID in {PARENT_ID}-T{SEQUENCE} format
   * @param parentId - The parent Work Package ID
   * @returns Promise<string> - The generated Task ID
   */
  async generateTaskId(parentId: string): Promise<string> {
    const startTime = Date.now()
    
    try {
      console.log(`🔢 Generating task ID for parent: ${parentId}`)
      
      // Use a timeout to prevent long queries
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('ID generation timeout')), 10000) // 10 second timeout
      })
      
      // Validate that parent exists (with timeout)
      const parentCheckPromise = prisma.workItem.findUnique({
        where: { id: parentId },
        select: { id: true, parentId: true }
      })
      
      const parentWorkItem = await Promise.race([parentCheckPromise, timeoutPromise])
      
      if (!parentWorkItem) {
        throw new Error(`Parent work item not found: ${parentId}`)
      }
      
      // Find existing Task IDs for this parent (optimized query)
      const existingTasksPromise = prisma.workItem.count({
        where: {
          parentId: parentId,
          id: {
            startsWith: `${parentId}-T`
          }
        }
      })
      
      const taskCount = await Promise.race([existingTasksPromise, timeoutPromise])
      
      // Simple sequential numbering based on count
      const nextTaskNumber = taskCount + 1
      
      // Format the task number with leading zeros (2 digits)
      const taskSequentialNumber = String(nextTaskNumber).padStart(2, '0')
      
      // Generate the final Task ID
      const taskId = `${parentId}-T${taskSequentialNumber}`
      
      const duration = Date.now() - startTime
      console.log(`✅ Generated task ID: ${taskId} in ${duration}ms`)
      
      return taskId
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ Error generating task ID after ${duration}ms:`, error)
      
      // Fast fallback to timestamp-based ID
      const timestamp = Date.now()
      const random = Math.random().toString(36).substr(2, 4).toUpperCase()
      const fallbackId = `${parentId}-T${String(timestamp).slice(-6)}-${random}`
      
      console.log(`🆘 Using fallback task ID: ${fallbackId}`)
      return fallbackId
    }
  }
  
  /**
   * Generates appropriate Work Item ID based on whether it has a parent
   * @param projectId - The project ID
   * @param parentId - Optional parent ID (if provided, generates task ID)
   * @returns Promise<string> - The generated ID
   */
  async generateWorkItemIdNew(projectId: string, parentId?: string): Promise<string> {
    if (parentId) {
      // Generate task ID for child work item
      return await this.generateTaskId(parentId)
    } else {
      // Generate work package ID for parent work item
      return await this.generateWorkPackageId(projectId)
    }
  }
  
  /**
   * Validates if an ID follows the new Work Package format
   * @param id - The ID to validate
   * @returns boolean - True if the ID follows the work package format
   */
  static isWorkPackageFormat(id: string): boolean {
    const pattern = /^WP-[A-Z]{3}-\d{3}$/
    return pattern.test(id)
  }
  
  /**
   * Validates if an ID follows the new Task format
   * @param id - The ID to validate
   * @returns boolean - True if the ID follows the task format
   */
  static isTaskFormat(id: string): boolean {
    const pattern = /^WP-[A-Z]{3}-\d{3}-T\d{2}$/
    return pattern.test(id)
  }
  
  /**
   * Validates if an ID follows any of the new formats
   * @param id - The ID to validate
   * @returns boolean - True if the ID follows new format
   */
  static isNewWorkPackageFormat(id: string): boolean {
    return this.isWorkPackageFormat(id) || this.isTaskFormat(id)
  }
}

export const idGeneratorService = new IdGeneratorService()
