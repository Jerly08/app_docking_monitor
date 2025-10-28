'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Progress,
  Divider,
  Switch,
  Icon,
  Flex,
} from '@chakra-ui/react'
import { FiCalendar, FiClock, FiUsers, FiPackage, FiFlag, FiPercent } from 'react-icons/fi'
import ImageUpload from './ImageUpload'

interface WorkItem {
  id: string
  number?: number
  category?: string
  title: string
  description?: string
  volume?: number
  unit?: string
  status?: string
  completion: number
  imageUrl?: string
  parentId?: string
  package?: string
  durationDays?: number
  startDate?: string
  finishDate?: string
  resourceNames: string
  isMilestone: boolean
  children?: WorkItem[]
  parent?: WorkItem
  createdAt?: string
  updatedAt?: string
  projectId?: string
  templateId?: string
}

interface ViewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  workItem: WorkItem | null
}

export default function ViewTaskModal({ isOpen, onClose, workItem }: ViewTaskModalProps) {
  if (!workItem) return null

  const getStatusColor = (completion: number) => {
    if (completion === 100) return 'green'
    if (completion > 0) return 'blue'
    return 'gray'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    })
  }

  const isChildItem = workItem.parentId !== null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiFlag} color="blue.500" />
            <Text>Task Details</Text>
            {isChildItem && (
              <Badge colorScheme="purple" size="sm">
                Realization Item
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Basic Info */}
            <Box>
              <HStack justify="space-between" mb={3}>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  ID: {workItem.id}
                </Text>
                {workItem.isMilestone && (
                  <Badge colorScheme="yellow" size="sm">
                    🏁 Milestone
                  </Badge>
                )}
              </HStack>
              
              <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={2}>
                {workItem.title}
              </Text>
              
              {workItem.description && (
                <Text fontSize="sm" color="gray.600" p={3} bg="gray.50" borderRadius="md">
                  {workItem.description}
                </Text>
              )}
            </Box>

            <Divider />

            {/* Package & Category */}
            <HStack spacing={6}>
              <VStack align="start" spacing={1}>
                <HStack>
                  <Icon as={FiPackage} color="blue.500" size="sm" />
                  <Text fontSize="sm" fontWeight="medium">Package</Text>
                </HStack>
                <Text fontSize="sm" color="gray.700">
                  {workItem.package || 'Not specified'}
                </Text>
              </VStack>
              
              {workItem.volume && (
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="medium">Volume</Text>
                  <Text fontSize="sm" color="gray.700">
                    {workItem.volume} {workItem.unit || 'unit'}
                  </Text>
                </VStack>
              )}
            </HStack>

            <Divider />

            {/* Progress */}
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FiPercent} color="green.500" size="sm" />
                  <Text fontSize="sm" fontWeight="medium">Progress</Text>
                </HStack>
                <Badge colorScheme={getStatusColor(workItem.completion)} size="md">
                  {workItem.completion}% Complete
                </Badge>
              </HStack>
              
              <Progress 
                value={workItem.completion} 
                colorScheme={getStatusColor(workItem.completion)}
                size="lg" 
                borderRadius="full"
              />
            </VStack>

            <Divider />

            {/* Timeline */}
            <VStack align="stretch" spacing={3}>
              <HStack>
                <Icon as={FiCalendar} color="purple.500" size="sm" />
                <Text fontSize="sm" fontWeight="medium">Timeline</Text>
              </HStack>
              
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" color="gray.500">Start Date</Text>
                  <Text fontSize="sm" color="gray.700">
                    {formatDate(workItem.startDate)}
                  </Text>
                </VStack>
                
                <VStack align="center" spacing={1}>
                  <Icon as={FiClock} color="gray.400" />
                  <Text fontSize="xs" color="gray.500">
                    {workItem.durationDays || 1} days
                  </Text>
                </VStack>
                
                <VStack align="end" spacing={1}>
                  <Text fontSize="xs" color="gray.500">Finish Date</Text>
                  <Text fontSize="sm" color="gray.700">
                    {formatDate(workItem.finishDate)}
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            <Divider />

            {/* Resources */}
            <VStack align="stretch" spacing={2}>
              <HStack>
                <Icon as={FiUsers} color="orange.500" size="sm" />
                <Text fontSize="sm" fontWeight="medium">Resources</Text>
              </HStack>
              <Text fontSize="sm" color="gray.700" p={2} bg="orange.50" borderRadius="md">
                {workItem.resourceNames || 'Not specified'}
              </Text>
            </VStack>


            {/* Parent/Child Info */}
            {(workItem.parentId || (workItem.children && workItem.children.length > 0)) && (
              <>
                <Divider />
                <VStack align="stretch" spacing={2}>
                  <Text fontSize="sm" fontWeight="medium">Hierarchy</Text>
                  {workItem.parentId && (
                    <Text fontSize="sm" color="blue.600">
                      📄 This is a realization item
                    </Text>
                  )}
                  {workItem.children && workItem.children.length > 0 && (
                    <Text fontSize="sm" color="green.600">
                      📁 Has {workItem.children.length} realization item(s)
                    </Text>
                  )}
                </VStack>
              </>
            )}

            {/* Image Attachments */}
            <Divider />
            <ImageUpload 
              workItemId={workItem.id}
              workItemTitle={workItem.title}
              maxFiles={10}
            />

            {/* Timestamps */}
            <Box pt={2} borderTop="1px solid" borderColor="gray.200">
              <HStack justify="space-between" fontSize="xs" color="gray.500">
                <Text>
                  Created: {formatDate(workItem.createdAt)}
                </Text>
                {workItem.updatedAt && workItem.updatedAt !== workItem.createdAt && (
                  <Text>
                    Updated: {formatDate(workItem.updatedAt)}
                  </Text>
                )}
              </HStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}