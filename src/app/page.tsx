'use client'

import { useState } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import DashboardModule from '@/components/Modules/Dashboard'
import ProjectManagementModule from '@/components/Modules/ProjectManagement'
import SurveyEstimationModule from '@/components/Modules/SurveyEstimation'
import QuotationNegotiationModule from '@/components/Modules/QuotationNegotiation'
import ProcurementVendorModule from '@/components/Modules/ProcurementVendor'
import WarehouseMaterialModule from '@/components/Modules/WarehouseMaterial'
import TechnicianWorkModule from '@/components/Modules/TechnicianWork'
import FinancePaymentModule from '@/components/Modules/FinancePayment'
import ReportingModule from '@/components/Modules/Reporting'

const renderModule = (currentModule: string) => {
  switch (currentModule) {
    case 'dashboard':
      return <DashboardModule />
    case 'project-management':
      return <ProjectManagementModule />
    case 'survey-estimation':
      return <SurveyEstimationModule />
    case 'quotation-negotiation':
      return <QuotationNegotiationModule />
    case 'procurement-vendor':
      return <ProcurementVendorModule />
    case 'warehouse-material':
      return <WarehouseMaterialModule />
    case 'technician-work':
      return <TechnicianWorkModule />
    case 'finance-payment':
      return <FinancePaymentModule />
    case 'reporting':
      return <ReportingModule />
    default:
      return <DashboardModule />
  }
}

export default function Home() {
  const [currentModule, setCurrentModule] = useState('dashboard')

  return (
    <MainLayout 
      currentModule={currentModule}
      onModuleChange={setCurrentModule}
    >
      {renderModule(currentModule)}
    </MainLayout>
  )
}
