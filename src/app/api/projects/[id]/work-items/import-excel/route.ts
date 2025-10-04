import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { idGeneratorService } from '@/lib/idGeneratorService'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

interface ExcelRowData {
  'No'?: number
  'PACKAGE'?: string
  'TASK NAME'?: string
  'DURATION (DAYS)'?: number
  'START'?: string
  'FINISH'?: string
  '% COMPLETE'?: number
  'RESOURCE NAMES'?: string
  'MILESTONE'?: string
  'NOTES'?: string
  'DEPENDS ON'?: string
}

interface ProcessedWorkItem {
  title: string
  description?: string
  package?: string
  durationDays?: number
  startDate?: string
  finishDate?: string
  completion: number
  resourceNames: string
  isMilestone: boolean
  notes?: string
  dependsOnIds?: string[]
  volume?: number
  unit?: string
}

// POST /api/projects/[id]/work-items/import-excel - Import work items from Excel file
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, projectName: true, status: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot add work items to completed project' },
        { status: 409 }
      )
    }

    // Get the uploaded file from formData
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })

    // Get the first sheet
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Convert sheet to JSON to find table headers
    const allSheetData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: null
    })

    // Find where the actual data table starts by looking for header patterns
    let tableStartRow = 0
    let actualHeaders: string[] = []
    
    for (let i = 0; i < Math.min(25, allSheetData.length); i++) {
      const row = allSheetData[i] as unknown[]
      if (row && Array.isArray(row)) {
        const rowText = row.join(' ').toLowerCase()
        const cleanRowText = rowText.replace(/[^a-z0-9\s]/g, ' ').trim()
        
        // Look for rows containing common header indicators
        if ((cleanRowText.includes('no') && (cleanRowText.includes('uraian') || cleanRowText.includes('pekerjaan'))) ||
            (cleanRowText.includes('task') && cleanRowText.includes('name')) ||
            (cleanRowText.includes('description') && cleanRowText.includes('work')) ||
            (cleanRowText.includes('vol') && cleanRowText.includes('sat')) ||
            cleanRowText.includes('keterangan')) {
          
          console.log(`🎯 Found header row at position ${i}:`, row)
          tableStartRow = i
          // Take all non-null headers from this row
          actualHeaders = row.map(cell => cell ? cell.toString() : '').filter(header => header.trim() !== '')
          break
        }
      }
    }

    if (tableStartRow === 0 && allSheetData.length > 0) {
      // Fallback: assume first non-empty row is header
      actualHeaders = (allSheetData[0] as unknown[]).filter(cell => cell !== null && cell !== undefined).map(cell => cell.toString())
      console.log('🗺 Fallback: Using first row as headers:', actualHeaders)
    }

    // Get data rows after the header
    const rawData = allSheetData.slice(tableStartRow + 1).filter(row => {
      // Filter out empty rows and section headers
      if (!row || !Array.isArray(row)) return false
      const nonEmptyCells = row.filter(cell => cell !== null && cell !== undefined && cell !== '')
      return nonEmptyCells.length > 1 // Must have at least 2 non-empty cells
    })

    if (rawData.length === 0) {
      return NextResponse.json(
        { error: 'No data found in the Excel file' },
        { status: 400 }
      )
    }

    // Process and validate data
    const processedWorkItems: ProcessedWorkItem[] = []
    const errors: string[] = []

    // Map column indices using detected headers
    const columnMap: { [key: string]: number } = {}
    const headerRow = actualHeaders
    
    headerRow.forEach((header, index) => {
      const normalizedHeader = header?.toString().toUpperCase().trim()
      if (normalizedHeader) {
        columnMap[normalizedHeader] = index
      }
    })

    // Log detected headers for debugging
    console.log('🔍 Detected Excel headers:', headerRow)
    console.log('📊 Column mapping:', columnMap)

    // Expected column mappings (flexible to match Excel template)
    const expectedColumns = {
      no: ['NO', 'NO.', 'NUMBER', '#', 'NOMOR'],
      package: ['PACKAGE', 'PKG', 'PACK', 'PAKET', 'KELOMPOK'],
      taskName: [
        'TASK NAME', 'TASK', 'DESCRIPTION', 'WORK DESCRIPTION', 'ITEM',
        'NAMA TUGAS', 'PEKERJAAN', 'KEGIATAN', 'URAIAN PEKERJAAN',
        'URAIAN', 'DESKRIPSI', 'JENIS PEKERJAAN', 'ITEM PEKERJAAN',
        'URAIAN - PEKERJAAN', 'URAIAN-PEKERJAAN'
      ],
      duration: ['DURATION (DAYS)', 'DURATION', 'DAYS', 'DURATION DAYS', 'HARI', 'WAKTU'],
      start: ['START', 'START DATE', 'MULAI', 'TANGGAL MULAI', 'TGL MULAI'],
      finish: ['FINISH', 'FINISH DATE', 'SELESAI', 'TANGGAL SELESAI', 'TGL SELESAI'],
      complete: ['% COMPLETE', 'COMPLETE', 'PROGRESS', '%COMPLETE', 'COMPLETION', 'PROGRES', 'SELESAI %'],
      resource: ['RESOURCE NAMES', 'RESOURCE', 'RESOURCES', 'PETUGAS', 'PELAKSANA', 'TEKNISI'],
      milestone: ['MILESTONE', 'MS', 'TONGGAK', 'PENCAPAIAN'],
      notes: ['NOTES', 'NOTE', 'CATATAN', 'KETERANGAN', 'REMARKS'],
      depends: ['DEPENDS ON', 'DEPENDENCY', 'DEP', 'KETERGANTUNGAN'],
      volume: ['VOL', 'VOLUME', 'QTY', 'QUANTITY', 'JUMLAH'],
      unit: ['SAT', 'SATUAN', 'UNIT', 'UOM']
    }

    // Find column indices for each expected column
    const foundColumns: { [key: string]: number } = {}
    Object.entries(expectedColumns).forEach(([key, variations]) => {
      for (const variation of variations) {
        if (columnMap[variation] !== undefined) {
          foundColumns[key] = columnMap[variation]
          console.log(`✅ Found ${key} column: "${variation}" at index ${columnMap[variation]}`)
          break
        }
      }
    })

    console.log('📋 Found columns:', foundColumns)

    // Validate that essential columns exist
    if (foundColumns.taskName === undefined) {
      const availableHeaders = Object.keys(columnMap).join(', ')
      const suggestedColumns = expectedColumns.taskName.join(', ')
      
      return NextResponse.json(
        { 
          error: `Task Name column not found in Excel file.`,
          details: {
            availableHeaders: availableHeaders,
            expectedHeaders: suggestedColumns,
            message: 'Please ensure your Excel file has one of these columns: ' + suggestedColumns
          }
        },
        { status: 400 }
      )
    }

    // Process each row
    rawData.forEach((row: unknown[], rowIndex) => {
      // Skip empty rows
      if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
        return
      }

      try {
        // Extract data based on found column indices
        const taskName = foundColumns.taskName !== undefined ? row[foundColumns.taskName]?.toString().trim() : ''
        
        if (!taskName) {
          errors.push(`Row ${rowIndex + 2}: Task name is required`)
          return
        }

        // Parse other fields with fallbacks
        const packageName = foundColumns.package !== undefined ? 
          row[foundColumns.package]?.toString().trim() || 'PELAYANAN UMUM' : 'PELAYANAN UMUM'
        
        const durationDays = foundColumns.duration !== undefined ? 
          parseInt(row[foundColumns.duration]?.toString()) || 1 : 1
        
        const startDate = foundColumns.start !== undefined ? 
          row[foundColumns.start]?.toString().trim() || '' : ''
        
        const finishDate = foundColumns.finish !== undefined ? 
          row[foundColumns.finish]?.toString().trim() || '' : ''
        
        const completion = foundColumns.complete !== undefined ? 
          Math.min(100, Math.max(0, parseInt(row[foundColumns.complete]?.toString()) || 0)) : 0
        
        const resourceNames = foundColumns.resource !== undefined ? 
          row[foundColumns.resource]?.toString().trim() || 'TBD' : 'TBD'
        
        const milestoneText = foundColumns.milestone !== undefined ? 
          row[foundColumns.milestone]?.toString().toUpperCase().trim() : ''
        const isMilestone = milestoneText === 'YES' || milestoneText === 'TRUE' || milestoneText === '1'
        
        const notes = foundColumns.notes !== undefined ? 
          row[foundColumns.notes]?.toString().trim() || '' : ''
        
        const dependsOnText = foundColumns.depends !== undefined ? 
          row[foundColumns.depends]?.toString().trim() || '' : ''
        const dependsOnIds = dependsOnText ? 
          dependsOnText.split(',').map(id => id.trim()).filter(id => id) : []

        // Get volume and unit from Excel template
        const volume = foundColumns.volume !== undefined ? 
          parseFloat(row[foundColumns.volume]?.toString()) || 1 : 1
        
        const unit = foundColumns.unit !== undefined ? 
          row[foundColumns.unit]?.toString().trim() || 'item' : 'item'

        // Format dates if they exist
        let formattedStartDate = ''
        let formattedFinishDate = ''
        
        if (startDate) {
          try {
            // Handle various date formats
            const date = new Date(startDate)
            if (!isNaN(date.getTime())) {
              formattedStartDate = date.toISOString().split('T')[0]
            }
          } catch (e) {
            // If date parsing fails, keep as string
            formattedStartDate = startDate
          }
        }

        if (finishDate) {
          try {
            const date = new Date(finishDate)
            if (!isNaN(date.getTime())) {
              formattedFinishDate = date.toISOString().split('T')[0]
            }
          } catch (e) {
            formattedFinishDate = finishDate
          }
        }

        const processedItem: ProcessedWorkItem = {
          title: taskName,
          description: notes || undefined,
          package: packageName,
          durationDays,
          startDate: formattedStartDate || undefined,
          finishDate: formattedFinishDate || undefined,
          completion,
          resourceNames,
          isMilestone,
          notes: notes || undefined,
          dependsOnIds: dependsOnIds.length > 0 ? dependsOnIds : undefined,
          volume,
          unit
        }

        processedWorkItems.push(processedItem)

      } catch (error) {
        errors.push(`Row ${rowIndex + 2}: Error processing data - ${error}`)
      }
    })

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Data validation errors found',
          details: errors,
          processedCount: processedWorkItems.length
        },
        { status: 400 }
      )
    }

    if (processedWorkItems.length === 0) {
      return NextResponse.json(
        { error: 'No valid work items found in the Excel file' },
        { status: 400 }
      )
    }

    // Generate batch IDs for all work items
    const batchIds = await idGeneratorService.generateBatchWorkItemIds(projectId, processedWorkItems.length)

    // Create work items in database
    const createdWorkItems = []
    
    for (let i = 0; i < processedWorkItems.length; i++) {
      const workItemData = processedWorkItems[i]
      
      const workItem = await prisma.workItem.create({
        data: {
          id: batchIds[i],
          projectId: projectId,
          title: workItemData.title,
          description: workItemData.description,
          package: workItemData.package,
          durationDays: workItemData.durationDays,
          startDate: workItemData.startDate,
          finishDate: workItemData.finishDate,
          completion: workItemData.completion,
          resourceNames: workItemData.resourceNames,
          isMilestone: workItemData.isMilestone,
          status: workItemData.completion === 100 ? 'COMPLETED' : 
                 workItemData.completion > 0 ? 'IN_PROGRESS' : 'PLANNED',
          unit: workItemData.unit || 'item',
          volume: workItemData.volume || 1
        },
        include: {
          template: true,
          children: true,
          parent: true
        }
      })

      createdWorkItems.push(workItem)
    }

    return NextResponse.json({
      message: `Successfully imported ${createdWorkItems.length} work items from Excel`,
      workItems: createdWorkItems,
      project,
      summary: {
        totalProcessed: createdWorkItems.length,
        packagesFound: [...new Set(processedWorkItems.map(item => item.package))],
        milestonesCount: processedWorkItems.filter(item => item.isMilestone).length,
        averageCompletion: Math.round(
          processedWorkItems.reduce((sum, item) => sum + item.completion, 0) / processedWorkItems.length
        )
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error importing Excel file:', error)
    return NextResponse.json(
      { 
        error: 'Failed to import Excel file', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/projects/[id]/work-items/import-excel - Get import template info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, projectName: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Return template structure information
    return NextResponse.json({
      message: 'Excel import template structure',
      project,
      templateStructure: {
        requiredColumns: [
          'TASK NAME'
        ],
        optionalColumns: [
          'NO',
          'PACKAGE', 
          'DURATION (DAYS)',
          'START',
          'FINISH',
          '% COMPLETE',
          'RESOURCE NAMES',
          'MILESTONE',
          'NOTES',
          'DEPENDS ON'
        ],
        columnDescriptions: {
          'NO': 'Sequential number (optional)',
          'PACKAGE': 'Work package name (default: PELAYANAN UMUM)',
          'TASK NAME': 'Required - Description of the work item',
          'DURATION (DAYS)': 'Number of days to complete (default: 1)',
          'START': 'Start date in any common format',
          'FINISH': 'Finish date in any common format',
          '% COMPLETE': 'Completion percentage 0-100 (default: 0)',
          'RESOURCE NAMES': 'Names of assigned resources (default: TBD)',
          'MILESTONE': 'YES/TRUE/1 for milestone items',
          'NOTES': 'Additional notes or comments',
          'DEPENDS ON': 'Comma-separated list of dependencies'
        },
        supportedFormats: ['.xlsx', '.xls'],
        maxFileSize: '10MB',
        notes: [
          'First row should contain column headers',
          'Empty rows will be skipped',
          'Only the first sheet will be processed',
          'Date formats are flexible and will be auto-parsed'
        ]
      }
    })

  } catch (error) {
    console.error('Error getting import template info:', error)
    return NextResponse.json(
      { error: 'Failed to get template information' },
      { status: 500 }
    )
  }
}