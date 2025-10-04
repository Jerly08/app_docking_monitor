# Customer Contacts Module

## Overview
The Customer Contacts module has been added to the Docking Monitor application to manage customer information extracted from docking reports. This module allows you to store, view, edit, and manage vessel and company contact information.

## Features

### 📊 Dashboard Statistics
- Total registered customers
- Active vessels count
- Vessels in maintenance/survey
- Inactive vessels count

### 🔍 Search and Filtering
- Search by vessel name, company name, or contact person
- Filter by vessel status (Active, Maintenance, Special Survey, Inactive, Urgent)
- Export functionality for data management

### 📝 Comprehensive Customer Information
Based on docking report data structure:
- **Vessel Information**: Name, Type, GRT
- **Technical Specifications**: LOA, LBP, Breadth, Depth (matching docking report format)
- **Company Details**: Owner company information
- **Contact Information**: Person, phone, email, address
- **Status Tracking**: Current vessel status and docking history
- **Notes**: Additional remarks and observations

### 🚢 Vessel Types Supported
- Oil Tanker
- Cargo Ship
- Container Ship
- Bulk Carrier
- Passenger Ship
- Fishing Vessel
- Tug Boat
- Barge
- Supply Vessel

### 🏷️ Status Management
- **Active**: Vessel is currently operational
- **Maintenance**: Routine maintenance in progress
- **Special Survey**: Special survey requirements (as per docking reports)
- **Inactive**: Vessel not in service
- **Urgent**: Requires immediate attention

## Technical Implementation

### File Structure
```
src/
├── app/
│   ├── customer-contacts/
│   │   └── page.tsx                 # Main customer contacts page
│   └── api/
│       └── customer-contacts/
│           ├── route.ts             # Main CRUD API endpoints
│           └── [id]/
│               └── route.ts         # Individual customer operations
├── components/
│   └── Modules/
│       └── CustomerContacts.tsx     # Main component with full functionality
└── types/
    └── customer.ts                  # TypeScript interfaces and types
```

### API Endpoints
- `GET /api/customer-contacts` - Fetch all customers with search/filter support
- `POST /api/customer-contacts` - Create new customer
- `PUT /api/customer-contacts` - Update existing customer
- `DELETE /api/customer-contacts?id={id}` - Delete customer
- `GET /api/customer-contacts/[id]` - Fetch specific customer
- `PATCH /api/customer-contacts/[id]` - Partial update of customer
- `DELETE /api/customer-contacts/[id]` - Delete specific customer

### Navigation
The Customer Contacts module is accessible from the main sidebar navigation with a phone icon. It's positioned after "Work Plan & Report" in the navigation menu.

## Usage

### Adding New Customers
1. Click "Add Customer" button in the top-right
2. Fill in vessel information (name, type)
3. Enter technical specifications (GRT, LOA, LBP, Breadth, Depth)
4. Add company and contact details
5. Set appropriate status
6. Add any relevant notes
7. Save the customer

### Managing Existing Customers
- **View**: Click the eye icon to see detailed customer information
- **Edit**: Click the edit icon to modify customer details
- **Delete**: Click the delete icon to remove a customer (with confirmation)

### Searching and Filtering
- Use the search bar to find customers by vessel name, company, or contact person
- Use the status dropdown to filter by vessel status
- Export data using the Export button

## Data Integration

This module is designed to work with the docking report system, matching the data structure shown in the original docking reports:
- Vessel specifications match the technical requirements (LOA, LBP, BM, T)
- Owner company information is preserved
- Status tracking aligns with docking report statuses
- GRT and vessel type information is maintained

## Future Enhancements

Potential improvements for the module:
1. Integration with actual database (currently uses mock data)
2. File upload for vessel documents
3. Docking history timeline view
4. Automated report generation
5. Email notifications for scheduled dockings
6. Advanced analytics and reporting
7. Integration with Work Plan & Report module

## Development Notes

- Uses TypeScript for type safety
- Responsive design with Chakra UI
- Follows Next.js 15 App Router conventions
- Implements proper error handling and loading states
- Uses shared interfaces for consistency across the application