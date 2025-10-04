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

// Mock database - In a real application, you would use a proper database
let customers: CustomerContact[] = [
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

// GET - Fetch all customers or search/filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    let filteredCustomers = [...customers]

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.vesselName.toLowerCase().includes(searchTerm) ||
        customer.ownerCompany.toLowerCase().includes(searchTerm) ||
        customer.contactPerson.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm)
      )
    }

    // Apply status filter
    if (status && status !== 'all') {
      filteredCustomers = filteredCustomers.filter(customer => customer.status === status)
    }

    // Apply pagination
    const totalCount = filteredCustomers.length
    if (limit && offset) {
      const startIndex = parseInt(offset)
      const endIndex = startIndex + parseInt(limit)
      filteredCustomers = filteredCustomers.slice(startIndex, endIndex)
    }

    return NextResponse.json({
      data: filteredCustomers,
      total: totalCount,
      success: true
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers', success: false },
      { status: 500 }
    )
  }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['vesselName', 'ownerCompany', 'contactPerson', 'phoneNumber']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}`, success: false },
          { status: 400 }
        )
      }
    }

    // Create new customer
    const newCustomer: CustomerContact = {
      id: Date.now().toString(),
      vesselName: body.vesselName,
      ownerCompany: body.ownerCompany,
      vesselType: body.vesselType || '',
      grt: parseFloat(body.grt) || 0,
      loa: parseFloat(body.loa) || 0,
      lbp: parseFloat(body.lbp) || 0,
      breadth: parseFloat(body.breadth) || 0,
      depth: parseFloat(body.depth) || 0,
      status: body.status || 'ACTIVE',
      contactPerson: body.contactPerson,
      phoneNumber: body.phoneNumber,
      email: body.email || '',
      address: body.address || '',
      notes: body.notes || '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      lastDockingDate: body.lastDockingDate || undefined,
      nextScheduledDocking: body.nextScheduledDocking || undefined,
      totalDockings: parseInt(body.totalDockings) || 0,
    }

    customers.push(newCustomer)

    return NextResponse.json({
      data: newCustomer,
      message: 'Customer created successfully',
      success: true
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer', success: false },
      { status: 500 }
    )
  }
}

// PUT - Update existing customer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required', success: false },
        { status: 400 }
      )
    }

    const customerIndex = customers.findIndex(customer => customer.id === id)
    if (customerIndex === -1) {
      return NextResponse.json(
        { error: 'Customer not found', success: false },
        { status: 404 }
      )
    }

    // Update customer
    const updatedCustomer = {
      ...customers[customerIndex],
      ...body,
      id: customers[customerIndex].id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString().split('T')[0]
    }

    customers[customerIndex] = updatedCustomer

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

// DELETE - Delete customer
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required', success: false },
        { status: 400 }
      )
    }

    const customerIndex = customers.findIndex(customer => customer.id === id)
    if (customerIndex === -1) {
      return NextResponse.json(
        { error: 'Customer not found', success: false },
        { status: 404 }
      )
    }

    // Remove customer
    const deletedCustomer = customers.splice(customerIndex, 1)[0]

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