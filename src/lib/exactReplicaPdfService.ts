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

interface WorkItemAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: string;
  workItemId: string;
  workItemTitle: string;
  parentTitle?: string;
  isChild: boolean;
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
  attachments?: WorkItemAttachment[];
}

export class ExactReplicaPdfService {
  async generateProjectReportPDF(data: ReportData): Promise<Buffer> {
    let browser = null;
    try {
      console.log('🚀 Starting PDF generation with Puppeteer...');
      
      // Generate HTML content that matches reference exactly
      const htmlContent = this.generateExactHTMLTemplate(data);
      console.log('✅ HTML template generated, length:', htmlContent.length);
      
      // Launch puppeteer with improved configuration for Windows
      console.log('🌐 Launching browser...');
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ],
        timeout: 60000
      });
      console.log('✅ Browser launched successfully');

      const page = await browser.newPage();
      console.log('✅ New page created');
      
      // Set content and wait for load
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      console.log('✅ Page content set');

      // Generate PDF with exact settings to match reference
      console.log('📄 Generating PDF...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '8mm',
          right: '8mm', 
          bottom: '8mm',
          left: '8mm'
        },
        displayHeaderFooter: false,
        timeout: 60000
      });
      console.log('✅ PDF generated, size:', pdfBuffer.length, 'bytes');

      await browser.close();
      console.log('✅ Browser closed successfully');
      
      return Buffer.from(pdfBuffer);

    } catch (error) {
      console.error('❌ Error generating exact replica PDF:', error);
      console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
      console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown');
      
      // Ensure browser is closed on error
      if (browser) {
        try {
          await browser.close();
          console.log('✅ Browser closed after error');
        } catch (closeError) {
          console.error('❌ Failed to close browser:', closeError);
        }
      }
      
      // Re-throw with detailed error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate PDF: ${errorMessage}`);
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

            /* ULTRA PRECISE Vessel Info Layout */
            .vessel-info-section {
                margin-bottom: 16px;
                padding: 0;
                line-height: 1.3;
            }

            .vessel-info-section table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 16px;
                font-size: 9px;
                font-family: Arial, sans-serif;
                table-layout: fixed;
            }

            .vessel-info-section td {
                vertical-align: top;
                line-height: 1.3;
                font-size: 9px;
                border: none;
                white-space: nowrap;
                overflow: visible;
            }

            /* Ensure proper text rendering */
            .vessel-info-section strong,
            .vessel-info-section b {
                font-weight: bold;
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
            <!-- CENTERED HEADER TEXT -->
            <div style="text-align: center; margin-bottom: 20px; padding: 0;">
                <div style="font-size: 14px; font-weight: bold; margin-bottom: 2px; letter-spacing: 0.5px; text-align: center;">DOCKING REPORT</div>
                <div style="font-size: 12px; font-weight: bold; margin-bottom: 15px; text-align: center;">${data.vesselInfo.name} / TAHUN ${new Date().getFullYear()}</div>
            </div>

            <!-- EXACTLY ALIGNED VESSEL INFORMATION -->
            <div style="margin-bottom: 15px; font-size: 9px; font-family: Arial, sans-serif; line-height: 1.3;">
                <div style="display: flex; align-items: baseline; margin-bottom: 1px;">
                    <div style="width: 85px; font-weight: bold;">Nama Kapal</div>
                    <div style="width: 20px; text-align: center;">:</div>
                    <div style="width: 225px;">${data.vesselInfo.name}</div>
                    <div style="width: 65px; font-weight: bold; text-align: left; padding-left: 25px;">Pemilik</div>
                    <div style="width: 20px; text-align: center;">:</div>
                    <div style="flex: 1;">${data.vesselInfo.owner}</div>
                </div>
                <div style="display: flex; align-items: baseline; margin-bottom: 1px;">
                    <div style="width: 85px; font-weight: bold;">Ukuran utama</div>
                    <div style="width: 35px; text-align: left; padding-left: 5px;">LOA</div>
                    <div style="width: 20px; text-align: center;">:</div>
                    <div style="width: 205px;">${this.formatIndonesianDecimal(data.vesselInfo.loa)}</div>
                    <div style="width: 65px; font-weight: bold; text-align: left; padding-left: 25px;">Tipe</div>
                    <div style="width: 20px; text-align: center;">:</div>
                    <div style="flex: 1;">${data.vesselInfo.vessel_type || 'CARGO SHIP'}</div>
                </div>
                <div style="display: flex; align-items: baseline; margin-bottom: 1px;">
                    <div style="width: 85px;"></div>
                    <div style="width: 35px; text-align: left; padding-left: 5px;">LBP</div>
                    <div style="width: 20px; text-align: center;">:</div>
                    <div style="width: 205px;">${this.formatIndonesianDecimal(data.vesselInfo.lpp)}</div>
                    <div style="width: 65px; font-weight: bold; text-align: left; padding-left: 25px;">GRT</div>
                    <div style="width: 20px; text-align: center;">:</div>
                    <div style="flex: 1;">${data.vesselInfo.dwt_gt}</div>
                </div>
                <div style="display: flex; align-items: baseline; margin-bottom: 1px;">
                    <div style="width: 85px;"></div>
                    <div style="width: 35px; text-align: left; padding-left: 5px;">BM</div>
                    <div style="width: 20px; text-align: center;">:</div>
                    <div style="width: 205px;">${this.formatIndonesianDecimal(data.vesselInfo.breadth)}</div>
                    <div style="width: 65px; font-weight: bold; text-align: left; padding-left: 25px;">Status</div>
                    <div style="width: 20px; text-align: center;">:</div>
                    <div style="flex: 1;">${data.vesselInfo.status}</div>
                </div>
                <div style="display: flex; align-items: baseline; margin-bottom: 1px;">
                    <div style="width: 85px;"></div>
                    <div style="width: 35px; text-align: left; padding-left: 5px;">T</div>
                    <div style="width: 20px; text-align: center;">:</div>
                    <div style="width: 205px;">${this.formatIndonesianDecimal(data.vesselInfo.depth)}</div>
                </div>
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
                    ${this.generateExactTableRows(data.packageGroups, data.attachments)}
                </tbody>
            </table>
        </div>
    </body>
    </html>
    `;
  }

  private generateExactTableRows(packageGroups: PackageGroup[], attachments?: WorkItemAttachment[]): string {
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
        
        // Find attachments for this work item
        const itemAttachments = attachments?.filter(att => att.workItemId === item.id && !att.isChild) || [];

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
              ${this.generateImageGrid(itemAttachments)}
            </td>
          </tr>
        `;

        // Child Items (Realisasi) - EXACT as reference
        if (item.children && item.children.length > 0) {
          item.children.forEach((child) => {
            const childStatusClass = this.getStatusClass(child.completion);
            const childStatusText = this.getStatusText(child.completion);
            
            // Find attachments for this child work item
            const childAttachments = attachments?.filter(att => att.workItemId === child.id && att.isChild) || [];

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
                  ${this.generateImageGrid(childAttachments)}
                </td>
              </tr>
            `;
          });
        }
      });
    });

    return rowsHtml;
  }

  private generateImageGrid(attachments: WorkItemAttachment[]): string {
    if (!attachments || attachments.length === 0) {
      return `<div class="image-placeholder">📷</div>`;
    }

    // Display up to 4 images in a grid
    const displayAttachments = attachments.slice(0, 4);
    const remainingCount = Math.max(0, attachments.length - 4);
    
    let imageHtml = '';
    
    if (displayAttachments.length === 1) {
      // Single image - display larger
      imageHtml = `<img src="${displayAttachments[0].fileUrl}" class="work-image" alt="${displayAttachments[0].fileName}" style="max-width: 80px; max-height: 60px;" />`;
    } else {
      // Multiple images - display in grid
      imageHtml = '<div style="display: flex; flex-wrap: wrap; gap: 2px; justify-content: center;">';
      displayAttachments.forEach(attachment => {
        imageHtml += `<img src="${attachment.fileUrl}" class="work-image" alt="${attachment.fileName}" style="max-width: 35px; max-height: 30px;" />`;
      });
      imageHtml += '</div>';
      
      // Add count indicator if there are more images
      if (remainingCount > 0) {
        imageHtml += `<div style="font-size: 7px; color: #666; text-align: center; margin-top: 2px;">+${remainingCount} more</div>`;
      }
    }
    
    return imageHtml;
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

  private formatIndonesianDecimal(value: string): string {
    if (!value) return '';
    // Convert decimal point to comma for Indonesian format
    // Handle various formats: "85.5 meter", "85.50 meter", etc.
    return value.replace(/\./, ',');
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