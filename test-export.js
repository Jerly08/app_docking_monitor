// Simple test for export functionality
const fs = require('fs');
const path = require('path');

console.log('Testing export functionality...');

// Check if template file exists
const templatePath = path.join(process.cwd(), 'public', 'kopsurat', 'Kop Surat PT PID - Kemayoran.docx');
console.log('Template path:', templatePath);

if (fs.existsSync(templatePath)) {
  const stats = fs.statSync(templatePath);
  console.log('Template file exists, size:', stats.size, 'bytes');
  
  if (stats.size < 1000) {
    console.log('⚠️  Template file is too small, might be empty');
  } else {
    console.log('✅ Template file looks good');
  }
} else {
  console.log('❌ Template file not found');
}

// Test Word generation (without actual content)
try {
  const PizZip = require('pizzip');
  console.log('✅ PizZip loaded successfully');
  
  const Docxtemplater = require('docxtemplater');
  console.log('✅ Docxtemplater loaded successfully');
  
  console.log('✅ All dependencies are working');
} catch (error) {
  console.error('❌ Error loading dependencies:', error.message);
}

console.log('\n🧪 Export functionality test completed');