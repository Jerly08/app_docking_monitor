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
} from '@chakra-ui/react'
import { useState } from 'react'

interface AddWorkItemModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onWorkItemAdded: () => void
}

export default function AddWorkItemModal({ isOpen, onClose, projectId, onWorkItemAdded }: AddWorkItemModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    package: 'PELAYANAN UMUM',
    volume: 1,
    unit: 'ls',
    durationDays: 1,
    resourceNames: '',
    isMilestone: false,
    startDate: '',
    finishDate: '',
    completion: 0
  })
  const [loading, setLoading] = useState(false)
  const toast = useToast()

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

    try {
      setLoading(true)
      const response = await fetch('/api/work-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          ...formData,
          projectId
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Work item added successfully',
          status: 'success',
          duration: 3000
        })
        onWorkItemAdded()
        onClose()
        setFormData({
          title: '',
          description: '',
          package: 'PELAYANAN UMUM',
          volume: 1,
          unit: 'ls',
          durationDays: 1,
          resourceNames: '',
          isMilestone: false,
          startDate: '',
          finishDate: '',
          completion: 0
        })
      } else {
        throw new Error('Failed to add work item')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add work item',
        status: 'error',
        duration: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Work Item</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Task Name</FormLabel>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task name"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
              />
            </FormControl>

            <HStack width="100%" spacing={4}>
              <FormControl>
                <FormLabel>Package</FormLabel>
                <Select
                  value={formData.package}
                  onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                >
                  <option value="PELAYANAN UMUM">Package A - Pelayanan Umum</option>
                  <option value="UNIT PERAWATAN LAMBUNG & TANGKI">Package B - Unit Perawatan Lambung & Tangki</option>
                  <option value="UNIT PERAWATAN MESIN">Package C - Unit Perawatan Mesin</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Resource Names</FormLabel>
                <Input
                  value={formData.resourceNames}
                  onChange={(e) => setFormData({ ...formData, resourceNames: e.target.value })}
                  placeholder="e.g., Team A, Harbor Pilot"
                />
              </FormControl>
            </HStack>

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
                  <option value="ls">ls (lump sum)</option>
                  <option value="m²">m² (square meter)</option>
                  <option value="m³">m³ (cubic meter)</option>
                  <option value="hr">hr (hours)</option>
                  <option value="day">day</option>
                  <option value="set">set</option>
                </Select>
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
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
            Add Work Item
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}