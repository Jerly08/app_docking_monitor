import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

interface WorkItem {
  id: string;
  title: string;
  volume?: number;
  unit?: string;
  completion: number;
  resourceNames: string;
  status?: string;
  description?: string;
  children?: WorkItem[];
  hasChildren?: boolean;
  package?: string;
  isMilestone: boolean;
  startDate?: string;
  finishDate?: string;
  durationDays?: number;
}

interface PackageGroup {
  packageName: string;
  packageLetter: string;
  items: WorkItem[];
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
  packageGroups: PackageGroup[];
  totalTasks: number;
  avgCompletion: number;
  milestones: number;
  conflictedTasks: number;
}

export class FullBorderPdfService {
  async generateProjectReportPDF(data: ReportData): Promise<Buffer> {
    try {
      // Generate HTML content with full borders
      const htmlContent = this.generateHTMLTemplate(data);
      
      // Launch puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      // Set content and wait for load
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0'
      });

      // Generate PDF with proper settings
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm', 
          bottom: '15mm',
          left: '15mm'
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 10px; width: 100%; text-align: center;">
            <span>${data.reportTitle} - ${data.projectName}</span>
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 9px; width: 100%; display: flex; justify-content: space-between; padding: 0 15mm;">
            <span>Tanggal: ${data.reportDate}</span>
            <span>Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span></span>
          </div>
        `
      });

      await browser.close();
      return Buffer.from(pdfBuffer);

    } catch (error) {
      console.error('Error generating full border PDF:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  private generateHTMLTemplate(data: ReportData): string {
    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.reportTitle}</title>
        <style>
            /* Reset and Base Styles */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Arial', sans-serif;
                font-size: 11px;
                line-height: 1.3;
                color: #000;
                background: white;
            }

            .container {
                width: 100%;
                max-width: 100%;
                margin: 0 auto;
            }

            /* Header Section */
            .report-header {
                text-align: center;
                margin-bottom: 20px;
                padding: 10px 0;
                border-bottom: 2px solid #000;
            }

            .report-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
                text-transform: uppercase;
            }

            .project-info {
                font-size: 12px;
                margin-bottom: 3px;
            }

            .report-date {
                font-size: 10px;
                color: #666;
            }

            /* Main Data Table with Full Borders */
            .data-table {
                width: 100%;
                border-collapse: collapse;
                border: 2px solid #000;
                margin: 20px 0;
                background: white;
            }

            .data-table th,
            .data-table td {
                border: 1px solid #000;
                padding: 6px 4px;
                text-align: left;
                vertical-align: middle;
                font-size: 10px;
            }

            /* Header Styling */
            .data-table thead th {
                background-color: #f8f9fa;
                font-weight: bold;
                text-align: center;
                font-size: 11px;
                padding: 8px 4px;
                border: 2px solid #000;
            }

            /* Column Widths */
            .col-no { width: 5%; text-align: center; }
            .col-uraian { width: 50%; }
            .col-vol { width: 8%; text-align: center; }
            .col-sat { width: 8%; text-align: center; }
            .col-keterangan { width: 19%; text-align: center; }
            .col-lampiran { width: 10%; text-align: center; }

            /* Package Header Row */
            .package-header {
                background-color: #e9ecef !important;
                font-weight: bold;
                border: 2px solid #000 !important;
            }

            .package-header td {
                border: 2px solid #000 !important;
                padding: 8px 4px;
                font-size: 11px;
            }

            /* Parent Item Row */
            .parent-item {
                background-color: #f8f9fa;
                font-weight: bold;
            }

            .parent-item td {
                border: 1px solid #000;
                padding: 6px 4px;
            }

            /* Child Item Row */
            .child-item td {
                border: 1px solid #000;
                padding: 6px 4px;
                padding-left: 15px; /* Indent for sub-items */
            }

            .child-item .col-uraian {
                font-style: italic;
                color: #333;
            }

            /* Status Styling */
            .status-complete {
                background-color: #d4edda;
                color: #155724;
                font-weight: bold;
                text-align: center;
            }

            .status-in-progress {
                background-color: #fff3cd;
                color: #856404;
                font-weight: bold;
                text-align: center;
            }

            .status-not-started {
                background-color: #f8d7da;
                color: #721c24;
                font-weight: bold;
                text-align: center;
            }

            /* Progress Bar in Cell */
            .progress-cell {
                position: relative;
                text-align: center;
                font-weight: bold;
            }

            /* Vessel Info Table */
            .vessel-info {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
                border: 1px solid #000;
            }

            .vessel-info th,
            .vessel-info td {
                border: 1px solid #000;
                padding: 4px 6px;
                font-size: 9px;
            }

            .vessel-info th {
                background-color: #f1f3f4;
                font-weight: bold;
                width: 25%;
            }

            /* Statistics Section */
            .stats-section {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr 1fr;
                gap: 10px;
                margin: 15px 0;
                border: 1px solid #000;
                padding: 10px;
            }

            .stat-item {
                text-align: center;
                border: 1px solid #ccc;
                padding: 8px;
                border-radius: 4px;
            }

            .stat-value {
                font-size: 16px;
                font-weight: bold;
                color: #2c3e50;
            }

            .stat-label {
                font-size: 9px;
                color: #666;
                margin-top: 2px;
            }

            /* Image placeholder */
            .image-cell {
                text-align: center;
                color: #888;
                font-style: italic;
                min-height: 40px;
                vertical-align: middle;
            }

            /* Print Optimizations */
            @media print {
                body { font-size: 10px; }
                .data-table { page-break-inside: avoid; }
                .package-header { page-break-after: avoid; }
            }

            /* Row striping for readability */
            .data-table tbody tr:nth-child(even) {
                background-color: #fafafa;
            }

            /* Ensure all borders are solid black */
            .data-table,
            .data-table th,
            .data-table td,
            .vessel-info,
            .vessel-info th,
            .vessel-info td {
                border-color: #000 !important;
                border-style: solid !important;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Report Header -->
            <div class="report-header">
                <div class="report-title">${data.reportTitle}</div>
                <div class="project-info">${data.projectName} - ${data.vesselInfo.name}</div>
                <div class="report-date">Tanggal: ${data.reportDate}</div>
            </div>

            <!-- Vessel Information -->
            <table class="vessel-info">
                <tr>
                    <th>Nama Kapal</th>
                    <td>${data.vesselInfo.name}</td>
                    <th>DWT/GT</th>
                    <td>${data.vesselInfo.dwt_gt}</td>
                </tr>
                <tr>
                    <th>Pemilik</th>
                    <td>${data.vesselInfo.owner}</td>
                    <th>Dok Type</th>
                    <td>${data.vesselInfo.dok_type}</td>
                </tr>
                <tr>
                    <th>LOA x LPP</th>
                    <td>${data.vesselInfo.loa} x ${data.vesselInfo.lpp}</td>
                    <th>Status</th>
                    <td>${data.vesselInfo.status}</td>
                </tr>
                <tr>
                    <th>Breadth x Depth</th>
                    <td>${data.vesselInfo.breadth} x ${data.vesselInfo.depth}</td>
                    <th>Jenis Kapal</th>
                    <td>${data.vesselInfo.vessel_type}</td>
                </tr>
            </table>

            <!-- Statistics -->
            <div class="stats-section">
                <div class="stat-item">
                    <div class="stat-value">${data.totalTasks}</div>
                    <div class="stat-label">Total Pekerjaan</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.avgCompletion}%</div>
                    <div class="stat-label">Rata-rata Progress</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.milestones}</div>
                    <div class="stat-label">Milestone</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.conflictedTasks}</div>
                    <div class="stat-label">Konflik</div>
                </div>
            </div>

            <!-- Main Data Table -->
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="col-no">NO.</th>
                        <th class="col-uraian">URAIAN - PEKERJAAN</th>
                        <th class="col-vol">VOL</th>
                        <th class="col-sat">SAT</th>
                        <th class="col-keterangan">KETERANGAN</th>
                        <th class="col-lampiran">LAMPIRAN</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.generateTableRows(data.packageGroups)}
                </tbody>
            </table>
        </div>
    </body>
    </html>
    `;
  }

  private generateTableRows(packageGroups: PackageGroup[]): string {
    let rowsHtml = '';
    
    packageGroups.forEach((packageGroup, packageIndex) => {
      // Package Header Row
      rowsHtml += `
        <tr class="package-header">
          <td class="col-no"><strong>${packageGroup.packageLetter}</strong></td>
          <td class="col-uraian"><strong>${packageGroup.packageName}</strong></td>
          <td class="col-vol"></td>
          <td class="col-sat"></td>
          <td class="col-keterangan"></td>
          <td class="col-lampiran"></td>
        </tr>
      `;

      // Package Items
      packageGroup.items.forEach((item, itemIndex) => {
        const itemNumber = itemIndex + 1;
        const statusClass = this.getStatusClass(item.completion);
        const statusText = this.getStatusText(item.completion);

        // Parent Item Row
        rowsHtml += `
          <tr class="parent-item">
            <td class="col-no"><strong>${itemNumber}</strong></td>
            <td class="col-uraian">${this.escapeHtml(item.title)}</td>
            <td class="col-vol">${item.volume || ''}</td>
            <td class="col-sat">${item.unit || ''}</td>
            <td class="col-keterangan ${statusClass}">
              <div class="progress-cell">${statusText}</div>
            </td>
            <td class="col-lampiran image-cell">
              ${item.completion === 100 ? '✓' : '-'}
            </td>
          </tr>
        `;

        // Child Items (if any)
        if (item.children && item.children.length > 0) {
          item.children.forEach((child, childIndex) => {
            const childStatusClass = this.getStatusClass(child.completion);
            const childStatusText = this.getStatusText(child.completion);

            rowsHtml += `
              <tr class="child-item">
                <td class="col-no"></td>
                <td class="col-uraian">
                  <em>Realisasi:</em> ${this.escapeHtml(child.title)}
                  ${child.description ? `<br><small>${this.escapeHtml(child.description)}</small>` : ''}
                </td>
                <td class="col-vol">${child.volume || ''}</td>
                <td class="col-sat">${child.unit || ''}</td>
                <td class="col-keterangan ${childStatusClass}">
                  <div class="progress-cell">${childStatusText}</div>
                </td>
                <td class="col-lampiran image-cell">
                  ${child.completion === 100 ? '✓' : '-'}
                </td>
              </tr>
            `;
          });
        }
      });
    });

    return rowsHtml;
  }

  private getStatusClass(completion: number): string {
    if (completion === 100) return 'status-complete';
    if (completion >= 1) return 'status-in-progress';
    return 'status-not-started';
  }

  private getStatusText(completion: number): string {
    if (completion === 100) return 'SELESAI 100%';
    if (completion >= 75) return `HAMPIR SELESAI ${completion}%`;
    if (completion >= 1) return `DALAM PROGRESS ${completion}%`;
    return 'BELUM DIMULAI 0%';
  }

  private escapeHtml(unsafe: string): string {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

export const fullBorderPdfService = new FullBorderPdfService();