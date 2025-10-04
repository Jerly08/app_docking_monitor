# Work Package ID System Implementation

## Format ID Baru yang Telah Diimplementasikan

### 1. Work Package (Parent)
- **Format**: `WP-{PROJECT_CODE}-{SEQUENCE}`
- **Contoh**: `WP-FER-001`, `WP-BAH-002`, `WP-SIN-010`

### 2. Task (Child)  
- **Format**: `{PARENT_ID}-T{SEQUENCE}`
- **Contoh**: `WP-FER-001-T01`, `WP-FER-001-T02`, `WP-BAH-002-T01`

## Cara Kerja Sistem

### Ekstraksi Kode Proyek
```javascript
// Dari vessel name: "MT. FERIMAS SEJAHTERA"
// Dihasilkan project code: "FER"

// Algoritma:
// 1. Hapus prefix (MT., KM., MV., MS.)
// 2. Ambil 3 karakter pertama dari kata pertama
// 3. Convert ke uppercase
```

### Contoh Penggunaan di API

#### Membuat Work Package Baru (Parent)
```bash
POST /api/work-items
{
  "title": "PELAYANAN UMUM",
  "description": "Setibanya di muara, kapal dipandu masuk perairan...",
  "projectId": "project-ferimas-id",
  "package": "A",
  // parentId: tidak ada (ini parent)
}

# Hasil: ID yang digenerate = WP-FER-001
```

#### Membuat Task Baru (Child)
```bash
POST /api/work-items
{
  "title": "Realisasi: Setibanya di muara...",
  "description": "Detail implementasi pelayanan umum",
  "projectId": "project-ferimas-id",
  "parentId": "WP-FER-001", // Parent work package
  "package": "A",
}

# Hasil: ID yang digenerate = WP-FER-001-T01
```

## Contoh Data yang Dihasilkan

### Untuk Proyek "MT. FERIMAS SEJAHTERA"

```
WP-FER-001                    # PELAYANAN UMUM
├── WP-FER-001-T01           # Setibanya di muara
├── WP-FER-001-T02           # Sandar/tambat
└── WP-FER-001-T03           # Pengurusan dokumen

WP-FER-002                    # UNIT PERAWATAN LAMBUNG & TANGKI
├── WP-FER-002-T01           # Dok kering
├── WP-FER-002-T02           # Pembersihan lambung
└── WP-FER-002-T03           # Perbaikan tangki

WP-FER-003                    # PERLENGKAPAN & KESELAMATAN
├── WP-FER-003-T01           # Pemeriksaan life jacket
└── WP-FER-003-T02           # Pemeriksaan safety equipment
```

### Untuk Proyek Lain "KM. BAHARI INDAH"

```
WP-BAH-001                    # PELAYANAN UMUM
├── WP-BAH-001-T01           # Setibanya di muara
├── WP-BAH-001-T02           # Sandar/tambat
└── WP-BAH-001-T03           # Pengurusan dokumen

WP-BAH-002                    # UNIT PERAWATAN LAMBUNG & TANGKI
├── WP-BAH-002-T01           # Dok kering
└── WP-BAH-002-T02           # Pembersihan lambung
```

## Keunggulan Format Baru

### ✅ Lebih Mudah Dibaca
- `WP-FER-001` lebih intuitif dari `05/10/25/001`
- Langsung terlihat kode proyek dan sequence

### ✅ Hierarki yang Jelas
- Parent: `WP-FER-001`
- Child: `WP-FER-001-T01`, `WP-FER-001-T02`
- Relasi parent-child terlihat jelas dari ID

### ✅ Skalabilitas
- Bisa menangani hingga 999 work packages per proyek
- Bisa menangani hingga 99 tasks per work package
- Total: 99,801 work items per proyek

### ✅ Kompatibilitas
- ID lama masih bisa digunakan bersamaan
- Sistem otomatis mendeteksi format yang digunakan

## Testing dan Validasi

### Menjalankan Test
```bash
node test-work-package-id.js
```

### Output Test yang Diharapkan
```
🧪 Testing Work Package ID Generation System

1. Testing Work Package ID Format:
  WP-FER-001: ✅ Valid
  WP-FER-002: ✅ Valid
  ...

✅ All tests completed!
```

## API Functions yang Tersedia

### Di idGeneratorService.ts

```javascript
// Generate Work Package ID (parent)
const workPackageId = await idGeneratorService.generateWorkPackageId('project-id')
// Result: WP-FER-001

// Generate Task ID (child)
const taskId = await idGeneratorService.generateTaskId('WP-FER-001')
// Result: WP-FER-001-T01

// Generate otomatis berdasarkan parent
const autoId = await idGeneratorService.generateWorkItemIdNew('project-id', 'WP-FER-001')
// Result: WP-FER-001-T01 (karena ada parent)

const autoId2 = await idGeneratorService.generateWorkItemIdNew('project-id')
// Result: WP-FER-002 (karena tidak ada parent)
```

### Validation Functions

```javascript
// Validasi format Work Package
IdGeneratorService.isWorkPackageFormat('WP-FER-001') // true
IdGeneratorService.isWorkPackageFormat('WP-FER-1')   // false

// Validasi format Task
IdGeneratorService.isTaskFormat('WP-FER-001-T01')    // true
IdGeneratorService.isTaskFormat('WP-FER-001-T1')     // false

// Validasi format baru (Work Package atau Task)
IdGeneratorService.isNewWorkPackageFormat('WP-FER-001')    // true
IdGeneratorService.isNewWorkPackageFormat('WP-FER-001-T01') // true
IdGeneratorService.isNewWorkPackageFormat('05/10/25/001')   // false
```

## Migrasi dari Format Lama

Format lama (`DD/MM/YY/###`) masih akan berfungsi, tetapi semua work item baru akan menggunakan format Work Package. Sistem akan:

1. **Backward Compatibility**: ID lama tetap valid dan bisa digunakan
2. **Forward Migration**: Work item baru otomatis menggunakan format baru  
3. **Mixed Environment**: Kedua format bisa berjalan bersamaan

## Troubleshooting

### Error Handling
Jika terjadi error dalam generate ID, sistem akan:
1. Untuk Work Package: fallback ke `WP-ERR-{timestamp}-{random}`
2. Untuk Task: fallback ke `{parentId}-T-ERR-{timestamp}-{random}`

### Validasi Project
- Sistem memvalidasi bahwa project exists sebelum generate ID
- Jika project tidak ditemukan, akan throw error dengan pesan yang jelas

### Gap Handling
- Sistem otomatis mengisi gap dalam sequence
- Jika ada WP-FER-001, WP-FER-003, maka ID berikutnya adalah WP-FER-002

Sistem ID Work Package baru telah siap digunakan! 🎉