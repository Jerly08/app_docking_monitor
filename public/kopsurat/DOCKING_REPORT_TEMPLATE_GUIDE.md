# Template Word untuk Docking Report

Berdasarkan format dari gambar yang diberikan, template harus mengikuti struktur laporan docking standard.

## Header Section

```
                                        DOCKING REPORT
                     {vesselName} / TAHUN {reportYear}

Nama armada        : {vesselInfo.name}            Pemilik    : {vesselInfo.owner}
Ukuran armada      : LOA                          DWT/GT     : {vesselInfo.dwtGt}
                     : LPP                         Dok Dioda  : Dianalisa
                     : B                           Type       : DSS Survey
                     : H                           Status     : {vesselInfo.dockPeriod}
```

## Summary Statistics Section

```
Total Tasks: {totalTasks}    Avg % Complete: {avgCompletion}%    Milestones: {milestones}    Conflicted Tasks: {conflictedTasks}
```

## Work Items Table

```
{#packageGroups}
{packageName}

No | URAIAN - KETERANGAN | VOL | SAT | KETERANGAN | LAMPIRAN

{#items}
{number} | {taskName} | {duration} | LS | {status} | [FOTO AREA]
   | {description} |  |  |  | 
   | {realizationNotes} |  |  |  |
{/items}

{/packageGroups}
```

## Contoh Template Structure Lengkap

```
[HEADER PERUSAHAAN/LOGO]

                                        DOCKING REPORT
                     {vesselName} / TAHUN {reportYear}

Nama armada        : {vesselInfo.name}            Pemilik    : {vesselInfo.owner}  
Ukuran armada      : LOA                          DWT/GT     : {vesselInfo.dwtGt}
                     : LPP                         Dok Dioda  : Dianalisa
                     : B                           Type       : DSS Survey  
                     : H                           Status     : {vesselInfo.dockPeriod}

===============================================================================
Total Tasks: {totalTasks}    Avg % Complete: {avgCompletion}%    Milestones: {milestones}    Conflicted Tasks: {conflictedTasks}
===============================================================================

{#packageGroups}

{packageName}

No | URAIAN - KETERANGAN | VOL | SAT | KETERANGAN | LAMPIRAN
---|---------------------|-----|-----|-------------|----------
{#items}
{number}  | {taskName} | {duration} | LS | {status} | [FOTO]
   | Realisasi : |  |  |  | 
   | {description} |  |  | {status} | 
   | {realizationNotes} |  |  |  |
{/items}

{/packageGroups}

---
Dibuat oleh: {generatedBy}
Tanggal: {generatedDate}  
{companyName}
```

## Placeholder Khusus untuk Docking Report

### Vessel Information
- `{vesselInfo.name}` - Nama kapal
- `{vesselInfo.owner}` - Pemilik kapal
- `{vesselInfo.dwtGt}` - DWT/GT specifications
- `{vesselInfo.dockPeriod}` - Periode docking (SPECIAL SURVEY, etc.)
- `{reportYear}` - Tahun laporan

### Work Items Loop
- `{#packageGroups}` - Loop untuk setiap package
  - `{packageName}` - Nama package (PELAYANAN UMUM, dll)
  - `{#items}` - Loop untuk items dalam package
    - `{number}` - Nomor urut (A, 1, 2, dst)
    - `{taskName}` - Nama task
    - `{description}` - Deskripsi detail
    - `{realizationNotes}` - Catatan realisasi
    - `{status}` - Status (SELESAI 100%, dll)
    - `{duration}` - Durasi
  - `{/items}`
- `{/packageGroups}`

## Format Numbering

- Package "Pelayanan Umum": A, B, C, ...
- Package lainnya: 1, 2, 3, ...

## Status Format

- 100% completion: "SELESAI 100%"
- 75-99%: "HAMPIR SELESAI" 
- 50-74%: "SEDANG PROGRESS"
- 25-49%: "MULAI DIKERJAKAN"
- 0-24%: "BELUM DIMULAI"
- Realization items: "REALISASI"

## Sample Data Structure

Berikut contoh data yang akan mengisi template:

```json
{
  "reportTitle": "DOCKING REPORT",
  "vesselName": "MT. FERIMAS SEJAHTERA", 
  "reportYear": "2025",
  "vesselInfo": {
    "name": "MT. FERIMAS SEJAHTERA",
    "owner": "PT. Industri Transpalme",
    "dwtGt": "5.5/3 meter",
    "dockPeriod": "SPECIAL SURVEY"
  },
  "totalTasks": 37,
  "avgCompletion": 36,
  "milestones": 2,
  "conflictedTasks": 24,
  "packageGroups": [
    {
      "packageName": "PELAYANAN UMUM",
      "items": [
        {
          "number": "A",
          "taskName": "Setibanya di muara, kapal dipandu masuk perairan dock dibantu 1 (satu) tugboat",
          "description": "Diberikan fasilitas kapal pandu setibanya dimuara untuk masuk area Galangan Surya, 1 set SELESAI 100%",
          "realizationNotes": "Ket : Masuk area dock pada 23 Agustus 2025 menggunakan 1 kapal pandu",
          "status": "SELESAI 100%",
          "duration": 1
        }
      ]
    }
  ]
}
```

## Foto/Lampiran Section

Untuk setiap item yang memiliki foto, tambahkan placeholder:
- `{#hasPhoto}[FOTO AREA]{/hasPhoto}`
- Atau gunakan conditional: `{photo_url}` jika ada

## Testing Template

1. Modifikasi file `Kop Surat PT PID - Kemayoran.docx`
2. Tambahkan struktur template di atas
3. Test dengan klik "Generate PDF" di aplikasi
4. Verifikasi format sesuai dengan gambar referensi