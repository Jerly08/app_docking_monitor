'use client'

import MainLayout from '@/components/Layout/MainLayout'
import QuotationNegotiationModule from '@/components/Modules/QuotationNegotiation'

export default function QuotationNegotiationPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Penawaran & Negosiasi' }
  ]

  return (
    <MainLayout currentModule="quotation-negotiation" breadcrumbs={breadcrumbs}>
      <QuotationNegotiationModule />
    </MainLayout>
  )
}