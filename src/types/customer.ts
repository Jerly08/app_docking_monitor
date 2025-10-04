// Customer Contact Interface based on docking report information
export interface CustomerContact {
  id: string
  vesselName: string // Nama Kapal - MT. FERIMAS SEJAHTERA
  ownerCompany: string // Pemilik - PT. Indoline Incomekita
  vesselType: string // Tipe - OIL TANKER
  grt: number // GRT - 762 GT
  loa: number // LOA - 64.02 meter (Length Overall)
  lbp: number // LBP - 59.90 meter (Length Between Perpendiculars)
  breadth: number // BM - 10.00 meter (Breadth/Width)
  depth: number // T - 4.50 meter (Depth)
  status: CustomerStatus // Status - SPECIAL SURVEY
  contactPerson: string
  phoneNumber: string
  email: string
  address: string
  notes: string
  createdAt: string
  updatedAt: string
  lastDockingDate?: string
  nextScheduledDocking?: string
  totalDockings: number
}

// Customer Status Enum
export type CustomerStatus = 
  | 'ACTIVE'
  | 'MAINTENANCE'
  | 'SPECIAL SURVEY'
  | 'INACTIVE'
  | 'URGENT'

// Vessel Type Enum
export type VesselType =
  | 'OIL TANKER'
  | 'CARGO SHIP'
  | 'CONTAINER SHIP'
  | 'BULK CARRIER'
  | 'PASSENGER SHIP'
  | 'FISHING VESSEL'
  | 'TUG BOAT'
  | 'BARGE'
  | 'SUPPLY VESSEL'

// Form data interface for creating/updating customers
export interface CustomerFormData extends Omit<CustomerContact, 'id' | 'createdAt' | 'updatedAt' | 'totalDockings'> {
  id?: string
  totalDockings?: number
}

// API Response interfaces
export interface CustomerAPIResponse {
  data: CustomerContact | CustomerContact[]
  message?: string
  success: boolean
  total?: number
}

export interface CustomerAPIError {
  error: string
  success: false
}

// Filter and search interfaces
export interface CustomerFilters {
  search?: string
  status?: CustomerStatus | 'all'
  vesselType?: VesselType | 'all'
  limit?: number
  offset?: number
}

// Statistics interface for dashboard
export interface CustomerStats {
  total: number
  active: number
  maintenance: number
  inactive: number
  urgent: number
  recentDockings: number
  upcomingDockings: number
}

// Docking Report interface based on the image provided
export interface DockingReport {
  id: string
  customerId: string
  vesselName: string
  ownerCompany: string
  vesselType: string
  grt: number
  loa: number
  lbp: number
  breadth: number
  depth: number
  status: CustomerStatus
  reportDate: string
  dockingDate: string
  completionDate?: string
  workItems: WorkItem[]
  totalCost?: number
  notes?: string
}

// Work Item interface for docking reports
export interface WorkItem {
  id: string
  taskName: string
  package: string
  duration: number
  startDate: string
  endDate: string
  progress: number
  resourceNames: string[]
  milestone: string
  notes?: string
  conflicts?: string[]
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
}

// Export/Import interfaces
export interface CustomerExportData {
  customers: CustomerContact[]
  exportDate: string
  totalRecords: number
  filters?: CustomerFilters
}

export interface CustomerImportData {
  customers: Partial<CustomerContact>[]
  validationErrors?: string[]
  importDate: string
  successCount: number
  errorCount: number
}