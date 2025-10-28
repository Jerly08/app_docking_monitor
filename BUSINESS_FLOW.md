# Business Flow - Aplikasi Monitoring Proyek Docking

## 📋 Deskripsi Sistem

**Aplikasi Monitoring Proyek Docking** adalah sistem manajemen proyek berbasis web yang dirancang untuk mengelola operasional galangan kapal, mulai dari penerimaan customer hingga penyelesaian pekerjaan docking dan pelaporan.

---

## 🎯 Tujuan Bisnis

1. **Efisiensi Operasional**: Menyederhanakan proses pengelolaan proyek docking kapal
2. **Monitoring Real-time**: Memantau progress pekerjaan secara langsung
3. **Standardisasi Proses**: Menggunakan template work items yang terstandarisasi
4. **Transparansi**: Memberikan visibilitas penuh kepada stakeholder
5. **Dokumentasi**: Menyimpan rekam jejak pekerjaan dan dokumentasi foto

---

## 👥 Aktor Sistem

### 1. **ADMIN**
- Akses penuh ke seluruh sistem
- Mengelola user dan hak akses
- Mengelola master data
- Mengatur template work items
- Menghapus data

### 2. **MANAGER**
- Mengelola proyek dan customer
- Membuat dan mengatur work items
- Assign tasks ke team
- Monitoring progress
- Generate reports
- Approval dan persetujuan

### 3. **USER** (Teknisi/Operator)
- Melihat task yang di-assign
- Update progress pekerjaan
- Upload dokumentasi foto
- Update status work items
- View reports (read-only)

---

## 🔄 Alur Bisnis Utama

## Flow 1: Manajemen Customer & Vessel

### A. Penerimaan Customer Baru
```
START → Customer menghubungi galangan
  ↓
Admin/Manager membuka modul "Customer Contacts"
  ↓
Input data customer:
  • Nama kapal (Vessel Name)
  • Perusahaan pemilik (Owner Company)
  • Tipe kapal (Vessel Type)
  • Spesifikasi teknis (GRT, LOA, LBP, Breadth, Depth)
  • Contact person & kontak
  • Status kapal (Special Survey/Maintenance/dll)
  • Riwayat docking (Last/Next Docking Date)
  ↓
Simpan data customer
  ↓
Customer terdaftar dalam sistem
→ END
```

### B. Manajemen Data Customer
- **Search & Filter**: Cari customer berdasarkan nama kapal, company, status
- **Update**: Edit informasi customer dan spesifikasi kapal
- **View History**: Lihat riwayat docking dan total docking
- **Delete**: Hapus data customer (hanya ADMIN)

---

## Flow 2: Manajemen Project

### A. Pembuatan Project Baru
```
START → Customer request docking
  ↓
Manager membuka modul "Project Management"
  ↓
Klik "Create New Project"
  ↓
Input data project:
  • Project Name (e.g., "MT. FERIMAS SEJAHTERA / TAHUN 2025")
  • Vessel Name
  • Customer Company
  • Vessel Specs (LOA, Breadth, DWT/GT, DOK Type)
  • Project Status (ACTIVE/ON_HOLD/COMPLETED)
  • Start Date & End Date
  • Notes
  ↓
Validasi duplikasi project
  ↓
Project tersimpan di database
  ↓
Project muncul di list dan dapat dikelola
→ END
```

### B. Manajemen Project
```
List Projects
  ↓
Filter by:
  • Status (Active/Completed/On Hold)
  • Customer Company
  • Date Range
  ↓
View Project Details:
  • Basic Info
  • Work Items Statistics
  • Progress Percentage
  • Team Allocation
  ↓
Update Project:
  • Change Status
  • Update Dates
  • Add Notes
  ↓
Delete Project (ADMIN only, cascade delete work items)
```

---

## Flow 3: Work Planning dengan Template

### A. Setup Work Item Templates (Admin)
```
START → Admin perlu standardisasi pekerjaan
  ↓
Admin membuka "Work Item Templates"
  ↓
Buat template hierarchical:
  
Level 1: PACKAGE
  • Package Letter: A, B, C, D
  • Package Name: "PELAYANAN UMUM", "PERAWATAN LAMBUNG"
  
  ↓ Has Children
  
Level 2: ITEM
  • Item Number: 1, 2, 3, ...
  • Item Title: Deskripsi pekerjaan utama
  
  ↓ Has Children
  
Level 3: SUB_ITEM
  • Sub Letter: a, b, c, d
  • Title: Detail pekerjaan spesifik
  • Volume & Unit (m², ls, set, hr)
  
  ↓ Has Children (optional)
  
Level 4: REALIZATION
  • Rincian teknis pelaksanaan
  • Unit pengukuran
  ↓
Template tersimpan dan dapat digunakan untuk project baru
→ END
```

### B. Import Work Items dari Template
```
User memilih Project
  ↓
Klik "Import from Template"
  ↓
Pilih template yang sesuai
  ↓
System generate work items hierarchical
  ↓
Work items siap digunakan dengan struktur standar
```

### C. Import Work Items dari Excel/CSV
```
User upload file Excel/CSV
  ↓
System validasi format dan data
  ↓
Preview data yang akan di-import
  ↓
User konfirmasi import
  ↓
System create work items dari file
  ↓
Work items tersimpan dalam project
```

---

## Flow 4: Manajemen Work Items (Core Business)

### A. Struktur Hierarki Work Items
```
PROJECT
  ↓
  PACKAGE A: PELAYANAN UMUM
    ↓
    ITEM 1: Setibanya di muara
      ↓
      SUB-ITEM a: Rincian detail pekerjaan
        ↓
        REALIZATION: Implementasi teknis
      ↓
      SUB-ITEM b: Rincian detail lainnya
  ↓
  PACKAGE B: UNIT PERAWATAN LAMBUNG & TANGKI
    ↓
    ITEM 2: Docking & Undocking
      ↓
      SUB-ITEM a: Detail work
```

### B. Membuat Work Item Baru
```
START → User di view project
  ↓
Klik "Add Work Item"
  ↓
Pilih parent (optional, untuk sub-item)
  ↓
Input data:
  • Title/Description
  • Category/Package
  • Volume & Unit
  • Duration Days
  • Start Date & Finish Date (auto-calculated)
  • Resource Names
  • Status
  • Milestone flag
  • Dependencies
  ↓
System generate unique ID
  ↓
Work item tersimpan dalam hierarchical structure
  ↓
Work item muncul di project work plan
→ END
```

### C. Update Progress Work Item
```
User/Teknisi buka work item
  ↓
View detail pekerjaan
  ↓
Update completion percentage (0-100%)
  ↓
Upload foto dokumentasi (multiple images)
  ↓
Update status:
  • NOT_STARTED
  • IN_PROGRESS
  • COMPLETED
  • ON_HOLD
  • CANCELLED
  ↓
System calculate parent completion (otomatis)
  ↓
Emit real-time update via Socket.IO
  ↓
Dashboard dan reports terupdate otomatis
→ END
```

### D. Automatic Calculation Features
```
1. Date Calculation:
   Start Date + Duration Days → Finish Date
   
2. Completion Calculation:
   Parent Completion = Average(Children Completions)
   
3. Project Progress:
   Project Completion = Average(All Work Items)
```

---

## Flow 5: Task Management

### A. Membuat Task dari Work Item
```
Manager buka Work Item
  ↓
Klik "Create Task"
  ↓
Input task details:
  • Name & Description
  • Start Date & End Date
  • Priority (LOW/MEDIUM/HIGH/CRITICAL)
  • Assigned To (team member)
  • Estimated Hours
  • Status (PLANNED/IN_PROGRESS/COMPLETED)
  • Dependencies
  • Tags
  ↓
Task tersimpan dan linked ke work item
  ↓
Notifikasi ke assigned user
→ END
```

### B. Task Execution Flow
```
User login → View "My Tasks"
  ↓
Filter tasks by:
  • Status
  • Priority
  • Assigned to me
  • Date range
  ↓
Select task
  ↓
Update status → IN_PROGRESS
  ↓
Log actual hours worked
  ↓
Update completion percentage
  ↓
Upload documentation (if needed)
  ↓
Mark as COMPLETED
  ↓
Manager review dan approve
```

### C. Resource Conflict Detection
```
System scan semua tasks
  ↓
Detect overlapping:
  • Same resource
  • Overlapping dates
  • Conflicting work items
  ↓
Generate conflict report
  ↓
Alert manager untuk re-scheduling
```

---

## Flow 6: Monitoring & Dashboard

### A. Real-time Monitoring
```
User login → Dashboard
  ↓
View statistics:
  • Total Projects (active/completed)
  • Total Work Items
  • Team Members online
  • Revenue metrics
  ↓
View project progress bars:
  • Per-project completion %
  • Color-coded status (green/yellow/red)
  ↓
View recent activity feed:
  • Completed tasks
  • New work items
  • Resource conflicts
  • Approvals
  ↓
Quick actions:
  • Add work item
  • Update progress
  • Assign team
  • Generate report
```

### B. Real-time Updates (Socket.IO)
```
User A membuat/update work item
  ↓
Server emit event via Socket.IO:
  • "workItemCreated"
  • "workItemUpdated"
  • "taskCreated"
  • "taskUpdated"
  ↓
All connected clients receive update
  ↓
UI terupdate secara otomatis tanpa refresh
```

---

## Flow 7: Reporting & Export

### A. Work Plan Report Generation
```
User pilih Project
  ↓
Buka "Work Plan Report"
  ↓
View hierarchical work plan:
  • Package → Item → Sub-Item → Realization
  • Completion percentages
  • Dates & durations
  • Resources
  • Status
  ↓
Klik "Generate PDF"
  ↓
System generate PDF report dengan:
  • Header (vessel info, customer)
  • Work plan table (hierarchical)
  • Progress charts
  • Documentation photos
  • Signatures
  ↓
PDF siap di-download atau print
→ END
```

### B. Export Options
```
User di work items list
  ↓
Select export format:
  • PDF Report (formatted)
  • Excel/CSV (raw data)
  • JSON (API data)
  ↓
Select filter/scope:
  • All items
  • By package
  • By status
  • By date range
  ↓
System generate file
  ↓
Download file
```

---

## Flow 8: Survey & Estimation

### A. Initial Survey
```
Customer request → Survey scheduling
  ↓
Survey team visit vessel
  ↓
Input survey findings:
  • Vessel condition assessment
  • Required work items
  • Estimated costs
  • Estimated duration
  • Required resources
  ↓
Generate preliminary report
  ↓
Submit for manager review
```

### B. Cost Estimation
```
Survey data → Cost calculation
  ↓
Calculate per work item:
  • Material costs
  • Labor costs
  • Equipment costs
  • Overhead
  ↓
Total project estimation
  ↓
Generate quotation document
  ↓
Submit to customer
```

---

## Flow 9: Quotation & Negotiation

### A. Quotation Process
```
Estimation approved
  ↓
Create official quotation:
  • Itemized costs
  • Terms & conditions
  • Timeline
  • Payment schedule
  ↓
Manager review & approve
  ↓
Send to customer
  ↓
Track quotation status:
  • PENDING
  • NEGOTIATING
  • APPROVED
  • REJECTED
```

### B. Negotiation
```
Customer counter-offer
  ↓
Log negotiation history:
  • Customer comments
  • Price adjustments
  • Scope changes
  • Date modifications
  ↓
Create revised quotation
  ↓
Iterate until approval
  ↓
Generate final contract
```

---

## Flow 10: Procurement & Vendor

### A. Material Procurement
```
Work items approved
  ↓
Generate material requirements:
  • List dari work items
  • Quantities needed
  • Required dates
  ↓
Create purchase orders:
  • Select vendor
  • Material specifications
  • Quantities
  • Delivery schedule
  • Prices
  ↓
Track PO status:
  • ORDERED
  • PARTIAL_DELIVERED
  • COMPLETED
```

### B. Vendor Management
```
Maintain vendor database:
  • Vendor profile
  • Product categories
  • Price history
  • Performance ratings
  • Contact information
  ↓
Vendor selection for PO
  ↓
Track vendor performance:
  • Delivery time
  • Quality
  • Price competitiveness
  ↓
Vendor rating & feedback
```

---

## Flow 11: Warehouse & Material

### A. Material Receipt
```
Material arrived
  ↓
Create goods receipt:
  • Reference PO
  • Actual quantity received
  • Quality check
  • Storage location
  ↓
Update inventory:
  • Stock quantity
  • Location
  • Batch/serial numbers
  ↓
Notify requestor
```

### B. Material Issue
```
Work item needs material
  ↓
Create material requisition:
  • Work item reference
  • Material needed
  • Quantity
  • Required date
  ↓
Warehouse check availability
  ↓
Issue material:
  • Update stock
  • Record transaction
  • Link to work item
  ↓
Material delivered to work location
```

---

## Flow 12: Technician Work Execution

### A. Daily Work Assignment
```
Morning briefing
  ↓
Manager assign tasks:
  • Select work items
  • Assign technicians
  • Provide instructions
  • Safety briefing
  ↓
Technicians receive assignments
  ↓
View work details:
  • Location
  • Tools needed
  • Materials
  • Safety requirements
  • Reference documents
```

### B. Work Execution & Documentation
```
Technician start work
  ↓
Mark status: IN_PROGRESS
  ↓
During work:
  • Take progress photos
  • Log actual hours
  • Report issues/blockers
  • Request materials
  ↓
Complete work
  ↓
Upload final photos
  ↓
Update completion: 100%
  ↓
Submit for inspection
```

### C. Quality Inspection
```
Supervisor notified
  ↓
Inspect completed work:
  • Check quality
  • Verify completion
  • Review documentation
  ↓
Decision:
  • APPROVED → Close work item
  • REJECTED → Return for rework
  • PARTIAL → Additional work needed
  ↓
Record inspection notes
```

---

## Flow 13: Finance & Payment

### A. Invoice Generation
```
Work items completed
  ↓
Generate progress invoice:
  • Completed work items
  • Quantities & prices
  • Additional charges
  • Deductions
  ↓
Calculate totals:
  • Subtotal
  • Tax
  • Total amount
  ↓
Manager review & approve
  ↓
Send invoice to customer
```

### B. Payment Tracking
```
Invoice sent
  ↓
Track payment status:
  • PENDING
  • PARTIAL_PAID
  • PAID
  • OVERDUE
  ↓
Receive payment
  ↓
Record payment:
  • Date
  • Amount
  • Payment method
  • Reference number
  ↓
Update invoice status
  ↓
Generate receipt
```

---

## Flow 14: Project Completion

### A. Final Inspection
```
All work items completed
  ↓
Schedule final inspection:
  • Customer representative
  • Supervisor
  • Quality team
  ↓
Conduct inspection:
  • Check all work items
  • Verify documentation
  • Test systems
  • Safety checks
  ↓
Generate inspection report
  ↓
Customer approval/remarks
```

### B. Project Closeout
```
Inspection approved
  ↓
Generate final reports:
  • Work completion report
  • Material consumption
  • Labor hours
  • Cost summary
  • Photos & documentation
  ↓
Invoice reconciliation
  ↓
Update project status: COMPLETED
  ↓
Archive project documents
  ↓
Customer satisfaction survey
  ↓
Update customer history
→ PROJECT CLOSED
```

---

## 🔐 Security & Access Control

### Role-Based Access Matrix

| Feature | ADMIN | MANAGER | USER |
|---------|-------|---------|------|
| View Dashboard | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |
| Manage Customers | ✅ | ✅ | ❌ |
| Create Project | ✅ | ✅ | ❌ |
| Delete Project | ✅ | ❌ | ❌ |
| Create Work Items | ✅ | ✅ | ❌ |
| Update Progress | ✅ | ✅ | ✅ |
| Create Tasks | ✅ | ✅ | ❌ |
| Assign Tasks | ✅ | ✅ | ❌ |
| Update Task Status | ✅ | ✅ | ✅ |
| Upload Photos | ✅ | ✅ | ✅ |
| Generate Reports | ✅ | ✅ | ✅ (view only) |
| Manage Templates | ✅ | ❌ | ❌ |
| Finance/Payment | ✅ | ✅ | ❌ |
| Vendor Management | ✅ | ✅ | ❌ |

### Authentication Flow
```
User access application
  ↓
Redirect to /login
  ↓
Input credentials:
  • Username
  • Password
  ↓
Backend validation:
  • Check user exists
  • Verify password (bcrypt)
  • Check isActive flag
  ↓
Generate JWT token (24h expiry)
  ↓
Return token + user info
  ↓
Store token in client
  ↓
Subsequent requests:
  • Include JWT in Authorization header
  • Backend validate token
  • Extract user role
  • Check permissions
  ↓
Access granted/denied
```

---

## 📊 Data Flow & Integration

### 1. Frontend ↔ Backend API
```
React Component
  ↓
Custom Hook (useWorkItems, useTasks)
  ↓
Fetch API call → Next.js API Routes
  ↓
Route Handler validate JWT
  ↓
Prisma ORM → MySQL Database
  ↓
Return data
  ↓
Update React state
  ↓
Re-render UI
```

### 2. Real-time Updates (Socket.IO)
```
Client A makes change
  ↓
API Route processes
  ↓
Emit Socket.IO event
  ↓
Socket.IO Server broadcasts
  ↓
All connected clients receive
  ↓
Clients update local state
  ↓
UI updates without refresh
```

### 3. File Upload Flow
```
User select files (images)
  ↓
Frontend upload to API
  ↓
API save to /public/uploads/
  ↓
Generate file URL
  ↓
Create WorkItemAttachment record
  ↓
Return attachment info
  ↓
Display in UI
```

---

## 🎯 Key Performance Indicators (KPI)

### Project KPIs
- **Project Completion Rate**: % proyek selesai on-time
- **Average Project Duration**: Rata-rata waktu penyelesaian
- **Customer Satisfaction Score**: Rating kepuasan customer
- **Resource Utilization**: % penggunaan team & equipment

### Operational KPIs
- **Work Item Completion Rate**: % work items selesai tepat waktu
- **Rework Rate**: % pekerjaan yang perlu dikerjakan ulang
- **Documentation Completeness**: % work items dengan dokumentasi lengkap
- **Safety Incidents**: Jumlah kejadian kecelakaan kerja

### Financial KPIs
- **Revenue per Project**: Pendapatan rata-rata per proyek
- **Cost Variance**: Selisih antara estimasi dan aktual
- **Payment Collection Rate**: % invoice terbayar on-time
- **Profitability Margin**: % margin keuntungan

---

## 🔄 Continuous Improvement Flow

```
Collect data from completed projects
  ↓
Analyze performance metrics
  ↓
Identify bottlenecks & issues:
  • Delayed work items
  • Cost overruns
  • Quality problems
  • Resource conflicts
  ↓
Root cause analysis
  ↓
Implement improvements:
  • Update templates
  • Adjust estimates
  • Improve processes
  • Training needs
  ↓
Monitor impact
  ↓
Iterate → Repeat cycle
```

---

## 📱 User Experience Flow

### 1. Manager Morning Routine
```
Login → Dashboard
  ↓
Review overnight activities
  ↓
Check resource conflicts
  ↓
Assign today's tasks
  ↓
Approve completed work
  ↓
Monitor critical projects
  ↓
Generate status reports
```

### 2. Technician Daily Routine
```
Login → View assigned tasks
  ↓
Check work details & location
  ↓
Start work → Update status
  ↓
Take progress photos
  ↓
Report issues (if any)
  ↓
Complete work → Upload documentation
  ↓
Submit for approval
```

### 3. Admin System Maintenance
```
Login → System overview
  ↓
Manage user accounts
  ↓
Update work item templates
  ↓
Monitor system performance
  ↓
Backup data
  ↓
Review audit logs
```

---

## 🎓 Benefits & Value Proposition

### Untuk Manajemen
✅ **Visibilitas Real-time**: Monitor semua proyek dalam satu dashboard  
✅ **Data-Driven Decisions**: Laporan dan analytics untuk decision making  
✅ **Kontrol Biaya**: Tracking biaya vs estimasi secara detail  
✅ **Compliance**: Dokumentasi lengkap untuk audit dan sertifikasi  

### Untuk Operations Team
✅ **Standardisasi**: Template work items untuk konsistensi  
✅ **Efisiensi**: Mengurangi administrative overhead  
✅ **Kolaborasi**: Real-time communication dan updates  
✅ **Akurasi**: Automatic calculations untuk dates dan completion  

### Untuk Customer
✅ **Transparansi**: Akses untuk melihat progress proyek  
✅ **Dokumentasi**: Foto dan laporan lengkap pekerjaan  
✅ **Predictability**: Timeline dan biaya yang jelas  
✅ **Quality Assurance**: Systematic quality checks  

---

## 🚀 Future Enhancements

### Phase 2 Features
- [ ] Mobile app untuk teknisi
- [ ] Advanced analytics & BI dashboard
- [ ] Customer portal (self-service)
- [ ] Integration dengan accounting system
- [ ] Automated email notifications
- [ ] Document management system
- [ ] E-signature untuk approvals
- [ ] IoT integration untuk equipment monitoring

### Phase 3 Features
- [ ] AI-powered estimation
- [ ] Predictive maintenance scheduling
- [ ] Blockchain untuk supply chain
- [ ] AR/VR untuk remote inspection
- [ ] Advanced project planning (Gantt, Critical Path)
- [ ] Multi-language support
- [ ] Multi-currency support

---

## 📞 Support & Contact

Untuk pertanyaan lebih lanjut mengenai business flow atau implementasi fitur:
- Review kode di repository
- Check dokumentasi teknis di folder `/docs`
- Lihat API documentation di README.md

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-05  
**Created by**: System Analysis  
**Status**: ✅ Complete

---

*Business flow ini adalah living document yang akan diupdate seiring dengan perkembangan aplikasi dan kebutuhan bisnis.*
