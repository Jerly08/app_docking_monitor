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
  Avatar,
} from '@chakra-ui/react'
import { 
  FiPlus, 
  FiDollarSign, 
  FiMessageSquare, 
  FiCheckCircle, 
  FiClock, 
  FiXCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiFileText
} from 'react-icons/fi'
import { useState } from 'react'

const dummyQuotations = [
  {
    id: 'QUO-001',
    projectId: 'PRJ-001',
    projectName: 'KM. Sinar Jaya',
    requestDate: '2024-01-20',
    status: 'Negotiating',
    totalVendors: 3,
    bestOffer: 'Rp 245.000.000',
    savings: 'Rp 15.000.000',
    deadline: '2024-02-15',
    category: 'Engine Repair',
    progress: 65,
    negotiationRounds: 2
  },
  {
    id: 'QUO-002',
    projectId: 'PRJ-002',
    projectName: 'KM. Bahari Indah',
    requestDate: '2024-02-01',
    status: 'Approved',
    totalVendors: 4,
    bestOffer: 'Rp 175.000.000',
    savings: 'Rp 25.000.000',
    deadline: '2024-02-20',
    category: 'Hull Repair',
    progress: 100,
    negotiationRounds: 3
  },
  {
    id: 'QUO-003',
    projectId: 'PRJ-004',
    projectName: 'KM. Nusantara Jaya',
    requestDate: '2024-02-10',
    status: 'Under Review',
    totalVendors: 5,
    bestOffer: 'Rp 420.000.000',
    savings: 'Rp 35.000.000',
    deadline: '2024-03-01',
    category: 'Complete Overhaul',
    progress: 25,
    negotiationRounds: 1
  }
]

const vendorComparisons = [
  {
    id: 'VEN-001',
    name: 'PT. Spare Part Marine',
    quotationId: 'QUO-001',
    offerPrice: 'Rp 245.000.000',
    originalPrice: 'Rp 260.000.000',
    deliveryTime: '14 hari',
    rating: 4.8,
    status: 'Best Offer',
    negotiationHistory: [
      { round: 1, price: 'Rp 260.000.000', date: '2024-01-21' },
      { round: 2, price: 'Rp 245.000.000', date: '2024-01-25' }
    ]
  },
  {
    id: 'VEN-002',
    name: 'CV. Teknik Kapal',
    quotationId: 'QUO-001',
    offerPrice: 'Rp 255.000.000',
    originalPrice: 'Rp 270.000.000',
    deliveryTime: '18 hari',
    rating: 4.5,
    status: 'Counter Offer',
    negotiationHistory: [
      { round: 1, price: 'Rp 270.000.000', date: '2024-01-21' },
      { round: 2, price: 'Rp 255.000.000', date: '2024-01-26' }
    ]
  },
  {
    id: 'VEN-003',
    name: 'PT. Marine Solution',
    quotationId: 'QUO-001',
    offerPrice: 'Rp 265.000.000',
    originalPrice: 'Rp 280.000.000',
    deliveryTime: '21 hari',
    rating: 4.2,
    status: 'Rejected',
    negotiationHistory: [
      { round: 1, price: 'Rp 280.000.000', date: '2024-01-21' },
      { round: 2, price: 'Rp 265.000.000', date: '2024-01-24' }
    ]
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved':
    case 'Best Offer':
      return 'green'
    case 'Negotiating':
    case 'Counter Offer':
      return 'blue'
    case 'Under Review':
      return 'yellow'
    case 'Rejected':
      return 'red'
    default:
      return 'gray'
  }
}

export default function QuotationNegotiationModule() {
  const [activeTab, setActiveTab] = useState('quotations')
  const [selectedQuotation, setSelectedQuotation] = useState('QUO-001')

  const currentVendors = vendorComparisons.filter(v => v.quotationId === selectedQuotation)

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Penawaran & Negosiasi</Heading>
            <Text color="gray.600">Kelola penawaran vendor, negosiasi harga, dan approval workflow</Text>
          </VStack>
          <HStack spacing={3}>
            <Button leftIcon={<Icon as={FiFileText} />} colorScheme="purple" variant="outline" size="sm">
              Generate RFQ
            </Button>
            <Button leftIcon={<Icon as={FiPlus} />} colorScheme="blue">
              Request Quotation
            </Button>
          </HStack>
        </Flex>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Total Quotations</Text>
                <Text fontSize="2xl" fontWeight="bold">18</Text>
                <Badge colorScheme="blue" variant="subtle">Bulan ini</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Dalam Negosiasi</Text>
                <Text fontSize="2xl" fontWeight="bold">7</Text>
                <Badge colorScheme="orange" variant="subtle">Active</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Total Savings</Text>
                <Text fontSize="2xl" fontWeight="bold">Rp 125M</Text>
                <HStack>
                  <Icon as={FiTrendingDown} color="green.500" boxSize={4} />
                  <Text fontSize="xs" color="green.500">-8.5% dari target</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Avg Response Time</Text>
                <Text fontSize="2xl" fontWeight="bold">3.2 hari</Text>
                <Badge colorScheme="green" variant="subtle">Good</Badge>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Tabs */}
        <HStack spacing={4} borderBottom="1px" borderColor="gray.200" pb={4}>
          <Button
            variant={activeTab === 'quotations' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('quotations')}
          >
            <Icon as={FiFileText} mr={2} />
            Quotation List
          </Button>
          <Button
            variant={activeTab === 'negotiations' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('negotiations')}
          >
            <Icon as={FiMessageSquare} mr={2} />
            Vendor Comparison
          </Button>
        </HStack>

        {/* Quotations Tab */}
        {activeTab === 'quotations' && (
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="md">Daftar Quotations</Heading>
              <HStack spacing={3}>
                <Select placeholder="Filter Status" maxW="200px">
                  <option value="negotiating">Negotiating</option>
                  <option value="approved">Approved</option>
                  <option value="review">Under Review</option>
                </Select>
                <Input placeholder="Cari quotation..." maxW="250px" />
              </HStack>
            </Flex>
            
            {dummyQuotations.map((quotation) => (
              <Card key={quotation.id}>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="lg" fontWeight="bold">{quotation.id}</Text>
                        <Text fontSize="md" color="blue.600">{quotation.projectName}</Text>
                      </VStack>
                      <VStack align="end" spacing={2}>
                        <Badge colorScheme={getStatusColor(quotation.status)}>
                          {quotation.status}
                        </Badge>
                        <Text fontSize="sm" color="gray.500">Round {quotation.negotiationRounds}</Text>
                      </VStack>
                    </Flex>
                    
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Category</Text>
                        <Badge variant="outline">{quotation.category}</Badge>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Vendors</Text>
                        <HStack>
                          <Icon as={FiUsers} boxSize={4} color="gray.400" />
                          <Text fontSize="sm">{quotation.totalVendors} vendors</Text>
                        </HStack>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Best Offer</Text>
                        <Text fontSize="sm" fontWeight="medium">{quotation.bestOffer}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Savings</Text>
                        <HStack>
                          <Icon as={FiTrendingDown} color="green.500" boxSize={4} />
                          <Text fontSize="sm" color="green.600" fontWeight="medium">{quotation.savings}</Text>
                        </HStack>
                      </VStack>
                    </SimpleGrid>
                    
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.500">Negotiation Progress</Text>
                        <Text fontSize="sm" fontWeight="medium">{quotation.progress}%</Text>
                      </HStack>
                      <Progress 
                        value={quotation.progress} 
                        colorScheme={getStatusColor(quotation.status)} 
                        size="sm" 
                        borderRadius="lg"
                      />
                      <HStack justify="space-between" fontSize="sm">
                        <Text color="gray.500">Deadline: {quotation.deadline}</Text>
                        <Text color="gray.500">Request: {quotation.requestDate}</Text>
                      </HStack>
                    </VStack>
                    
                    <HStack spacing={2} justify="end">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        colorScheme="purple"
                        onClick={() => {
                          setSelectedQuotation(quotation.id)
                          setActiveTab('negotiations')
                        }}
                      >
                        Compare Vendors
                      </Button>
                      <Button size="sm" variant="ghost" colorScheme="blue">
                        View Details
                      </Button>
                      <Button size="sm" variant="ghost" colorScheme="green">
                        Send Message
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}

        {/* Vendor Comparison Tab */}
        {activeTab === 'negotiations' && (
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size="md">Vendor Comparison</Heading>
                <Text fontSize="sm" color="gray.600">Quotation: {selectedQuotation}</Text>
              </VStack>
              <HStack spacing={3}>
                <Select 
                  value={selectedQuotation}
                  onChange={(e) => setSelectedQuotation(e.target.value)}
                  maxW="200px"
                >
                  {dummyQuotations.map(q => (
                    <option key={q.id} value={q.id}>{q.id} - {q.projectName}</option>
                  ))}
                </Select>
                <Button leftIcon={<Icon as={FiMessageSquare} />} colorScheme="green" size="sm">
                  Send Counter Offer
                </Button>
              </HStack>
            </Flex>
            
            <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={4}>
              {currentVendors.map((vendor) => (
                <Card key={vendor.id} variant={vendor.status === 'Best Offer' ? 'solid' : 'outline'}>
                  <CardHeader pb={3}>
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">{vendor.name}</Text>
                        <Text fontSize="sm" color="gray.500">{vendor.id}</Text>
                      </VStack>
                      <Badge colorScheme={getStatusColor(vendor.status)} variant="solid">
                        {vendor.status}
                      </Badge>
                    </Flex>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.500">Current Offer</Text>
                          <Text fontSize="lg" fontWeight="bold" color="blue.600">
                            {vendor.offerPrice}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.500">Original Price</Text>
                          <Text fontSize="sm" textDecoration="line-through" color="gray.400">
                            {vendor.originalPrice}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.500">Delivery Time</Text>
                          <Text fontSize="sm">{vendor.deliveryTime}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.500">Rating</Text>
                          <HStack>
                            <Text fontSize="sm" fontWeight="medium">{vendor.rating}</Text>
                            <Text fontSize="xs" color="yellow.500">★★★★★</Text>
                          </HStack>
                        </HStack>
                      </VStack>

                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Negotiation History</Text>
                        <VStack spacing={2} align="stretch">
                          {vendor.negotiationHistory.map((history, index) => (
                            <HStack key={index} justify="space-between" fontSize="sm">
                              <Text color="gray.500">Round {history.round}</Text>
                              <Text>{history.price}</Text>
                              <Text color="gray.400">{history.date}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>

                      <HStack spacing={2}>
                        {vendor.status !== 'Rejected' && (
                          <Button size="sm" colorScheme="blue" variant="outline" flex={1}>
                            Negotiate
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          colorScheme={vendor.status === 'Best Offer' ? 'green' : 'gray'} 
                          variant={vendor.status === 'Best Offer' ? 'solid' : 'outline'}
                          flex={1}
                        >
                          {vendor.status === 'Best Offer' ? 'Accept' : 'Reject'}
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}