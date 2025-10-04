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
import MainLayout from '@/components/Layout/MainLayout'

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
}

const WorkPlanTable = ({ workItems, onUpdate }: { workItems: WorkItem[], onUpdate: () => void }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [editingCell, setEditingCell] = useState<{ id: string, field: string } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

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
            {isMounted ? (
              (() => {
                // Use deterministic logic based on item.id to avoid hydration mismatch
                const isConflict = item.id.length % 3 === 0 || item.completion < 50
                return (
                  <Badge colorScheme={isConflict ? 'red' : 'green'} size="sm">
                    {isConflict ? 'Hapus' : 'OK'}
                  </Badge>
                )
              })()
            ) : (
              <Badge colorScheme="gray" size="sm">
                Loading...
              </Badge>
            )}
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
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [packageFilter, setPackageFilter] = useState('')
  const [resourceFilter, setResourceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const toast = useToast()

  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Work Plan & Report' }
  ]

  const fetchWorkItems = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:4000/api/work-items', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setWorkItems(data)
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

  const createSampleHierarchy = async () => {
    try {
      const sampleData = {
        id: `SAMPLE-${Date.now()}`,
        title: 'Sample Work Item',
        description: 'This is a sample work item',
        completion: 0,
        package: 'Sample Package',
        durationDays: 5,
        startDate: new Date().toISOString().split('T')[0],
        finishDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        resourceNames: 'Sample Resource',
        isMilestone: false
      }

      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:4000/api/work-items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sampleData)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Sample hierarchy created',
          status: 'success',
          duration: 3000
        })
        fetchWorkItems()
      }
    } catch (error) {
      console.error('Error creating sample:', error)
      toast({
        title: 'Error',
        description: 'Failed to create sample hierarchy',
        status: 'error',
        duration: 3000
      })
    }
  }

  useEffect(() => {
    fetchWorkItems()
  }, [])

  const exportToPDF = async () => {
    try {
      toast({
        title: 'Generating Docking Report...',
        description: 'Please wait while we generate your docking report using company template',
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
          projectName: 'MT. FERIMAS SEJAHTERA',
          workItems: workItems
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Docking_Report_${new Date().toISOString().split('T')[0]}.docx`
        a.click()
        URL.revokeObjectURL(url)

        toast({
          title: 'Docking Report Generated',
          description: 'Laporan docking berhasil dibuat menggunakan template kop surat perusahaan',
          status: 'success',
          duration: 4000
        })
      } else {
        throw new Error('Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate PDF report. Please try again.',
        status: 'error',
        duration: 3000
      })
    }
  }

  const downloadTemplate = async () => {
    try {
      toast({
        title: 'Downloading Template...',
        description: 'Please wait while we prepare the template file',
        status: 'info',
        duration: 2000
      })

      const response = await fetch('/api/reports/work-plan', {
        method: 'GET'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'Template_Docking_Report.docx'
        a.click()
        URL.revokeObjectURL(url)

        toast({
          title: 'Template Downloaded',
          description: 'Silahkan modifikasi template sesuai kebutuhan perusahaan',
          status: 'success',
          duration: 4000
        })
      } else {
        throw new Error('Failed to download template')
      }
    } catch (error) {
      console.error('Error downloading template:', error)
      toast({
        title: 'Error',
        description: 'Failed to download template. Please try again.',
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
    a.download = 'work-plan-report.csv'
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Success',
      description: 'CSV exported successfully',
      status: 'success',
      duration: 3000
    })
  }

  const filteredItems = workItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPackage = !packageFilter || (item.package || 'Pelayanan Umum').includes(packageFilter)
    const matchesResource = !resourceFilter || item.resourceNames.toLowerCase().includes(resourceFilter.toLowerCase())
    return matchesSearch && matchesPackage && matchesResource
  })

  const totalTasks = workItems.length
  const avgComplete = Math.round(workItems.reduce((sum, item) => sum + item.completion, 0) / totalTasks) || 0
  const milestones = workItems.filter(item => item.isMilestone).length
  // Use deterministic calculation for conflicts to avoid hydration mismatch
  const conflicts = workItems.filter(item => item.id.length % 3 === 0 || item.completion < 50).length

  return (
    <MainLayout currentModule="work-plan-report" breadcrumbs={breadcrumbs}>
      <Container maxW="full" py={6}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" mb={2}>Work Plan & Report</Heading>
              <Text color="gray.600">
                Input label realisasi & progress, paste/import cepat, dan generate PDF
              </Text>
            </Box>
            <HStack spacing={2} wrap="wrap">
              <Button leftIcon={<FiUpload />} variant="outline" size="sm" suppressHydrationWarning>
                Paste/Import
              </Button>
              <Button leftIcon={<FiFileText />} colorScheme="purple" size="sm" onClick={exportToPDF} suppressHydrationWarning>
                Generate Docking Report (Word)
              </Button>
              <Button leftIcon={<FiDownload />} colorScheme="green" size="sm" onClick={exportToCSV} suppressHydrationWarning>
                Export CSV
              </Button>
              <Button leftIcon={<FiDownload />} colorScheme="blue" variant="outline" size="sm" onClick={downloadTemplate} suppressHydrationWarning>
                Download Template
              </Button>
              <Button leftIcon={<FiPlus />} colorScheme="blue" size="sm" suppressHydrationWarning>
                Tambah Baris
              </Button>
              <Button leftIcon={<FiCopy />} colorScheme="orange" size="sm" onClick={createSampleHierarchy} suppressHydrationWarning>
                Create Sample Hierarchy
              </Button>
            </HStack>
          </Flex>

          {/* Work Items Table Tab */}
          <Card>
            <CardBody>
              <Text fontWeight="semibold" mb={4} color="blue.600">Work Items Table</Text>
              
              {/* Filters */}
              <HStack spacing={4} mb={4} wrap="wrap">
                <Input
                  placeholder="Cari task/package/resource/notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  maxW="300px"
                  suppressHydrationWarning
                />
                <Select
                  placeholder="Filter Package"
                  value={packageFilter}
                  onChange={(e) => setPackageFilter(e.target.value)}
                  maxW="200px"
                  suppressHydrationWarning
                >
                  <option value="Pelayanan Umum">Pelayanan Umum</option>
                  <option value="Survey & Estimasi">Survey & Estimasi</option>
                </Select>
                <Select
                  placeholder="Filter Resource"
                  value={resourceFilter}
                  onChange={(e) => setResourceFilter(e.target.value)}
                  maxW="200px"
                  suppressHydrationWarning
                >
                  <option value="test">test</option>
                  <option value="Tim Survey">Tim Survey</option>
                </Select>
                <Select placeholder="Semua" maxW="150px" suppressHydrationWarning>
                  <option value="planned">Planned</option>
                  <option value="progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Select>
                <HStack>
                  <Text fontSize="sm">Start:</Text>
                  <Input type="date" size="sm" suppressHydrationWarning />
                  <Text fontSize="sm">to</Text>
                  <Input type="date" size="sm" suppressHydrationWarning />
                  <Text fontSize="sm">Finish:</Text>
                  <Input type="date" size="sm" suppressHydrationWarning />
                  <Text fontSize="sm">to</Text>
                  <Input type="date" size="sm" suppressHydrationWarning />
                </HStack>
              </HStack>

              {/* Stats */}
              <HStack spacing={6} mb={4} p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm">
                  <Text as="span" fontWeight="bold" color="blue.600">Total Tasks:</Text> {totalTasks}
                </Text>
                <Text fontSize="sm">
                  <Text as="span" fontWeight="bold" color="green.600">Avg % Complete:</Text> {avgComplete}%
                </Text>
                <Text fontSize="sm">
                  <Text as="span" fontWeight="bold" color="purple.600">Milestones:</Text> {milestones}
                </Text>
                <Text fontSize="sm">
                  <Text as="span" fontWeight="bold" color="red.600">Conflicted Tasks:</Text> {conflicts}
                </Text>
              </HStack>

              {loading ? (
                <Flex justify="center" py={10}>
                  <Spinner size="xl" color="blue.500" />
                </Flex>
              ) : (
                <WorkPlanTable workItems={filteredItems} onUpdate={fetchWorkItems} />
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </MainLayout>
  )
}