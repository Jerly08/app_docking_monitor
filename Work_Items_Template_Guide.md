# Work Items Template - Panduan Penggunaan

## File yang Tersedia
1. `Work_Items_Template.xlsx` - Template Excel dengan formatting dan instruksi lengkap
2. `Work_Items_Template.csv` - Template CSV untuk kompatibilitas universal
3. `Work_Items_Template_Guide.md` - Panduan penggunaan ini

## Struktur Template

### Kolom-kolom Template:

| Kolom | Deskripsi | Contoh |
|-------|-----------|---------|
| **ID** | Identifier unik untuk setiap work item | WP-OCE-001, WP-OCE-001-T01 |
| **Level** | Tingkat hirarki (1=Parent, 2=Child, 3=Sub-child) | 1, 2, 3 |
| **Parent_ID** | ID dari parent task (kosong untuk parent tasks) | WP-OCE-001 |
| **Package** | Kategori atau paket kerja | LEGACY, PELAYANAN UMUM, REALISASI |
| **Task_Name** | Nama/deskripsi tugas | Diberikan aliran listrik dari darat ke kapal selam |
| **Duration_Days** | Durasi dalam hari | 10, 15, 30 |
| **Start_Date** | Tanggal mulai | 2025-10-10 |
| **Finish_Date** | Tanggal selesai | 2025-10-20 |
| **Percent_Complete** | Persentase penyelesaian | 56%, 100% |
| **Resource_Names** | Nama resource/PIC | gras teit, test, team A |
| **Milestone** | Apakah milestone (TRUE/FALSE) | TRUE, FALSE |
| **Notes** | Catatan tambahan | Click to view full detail |
| **Status** | Status tugas | ACTIVE, COMPLETED, ON_HOLD |

## Cara Menggunakan Template

### 1. Membuat Parent Task (Level 1)
```
ID: WP-OCE-002
Level: 1
Parent_ID: [kosong]
Package: PELAYANAN UMUM
Task_Name: Instalasi Sistem Kelistrikan
Duration_Days: 20
Start_Date: 2025-10-15
Finish_Date: 2025-11-04
Percent_Complete: 0%
Resource_Names: Team Listrik
Milestone: TRUE
Notes: Proyek instalasi utama
Status: ACTIVE
```

### 2. Membuat Child Task (Level 2)
```
ID: WP-OCE-002-T01
Level: 2
Parent_ID: WP-OCE-002
Package: LEGACY
Task_Name: Survey lokasi instalasi
Duration_Days: 3
Start_Date: 2025-10-15
Finish_Date: 2025-10-17
Percent_Complete: 0%
Resource_Names: Surveyor A
Milestone: FALSE
Notes: Survey awal
Status: ACTIVE
```

### 3. Membuat Sub-Child Task (Level 3)
```
ID: WP-OCE-002-T01-S01
Level: 3
Parent_ID: WP-OCE-002-T01
Package: SURVEY
Task_Name: Pengukuran area
Duration_Days: 1
Start_Date: 2025-10-15
Finish_Date: 2025-10-15
Percent_Complete: 0%
Resource_Names: Teknisi A
Milestone: FALSE
Notes: Pengukuran detail
Status: ACTIVE
```

## Konvensi Penamaan ID

### Format ID yang Disarankan:
- **Parent Task**: `WP-OCE-XXX` (dimana XXX adalah nomor urut)
- **Child Task**: `WP-OCE-XXX-TYY` (dimana T = Task, YY = nomor urut)
- **Sub-Child Task**: `WP-OCE-XXX-TYY-SZZ` (dimana S = Sub-task, ZZ = nomor urut)

### Contoh Hierarki Lengkap:
```
WP-OCE-003                          (Level 1 - Parent)
├── WP-OCE-003-T01                  (Level 2 - Child)
│   ├── WP-OCE-003-T01-S01         (Level 3 - Sub-child)
│   └── WP-OCE-003-T01-S02         (Level 3 - Sub-child)
├── WP-OCE-003-T02                  (Level 2 - Child)
└── WP-OCE-003-T03                  (Level 2 - Child)
```

## Tips Penggunaan

1. **Konsistensi**: Gunakan format tanggal yang konsisten (YYYY-MM-DD)
2. **Hierarki**: Pastikan Parent_ID selalu merujuk ke ID yang benar
3. **Status**: Gunakan status standar (ACTIVE, COMPLETED, ON_HOLD, CANCELLED)
4. **Milestone**: Tandai milestone penting dengan TRUE
5. **Resource**: Gunakan nama resource yang konsisten
6. **Duration**: Hitung durasi dengan akurat untuk perencanaan yang baik

## Import ke Sistem Project Management

Template ini dapat digunakan untuk:
- Import ke Microsoft Project
- Upload ke sistem project management web
- Integrasi dengan tools planning lainnya
- Tracking progress manual

## Contoh Data Lengkap

Lihat sheet "Work Items Template" dalam file Excel untuk contoh data yang sudah diformat sesuai dengan work items table Anda.

---

**Catatan**: Template ini dibuat berdasarkan analisis work items table dari project MV. OCEAN STAR dan dapat disesuaikan dengan kebutuhan project lainnya.