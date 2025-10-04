import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
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
  packageGroups: PackageGroup[]
  totalTasks: number
  avgCompletion: number
  milestones: number
  conflictedTasks: number
  project?: any
}

export class PDFService {
  private templatePath = path.join(process.cwd(), 'public', 'kopsurat', 'Kop Surat PT PID - Kemayoran.docx')

  async generateWorkPlanReport(data: ReportData): Promise<Buffer> {
    try {
      // Check if template file exists and has content
      let content: string
      if (fs.existsSync(this.templatePath)) {
        content = fs.readFileSync(this.templatePath, 'binary')
        // Check if template is too small (likely empty)
        if (content.length < 1000) {
          console.log('Template file too small, creating new template with content...')
          content = this.createSimpleDocxTemplate()
        }
      } else {
        console.log('Template file not found, creating new template...')
        content = this.createSimpleDocxTemplate()
      }
      
      const zip = new PizZip(content)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: '{',
          end: '}'
        }
      })

      // Siapkan work items untuk template (format sederhana)
      const workItemsForTemplate = data.workItems.map((item, index) => {
        const packageLetter = item.package === 'PELAYANAN UMUM' ? 'A' : 'B'
        const number = packageLetter === 'A' ? String.fromCharCode(65 + index) : (index + 1).toString()
        
        return {
          id: item.id,
          number: number,
          taskName: item.title || 'Unnamed Task',
          progress: `${item.completion || 0}%`,
          resources: item.resourceNames || 'Team',
          startDate: this.formatDate(item.startDate) || '-',
          finishDate: this.formatDate(item.finishDate) || '-',
          duration: `${item.durationDays || 1} hari`,
          package: item.package || 'Pelayanan Umum',
          milestone: item.isMilestone ? 'Ya' : 'Tidak',
          status: this.getStatusText(item.completion || 0),
          volume: item.volume || '',
          unit: item.unit || '',
          description: item.title || 'Unnamed Task'
        }
      })

      // Data untuk mengisi template Word yang sudah ada
      const templateData = {
        // Header information
        reportTitle: 'WORK PLAN & PROGRESS REPORT',
        projectName: data.projectName || 'Proyek Docking',
        vesselName: data.vesselInfo.name,
        reportDate: data.reportDate,
        reportYear: new Date().getFullYear().toString(),
        
        // Vessel Information
        vesselInfo: {
          name: data.vesselInfo.name,
          owner: data.vesselInfo.owner,
          loa: data.vesselInfo.loa,
          lpp: data.vesselInfo.lpp,
          breadth: data.vesselInfo.breadth,
          depth: data.vesselInfo.depth,
          dwtGt: data.vesselInfo.dwt_gt,
          dokType: data.vesselInfo.dok_type,
          vesselType: data.vesselInfo.vessel_type,
          dockPeriod: data.vesselInfo.status
        },
        
        // Summary statistics
        totalTasks: data.totalTasks,
        avgCompletion: data.avgCompletion,
        milestones: data.milestones,
        conflictedTasks: data.conflictedTasks,
        
        // Work items untuk loop dalam template
        workItems: workItemsForTemplate,
        
        // Footer
        generatedBy: 'System Administrator',
        generatedDate: new Date().toLocaleDateString('id-ID'),
        companyName: 'PT. PID - Kemayoran'
      }

      console.log('Template data for existing Word template:', {
        reportTitle: templateData.reportTitle,
        projectName: templateData.projectName,
        vesselName: templateData.vesselName,
        workItemsCount: workItemsForTemplate.length,
        firstItem: workItemsForTemplate[0],
        templateContentCheck: content.length > 0 ? 'Template loaded' : 'Template empty',
        templateSize: content.length
      })
      
      console.log('Full template data structure:', {
        vesselInfo: templateData.vesselInfo,
        statistics: {
          totalTasks: templateData.totalTasks,
          avgCompletion: templateData.avgCompletion,
          milestones: templateData.milestones,
          conflictedTasks: templateData.conflictedTasks
        },
        workItemsPreview: workItemsForTemplate.slice(0, 2)
      })

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
      console.error('Error generating report:', error)
      console.error('Error details:', error)
      throw new Error(`Failed to generate report: ${error.message}`)
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

  private getStatusText(completion: number): string {
    if (completion === 100) return 'Selesai'
    if (completion >= 75) return 'Hampir Selesai'
    if (completion >= 50) return 'Dalam Progress'
    if (completion >= 25) return 'Dimulai'
    return 'Belum Dimulai'
  }

  // Process package groups yang sudah diproses dari API
  private processPackageGroups(packageGroups: PackageGroup[]) {
    return packageGroups.map(packageGroup => {
      return {
        packageName: packageGroup.packageName,
        packageLetter: packageGroup.packageLetter,
        items: packageGroup.items.map((item, index) => {
          return {
            // Generate numbering berdasarkan package
            number: this.generatePackageItemNumber(packageGroup.packageLetter, index),
            
            // Basic information dari work items table
            id: item.id,
            taskName: this.splitLongText(item.title, 50), // Split long text untuk readability
            
            // Volume dan unit dari table
            volume: item.volume || 1,
            unit: item.unit || 'ls',
            
            // Duration dari table
            duration: item.durationDays || 1,
            
            // Status berdasarkan completion
            status: this.getDetailedStatus(item.completion, item.title),
            completion: item.completion,
            
            // Resource information
            resourceNames: item.resourceNames || 'Team',
            
            // Generate realization child untuk format laporan
            realizationChild: {
              title: 'Realisasi :',
              description: this.generateRealizationDescription(item),
              status: item.completion === 100 ? 'SELESAI 100%' : 
                     item.completion >= 75 ? 'HAMPIR SELESAI' : 'DALAM PROGRESS'
            },
            
            // Generate detailed notes
            realizationNotes: this.generateDetailedNotes(item),
            
            // Children items (jika ada)
            children: item.children ? item.children.map(child => ({
              title: child.title,
              description: child.description,
              completion: child.completion,
              status: this.getDetailedStatus(child.completion, child.title)
            })) : [],
            
            // Flags
            hasChildren: item.children && item.children.length > 0,
            isMilestone: item.isMilestone
          }
        })
      }
    })
  }

  // Generate numbering berdasarkan package letter
  private generatePackageItemNumber(packageLetter: string, index: number): string {
    if (packageLetter === 'A') {
      return String.fromCharCode(65 + index) // A, B, C, D, E
    }
    return (index + 1).toString() // 1, 2, 3, 4, 5
  }

  // Split long text untuk readability dalam report
  private splitLongText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text
    
    const words = text.split(' ')
    const lines = []
    let currentLine = ''
    
    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word
      } else {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      }
    }
    
    if (currentLine) lines.push(currentLine)
    return lines.join('\n')
  }

  // Process work items untuk format docking report dengan struktur hierarki (Legacy method - kept for compatibility)
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
    const title = item.title.toLowerCase()
    const startDate = this.formatDate(item.startDate) || '23 Agustus 2025'
    const finishDate = this.formatDate(item.finishDate) || '07 September 2025'
    
    // Khusus untuk task yang berhubungan dengan kapal pandu dan docking
    if (title.includes('pandu') || title.includes('tugboat') || 
        (title.includes('dock') && !title.includes('report'))) {
      return `Ket :
• Masuk area dock pada ${startDate} menggunakan 1 kapal pandu
• Naik dock pada ${startDate} menggunakan 1 kapal pandu  
• Kapal turun dock pada ${finishDate} menggunakan 1 kapal pandu
• Keluar area dock pada ${finishDate} menggunakan 1 kapal pandu`
    }
    
    // Untuk dry docking dengan periode spesifik
    if (title.includes('dry docking')) {
      return `Ket :
• Kapal naik dock tanggal ${startDate}
• Kapal turun dock tanggal ${finishDate}
• Total periode dry docking: ${item.durationDays || 16} hari
• Fasilitas dock tersedia 24 jam`
    }
    
    // Untuk hull work dengan detail measurement
    if (title.includes('skrap') || title.includes('blast') || title.includes('pengecatan')) {
      const volume = item.volume || 750
      const unit = item.unit || 'm²'
      return `Ket :
• Area kerja: ${volume} ${unit}
• Progress saat ini: ${item.completion}%
• Resource: ${item.resourceNames || 'Hull Team'}
• Target selesai: ${finishDate}`
    }
    
    // Untuk docking report
    if (title.includes('report') || title.includes('laporan')) {
      return `Ket :
• Report dibuat dalam 6 set
• Format sesuai standar galangan
• Dilengkapi dokumentasi foto
• Diserahkan pada ${finishDate}`
    }
    
    // Untuk task lainnya berdasarkan status completion
    if (item.completion === 100) {
      return `Ket :
• Task telah selesai 100% pada ${finishDate}
• Resource: ${item.resourceNames || 'Team'}
• Durasi actual: ${item.durationDays || 1} hari
• Status: COMPLETED`
    } else if (item.completion > 0) {
      return `Ket :
• Progress saat ini: ${item.completion}%
• Resource: ${item.resourceNames || 'Team'}
• Target selesai: ${finishDate}
• Status: DALAM PROGRESS`
    }
    
    return `Ket :
• Task belum dimulai
• Jadwal mulai: ${startDate}
• Resource dialokasikan: ${item.resourceNames || 'Team'}
• Status: PLANNED`
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
    const title = item.title.toLowerCase()
    
    // Untuk kapal pandu dan tugboat
    if (title.includes('pandu') || title.includes('tugboat') || title.includes('setibanya')) {
      return `Diberikan fasilitas kapal pandu setibanya dimuara untuk masuk area Galangan Surya, 1 set SELESAI 100%. Selesai docking dipandu kembali keluar dari area Galangan Surya`
    }
    
    // Untuk dry docking
    if (title.includes('dry docking') || title.includes('dock')) {
      return `Diberikan fasilitas Dry Docking (Kapal diatas dock) dengan periode yang telah ditentukan`
    }
    
    // Untuk assistensi naik/turun dock
    if (title.includes('assistensi') || title.includes('naik') || title.includes('turun')) {
      return `Diberikan fasilitas assistensi naik/turun dock dan penataan ganjel sesuai prosedur`
    }
    
    // Untuk docking report
    if (title.includes('report') || title.includes('laporan')) {
      return `Dibuatkan Docking Report sesuai format standard galangan dengan dokumentasi lengkap`
    }
    
    // Untuk hull blasting dan pengecatan
    if (title.includes('blast') || title.includes('skrap') || title.includes('pengecatan')) {
      const volume = item.volume || 750
      const unit = item.unit || 'm²'
      return `Perawatan lambung telah dilaksanakan dengan luas area ${volume} ${unit} sesuai spesifikasi teknis`
    }
    
    // Untuk water jet
    if (title.includes('water jet') || title.includes('cuci')) {
      const volume = item.volume || 750
      const unit = item.unit || 'm²'
      return `Pembersihan menggunakan water jet bertekanan telah dilakukan pada area ${volume} ${unit}`
    }
    
    // Default realization description
    const statusText = item.completion === 100 ? 'SELESAI 100%' : 'DALAM PROGRESS'
    return `Pekerjaan ${item.title.toLowerCase()} telah dilaksanakan sesuai spesifikasi dan requirement. Status: ${statusText}`
  }

  // Generate realization notes - using generateDetailedNotes
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
      items: items as any[],
      itemCount: (items as any[]).length
    }))
  }

  // Create proper Word template with content
  private createSimpleDocxTemplate(): string {
    const templateContent = `PT. PID - KEMAYORAN
AMANAH KOMPETENSI MEMBANGUN
LOYAL ADAPTIF KOLABORATIF

{reportTitle}
{projectName} - {vesselName}
Tanggal: {reportDate}

RINGKASAN PROYEK
================
Nama Kapal      : {vesselInfo.name}
Pemilik         : {vesselInfo.owner}
LOA             : {vesselInfo.loa}
LPP             : {vesselInfo.lpp}
Breadth         : {vesselInfo.breadth}
DWT/GT          : {vesselInfo.dwtGt}
Dok Type        : {vesselInfo.dokType}
Status          : {vesselInfo.dockPeriod}

STATISTIK PROYEK
================
Total Tasks     : {totalTasks}
Avg Progress    : {avgCompletion}%
Milestones      : {milestones}
Conflicts       : {conflictedTasks}

DETAIL WORK ITEMS
================
{#workItems}
{number}. {taskName}
   - Progress: {progress}
   - Resource: {resources}
   - Duration: {duration}
   - Package: {package}
   - Status: {status}
   - Start: {startDate} | Finish: {finishDate}

{/workItems}

====================================
Dibuat oleh: {generatedBy}
Tanggal: {generatedDate}
{companyName}`
    
    // Create proper Word document XML structure
    const docContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="28"/>
        </w:rPr>
        <w:t xml:space="preserve">${templateContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`
    
    // Create complete Word document ZIP structure
    const zip = new PizZip()
    zip.file('word/document.xml', docContent)
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`)
    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`)
    
    return zip.generate({ type: 'string' })
  }

  // Create simple Word template if file doesn't exist (Legacy method)
  private createSimpleTemplate(): string {
    return this.createSimpleDocxTemplate()
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