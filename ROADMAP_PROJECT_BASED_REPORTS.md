# 🗺️ ROADMAP: Project-Based Reporting System

> **Goal**: Transform aplikasi dari single-project ke multi-project system dengan template work items yang scalable

## 📊 **Current State Analysis**

### ✅ **What We Have:**
- Work Plan & Report page dengan hierarchical work items
- Real-time editing capabilities 
- Document generation (Word template dengan kop surat)
- Authentication & role management
- Socket.IO real-time updates
- Customer contacts module

### ❌ **Current Limitations:**
- Hardcoded single project (`MT. FERIMAS SEJAHTERA`)
- No project separation
- No template work items system
- Manual work item creation per project
- Single customer/vessel per session

## 🎯 **Target Architecture**

### **Multi-Project System:**
```
Projects Management
├── Project A (MT. FERIMAS SEJAHTERA)
│   ├── Work Items (from templates)
│   └── Reports (using single template)
├── Project B (MV. OCEAN STAR) 
│   ├── Work Items (from templates)
│   └── Reports (using single template)
└── Project C (KM. NUSANTARA)
    ├── Work Items (from templates)
    └── Reports (using single template)
```

### **Template Work Items System:**
```
Master Templates:
├── A. PELAYANAN UMUM
│   ├── 1. Setibanya di muara... (Parent)
│   │   └── Realisasi: ... (Child)
│   └── 2. Assistensi naik/turun dock... (Parent)
├── B. UNIT PERAWATAN LAMBUNG & TANGKI  
│   └── 1. Badan Kapal Bawah Garis Air (BGA) (Parent)
│       ├── a. Skrap (70%) - 525 m²
│       ├── b. Water jet - 750 m²
│       ├── c. Fullblasting - 750 m²
│       └── Realisasi: ... (Child)
└── C. [Package lainnya]
```

---

## 🚀 **ROADMAP IMPLEMENTATION**

### **PHASE 1: Foundation & Database Schema** 
*Timeline: Week 1 (5-7 hari)*

#### **1.1 Database Schema Design**
- [ ] **Projects Table**
  ```sql
  CREATE TABLE projects (
    id VARCHAR PRIMARY KEY,
    project_name VARCHAR NOT NULL,        -- "MT. FERIMAS SEJAHTERA / TAHUN 2025"
    vessel_name VARCHAR NOT NULL,         -- "MT. FERIMAS SEJAHTERA"  
    customer_company VARCHAR,             -- "PT. Industri Transpalme"
    vessel_specs JSON,                    -- {loa, lpp, breadth, dwt_gt, dok_type, status}
    status ENUM('ACTIVE', 'COMPLETED', 'ON_HOLD') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
  ```

- [ ] **Work Item Templates Table**
  ```sql
  CREATE TABLE work_item_templates (
    id VARCHAR PRIMARY KEY,
    package_letter VARCHAR(1),           -- 'A', 'B', 'C'
    package_name VARCHAR,                -- 'PELAYANAN UMUM', 'UNIT PERAWATAN...'
    item_number VARCHAR(10),             -- '1', '2', '3'
    item_title TEXT,                     -- 'Setibanya di muara...'
    parent_template_id VARCHAR,          -- untuk sub-items dan realisasi
    level ENUM('PACKAGE', 'ITEM', 'SUB_ITEM', 'REALIZATION'),
    sub_letter VARCHAR(1),               -- 'a', 'b', 'c', 'd', 'e'
    title TEXT NOT NULL,
    description TEXT,
    volume DECIMAL(10,2),
    unit VARCHAR(10),                    -- 'm²', 'ls', 'set', 'hr'
    has_realization BOOLEAN DEFAULT false,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

- [ ] **Update Existing Work Items**
  ```sql
  ALTER TABLE work_items ADD COLUMN project_id VARCHAR;
  ADD FOREIGN KEY (project_id) REFERENCES projects(id);
  ALTER TABLE work_items ADD COLUMN template_id VARCHAR;
  ADD FOREIGN KEY (template_id) REFERENCES work_item_templates(id);
  ```

#### **1.2 Master Template Data**
- [ ] **Package A: PELAYANAN UMUM**
  - Item 1: Setibanya di muara + realisasi
  - Item 2: Assistensi naik/turun + realisasi
  - Item 3: Docking undocking + realisasi
  - Item 4: Dry docking + realisasi
  - Item 5: Dibuatkan docking report + realisasi

- [ ] **Package B: UNIT PERAWATAN LAMBUNG & TANGKI**
  - Item 1: Badan Kapal BGA
    - Sub a: Skrap (70%) - 525 m²
    - Sub b: Water jet - 750 m²  
    - Sub c: Fullblasting - 750 m²
    - Sub d: Cuci air tawar - 750 m²
    - Sub e: Pengecatan - 2250 m²
    - Realisasi dengan actual measurements

- [ ] **Seed Script Creation**
  - Master templates seeding
  - Sample projects creation
  - Migration existing work items to default project

### **PHASE 2: API & Backend Services**
*Timeline: Week 1-2 (3-5 hari)*

#### **2.1 Projects API**
- [ ] **CRUD Operations**
  - `GET /api/projects` - List all projects
  - `POST /api/projects` - Create new project
  - `GET /api/projects/[id]` - Get project details
  - `PUT /api/projects/[id]` - Update project
  - `DELETE /api/projects/[id]` - Delete project

- [ ] **Project-Work Items Relations**
  - `GET /api/projects/[id]/work-items` - Get work items by project
  - `POST /api/projects/[id]/work-items/from-template` - Generate from templates

#### **2.2 Templates API**
- [ ] **Template Management**
  - `GET /api/work-item-templates` - List templates by package
  - `GET /api/work-item-templates/packages` - Get available packages
  - `POST /api/work-item-templates/generate` - Generate work items from selected templates

#### **2.3 Enhanced Work Items API**
- [ ] **Project Integration**
  - Update existing `/api/work-items` to support `projectId` filter
  - Update create/update endpoints untuk project association
  - Maintain backward compatibility

#### **2.4 Reports API Enhancement**
- [ ] **Dynamic Report Generation**
  - Update `/api/reports/work-plan` untuk accept project data
  - Dynamic vessel information dari project
  - Template placeholders replacement

### **PHASE 3: Frontend Components**
*Timeline: Week 2 (5-7 hari)*

#### **3.1 Project Management UI**
- [ ] **Project Selector Component**
  ```tsx
  <ProjectSelector 
    selectedProject={selectedProject}
    onProjectChange={setSelectedProject}
    projects={projects}
  />
  ```

- [ ] **Project Dashboard**
  - Projects listing dengan status
  - Quick actions (View Work Plan, Generate Report)
  - Project statistics

- [ ] **Project Creation Wizard**
  - Step 1: Basic Info (vessel name, customer)
  - Step 2: Vessel Specifications
  - Step 3: Template Selection (Package A, B, C checkboxes)
  - Step 4: Confirmation & Generate

#### **3.2 Template Integration**
- [ ] **Template Selection Modal**
  ```tsx
  <TemplateSelector
    availablePackages={['A', 'B', 'C']}
    selectedPackages={selectedPackages}
    onSelectionChange={setSelectedPackages}
    onGenerate={generateWorkItemsFromTemplates}
  />
  ```

- [ ] **Template Preview Component**
  - Show template structure before generation
  - Package → Items → Sub-items hierarchy
  - Volume and unit information

#### **3.3 Enhanced Work Plan Page**
- [ ] **Project Context Integration**
  - Add project selector to existing work plan page
  - Filter work items by selected project
  - Maintain all existing editing capabilities

- [ ] **Template-Based Work Items**
  - Visual indicators untuk template-generated items
  - Template metadata display
  - Bulk operations on template items

### **PHASE 4: Integration & Testing**
*Timeline: Week 2-3 (3-5 hari)*

#### **4.1 Data Migration**
- [ ] **Existing Data Handling**
  - Create "Default Project" untuk existing work items
  - Migration script untuk backward compatibility
  - Data validation dan cleanup

#### **4.2 Report System Integration**
- [ ] **Dynamic Report Generation**
  - Test report generation dengan different projects
  - Validate template placeholders replacement
  - Multi-project report testing

#### **4.3 Testing & Validation**
- [ ] **End-to-End Testing**
  - Create project → Select templates → Generate work items
  - Edit work items → Generate report → Validate output
  - Multiple projects workflow

- [ ] **Data Integrity Testing**
  - Template hierarchy integrity
  - Project-work items relationships
  - Report generation dengan various data

### **PHASE 5: UI/UX Enhancement**
*Timeline: Week 3-4 (5-7 hari)*

#### **5.1 Navigation Enhancement**
- [ ] **Project-Centric Navigation**
  - Project switcher in main layout
  - Breadcrumbs dengan project context
  - Quick project actions in header

#### **5.2 Dashboard Integration**
- [ ] **Multi-Project Dashboard**
  - Projects overview cards
  - Cross-project statistics
  - Recent activities per project

#### **5.3 User Experience**
- [ ] **Workflow Optimization**
  - Quick project creation shortcut
  - Template favorites/recent
  - Project cloning functionality

---

## 📋 **DELIVERABLES per PHASE**

### **Phase 1 Deliverables:**
- ✅ Complete database schema
- ✅ Master templates data (Package A & B)
- ✅ Seed scripts
- ✅ Migration scripts

### **Phase 2 Deliverables:**
- ✅ Projects CRUD API
- ✅ Templates API  
- ✅ Enhanced Work Items API
- ✅ Dynamic Reports API

### **Phase 3 Deliverables:**
- ✅ Project management UI components
- ✅ Template selection system
- ✅ Enhanced work plan page

### **Phase 4 Deliverables:**
- ✅ Complete integration testing
- ✅ Data migration completed
- ✅ Multi-project report system

### **Phase 5 Deliverables:**
- ✅ Polished user experience
- ✅ Performance optimizations
- ✅ Documentation updates

---

## 🎯 **SUCCESS CRITERIA**

### **Technical Success:**
- [ ] Multiple projects dapat dikelola simultaneously  
- [ ] Template work items generation berfungsi perfect
- [ ] Reports generated dengan correct project data
- [ ] No regression pada existing functionality
- [ ] Performance tetap optimal dengan multiple projects

### **Business Success:**
- [ ] User dapat create project baru dalam < 5 menit
- [ ] Template system mengurangi manual work items creation
- [ ] Reports accurate dengan different vessel specifications
- [ ] System scalable untuk 10+ concurrent projects

### **User Experience Success:**
- [ ] Intuitive project switching
- [ ] Clear template selection process  
- [ ] Familiar work plan editing experience
- [ ] Consistent UI/UX across all modules

---

## 💡 **POTENTIAL RISKS & MITIGATION**

### **Risk 1: Data Migration Complexity**
- **Mitigation**: Comprehensive testing dengan backup data
- **Plan B**: Gradual migration dengan dual-system support

### **Risk 2: Performance Impact**
- **Mitigation**: Database indexing, lazy loading, pagination
- **Plan B**: Caching layer implementation

### **Risk 3: Template Complexity**
- **Mitigation**: Start dengan Package A & B, iterate based on feedback
- **Plan B**: Simplified template structure if needed

### **Risk 4: User Adoption**
- **Mitigation**: Maintain familiar UI, comprehensive documentation
- **Plan B**: Training materials dan guided onboarding

---

## 🔄 **ITERATION PLAN**

### **Version 1.0: MVP** (End of Phase 3)
- Basic project management
- Package A & B templates
- Single project work plan editing
- Basic report generation

### **Version 1.1: Enhanced** (End of Phase 4) 
- Multiple projects support
- Advanced template features
- Optimized performance
- Complete testing

### **Version 1.2: Polished** (End of Phase 5)
- Premium user experience
- Advanced features
- Complete documentation
- Production ready

---

**Total Timeline: 3-4 weeks**
**Team Effort: 1-2 developers**
**Risk Level: Medium** (well-planned, incremental approach)

**Next Steps:**
1. Review dan revisi roadmap ini
2. Confirm Phase 1 technical specifications  
3. Setup development environment
4. Begin database schema implementation
