import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

// GET /api/templates/excel - Download Excel import template
export async function GET(request: NextRequest) {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new()

    // Define the header row
    const headers = [
      'NO',
      'TASK NAME', 
      'PACKAGE',
      'DURATION (DAYS)',
      'START',
      'FINISH', 
      '% COMPLETE',
      'RESOURCE NAMES',
      'MILESTONE',
      'NOTES',
      'DEPENDS ON'
    ]

    // Sample data untuk contoh
    const sampleData = [
      [1, 'Persiapan area kerja dan pemasangan scaffolding', 'Hull Repair', 2, '2025-01-10', '2025-01-12', 0, 'Tim Scaffolding', 'NO', 'Persiapan area kerja utama', ''],
      [2, 'Pembersihan dan pengecatan bottom plating', 'Hull Repair', 5, '2025-01-13', '2025-01-18', 25, 'Tim Cat & Blasting', 'NO', 'Gunakan cat anti fouling', 'T-001'],
      [3, 'Inspeksi dan perbaikan sea valve', 'Engine Room', 3, '2025-01-15', '2025-01-18', 50, 'Teknisi Mesin', 'YES', 'Critical milestone - sea valve', ''],
      [4, 'Overhaul main engine', 'Engine Room', 7, '2025-01-20', '2025-01-27', 0, 'Chief Engineer', 'YES', 'Major overhaul required', 'T-003'],
      [5, 'Testing dan commissioning', 'Testing', 2, '2025-01-28', '2025-01-30', 0, 'QC Team', 'YES', 'Final testing semua sistem', 'T-002,T-004']
    ]

    // Add instruction row
    const instructionData = [
      ['📝 INSTRUKSI:', 'Hapus baris sample data ini (baris 2-6) dan isi dengan data work items Anda.', '', '', '', '', '', '', '', '', ''],
      ['✅ WAJIB:', 'TASK NAME harus diisi', '', '', '', '', '', '', '', '', ''],
      ['📅 FORMAT TANGGAL:', 'YYYY-MM-DD (contoh: 2025-01-15)', '', '', '', '', '', '', '', '', ''],
      ['🏗️ MILESTONE:', 'Isi "YES" atau "TRUE" untuk milestone, kosong untuk non-milestone', '', '', '', '', '', '', '', '', ''],
      ['🔗 DEPENDS ON:', 'Pisahkan dengan koma jika ada multiple dependencies (contoh: T-001,T-002)', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', ''] // Empty row separator
    ]

    // Combine all data
    const worksheetData = [headers, ...instructionData, ...sampleData]

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData)

    // Set column widths
    const colWidths = [
      { wch: 5 },   // NO
      { wch: 45 },  // TASK NAME
      { wch: 15 },  // PACKAGE  
      { wch: 12 },  // DURATION
      { wch: 12 },  // START
      { wch: 12 },  // FINISH
      { wch: 10 },  // % COMPLETE
      { wch: 20 },  // RESOURCE NAMES
      { wch: 10 },  // MILESTONE
      { wch: 30 },  // NOTES
      { wch: 15 }   // DEPENDS ON
    ]
    ws['!cols'] = colWidths

    // Style the header row (blue header)
    const headerStyle = {
      fill: { fgColor: { rgb: "4F81BD" } },
      font: { bold: true, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center", vertical: "center" }
    }

    // Style instruction rows (light yellow)
    const instructionStyle = {
      fill: { fgColor: { rgb: "FFFACD" } },
      font: { bold: false, color: { rgb: "8B4513" } },
      alignment: { horizontal: "left", vertical: "center" }
    }

    // Style sample data rows (light gray)
    const sampleStyle = {
      fill: { fgColor: { rgb: "F5F5F5" } },
      font: { italic: true, color: { rgb: "666666" } }
    }

    // Apply header styling (row 0)
    headers.forEach((_, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex })
      if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' }
      ws[cellAddress].s = headerStyle
    })

    // Apply instruction styling (rows 1-6)
    for (let rowIndex = 1; rowIndex <= 6; rowIndex++) {
      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })
        if (ws[cellAddress]) {
          ws[cellAddress].s = instructionStyle
        }
      }
    }

    // Apply sample data styling (rows 7-11)
    for (let rowIndex = 7; rowIndex <= 11; rowIndex++) {
      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })
        if (ws[cellAddress]) {
          ws[cellAddress].s = sampleStyle
        }
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Work Items Template")

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Create response with proper headers
    const response = new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Work_Items_Import_Template.xlsx"',
        'Content-Length': buffer.length.toString()
      }
    })

    return response

  } catch (error) {
    console.error('Error generating Excel template:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate Excel template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}