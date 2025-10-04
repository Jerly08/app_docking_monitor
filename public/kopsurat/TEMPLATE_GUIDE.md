# Template Word untuk Work Plan & Report

## Cara Menggunakan Template

Template Word `Kop Surat PT PID - Kemayoran.docx` perlu dimodifikasi dengan menambahkan placeholder yang akan diisi secara otomatis oleh sistem.

## Placeholder yang Tersedia

### Header Information
```
{reportTitle}          - Judul laporan (contoh: WORK PLAN & PROGRESS REPORT)
{projectName}          - Nama proyek
{reportDate}           - Tanggal laporan
{companyName}          - Nama perusahaan
```

### Summary Statistics
```
{totalTasks}           - Total jumlah task
{avgCompletion}        - Rata-rata progress (%)
{milestones}           - Jumlah milestone
```

### Work Items Table
Untuk membuat tabel work items, gunakan loop dengan format berikut:

```
{#workItems}
| {id} | {taskName} | {progress} | {resources} | {startDate} | {finishDate} | {duration} | {package} | {milestone} | {status} |
{/workItems}
```

### Footer
```
{generatedBy}          - Dibuat oleh
{generatedDate}        - Tanggal dibuat
```

## Contoh Template Structure

```
[LOGO PERUSAHAAN]

{reportTitle}
{projectName}
Tanggal: {reportDate}

RINGKASAN EKSEKUTIF
- Total Tasks: {totalTasks}
- Rata-rata Progress: {avgCompletion}%
- Milestones: {milestones}

DETAIL WORK ITEMS
{#workItems}
Task ID: {id}
Nama Task: {taskName}
Progress: {progress}
Resource: {resources}
Start: {startDate} - Finish: {finishDate}
Duration: {duration}
Package: {package}
Milestone: {milestone}
Status: {status}

{/workItems}

---
Dibuat oleh: {generatedBy}
Tanggal: {generatedDate}
{companyName}
```

## Langkah-langkah Modifikasi

1. **Buka file template** `Kop Surat PT PID - Kemayoran.docx`
2. **Tambahkan konten** sesuai struktur di atas
3. **Gunakan placeholder** dalam kurung kurawal `{nama_placeholder}`
4. **Untuk tabel/list**, gunakan loop `{#workItems}...{/workItems}`
5. **Simpan file** dengan nama yang sama

## Tip Formatting

- **Bold text**: Gunakan format bold untuk header dan label
- **Tables**: Gunakan tabel Word untuk layout yang rapi
- **Headers/Footers**: Manfaatkan header/footer Word untuk kop surat
- **Page breaks**: Tambahkan page break jika diperlukan
- **Styling**: Gunakan styles Word untuk konsistensi format

## Testing

Untuk test template:
1. Jalankan aplikasi
2. Buka halaman Work Plan & Report
3. Klik tombol "Generate PDF"
4. Check hasil download apakah sesuai dengan template

## Troubleshooting

- **Placeholder tidak terisi**: Pastikan nama placeholder sesuai dengan yang didefinisikan di code
- **Format rusak**: Pastikan tidak ada karakter khusus di dalam placeholder
- **Loop tidak bekerja**: Pastikan syntax loop `{#array}...{/array}` benar