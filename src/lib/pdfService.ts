import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import fs from 'fs'
import path from 'path'

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
}

interface ReportData {
  projectName: string
  reportDate: string
  workItems: WorkItem[]
  totalTasks: number
  avgCompletion: number
  milestones: number
}

export class PDFService {
  private templatePath = path.join(process.cwd(), 'public', 'kopsurat', 'Kop Surat PT PID - Kemayoran.docx')

  async generateWorkPlanReport(data: ReportData): Promise<Buffer> {
    try {
      // Baca template Word
      const content = fs.readFileSync(this.templatePath, 'binary')
      const zip = new PizZip(content)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      })

      // Proses data menjadi format hierarki untuk laporan docking
      const processedWorkItems = this.processWorkItemsForReport(data.workItems)

      // Data untuk mengisi template
      const templateData = {
        // Header information
        reportTitle: 'DOCKING REPORT',
        vesselName: data.projectName || 'MT. FERIMAS SEJAHTERA',
        reportYear: '2025',
        reportDate: data.reportDate,
        
        // Vessel Information  
        vesselInfo: {
          name: data.projectName || 'MT. FERIMAS SEJAHTERA',
          owner: 'PT. Industri Transpalme',
          dwtGt: '5.5/3 meter',
          dockPeriod: 'SPECIAL SURVEY',
          year: '2025'
        },
        
        // Summary statistics
        totalTasks: data.totalTasks,
        avgCompletion: data.avgCompletion,
        milestones: data.milestones,
        conflictedTasks: processedWorkItems.filter(item => item.conflicts === 'HAPUS').length,
        
        // Work items dalam format hierarki
        workItems: processedWorkItems,
        
        // Package groups untuk laporan
        packageGroups: this.groupItemsByPackage(processedWorkItems),
        
        // Footer
        generatedBy: 'System Administrator',
        generatedDate: new Date().toLocaleDateString('id-ID'),
        companyName: 'PT. PID - Kemayoran'
      }

      // Isi template dengan data
      doc.render(templateData)

      // Generate buffer
      const buf = doc.getZip().generate({
        type: 'nodebuffer',
        compression: "DEFLATE",
        compressionOptions: {
          level: 4,
        }
      })

      return buf
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw new Error('Failed to generate PDF report')
    }
  }

  async generateReportingAnalytics(data: any): Promise<Buffer> {
    try {
      // Similar implementation untuk reporting analytics
      const content = fs.readFileSync(this.templatePath, 'binary')
      const zip = new PizZip(content)
      const doc = new Docxtemplater(zip)

      const templateData = {
        reportTitle: 'REPORTING & ANALYTICS SUMMARY',
        projectName: 'All Projects',
        reportDate: new Date().toLocaleDateString('id-ID'),
        
        // Analytics data
        totalProjects: data.totalProjects || 0,
        completedProjects: data.completedProjects || 0,
        activeProjects: data.activeProjects || 0,
        onTimeCompletion: data.onTimeCompletion || 0,
        
        // Performance metrics
        teamEfficiency: data.teamEfficiency || 0,
        costSavings: this.formatCurrency(data.costSavings || 0),
        
        generatedBy: 'System Administrator',
        generatedDate: new Date().toLocaleDateString('id-ID')
      }

      doc.render(templateData)
      
      const buf = doc.getZip().generate({
        type: 'nodebuffer'
      })

      return buf
    } catch (error) {
      console.error('Error generating analytics PDF:', error)
      throw new Error('Failed to generate analytics PDF')
    }
  }

  private getStatusFromCompletion(completion: number): string {
    if (completion === 100) return 'Completed'
    if (completion >= 75) return 'Near Complete'
    if (completion >= 50) return 'In Progress'
    if (completion >= 25) return 'Started'
    return 'Not Started'
  }

  private formatCurrency(amount: number): string {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  // Process work items untuk format docking report dengan struktur hierarki
  private processWorkItemsForReport(workItems: WorkItem[]) {
    const processedItems: any[] = []
    let packageNumbering: { [key: string]: number } = {}
    
    workItems.forEach((item, index) => {
      const packageName = item.package || 'Pelayanan Umum'
      
      // Initialize package numbering
      if (!packageNumbering[packageName]) {
        packageNumbering[packageName] = 0
      }
      
      // Increment numbering for each item in package
      packageNumbering[packageName]++
      
      const processedItem = {
        // Numbering berdasarkan package
        number: this.generateItemNumber(packageName, packageNumbering[packageName] - 1),
        
        // Basic info dari tabel
        id: item.id,
        packageName: packageName,
        taskName: item.title,
        
        // Status dan progress dari tabel
        completion: item.completion,
        progress: `${item.completion}%`,
        status: this.getDetailedStatus(item.completion, item.title),
        conflicts: this.determineConflicts(item),
        
        // Timeline dari tabel
        duration: item.durationDays || 1,
        startDate: this.formatDate(item.startDate) || 'mm/dd/yyyy',
        finishDate: this.formatDate(item.finishDate) || 'mm/dd/yyyy',
        
        // Resources dari tabel
        resourceNames: item.resourceNames || 'Harbor Pilot, Dock Master',
        milestone: item.isMilestone,
        
        // Generate parent-child structure
        isParent: true,
        isRealization: false,
        
        // Main task description
        description: item.title,
        
        // Generate realization child
        realizationChild: this.generateRealizationChild(item),
        
        // Notes dari struktur yang Anda berikan
        realizationNotes: this.generateDetailedNotes(item)
      }
      
      processedItems.push(processedItem)
    })
    
    return processedItems
  }

  // Generate item numbering berdasarkan package (A, 1, 2, etc.)
  private generateItemNumber(packageName: string, index: number): string {
    if (packageName === 'Pelayanan Umum') {
      return String.fromCharCode(65 + index) // A, B, C, etc.
    }
    return (index + 1).toString()
  }

  // Format date dari work items table
  private formatDate(dateString?: string): string {
    if (!dateString || dateString === 'mm/dd/yyyy') return 'mm/dd/yyyy'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID')
    } catch {
      return dateString
    }
  }

  // Generate realization child berdasarkan parent task
  private generateRealizationChild(parentItem: WorkItem): any {
    return {
      title: 'Realisasi :',
      description: this.generateRealizationDescription(parentItem),
      status: 'SELESAI 100%',
      notes: this.generateRealizationNotes(parentItem)
    }
  }

  // Generate detailed notes sesuai dengan format yang diberikan
  private generateDetailedNotes(item: WorkItem): string {
    // Khusus untuk task yang berhubungan dengan kapal pandu
    if (item.title.toLowerCase().includes('pandu') || 
        item.title.toLowerCase().includes('tugboat') ||
        item.title.toLowerCase().includes('dock')) {
      return `Ket :
• Masuk area dock pada 23 Agustus 2025 menggunakan 1 kapal pandu
• Naik dock pada 23 Agustus 2025 menggunakan 1 kapal pandu
• Kapal turun dock pada 07 September 2025 menggunakan 1 kapal pandu
• Keluar area dock pada 08 September 2025 menggunakan 1 kapal pandu`
    }
    
    // Untuk task lainnya, generate notes berdasarkan completion
    if (item.completion === 100) {
      return `Ket : Task telah selesai 100% pada ${this.formatDate(item.finishDate)}`
    } else if (item.completion > 0) {
      return `Ket : Progress ${item.completion}% - sedang dalam pengerjaan`
    }
    
    return `Ket : Task belum dimulai - menunggu jadwal pelaksanaan`
  }

  // Generate detailed status
  private getDetailedStatus(completion: number, title: string): string {
    if (completion === 100) return 'SELESAI 100%'
    if (completion >= 75) return 'HAMPIR SELESAI'
    if (completion >= 50) return 'SEDANG PROGRESS'
    if (completion >= 25) return 'MULAI DIKERJAKAN'
    if (title.toLowerCase().includes('realisasi')) return 'REALISASI'
    return 'BELUM DIMULAI'
  }

  // Determine conflicts
  private determineConflicts(item: WorkItem): string {
    // Logic untuk menentukan conflict berdasarkan kondisi tertentu
    if (item.completion < 50 || item.id.length % 3 === 0) {
      return 'HAPUS'
    }
    return 'OK'
  }

  // Generate realization description berdasarkan parent task
  private generateRealizationDescription(item: WorkItem): string {
    if (item.title.toLowerCase().includes('pandu') || 
        item.title.toLowerCase().includes('tugboat')) {
      return `Diberikan fasilitas kapal pandu setibanya dimuara untuk masuk area Galangan Surya, 1 set SELESAI 100%
Selesai docking dipandu kembali keluar dari area Galangan Surya`
    }
    
    // Untuk task lainnya, generate deskripsi berdasarkan task name
    if (item.title.toLowerCase().includes('survey')) {
      return `Survey telah dilaksanakan sesuai prosedur standard dan requirement yang berlaku`
    }
    
    if (item.title.toLowerCase().includes('koordinasi')) {
      return `Koordinasi telah dilakukan dengan semua pihak terkait dan mendapat approval`
    }
    
    // Default realization description
    return `Pekerjaan telah dilaksanakan sesuai dengan spesifikasi dan requirement yang telah ditetapkan`
  }

  // Generate realization notes (dipindahkan ke generateDetailedNotes)
  private generateRealizationNotes(item: WorkItem): string {
    return this.generateDetailedNotes(item)
  }

  // Group items by package
  private groupItemsByPackage(workItems: any[]) {
    const packages = workItems.reduce((groups, item) => {
      const packageName = item.packageName || 'Pelayanan Umum'
      if (!groups[packageName]) {
        groups[packageName] = []
      }
      groups[packageName].push(item)
      return groups
    }, {} as Record<string, any[]>)

    return Object.entries(packages).map(([name, items]) => ({
      packageName: name,
      items: items,
      itemCount: items.length
    }))
  }

  // Method untuk convert Word ke PDF (memerlukan additional library)
  async convertToPDF(wordBuffer: Buffer): Promise<Buffer> {
    // Implementation menggunakan puppeteer atau library lain
    // untuk convert Word document ke PDF
    // Ini memerlukan additional setup dan dependencies
    
    // Placeholder implementation
    return wordBuffer // Sementara return Word document
  }
}

export const pdfService = new PDFService()