'use client'

import {
  Button,
  useToast,
  VStack,
  Text,
  HStack,
  Badge,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  IconButton,
  Tooltip
} from '@chakra-ui/react'
import { FiRefreshCw, FiBarChart, FiActivity } from 'react-icons/fi'
import { useState } from 'react'

interface CompletionStats {
  totalItems: number
  averageCompletion: number
  completedItems: number
  inProgressItems: number
  notStartedItems: number
}

interface CompletionRecalculatorProps {
  projectId: string
  onRecalculationComplete?: () => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'button' | 'icon' | 'detailed'
}

export default function CompletionRecalculator({ 
  projectId, 
  onRecalculationComplete, 
  size = 'sm',
  variant = 'button'
}: CompletionRecalculatorProps) {
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [stats, setStats] = useState<CompletionStats | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const recalculateCompletion = async () => {
    if (!projectId) {
      toast({
        title: 'Error',
        description: 'No project selected',
        status: 'error',
        duration: 3000
      })
      return
    }

    setIsRecalculating(true)
    
    try {
      const response = await fetch('/api/work-items/recalculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ projectId })
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.statistics)
        
        toast({
          title: 'Completion Recalculated',
          description: `Successfully updated completion percentages for ${data.statistics.totalItems} work items`,
          status: 'success',
          duration: 4000
        })

        // Call callback to refresh parent component
        onRecalculationComplete?.()
        
        // Show detailed results if variant is 'detailed'
        if (variant === 'detailed') {
          onOpen()
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to recalculate completion')
      }
    } catch (error) {
      console.error('Error recalculating completion:', error)
      toast({
        title: 'Recalculation Failed',
        description: error instanceof Error ? error.message : 'Failed to recalculate completion percentages',
        status: 'error',
        duration: 3000
      })
    } finally {
      setIsRecalculating(false)
    }
  }

  const getCompletionStats = async () => {
    try {
      const response = await fetch(`/api/work-items/recalculate?projectId=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.statistics)
        onOpen()
      }
    } catch (error) {
      console.error('Error getting completion stats:', error)
    }
  }

  // Icon variant - just an icon button
  if (variant === 'icon') {
    return (
      <Tooltip label="Recalculate completion percentages based on child items">
        <IconButton
          size={size}
          variant="ghost"
          colorScheme="blue"
          icon={<FiRefreshCw />}
          aria-label="Recalculate Completion"
          onClick={recalculateCompletion}
          isLoading={isRecalculating}
          loadingText="Calculating..."
        />
      </Tooltip>
    )
  }

  // Button variant
  if (variant === 'button') {
    return (
      <Button
        size={size}
        leftIcon={<FiRefreshCw />}
        colorScheme="blue"
        variant="outline"
        onClick={recalculateCompletion}
        isLoading={isRecalculating}
        loadingText="Recalculating..."
      >
        Recalculate Completion
      </Button>
    )
  }

  // Detailed variant - button with stats modal
  return (
    <>
      <HStack spacing={2}>
        <Button
          size={size}
          leftIcon={<FiRefreshCw />}
          colorScheme="blue"
          variant="outline"
          onClick={recalculateCompletion}
          isLoading={isRecalculating}
          loadingText="Recalculating..."
        >
          Recalculate Completion
        </Button>
        <Button
          size={size}
          leftIcon={<FiBarChart />}
          colorScheme="purple"
          variant="ghost"
          onClick={getCompletionStats}
        >
          View Stats
        </Button>
      </HStack>

      {/* Statistics Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FiActivity />
              <Text>Project Completion Statistics</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {stats ? (
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <Stat textAlign="center">
                        <StatLabel>Total Work Items</StatLabel>
                        <StatNumber color="blue.600">{stats.totalItems}</StatNumber>
                        <StatHelpText>All items in project</StatHelpText>
                      </Stat>
                      
                      <Stat textAlign="center">
                        <StatLabel>Average Completion</StatLabel>
                        <StatNumber color="green.600">{stats.averageCompletion}%</StatNumber>
                        <StatHelpText>Overall project progress</StatHelpText>
                      </Stat>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <Text fontWeight="semibold" mb={4} color="gray.700">
                      Work Items by Status
                    </Text>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <HStack>
                          <Badge colorScheme="green" variant="solid">Completed</Badge>
                          <Text fontSize="sm" color="gray.600">(100%)</Text>
                        </HStack>
                        <Text fontWeight="bold">{stats.completedItems} items</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <HStack>
                          <Badge colorScheme="blue" variant="solid">In Progress</Badge>
                          <Text fontSize="sm" color="gray.600">(1-99%)</Text>
                        </HStack>
                        <Text fontWeight="bold">{stats.inProgressItems} items</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <HStack>
                          <Badge colorScheme="gray" variant="solid">Not Started</Badge>
                          <Text fontSize="sm" color="gray.600">(0%)</Text>
                        </HStack>
                        <Text fontWeight="bold">{stats.notStartedItems} items</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg="blue.50" borderColor="blue.200">
                  <CardBody>
                    <VStack spacing={2} align="start">
                      <Text fontSize="sm" fontWeight="semibold" color="blue.800">
                        💡 How Completion Calculation Works
                      </Text>
                      <Text fontSize="xs" color="blue.700" lineHeight="1.4">
                        Parent work items automatically calculate their completion percentage based on the average 
                        completion of all their child items. This creates a hierarchical progress tracking system 
                        where updating a child item automatically updates its parent.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            ) : (
              <Text textAlign="center" color="gray.500" py={8}>
                No statistics available. Run a recalculation to see data.
              </Text>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}