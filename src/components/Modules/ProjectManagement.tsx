'use client'

import {
  Box,
  Button,
  Badge,
  HStack,
  VStack,
  Text,
  Input,
  Select,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Flex,
  Icon,
  useDisclosure,
} from '@chakra-ui/react'
import { FiSearch, FiPlus, FiMoreVertical, FiEdit, FiEye, FiTrash2 } from 'react-icons/fi'
import { useState } from 'react'

const dummyProjects = [
  {
    id: 'PRJ-001',
    name: 'KM. Sinar Jaya',
    type: 'Docking',
    customer: 'PT. Pelayaran Nusantara',
    status: 'In Progress',
    startDate: '2024-01-15',
    endDate: '2024-02-28',
    value: 'Rp 250.000.000',
    progress: 65,
  },
  {
    id: 'PRJ-002', 
    name: 'KM. Bahari Indah',
    type: 'Repair',
    customer: 'PT. Armada Laut',
    status: 'Planning',
    startDate: '2024-02-01',
    endDate: '2024-03-15',
    value: 'Rp 180.000.000',
    progress: 25,
  },
  {
    id: 'PRJ-003',
    name: 'KM. Samudra Baru',
    type: 'Maintenance',
    customer: 'PT. Kapal Cepat',
    status: 'Completed',
    startDate: '2023-12-01',
    endDate: '2024-01-10',
    value: 'Rp 320.000.000',
    progress: 100,
  },
  {
    id: 'PRJ-004',
    name: 'KM. Nusantara Jaya',
    type: 'Docking',
    customer: 'PT. Maritim Indonesia',
    status: 'On Hold',
    startDate: '2024-01-20',
    endDate: '2024-04-01',
    value: 'Rp 450.000.000',
    progress: 15,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'green'
    case 'In Progress':
      return 'blue'
    case 'Planning':
      return 'yellow'
    case 'On Hold':
      return 'red'
    default:
      return 'gray'
  }
}

export default function ProjectManagementModule() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const filteredProjects = dummyProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.customer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === '' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Manajemen Proyek & Nota Dinas</Heading>
            <Text color="gray.600">Kelola seluruh proyek pekerjaan docking kapal</Text>
          </VStack>
          <Button leftIcon={<Icon as={FiPlus} />} colorScheme="blue" onClick={onOpen}>
            Tambah Proyek
          </Button>
        </Flex>

        {/* Stats Cards */}
        <HStack spacing={4}>
          <Card flex="1">
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Total Proyek</Text>
                <Text fontSize="2xl" fontWeight="bold">12</Text>
                <Badge colorScheme="blue" variant="subtle">+2 bulan ini</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card flex="1">
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Sedang Berjalan</Text>
                <Text fontSize="2xl" fontWeight="bold">5</Text>
                <Badge colorScheme="green" variant="subtle">Active</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card flex="1">
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Total Nilai</Text>
                <Text fontSize="2xl" fontWeight="bold">Rp 2.1M</Text>
                <Badge colorScheme="yellow" variant="subtle">+15%</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card flex="1">
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Selesai Bulan Ini</Text>
                <Text fontSize="2xl" fontWeight="bold">3</Text>
                <Badge colorScheme="purple" variant="subtle">Completed</Badge>
              </VStack>
            </CardBody>
          </Card>
        </HStack>

        {/* Filters */}
        <Card>
          <CardBody>
            <HStack spacing={4} flexWrap="wrap">
              <Input
                placeholder="Cari nama kapal atau customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                maxW="400px"
              />
              <Select
                placeholder="Semua Status"
                maxW="200px"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="In Progress">In Progress</option>
                <option value="Planning">Planning</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </Select>
              <Select placeholder="Jenis Pekerjaan" maxW="200px">
                <option value="docking">Docking</option>
                <option value="repair">Repair</option>
                <option value="maintenance">Maintenance</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Data List */}
        <VStack spacing={4} align="stretch">
          <Heading size="md">Daftar Proyek</Heading>
          {filteredProjects.map((project) => (
            <Card key={project.id}>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="lg" fontWeight="bold">{project.id}</Text>
                      <Text fontSize="md" color="blue.600">{project.name}</Text>
                    </VStack>
                    <Badge colorScheme={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </Flex>
                  
                  <HStack spacing={6} flexWrap="wrap">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.500">Jenis</Text>
                      <Badge variant="outline">{project.type}</Badge>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.500">Customer</Text>
                      <Text fontSize="sm">{project.customer}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.500">Nilai Proyek</Text>
                      <Text fontSize="sm" fontWeight="medium">{project.value}</Text>
                    </VStack>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.500">Progress</Text>
                      <HStack>
                        <Text fontSize="sm">{project.progress}%</Text>
                        <Box
                          w="100px"
                          h="6px"
                          bg="gray.200"
                          borderRadius="full"
                          overflow="hidden"
                        >
                          <Box
                            w={`${project.progress}%`}
                            h="full"
                            bg={getStatusColor(project.status) === 'green' ? 'green.500' : 'blue.500'}
                            borderRadius="full"
                          />
                        </Box>
                      </HStack>
                    </VStack>
                    
                    <VStack align="end" spacing={1}>
                      <Text fontSize="sm" color="gray.500">Timeline</Text>
                      <Text fontSize="sm">{project.startDate} - {project.endDate}</Text>
                    </VStack>
                  </HStack>
                  
                  <HStack spacing={2} justify="end">
                    <Button size="sm" variant="ghost" colorScheme="blue">
                      <Icon as={FiEye} mr={2} />Lihat
                    </Button>
                    <Button size="sm" variant="ghost" colorScheme="green">
                      <Icon as={FiEdit} mr={2} />Edit
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>

      </VStack>
    </Box>
  )
}