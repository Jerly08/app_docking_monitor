import { NextRequest, NextResponse } from 'next/server'

// Customer Contact Interface
interface CustomerContact {
  id: string
  vesselName: string
  ownerCompany: string
  vesselType: string
  grt: number
  loa: number
  lbp: number
  breadth: number
  depth: number
  status: string
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

// This should be shared with the main route - in a real app, use a database
const getCustomers = (): CustomerContact[] => [
  {
    id: '1',
    vesselName: 'MT. FERIMAS SEJAHTERA',
    ownerCompany: 'PT. Indoline Incomekita',
    vesselType: 'OIL TANKER',
    grt: 762,
    loa: 64.02,
    lbp: 59.90,
    breadth: 10.00,
    depth: 4.50,
    status: 'SPECIAL SURVEY',
    contactPerson: 'John Smith',
    phoneNumber: '+62 21 1234 5678',
    email: 'john.smith@indoline.com',
    address: 'Jakarta, Indonesia',
    notes: 'Regular customer, special survey scheduled',
    createdAt: '2024-01-15',
    updatedAt: '2024-10-04',
    lastDockingDate: '2024-09-15',
    nextScheduledDocking: '2025-03-15',
    totalDockings: 5,
  },
  {
    id: '2',
    vesselName: 'MV. OCEAN STAR',
    ownerCompany: 'PT. Marine Solutions',
    vesselType: 'CARGO SHIP',
    grt: 1200,
    loa: 85.50,
    lbp: 78.20,
    breadth: 12.50,
    depth: 6.80,
    status: 'MAINTENANCE',
    contactPerson: 'Sarah Johnson',
    phoneNumber: '+62 31 9876 5432',
    email: 'sarah.j@marinesol.com',
    address: 'Surabaya, Indonesia',
    notes: 'Routine maintenance required',
    createdAt: '2024-02-20',
    updatedAt: '2024-10-03',
    lastDockingDate: '2024-08-20',
    nextScheduledDocking: '2025-02-20',
    totalDockings: 3,
  },
]

// GET - Fetch specific customer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params
    const customers = getCustomers()
    const customer = customers.find(c => c.id === resolvedParams.id)

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found', success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: customer,
      success: true
    })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer', success: false },
      { status: 500 }
    )
  }
}

// PATCH - Update specific fields of a customer
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const customers = getCustomers()
    const customerIndex = customers.findIndex(c => c.id === resolvedParams.id)

    if (customerIndex === -1) {
      return NextResponse.json(
        { error: 'Customer not found', success: false },
        { status: 404 }
      )
    }

    // Update only the provided fields
    const updatedCustomer = {
      ...customers[customerIndex],
      ...body,
      id: resolvedParams.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString().split('T')[0]
    }

    return NextResponse.json({
      data: updatedCustomer,
      message: 'Customer updated successfully',
      success: true
    })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer', success: false },
      { status: 500 }
    )
  }
}

// DELETE - Delete specific customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params
    const customers = getCustomers()
    const customerIndex = customers.findIndex(c => c.id === resolvedParams.id)

    if (customerIndex === -1) {
      return NextResponse.json(
        { error: 'Customer not found', success: false },
        { status: 404 }
      )
    }

    const deletedCustomer = customers[customerIndex]

    return NextResponse.json({
      data: deletedCustomer,
      message: 'Customer deleted successfully',
      success: true
    })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer', success: false },
      { status: 500 }
    )
  }
}