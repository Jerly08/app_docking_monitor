# Analisis Struktur Hierarki Excel: Repair List Docking MT. Ferimas Sejahtera Thn. 2025

## Executive Summary

File Excel "Repair List Docking MT. Ferimas Sejahtera Thn. 2025.xlsx" merupakan dokumen template repair list untuk kegiatan docking kapal dengan struktur hierarki yang sangat terorganisir. File ini berisi 494 baris x 7 kolom dengan **6 work packages** yang mencakup **64 work items** dalam berbagai tingkat hierarki.

## Struktur Dokumen

### 1. Document Header (Rows 1-9)
```
📄 REPAIR LIST DOCKING
🚢 MT. FERIMAS SEJAHTERA / TAHUN 2025
```

**Vessel Specifications:**
- **Nama Kapal**: MT. FERIMAS SEJAHTERA  
- **Pemilik**: PT. INDOLINE INCOMEKITA
- **Tipe**: OIL TANKER
- **LOA**: 64,02 meter
- **LBP**: 59,90 meter  
- **Beam (BM)**: 10,00 meter
- **GRT**: 762 GT
- **Status**: SPECIAL SURVEY

### 2. Table Structure (Starting Row 10)
```
| NO. | URAIAN - PEKERJAAN | VOL | SAT | KETERANGAN |
```

## Hierarki Work Packages

### Package A: PELAYANAN UMUM (13 items)
**Service-oriented activities untuk dock operations**

**Struktur Hierarki:**
```
A. PELAYANAN UMUM
├── 1. Setibanya di muara, kapal dipandu masuk perairan dock...
│   └── selesainya dipandu kembali keluar dari perairan dock
├── 2. Asistensi naik/turun dock dan penataan ganjel
├── 3. Docking undocking  
├── 4. Dry docking (15 hr)
├── 5. Dibuatkan docking report
├── 6. Diberikan fasilitas sandar (2 hr)
├── 7. Diberikan instalasi pemadam kebakaran...
│   ├── kebakaran selama kapal di atas dock
│   └── b. Sambung lepas selang pemadam (1 set pelaksanaan)
├── 8. Diberikan penjagaan keamanan selama kapal di atas dock
├── 9. Diberikan fasilitas MCK untuk ABK
├── 10. Diberikan fasilitas bak pembuangan sampah
├── 11. Diberikan aliran listrik dari darat ke kapal
│    └── b. Sambung & lepas kabel listrik (1 set pelaksanaan)
├── 12. Diberikan pelayanan crane selama docking (6 hr)
└── 13. Dilakukan free gas pada tanki COT 1-5 SB/PS (10 Tk)
     └── (belum termasuk B/P Manhole)
```

### Package B: UNIT PERAWATAN LAMBUNG & TANGKI (19 items)
**Hull and tank maintenance activities**

**Karakteristik Hierarki:**
- **Hierarchy Level**: 1 (paling kompleks)
- **Sub-items**: Menggunakan indented text
- **Pattern**: Contains sub-tasks dan detailed specifications

**Key Items:**
```
B. UNIT PERAWATAN LAMBUNG & TANGKI  
├── 1. Badan Kapal Bawah Garis Air (BGA)
├── 2. Badan Kapal Atas Garis Air (AGA)  
├── 3. Cat ulang draft & plimsoll mark, water line, ship name & registration number
├── 4. Kotak Air Laut dan Katub Air Laut
└── [Additional technical specifications with sub-items]
```

### Package C: PERLENGKAPAN MANUVER KAPAL (3 items)
**Propulsion and steering equipment**

**Structure:**
```
C. PERLENGKAPAN MANUVER KAPAL
├── 1. Propeller (Ø 1700 mm, 4 daun)
├── 2. Poros Propeller (Ø 165 x 5800 mm)  
└── 3. Daun Kemudi dan Poros Kemudi (762 GRT x 1 unit)
```

### Package D: UNIT PERAWATAN PERLENGKAPAN DECK (2 items)
**Deck equipment maintenance**

**Structure:**
```
D. UNIT PERAWATAN PERLENGKAPAN DECK
├── 1. Jangkar & Rantai Jangkar
└── 2. Penggantian dan pemasangan ZAP (owner supply & sesuai petunjuk manual)
```

### Package E: UNIT PIPA (24 items)
**Piping system maintenance** 

**Pattern**: Sequential numbering 1-15 dengan detailed piping specifications
```
E. UNIT PIPA
├── 1. Ganti baru Pipa Main SW Pump (Distributor)
├── 2. Ganti baru Pipa Sea Water Cooling
├── 3. Ganti baru Pipa Outlet SW AE kiri
├── 4. Ganti baru Pipa Sea Chest SW GS Pump
├── 5. Ganti baru Pipa Sea Outlet SW GS Pump
└── [... 19 more piping items]
```

### Package F: CLEANING DAN LAIN LAIN (3 items)
**Cleaning and miscellaneous activities**

**Structure:**
```
F. CLEANING DAN LAIN LAIN
├── 1. Cleaning engine room uk 7,12 x 3,8 x 0,75
├── 2. Cleaning got ruang pompa uk 220 x 210 x 0,15  
└── 3. Megger test
```

## Analisis Pola Hierarki

### 1. Package-Level Hierarchy
```
Level 0: Package Identifier (A, B, C, D, E, F)
├── Package Name (PELAYANAN UMUM, UNIT PERAWATAN LAMBUNG & TANGKI, etc.)
```

**Pattern Detected:**
- **Alphabetical progression**: A → F
- **Functional grouping**: Each package represents different work domain
- **Clear separation**: Empty rows between packages

### 2. Work Item Hierarchy
```
Level 1: Main Work Items
├── Sequential numbering: 1, 2, 3, 4, ... 
├── Volume specification: Numeric + Unit
├── Description: Detailed work specification
```

**Numbering Systems per Package:**
- Package A: 1-13 (13 items)
- Package B: 1-12 (19 items, some with sub-items)
- Package C: 1-3 (3 items)
- Package D: 1-2 (2 items)
- Package E: 1-15 (24 items)
- Package F: 1-3 (3 items)

### 3. Sub-Item Hierarchy
```
Level 2: Sub-items and Continuations
├── Empty number column (col1 = "")
├── Detailed description in col2
├── Various hierarchy indicators:
    ├── Lettered sub-items: a., b., c.
    ├── Indented text (leading spaces)
    └── Continuation descriptions
```

**Hierarchy Indicators Detected:**
- **Indentation patterns**: 1-8 spaces for sub-levels
- **Lettered sequences**: a., b., c. for sub-tasks
- **Continuation text**: Multi-line descriptions
- **Parenthetical notes**: (belum termasuk...), (1 set pelaksanaan)

## Volume & Unit Structure

### Standard Units Used:
- **ls** (Lump Sum): For service-type activities
- **hr** (Hour): For time-based services  
- **m²** (Square meter): For area measurements
- **Tk** (Tank): For tank-related work
- **unit**: For equipment items
- **mm**: For dimensional specifications

### Volume Patterns:
```
📊 Volume Distribution:
- Service items (ls): Typically 1 unit
- Time-based (hr): Range 2-17 hours  
- Area work (m²): Various measurements
- Tanks (Tk): Count-based (10 tanks)
- Equipment (unit): Specific quantities
```

## Template vs Application Relationship

### 1. Mapping to Work Items Table
```
Excel Template → Application Work Items
📦 Package Letter (A,B,C) → package field
📋 Item Number (1,2,3) → Hierarchical ID generation  
📝 Description → title field
📏 Volume → volume field
📐 Unit → unit field
🔢 Sub-items → children relationship (parentId)
```

### 2. Hierarchy Implementation
```
Database Implementation:
├── Parent Items: package + main number (A.1, B.2, etc.)
├── Child Items: parentId references + sub-numbering
├── Hierarchy Levels: Progressive indentation
└── Package Organization: Grouping mechanism
```

### 3. Import Logic Considerations
```python
# Pseudocode for Excel Import
for package in excel_packages:
    for main_item in package.items:
        work_item = create_work_item(
            id=generate_id(project, package.id, main_item.number),
            title=main_item.description,
            package=package.name,
            volume=main_item.volume,
            unit=main_item.unit,
            parentId=None  # Main item
        )
        
        for sub_item in main_item.sub_items:
            child_work_item = create_work_item(
                id=generate_child_id(work_item.id, sub_item_index),
                title=sub_item.description,
                parentId=work_item.id,  # Reference to parent
                hierarchy_level=sub_item.hierarchy_level
            )
```

## Keunggulan Struktur Hierarki Excel

### ✅ Strengths

1. **Clear Package Organization**
   - Logical functional grouping (A-F)
   - Consistent naming convention
   - Separate work domains

2. **Robust Numbering System**
   - Sequential main item numbering per package
   - Supports unlimited sub-items
   - Clear parent-child relationships

3. **Flexible Hierarchy Levels**
   - Supports multiple sub-levels
   - Uses both lettered and indented approaches
   - Accommodates complex work breakdowns

4. **Complete Work Specification**
   - Volume and unit tracking
   - Detailed descriptions
   - Notes and remarks support

5. **Industry Standard Format**
   - Familiar Excel interface
   - Standard repair list structure
   - Suitable for shipyard operations

### ⚠️ Considerations for Import

1. **Complex Parsing Requirements**
   - Multi-level hierarchy detection
   - Various sub-item patterns (lettered, indented)
   - Continuation text handling

2. **Data Mapping Challenges**
   - Package-to-work-item relationship
   - Sub-item parent-child linkage
   - Hierarchy level determination

3. **Volume/Unit Standardization**
   - Multiple unit types to normalize
   - Volume calculations for different item types
   - Unit conversion considerations

## Rekomendasi Implementasi

### 1. Import Strategy
```typescript
interface ExcelImportMapping {
  // Package level
  packageId: string      // A, B, C, D, E, F
  packageName: string    // PELAYANAN UMUM, etc.
  
  // Work item level  
  itemNumber: string     // 1, 2, 3, etc.
  description: string    // Full work description
  volume: number         // Parsed volume
  unit: string          // Standardized unit
  
  // Hierarchy
  parentId?: string     // For sub-items
  hierarchyLevel: number // 0, 1, 2, etc.
  subItems: ExcelImportMapping[] // Recursive structure
}
```

### 2. Database Schema Alignment
```sql
-- Work Items dengan hierarchy support
CREATE TABLE work_items (
  id VARCHAR PRIMARY KEY,
  project_id VARCHAR REFERENCES projects(id),
  parent_id VARCHAR REFERENCES work_items(id),
  package VARCHAR,           -- Package letter (A, B, C)
  item_number VARCHAR,       -- Sequential number within package
  title TEXT,               -- Description
  volume DECIMAL,           -- Parsed volume
  unit VARCHAR,             -- Standardized unit
  hierarchy_level INTEGER,  -- 0=parent, 1+=child levels
  order_index INTEGER       -- For maintaining Excel order
);
```

### 3. UI Enhancement untuk Hierarchy
```typescript
// Enhanced WorkPlanTable component
const renderExcelImportedItem = (item: WorkItem, level: number = 0) => {
  const isFromExcel = item.templateId?.includes('excel')
  const packageDisplay = level === 0 ? item.package : 'SUB-ITEM'
  
  return (
    <Tr bg={level > 0 ? 'blue.50' : 'white'}>
      <Td paddingLeft={`${level * 30 + 16}px`}>
        {hasChildren && <ExpandIcon />}
        <Badge colorScheme={getPackageColor(item.package)}>
          {item.package}{item.itemNumber ? `.${item.itemNumber}` : ''}
        </Badge>
      </Td>
      <Td>{packageDisplay}</Td>
      <Td>{item.title}</Td>
      <Td>{item.volume} {item.unit}</Td>
      {/* Additional columns... */}
    </Tr>
  )
}
```

## Kesimpulan

File Excel "Repair List Docking MT. Ferimas Sejahtera Thn. 2025.xlsx" merupakan template yang sangat terstruktur dengan hierarki 3-level yang mendukung:

1. **6 Work Packages** (A-F) dengan logical functional grouping
2. **64 Total Work Items** dengan sequential numbering per package  
3. **Multi-level Hierarchy** menggunakan lettered sub-items dan indentation
4. **Complete Work Specifications** dengan volume, unit, dan detailed descriptions

Template ini dapat diintegrasikan dengan aplikasi work plan & report melalui Excel import functionality yang robust, dengan careful mapping dari struktur hierarki Excel ke database relational dan UI components yang mendukung display hierarkis.

**Key Integration Points:**
- Package-based organization → Work item grouping
- Sequential numbering → Hierarchical ID generation
- Sub-items → Parent-child relationships dalam database
- Volume/Unit → Quantitative tracking dalam progress reports
- Multi-level descriptions → Rich content untuk work item details

Implementasi import dari template ini akan significantly enhance content richness dan struktur organization dalam aplikasi monitoring proyek docking.