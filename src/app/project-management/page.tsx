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
  SimpleGrid,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Progress,
  Icon,
  Flex,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEdit,
  FiTrash2,
  FiEye,
  FiUsers,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi'
import { useState } from 'react'
import MainLayout from '@/components/Layout/MainLayout'

interface WorkItem {
  id: string
  title: string
  category: string
  status: string
  progress: number
  assignee: string
  dueDate: string
  priority: 'High' | 'Medium' | 'Low'
}

const mockWorkItems: WorkItem[] = [
  {
    id: 'WI-001',
    title: 'Hull Inspection - MV Ocean Star',
    category: 'Survey & Estimasi',
    status: 'In Progress',
    progress: 75,
    assignee: 'John Doe',
    dueDate: '2024-01-15',
    priority: 'High'
  },
  {
    id: 'WI-002',
    title: 'Engine Maintenance - MT Pacific',
    category: 'Teknisi & Pelaksanaan',
    status: 'Planned',
    progress: 0,
    assignee: 'Jane Smith',
    dueDate: '2024-01-20',
    priority: 'Medium'
  },
  {
    id: 'WI-003',
    title: 'Dock Preparation',
    category: 'Pelayanan Umum',
    status: 'Completed',
    progress: 100,
    assignee: 'Mike Johnson',
    dueDate: '2024-01-10',
    priority: 'High'
  },
  {
    id: 'WI-004',
    title: 'Survey Report Generation',
    category: 'Reporting',
    status: 'In Progress',
    progress: 60,
    assignee: 'Sarah Wilson',
    dueDate: '2024-01-18',
    priority: 'Medium'
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'green'
    case 'In Progress': return 'blue'
    case 'Planned': return 'orange'
    default: return 'gray'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'red'
    case 'Medium': return 'yellow'
    case 'Low': return 'green'
    default: return 'gray'
  }
}

export default function ProjectManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Project Management' }
  ]

  const filteredItems = mockWorkItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <MainLayout currentModule="project-management" breadcrumbs={breadcrumbs}>
      <Container maxW="full" py={6}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" mb={2}>Project Management</Heading>
              <Text color="gray.600">
                Manage work items, tasks, and project progress
              </Text>
            </Box>
            <Button leftIcon={<FiPlus />} colorScheme="blue">
              Add Work Item
            </Button>
          </Flex>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <Card>
              <CardBody>
                <HStack>
                  <Icon as={FiCheckCircle} color="green.500" boxSize={8} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold">23</Text>
                    <Text fontSize="sm" color="gray.500">Completed</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <HStack>
                  <Icon as={FiClock} color="blue.500" boxSize={8} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold">15</Text>
                    <Text fontSize="sm" color="gray.500">In Progress</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <HStack>
                  <Icon as={FiUsers} color="purple.500" boxSize={8} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold">8</Text>
                    <Text fontSize="sm" color="gray.500">Team Members</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <HStack>
                  <Icon as={FiFilter} color="orange.500" boxSize={8} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold">5</Text>
                    <Text fontSize="sm" color="gray.500">Categories</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Filters and Search */}
          <Card>
            <CardBody>
              <HStack spacing={4} wrap="wrap">
                <InputGroup maxW="300px">
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search work items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                <Select
                  placeholder="All Status"
                  maxW="200px"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </Select>

                <Button leftIcon={<FiDownload />} variant="outline">
                  Export
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Work Items Table */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Work Items</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Showing {filteredItems.length} of {mockWorkItems.length} items
                  </Text>
                </HStack>

                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>Title</Th>
                        <Th>Category</Th>
                        <Th>Status</Th>
                        <Th>Progress</Th>
                        <Th>Assignee</Th>
                        <Th>Due Date</Th>
                        <Th>Priority</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredItems.map((item) => (
                        <Tr key={item.id}>
                          <Td fontWeight="semibold">{item.id}</Td>
                          <Td>{item.title}</Td>
                          <Td>{item.category}</Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm">{item.progress}%</Text>
                              <Progress
                                value={item.progress}
                                size="sm"
                                colorScheme={item.progress === 100 ? 'green' : 'blue'}
                                w="80px"
                              />
                            </VStack>
                          </Td>
                          <Td>{item.assignee}</Td>
                          <Td>{item.dueDate}</Td>
                          <Td>
                            <Badge colorScheme={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={1}>
                              <Button size="sm" variant="ghost" colorScheme="blue">
                                <FiEye />
                              </Button>
                              <Button size="sm" variant="ghost" colorScheme="green">
                                <FiEdit />
                              </Button>
                              <Button size="sm" variant="ghost" colorScheme="red">
                                <FiTrash2 />
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </MainLayout>
  )
}