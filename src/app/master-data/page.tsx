'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Card,
  CardBody,
} from '@chakra-ui/react'
import MainLayout from '@/components/Layout/MainLayout'

export default function MasterDataPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Master Data & Bank Data' }
  ]

  return (
    <MainLayout currentModule="master-data" breadcrumbs={breadcrumbs}>
      <Container maxW="full" py={6}>
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>Master Data & Bank Data</Heading>
            <Text color="gray.600">
              Manage master data and bank information
            </Text>
          </Box>

          <Card>
            <CardBody>
              <Text>Master Data module will be implemented here.</Text>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </MainLayout>
  )
}