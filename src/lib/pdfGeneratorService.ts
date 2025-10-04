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

interface ReportData {
  projectName: string
  reportTitle: string
  reportDate: string
  vesselInfo: VesselInfo
  workItems: WorkItem[]
  totalTasks: number
  avgCompletion: number
  milestones: number
  conflictedTasks: number
  project?: any
}

export class PDFGeneratorService {
  private async loadTemplate(): Promise<PDFDocument | null> {
    const templatePath = path.join(process.cwd(), 'public', 'kopsurat', 'Kop Surat PT PID - Kemayoran.pdf')
    
    try {
      if (fs.existsSync(templatePath)) {
        const templateBytes = fs.readFileSync(templatePath)
        return await PDFDocument.load(templateBytes)
      }
    } catch (error) {
      console.log('Could not load PDF template:', error.message)
    }
    
    return null
  }

  async generateWorkPlanReport(data: ReportData): Promise<Buffer> {
    try {
      // Try to load existing PDF template first
      let pdfDoc = await this.loadTemplate()
      
      if (!pdfDoc) {
        // Create new PDF document if template not found
        pdfDoc = await PDFDocument.create()
        console.log('Created new PDF document as no template was found')
      } else {
        console.log('Using existing PDF template')
      }

      // Load fonts
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      // Add a new page for content (or use existing if template has pages)
      let page: PDFPage
      if (pdfDoc.getPages().length > 0) {
        page = pdfDoc.getPages()[0] // Use first page if template exists
      } else {
        page = pdfDoc.addPage([595, 842]) // A4 size
      }

      const { width, height } = page.getSize()
      let yPosition = height - 150 // Start below header area

      // Add title if no template or template is blank
      if (pdfDoc.getPages().length <= 1) {
        // Add company header
        page.drawText('PT. PID - KEMAYORAN', {
          x: 50,
          y: height - 50,
          size: 16,
          font: boldFont,
          color: rgb(0, 0, 0.8)
        })
        
        page.drawText('AMANAH KOMPETENSI MEMBANGUN', {
          x: 50,
          y: height - 70,
          size: 10,
          font: font,
          color: rgb(0.3, 0.3, 0.3)
        })
        
        page.drawText('LOYAL ADAPTIF KOLABORATIF', {
          x: 50,
          y: height - 85,
          size: 10,
          font: font,
          color: rgb(0.3, 0.3, 0.3)
        })
        
        // Add separator line
        page.drawLine({
          start: { x: 50, y: height - 100 },
          end: { x: width - 50, y: height - 100 },
          thickness: 2,
          color: rgb(0, 0, 0.8)
        })
      }

      // Report title
      page.drawText(data.reportTitle || 'WORK PLAN & PROGRESS REPORT', {
        x: 50,
        y: yPosition,
        size: 14,
        font: titleFont,
        color: rgb(0, 0, 0)
      })
      yPosition -= 30

      // Project and vessel info
      page.drawText(`Project: ${data.projectName}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0)
      })
      yPosition -= 20

      page.drawText(`Vessel: ${data.vesselInfo.name}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0)
      })
      yPosition -= 20

      page.drawText(`Report Date: ${data.reportDate}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0)
      })
      yPosition -= 40

      // Vessel Information Section
      page.drawText('VESSEL INFORMATION', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0.8)
      })
      yPosition -= 20

      const vesselDetails = [
        `Owner: ${data.vesselInfo.owner}`,
        `LOA: ${data.vesselInfo.loa}`,
        `LPP: ${data.vesselInfo.lpp}`,
        `Breadth: ${data.vesselInfo.breadth}`,
        `Depth: ${data.vesselInfo.depth}`,
        `DWT/GT: ${data.vesselInfo.dwt_gt}`,
        `Dock Type: ${data.vesselInfo.dok_type}`,
        `Vessel Type: ${data.vesselInfo.vessel_type}`,
        `Status: ${data.vesselInfo.status}`
      ]

      vesselDetails.forEach((detail) => {
        page.drawText(detail, {
          x: 70,
          y: yPosition,
          size: 9,
          font: font,
          color: rgb(0, 0, 0)
        })
        yPosition -= 15
      })
      
      yPosition -= 20

      // Statistics Section
      page.drawText('PROJECT STATISTICS', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0.8)
      })
      yPosition -= 20

      const stats = [
        `Total Tasks: ${data.totalTasks}`,
        `Average Completion: ${data.avgCompletion}%`,
        `Milestones: ${data.milestones}`,
        `Conflicted Tasks: ${data.conflictedTasks}`
      ]

      stats.forEach((stat) => {
        page.drawText(stat, {
          x: 70,
          y: yPosition,
          size: 9,
          font: font,
          color: rgb(0, 0, 0)
        })
        yPosition -= 15
      })
      
      yPosition -= 30

      // Work Items Section
      page.drawText('WORK ITEMS DETAILS', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0.8)
      })
      yPosition -= 20

      // Group items by package
      const packageGroups = this.groupByPackage(data.workItems)

      packageGroups.forEach((packageGroup) => {
        // Check if we need a new page
        if (yPosition < 100) {
          page = pdfDoc.addPage([595, 842])
          yPosition = height - 50
        }

        // Package header
        page.drawText(`${packageGroup.packageName}:`, {
          x: 50,
          y: yPosition,
          size: 11,
          font: boldFont,
          color: rgb(0.2, 0.2, 0.8)
        })
        yPosition -= 20

        packageGroup.items.forEach((item, index) => {
          // Check if we need a new page
          if (yPosition < 80) {
            page = pdfDoc.addPage([595, 842])
            yPosition = height - 50
          }

          const itemNumber = packageGroup.packageLetter === 'A' ? 
            String.fromCharCode(65 + index) : (index + 1).toString()

          // Item header
          page.drawText(`${itemNumber}. ${item.title}`, {
            x: 70,
            y: yPosition,
            size: 10,
            font: boldFont,
            color: rgb(0, 0, 0)
          })
          yPosition -= 15

          // Item details
          const details = [
            `Progress: ${item.completion}% - ${this.getStatusText(item.completion)}`,
            `Duration: ${item.durationDays || 1} days`,
            `Resources: ${item.resourceNames}`,
            `Volume: ${item.volume || ''} ${item.unit || ''}`.trim(),
            `Dates: ${this.formatDate(item.startDate)} - ${this.formatDate(item.finishDate)}`
          ]

          details.forEach((detail) => {
            if (detail.trim()) {
              page.drawText(`   ${detail}`, {
                x: 90,
                y: yPosition,
                size: 8,
                font: font,
                color: rgb(0.3, 0.3, 0.3)
              })
              yPosition -= 12
            }
          })

          // Add realization notes
          const notes = this.generateDetailedNotes(item)
          if (notes) {
            const noteLines = notes.split('\n')
            noteLines.forEach((line) => {
              if (line.trim()) {
                page.drawText(`   ${line}`, {
                  x: 90,
                  y: yPosition,
                  size: 8,
                  font: font,
                  color: rgb(0.5, 0.5, 0.5)
                })
                yPosition -= 10
              }
            })
          }

          yPosition -= 10
        })

        yPosition -= 20
      })

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
      throw new Error(`Failed to generate PDF report: ${error.message}`)
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
    const startDate = this.formatDate(item.startDate) || '23 Agustus 2025'
    const finishDate = this.formatDate(item.finishDate) || '07 September 2025'
    
    // Khusus untuk task yang berhubungan dengan kapal pandu dan docking
    if (title.includes('pandu') || title.includes('tugboat') || 
        (title.includes('dock') && !title.includes('report'))) {
      return `Ket: Masuk area dock pada ${startDate} menggunakan 1 kapal pandu. 
Naik dock pada ${startDate} menggunakan 1 kapal pandu. 
Kapal turun dock pada ${finishDate} menggunakan 1 kapal pandu. 
Keluar area dock pada ${finishDate} menggunakan 1 kapal pandu`
    }
    
    // Untuk dry docking dengan periode spesifik
    if (title.includes('dry docking')) {
      return `Ket: Kapal naik dock tanggal ${startDate}. 
Kapal turun dock tanggal ${finishDate}. 
Total periode dry docking: ${item.durationDays || 16} hari. 
Fasilitas dock tersedia 24 jam`
    }
    
    // Untuk hull work dengan detail measurement
    if (title.includes('skrap') || title.includes('blast') || title.includes('pengecatan')) {
      const volume = item.volume || 750
      const unit = item.unit || 'm²'
      return `Ket: Area kerja: ${volume} ${unit}. 
Progress saat ini: ${item.completion}%. 
Resource: ${item.resourceNames || 'Hull Team'}. 
Target selesai: ${finishDate}`
    }
    
    // Untuk docking report
    if (title.includes('report') || title.includes('laporan')) {
      return `Ket: Report dibuat dalam 6 set. 
Format sesuai standar galangan. 
Dilengkapi dokumentasi foto. 
Diserahkan pada ${finishDate}`
    }
    
    // Default untuk task lainnya
    if (item.completion === 100) {
      return `Ket: Task telah selesai 100% pada ${finishDate}. 
Resource: ${item.resourceNames || 'Team'}. 
Durasi actual: ${item.durationDays || 1} hari. Status: COMPLETED`
    } else if (item.completion > 0) {
      return `Ket: Progress saat ini: ${item.completion}%. 
Resource: ${item.resourceNames || 'Team'}. 
Target selesai: ${finishDate}. Status: DALAM PROGRESS`
    }
    
    return `Ket: Task belum dimulai. Jadwal mulai: ${startDate}. 
Resource dialokasikan: ${item.resourceNames || 'Team'}. Status: PLANNED`
  }
}