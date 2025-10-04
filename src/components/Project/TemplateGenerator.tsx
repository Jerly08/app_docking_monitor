'use client'

import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Checkbox,
  CheckboxGroup,
  useToast,
  Badge,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { FiLayers, FiPackage } from 'react-icons/fi'
import React, { useState, useEffect } from 'react'

interface WorkItemTemplate {
  id: string
  title: string
  description?: string
  packageLetter: string
  packageName: string
  parentTemplateId?: string
  volume?: number
  unit?: string
  children?: WorkItemTemplate[]
}

interface TemplateGeneratorProps {
  projectId: string
  onWorkItemsGenerated: () => void
}

const TemplateGenerator: React.FC<TemplateGeneratorProps> = ({
  projectId,
  onWorkItemsGenerated
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [templates, setTemplates] = useState<WorkItemTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedPackages, setSelectedPackages] = useState<string[]>([])
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([])
  const [generationMode, setGenerationMode] = useState<'packages' | 'templates'>('packages')
  
  const toast = useToast()

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/work-item-templates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Handle response format from API - extract templates array
        setTemplates(data.templates || data)
      } else {
        throw new Error('Failed to fetch templates')
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        status: 'error',
        duration: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  const generateWorkItems = async () => {
    try {
      if (generationMode === 'packages' && selectedPackages.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'Please select at least one package',
          status: 'error',
          duration: 3000
        })
        return
      }

      if (generationMode === 'templates' && selectedTemplateIds.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'Please select at least one template',
          status: 'error',
          duration: 3000
        })
        return
      }

      setGenerating(true)
      const token = localStorage.getItem('auth_token')
      
      const requestBody = generationMode === 'packages' 
        ? { packages: selectedPackages }
        : { templateIds: selectedTemplateIds }

      const response = await fetch(`/api/projects/${projectId}/generate-work-items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Success',
          description: `Generated ${result.created} work items successfully`,
          status: 'success',
          duration: 4000
        })
        
        // Reset selections and close modal
        setSelectedPackages([])
        setSelectedTemplateIds([])
        onClose()
        
        // Notify parent to refresh work items
        onWorkItemsGenerated()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to generate work items')
      }
    } catch (error: any) {
      console.error('Error generating work items:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate work items',
        status: 'error',
        duration: 3000
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleOpen = () => {
    onOpen()
    fetchTemplates()
  }

  // Group templates by package
  const templatesByPackage = templates.reduce((acc, template) => {
    if (!template.parentTemplateId) { // Only root templates
      if (!acc[template.packageLetter]) {
        acc[template.packageLetter] = []
      }
      acc[template.packageLetter].push(template)
    }
    return acc
  }, {} as Record<string, WorkItemTemplate[]>)

  const availablePackages = Object.keys(templatesByPackage).sort()

  const renderTemplateTree = (template: WorkItemTemplate, level: number = 0) => {
    const hasChildren = template.children && template.children.length > 0
    const paddingLeft = level * 20

    return (
      <Box key={template.id} pl={`${paddingLeft}px`}>
        <HStack spacing={2} py={1}>
          <Checkbox
            value={template.id}
            isChecked={selectedTemplateIds.includes(template.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedTemplateIds([...selectedTemplateIds, template.id])
              } else {
                setSelectedTemplateIds(selectedTemplateIds.filter(id => id !== template.id))
              }
            }}
          >
            <Text fontSize="sm" fontWeight={level === 0 ? 'semibold' : 'normal'}>
              {template.title}
            </Text>
          </Checkbox>
          <Badge size="sm" colorScheme="blue">
            {template.volume ? `${template.volume}${template.unit || ''}` : 'N/A'}
          </Badge>
        </HStack>
        
        {hasChildren && template.children?.map(child => 
          renderTemplateTree(child, level + 1)
        )}
      </Box>
    )
  }

  if (!projectId) {
    return null
  }

  return (
    <>
      <Button
        leftIcon={<FiLayers />}
        colorScheme="purple"
        variant="outline"
        size="sm"
        onClick={handleOpen}
      >
        Generate from Templates
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxH="80vh">
          <ModalHeader>Generate Work Items from Templates</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody overflow="auto">
            {loading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" color="purple.500" />
                <Text mt={4} color="gray.600">Loading templates...</Text>
              </Box>
            ) : (
              <VStack spacing={6} align="stretch">
                {/* Generation Mode Selection */}
                <Box>
                  <Text fontWeight="semibold" mb={3}>Generation Mode</Text>
                  <HStack spacing={4}>
                    <Button
                      variant={generationMode === 'packages' ? 'solid' : 'outline'}
                      colorScheme="purple"
                      size="sm"
                      leftIcon={<FiPackage />}
                      onClick={() => setGenerationMode('packages')}
                    >
                      By Packages
                    </Button>
                    <Button
                      variant={generationMode === 'templates' ? 'solid' : 'outline'}
                      colorScheme="purple" 
                      size="sm"
                      leftIcon={<FiLayers />}
                      onClick={() => setGenerationMode('templates')}
                    >
                      Specific Templates
                    </Button>
                  </HStack>
                </Box>

                <Divider />

                {/* Package Selection Mode */}
                {generationMode === 'packages' && (
                  <Box>
                    <Text fontWeight="semibold" mb={3}>
                      Select Packages to Generate
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={4}>
                      Select one or more packages to generate all their work items and maintain hierarchy.
                    </Text>
                    
                    <CheckboxGroup
                      value={selectedPackages}
                      onChange={(values) => setSelectedPackages(values as string[])}
                    >
                      <VStack spacing={3} align="stretch">
                        {availablePackages.map(packageName => {
                          const packageTemplates = templatesByPackage[packageName]
                          const totalTemplates = packageTemplates.reduce((sum, template) => {
                            const countTemplates = (t: WorkItemTemplate): number => {
                              return 1 + (t.children ? t.children.reduce((acc, child) => acc + countTemplates(child), 0) : 0)
                            }
                            return sum + countTemplates(template)
                          }, 0)

                          return (
                            <Box key={packageName} p={3} border="1px solid" borderColor="gray.200" borderRadius="md">
                              <HStack justify="space-between" align="center">
                                <Checkbox value={packageName}>
                                  <VStack align="start" spacing={1}>
                                    <Text fontWeight="semibold">Package {packageName}</Text>
                                    <Text fontSize="sm" color="gray.600">
                                      {packageTemplates.length} root templates, {totalTemplates} total items
                                    </Text>
                                  </VStack>
                                </Checkbox>
                                <Badge colorScheme="purple" size="sm">
                                  {totalTemplates} items
                                </Badge>
                              </HStack>
                            </Box>
                          )
                        })}
                      </VStack>
                    </CheckboxGroup>
                  </Box>
                )}

                {/* Template Selection Mode */}
                {generationMode === 'templates' && (
                  <Box>
                    <Text fontWeight="semibold" mb={3}>
                      Select Specific Templates
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={4}>
                      Choose specific templates to generate. Parent-child relationships will be preserved.
                    </Text>

                    <Accordion allowToggle>
                      {availablePackages.map(packageName => (
                        <AccordionItem key={packageName}>
                          <AccordionButton>
                            <Box flex="1" textAlign="left">
                              <HStack>
                                <Text fontWeight="semibold">Package {packageName}</Text>
                                <Badge size="sm" colorScheme="purple">
                                  {templatesByPackage[packageName].length} root templates
                                </Badge>
                              </HStack>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel pb={4}>
                            <VStack spacing={2} align="stretch">
                              {templatesByPackage[packageName].map(template => 
                                renderTemplateTree(template)
                              )}
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </Box>
                )}

                {/* Info Alert */}
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Generated work items will be automatically linked to this project and maintain their hierarchical structure from templates.
                  </Text>
                </Alert>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={generateWorkItems}
              isLoading={generating}
              loadingText="Generating..."
              disabled={loading || (generationMode === 'packages' && selectedPackages.length === 0) || (generationMode === 'templates' && selectedTemplateIds.length === 0)}
            >
              Generate Work Items
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default TemplateGenerator