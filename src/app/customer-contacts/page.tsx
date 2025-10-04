'use client'

import { Suspense } from 'react'
import { Box, Spinner, Center } from '@chakra-ui/react'
import CustomerContacts from '@/components/Modules/CustomerContacts'
import MainLayout from '@/components/Layout/MainLayout'

export default function CustomerContactsPage() {
  return (
    <MainLayout 
      currentModule="customer-contacts"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Customer Contacts' }
      ]}
    >
      <Suspense fallback={
        <Center h="400px">
          <Spinner size="xl" color="blue.500" />
        </Center>
      }>
        <CustomerContacts />
      </Suspense>
    </MainLayout>
  )
}