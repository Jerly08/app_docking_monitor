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
  FiCamera,
} from 'react-icons/fi'
import React, { useState, useEffect, Fragment } from 'react'
import ClientOnlyLayout from '@/components/Layout/ClientOnlyLayout'
import ProjectSelector from '@/components/Project/ProjectSelector'
import TemplateGenerator from '@/components/Project/TemplateGenerator'
import ProjectManager from '@/components/Project/ProjectManager'
import AddWorkItemModal from '@/components/WorkItem/AddWorkItemModal'
import AddChildWorkItemModal from '@/components/WorkItem/AddChildWorkItemModal'
import ViewTaskModal from '@/components/WorkItem/ViewTaskModal'
import IdDisplay from '@/components/WorkItem/IdDisplay'
import ExcelImportModal from '@/components/WorkItem/ExcelImportModal'
import CompletionRecalculator from '@/components/WorkItem/CompletionRecalculator'
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

const WorkPlanTable = ({ workItems, onUpdate, onDelete, onAddChild, onViewTask, projectId, expandedRows, setExpandedRows }: { workItems: WorkItem[], onUpdate: () => void, onDelete: (id: string) => void, onAddChild: (item: WorkItem) => void, onViewTask: (item: WorkItem) => void, projectId: string, expandedRows?: Set<string>, setExpandedRows?: (rows: Set<string>) => void }) => {
  const [localExpandedRows, setLocalExpandedRows] = useState<Set<string>>(new Set())
  
  // Use provided expandedRows or fall back to local state
  const currentExpandedRows = expandedRows || localExpandedRows
  const setCurrentExpandedRows = setExpandedRows || setLocalExpandedRows
  const [editingCell, setEditingCell] = useState<{ id: string, field: string } | null>(null)
  const [editValue, setEditValue] = useState('')

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(currentExpandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setCurrentExpandedRows(newExpanded)
  }

  const startEdit = (id: string, field: string, currentValue: any) => {
    setEditingCell({ id, field })
    setEditValue(String(currentValue || ''))
  }

  const saveEdit = async () => {
    if (!editingCell) return
    
    try {
      // Encode the work item ID to handle IDs with forward slashes
      const encodedId = encodeURIComponent(editingCell.id)
      
      // Prepare the update data with proper type conversion
      let updateValue: any = editValue
      if (editingCell.field === 'completion') {
        updateValue = parseInt(editValue) || 0
      } else if (editingCell.field === 'durationDays') {
        updateValue = parseInt(editValue) || 1
      }
      
      const updateData = {
        [editingCell.field]: updateValue
      }
      
      console.log('Updating work item:', editingCell.id, 'Field:', editingCell.field, 'Value:', updateValue)
      
      const response = await fetch(`/api/work-items/${encodedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        setEditingCell(null)
        setEditValue('')
        onUpdate()
      } else {
        // Get the error response body for debugging
        const errorData = await response.text()
        console.error('Failed to update work item:', response.status, errorData)
        
        // Try to parse as JSON if possible
        try {
          const errorJson = JSON.parse(errorData)
          console.error('Error details:', errorJson)
        } catch {
          // Not JSON, log as text
          console.error('Error response text:', errorData)
        }
      }
    } catch (error) {
      console.error('Error updating work item:', error)
    }
  }

  const renderWorkItem = (item: WorkItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = currentExpandedRows.has(item.id)
    const paddingLeft = level * 30
    
    // Debug logging
    if (hasChildren) {
      console.log(`🎯 Rendering parent "${item.title}" - Has ${item.children?.length} children, Expanded: ${isExpanded}`)
    }
    if (level > 0) {
      console.log(`   🔸 Rendering child "${item.title}" at level ${level}`)
    }

    return (
      <Fragment key={item.id}>
        <Tr bg={level > 0 ? 'gray.50' : 'white'}>
          <Td style={{ paddingLeft: `${paddingLeft + 16}px` }}>
            {hasChildren && (
              <IconButton
                size="xs"
                variant="ghost"
                icon={isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                onClick={() => toggleExpanded(item.id)}
                mr={2}
                aria-label={isExpanded ? "Collapse" : "Expand"}
                suppressHydrationWarning
              />
            )}
            <IdDisplay 
              id={item.id}
              size={level > 0 ? 'xs' : 'sm'}
              color={level > 0 ? 'gray.600' : 'gray.800'}
              showFormat={true}
              showTooltip={true}
            />
          </Td>
          <Td minW="120px">
            <Text fontSize={level > 0 ? 'xs' : 'sm'} fontWeight={level > 0 ? 'normal' : 'medium'}>
              {level > 0 ? 'REALISASI' : (item.package || 'PELAYANAN UMUM')}
            </Text>
          </Td>
          <Td maxW="350px" minW="250px">
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
              <Box>
                {level > 0 && (
                  <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
                    Realisasi:
                  </Text>
                )}
                <Box>
                  <Text
                    onClick={() => startEdit(item.id, 'title', item.title)}
                    cursor="pointer"
                    _hover={{ bg: 'gray.100' }}
                    p={1}
                    borderRadius="md"
                    fontSize={level > 0 ? 'sm' : 'md'}
                    color={level > 0 ? 'gray.700' : 'gray.800'}
                    fontWeight={level > 0 ? 'normal' : 'medium'}
                    noOfLines={2}
                    title={item.title}
                  >
                    {item.title}
                  </Text>
                  {item.title.length > 100 && (
                    <Text 
                      fontSize="xs" 
                      color="blue.500" 
                      mt={1}
                      cursor="pointer"
                      onClick={() => onViewTask(item)}
                      _hover={{ textDecoration: 'underline' }}
                    >
                      👁️ Click to view full details
                    </Text>
                  )}
                </Box>
              </Box>
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
                  // Encode the work item ID to handle IDs with forward slashes
                  const encodedId = encodeURIComponent(item.id)
                  await fetch(`/api/work-items/${encodedId}`, {
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
            <HStack spacing={1}>
              <IconButton
                size="sm"
                variant="ghost"
                icon={<FiEye />}
                colorScheme="blue"
                aria-label="View Details"
                title="View Task Details"
                onClick={() => onViewTask(item)}
                suppressHydrationWarning
              />
              <IconButton
                size="sm"
                variant="ghost"
                icon={<FiCamera />}
                colorScheme="orange"
                aria-label="Upload Images"
                title="Upload Images"
                onClick={() => onViewTask(item)} // Opens task modal which now includes image upload
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
              {level === 0 && (
                <IconButton
                  size="sm"
                  variant="ghost"
                  icon={<FiPlus />}
                  colorScheme="purple"
                  aria-label="Add Child"
                  title="Add Realization"
                  onClick={() => onAddChild(item)}
                  suppressHydrationWarning
                />
              )}
              <IconButton
                size="sm"
                variant="ghost"
                icon={<FiTrash2 />}
                colorScheme="red"
                aria-label="Delete"
                suppressHydrationWarning
                onClick={() => onDelete(item.id)}
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
  const [showAddWorkItem, setShowAddWorkItem] = useState(false)
  const [showAddChildModal, setShowAddChildModal] = useState(false)
  const [selectedParentItem, setSelectedParentItem] = useState<WorkItem | null>(null)
  const [showViewTaskModal, setShowViewTaskModal] = useState(false)
  const [selectedViewTask, setSelectedViewTask] = useState<WorkItem | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [showExcelImport, setShowExcelImport] = useState(false)
  const toast = useToast()

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/templates/excel', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'Work_Items_Import_Template.xlsx'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: 'Template Downloaded',
          description: 'Excel template berhasil didownload',
          status: 'success',
          duration: 3000
        })
      } else {
        throw new Error('Failed to download template')
      }
    } catch (error) {
      console.error('Download template error:', error)
      toast({
        title: 'Download Gagal',
        description: 'Gagal mendownload template Excel. Silakan coba lagi.',
        status: 'error',
        duration: 3000
      })
    }
  }

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
        const workItemsData = data.workItems || data
        
        // Debug: Log children for troubleshooting
        workItemsData.forEach((item: WorkItem, index: number) => {
          if (item.children && item.children.length > 0) {
            console.log(`🔍 Parent "${item.title}" has ${item.children.length} children:`, item.children.map(child => child.title))
          }
        })
        
        setWorkItems(workItemsData)
        
        // Auto-expand parent items that have children
        const itemsWithChildren = new Set<string>()
        workItemsData.forEach((item: WorkItem) => {
          if (item.children && item.children.length > 0) {
            itemsWithChildren.add(item.id)
            console.log(`📂 Auto-expanding parent: ${item.title} (${item.id})`)
          }
        })
        
        if (itemsWithChildren.size > 0) {
          setExpandedRows(itemsWithChildren)
          console.log('✅ Auto-expanded items:', Array.from(itemsWithChildren))
        }
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

  const handleAddChildItem = (parentItem: WorkItem) => {
    setSelectedParentItem(parentItem)
    setShowAddChildModal(true)
  }

  const handleViewTask = (workItem: WorkItem) => {
    setSelectedViewTask(workItem)
    setShowViewTaskModal(true)
  }

  const handleDeleteWorkItem = async (workItemId: string) => {
    if (!confirm('Are you sure you want to delete this work item?')) {
      return
    }

    try {
      // Encode the workItemId to handle IDs with forward slashes
      const encodedWorkItemId = encodeURIComponent(workItemId)
      const response = await fetch(`/api/work-items/${encodedWorkItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Work item deleted successfully',
          status: 'success',
          duration: 3000
        })
        fetchWorkItems() // Refresh the list
      } else {
        let errorMessage = 'Failed to delete work item'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (jsonError) {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = `${response.status}: ${response.statusText}` || errorMessage
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error deleting work item:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete work item',
        status: 'error',
        duration: 3000
      })
    }
  }

  const exportToPDF = async () => {
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

      toast({
        title: 'Generating Exact Replica PDF Report...',
        description: `Creating 100% replica of reference format for ${selectedProject?.projectName || 'selected project'}`,
        status: 'info',
        duration: 2000
      })

      const response = await fetch('/api/reports/work-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          projectId: selectedProjectId,
          projectName: selectedProject?.projectName || 'Unknown Project',
          generateForProject: selectedProjectId
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
        a.download = `Docking_Report_${projectName}_${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: 'Exact Replica Docking Report Generated',
          description: `Perfect 100% replica of reference format generated for ${selectedProject?.projectName}`,
          status: 'success',
          duration: 4000
        })
      } else {
        const errorText = await response.text()
        console.error('API Error response:', errorText)
        throw new Error(`Failed to generate report: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('Error generating PDF report:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate PDF report. Please try again.',
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

  const totalTasks = filteredItems.length
  const avgComplete = Math.round(filteredItems.reduce((sum, item) => sum + item.completion, 0) / totalTasks) || 0
  const milestones = filteredItems.filter(item => item.isMilestone).length

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
                    leftIcon={<FiDownload />} 
                    colorScheme="teal" 
                    size="sm" 
                    variant="outline"
                    onClick={handleDownloadTemplate}
                  >
                    Download Template
                  </Button>
                )}
                {selectedProjectId && (
                  <Button 
                    leftIcon={<FiUpload />} 
                    colorScheme="orange" 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowExcelImport(true)}
                  >
                    Import Excel
                  </Button>
                )}
                {selectedProjectId && (
                  <Button 
                    leftIcon={<FiPlus />} 
                    colorScheme="blue" 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowAddWorkItem(true)}
                  >
                    Add Manual Item
                  </Button>
                )}
                {selectedProjectId && (
                  <CompletionRecalculator 
                    projectId={selectedProjectId}
                    onRecalculationComplete={fetchWorkItems}
                    size="sm"
                    variant="detailed"
                  />
                )}
              </HStack>

              {/* Export Actions */}
              <HStack spacing={2}>
                {/* Export Report Button with Full Borders */}
                <Button 
                  leftIcon={<FiFileText />} 
                  colorScheme="purple" 
                  size="sm" 
                  disabled={!selectedProjectId || workItems.length === 0}
                  onClick={exportToPDF}
                  suppressHydrationWarning
                  title="Generate PDF with exact replica format matching reference 100%"
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
                <WorkPlanTable 
                  workItems={filteredItems} 
                  onUpdate={fetchWorkItems} 
                  onDelete={handleDeleteWorkItem} 
                  onAddChild={handleAddChildItem}
                  onViewTask={handleViewTask}
                  projectId={selectedProjectId}
                  expandedRows={expandedRows}
                  setExpandedRows={setExpandedRows}
                />
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
      
      {/* Add Work Item Modal */}
      <AddWorkItemModal 
        isOpen={showAddWorkItem}
        onClose={() => setShowAddWorkItem(false)}
        projectId={selectedProjectId}
        onWorkItemAdded={fetchWorkItems}
      />
      
      {/* Add Child Work Item Modal */}
      <AddChildWorkItemModal 
        isOpen={showAddChildModal}
        onClose={() => {
          setShowAddChildModal(false)
          setSelectedParentItem(null)
        }}
        parentItem={selectedParentItem}
        projectId={selectedProjectId}
        onWorkItemAdded={fetchWorkItems}
      />
      
      {/* View Task Details Modal */}
      <ViewTaskModal 
        isOpen={showViewTaskModal}
        onClose={() => {
          setShowViewTaskModal(false)
          setSelectedViewTask(null)
        }}
        workItem={selectedViewTask}
      />
      
      {/* Excel Import Modal */}
      <ExcelImportModal 
        isOpen={showExcelImport}
        onClose={() => setShowExcelImport(false)}
        projectId={selectedProjectId}
        onImportSuccess={fetchWorkItems}
      />
    </ClientOnlyLayout>
  )
}
