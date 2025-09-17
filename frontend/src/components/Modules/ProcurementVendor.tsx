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
} from '@chakra-ui/react'
import { FiPlus, FiShoppingCart, FiCreditCard, FiUsers, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi'
import { useState } from 'react'

const dummyPurchaseOrders = [
  {
    id: 'PO-001',
    purId: 'PUR-001',
    vendor: 'PT. Spare Part Marine',
    project: 'PRJ-001',
    amount: 'Rp 85.000.000',
    status: 'Approved',
    sapStatus: 'Synced',
    createdDate: '2024-01-25',
    items: 'Engine Parts, Filters'
  },
  {
    id: 'PO-002',
    purId: 'PUR-002',
    vendor: 'CV. Baut Kapal Sejahtera',
    project: 'PRJ-002',
    amount: 'Rp 25.000.000',
    status: 'Waiting Approval',
    sapStatus: 'Pending',
    createdDate: '2024-02-01',
    items: 'Bolts, Nuts, Screws'
  },
  {
    id: 'PO-003',
    purId: 'PUR-003',
    vendor: 'PT. Cat Maritime',
    project: 'PRJ-001',
    amount: 'Rp 45.000.000',
    status: 'In Process',
    sapStatus: 'Processing',
    createdDate: '2024-02-05',
    items: 'Marine Paint, Primer'
  }
]

const dummyVendors = [
  {
    id: 'VEN-001',
    name: 'PT. Spare Part Marine',
    category: 'Engine Parts',
    rating: 4.8,
    totalOrders: 15,
    contact: '+62-21-55667788',
    status: 'Active'
  },
  {
    id: 'VEN-002',
    name: 'CV. Baut Kapal Sejahtera',
    category: 'Hardware',
    rating: 4.5,
    totalOrders: 8,
    contact: '+62-21-44556677',
    status: 'Active'
  },
  {
    id: 'VEN-003',
    name: 'PT. Cat Maritime',
    category: 'Coating Materials',
    rating: 4.2,
    totalOrders: 12,
    contact: '+62-21-33445566',
    status: 'Active'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved':
    case 'Active':
    case 'Synced':
      return 'green'
    case 'In Process':
    case 'Processing':
      return 'blue'
    case 'Waiting Approval':
    case 'Pending':
      return 'yellow'
    case 'Rejected':
      return 'red'
    default:
      return 'gray'
  }
}

export default function ProcurementVendorModule() {
  const [activeTab, setActiveTab] = useState('purchase-orders')

  const syncToSAP = (poId: string) => {
    // Simulate SAP sync process
    console.log(`Syncing PO ${poId} to SAP...`)
    // In real app, this would call API to sync with SAP
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Procurement & Vendor Management</Heading>
            <Text color="gray.600">Kelola Purchase Request (PUR), Purchase Order (PO) dan Master Vendor</Text>
          </VStack>
          <HStack spacing={3}>
            <Button leftIcon={<Icon as={FiRefreshCw} />} colorScheme="orange" variant="outline" size="sm">
              Sync SAP
            </Button>
            <Button leftIcon={<Icon as={FiPlus} />} colorScheme="blue">
              Buat PO Baru
            </Button>
          </HStack>
        </Flex>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Total PO</Text>
                <Text fontSize="2xl" fontWeight="bold">24</Text>
                <Badge colorScheme="blue" variant="subtle">Bulan ini</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Menunggu Approval</Text>
                <Text fontSize="2xl" fontWeight="bold">5</Text>
                <Badge colorScheme="yellow" variant="subtle">Pending</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Vendor Aktif</Text>
                <Text fontSize="2xl" fontWeight="bold">18</Text>
                <Badge colorScheme="green" variant="subtle">Registered</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Total Nilai PO</Text>
                <Text fontSize="2xl" fontWeight="bold">Rp 580M</Text>
                <Badge colorScheme="purple" variant="subtle">YTD</Badge>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Tabs */}
        <HStack spacing={4} borderBottom="1px" borderColor="gray.200" pb={4}>
          <Button
            variant={activeTab === 'purchase-orders' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('purchase-orders')}
          >
            <Icon as={FiShoppingCart} mr={2} />
            Purchase Orders
          </Button>
          <Button
            variant={activeTab === 'vendors' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('vendors')}
          >
            <Icon as={FiUsers} mr={2} />
            Master Vendor
          </Button>
        </HStack>

        {/* Purchase Orders Tab */}
        {activeTab === 'purchase-orders' && (
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="md">Daftar Purchase Orders</Heading>
              <HStack spacing={3}>
                <Select placeholder="Filter Status" maxW="200px">
                  <option value="approved">Approved</option>
                  <option value="waiting">Waiting Approval</option>
                  <option value="process">In Process</option>
                </Select>
                <Input placeholder="Cari PO..." maxW="250px" />
              </HStack>
            </Flex>
            
            {dummyPurchaseOrders.map((po) => (
              <Card key={po.id}>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Text fontSize="lg" fontWeight="bold">{po.id}</Text>
                          <Text fontSize="sm" color="gray.500">({po.purId})</Text>
                        </HStack>
                        <Text fontSize="md" color="blue.600">{po.vendor}</Text>
                      </VStack>
                      <VStack align="end" spacing={2}>
                        <Badge colorScheme={getStatusColor(po.status)}>
                          {po.status}
                        </Badge>
                        <Badge 
                          colorScheme={getStatusColor(po.sapStatus)} 
                          variant="outline"
                          leftIcon={po.sapStatus === 'Synced' ? <FiCheck /> : <FiRefreshCw />}
                        >
                          SAP: {po.sapStatus}
                        </Badge>
                      </VStack>
                    </Flex>
                    
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Project</Text>
                        <Text fontSize="sm">{po.project}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Items</Text>
                        <Text fontSize="sm">{po.items}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Amount</Text>
                        <Text fontSize="sm" fontWeight="medium">{po.amount}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Created Date</Text>
                        <Text fontSize="sm">{po.createdDate}</Text>
                      </VStack>
                    </SimpleGrid>
                    
                    <HStack spacing={2} justify="end">
                      {po.sapStatus !== 'Synced' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          colorScheme="orange"
                          leftIcon={<Icon as={FiRefreshCw} />}
                          onClick={() => syncToSAP(po.id)}
                        >
                          Sync ke SAP
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" colorScheme="blue">
                        Detail PO
                      </Button>
                      <Button size="sm" variant="ghost" colorScheme="green">
                        Update Status
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="md">Master Vendor</Heading>
              <HStack spacing={3}>
                <Select placeholder="Filter Kategori" maxW="200px">
                  <option value="engine">Engine Parts</option>
                  <option value="hardware">Hardware</option>
                  <option value="coating">Coating Materials</option>
                </Select>
                <Input placeholder="Cari vendor..." maxW="250px" />
                <Button leftIcon={<Icon as={FiPlus} />} colorScheme="green" size="sm">
                  Tambah Vendor
                </Button>
              </HStack>
            </Flex>
            
            {dummyVendors.map((vendor) => (
              <Card key={vendor.id}>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="lg" fontWeight="bold">{vendor.name}</Text>
                        <Text fontSize="sm" color="gray.600">{vendor.id}</Text>
                      </VStack>
                      <Badge colorScheme={getStatusColor(vendor.status)}>
                        {vendor.status}
                      </Badge>
                    </Flex>
                    
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Kategori</Text>
                        <Badge variant="outline">{vendor.category}</Badge>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Rating</Text>
                        <HStack>
                          <Text fontSize="sm" fontWeight="medium">{vendor.rating}</Text>
                          <Text fontSize="xs" color="yellow.500">★★★★★</Text>
                        </HStack>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Total Orders</Text>
                        <Text fontSize="sm">{vendor.totalOrders} PO</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Contact</Text>
                        <Text fontSize="sm">{vendor.contact}</Text>
                      </VStack>
                    </SimpleGrid>
                    
                    <HStack spacing={2} justify="end">
                      <Button size="sm" variant="ghost" colorScheme="blue">
                        Detail Vendor
                      </Button>
                      <Button size="sm" variant="ghost" colorScheme="green">
                        Buat PO
                      </Button>
                      <Button size="sm" variant="ghost" colorScheme="purple">
                        History Orders
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