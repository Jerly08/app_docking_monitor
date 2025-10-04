# CARA MEMODIFIKASI TEMPLATE WORD UNTUK EXPORT REPORT

## Masalah Saat Ini
- Export report berhasil berjalan tapi hasilnya kosong
- Template Word "Kop Surat PT PID - Kemayoran.docx" belum memiliki placeholder untuk data

## Solusi

### Langkah 1: Buka Template Word
1. Buka file: `public/kopsurat/Kop Surat PT PID - Kemayoran.docx`
2. Anda akan melihat kop surat perusahaan yang sudah ada

### Langkah 2: Tambahkan Content Template
Setelah kop surat, tambahkan content berikut:

```
{reportTitle}
{projectName} - {vesselName}
Tanggal: {reportDate}

RINGKASAN PROYEK
================
Nama Kapal      : {vesselInfo.name}
Pemilik         : {vesselInfo.owner}
LOA             : {vesselInfo.loa}
LPP             : {vesselInfo.lpp}
Breadth         : {vesselInfo.breadth}
DWT/GT          : {vesselInfo.dwtGt}
Dok Type        : {vesselInfo.dokType}
Status          : {vesselInfo.dockPeriod}

STATISTIK PROYEK
================
Total Tasks     : {totalTasks}
Avg Progress    : {avgCompletion}%
Milestones      : {milestones}
Conflicts       : {conflictedTasks}

DETAIL WORK ITEMS
================
{#workItems}
{number}. {taskName}
   - Progress: {progress}
   - Resource: {resources}
   - Duration: {duration}
   - Package: {package}
   - Status: {status}
   - Start: {startDate} | Finish: {finishDate}

{/workItems}

====================================
Dibuat oleh: {generatedBy}
Tanggal: {generatedDate}
{companyName}
```

### Langkah 3: Formatting (Opsional)
- **Bold** untuk header (RINGKASAN PROYEK, STATISTIK PROYEK, dll)
- **Center** untuk judul utama
- Gunakan font yang sesuai dengan kop surat

### Langkah 4: Simpan File
- Save dengan nama yang sama: "Kop Surat PT PID - Kemayoran.docx"
- Pastikan dalam format .docx

## Penjelasan Placeholder

### Header Variables
- `{reportTitle}` → "WORK PLAN & PROGRESS REPORT"
- `{projectName}` → Nama project (ex: "MV. OCEAN STAR / TAHUN 2025")
- `{vesselName}` → Nama kapal (ex: "MV. OCEAN STAR")
- `{reportDate}` → Tanggal generate report

### Vessel Info Object
- `{vesselInfo.name}` → Nama kapal
- `{vesselInfo.owner}` → Pemilik kapal
- `{vesselInfo.loa}`, `{vesselInfo.lpp}`, dll → Spesifikasi kapal

### Statistics
- `{totalTasks}` → Total work items
- `{avgCompletion}` → Rata-rata progress
- `{milestones}` → Jumlah milestone
- `{conflictedTasks}` → Jumlah konflik

### Work Items Loop
```
{#workItems}
  ... template untuk setiap work item ...
{/workItems}
```

Variables dalam loop:
- `{number}` → Nomor item (A, B, C atau 1, 2, 3)
- `{taskName}` → Nama task
- `{progress}` → Progress (ex: "50%")
- `{resources}` → Resource yang assigned
- `{duration}` → Durasi (ex: "5 hari")
- `{package}` → Package name
- `{status}` → Status (ex: "Dalam Progress")
- `{startDate}`, `{finishDate}` → Tanggal

### Footer
- `{generatedBy}` → "System Administrator"
- `{generatedDate}` → Tanggal generate
- `{companyName}` → "PT. PID - Kemayoran"

## Testing
Setelah modifikasi template:
1. Jalankan aplikasi
2. Pilih project dengan work items
3. Klik "Export Report"
4. Check hasil download - seharusnya terisi dengan data real

## Troubleshooting
- Jika masih kosong: Check placeholder tidak ada typo
- Jika error: Pastikan format { } konsisten
- Jika loop tidak kerja: Check `{#workItems}` dan `{/workItems}` syntax