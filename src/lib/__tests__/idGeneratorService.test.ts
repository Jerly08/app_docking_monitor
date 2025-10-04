import { IdGeneratorService } from '../idGeneratorService'

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    workItem: {
      findMany: jest.fn(),
      count: jest.fn()
    }
  }))
}))

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  log: jest.fn()
}

describe('IdGeneratorService', () => {
  let idGenerator: IdGeneratorService
  let mockPrisma: any

  beforeEach(() => {
    idGenerator = new IdGeneratorService()
    mockPrisma = {
      workItem: {
        findMany: jest.fn(),
        count: jest.fn()
      }
    }
    // Replace the prisma instance in the service
    ;(idGenerator as any).prisma = mockPrisma
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('isNewFormat', () => {
    it('should correctly identify new format IDs', () => {
      expect(IdGeneratorService.isNewFormat('04/10/25/001')).toBe(true)
      expect(IdGeneratorService.isNewFormat('31/12/24/999')).toBe(true)
      expect(IdGeneratorService.isNewFormat('01/01/30/001')).toBe(true)
    })

    it('should correctly identify non-new format IDs', () => {
      expect(IdGeneratorService.isNewFormat('WI-1759577616590-0he14bnab')).toBe(false)
      expect(IdGeneratorService.isNewFormat('04/10/2025/001')).toBe(false) // 4-digit year
      expect(IdGeneratorService.isNewFormat('4/10/25/001')).toBe(false) // Single digit day
      expect(IdGeneratorService.isNewFormat('04/10/25/1')).toBe(false) // Single digit sequence
      expect(IdGeneratorService.isNewFormat('04-10-25-001')).toBe(false) // Wrong separator
      expect(IdGeneratorService.isNewFormat('abc123')).toBe(false)
      expect(IdGeneratorService.isNewFormat('')).toBe(false)
    })
  })

  describe('parseNewFormatId', () => {
    it('should correctly parse valid new format IDs', () => {
      const result = IdGeneratorService.parseNewFormatId('04/10/25/001')
      expect(result).toEqual({
        day: 4,
        month: 10,
        year: 25,
        sequentialNumber: 1,
        fullYear: 2025
      })
    })

    it('should handle year conversion correctly', () => {
      // Years 00-30 should be 2000-2030
      expect(IdGeneratorService.parseNewFormatId('01/01/00/001')?.fullYear).toBe(2000)
      expect(IdGeneratorService.parseNewFormatId('01/01/30/001')?.fullYear).toBe(2030)
      
      // Years 31-99 should be 1931-1999
      expect(IdGeneratorService.parseNewFormatId('01/01/31/001')?.fullYear).toBe(1931)
      expect(IdGeneratorService.parseNewFormatId('01/01/99/001')?.fullYear).toBe(1999)
    })

    it('should return null for invalid format IDs', () => {
      expect(IdGeneratorService.parseNewFormatId('WI-invalid')).toBeNull()
      expect(IdGeneratorService.parseNewFormatId('04/10/2025/001')).toBeNull()
      expect(IdGeneratorService.parseNewFormatId('')).toBeNull()
    })
  })

  describe('generateWorkItemId', () => {
    beforeEach(() => {
      mockPrisma.workItem.findMany.mockResolvedValue([])
    })

    it('should generate ID with correct format', async () => {
      const projectId = 'test-project'
      const testDate = new Date('2025-10-04T12:00:00Z')
      
      const id = await idGenerator.generateWorkItemId(projectId, testDate)
      
      expect(IdGeneratorService.isNewFormat(id)).toBe(true)
      expect(id).toBe('04/10/25/001')
    })

    it('should generate sequential IDs for same project and date', async () => {
      const projectId = 'test-project'
      const testDate = new Date('2025-10-04T12:00:00Z')
      
      // Mock existing work items
      mockPrisma.workItem.findMany
        .mockResolvedValueOnce([{ id: '04/10/25/001' }]) // First call returns 1 existing
        .mockResolvedValueOnce([{ id: '04/10/25/001' }, { id: '04/10/25/002' }]) // Second call returns 2 existing
      
      const id1 = await idGenerator.generateWorkItemId(projectId, testDate)
      const id2 = await idGenerator.generateWorkItemId(projectId, testDate)
      
      expect(id1).toBe('04/10/25/002') // Should be 002 (next after existing 001)
      expect(id2).toBe('04/10/25/003') // Should be 003 (next after existing 001, 002)
    })

    it('should handle gaps in sequential numbers', async () => {
      const projectId = 'test-project'
      const testDate = new Date('2025-10-04T12:00:00Z')
      
      // Mock existing work items with gaps (001, 003, 005)
      mockPrisma.workItem.findMany.mockResolvedValue([
        { id: '04/10/25/001' },
        { id: '04/10/25/003' },
        { id: '04/10/25/005' }
      ])
      
      const id = await idGenerator.generateWorkItemId(projectId, testDate)
      
      expect(id).toBe('04/10/25/002') // Should fill the first gap
    })
  })

  describe('generateBatchWorkItemIds', () => {
    beforeEach(() => {
      mockPrisma.workItem.count.mockResolvedValue(0)
    })

    it('should generate multiple sequential IDs', async () => {
      const projectId = 'test-project'
      const testDate = new Date('2025-10-04T12:00:00Z')
      const count = 5
      
      const ids = await idGenerator.generateBatchWorkItemIds(projectId, count, testDate)
      
      expect(ids).toHaveLength(5)
      expect(ids[0]).toBe('04/10/25/001')
      expect(ids[1]).toBe('04/10/25/002')
      expect(ids[2]).toBe('04/10/25/003')
      expect(ids[3]).toBe('04/10/25/004')
      expect(ids[4]).toBe('04/10/25/005')
    })

    it('should continue from existing count', async () => {
      const projectId = 'test-project'
      const testDate = new Date('2025-10-04T12:00:00Z')
      const count = 3
      
      // Mock that there are already 5 work items for this date
      mockPrisma.workItem.count.mockResolvedValue(5)
      
      const ids = await idGenerator.generateBatchWorkItemIds(projectId, count, testDate)
      
      expect(ids).toHaveLength(3)
      expect(ids[0]).toBe('04/10/25/006') // Should start from 6th
      expect(ids[1]).toBe('04/10/25/007')
      expect(ids[2]).toBe('04/10/25/008')
    })
  })

  describe('getNextSequentialNumber', () => {
    it('should return 1 for no existing work items', async () => {
      mockPrisma.workItem.count.mockResolvedValue(0)
      
      const projectId = 'test-project'
      const testDate = new Date('2025-10-04T12:00:00Z')
      
      const nextNumber = await idGenerator.getNextSequentialNumber(projectId, testDate)
      
      expect(nextNumber).toBe(1)
    })

    it('should return correct next number for existing work items', async () => {
      mockPrisma.workItem.count.mockResolvedValue(3)
      
      const projectId = 'test-project'
      const testDate = new Date('2025-10-04T12:00:00Z')
      
      const nextNumber = await idGenerator.getNextSequentialNumber(projectId, testDate)
      
      expect(nextNumber).toBe(4)
    })
  })

  describe('Date handling', () => {
    beforeEach(() => {
      mockPrisma.workItem.findMany.mockResolvedValue([])
    })

    it('should generate different IDs for different dates', async () => {
      const projectId = 'test-project'
      const date1 = new Date('2025-10-04T12:00:00Z') // Oct 4, 2025
      const date2 = new Date('2025-10-05T12:00:00Z') // Oct 5, 2025
      
      const id1 = await idGenerator.generateWorkItemId(projectId, date1)
      const id2 = await idGenerator.generateWorkItemId(projectId, date2)
      
      expect(id1).toBe('04/10/25/001')
      expect(id2).toBe('05/10/25/001')
    })

    it('should generate same date prefix for same day different times', async () => {
      const projectId = 'test-project'
      const date1 = new Date('2025-10-04T08:00:00Z') // Morning
      const date2 = new Date('2025-10-04T20:00:00Z') // Evening
      
      mockPrisma.workItem.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: '04/10/25/001' }])
      
      const id1 = await idGenerator.generateWorkItemId(projectId, date1)
      const id2 = await idGenerator.generateWorkItemId(projectId, date2)
      
      expect(id1).toBe('04/10/25/001')
      expect(id2).toBe('04/10/25/002') // Same date, next sequence
    })

    it('should handle different projects on same date', async () => {
      const date = new Date('2025-10-04T12:00:00Z')
      
      // Both projects should start from 001 on the same date
      const id1 = await idGenerator.generateWorkItemId('project-1', date)
      const id2 = await idGenerator.generateWorkItemId('project-2', date)
      
      expect(id1).toBe('04/10/25/001')
      expect(id2).toBe('04/10/25/001') // Different project, same sequence number
    })
  })

  describe('Error handling', () => {
    it('should fallback to old format if database error occurs', async () => {
      mockPrisma.workItem.findMany.mockRejectedValue(new Error('Database error'))
      
      const projectId = 'test-project'
      const testDate = new Date('2025-10-04T12:00:00Z')
      
      const id = await idGenerator.generateWorkItemId(projectId, testDate)
      
      // Should fallback to old format
      expect(IdGeneratorService.isNewFormat(id)).toBe(false)
      expect(id).toMatch(/^WI-test-project-\d+-[a-z0-9]+$/)
    })
  })
})

// Integration test to verify the complete workflow
describe('IdGeneratorService Integration', () => {
  let idGenerator: IdGeneratorService

  beforeEach(() => {
    idGenerator = new IdGeneratorService()
  })

  it('should demonstrate the complete ID generation workflow', async () => {
    // This test would require a real database connection in a real scenario
    // For now, we'll just test the static methods and format validation
    
    const sampleIds = [
      '04/10/25/001',
      '04/10/25/002',
      '05/10/25/001',
      '31/12/24/999'
    ]

    sampleIds.forEach(id => {
      expect(IdGeneratorService.isNewFormat(id)).toBe(true)
      const parsed = IdGeneratorService.parseNewFormatId(id)
      expect(parsed).toBeTruthy()
      expect(typeof parsed?.sequentialNumber).toBe('number')
      expect(typeof parsed?.fullYear).toBe('number')
    })
  })

  it('should show how the system handles mixed old and new format IDs', () => {
    const oldFormatIds = [
      'WI-1759577616590-0he14bnab',
      'WI-project-123456789-abcdefg',
      'WORK-ITEM-12345'
    ]

    const newFormatIds = [
      '04/10/25/001',
      '31/12/30/999',
      '01/01/00/001'
    ]

    oldFormatIds.forEach(id => {
      expect(IdGeneratorService.isNewFormat(id)).toBe(false)
    })

    newFormatIds.forEach(id => {
      expect(IdGeneratorService.isNewFormat(id)).toBe(true)
    })
  })
})