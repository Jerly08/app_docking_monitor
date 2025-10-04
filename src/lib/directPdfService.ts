import { jsPDF } from 'jspdf';
import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

interface WorkItem {
  id: string;
  title: string;
  completion: number;
  resourceNames: string;
  startDate?: string;
  finishDate?: string;
  durationDays?: number;
  package?: string;
  isMilestone: boolean;
  volume?: number;
  unit?: string;
  status?: string;
}

interface VesselInfo {
  name: string;
  owner: string;
  loa: string;
  lpp: string;
  breadth: string;
  depth: string;
  dwt_gt: string;
  dok_type: string;
  vessel_type: string;
  status: string;
}

interface ReportData {
  projectName: string;
  reportTitle: string;
  reportDate: string;
  vesselInfo: VesselInfo;
  workItems: WorkItem[];
  totalTasks: number;
  avgCompletion: number;
  milestones: number;
  conflictedTasks: number;
}

export class DirectPDFService {
  private templatePdfPath = path.join(process.cwd(), 'public', 'kopsurat', 'kop-surat-template.pdf');

  async generateWorkPlanReportPDF(data: ReportData): Promise<Buffer> {
    try {
      let pdfDoc: PDFDocument;

      // Check if PDF template exists
      if (fs.existsSync(this.templatePdfPath)) {
        console.log('Using existing PDF template...');
        const existingPdfBytes = fs.readFileSync(this.templatePdfPath);
        pdfDoc = await PDFDocument.load(existingPdfBytes);
      } else {
        console.log('Creating new PDF document...');
        pdfDoc = await PDFDocument.create();
      }

      // Add a new page for content
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();
      
      // Get fonts
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Starting position (from top)
      let yPosition = height - 100; // Start below any existing header

      // If no template, add company header
      if (!fs.existsSync(this.templatePdfPath)) {
        // Company Header
        page.drawText('PT. PID - KEMAYORAN', {
          x: 50,
          y: yPosition,
          size: 18,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        
        yPosition -= 25;
        page.drawText('AMANAH KOMPETENSI MEMBANGUN', {
          x: 50,
          y: yPosition,
          size: 10,
          font: regularFont,
          color: rgb(0.5, 0.5, 0.5),
        });
        
        yPosition -= 15;
        page.drawText('LOYAL ADAPTIF KOLABORATIF', {
          x: 50,
          y: yPosition,
          size: 10,
          font: regularFont,
          color: rgb(0.5, 0.5, 0.5),
        });
        
        yPosition -= 40;
      }

      // Report Title
      page.drawText(data.reportTitle || 'WORK PLAN & PROGRESS REPORT', {
        x: (width - 300) / 2,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 30;
      page.drawText(`${data.projectName} - ${data.vesselInfo.name}`, {
        x: (width - 400) / 2,
        y: yPosition,
        size: 12,
        font: regularFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 20;
      page.drawText(`Tanggal: ${data.reportDate}`, {
        x: (width - 200) / 2,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 40;

      // Section: RINGKASAN PROYEK
      page.drawText('RINGKASAN PROYEK', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 5;
      // Draw underline
      page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: 200, y: yPosition },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      yPosition -= 20;
      
      const vesselInfoItems = [
        { label: 'Nama Kapal', value: data.vesselInfo.name },
        { label: 'Pemilik', value: data.vesselInfo.owner },
        { label: 'LOA', value: data.vesselInfo.loa },
        { label: 'LPP', value: data.vesselInfo.lpp },
        { label: 'Breadth', value: data.vesselInfo.breadth },
        { label: 'DWT/GT', value: data.vesselInfo.dwt_gt },
        { label: 'Dok Type', value: data.vesselInfo.dok_type },
        { label: 'Status', value: data.vesselInfo.status },
      ];

      for (const item of vesselInfoItems) {
        page.drawText(`${item.label.padEnd(15)} : ${item.value}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 15;
      }

      yPosition -= 20;

      // Section: STATISTIK PROYEK
      page.drawText('STATISTIK PROYEK', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 5;
      page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: 200, y: yPosition },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      yPosition -= 20;

      const statsItems = [
        { label: 'Total Tasks', value: data.totalTasks.toString() },
        { label: 'Avg Progress', value: `${data.avgCompletion}%` },
        { label: 'Milestones', value: data.milestones.toString() },
        { label: 'Conflicts', value: data.conflictedTasks.toString() },
      ];

      for (const item of statsItems) {
        page.drawText(`${item.label.padEnd(15)} : ${item.value}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 15;
      }

      yPosition -= 20;

      // Section: DETAIL WORK ITEMS
      page.drawText('DETAIL WORK ITEMS', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 5;
      page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: 200, y: yPosition },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      yPosition -= 25;

      // Work Items
      data.workItems.forEach((item, index) => {
        // Check if we need a new page
        if (yPosition < 100) {
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - 50;
          // Continue on new page
          return;
        }

        const packageLetter = item.package === 'PELAYANAN UMUM' ? 'A' : 'B';
        const number = packageLetter === 'A' ? String.fromCharCode(65 + index) : (index + 1).toString();
        
        // Work item number and title
        page.drawText(`${number}. ${this.truncateText(item.title, 60)}`, {
          x: 50,
          y: yPosition,
          size: 11,
          font: boldFont,
          color: rgb(0, 0, 0),
        });

        yPosition -= 15;

        // Work item details
        const details = [
          `   - Progress: ${item.completion}%`,
          `   - Resource: ${item.resourceNames || 'Team'}`,
          `   - Duration: ${item.durationDays || 1} hari`,
          `   - Package: ${item.package || 'Pelayanan Umum'}`,
          `   - Status: ${this.getStatusText(item.completion)}`,
          `   - Start: ${this.formatDate(item.startDate)} | Finish: ${this.formatDate(item.finishDate)}`,
        ];

        for (const detail of details) {
          page.drawText(detail, {
            x: 50,
            y: yPosition,
            size: 9,
            font: regularFont,
            color: rgb(0.2, 0.2, 0.2),
          });
          yPosition -= 12;
        }

        yPosition -= 10; // Extra space between items
      });

      // Footer
      yPosition = 50; // Bottom of page
      page.drawLine({
        start: { x: 50, y: yPosition + 20 },
        end: { x: width - 50, y: yPosition + 20 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      page.drawText('Dibuat oleh: System Administrator', {
        x: 50,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      page.drawText(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, {
        x: width - 150,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      page.drawText('PT. PID - Kemayoran', {
        x: (width - 100) / 2,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Generate PDF buffer
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);

    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw new Error(`Failed to generate PDF report: ${error.message}`);
    }
  }

  private truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  }

  private getStatusText(completion: number): string {
    if (completion === 100) return 'Selesai';
    if (completion >= 75) return 'Hampir Selesai';
    if (completion >= 50) return 'Dalam Progress';
    if (completion >= 25) return 'Dimulai';
    return 'Belum Dimulai';
  }

  private formatDate(dateString?: string): string {
    if (!dateString || dateString === 'mm/dd/yyyy') return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID');
    } catch {
      return dateString || '-';
    }
  }
}

export const directPdfService = new DirectPDFService();