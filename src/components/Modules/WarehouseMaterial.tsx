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
  SimpleGrid,
  Progress,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { 
  FiPlus, 
  FiPackage, 
  FiTruck, 
  FiAlertCircle, 
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiDownload,
  FiUpload
} from 'react-icons/fi'
import { useState } from 'react'

const dummyMaterials = [
  {
    id: 'MAT-001',
    name: 'Engine Oil SAE 40',
    category: 'Lubricants',
    currentStock: 25,
    minStock: 10,
    maxStock: 100,
    unit: 'Liter',
    location: 'A-1-05',
    lastRestockDate: '2024-01-15',
    supplier: 'PT. Oil Marine',
    unitPrice: 75000,
    status: 'Available'
  },
  {
    id: 'MAT-002',
    name: 'Marine Paint - Red',
    category: 'Paints & Coatings',
    currentStock: 5,
    minStock: 15,
    maxStock: 50,
    unit: 'Gallon',
    location: 'B-2-12',
    lastRestockDate: '2024-01-20',
    supplier: 'PT. Cat Maritime',
    unitPrice: 450000,
    status: 'Low Stock'
  },
  {
    id: 'MAT-003',
    name: 'Steel Bolt M16x50',
    category: 'Fasteners',
    currentStock: 250,
    minStock: 100,
    maxStock: 500,
    unit: 'Pcs',
    location: 'C-1-08',
    lastRestockDate: '2024-02-01',
    supplier: 'CV. Baut Sejahtera',
    unitPrice: 15000,
    status: 'Available'
  },
  {
    id: 'MAT-004',
    name: 'Hydraulic Fluid ISO 46',
    category: 'Lubricants',
    currentStock: 0,
    minStock: 20,
    maxStock: 80,
    unit: 'Liter',
    location: 'A-2-03',
    lastRestockDate: '2023-12-15',
    supplier: 'PT. Hydraulic Supply',
    unitPrice: 85000,
    status: 'Out of Stock'
  }
]

const dummyRequests = [
  {
    id: 'REQ-001',
    projectId: 'PRJ-001',
    projectName: 'KM. Sinar Jaya',
    requestDate: '2024-02-10',
    requestedBy: 'Ahmad Surya',
    status: 'Approved',
    priority: 'High',
    items: [
      { materialId: 'MAT-001', materialName: 'Engine Oil SAE 40', requestedQty: 10, approvedQty: 10, unit: 'Liter' },
      { materialId: 'MAT-003', materialName: 'Steel Bolt M16x50', requestedQty: 50, approvedQty: 45, unit: 'Pcs' }
    ]
  },
  {
    id: 'REQ-002',
    projectId: 'PRJ-002',
    projectName: 'KM. Bahari Indah',
    requestDate: '2024-02-12',
    requestedBy: 'Budi Santoso',
    status: 'Pending',
    priority: 'Medium',
    items: [
      { materialId: 'MAT-002', materialName: 'Marine Paint - Red', requestedQty: 8, approvedQty: 0, unit: 'Gallon' },
      { materialId: 'MAT-004', materialName: 'Hydraulic Fluid ISO 46', requestedQty: 15, approvedQty: 0, unit: 'Liter' }
    ]
  },
  {
    id: 'REQ-003',
    projectId: 'PRJ-001',
    projectName: 'KM. Sinar Jaya',
    requestDate: '2024-02-15',
    requestedBy: 'Citra Dewi',
    status: 'Delivered',
    priority: 'Low',
    items: [
      { materialId: 'MAT-003', materialName: 'Steel Bolt M16x50', requestedQty: 25, approvedQty: 25, unit: 'Pcs' }
    ]
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Available':
    case 'Approved':
    case 'Delivered':
      return 'green'
    case 'Low Stock':
    case 'Pending':
      return 'yellow'
    case 'Out of Stock':
    case 'Rejected':
      return 'red'
    default:
      return 'gray'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'red'
    case 'Medium':
      return 'yellow'
    case 'Low':
      return 'blue'
    default:
      return 'gray'
  }
}

export default function WarehouseMaterialModule() {
  const [activeTab, setActiveTab] = useState('materials')

  const lowStockItems = dummyMaterials.filter(m => m.status === 'Low Stock' || m.status === 'Out of Stock')
  const pendingRequests = dummyRequests.filter(r => r.status === 'Pending')

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Gudang & Material Management</Heading>
            <Text color="gray.600">Kelola inventory, stock materials, dan material requests</Text>
          </VStack>
          <HStack spacing={3}>
            <Button leftIcon={<Icon as={FiDownload} />} colorScheme="purple" variant="outline" size="sm">
              Export Stock
            </Button>
            <Button leftIcon={<Icon as={FiUpload} />} colorScheme="orange" variant="outline" size="sm">
              Import Materials
            </Button>
            <Button leftIcon={<Icon as={FiPlus} />} colorScheme="blue">
              Add Material
            </Button>
          </HStack>
        </Flex>

        {/* Alerts */}
        {lowStockItems.length > 0 && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <VStack align="start" spacing={1} flex="1">
              <Text fontWeight="medium">Stock Alert!</Text>
              <Text fontSize="sm">
                {lowStockItems.length} items membutuhkan restock segera
              </Text>
            </VStack>
            <Button size="sm" colorScheme="orange" variant="outline">
              View Details
            </Button>
          </Alert>
        )}

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Total Materials</Text>
                <Text fontSize="2xl" fontWeight="bold">247</Text>
                <Badge colorScheme="blue" variant="subtle">Active items</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Low Stock Alerts</Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {lowStockItems.length}
                </Text>
                <Badge colorScheme="orange" variant="subtle">Need attention</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Pending Requests</Text>
                <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                  {pendingRequests.length}
                </Text>
                <Badge colorScheme="yellow" variant="subtle">Awaiting approval</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Stock Value</Text>
                <Text fontSize="2xl" fontWeight="bold">Rp 2.8B</Text>
                <HStack>
                  <Icon as={FiTrendingUp} color="green.500" boxSize={4} />
                  <Text fontSize="xs" color="green.500">+5.2% bulan ini</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Tabs */}
        <HStack spacing={4} borderBottom="1px" borderColor="gray.200" pb={4}>
          <Button
            variant={activeTab === 'materials' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('materials')}
          >
            <Icon as={FiPackage} mr={2} />
            Material Stock
          </Button>
          <Button
            variant={activeTab === 'requests' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('requests')}
          >
            <Icon as={FiTruck} mr={2} />
            Material Requests
          </Button>
        </HStack>

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="md">Material Stock</Heading>
              <HStack spacing={3}>
                <Select placeholder="Filter Category" maxW="200px">
                  <option value="lubricants">Lubricants</option>
                  <option value="paints">Paints & Coatings</option>
                  <option value="fasteners">Fasteners</option>
                </Select>
                <Select placeholder="Filter Status" maxW="180px">
                  <option value="available">Available</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </Select>
                <Input placeholder="Search materials..." maxW="250px" />
              </HStack>
            </Flex>
            
            {dummyMaterials.map((material) => (
              <Card key={material.id}>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="lg" fontWeight="bold">{material.name}</Text>
                        <HStack>
                          <Text fontSize="sm" color="gray.600">{material.id}</Text>
                          <Text fontSize="sm" color="gray.400">•</Text>
                          <Badge variant="outline">{material.category}</Badge>
                        </HStack>
                      </VStack>
                      <VStack align="end" spacing={2}>
                        <Badge colorScheme={getStatusColor(material.status)} variant="solid">
                          {material.status}
                        </Badge>
                        <Text fontSize="sm" color="gray.500">Loc: {material.location}</Text>
                      </VStack>
                    </Flex>
                    
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Current Stock</Text>
                        <HStack>
                          <Text fontSize="lg" fontWeight="bold" 
                                color={material.currentStock <= material.minStock ? 'red.500' : 'green.600'}>
                            {material.currentStock}
                          </Text>
                          <Text fontSize="sm" color="gray.400">{material.unit}</Text>
                        </HStack>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Stock Range</Text>
                        <Text fontSize="sm">
                          Min: {material.minStock} | Max: {material.maxStock}
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Unit Price</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          Rp {material.unitPrice.toLocaleString()}
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Last Restock</Text>
                        <Text fontSize="sm">{material.lastRestockDate}</Text>
                      </VStack>
                    </SimpleGrid>
                    
                    {/* Stock Level Progress Bar */}
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.500">Stock Level</Text>
                        <Text fontSize="sm">
                          {Math.round((material.currentStock / material.maxStock) * 100)}%
                        </Text>
                      </HStack>
                      <Progress 
                        value={(material.currentStock / material.maxStock) * 100} 
                        colorScheme={material.currentStock <= material.minStock ? 'red' : 'green'}
                        size="sm" 
                        borderRadius="lg"
                      />
                    </VStack>
                    
                    <HStack spacing={2} justify="end">
                      <Text fontSize="sm" color="gray.500">Supplier: {material.supplier}</Text>
                      <Button size="sm" variant="outline" colorScheme="blue">
                        View History
                      </Button>
                      <Button size="sm" variant="outline" colorScheme="green">
                        Restock
                      </Button>
                      <Button size="sm" variant="ghost" colorScheme="purple">
                        Edit
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="md">Material Requests</Heading>
              <HStack spacing={3}>
                <Select placeholder="Filter Status" maxW="180px">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="delivered">Delivered</option>
                </Select>
                <Select placeholder="Filter Priority" maxW="180px">
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </Select>
                <Input placeholder="Search requests..." maxW="250px" />
                <Button leftIcon={<Icon as={FiPlus} />} colorScheme="green" size="sm">
                  New Request
                </Button>
              </HStack>
            </Flex>
            
            {dummyRequests.map((request) => (
              <Card key={request.id}>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="lg" fontWeight="bold">{request.id}</Text>
                        <Text fontSize="md" color="blue.600">{request.projectName}</Text>
                      </VStack>
                      <VStack align="end" spacing={2}>
                        <Badge colorScheme={getStatusColor(request.status)} variant="solid">
                          {request.status}
                        </Badge>
                        <Badge colorScheme={getPriorityColor(request.priority)} variant="outline">
                          {request.priority} Priority
                        </Badge>
                      </VStack>
                    </Flex>
                    
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Requested By</Text>
                        <Text fontSize="sm">{request.requestedBy}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Request Date</Text>
                        <Text fontSize="sm">{request.requestDate}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Total Items</Text>
                        <Text fontSize="sm">{request.items.length} materials</Text>
                      </VStack>
                    </SimpleGrid>
                    
                    {/* Items List */}
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={3}>Requested Materials:</Text>
                      <VStack spacing={2} align="stretch">
                        {request.items.map((item, index) => (
                          <Card key={index} variant="outline" size="sm">
                            <CardBody py={2}>
                              <HStack justify="space-between" align="center">
                                <VStack align="start" spacing={1}>
                                  <Text fontSize="sm" fontWeight="medium">{item.materialName}</Text>
                                  <Text fontSize="xs" color="gray.500">{item.materialId}</Text>
                                </VStack>
                                <HStack spacing={4}>
                                  <VStack align="center" spacing={0}>
                                    <Text fontSize="xs" color="gray.500">Requested</Text>
                                    <Text fontSize="sm" fontWeight="medium">
                                      {item.requestedQty} {item.unit}
                                    </Text>
                                  </VStack>
                                  <VStack align="center" spacing={0}>
                                    <Text fontSize="xs" color="gray.500">Approved</Text>
                                    <Text fontSize="sm" fontWeight="medium" 
                                          color={item.approvedQty === item.requestedQty ? 'green.600' : 'orange.600'}>
                                      {item.approvedQty} {item.unit}
                                    </Text>
                                  </VStack>
                                </HStack>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </Box>
                    
                    <HStack spacing={2} justify="end">
                      {request.status === 'Pending' && (
                        <>
                          <Button size="sm" colorScheme="red" variant="outline">
                            Reject
                          </Button>
                          <Button size="sm" colorScheme="green">
                            Approve
                          </Button>
                        </>
                      )}
                      {request.status === 'Approved' && (
                        <Button size="sm" colorScheme="blue">
                          Mark as Delivered
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" colorScheme="purple">
                        View Details
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  )
}