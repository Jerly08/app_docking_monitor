'use client'

import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Textarea,
  Select,
  useToast,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react'
import { FiSettings, FiEdit, FiTrash2, FiEye, FiBarChart } from 'react-icons/fi'
import React, { useState, useEffect, useRef } from 'react'
import { useModalState } from '@/hooks/useModalState'

interface Project {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
  _count?: {
    workItems: number
  }
}

interface ProjectManagerProps {
  currentProjectId?: string
  onProjectUpdated: () => void
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  currentProjectId,
  onProjectUpdated
}) => {
  // Main modal dengan failsafe closing mechanism
  const { isOpen, onOpen, onClose } = useModalState()
  
  // Edit modal dengan failsafe closing mechanism
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useModalState()
  
  // Delete confirmation dengan failsafe closing mechanism
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useModalState()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [projectStats, setProjectStats] = useState<any>(null)
  
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    status: 'planning'
  })

  const cancelRef = useRef<HTMLButtonElement>(null)
  const toast = useToast()

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

  const fetchProjectStats = async (projectId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProjectStats(data)
      }
    } catch (error) {
      console.error('Error fetching project stats:', error)
    }
  }

  const handleEdit = (project: Project) => {
    setSelectedProject(project)
    setEditForm({
      name: project.name,
      description: project.description || '',
      status: project.status
    })
    onEditOpen()
  }

  const handleDelete = (project: Project) => {
    setProjectToDelete(project)
    onDeleteOpen()
  }

  const updateProject = async () => {
    try {
      if (!selectedProject) return

      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Project updated successfully',
          status: 'success',
          duration: 3000
        })
        onEditClose()
        fetchProjects()
        onProjectUpdated()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update project')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project',
        status: 'error',
        duration: 3000
      })
    }
  }

  const deleteProject = async () => {
    try {
      if (!projectToDelete) return

      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Project deleted successfully',
          status: 'success',
          duration: 3000
        })
        onDeleteClose()
        setProjectToDelete(null)
        fetchProjects()
        onProjectUpdated()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete project')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete project',
        status: 'error',
        duration: 3000
      })
    }
  }

  const handleViewStats = (project: Project) => {
    try {
      setSelectedProject(project)
      fetchProjectStats(project.id)
      onOpen()
    } catch (error) {
      console.error('Error opening project stats:', error)
      toast({
        title: 'Error',
        description: 'Failed to open project statistics',
        status: 'error',
        duration: 3000
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchProjects()
    }
  }, [isOpen])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green'
      case 'planning': return 'blue'
      case 'on_hold': return 'yellow'
      case 'completed': return 'purple'
      case 'cancelled': return 'red'
      default: return 'gray'
    }
  }

  return (
    <>
      <Button
        leftIcon={<FiSettings />}
        variant="outline"
        size="sm"
        onClick={onOpen}
      >
        Manage Projects
      </Button>

      {/* Main Project Manager Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>Project Management</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody overflow="auto">
            {loading ? (
              <Flex justify="center" py={8}>
                <Spinner size="lg" />
              </Flex>
            ) : (
              <VStack spacing={6} align="stretch">
                {/* Project Statistics */}
                {selectedProject && projectStats && (
                  <Box p={4} bg="blue.50" borderRadius="md">
                    <Text fontWeight="bold" mb={4} color="blue.800">
                      Project Statistics: {selectedProject.name}
                    </Text>
                    <HStack spacing={8}>
                      <Stat>
                        <StatLabel>Total Work Items</StatLabel>
                        <StatNumber>{projectStats._count?.workItems || 0}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Avg Completion</StatLabel>
                        <StatNumber>{projectStats.avgCompletion?.toFixed(1) || 0}%</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Milestones</StatLabel>
                        <StatNumber>{projectStats.milestoneCount || 0}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Status</StatLabel>
                        <StatNumber>
                          <Badge colorScheme={getStatusColor(projectStats.status)}>
                            {projectStats.status.toUpperCase()}
                          </Badge>
                        </StatNumber>
                      </Stat>
                    </HStack>
                  </Box>
                )}

                {/* Projects Table */}
                <TableContainer>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Project Name</Th>
                        <Th>Description</Th>
                        <Th>Status</Th>
                        <Th>Work Items</Th>
                        <Th>Created</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {projects.map(project => (
                        <Tr key={project.id} bg={project.id === currentProjectId ? 'blue.50' : undefined}>
                          <Td fontWeight={project.id === currentProjectId ? 'bold' : 'normal'}>
                            {project.name}
                            {project.id === currentProjectId && (
                              <Badge ml={2} size="sm" colorScheme="blue">
                                Current
                              </Badge>
                            )}
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                              {project.description || 'No description'}
                            </Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(project.status)} size="sm">
                              {project.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </Td>
                          <Td>{project._count?.workItems || 0}</Td>
                          <Td>
                            <Text fontSize="sm">
                              {new Date(project.createdAt).toLocaleDateString()}
                            </Text>
                          </Td>
                          <Td>
                            <HStack spacing={1}>
                              <IconButton
                                icon={<FiBarChart />}
                                size="xs"
                                variant="ghost"
                                colorScheme="blue"
                                aria-label="View Stats"
                                onClick={() => handleViewStats(project)}
                              />
                              <IconButton
                                icon={<FiEdit />}
                                size="xs"
                                variant="ghost"
                                colorScheme="green"
                                aria-label="Edit"
                                onClick={() => handleEdit(project)}
                              />
                              <IconButton
                                icon={<FiTrash2 />}
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                aria-label="Delete"
                                onClick={() => handleDelete(project)}
                                disabled={project._count?.workItems && project._count.workItems > 0}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>

                {projects.length === 0 && (
                  <Alert status="info">
                    <AlertIcon />
                    No projects found. Create your first project to get started.
                  </Alert>
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box w="full">
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Project Name *
                </Text>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter project name..."
                />
              </Box>
              
              <Box w="full">
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Description
                </Text>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Enter project description..."
                  rows={3}
                />
              </Box>
              
              <Box w="full">
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Status
                </Text>
                <Select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={updateProject}>
              Update Project
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Project
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the project "{projectToDelete?.name}"?
              {projectToDelete?._count?.workItems && projectToDelete._count.workItems > 0 ? (
                <Alert status="error" mt={4}>
                  <AlertIcon />
                  This project has {projectToDelete._count.workItems} work items. 
                  Please remove all work items first before deleting the project.
                </Alert>
              ) : (
                <Text mt={2} color="red.600">
                  This action cannot be undone.
                </Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={deleteProject} 
                ml={3}
                disabled={projectToDelete?._count?.workItems && projectToDelete._count.workItems > 0}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default ProjectManager