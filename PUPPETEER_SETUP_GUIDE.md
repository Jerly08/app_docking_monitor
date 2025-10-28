# Puppeteer Setup Guide

## Problem
PDF generation was failing with error:
```
Failed to generate report: 500 - {"error":"Failed to generate work plan report"}
```

## Root Cause
Puppeteer package was installed but Chrome/Chromium binary was not downloaded.

Error message:
```
Could not find Chrome (ver. 141.0.7390.54)
```

## Solution
Install Chrome binary for Puppeteer:

```bash
npx puppeteer browsers install chrome
```

This downloads Chrome to: `C:\Users\[USERNAME]\.cache\puppeteer\chrome\`

## Verification
Test Puppeteer installation:

```bash
node test-puppeteer.js
```

Expected output:
```
✅ Browser launched successfully!
Browser version: Chrome/141.0.7390.54
✅ PDF generated successfully!
```

## Configuration Improvements Made

### 1. API Route Error Handling (`src/app/api/reports/work-plan/route.ts`)
- Added detailed error logging
- Expose error details in response for debugging
- Include timestamp for error tracking

### 2. PDF Service Logging (`src/lib/exactReplicaPdfService.ts`)
- Added step-by-step console logging
- Improved browser launch configuration for Windows
- Added proper browser cleanup on error
- Increased timeouts for stability

### 3. Browser Launch Args
```javascript
{
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu'
  ],
  timeout: 60000
}
```

## Deployment Notes

When deploying to production:

1. **Heroku/Cloud**: Install buildpack for Chrome
   ```
   heroku buildpacks:add jontewks/puppeteer
   ```

2. **Docker**: Use node image with Chrome pre-installed
   ```dockerfile
   FROM node:20-slim
   RUN apt-get update && apt-get install -y \
       chromium \
       && rm -rf /var/lib/apt/lists/*
   ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
       PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
   ```

3. **Vercel**: Add `@vercel/puppeteer` package
   ```bash
   npm install @vercel/puppeteer
   ```

## Testing
PDF generation now works for:
- Docking Reports with vessel information
- Work plan tables with hierarchical data
- Progress tracking with status badges
- Image attachments in Lampiran section

## Files Modified
1. `src/app/api/reports/work-plan/route.ts` - Improved error handling
2. `src/lib/exactReplicaPdfService.ts` - Enhanced logging and browser config
3. `package.json` - Already had puppeteer v24.23.0

## Success Criteria
✅ Puppeteer launches Chrome successfully
✅ PDF generation completes without errors
✅ Generated PDFs match the exact replica format
✅ Error messages are informative for debugging
