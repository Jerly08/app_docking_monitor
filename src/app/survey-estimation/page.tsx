'use client'

import MainLayout from '@/components/Layout/MainLayout'
import SurveyEstimationModule from '@/components/Modules/SurveyEstimation'

export default function SurveyEstimationPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Survey & Estimasi' }
  ]

  return (
    <MainLayout currentModule="survey-estimation" breadcrumbs={breadcrumbs}>
      <SurveyEstimationModule />
    </MainLayout>
  )
}