'use client'

import {
  Box,
  Select,
  Text,
  HStack,
  VStack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Textarea,
  useToast,
  Badge,
  Flex,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { FiPlus, FiSettings, FiInfo, FiUsers } from 'react-icons/fi'
import React, { useState, useEffect } from 'react'
import { useClientOnly } from '@/hooks/useClientOnly'
import { useModalState } from '@/hooks/useModalState'
import { useAuth } from '@/contexts/AuthContext'
import { isAdmin, hasProjectPermission } from '@/lib/auth-utils'
import ProjectManager from './ProjectManager'

interface Project {
  id: string
  projectName: string
  vesselName?: string
  customerCompany?: string
  customerId?: string
  customerContactPerson?: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
  vesselSpecs?: any
  status: string
  createdAt: string
  _count?: {
    workItems: number
  }
}

interface CustomerContact {
  id: string
  vesselName: string
  ownerCompany: string
  contactPerson: string
  phoneNumber: string
  email: string
  address: string
  status: string
}

interface ProjectSelectorProps {
  selectedProjectId?: string
  onProjectChange: (projectId: string, project: Project | null) => void
  showCreateButton?: boolean
  showProjectInfo?: boolean
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  selectedProjectId,
  onProjectChange,
  showCreateButton = true,
  showProjectInfo = true
}) => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [customers, setCustomers] = useState<CustomerContact[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const isClient = useClientOnly()
  
  // Create Project Modal dengan failsafe closing
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useModalState()
  const [createForm, setCreateForm] = useState({
    projectName: '',
    vesselName: '',
    customerCompany: '',
    customerId: '',
    customerContactPerson: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    status: 'ACTIVE'
  })
  
  // Confirmation modal state
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useModalState()
  const [conflictingProject, setConflictingProject] = useState<Project | null>(null)
  const [pendingCreation, setPendingCreation] = useState(false)
  
  const toast = useToast()

  // Simple close handler untuk create modal
  const handleCreateModalClose = () => {
    setCreateForm({ 
      projectName: '', 
      vesselName: '', 
      customerCompany: '',
      customerId: '',
      customerContactPerson: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      status: 'ACTIVE' 
    })
    onCreateClose()
  }

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      console.log('Fetching projects from /api/projects...')
      
      const response = await fetch('/api/projects', {
        headers
      })
      
      console.log('Projects API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Raw projects API response:', data)
        
        // Safely extract projects array from response
        const projectsArray = Array.isArray(data) ? data : (data.projects || [])
        console.log('Extracted projects array:', projectsArray)
        
        // Ensure we have a valid array
        if (!Array.isArray(projectsArray)) {
          console.error('Invalid projects data received:', {
            rawData: data,
            extractedArray: projectsArray,
            isArray: Array.isArray(projectsArray),
            dataType: typeof data
          })
          throw new Error(`Invalid projects data format. Expected array, got ${typeof projectsArray}`)
        }
        
        setProjects(projectsArray)
        console.log(`Successfully loaded ${projectsArray.length} projects`)
        
        // Auto-select first project if none selected
        if (!selectedProjectId && projectsArray.length > 0) {
          const firstProject = projectsArray[0]
          console.log('Auto-selecting first project:', firstProject)
          setSelectedProject(firstProject)
          onProjectChange(firstProject.id, firstProject)
        } else if (selectedProjectId && projectsArray.length > 0) {
          // Find and set the selected project
          console.log('Looking for project with ID:', selectedProjectId)
          const project = projectsArray.find((p: Project) => p.id === selectedProjectId)
          console.log('Found project:', project)
          setSelectedProject(project || null)
        }
      } else {
        const errorText = await response.text()
        console.error('Projects API error:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        })
        throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`)
      }
    } catch (error: any) {
      console.error('Error fetching projects:', {
        error,
        message: error?.message,
        stack: error?.stack
      })
      
      // Ensure projects is always an array to prevent further errors
      setProjects([])
      setSelectedProject(null)
      
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load projects',
        status: 'error',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true)
      const response = await fetch('/api/customer-contacts')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.data || [])
      } else {
        throw new Error('Failed to fetch customers')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        status: 'error',
        duration: 3000
      })
    } finally {
      setLoadingCustomers(false)
    }
  }

  const handleProjectChange = (projectId: string) => {
    try {
      // Ensure projects is an array before using find
      if (!Array.isArray(projects)) {
        console.warn('Projects is not an array:', projects)
        setSelectedProject(null)
        onProjectChange(projectId, null)
        return
      }
      
      const project = projects.find(p => p?.id === projectId) || null
      console.log('Project change:', { projectId, project })
      setSelectedProject(project)
      onProjectChange(projectId, project)
    } catch (error) {
      console.error('Error in handleProjectChange:', error)
      setSelectedProject(null)
      onProjectChange(projectId, null)
    }
  }

  const handleCustomerChange = (customerId: string) => {
    try {
      if (customerId) {
        // Ensure customers is an array before using find
        if (!Array.isArray(customers)) {
          console.warn('Customers is not an array:', customers)
          return
        }
        
        const customer = customers.find(c => c?.id === customerId)
        if (customer) {
          setCreateForm({
            ...createForm,
            customerId: customer.id,
            vesselName: customer.vesselName,
            customerCompany: customer.ownerCompany,
            customerContactPerson: customer.contactPerson,
            customerPhone: customer.phoneNumber,
            customerEmail: customer.email,
            customerAddress: customer.address
          })
        }
      } else {
        setCreateForm({
          ...createForm,
          customerId: '',
          vesselName: '',
          customerCompany: '',
          customerContactPerson: '',
          customerPhone: '',
          customerEmail: '',
          customerAddress: ''
        })
      }
    } catch (error) {
      console.error('Error in handleCustomerChange:', error)
    }
  }

  const performProjectCreation = async (skipValidation = false) => {
    try {
      // Client-side validation
      if (!createForm.projectName.trim() || !createForm.vesselName.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Project name and vessel name are required',
          status: 'error',
          duration: 3000
        })
        return
      }

      if (!skipValidation) {
        // Check for similar vessel names but allow flexibility
        // Ensure projects is an array before using filter
        if (!Array.isArray(projects)) {
          console.warn('Projects is not an array during validation:', projects)
        } else {
          const similarVesselProjects = projects.filter(p => 
            p?.vesselName?.toLowerCase().trim() === createForm.vesselName.toLowerCase().trim() &&
            p?.status !== 'COMPLETED'
          )
          
          // Only warn if there are active projects with same vessel name AND same customer
          const conflictingProject = Array.isArray(similarVesselProjects) 
            ? similarVesselProjects.find(p => 
                p?.customerCompany?.toLowerCase().trim() === createForm.customerCompany.toLowerCase().trim()
              )
            : null
          
          if (conflictingProject && similarVesselProjects.length > 0) {
            // Show confirmation modal instead of basic confirm
            setConflictingProject(conflictingProject)
            setPendingCreation(true)
            onConfirmOpen()
            return
          }
        }
      }

      const token = localStorage.getItem('auth_token')
      // For debugging: log token status
      console.log('Auth token status:', token ? 'present' : 'missing')

      console.log('Creating project with data:', createForm)
      
      // Prepare headers with optional auth
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers,
        body: JSON.stringify(createForm)
      })

      console.log('API Response status:', response.status)
      console.log('API Response headers:', response.headers)
      
      // Get response text first to handle both JSON and text responses
      const responseText = await response.text()
      console.log('API Response body:', responseText)
      
      if (response.ok) {
        let newProject
        try {
          newProject = JSON.parse(responseText)
        } catch (parseError) {
          console.error('Failed to parse success response:', parseError)
          throw new Error('Invalid response format from server')
        }
        
        toast({
          title: 'Success',
          description: 'Project created successfully',
          status: 'success',
          duration: 3000
        })
        
        // Close modal using enhanced handler
        handleCreateModalClose()
        
        // Refresh projects and auto-select new project
        await fetchProjects()
        setSelectedProject(newProject)
        onProjectChange(newProject.id, newProject)
      } else {
        let errorMessage = 'Failed to create project'
        
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.error || errorData.message || errorMessage
          
          // Handle specific error cases
          if (response.status === 409) {
            errorMessage = `Project already exists: ${errorMessage}`
          } else if (response.status === 400) {
            errorMessage = `Validation error: ${errorMessage}`
          } else if (response.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.'
          } else if (response.status === 500) {
            errorMessage = 'Server error. Please try again later.'
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          errorMessage = `HTTP ${response.status}: ${responseText || errorMessage}`
        }
        
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      console.error('Error creating project:', error)
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        status: 'error',
        duration: 5000
      })
    }
  }

  const createProject = async () => {
    // Reset confirmation state
    setPendingCreation(false)
    setConflictingProject(null)
    
    // Call the actual creation function
    await performProjectCreation()
  }
  
  const handleConfirmCreation = async () => {
    onConfirmClose()
    setPendingCreation(false)
    setConflictingProject(null)
    
    // Skip validation checks and create the project
    await performProjectCreation(true) // Pass true to skip conflict validation
  }
  
  // Callback untuk refresh projects dari ProjectManager
  const handleProjectsUpdated = () => {
    // Refresh project list
    fetchProjects()
    
    // If current project was deleted, clear selection
    if (selectedProjectId && Array.isArray(projects)) {
      const projectExists = projects.find(p => p?.id === selectedProjectId)
      if (!projectExists) {
        setSelectedProject(null)
        onProjectChange('', null)
      }
    }
    
    // Show success feedback (ProjectManager will handle its own toasts)
    // This is just to refresh the UI state
  }
  
  const handleCancelCreation = () => {
    setPendingCreation(false)
    setConflictingProject(null)
  }

  useEffect(() => {
    if (isClient) {
      fetchProjects()
    }
  }, [isClient])

  useEffect(() => {
    if (isCreateOpen && customers.length === 0) {
      fetchCustomers()
    }
  }, [isCreateOpen])

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'green'
      case 'PLANNING': return 'blue'
      case 'ON_HOLD': return 'yellow'
      case 'COMPLETED': return 'purple'
      case 'CANCELLED': return 'red'
      default: return 'gray'
    }
  }

  if (!isClient) {
    return (
      <VStack spacing={3} align="stretch">
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
            Current Project
          </Text>
          <HStack spacing={2}>
            <Select
              placeholder="🔄 Loading..."
              disabled
              flex={1}
              bg="gray.50"
            />
            {showCreateButton && (
              <IconButton
                icon={<FiPlus />}
                aria-label="Create project"
                colorScheme="blue"
                variant="outline"
                disabled
              />
            )}
          </HStack>
        </Box>
      </VStack>
    )
  }

  return (
    <VStack spacing={3} align="stretch">
      {/* Project Selection */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
          Current Project
        </Text>
        <HStack spacing={2}>
          <Select
            placeholder={loading ? "🔄 Loading projects..." : "📂 Select a project..."}
            value={isClient ? (selectedProjectId || '') : ''}
            onChange={(e) => handleProjectChange(e.target.value)}
            disabled={loading}
            flex={1}
            bg="white"
            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
            suppressHydrationWarning
          >
            {isClient && projects.map(project => {
              const hasWorkItems = project._count?.workItems && project._count.workItems > 0
              const canDelete = hasProjectPermission(user, 'delete')
              const canForceDelete = isAdmin(user) && hasWorkItems
              
              return (
                <option key={project.id} value={project.id}>
                  {project.projectName} 
                  ({project._count?.workItems || 0} tasks)
                  {project.status !== 'ACTIVE' ? ` - ${project.status}` : ''}
                </option>
              )
            })}
          </Select>
          
          {showCreateButton && isClient && (
            <Tooltip label="Create new project">
              <IconButton
                icon={<FiPlus />}
                aria-label="Create project"
                colorScheme="blue"
                variant="outline"
                onClick={onCreateOpen}
                suppressHydrationWarning
              />
            </Tooltip>
          )}
        </HStack>
      </Box>

      {/* Selected Project Info */}
      {showProjectInfo && selectedProject && (
        <Box p={4} bg="gradient(to-r, blue.50, blue.100)" borderRadius="lg" border="1px solid" borderColor="blue.200">
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={2}>
              <HStack spacing={3}>
                <Text fontSize="lg" fontWeight="bold" color="blue.900">
                  {selectedProject.projectName}
                </Text>
                <Badge colorScheme={getStatusColor(selectedProject.status)} size="md" px={3} py={1}>
                  {selectedProject.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </HStack>
              
              <HStack spacing={6} flexWrap="wrap">
                {selectedProject.vesselName && (
                  <HStack spacing={1}>
                    <Text fontSize="xs" color="blue.500" fontWeight="medium">VESSEL:</Text>
                    <Text fontSize="sm" color="blue.700" fontWeight="semibold">
                      {selectedProject.vesselName}
                    </Text>
                  </HStack>
                )}
                {selectedProject.customerCompany && (
                  <HStack spacing={1}>
                    <Text fontSize="xs" color="blue.500" fontWeight="medium">CUSTOMER:</Text>
                    <Text fontSize="sm" color="blue.700" fontWeight="semibold">
                      {selectedProject.customerCompany}
                    </Text>
                  </HStack>
                )}
                {selectedProject.vesselSpecs && (selectedProject.vesselSpecs as any)?.customerContactPerson && (
                  <HStack spacing={1}>
                    <Text fontSize="xs" color="blue.500" fontWeight="medium">CONTACT:</Text>
                    <Text fontSize="sm" color="blue.700" fontWeight="semibold">
                      {(selectedProject.vesselSpecs as any).customerContactPerson}
                    </Text>
                  </HStack>
                )}
                <HStack spacing={1}>
                  <Text fontSize="xs" color="blue.500" fontWeight="medium">TASKS:</Text>
                  <Text fontSize="sm" color="blue.700" fontWeight="bold">
                    {selectedProject._count?.workItems || 0}
                  </Text>
                </HStack>
                <HStack spacing={1}>
                  <Text fontSize="xs" color="blue.500" fontWeight="medium">CREATED:</Text>
                  <Text fontSize="sm" color="blue.700" suppressHydrationWarning>
                    {isClient ? new Date(selectedProject.createdAt).toLocaleDateString() : 'Loading...'}
                  </Text>
                </HStack>
                {/* Admin indicator */}
                {isAdmin(user) && (
                  <HStack spacing={1}>
                    <Text fontSize="xs" color="orange.500" fontWeight="medium">ACCESS:</Text>
                    <Badge colorScheme="orange" size="sm" px={2}>
                      ADMIN
                    </Badge>
                  </HStack>
                )}
              </HStack>
            </VStack>
            
            {isClient && (
              <HStack spacing={1}>
                {/* Project Management untuk Admin/Manager */}
                {hasProjectPermission(user, 'delete') && (
                  <Tooltip label="Manage Projects">
                    <div>
                      <ProjectManager 
                        currentProjectId={selectedProjectId}
                        onProjectUpdated={handleProjectsUpdated}
                      />
                    </div>
                  </Tooltip>
                )}
                
                {/* Settings button */}
                <Tooltip label="Project settings">
                  <IconButton
                    icon={<FiSettings />}
                    aria-label="Project settings"
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    _hover={{ bg: 'blue.200' }}
                    suppressHydrationWarning
                  />
                </Tooltip>
              </HStack>
            )}
          </HStack>
        </Box>
      )}

      {/* Create Project Modal */}
      <Modal 
        isOpen={isCreateOpen} 
        onClose={handleCreateModalClose}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box w="full">
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Project Name *
                </Text>
                <Input
                  value={createForm.projectName}
                  onChange={(e) => setCreateForm({ ...createForm, projectName: e.target.value })}
                  placeholder="Enter project name..."
                />
              </Box>
              
              <Box w="full">
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Select Customer
                </Text>
                <Select
                  placeholder={loadingCustomers ? "Loading customers..." : "Select a customer..."}
                  value={createForm.customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  disabled={loadingCustomers}
                >
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.vesselName} - {customer.ownerCompany}
                    </option>
                  ))}
                </Select>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Select a customer to auto-fill vessel and company information
                </Text>
              </Box>
              
              <Box w="full">
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Vessel Name *
                </Text>
                <Input
                  value={createForm.vesselName}
                  onChange={(e) => setCreateForm({ ...createForm, vesselName: e.target.value })}
                  placeholder="Enter vessel name..."
                />
              </Box>
              
              <Box w="full">
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Customer Company
                </Text>
                <Input
                  value={createForm.customerCompany}
                  onChange={(e) => setCreateForm({ ...createForm, customerCompany: e.target.value })}
                  placeholder="Enter customer company..."
                />
              </Box>
              
              <Box w="full">
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Status
                </Text>
                <Select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                </Select>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCreateModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={createProject}>
              Create Project
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmation Modal for Duplicate Vessels */}
      <Modal 
        isOpen={isConfirmOpen} 
        onClose={handleCancelCreation}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Project Creation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box p={4} bg="yellow.50" borderRadius="md" borderLeft="4px solid" borderColor="yellow.400">
                <Text fontSize="sm" color="yellow.800" fontWeight="medium">
                  ⚠️ Similar Project Detected
                </Text>
              </Box>
              
              <Text fontSize="sm" color="gray.700">
                A project already exists for vessel <strong>"{createForm.vesselName}"</strong> with the same customer:
              </Text>
              
              {conflictingProject && (
                <Box p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                    Existing Project:
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {conflictingProject.projectName}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Customer: {conflictingProject.customerCompany || 'Not specified'}
                  </Text>
                </Box>
              )}
              
              <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontSize="sm" fontWeight="semibold" color="blue.800">
                  New Project:
                </Text>
                <Text fontSize="sm" color="blue.600">
                  {createForm.projectName}
                </Text>
                <Text fontSize="xs" color="blue.500" mt={1}>
                  Customer: {createForm.customerCompany || 'Not specified'}
                </Text>
              </Box>
              
              <Text fontSize="sm" color="gray.600">
                This might be for a different time period, additional work, or different scope. 
                Do you want to continue creating this project?
              </Text>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCancelCreation}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleConfirmCreation}>
              Yes, Create Project
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}

export default ProjectSelector