# Template Content untuk File Word

Berikut adalah content yang harus dimasukkan ke dalam file Word `Kop Surat PT PID - Kemayoran.docx`:

## Template Content untuk Docking Report

```
[PASTE CONTENT INI KE DALAM FILE WORD]

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

No  | URAIAN - KETERANGAN                                    | VOL | SAT | KETERANGAN      | LAMPIRAN
----|-------------------------------------------------------|-----|-----|----------------|----------
{#items}
{number}   | {taskName}                                          | {duration} | LS  | {status}        | [FOTO AREA]
    | Realisasi :                                           |     |     |                |
    | {realizationChild.description}                        |     |     | {realizationChild.status} |
    | {realizationNotes}                                    |     |     |                |
{/items}

{/packageGroups}

---
Dibuat oleh: {generatedBy}
Tanggal: {generatedDate}
{companyName}
```

## Cara Menggunakan Template Ini

1. **Buka file Word**: `public/kopsurat/Kop Surat PT PID - Kemayoran.docx`

2. **Hapus content lama** (jika ada)

3. **Paste content di atas** ke dalam file Word

4. **Format sesuai kebutuhan**:
   - Atur font yang sesuai (Arial, Times New Roman, etc.)
   - Atur alignment untuk header (center)
   - Buat tabel untuk work items
   - Tambahkan border dan formatting

5. **Save file**

## Data yang Akan Diisi Otomatis

Berdasarkan data dari Work Items Table, sistem akan mengisi:

### Dari Header Table:
- `{vesselName}` = "MT. FERIMAS SEJAHTERA"
- `{totalTasks}` = Jumlah total task (contoh: 37)
- `{avgCompletion}` = Rata-rata progress (contoh: 36%)

### Dari Setiap Row Table:
- `{number}` = A, B, C untuk "Pelayanan Umum" atau 1, 2, 3 untuk package lain
- `{taskName}` = Dari kolom "TASK NAME"
- `{duration}` = Dari kolom "DURATION (DAYS)"
- `{status}` = Berdasarkan "% COMPLETE": 
  - 100% = "SELESAI 100%"
  - 75-99% = "HAMPIR SELESAI"
  - dll.
- `{realizationChild.description}` = Generated berdasarkan task type
- `{realizationNotes}` = Generated notes dengan format Ket: ...

## Contoh Output yang Diharapkan

Berdasarkan data dari gambar table:

```
A PELAYANAN UMUM

No  | URAIAN - KETERANGAN                                    | VOL | SAT | KETERANGAN      | LAMPIRAN
----|-------------------------------------------------------|-----|-----|----------------|----------
A   | Setibanya di muara, kapal dipandu masuk perairan dock | 1   | LS  | BELUM DIMULAI   | [FOTO AREA]
    | dibantu 1 (satu) tugboat, selesainya dipandu kembali |     |     |                |
    | keluar dari perairan dock                             |     |     |                |
    | Realisasi :                                           |     |     |                |
    | Diberikan fasilitas kapal pandu setibanya dimuara    |     |     | SELESAI 100%   |
    | untuk masuk area Galangan Surya, 1 set               |     |     |                |
    | Selesai docking dipandu kembali keluar dari area     |     |     |                |
    | Galangan Surya                                        |     |     |                |
    | Ket : Masuk area dock pada 23 Agustus 2025           |     |     |                |
    | menggunakan 1 kapal pandu                             |     |     |                |
    | Naik dock pada 23 Agustus 2025 menggunakan 1         |     |     |                |
    | kapal pandu                                           |     |     |                |
    | Kapal turun dock pada 07 September 2025              |     |     |                |
    | menggunakan 1 kapal pandu                             |     |     |                |
    | Keluar area dock pada 08 September 2025              |     |     |                |
    | menggunakan 1 kapal pandu                             |     |     |                |
```

## Testing

Setelah modifikasi template:
1. Buka halaman Work Plan & Report
2. Klik "Generate Docking Report (Word)"
3. Download dan buka file hasil
4. Verifikasi format sesuai dengan yang diinginkan