# Docking Report PDF Generator

## 📋 Overview
This system converts your HTML docking report to high-quality PDF format using Puppeteer. The solution includes both Node.js scripts and PowerShell wrappers for easy use on Windows systems.

## 🚀 Quick Start

### Method 1: PowerShell Script (Recommended for Windows)
```powershell
# Generate default PDF
.\generate-pdf.ps1

# Generate high-quality print version
.\generate-pdf.ps1 print

# Generate custom named PDF
.\generate-pdf.ps1 custom -CustomName "ocean-star-report"

# Generate all formats (A4, Letter, A3)
.\generate-pdf.ps1 all-formats

# Show help
.\generate-pdf.ps1 -Help
```

### Method 2: Node.js Direct
```bash
# Generate default PDF
node generate-pdf.js

# Generate print version
node generate-pdf.js print

# Generate digital version
node generate-pdf.js digital

# Generate custom named PDF
node generate-pdf.js custom "my-report-name"

# Generate all formats
node generate-pdf.js all-formats

# Show help
node generate-pdf.js help
```

## 📁 File Structure
```
project-root/
├── exact_replica_report.html      # Source HTML report
├── generate-pdf.js               # Main PDF generator script
├── generate-pdf.ps1              # PowerShell wrapper script
├── output/                       # Generated PDFs folder
│   ├── docking-report.pdf        # Default output
│   ├── docking-report-print.pdf  # Print version
│   └── ...                       # Other generated files
└── package.json                  # Node.js dependencies
```

## 🛠️ Requirements

### System Requirements
- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)
- **Windows PowerShell** (for .ps1 scripts)

### Dependencies (automatically handled)
- `puppeteer` - HTML to PDF conversion
- `jspdf` - PDF manipulation
- `pdf-lib` - PDF processing
- `html2canvas` - Canvas rendering

## 📄 PDF Output Options

### Default Format
- **Paper**: A4
- **Margins**: 0.5 inch all sides
- **Headers/Footers**: Yes
- **Background**: Preserved
- **Quality**: Standard

### Print Format
- **Paper**: A4
- **Margins**: 0.3 inch (optimized for printing)
- **Headers/Footers**: Minimal
- **Background**: Preserved
- **Quality**: High

### Digital Format
- **Paper**: A4
- **Margins**: 0.6 inch top/bottom, 0.4 inch sides
- **Headers/Footers**: Enhanced
- **Background**: Preserved
- **Quality**: Optimized for screen viewing

## 🎯 Features

### ✅ What's Included
- **Responsive Layout**: Maintains formatting across different paper sizes
- **Page Headers**: Ship name and report type
- **Page Footers**: Page numbers and generation date
- **Table Preservation**: Perfect table formatting with borders
- **Image Placeholders**: Maintains image cell structure
- **Status Styling**: Color-coded completion status
- **Column Alignment**: Precise text alignment matching original

### 🔧 Customization Options
- **Custom Filenames**: Name your PDFs anything you want
- **Multiple Formats**: A4, Letter, A3 paper sizes
- **Quality Settings**: Standard, print, or digital optimized
- **Margin Control**: Adjustable margins for different use cases

## 🚨 Troubleshooting

### Common Issues

#### "Node.js not found"
```bash
# Install Node.js from https://nodejs.org/
# Verify installation:
node --version
npm --version
```

#### "HTML file not found"
- Ensure `exact_replica_report.html` exists in the project directory
- Check file permissions
- Verify file path is correct

#### "Dependencies missing"
```bash
# Install dependencies manually:
npm install

# Or let PowerShell script handle it automatically:
.\generate-pdf.ps1
```

#### "PDF generation fails"
- Check available disk space
- Ensure output directory is writable
- Try running as administrator if permissions issue
- Close any PDF viewers that might lock the file

#### "PowerShell execution policy"
```powershell
# Allow script execution (run as Administrator):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or bypass for single execution:
PowerShell -ExecutionPolicy Bypass -File .\generate-pdf.ps1
```

## 💡 Tips & Best Practices

### Performance Optimization
- **Close unnecessary programs** before PDF generation
- **Large reports** may take 30-60 seconds to process
- **Multiple formats** generation will take longer

### Quality Settings
- Use **print format** for physical printing
- Use **digital format** for email/screen viewing
- Use **default format** for general purpose

### File Management
- PDFs are saved to `output/` directory
- Existing files are overwritten
- Use custom names to avoid conflicts

## 🔄 Updates & Maintenance

### Column Alignment Fixes
The latest version includes comprehensive fixes for proper column alignment in the vessel information section:
- **Right Labels**: "Pemilik:", "Tipe:", "GRT:", and "Status:" are properly right-aligned
- **LOA/LBP/BM/T Values**: Now perfectly aligned in the same column as "MV. OCEAN STAR"
- **Spacing**: Consistent spacing and positioning to match original reference format

### Version History
- **v1.0**: Initial PDF generation capability
- **v1.1**: Added multiple format support
- **v1.2**: Fixed column alignment issues
- **v1.3**: Added PowerShell wrapper with enhanced error handling
- **v1.4**: Perfect alignment fix for LOA, LBP, BM, T values

## 📞 Support

If you encounter issues:
1. Check this README for common solutions
2. Verify all requirements are met
3. Try running with elevated permissions
4. Check Node.js and npm are properly installed
5. Ensure HTML source file is valid and accessible

## 🎉 Success Indicators

When PDF generation works correctly, you should see:
- ✅ Green checkmark messages
- 📊 File size information
- 📁 Output directory listing
- Generated PDF opens properly in PDF viewer
- All formatting, tables, and alignment preserved