'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  Input,
  Select,
  Flex,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Switch,
  Textarea,
  NumberInput,
  NumberInputField,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useToast,
  Spinner,
  Progress,
} from '@chakra-ui/react'
import {
  FiPlus,
  FiUpload,
  FiFileText,
  FiDownload,
  FiChevronDown,
  FiChevronRight,
  FiEdit,
  FiTrash2,
  FiEye,
  FiCopy,
  FiSave,
} from 'react-icons/fi'
import React, { useState, useEffect, Fragment } from 'react'
import ClientOnlyLayout from '@/components/Layout/ClientOnlyLayout'
import ProjectSelector from '@/components/Project/ProjectSelector'
import TemplateGenerator from '@/components/Project/TemplateGenerator'
import ProjectManager from '@/components/Project/ProjectManager'
import NoSSR from '@/components/NoSSR'

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
  dependsOnIds?: string[]
  children?: WorkItem[]
  parent?: WorkItem
  createdAt?: string
  updatedAt?: string
  projectId?: string
  templateId?: string
}

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

const WorkPlanTable = ({ workItems, onUpdate }: { workItems: WorkItem[], onUpdate: () => void }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [editingCell, setEditingCell] = useState<{ id: string, field: string } | null>(null)
  const [editValue, setEditValue] = useState('')

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const startEdit = (id: string, field: string, currentValue: any) => {
    setEditingCell({ id, field })
    setEditValue(String(currentValue || ''))
  }

  const saveEdit = async () => {
    if (!editingCell) return
    
    try {
      const response = await fetch(`/api/work-items/${editingCell.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          [editingCell.field]: editingCell.field === 'completion' ? parseInt(editValue) : editValue
        })
      })

      if (response.ok) {
        setEditingCell(null)
        setEditValue('')
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating work item:', error)
    }
  }

  const renderWorkItem = (item: WorkItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedRows.has(item.id)
    const paddingLeft = level * 30

    return (
      <Fragment key={item.id}>
        <Tr>
          <Td style={{ paddingLeft: `${paddingLeft + 16}px` }}>
            {hasChildren && (
              <IconButton
                size="xs"
                variant="ghost"
                icon={isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                onClick={() => toggleExpanded(item.id)}
                mr={2}
                suppressHydrationWarning
              />
            )}
            {item.id}
          </Td>
          <Td>{item.package || 'Pelayanan Umum'}</Td>
          <Td>
            {editingCell?.id === item.id && editingCell?.field === 'title' ? (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                size="sm"
                autoFocus
                suppressHydrationWarning
              />
            ) : (
              <Text
                onClick={() => startEdit(item.id, 'title', item.title)}
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                p={1}
                borderRadius="md"
              >
                {item.title}
              </Text>
            )}
          </Td>
          <Td>
            {editingCell?.id === item.id && editingCell?.field === 'durationDays' ? (
              <NumberInput size="sm" value={editValue} onChange={(value) => setEditValue(value)}>
                <NumberInputField
                  onBlur={saveEdit}
                  onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                  autoFocus
                  suppressHydrationWarning
                />
              </NumberInput>
            ) : (
              <Text
                onClick={() => startEdit(item.id, 'durationDays', item.durationDays)}
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                p={1}
                borderRadius="md"
              >
                {item.durationDays || 1}
              </Text>
            )}
          </Td>
          <Td>
            {editingCell?.id === item.id && editingCell?.field === 'startDate' ? (
              <Input
                type="date"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                size="sm"
                autoFocus
                suppressHydrationWarning
              />
            ) : (
              <Text
                onClick={() => startEdit(item.id, 'startDate', item.startDate)}
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                p={1}
                borderRadius="md"
              >
                {item.startDate || 'mm/dd/yyyy'}
              </Text>
            )}
          </Td>
          <Td>
            {editingCell?.id === item.id && editingCell?.field === 'finishDate' ? (
              <Input
                type="date"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                size="sm"
                autoFocus
                suppressHydrationWarning
              />
            ) : (
              <Text
                onClick={() => startEdit(item.id, 'finishDate', item.finishDate)}
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                p={1}
                borderRadius="md"
              >
                {item.finishDate || 'mm/dd/yyyy'}
              </Text>
            )}
          </Td>
          <Td>
            {editingCell?.id === item.id && editingCell?.field === 'completion' ? (
              <NumberInput 
                size="sm" 
                value={editValue} 
                onChange={(value) => setEditValue(value)}
                min={0}
                max={100}
              >
                <NumberInputField
                  onBlur={saveEdit}
                  onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                  autoFocus
                  suppressHydrationWarning
                />
              </NumberInput>
            ) : (
              <Box
                onClick={() => startEdit(item.id, 'completion', item.completion)}
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                p={1}
                borderRadius="md"
              >
                <Text fontSize="sm" mb={1}>{item.completion}%</Text>
                <Progress 
                  value={item.completion} 
                  colorScheme={item.completion === 100 ? 'green' : 'blue'} 
                  size="sm" 
                />
              </Box>
            )}
          </Td>
          <Td>
            {editingCell?.id === item.id && editingCell?.field === 'resourceNames' ? (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                size="sm"
                autoFocus
                suppressHydrationWarning
              />
            ) : (
              <Text
                onClick={() => startEdit(item.id, 'resourceNames', item.resourceNames)}
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                p={1}
                borderRadius="md"
              >
                {item.resourceNames || 'test'}
              </Text>
            )}
          </Td>
          <Td>
            <Switch
              isChecked={item.isMilestone}
              onChange={async (e) => {
                try {
                  await fetch(`/api/work-items/${item.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    },
                    body: JSON.stringify({ isMilestone: e.target.checked })
                  })
                  onUpdate()
                } catch (error) {
                  console.error('Error updating milestone:', error)
                }
              }}
              suppressHydrationWarning
            />
          </Td>
          <Td>
            <Textarea
              size="sm"
              placeholder="Notes..."
              rows={1}
              resize="none"
              suppressHydrationWarning
            />
          </Td>
          <Td>
            <Text fontSize="sm" color="gray.600">
              {item.dependsOnIds?.join(', ') || 'T-001, T-002'}
            </Text>
          </Td>
          <Td>
            {(() => {
              // Use deterministic logic based on item.id to avoid hydration mismatch
              const isConflict = item.id.length % 3 === 0 || item.completion < 50
              return (
                <Badge colorScheme={isConflict ? 'red' : 'green'} size="sm">
                  {isConflict ? 'Hapus' : 'OK'}
                </Badge>
              )
            })()}
          </Td>
          <Td>
            <HStack spacing={1}>
              <IconButton
                size="sm"
                variant="ghost"
                icon={<FiEye />}
                colorScheme="blue"
                aria-label="View"
                suppressHydrationWarning
              />
              <IconButton
                size="sm"
                variant="ghost"
                icon={<FiEdit />}
                colorScheme="green"
                aria-label="Edit"
                suppressHydrationWarning
              />
              <IconButton
                size="sm"
                variant="ghost"
                icon={<FiCopy />}
                colorScheme="purple"
                aria-label="Sub"
                suppressHydrationWarning
              />
              <IconButton
                size="sm"
                variant="ghost"
                icon={<FiTrash2 />}
                colorScheme="red"
                aria-label="Delete"
                suppressHydrationWarning
              />
            </HStack>
          </Td>
        </Tr>
        {hasChildren && isExpanded && item.children?.map(child => renderWorkItem(child, level + 1))}
      </Fragment>
    )
  }

  return (
    <TableContainer>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr bg="gray.50">
            <Th>ID</Th>
            <Th>PACKAGE</Th>
            <Th>TASK NAME</Th>
            <Th>DURATION (DAYS)</Th>
            <Th>START</Th>
            <Th>FINISH</Th>
            <Th>% COMPLETE</Th>
            <Th>RESOURCE NAMES</Th>
            <Th>MILESTONE</Th>
            <Th>NOTES</Th>
            <Th>DEPENDS ON</Th>
            <Th>CONFLICTS</Th>
            <Th>ACTIONS</Th>
          </Tr>
        </Thead>
        <Tbody>
          {workItems.filter(item => !item.parentId).map(item => renderWorkItem(item))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export default function WorkPlanReportPage() {
  return (
    <NoSSR 
      fallback={
        <div>
          <Box h="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
            <Text>Loading...</Text>
          </Box>
        </div>
      }
    >
      <WorkPlanReportContent />
    </NoSSR>
  )
}

function WorkPlanReportContent() {
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [packageFilter, setPackageFilter] = useState('')
  const [resourceFilter, setResourceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const toast = useToast()

  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Work Plan & Report' }
  ]

  const fetchWorkItems = async () => {
    try {
      setLoading(true)
      
      // Don't fetch if no project selected
      if (!selectedProjectId) {
        setWorkItems([])
        setLoading(false)
        return
      }
      
      const token = localStorage.getItem('auth_token')
      
      // Build query parameters for server-side filtering
      const queryParams = new URLSearchParams()
      if (searchTerm) queryParams.append('search', searchTerm)
      if (packageFilter) queryParams.append('package', packageFilter)
      if (statusFilter) queryParams.append('status', statusFilter)
      
      const url = `/api/projects/${selectedProjectId}/work-items${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Handle both formats: direct array or object with workItems property
        setWorkItems(data.workItems || data)
      } else {
        throw new Error('Failed to fetch work items')
      }
    } catch (error) {
      console.error('Error fetching work items:', error)
      toast({
        title: 'Error',
        description: 'Failed to load work items',
        status: 'error',
        duration: 3000
      })
    } finally {
      setLoading(false)
    }
  }


  const handleProjectChange = (projectId: string, project: Project | null) => {
    setSelectedProjectId(projectId)
    setSelectedProject(project)
  }

  // Debounce function for search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchWorkItems()
    }, searchTerm ? 500 : 0) // 500ms delay for search, immediate for other filters

    return () => clearTimeout(timeoutId)
  }, [selectedProjectId, searchTerm, packageFilter, statusFilter])

  const exportToPDF = async (format: 'pdf' | 'word' = 'pdf') => {
    try {
      if (!selectedProjectId || !selectedProject) {
        toast({
          title: 'Error',
          description: 'Please select a project first',
          status: 'error',
          duration: 3000
        })
        return
      }

      if (workItems.length === 0) {
        toast({
          title: 'Error',
          description: 'No work items found for this project',
          status: 'error',
          duration: 3000
        })
        return
      }

      const formatText = format === 'pdf' ? 'PDF' : 'Word'
      toast({
        title: `Generating ${formatText} Report...`,
        description: `Generating ${formatText.toLowerCase()} report for ${selectedProject?.projectName || 'selected project'}`,
        status: 'info',
        duration: 2000
      })

      const response = await fetch(`/api/reports/work-plan?format=${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          projectId: selectedProjectId,
          projectName: selectedProject?.projectName || 'Unknown Project',
          generateForProject: selectedProjectId // Add this for backend compatibility
        })
      })

      console.log('API Response status:', response.status)
      console.log('API Response headers:', response.headers)
      
      if (response.ok) {
        const blob = await response.blob()
        console.log('Blob size:', blob.size, 'bytes')
        console.log('Blob type:', blob.type)
        
        if (blob.size === 0) {
          throw new Error('Generated report is empty')
        }
        
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const projectName = selectedProject?.projectName?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Project'
        const fileExtension = format === 'pdf' ? 'pdf' : 'docx'
        a.download = `Docking_Report_${projectName}_${new Date().toISOString().split('T')[0]}.${fileExtension}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: 'Docking Report Generated',
          description: `Report for ${selectedProject?.projectName} generated successfully`,
          status: 'success',
          duration: 4000
        })
      } else {
        const errorText = await response.text()
        console.error('API Error response:', errorText)
        throw new Error(`Failed to generate report: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error(`Error generating ${format} report:`, error)
      toast({
        title: 'Error',
        description: `Failed to generate ${format === 'pdf' ? 'PDF' : 'Word'} report. Please try again.`,
        status: 'error',
        duration: 3000
      })
    }
  }


  const exportToCSV = () => {
    const csvData = workItems.map(item => ({
      ID: item.id,
      Package: item.package || 'Pelayanan Umum',
      'Task Name': item.title,
      'Duration (Days)': item.durationDays || 1,
      Start: item.startDate || '',
      Finish: item.finishDate || '',
      'Progress %': item.completion,
      'Resource Names': item.resourceNames,
      Milestone: item.isMilestone ? 'Yes' : 'No'
    }))

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const projectName = selectedProject?.projectName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Project'
    a.download = `work-plan-report_${projectName}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Success',
      description: `CSV exported successfully for ${selectedProject?.projectName}`,
      status: 'success',
      duration: 3000
    })
  }

  // Server-side filtering is now handled in fetchWorkItems
  // Only client-side filter for resourceFilter since it's not in the API yet
  const filteredItems = workItems.filter(item => {
    const matchesResource = !resourceFilter || item.resourceNames.toLowerCase().includes(resourceFilter.toLowerCase())
    return matchesResource
  })

  const totalTasks = workItems.length
  const avgComplete = Math.round(workItems.reduce((sum, item) => sum + item.completion, 0) / totalTasks) || 0
  const milestones = workItems.filter(item => item.isMilestone).length
  // Use deterministic calculation for conflicts to avoid hydration mismatch  
  const conflicts = workItems.filter(item => item.completion < 50).length

  return (
    <ClientOnlyLayout currentModule="work-plan-report" breadcrumbs={breadcrumbs}>
      <Container maxW="full" py={6}>
        <VStack spacing={6} align="stretch">
          {/* Project Selection */}
          <Card>
            <CardBody>
              <ProjectSelector 
                selectedProjectId={selectedProjectId}
                onProjectChange={handleProjectChange}
                showCreateButton={true}
                showProjectInfo={true}
              />
            </CardBody>
          </Card>

          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={2}>
            <VStack align="start" spacing={1}>
              <Heading size="xl" color="gray.800">Work Plan & Report</Heading>
              {selectedProject ? (
                <HStack spacing={2}>
                  <Text color="gray.600" fontSize="md">
                    Managing work items for
                  </Text>
                  <Text color="blue.600" fontSize="md" fontWeight="semibold">
                    {selectedProject.projectName}
                  </Text>
                </HStack>
              ) : (
                <Text color="gray.500" fontSize="md">
                  Select or create a project to get started
                </Text>
              )}
            </VStack>
            <HStack spacing={3} wrap="wrap" justify="space-between">
              {/* Project Management Actions */}
              <HStack spacing={2}>
                <ProjectManager 
                  currentProjectId={selectedProjectId}
                  onProjectUpdated={() => {
                    // Refresh project selector and work items
                    handleProjectChange(selectedProjectId, selectedProject)
                  }}
                />
                {selectedProjectId && (
                  <TemplateGenerator 
                    projectId={selectedProjectId}
                    onWorkItemsGenerated={fetchWorkItems}
                  />
                )}
                {selectedProjectId && (
                  <Button 
                    leftIcon={<FiPlus />} 
                    colorScheme="blue" 
                    size="sm" 
                    suppressHydrationWarning
                    onClick={() => {
                      // Add manual work item functionality here later
                    }}
                  >
                    Add Work Item
                  </Button>
                )}
              </HStack>

              {/* Export Actions */}
              <HStack spacing={2}>
                {/* Export Report Button */}
                <Button 
                  leftIcon={<FiFileText />} 
                  colorScheme="purple" 
                  size="sm" 
                  disabled={!selectedProjectId || workItems.length === 0}
                  onClick={() => exportToPDF('pdf')}
                  suppressHydrationWarning
                >
                  Export Report
                </Button>
                <Button 
                  leftIcon={<FiDownload />} 
                  colorScheme="green" 
                  size="sm" 
                  onClick={exportToCSV} 
                  disabled={!selectedProjectId || workItems.length === 0}
                  suppressHydrationWarning
                >
                  Export CSV
                </Button>
              </HStack>
            </HStack>
          </Flex>

          {/* Work Items Table Tab */}
          <Card>
            <CardBody>
              <Text fontWeight="semibold" mb={4} color="blue.600">Work Items Table</Text>
              
              {/* Search & Filters */}
              <Box mb={6}>
                <HStack spacing={4} mb={3} wrap="wrap">
                  <Input
                    placeholder="🔍 Search work items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    maxW="350px"
                    disabled={loading}
                    suppressHydrationWarning
                    bg="white"
                    _placeholder={{ color: 'gray.400' }}
                  />
                  
                  <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Filters:</Text>
                    <Select
                      placeholder="All Packages"
                      value={packageFilter}
                      onChange={(e) => setPackageFilter(e.target.value)}
                      maxW="160px"
                      disabled={loading}
                      size="sm"
                      suppressHydrationWarning
                      bg="white"
                    >
                      <option value="A">Package A</option>
                      <option value="B">Package B</option>
                      <option value="C">Package C</option>
                    </Select>
                    
                    <Select 
                      placeholder="All Status" 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      maxW="160px" 
                      disabled={loading}
                      size="sm"
                      suppressHydrationWarning
                      bg="white"
                    >
                      <option value="PLANNED">Planned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="ON_HOLD">On Hold</option>
                    </Select>
                  </HStack>
                  
                  {/* Clear Filters Button */}
                  {(searchTerm || packageFilter || statusFilter) && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setSearchTerm('')
                        setPackageFilter('')
                        setStatusFilter('')
                      }}
                      color="gray.500"
                    >
                      Clear Filters
                    </Button>
                  )}
                </HStack>
              </Box>

              {/* Statistics */}
              {workItems.length > 0 && (
                <Box mb={6} p={4} bg="gradient(to-r, gray.50, gray.100)" borderRadius="xl" border="1px solid" borderColor="gray.200">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
                    Project Statistics
                  </Text>
                  <HStack spacing={8} wrap="wrap">
                    <VStack spacing={1} align="start">
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">{totalTasks}</Text>
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">TOTAL TASKS</Text>
                    </VStack>
                    <VStack spacing={1} align="start">
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">{avgComplete}%</Text>
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">AVG COMPLETE</Text>
                    </VStack>
                    <VStack spacing={1} align="start">
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">{milestones}</Text>
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">MILESTONES</Text>
                    </VStack>
                    <VStack spacing={1} align="start">
                      <Text fontSize="2xl" fontWeight="bold" color={conflicts > 0 ? "red.600" : "green.600"}>
                        {conflicts}
                      </Text>
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">CONFLICTS</Text>
                    </VStack>
                  </HStack>
                </Box>
              )}

              {loading ? (
                <Flex justify="center" py={10}>
                  <Spinner size="xl" color="blue.500" />
                </Flex>
              ) : !selectedProjectId ? (
                <Box textAlign="center" py={16}>
                  <Box mb={6}>
                    <Text fontSize="2xl" color="gray.400" mb={2}>📋</Text>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.600" mb={2}>
                      Welcome to Work Plan & Report
                    </Text>
                    <Text fontSize="sm" color="gray.500" maxW="md" mx="auto">
                      Select or create a project from the dropdown above to start managing work items, 
                      generate reports, and track project progress.
                    </Text>
                  </Box>
                </Box>
              ) : workItems.length === 0 ? (
                <Box textAlign="center" py={16}>
                  <Box mb={6}>
                    <Text fontSize="2xl" color="blue.400" mb={2}>🚀</Text>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.600" mb={2}>
                      Ready to Start!
                    </Text>
                    <Text fontSize="sm" color="gray.500" maxW="md" mx="auto" mb={4}>
                      Project "{selectedProject?.projectName}" is ready. Generate work items from templates 
                      or add them manually to begin tracking progress.
                    </Text>
                    <HStack justify="center" spacing={3} mt={6}>
                      <TemplateGenerator 
                        projectId={selectedProjectId}
                        onWorkItemsGenerated={fetchWorkItems}
                      />
                      <Button 
                        leftIcon={<FiPlus />} 
                        colorScheme="blue" 
                        size="sm" 
                        variant="outline"
                      >
                        Add Manual Item
                      </Button>
                    </HStack>
                  </Box>
                </Box>
              ) : (
                <WorkPlanTable workItems={filteredItems} onUpdate={fetchWorkItems} />
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </ClientOnlyLayout>
  )
}