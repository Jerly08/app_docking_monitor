'use client'

import MainLayout from '@/components/Layout/MainLayout'
import ProcurementVendorModule from '@/components/Modules/ProcurementVendor'

export default function ProcurementVendorPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Procurement & Vendor' }
  ]

  return (
    <MainLayout currentModule="procurement-vendor" breadcrumbs={breadcrumbs}>
      <ProcurementVendorModule />
    </MainLayout>
  )
}