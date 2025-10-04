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
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  Switch,
  VStack,
  HStack,
  useToast,
  Box,
  Text,
  Divider,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

interface WorkItem {
  id: string
  title: string
  description?: string
  package?: string
  volume?: number
  unit?: string
}

interface AddChildWorkItemModalProps {
  isOpen: boolean
  onClose: () => void
  parentItem: WorkItem | null
  projectId: string
  onWorkItemAdded: () => void
}

export default function AddChildWorkItemModal({ 
  isOpen, 
  onClose, 
  parentItem, 
  projectId, 
  onWorkItemAdded 
}: AddChildWorkItemModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    package: '',
    volume: 1,
    unit: 'set',
    durationDays: 1,
    resourceNames: '',
    isMilestone: false,
    startDate: '',
    finishDate: '',
    completion: 0
  })
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  // Pre-fill form with parent data when modal opens
  useEffect(() => {
    if (isOpen && parentItem) {
      setFormData(prev => ({
        ...prev,
        package: parentItem.package || 'PELAYANAN UMUM',
        title: '', // Keep title empty for user to fill
        description: '', // Keep description empty for user to fill
        volume: parentItem.volume || 1,
        unit: parentItem.unit || 'set'
      }))
    }
  }, [isOpen, parentItem])

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Task name is required',
        status: 'error',
        duration: 3000
      })
      return
    }

    if (!parentItem) {
      toast({
        title: 'Error',
        description: 'Parent item is required',
        status: 'error',
        duration: 3000
      })
      return
    }

    try {
      setLoading(true)
      console.log('🚀 Starting to create realization item...')
      console.log('Form data:', formData)
      console.log('Parent item:', parentItem.id)
      console.log('Project ID:', projectId)
      
      // Create abort controller for timeout handling
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => {
        abortController.abort()
        console.error('⏰ Request timeout after 30 seconds')
      }, 30000) // 30 second timeout

      // Create child work item with parent reference
      const requestData = {
        ...formData,
        projectId,
        parentId: parentItem.id
      }
      
      console.log('📤 Sending request data:', JSON.stringify(requestData, null, 2))
      
      const response = await fetch('/api/work-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(requestData),
        signal: abortController.signal
      })

      clearTimeout(timeoutId)
      console.log('📥 Response received:', response.status, response.statusText)

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ Success response:', responseData)
        
        toast({
          title: 'Success',
          description: 'Child work item added successfully',
          status: 'success',
          duration: 3000
        })
        onWorkItemAdded()
        onClose()
        resetForm()
      } else {
        const errorText = await response.text()
        console.error('❌ Error response:', response.status, errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || `Server error: ${response.status}` }
        }
        
        throw new Error(errorData.error || `Server error: ${response.status} ${response.statusText}`)
      }
    } catch (error: any) {
      console.error('💥 Error adding child work item:', error)
      
      let errorMessage = 'Failed to add child work item'
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out after 30 seconds. Please try again.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
      console.log('🏁 Request completed, loading state reset')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      package: '',
      volume: 1,
      unit: 'set',
      durationDays: 1,
      resourceNames: '',
      isMilestone: false,
      startDate: '',
      finishDate: '',
      completion: 0
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Realization Item</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {/* Parent Information Display */}
            {parentItem && (
              <>
                <Box w="full" p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                  <Text fontSize="sm" fontWeight="semibold" color="blue.800" mb={1}>
                    Parent Item:
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    {parentItem.title}
                  </Text>
                  <Text fontSize="xs" color="blue.500" mt={1}>
                    Package: {parentItem.package || 'Not specified'}
                  </Text>
                </Box>
                
                <Box w="full" textAlign="center">
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    Realisasi:
                  </Text>
                </Box>
                
                <Divider />
              </>
            )}

            <FormControl isRequired>
              <FormLabel>Realization Description</FormLabel>
              <Textarea
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Describe the actual work performed..."
                rows={4}
              />
            </FormControl>

            <HStack width="100%" spacing={4}>
              <FormControl>
                <FormLabel>Volume</FormLabel>
                <NumberInput
                  value={formData.volume}
                  onChange={(_, value) => setFormData({ ...formData, volume: value || 1 })}
                  min={1}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Unit</FormLabel>
                <Select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="set">set</option>
                  <option value="ls">ls (lump sum)</option>
                  <option value="m²">m² (square meter)</option>
                  <option value="m³">m³ (cubic meter)</option>
                  <option value="hr">hr (hours)</option>
                  <option value="day">day</option>
                </Select>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Status / Notes</FormLabel>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., SELESAI 100%, IN PROGRESS, etc."
              />
            </FormControl>

            <HStack width="100%" spacing={4}>
              <FormControl>
                <FormLabel>Resource Names</FormLabel>
                <Input
                  value={formData.resourceNames}
                  onChange={(e) => setFormData({ ...formData, resourceNames: e.target.value })}
                  placeholder="e.g., Team A, Harbor Pilot"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Duration (Days)</FormLabel>
                <NumberInput
                  value={formData.durationDays}
                  onChange={(_, value) => setFormData({ ...formData, durationDays: value || 1 })}
                  min={1}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </HStack>

            <HStack width="100%" spacing={4}>
              <FormControl>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Finish Date</FormLabel>
                <Input
                  type="date"
                  value={formData.finishDate}
                  onChange={(e) => setFormData({ ...formData, finishDate: e.target.value })}
                />
              </FormControl>
            </HStack>

            <HStack width="100%" spacing={4}>
              <FormControl>
                <FormLabel>Progress (%)</FormLabel>
                <NumberInput
                  value={formData.completion}
                  onChange={(_, value) => setFormData({ ...formData, completion: value || 0 })}
                  min={0}
                  max={100}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Milestone</FormLabel>
                <Switch
                  isChecked={formData.isMilestone}
                  onChange={(e) => setFormData({ ...formData, isMilestone: e.target.checked })}
                />
              </FormControl>
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
            Add Realization
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}