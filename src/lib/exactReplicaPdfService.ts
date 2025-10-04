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
  imageUrl?: string;
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

export class ExactReplicaPdfService {
  async generateProjectReportPDF(data: ReportData): Promise<Buffer> {
    try {
      // Generate HTML content that matches reference exactly
      const htmlContent = this.generateExactHTMLTemplate(data);
      
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

      // Generate PDF with exact settings to match reference
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '8mm',
          right: '8mm', 
          bottom: '8mm',
          left: '8mm'
        },
        displayHeaderFooter: false
      });

      await browser.close();
      return Buffer.from(pdfBuffer);

    } catch (error) {
      console.error('Error generating exact replica PDF:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  private generateExactHTMLTemplate(data: ReportData): string {
    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DOCKING REPORT</title>
        <style>
            /* Reset and Base Styles */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

        body {
            font-family: 'Arial', sans-serif;
            font-size: 10px;
            line-height: 1.2;
            color: #000;
            background: white;
            margin: 8px;
        }

        .container {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
        }

            /* EXACT Header Layout as Reference */
            .report-header {
                text-align: center;
                margin-bottom: 12px;
                padding: 8px 0;
            }

            .report-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 3px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .project-subtitle {
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 12px;
            }

            /* EXACT Vessel Info Layout - Precisely Match Reference */
            .vessel-info-section {
                margin-bottom: 15px;
                font-size: 10px;
            }

            .vessel-info-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
                font-size: 10px;
                table-layout: fixed;
            }

            .vessel-info-table td {
                padding: 1px 0;
                vertical-align: top;
                line-height: 1.4;
                font-size: 10px;
            }

            /* Left Column - Nama Kapal */
            .vessel-info-label {
                font-weight: bold;
                width: 90px;
                text-align: left;
                vertical-align: top;
                padding-right: 8px;
            }

            .vessel-info-colon {
                width: 8px;
                text-align: left;
                vertical-align: top;
            }

            .vessel-info-value {
                width: 180px;
                text-align: left;
                vertical-align: top;
                padding-right: 20px;
            }

            /* Spacer between columns */
            .vessel-info-spacer {
                width: 30px;
            }

            /* Sub-labels for Ukuran utama */
            .vessel-info-sub-label {
                font-weight: bold;
                width: 30px;
                text-align: left;
                vertical-align: top;
                padding-left: 15px;
            }

            /* Right Column - Pemilik, Tipe, etc */
            .vessel-info-right-label {
                font-weight: bold;
                width: 70px;
                text-align: left;
                vertical-align: top;
            }

            .vessel-info-right-colon {
                width: 8px;
                text-align: left;
                vertical-align: top;
            }

            .vessel-info-right-value {
                width: 150px;
                text-align: left;
                vertical-align: top;
            }

            /* Special styling for Ukuran utama row */
            .vessel-info-ukuran-label {
                font-weight: bold;
                width: 75px;
                text-align: left;
                vertical-align: top;
                padding-right: 8px;
            }

            /* EXACT Table Structure - Perfect Match to Reference */
            .main-table {
                width: 100%;
                border-collapse: collapse;
                border: 2px solid #000;
                font-size: 9px;
            }

            .main-table th,
            .main-table td {
                border: 1px solid #000 !important;
                padding: 3px 3px;
                text-align: left;
                vertical-align: top;
            }

            /* EXACT Header Row */
            .main-table thead th {
                background-color: #f8f9fa;
                font-weight: bold;
                text-align: center;
                font-size: 9px;
                padding: 4px 3px;
                border: 1px solid #000 !important;
                border-bottom: 2px solid #000 !important;
            }

            /* EXACT Column Widths as Reference */
            .col-no { 
                width: 5%; 
                text-align: center; 
                font-weight: bold;
            }
            
            .col-uraian { 
                width: 42%; 
                text-align: left;
                padding-left: 6px;
            }
            
            .col-vol { 
                width: 7%; 
                text-align: center; 
            }
            
            .col-sat { 
                width: 7%; 
                text-align: center; 
            }
            
            .col-keterangan { 
                width: 14%; 
                text-align: center; 
            }
            
            .col-lampiran { 
                width: 25%; 
                text-align: center;
                padding: 3px;
            }

            /* EXACT Package Header Row */
            .package-header {
                background-color: #ffffff !important;
                font-weight: bold;
            }

            .package-header td {
                border: 1px solid #000 !important;
                font-size: 9px;
                font-weight: bold;
                text-align: center;
                background-color: #f8f9fa;
            }

            /* Work Item Rows */
            .work-item-row td {
                border: 1px solid #000 !important;
                vertical-align: top;
            }

            .work-item-number {
                font-weight: bold;
                text-align: center;
            }

            .work-item-description {
                text-align: left;
                line-height: 1.3;
            }

            /* Child/Realization Items */
            .realization-row {
                background-color: #f9f9f9;
            }

            .realization-row td {
                border: 1px solid #000 !important;
                font-size: 8px;
            }

            .realization-text {
                font-style: italic;
                text-align: left;
                padding-left: 10px;
            }

            /* EXACT Status Styling */
            .status-complete {
                background-color: #d4edda;
                color: #155724;
                font-weight: bold;
                text-align: center;
                font-size: 8px;
                padding: 2px;
                border-radius: 2px;
            }

            .status-in-progress {
                background-color: #fff3cd;
                color: #856404;
                font-weight: bold;
                text-align: center;
                font-size: 8px;
                padding: 2px;
                border-radius: 2px;
            }

            /* EXACT Image Cell */
            .image-cell {
                text-align: center;
                padding: 2px;
                vertical-align: middle;
            }

            .work-image {
                max-width: 100%;
                max-height: 60px;
                border: 1px solid #999;
                border-radius: 2px;
            }

            .image-placeholder {
                display: inline-block;
                width: 70px;
                height: 40px;
                background-color: #f0f0f0;
                border: 1px solid #999;
                border-radius: 2px;
                line-height: 40px;
                text-align: center;
                font-size: 7px;
                color: #666;
            }

            /* Ensure ALL borders are solid black */
            .main-table,
            .main-table th,
            .main-table td {
                border-color: #000 !important;
                border-style: solid !important;
            }

            /* Page break optimization */
            .package-header {
                page-break-after: avoid;
            }

            .work-item-row {
                page-break-inside: avoid;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- EXACT Header as Reference -->
            <div class="report-header">
                <div class="report-title">DOCKING REPORT</div>
                <div class="project-subtitle">${data.vesselInfo.name} / TAHUN ${new Date().getFullYear()}</div>
            </div>

            <!-- EXACT Vessel Information Layout - Precisely Match Reference -->
            <div class="vessel-info-section">
                <table class="vessel-info-table">
                    <tr>
                        <td class="vessel-info-label"><strong>Nama Kapal</strong></td>
                        <td class="vessel-info-colon">:</td>
                        <td class="vessel-info-value">${data.vesselInfo.name}</td>
                        <td class="vessel-info-spacer"></td>
                        <td class="vessel-info-right-label"><strong>Pemilik</strong></td>
                        <td class="vessel-info-right-colon">:</td>
                        <td class="vessel-info-right-value">${data.vesselInfo.owner}</td>
                    </tr>
                    <tr>
                        <td class="vessel-info-ukuran-label"><strong>Ukuran utama</strong></td>
                        <td class="vessel-info-sub-label"><strong>LOA</strong></td>
                        <td class="vessel-info-colon">:</td>
                        <td class="vessel-info-value">${data.vesselInfo.loa}</td>
                        <td class="vessel-info-right-label"><strong>Tipe</strong></td>
                        <td class="vessel-info-right-colon">:</td>
                        <td class="vessel-info-right-value">${data.vesselInfo.vessel_type || 'OIL TANKER'}</td>
                    </tr>
                    <tr>
                        <td class="vessel-info-label"></td>
                        <td class="vessel-info-sub-label"><strong>LBP</strong></td>
                        <td class="vessel-info-colon">:</td>
                        <td class="vessel-info-value">${data.vesselInfo.lpp}</td>
                        <td class="vessel-info-right-label"><strong>GRT</strong></td>
                        <td class="vessel-info-right-colon">:</td>
                        <td class="vessel-info-right-value">${data.vesselInfo.dwt_gt}</td>
                    </tr>
                    <tr>
                        <td class="vessel-info-label"></td>
                        <td class="vessel-info-sub-label"><strong>BM</strong></td>
                        <td class="vessel-info-colon">:</td>
                        <td class="vessel-info-value">${data.vesselInfo.breadth}</td>
                        <td class="vessel-info-right-label"><strong>Status</strong></td>
                        <td class="vessel-info-right-colon">:</td>
                        <td class="vessel-info-right-value">${data.vesselInfo.status}</td>
                    </tr>
                    <tr>
                        <td class="vessel-info-label"></td>
                        <td class="vessel-info-sub-label"><strong>T</strong></td>
                        <td class="vessel-info-colon">:</td>
                        <td class="vessel-info-value">${data.vesselInfo.depth}</td>
                        <td class="vessel-info-right-label"></td>
                        <td class="vessel-info-right-colon"></td>
                        <td class="vessel-info-right-value"></td>
                    </tr>
                </table>
            </div>

            <!-- EXACT Main Table -->
            <table class="main-table">
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
                    ${this.generateExactTableRows(data.packageGroups)}
                </tbody>
            </table>
        </div>
    </body>
    </html>
    `;
  }

  private generateExactTableRows(packageGroups: PackageGroup[]): string {
    let rowsHtml = '';
    
    packageGroups.forEach((packageGroup) => {
      // Package Header Row - EXACT as reference
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

      // Work Items - EXACT as reference with proper numbering
      packageGroup.items.forEach((item, itemIndex) => {
        // Generate item number based on package - match reference exactly
        const itemNumber = this.generateItemNumber(packageGroup.packageLetter, itemIndex);
        const statusClass = this.getStatusClass(item.completion);
        const statusText = this.getStatusText(item.completion);

        // Parent Item Row
        rowsHtml += `
          <tr class="work-item-row">
            <td class="col-no work-item-number">${itemNumber}</td>
            <td class="col-uraian work-item-description">${this.escapeHtml(item.title)}</td>
            <td class="col-vol">${item.volume || ''}</td>
            <td class="col-sat">${item.unit || 'LS'}</td>
            <td class="col-keterangan">
              ${statusText ? `<span class="${statusClass}">${statusText}</span>` : ''}
            </td>
            <td class="col-lampiran image-cell">
              ${this.generateImagePlaceholder(item)}
            </td>
          </tr>
        `;

        // Child Items (Realisasi) - EXACT as reference
        if (item.children && item.children.length > 0) {
          item.children.forEach((child) => {
            const childStatusClass = this.getStatusClass(child.completion);
            const childStatusText = this.getStatusText(child.completion);

            rowsHtml += `
              <tr class="realization-row">
                <td class="col-no"></td>
                <td class="col-uraian realization-text">
                  <strong>Realisasi :</strong><br>
                  ${this.escapeHtml(child.title)}
                  ${child.description ? `<br><em>${this.escapeHtml(child.description)}</em>` : ''}
                </td>
                <td class="col-vol">${child.volume || ''}</td>
                <td class="col-sat">${child.unit || ''}</td>
                <td class="col-keterangan">
                  ${childStatusText ? `<span class="${childStatusClass}">${childStatusText}</span>` : ''}
                </td>
                <td class="col-lampiran image-cell">
                  ${this.generateImagePlaceholder(child)}
                </td>
              </tr>
            `;
          });
        }
      });
    });

    return rowsHtml;
  }

  private generateImagePlaceholder(item: WorkItem): string {
    if (item.imageUrl) {
      return `<img src="${item.imageUrl}" class="work-image" alt="Work progress image" />`;
    }
    return `<div class="image-placeholder">📷</div>`;
  }

  private getStatusClass(completion: number): string {
    if (completion === 100) return 'status-complete';
    if (completion >= 1) return 'status-in-progress';
    return '';
  }

  private getStatusText(completion: number): string {
    if (completion === 100) return 'SELESAI 100%';
    if (completion >= 75) return `SELESAI ${completion}%`;
    if (completion >= 1) return `${completion}%`;
    return '';
  }

  private generateItemNumber(packageLetter: string, index: number): string {
    // All packages now use numbers: 1, 2, 3, 4, 5, ...
    // Changed from letters (A, B, C) to numbers (1, 2, 3) as per requirement
    return (index + 1).toString();
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

export const exactReplicaPdfService = new ExactReplicaPdfService();