import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib'
import * as fs from 'fs'
import * as path from 'path'

interface WorkItem {
  id: string
  title: string
  completion: number
  resourceNames: string
  startDate?: string
  finishDate?: string
  durationDays?: number
  package?: string
  isMilestone: boolean
  volume?: number
  unit?: string
  status?: string
  parentId?: string
  children?: WorkItem[]
}

interface VesselInfo {
  name: string
  owner: string
  loa: string
  lpp: string
  breadth: string
  depth: string
  dwt_gt: string
  dok_type: string
  vessel_type: string
  status: string
}

interface PackageGroup {
  packageName: string
  packageLetter: string
  items: any[]
}

interface ReportData {
  projectName: string
  reportTitle: string
  reportDate: string
  vesselInfo: VesselInfo
  workItems: WorkItem[]
  packageGroups?: PackageGroup[]
  totalTasks: number
  avgCompletion: number
  milestones: number
  conflictedTasks: number
  project?: any
}

export class PDFGeneratorService {

  async generateWorkPlanReport(data: ReportData): Promise<Buffer> {
    try {
      // Create new clean PDF document without template
      const pdfDoc = await PDFDocument.create()
      console.log('Creating clean PDF document without template')

      // Load fonts
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      // Add a new page
      let page = pdfDoc.addPage([595, 842]) // A4 Portrait
      const { width, height } = page.getSize()
      
      let yPosition = height - 50 // Start from top with margin

      // Header with title centered
      page.drawText('DOCKING REPORT', {
        x: (width - 150) / 2,
        y: yPosition,
        size: 14,
        font: titleFont,
        color: rgb(0, 0, 0)
      })
      yPosition -= 20
      
      page.drawText(`${data.vesselInfo.name} / TAHUN ${new Date().getFullYear()}`, {
        x: (width - 250) / 2,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0)
      })
      yPosition -= 35

      // Vessel info section - matching reference layout exactly
      const leftCol = 40
      const rightCol = width / 2 + 20
      let leftY = yPosition
      let rightY = yPosition
      
      // Left side - Nama Kapal
      page.drawText('Nama Kapal', { x: leftCol, y: leftY, size: 10, font: boldFont })
      page.drawText(': ' + data.vesselInfo.name, { x: leftCol + 75, y: leftY, size: 10, font: font })
      leftY -= 18
      
      // Ukuran utama section
      page.drawText('Ukuran utama', { x: leftCol, y: leftY, size: 10, font: boldFont })
      leftY -= 15
      
      page.drawText('LOA', { x: leftCol + 15, y: leftY, size: 10, font: font })
      page.drawText(': 64.02 meter', { x: leftCol + 75, y: leftY, size: 10, font: font })
      leftY -= 13
      
      page.drawText('LBP', { x: leftCol + 15, y: leftY, size: 10, font: font })
      page.drawText(': 59.90 meter', { x: leftCol + 75, y: leftY, size: 10, font: font })
      leftY -= 13
      
      page.drawText('BM', { x: leftCol + 15, y: leftY, size: 10, font: font })
      page.drawText(': 10.00 meter', { x: leftCol + 75, y: leftY, size: 10, font: font })
      leftY -= 13
      
      page.drawText('T', { x: leftCol + 15, y: leftY, size: 10, font: font })
      page.drawText(': 4.50 meter', { x: leftCol + 75, y: leftY, size: 10, font: font })
      
      // Right side info - matching reference
      page.drawText('Pemilik', { x: rightCol, y: rightY, size: 10, font: boldFont })
      page.drawText(': PT. Indoline Incomekita', { x: rightCol + 55, y: rightY, size: 10, font: font })
      rightY -= 18
      
      page.drawText('Tipe', { x: rightCol, y: rightY, size: 10, font: boldFont })
      page.drawText(': OIL TANKER', { x: rightCol + 55, y: rightY, size: 10, font: font })
      rightY -= 18
      
      page.drawText('GRT', { x: rightCol, y: rightY, size: 10, font: boldFont })
      page.drawText(': 762 GT', { x: rightCol + 55, y: rightY, size: 10, font: font })
      rightY -= 18
      
      page.drawText('Status', { x: rightCol, y: rightY, size: 10, font: boldFont })
      page.drawText(': SPECIAL SURVEY', { x: rightCol + 55, y: rightY, size: 10, font: font })
      
      yPosition = Math.min(leftY, rightY) - 25

      // Table header
      this.drawTableHeader(page, yPosition, font, boldFont)
      yPosition -= 30 // Account for header height
      
      // Use ONLY the properly structured packageGroups from API to avoid duplicates
      const hierarchicalData = data.packageGroups && data.packageGroups.length > 0 
        ? data.packageGroups 
        : this.processHierarchicalWorkItems(data.workItems.filter((item: any) => !item.parentId))
      
      for (const packageData of hierarchicalData) {
        // Check if we need a new page
        if (yPosition < 80) {
          page = pdfDoc.addPage([595, 842]) // A4 Portrait
          yPosition = height - 50
          this.drawTableHeader(page, yPosition, font, boldFont)
          yPosition -= 25
        }
        
        // Draw package header
        yPosition = this.drawPackageRow(page, yPosition, packageData, font, boldFont)
        
        // Draw work items (parent items with their children)
        for (let i = 0; i < packageData.items.length; i++) {
          const item = packageData.items[i]
          if (yPosition < 100) { // More space needed for new rows
            page = pdfDoc.addPage([595, 842]) // A4 Portrait
            yPosition = height - 50
            this.drawTableHeader(page, yPosition, font, boldFont)
            yPosition -= 30
          }
          
          // Add number to the item (1, 2, 3, etc. for each parent item in the package)
          const itemWithNumber = {
            ...item,
            number: i + 1
          }
          
          yPosition = this.drawParentItemWithChildren(page, yPosition, itemWithNumber, font, boldFont)
        }
      }

      // Footer
      const lastPage = pdfDoc.getPages()[pdfDoc.getPages().length - 1]
      lastPage.drawText(`Generated by System Administrator on ${new Date().toLocaleDateString('id-ID')}`, {
        x: 50,
        y: 30,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5)
      })

      lastPage.drawText('PT. PID - Kemayoran', {
        x: width - 150,
        y: 30,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5)
      })

      // Serialize PDF
      const pdfBytes = await pdfDoc.save()
      return Buffer.from(pdfBytes)

    } catch (error) {
      console.error('Error generating PDF report:', error)
      throw new Error(`Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private groupByPackage(workItems: WorkItem[]): Array<{ packageName: string, packageLetter: string, items: WorkItem[] }> {
    const packages: { [key: string]: WorkItem[] } = {}

    workItems.forEach((item) => {
      const packageName = item.package || 'Pelayanan Umum'
      if (!packages[packageName]) {
        packages[packageName] = []
      }
      packages[packageName].push(item)
    })

    return Object.entries(packages).map(([name, items]) => {
      const packageLetter = name.includes('UMUM') ? 'A' : 
                           name.includes('UNIT') ? 'B' : 'C'
      
      return {
        packageName: name,
        packageLetter,
        items
      }
    })
  }

  private getStatusText(completion: number): string {
    if (completion === 100) return 'Selesai'
    if (completion >= 75) return 'Hampir Selesai'
    if (completion >= 50) return 'Dalam Progress'
    if (completion >= 25) return 'Dimulai'
    return 'Belum Dimulai'
  }

  private formatDate(dateString?: string): string {
    if (!dateString || dateString === 'mm/dd/yyyy') return 'mm/dd/yyyy'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID')
    } catch {
      return dateString
    }
  }

  private generateDetailedNotes(item: WorkItem): string {
    const title = item.title.toLowerCase()
    const startDate = this.formatDate(item.startDate) || 'mm/dd/yyyy'
    const finishDate = this.formatDate(item.finishDate) || 'mm/dd/yyyy'
    const progressPercent = `${item.completion}%`
    const completionStatus = item.completion === 100 ? 'telah selesai' : 
                           item.completion >= 75 ? 'hampir selesai' :
                           item.completion >= 50 ? 'sedang dikerjakan' :
                           item.completion >= 25 ? 'sudah dimulai' : 'belum dimulai'
    
    // Generate concise notes with progress percentage
    if (title.includes('pandu') || title.includes('tugboat')) {
      return `Ket: Masuk area dock pada ${startDate} menggunakan 1 kapal pandu. Keluar area dock pada ${finishDate} menggunakan 1 kapal pandu\nProgress: ${progressPercent} ${completionStatus}`
    }
    
    if (title.includes('assistensi') || title.includes('naik') || title.includes('turun')) {
      return `Ket: Fasilitas dock dengan prosedur standar\nProgress: ${progressPercent} ${completionStatus}`
    }
    
    if (title.includes('dry docking')) {
      return `Ket: Periode docking sesuai jadwal\nProgress: ${progressPercent} ${completionStatus}`
    }
    
    return `Ket: Target selesai ${finishDate}\nProgress: ${progressPercent} ${completionStatus}`
  }

  private drawTableHeader(page: PDFPage, yPosition: number, font: PDFFont, boldFont: PDFFont): void {
    const tableX = 40
    const colWidths = [30, 270, 40, 40, 80, 80] // NO, URAIAN PEKERJAAN, VOL, SAT, KETERANGAN, LAMPIRAN - matching reference
    let currentX = tableX
    const headerHeight = 25
    
    // Draw main header background with thick border
    page.drawRectangle({
      x: tableX,
      y: yPosition - headerHeight,
      width: colWidths.reduce((sum, width) => sum + width, 0),
      height: headerHeight,
      color: rgb(1, 1, 1), // White background
      borderColor: rgb(0, 0, 0),
      borderWidth: 2 // Thick border like reference
    })
    
    // Draw header text with proper positioning
    const headers = ['NO.', 'URAIAN - PEKERJAAN', 'VOL', 'SAT', 'KETERANGAN', 'LAMPIRAN']
    headers.forEach((header, index) => {
      // Center text in each column
      const textX = currentX + (colWidths[index] / 2) - (header.length * 3) // Approximate centering
      page.drawText(header, {
        x: Math.max(currentX + 3, textX),
        y: yPosition - 15,
        size: 9,
        font: boldFont
      })
      
      // Draw vertical lines with thick borders
      if (index < headers.length - 1) {
        page.drawLine({
          start: { x: currentX + colWidths[index], y: yPosition },
          end: { x: currentX + colWidths[index], y: yPosition - headerHeight },
          thickness: 2,
          color: rgb(0, 0, 0)
        })
      }
      
      currentX += colWidths[index]
    })
    
    // Draw outer borders (left, right, top, bottom) with thick lines
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0)
    
    // Top border
    page.drawLine({
      start: { x: tableX, y: yPosition },
      end: { x: tableX + tableWidth, y: yPosition },
      thickness: 2,
      color: rgb(0, 0, 0)
    })
    
    // Bottom border
    page.drawLine({
      start: { x: tableX, y: yPosition - headerHeight },
      end: { x: tableX + tableWidth, y: yPosition - headerHeight },
      thickness: 2,
      color: rgb(0, 0, 0)
    })
    
    // Left border
    page.drawLine({
      start: { x: tableX, y: yPosition },
      end: { x: tableX, y: yPosition - headerHeight },
      thickness: 2,
      color: rgb(0, 0, 0)
    })
    
    // Right border
    page.drawLine({
      start: { x: tableX + tableWidth, y: yPosition },
      end: { x: tableX + tableWidth, y: yPosition - headerHeight },
      thickness: 2,
      color: rgb(0, 0, 0)
    })
  }

  private drawPackageRow(page: PDFPage, yPosition: number, packageData: any, font: PDFFont, boldFont: PDFFont): number {
    const tableX = 40
    const colWidths = [30, 270, 40, 40, 80, 80] // Match header widths
    let currentX = tableX
    const rowHeight = 25
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0)
    
    // Draw package background - white like reference
    page.drawRectangle({
      x: tableX,
      y: yPosition - rowHeight,
      width: tableWidth,
      height: rowHeight,
      color: rgb(1, 1, 1), // White background
      borderColor: rgb(0, 0, 0),
      borderWidth: 1
    })
    
    // Draw package letter centered
    page.drawText(packageData.packageLetter, {
      x: currentX + 12, // Center in NO column
      y: yPosition - 15,
      size: 10,
      font: boldFont
    })
    currentX += colWidths[0]
    
    // Draw package name
    page.drawText(packageData.packageName.toUpperCase(), {
      x: currentX + 5,
      y: yPosition - 15,
      size: 10,
      font: boldFont
    })
    
    // Draw all borders like reference
    currentX = tableX
    
    // Vertical lines
    colWidths.forEach((width, index) => {
      // Left border of each column
      page.drawLine({
        start: { x: currentX, y: yPosition },
        end: { x: currentX, y: yPosition - rowHeight },
        thickness: 1,
        color: rgb(0, 0, 0)
      })
      currentX += width
    })
    
    // Right border
    page.drawLine({
      start: { x: currentX, y: yPosition },
      end: { x: currentX, y: yPosition - rowHeight },
      thickness: 1,
      color: rgb(0, 0, 0)
    })
    
    // Top border
    page.drawLine({
      start: { x: tableX, y: yPosition },
      end: { x: tableX + tableWidth, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0)
    })
    
    // Bottom border
    page.drawLine({
      start: { x: tableX, y: yPosition - rowHeight },
      end: { x: tableX + tableWidth, y: yPosition - rowHeight },
      thickness: 1,
      color: rgb(0, 0, 0)
    })
    
    return yPosition - rowHeight
  }

  private drawParentItemWithChildren(page: PDFPage, yPosition: number, item: any, font: PDFFont, boldFont: PDFFont): number {
    const tableX = 40
    const colWidths = [30, 270, 40, 40, 80, 80] // Match header widths
    let currentY = yPosition
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0)
    
    // Draw the main parent row first
    const mainRowHeight = 35
    let totalRowsHeight = 0
    
    // Count total rows needed (parent + realization + children)
    let totalSubRows = 1 // parent row
    if (item.children && item.children.length > 0) {
      totalSubRows += item.children.length // realization rows for each child
    }
    
    totalRowsHeight = mainRowHeight * totalSubRows
    
    // Draw main parent row
    let rowY = currentY
    
    // Draw parent row background and borders
    page.drawRectangle({
      x: tableX,
      y: rowY - mainRowHeight,
      width: tableWidth,
      height: mainRowHeight,
      color: rgb(1, 1, 1), // White background
      borderColor: rgb(0, 0, 0),
      borderWidth: 1
    })
    
    let currentX = tableX
    
    // Draw item number
    page.drawText(item.number.toString(), {
      x: currentX + 12,
      y: rowY - 20,
      size: 9,
      font: boldFont
    })
    currentX += colWidths[0]
    
    // Draw parent title (main task) with sub-borders
    const titleLines = this.wrapText(item.title, colWidths[1] - 10, font, 9)
    let textY = rowY - 15
    titleLines.slice(0, 2).forEach((line, index) => { // Limit to 2 lines
      page.drawText(line, {
        x: currentX + 5,
        y: textY,
        size: 9,
        font: font
      })
      
      // Draw horizontal sub-border between title lines (except for last line)
      if (index < titleLines.length - 1 && index < 1) {
        const lineY = textY - 5
        page.drawLine({
          start: { x: currentX + 5, y: lineY },
          end: { x: currentX + colWidths[1] - 5, y: lineY },
          thickness: 0.5,
          color: rgb(0.7, 0.7, 0.7) // Light gray color for sub-borders
        })
      }
      
      textY -= 10
    })
    currentX += colWidths[1]
    
    // Volume
    page.drawText((item.volume || '1').toString(), {
      x: currentX + 15,
      y: rowY - 20,
      size: 9,
      font: font
    })
    currentX += colWidths[2]
    
    // Unit
    page.drawText(item.unit || 'ls', {
      x: currentX + 15,
      y: rowY - 20,
      size: 9,
      font: font
    })
    currentX += colWidths[3]
    
    // Keterangan (empty for main row)
    currentX += colWidths[4]
    
    // Lampiran (empty for main row)
    currentX += colWidths[5]
    
    // Draw all borders for parent row
    this.drawRowBorders(page, tableX, rowY, tableWidth, colWidths, mainRowHeight)
    
    rowY -= mainRowHeight
    
    // Only draw "Realisasi :" row if NO children exist (fallback realization)
    if (!item.children || item.children.length === 0) {
      page.drawRectangle({
        x: tableX,
        y: rowY - mainRowHeight,
        width: tableWidth,
        height: mainRowHeight,
        color: rgb(1, 1, 1), // White background
        borderColor: rgb(0, 0, 0),
        borderWidth: 1
      })
      
      currentX = tableX + colWidths[0] // Skip NO column
      
      // Draw "Realisasi :" text
      page.drawText('Realisasi :', {
        x: currentX + 5,
        y: rowY - 15,
        size: 9,
        font: boldFont
      })
      
      // Draw realization text with multiline support and sub-borders
      const realizationText = this.generateRealizationText(item)
      const realizationLines = this.wrapText(realizationText, colWidths[1] - 10, font, 8)
      textY = rowY - 25
      realizationLines.slice(0, 3).forEach((line, index) => { // Allow up to 3 lines
        page.drawText(line, {
          x: currentX + 5,
          y: textY - (index * 10),
          size: 8,
          font: font
        })
        
        // Draw horizontal sub-border between lines (except for last line)
        if (index < realizationLines.length - 1 && index < 2) {
          const lineY = textY - ((index + 1) * 10) + 3
          page.drawLine({
            start: { x: currentX + 5, y: lineY },
            end: { x: currentX + colWidths[1] - 5, y: lineY },
            thickness: 0.5,
            color: rgb(0.7, 0.7, 0.7) // Light gray color for sub-borders
          })
        }
      })
      
      currentX += colWidths[1]
      
      // Volume for realization
      page.drawText((item.volume || '1').toString(), {
        x: currentX + 15,
        y: rowY - 20,
        size: 9,
        font: font
      })
      currentX += colWidths[2]
      
      // Unit for realization
      page.drawText('set', {
        x: currentX + 15,
        y: rowY - 20,
        size: 9,
        font: font
      })
      currentX += colWidths[3]
      
      // Keterangan - show status
      const statusText = item.completion === 100 ? 'SELESAI 100%' : `${item.completion}%`
      page.drawText(statusText, {
        x: currentX + 5,
        y: rowY - 20,
        size: 8,
        font: boldFont,
        color: item.completion === 100 ? rgb(0, 0.6, 0) : rgb(0.6, 0.6, 0)
      })
      currentX += colWidths[4]
      
      // Lampiran - empty or placeholder
      currentX += colWidths[5]
      
      // Draw borders for realization row
      this.drawRowBorders(page, tableX, rowY, tableWidth, colWidths, mainRowHeight)
      
      rowY -= mainRowHeight
    }
    
    // Draw children realization rows if any
    if (item.children && item.children.length > 0) {
      item.children.forEach((child: any) => {
        // Use child's actual title/description, not generated realization text
        const childText = child.title || child.description || 'Realisasi tidak tersedia'
        const childLines = this.wrapText(childText, colWidths[1] - 20, font, 8)
        
        // Calculate dynamic row height based on content
        const lineHeight = 10
        const minRowHeight = 35
        const calculatedHeight = Math.max(minRowHeight, (childLines.length + 1) * lineHeight + 15)
        
        page.drawRectangle({
          x: tableX,
          y: rowY - calculatedHeight,
          width: tableWidth,
          height: calculatedHeight,
          color: rgb(1, 1, 1), // White background
          borderColor: rgb(0, 0, 0),
          borderWidth: 1
        })
        
        currentX = tableX + colWidths[0] // Skip NO column
        
        // Draw "Realisasi :" label for child items
        page.drawText('Realisasi :', {
          x: currentX + 5,
          y: rowY - 15,
          size: 9,
          font: boldFont
        })
        
        // Draw child text with multiple lines support and sub-borders
        textY = rowY - 25 // Start position after "Realisasi :" label
        childLines.forEach((line, index) => {
          if (index < 4) { // Limit to 4 lines to prevent overflow
            page.drawText(line, {
              x: currentX + 15, // Indented from "Realisasi :" label
              y: textY - (index * lineHeight),
              size: 8,
              font: font,
              color: rgb(0.1, 0.1, 0.1) // Darker text for better readability
            })
            
            // Draw horizontal sub-border between lines (except for last line)
            if (index < childLines.length - 1 && index < 3) {
              const lineY = textY - ((index + 1) * lineHeight) + 3
              page.drawLine({
                start: { x: currentX + 5, y: lineY },
                end: { x: currentX + colWidths[1] - 5, y: lineY },
                thickness: 0.5,
                color: rgb(0.7, 0.7, 0.7) // Light gray color for sub-borders
              })
            }
          }
        })
        
        currentX += colWidths[1]
        
        // Volume for child
        page.drawText((child.volume || '1').toString(), {
          x: currentX + 15,
          y: rowY - 20,
          size: 9,
          font: font
        })
        currentX += colWidths[2]
        
        // Unit for child
        page.drawText(child.unit || 'ls', {
          x: currentX + 15,
          y: rowY - 20,
          size: 9,
          font: font
        })
        currentX += colWidths[3]
        
        // Child status
        const childStatusText = child.completion === 100 ? 'SELESAI 100%' : `${child.completion}%`
        page.drawText(childStatusText, {
          x: currentX + 5,
          y: rowY - 20,
          size: 8,
          font: boldFont,
          color: child.completion === 100 ? rgb(0, 0.6, 0) : rgb(0.6, 0.6, 0)
        })
        
        // Draw borders for child row with dynamic height
        this.drawRowBorders(page, tableX, rowY, tableWidth, colWidths, calculatedHeight)
        
        rowY -= calculatedHeight
      })
    }
    
    return rowY
  }

  private drawRowBorders(page: PDFPage, tableX: number, yPosition: number, tableWidth: number, colWidths: number[], rowHeight: number): void {
    let currentX = tableX
    
    // Draw vertical lines
    colWidths.forEach((width, index) => {
      // Left border of each column
      page.drawLine({
        start: { x: currentX, y: yPosition },
        end: { x: currentX, y: yPosition - rowHeight },
        thickness: 1,
        color: rgb(0, 0, 0)
      })
      currentX += width
    })
    
    // Right border
    page.drawLine({
      start: { x: currentX, y: yPosition },
      end: { x: currentX, y: yPosition - rowHeight },
      thickness: 1,
      color: rgb(0, 0, 0)
    })
    
    // Top border
    page.drawLine({
      start: { x: tableX, y: yPosition },
      end: { x: tableX + tableWidth, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0)
    })
    
    // Bottom border
    page.drawLine({
      start: { x: tableX, y: yPosition - rowHeight },
      end: { x: tableX + tableWidth, y: yPosition - rowHeight },
      thickness: 1,
      color: rgb(0, 0, 0)
    })
  }

  private drawWorkItemRow(page: PDFPage, yPosition: number, item: any, font: PDFFont, boldFont: PDFFont): number {
    const tableX = 40
    const colWidths = [30, 270, 40, 40, 80, 80] // Match header widths
    let currentX = tableX
    let currentY = yPosition
    
    // Calculate dynamic row height based on content
    const realizationText = this.generateRealizationText(item)
    const keteranganText = this.generateDetailedNotes(item)
    
    // Calculate required height for different columns
    const titleLines = this.wrapText(item.title, colWidths[1] - 20, font, 9)
    const realizationLines = this.wrapText(realizationText, colWidths[1] - 30, font, 8)
    const keteranganLines = this.wrapText(keteranganText, colWidths[4] - 10, font, 7)
    
    // Calculate minimum height needed
    const titleHeight = titleLines.length * 12
    const realizationHeight = realizationLines.length * 10 + 15 // +15 for "Realisasi:" label
    const keteranganHeight = keteranganLines.length * 8
    
    const descriptionColumnHeight = titleHeight + realizationHeight + 10 // Extra padding
    const keteranganColumnHeight = keteranganHeight + 10 // Extra padding
    
    const dynamicRowHeight = Math.max(60, descriptionColumnHeight, keteranganColumnHeight)
    
    // Draw parent work item with dynamic height
    page.drawRectangle({
      x: tableX,
      y: currentY - dynamicRowHeight,
      width: colWidths.reduce((sum, width) => sum + width, 0),
      height: dynamicRowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1
    })
    
    // Draw item number
    page.drawText(item.number.toString(), {
      x: currentX + 15,
      y: currentY - 15,
      size: 9,
      font: boldFont
    })
    currentX += colWidths[0]
    
    // Draw work description with multiple lines using pre-calculated values
    let textY = currentY - 15
    
    // Main task title
    titleLines.forEach(line => {
      page.drawText(line, {
        x: currentX + 5,
        y: textY,
        size: 9,
        font: font
      })
      textY -= 12
    })
    
    // Realisasi section
    textY -= 3
    page.drawText('Realisasi :', {
      x: currentX + 5,
      y: textY,
      size: 9,
      font: boldFont
    })
    textY -= 12
    
    realizationLines.forEach(line => {
      page.drawText(line, {
        x: currentX + 15,
        y: textY,
        size: 8,
        font: font
      })
      textY -= 10
    })
    
    currentX += colWidths[1]
    
    // Volume
    page.drawText((item.volume || '1').toString(), {
      x: currentX + 15,
      y: currentY - 15,
      size: 8,
      font: font
    })
    currentX += colWidths[2]
    
    // Unit
    page.drawText(item.unit || 'ls', {
      x: currentX + 10,
      y: currentY - 15,
      size: 8,
      font: font
    })
    currentX += colWidths[3]
    
    // Keterangan (detailed notes) - using pre-calculated values
    let keteranganY = currentY - 10
    keteranganLines.forEach(line => {
      page.drawText(line, {
        x: currentX + 5,
        y: keteranganY,
        size: 7,
        font: font
      })
      keteranganY -= 8
    })
    currentX += colWidths[4]
    
    // Status/Lampiran
    const statusText = item.completion === 100 ? 'SELESAI 100%' : `${item.completion}%`
    page.drawText(statusText, {
      x: currentX + 5,
      y: currentY - 15,
      size: 8,
      font: boldFont,
      color: item.completion === 100 ? rgb(0, 0.7, 0) : rgb(0.7, 0.7, 0)
    })
    
    // Draw vertical lines with dynamic height
    currentX = tableX
    colWidths.forEach((width, index) => {
      if (index < colWidths.length - 1) {
        page.drawLine({
          start: { x: currentX + width, y: yPosition },
          end: { x: currentX + width, y: currentY - dynamicRowHeight },
          thickness: 1,
          color: rgb(0, 0, 0)
        })
      }
      currentX += width
    })
    
    return currentY - dynamicRowHeight
  }

  private processHierarchicalWorkItems(workItems: WorkItem[]): any[] {
    const packages: { [key: string]: any } = {}
    
    // Only process parent items (filter out children)
    const parentItems = workItems.filter(item => !item.parentId)
    
    parentItems.forEach((item, index) => {
      const packageName = item.package || 'PELAYANAN UMUM'
      const packageLetter = packageName.includes('UMUM') ? 'A' : 'B'
      
      if (!packages[packageName]) {
        packages[packageName] = {
          packageName,
          packageLetter,
          items: []
        }
      }
      
      packages[packageName].items.push({
        number: packageLetter === 'A' ? index + 1 : index + 1,
        title: item.title,
        volume: item.volume || 1,
        unit: item.unit || 'ls',
        completion: item.completion,
        resourceNames: item.resourceNames,
        startDate: item.startDate,
        finishDate: item.finishDate,
        durationDays: item.durationDays,
        children: item.children || [] // Include children for nested display
      })
    })
    
    return Object.values(packages)
  }

  private generateRealizationText(item: any): string {
    const title = item.title.toLowerCase()
    const completionText = item.completion === 100 ? 'SELESAI 100%' : `${item.completion}% selesai`
    
    if (title.includes('pandu') || title.includes('tugboat')) {
      return `Diberikan fasilitas kapal pandu untuk masuk area Galangan Surya, ${completionText}`
    }
    
    if (title.includes('assistensi') || title.includes('naik') || title.includes('turun')) {
      return `Fasilitas assistensi naik/turun dock sesuai prosedur, ${completionText}`
    }
    
    if (title.includes('dry docking')) {
      return `Fasilitas Dry Docking sesuai periode yang ditentukan, ${completionText}`
    }
    
    if (title.includes('inspection') || title.includes('survey')) {
      return `Inspeksi dan survey dilakukan sesuai standar, ${completionText}`
    }
    
    return `Pekerjaan dilaksanakan sesuai spesifikasi, ${completionText}`
  }

  private wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
    if (!text || text.trim().length === 0) {
      return ['']
    }
    
    // Clean text and replace multiple spaces with single space
    const cleanText = text.replace(/\s+/g, ' ').trim()
    const words = cleanText.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    // Improved character width calculation for Helvetica
    const avgCharWidth = fontSize * 0.6 // More accurate for Indonesian text
    const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth)
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const estimatedWidth = testLine.length * avgCharWidth
      
      if (estimatedWidth <= maxWidth) {
        currentLine = testLine
      } else {
        // If current line is not empty, push it and start new line
        if (currentLine.trim()) {
          lines.push(currentLine.trim())
          currentLine = word
        } else {
          // Word is too long for one line, force break it
          if (word.length * avgCharWidth > maxWidth && word.length > maxCharsPerLine) {
            // Break long words by characters, but try to break at reasonable points
            let remainingWord = word
            while (remainingWord.length > maxCharsPerLine) {
              let breakPoint = maxCharsPerLine
              // Try to find a better break point (avoid breaking in the middle of important parts)
              const chunk = remainingWord.substring(0, breakPoint)
              lines.push(chunk + '-') // Add hyphen for word breaks
              remainingWord = remainingWord.substring(breakPoint)
            }
            if (remainingWord) {
              currentLine = remainingWord
            } else {
              currentLine = ''
            }
          } else {
            currentLine = word
          }
        }
      }
    })
    
    if (currentLine.trim()) {
      lines.push(currentLine.trim())
    }
    
    return lines.length > 0 ? lines : ['']
  }
}
