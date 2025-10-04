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
import { FiPlus, FiSettings, FiInfo } from 'react-icons/fi'
import React, { useState, useEffect } from 'react'
import { useClientOnly } from '@/hooks/useClientOnly'
import { useModalState } from '@/hooks/useModalState'

interface Project {
  id: string
  projectName: string
  vesselName?: string
  customerCompany?: string
  status: string
  createdAt: string
  _count?: {
    workItems: number
  }
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
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const isClient = useClientOnly()
  
  // Create Project Modal dengan failsafe closing
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useModalState()
  const [createForm, setCreateForm] = useState({
    projectName: '',
    vesselName: '',
    customerCompany: '',
    status: 'ACTIVE'
  })
  
  const toast = useToast()

  // Simple close handler untuk create modal
  const handleCreateModalClose = () => {
    setCreateForm({ 
      projectName: '', 
      vesselName: '', 
      customerCompany: '', 
      status: 'ACTIVE' 
    })
    onCreateClose()
  }

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || data)
        
        // Auto-select first project if none selected
        if (!selectedProjectId && data.length > 0) {
          const firstProject = data[0]
          setSelectedProject(firstProject)
          onProjectChange(firstProject.id, firstProject)
        } else if (selectedProjectId) {
          // Find and set the selected project
          const project = data.find((p: Project) => p.id === selectedProjectId)
          setSelectedProject(project || null)
        }
      } else {
        throw new Error('Failed to fetch projects')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        status: 'error',
        duration: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId) || null
    setSelectedProject(project)
    onProjectChange(projectId, project)
  }

  const createProject = async () => {
    try {
      if (!createForm.projectName.trim() || !createForm.vesselName.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Project name and vessel name are required',
          status: 'error',
          duration: 3000
        })
        return
      }

      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createForm)
      })

      if (response.ok) {
        const newProject = await response.json()
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
        const error = await response.json()
        throw new Error(error.message || 'Failed to create project')
      }
    } catch (error: any) {
      console.error('Error creating project:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        status: 'error',
        duration: 3000
      })
    }
  }

  useEffect(() => {
    if (isClient) {
      fetchProjects()
    }
  }, [isClient])

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
            {isClient && projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.projectName} ({project._count?.workItems || 0} tasks)
              </option>
            ))}
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
              </HStack>
            </VStack>
            
            {isClient && (
              <IconButton
                icon={<FiSettings />}
                aria-label="Project settings"
                size="sm"
                variant="ghost"
                colorScheme="blue"
                _hover={{ bg: 'blue.200' }}
                suppressHydrationWarning
              />
            )}
          </HStack>
        </Box>
      )}

      {/* Create Project Modal */}
      <Modal 
        isOpen={isCreateOpen} 
        onClose={handleCreateModalClose}
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
    </VStack>
  )
}

export default ProjectSelector