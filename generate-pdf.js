const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class DockingReportPDFGenerator {
    constructor() {
        this.inputFile = 'exact_replica_report.html';
        this.outputDir = 'output';
        this.outputFile = 'docking-report.pdf';
    }

    /**
     * Generate PDF from HTML report
     */
    async generatePDF(options = {}) {
        try {
            console.log('🚀 Starting PDF generation...');
            
            // Check if input file exists
            if (!fs.existsSync(this.inputFile)) {
                throw new Error(`Input file not found: ${this.inputFile}`);
            }

            // Create output directory if it doesn't exist
            if (!fs.existsSync(this.outputDir)) {
                fs.mkdirSync(this.outputDir, { recursive: true });
                console.log(`📁 Created output directory: ${this.outputDir}`);
            }

            // Launch browser
            console.log('🌐 Launching browser...');
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            
            // Set viewport for consistent rendering
            await page.setViewport({
                width: 1200,
                height: 1600,
                deviceScaleFactor: 2
            });

            // Load HTML file
            const htmlPath = path.resolve(this.inputFile);
            const htmlUrl = `file://${htmlPath}`;
            
            console.log(`📄 Loading HTML file: ${htmlPath}`);
            await page.goto(htmlUrl, { 
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for any dynamic content to load
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Configure PDF options
            const pdfOptions = {
                path: path.join(this.outputDir, this.outputFile),
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0.5in',
                    right: '0.5in',
                    bottom: '0.5in',
                    left: '0.5in'
                },
                displayHeaderFooter: true,
                headerTemplate: `
                    <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
                        <span>DOCKING REPORT - MV. OCEAN STAR</span>
                    </div>
                `,
                footerTemplate: `
                    <div style="font-size: 10px; width: 100%; text-align: center; color: #666; padding: 5px;">
                        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                        <span style="margin-left: 50px;">Generated: ${new Date().toLocaleDateString('id-ID')}</span>
                    </div>
                `,
                preferCSSPageSize: false,
                ...options
            };

            // Generate PDF
            console.log('📃 Generating PDF...');
            await page.pdf(pdfOptions);

            await browser.close();

            const outputPath = path.resolve(this.outputDir, this.outputFile);
            console.log(`✅ PDF generated successfully: ${outputPath}`);
            
            // Check file size
            const stats = fs.statSync(outputPath);
            console.log(`📊 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

            return outputPath;

        } catch (error) {
            console.error('❌ Error generating PDF:', error.message);
            throw error;
        }
    }

    /**
     * Generate PDF with custom filename
     */
    async generateWithCustomName(filename, options = {}) {
        const originalOutput = this.outputFile;
        this.outputFile = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
        
        try {
            const result = await this.generatePDF(options);
            return result;
        } finally {
            this.outputFile = originalOutput;
        }
    }

    /**
     * Generate multiple PDF formats
     */
    async generateMultipleFormats() {
        const formats = [
            { name: 'docking-report-a4.pdf', format: 'A4' },
            { name: 'docking-report-letter.pdf', format: 'Letter' },
            { name: 'docking-report-a3.pdf', format: 'A3' }
        ];

        const results = [];
        
        for (const formatConfig of formats) {
            console.log(`\n📋 Generating ${formatConfig.format} format...`);
            try {
                const result = await this.generateWithCustomName(formatConfig.name, {
                    format: formatConfig.format
                });
                results.push({ format: formatConfig.format, path: result, success: true });
            } catch (error) {
                console.error(`❌ Failed to generate ${formatConfig.format}:`, error.message);
                results.push({ format: formatConfig.format, error: error.message, success: false });
            }
        }

        return results;
    }

    /**
     * Generate high-quality PDF for printing
     */
    async generatePrintQuality() {
        console.log('\n🖨️  Generating high-quality print version...');
        
        return await this.generateWithCustomName('docking-report-print.pdf', {
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            margin: {
                top: '0.3in',
                right: '0.3in', 
                bottom: '0.3in',
                left: '0.3in'
            }
        });
    }

    /**
     * Generate PDF optimized for digital viewing
     */
    async generateDigitalVersion() {
        console.log('\n💻 Generating digital version...');
        
        return await this.generateWithCustomName('docking-report-digital.pdf', {
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            margin: {
                top: '0.6in',
                right: '0.4in',
                bottom: '0.6in', 
                left: '0.4in'
            }
        });
    }
}

// CLI Interface
async function main() {
    const generator = new DockingReportPDFGenerator();
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
📋 Docking Report PDF Generator
=============================

Usage:
  node generate-pdf.js [command] [options]

Commands:
  default          Generate standard A4 PDF
  print           Generate high-quality print version
  digital         Generate digital viewing version  
  all-formats     Generate A4, Letter, and A3 versions
  custom <name>   Generate with custom filename

Examples:
  node generate-pdf.js
  node generate-pdf.js print
  node generate-pdf.js custom "ocean-star-report"
  node generate-pdf.js all-formats
        `);
        
        // Generate default version
        console.log('🔄 Generating default PDF...\n');
        await generator.generatePDF();
        return;
    }

    const command = args[0].toLowerCase();
    
    switch (command) {
        case 'print':
            await generator.generatePrintQuality();
            break;
            
        case 'digital':
            await generator.generateDigitalVersion();
            break;
            
        case 'all-formats':
            const results = await generator.generateMultipleFormats();
            console.log('\n📊 Summary:');
            results.forEach(result => {
                if (result.success) {
                    console.log(`  ✅ ${result.format}: ${result.path}`);
                } else {
                    console.log(`  ❌ ${result.format}: ${result.error}`);
                }
            });
            break;
            
        case 'custom':
            if (args[1]) {
                await generator.generateWithCustomName(args[1]);
            } else {
                console.error('❌ Please provide a filename for custom generation');
                console.log('Example: node generate-pdf.js custom "my-report"');
            }
            break;
            
        case 'help':
        case '--help':
        case '-h':
            console.log(`
📋 Docking Report PDF Generator - Help
====================================

This script converts your HTML docking report to PDF format using Puppeteer.

Requirements:
- exact_replica_report.html file in the current directory
- Node.js and npm installed
- All dependencies installed (npm install)

Commands:
  default          Generate standard A4 PDF with headers/footers
  print           Generate high-quality version optimized for printing
  digital         Generate version optimized for digital viewing
  all-formats     Generate PDF in A4, Letter, and A3 formats
  custom <name>   Generate PDF with custom filename

File Output:
- All PDFs are saved to the 'output/' directory
- Default filename: docking-report.pdf
- Custom filenames automatically get .pdf extension

Examples:
  node generate-pdf.js                          # Generate default PDF
  node generate-pdf.js print                    # High-quality print version
  node generate-pdf.js custom "ocean-star"      # Custom filename
  node generate-pdf.js all-formats              # Multiple formats
            `);
            break;
            
        default:
            console.error(`❌ Unknown command: ${command}`);
            console.log('Run "node generate-pdf.js help" for available commands');
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
}

module.exports = DockingReportPDFGenerator;