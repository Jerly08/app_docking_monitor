# Docking Report PDF Generator - PowerShell Script
# ==============================================

param(
    [string]$Command = "default",
    [string]$CustomName = "",
    [switch]$Help
)

# Display banner
Write-Host ""
Write-Host "Docking Report PDF Generator" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Show help if requested
if ($Help -or $Command -eq "help") {
    Write-Host "This script generates PDF files from your HTML docking report." -ForegroundColor White
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\generate-pdf.ps1 [command] [options]" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  default          Generate standard A4 PDF" -ForegroundColor Gray
    Write-Host "  print           Generate high-quality print version" -ForegroundColor Gray
    Write-Host "  digital         Generate digital viewing version" -ForegroundColor Gray
    Write-Host "  all-formats     Generate A4, Letter, and A3 versions" -ForegroundColor Gray
    Write-Host "  custom          Generate with custom filename (use -CustomName)" -ForegroundColor Gray
    Write-Host "  help            Show this help message" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\generate-pdf.ps1" -ForegroundColor Gray
    Write-Host "  .\generate-pdf.ps1 print" -ForegroundColor Gray
    Write-Host "  .\generate-pdf.ps1 custom -CustomName 'ocean-star-report'" -ForegroundColor Gray
    Write-Host "  .\generate-pdf.ps1 all-formats" -ForegroundColor Gray
    Write-Host "  .\generate-pdf.ps1 -Help" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if required files exist
if (-not (Test-Path "exact_replica_report.html")) {
    Write-Host "[ERROR] exact_replica_report.html not found!" -ForegroundColor Red
    Write-Host "Make sure the HTML report file exists in the current directory." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "generate-pdf.js")) {
    Write-Host "[ERROR] generate-pdf.js not found!" -ForegroundColor Red
    Write-Host "Make sure the PDF generator script exists in the current directory." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if package.json exists and dependencies are installed
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] package.json not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the correct project directory." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "node_modules")) {
    Write-Host "[WARNING] node_modules not found!" -ForegroundColor Yellow
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        npm install
        Write-Host "[OK] Dependencies installed successfully!" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "[ERROR] Error installing dependencies!" -ForegroundColor Red
        Write-Host "Please run 'npm install' manually." -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Build the command
$nodeCommand = "node generate-pdf.js"

switch ($Command.ToLower()) {
    "default" {
        Write-Host "Generating default PDF..." -ForegroundColor Blue
        $nodeCommand = "node generate-pdf.js"
    }
    "print" {
        Write-Host "Generating high-quality print version..." -ForegroundColor Blue
        $nodeCommand = "node generate-pdf.js print"
    }
    "digital" {
        Write-Host "Generating digital version..." -ForegroundColor Blue
        $nodeCommand = "node generate-pdf.js digital"
    }
    "all-formats" {
        Write-Host "Generating multiple formats..." -ForegroundColor Blue
        $nodeCommand = "node generate-pdf.js all-formats"
    }
    "custom" {
        if ([string]::IsNullOrWhiteSpace($CustomName)) {
            Write-Host "[ERROR] Custom name required!" -ForegroundColor Red
            Write-Host "Example: .\generate-pdf.ps1 custom -CustomName 'my-report'" -ForegroundColor Yellow
            Write-Host ""
            Read-Host "Press Enter to exit"
            exit 1
        }
        Write-Host "Generating custom PDF: $CustomName" -ForegroundColor Blue
        $nodeCommand = "node generate-pdf.js custom `"$CustomName`""
    }
    default {
        Write-Host "[ERROR] Unknown command: $Command" -ForegroundColor Red
        Write-Host "Run '.\generate-pdf.ps1 help' for available commands." -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""

# Execute the Node.js command
try {
    Write-Host "Executing: $nodeCommand" -ForegroundColor Gray
    Write-Host ""
    
    # Run the command and capture output
    $output = Invoke-Expression $nodeCommand 2>&1
    
    # Display the output with colors
    foreach ($line in $output) {
        $lineStr = $line.ToString()
        if ($lineStr -like "*PDF generated successfully*") {
            Write-Host $lineStr -ForegroundColor Green
        } elseif ($lineStr -like "*Error*") {
            Write-Host $lineStr -ForegroundColor Red
        } elseif ($lineStr -like "*File size*") {
            Write-Host $lineStr -ForegroundColor Cyan
        } elseif ($lineStr -like "*Starting*" -or $lineStr -like "*Loading*" -or $lineStr -like "*Generating*") {
            Write-Host $lineStr -ForegroundColor Yellow
        } else {
            Write-Host $lineStr -ForegroundColor White
        }
    }
    
    Write-Host ""
    Write-Host "[SUCCESS] PDF generation completed!" -ForegroundColor Green
    
    # Check if output directory exists and show files
    if (Test-Path "output") {
        Write-Host ""
        Write-Host "Generated files in output directory:" -ForegroundColor Cyan
        Get-ChildItem "output" -Filter "*.pdf" | ForEach-Object {
            $size = [math]::Round($_.Length / 1MB, 2)
            Write-Host "  $($_.Name) ($size MB)" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "[SUCCESS] Check the 'output' folder for your PDF files." -ForegroundColor Green
    }
    
} catch {
    Write-Host "[ERROR] Error executing PDF generation:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "1. Make sure all dependencies are installed (npm install)" -ForegroundColor Gray
    Write-Host "2. Check that exact_replica_report.html exists" -ForegroundColor Gray
    Write-Host "3. Verify Node.js and npm are properly installed" -ForegroundColor Gray
    Write-Host "4. Try running the command manually: $nodeCommand" -ForegroundColor Gray
}

Write-Host ""
Read-Host "Press Enter to exit"