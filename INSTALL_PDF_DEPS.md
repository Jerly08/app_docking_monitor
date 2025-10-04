# Instalasi Dependencies untuk PDF Generation

## Dependencies yang Diperlukan

Untuk mengimplementasikan PDF generation dengan template Word, install dependencies berikut:

```bash
# Core dependencies untuk Word template manipulation
npm install docxtemplater pizzip

# Optional: Untuk convert Word ke PDF (memerlukan setup tambahan)
npm install puppeteer
# atau
npm install @react-pdf/renderer

# Optional: Alternative libraries
npm install officegen
npm install docx
```

## Perintah Install

Jalankan perintah berikut di terminal:

```bash
cd D:\Project\app_monitoring_proyek
npm install docxtemplater pizzip puppeteer
```

## Konfigurasi Tambahan

### 1. TypeScript Types (jika diperlukan)
```bash
npm install --save-dev @types/docxtemplater
```

### 2. Puppeteer Setup (untuk Word to PDF conversion)
Jika menggunakan Puppeteer untuk convert ke PDF:

```javascript
// Tambahkan di next.config.js
const nextConfig = {
  webpack: (config) => {
    config.externals.push({
      puppeteer: 'puppeteer',
    })
    return config
  },
}
```

## Alternatif: Menggunakan LibreOffice untuk Convert PDF

Jika ingin menggunakan LibreOffice untuk convert Word ke PDF:

1. Install LibreOffice di server
2. Gunakan command line interface:

```bash
libreoffice --headless --convert-to pdf --outdir ./output ./input.docx
```

## Environment Variables

Tambahkan ke `.env.local`:

```env
# Path ke LibreOffice (jika menggunakan)
LIBREOFFICE_PATH=/usr/bin/libreoffice

# Temporary directory untuk file processing
TEMP_DIR=./tmp

# Template directory
TEMPLATE_DIR=./public/kopsurat
```

## Testing

Setelah instalasi, test dengan:

1. Restart development server:
```bash
npm run dev:full
```

2. Buka halaman Work Plan & Report
3. Klik tombol "Generate PDF"
4. Check apakah file Word terdownload

## Troubleshooting

### Error: Module not found
```bash
npm install --save docxtemplater pizzip
```

### Puppeteer installation issues
```bash
# Skip Puppeteer download jika ada masalah
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install puppeteer
```

### Memory issues
Tambahkan ke `next.config.js`:
```javascript
const nextConfig = {
  serverRuntimeConfig: {
    maxAge: 0
  },
  experimental: {
    largePageDataBytes: 128 * 1024 // 128KB
  }
}
```

## Production Deployment

Untuk production, pastikan:

1. Dependencies ter-install di server
2. File template dapat diakses
3. Temporary directory memiliki write permissions
4. Memory sufficient untuk PDF generation

```bash
# Build dengan dependencies
npm run build
npm start
```