'use client'

import { ReactNode } from 'react'
import { Box, Flex, Text, Spinner } from '@chakra-ui/react'
import MainLayout from './MainLayout'
import NoSSR from '../NoSSR'

interface ClientOnlyLayoutProps {
  children: ReactNode
  currentModule?: string
  breadcrumbs?: { label: string; href?: string }[]
  onModuleChange?: (moduleId: string) => void
}

// Loading skeleton that matches server-side structure
const LoadingSkeleton = () => (
  <Flex h="100vh" bg="gray.50">
    <Box w="280px" bg="white" borderRight="1px" borderColor="gray.200">
      <Flex h="60px" align="center" px={4} borderBottom="1px" borderColor="gray.200">
        <Text fontSize="lg" fontWeight="bold" color="blue.600">
          Docking Monitor
        </Text>
      </Flex>
      <Box p={4}>
        <Text color="gray.400" fontSize="sm">Loading navigation...</Text>
      </Box>
    </Box>
    <Flex flex="1" direction="column" bg="gray.50">
      <Flex h="60px" bg="white" borderBottom="1px" borderColor="gray.200" align="center" justify="center">
        <Spinner size="sm" color="blue.500" />
        <Text ml={3} color="gray.500" fontSize="sm">Loading...</Text>
      </Flex>
      <Box flex="1" p={6}>
        <Text color="gray.400">Loading content...</Text>
      </Box>
    </Flex>
  </Flex>
)

const ClientOnlyLayout = ({ children, currentModule, breadcrumbs, onModuleChange }: ClientOnlyLayoutProps) => {
  return (
    <NoSSR fallback={<LoadingSkeleton />}>
      <MainLayout 
        currentModule={currentModule}
        breadcrumbs={breadcrumbs}
        onModuleChange={onModuleChange}
      >
        {children}
      </MainLayout>
    </NoSSR>
  )
}

export default ClientOnlyLayout