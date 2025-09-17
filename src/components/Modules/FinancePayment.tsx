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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react'
import { 
  FiPlus, 
  FiCreditCard, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiClock,
  FiAlertTriangle,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiDownload,
  FiUpload,
  FiEye,
  FiFileText
} from 'react-icons/fi'
import { useState } from 'react'

const dummyPaymentRequests = [
  {
    id: 'PAY-001',
    projectId: 'PRJ-001',
    projectName: 'KM. Sinar Jaya',
    poId: 'PO-001',
    vendor: 'PT. Spare Part Marine',
    amount: 85000000,
    requestDate: '2024-02-10',
    dueDate: '2024-02-25',
    status: 'Approved',
    sapStatus: 'Processed',
    approvedBy: 'Finance Manager',
    approvalDate: '2024-02-12',
    category: 'Materials',
    paymentMethod: 'Bank Transfer',
    description: 'Pembayaran spare parts untuk engine repair'
  },
  {
    id: 'PAY-002',
    projectId: 'PRJ-002',
    projectName: 'KM. Bahari Indah',
    poId: 'PO-002',
    vendor: 'CV. Baut Kapal Sejahtera',
    amount: 25000000,
    requestDate: '2024-02-15',
    dueDate: '2024-03-01',
    status: 'Pending Approval',
    sapStatus: 'Waiting',
    approvedBy: null,
    approvalDate: null,
    category: 'Materials',
    paymentMethod: 'Bank Transfer',
    description: 'Pembayaran hardware untuk hull repair'
  },
  {
    id: 'PAY-003',
    projectId: 'PRJ-001',
    projectName: 'KM. Sinar Jaya',
    poId: 'PO-003',
    vendor: 'PT. Cat Maritime',
    amount: 45000000,
    requestDate: '2024-02-18',
    dueDate: '2024-03-05',
    status: 'In Process',
    sapStatus: 'Processing',
    approvedBy: 'Finance Manager',
    approvalDate: '2024-02-20',
    category: 'Materials',
    paymentMethod: 'Bank Transfer',
    description: 'Pembayaran marine paint dan coating materials'
  },
  {
    id: 'PAY-004',
    projectId: 'PRJ-002',
    projectName: 'KM. Bahari Indah',
    poId: null,
    vendor: 'PT. Jasa Teknisi Kapal',
    amount: 75000000,
    requestDate: '2024-02-20',
    dueDate: '2024-03-10',
    status: 'Rejected',
    sapStatus: 'Failed',
    approvedBy: null,
    approvalDate: null,
    category: 'Services',
    paymentMethod: 'Bank Transfer',
    description: 'Pembayaran jasa teknisi untuk maintenance'
  }
]

const sapIntegrationStatus = {
  lastSync: '2024-02-21 14:30:00',
  totalSynced: 156,
  pendingSync: 8,
  failedSync: 2,
  connectionStatus: 'Connected'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved':
    case 'Processed':
    case 'Connected':
    case 'Paid':
      return 'green'
    case 'In Process':
    case 'Processing':
      return 'blue'
    case 'Pending Approval':
    case 'Waiting':
      return 'yellow'
    case 'Rejected':
    case 'Failed':
      return 'red'
    default:
      return 'gray'
  }
}

const formatCurrency = (amount: number) => {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

export default function FinancePaymentModule() {
  const [activeTab, setActiveTab] = useState('payments')

  const pendingApprovalCount = dummyPaymentRequests.filter(p => p.status === 'Pending Approval').length
  const totalPendingAmount = dummyPaymentRequests
    .filter(p => p.status === 'Pending Approval' || p.status === 'In Process')
    .reduce((sum, p) => sum + p.amount, 0)

  const monthlyPaid = dummyPaymentRequests
    .filter(p => p.status === 'Approved')
    .reduce((sum, p) => sum + p.amount, 0)

  const syncToSAP = (paymentId: string) => {
    console.log(`Syncing payment ${paymentId} to SAP...`)
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Finance & Payment</Heading>
            <Text color="gray.600">Kelola payment request, approval workflow, dan integrasi SAP</Text>
          </VStack>
          <HStack spacing={3}>
            <Button leftIcon={<Icon as={FiRefreshCw} />} colorScheme="orange" variant="outline" size="sm">
              Sync SAP
            </Button>
            <Button leftIcon={<Icon as={FiDownload} />} colorScheme="purple" variant="outline" size="sm">
              Export Report
            </Button>
            <Button leftIcon={<Icon as={FiPlus} />} colorScheme="blue">
              New Payment Request
            </Button>
          </HStack>
        </Flex>

        {/* SAP Connection Status */}
        <Alert 
          status={sapIntegrationStatus.connectionStatus === 'Connected' ? 'success' : 'warning'} 
          borderRadius="lg"
        >
          <AlertIcon />
          <VStack align="start" spacing={1} flex="1">
            <Text fontWeight="medium">
              SAP Integration: {sapIntegrationStatus.connectionStatus}
            </Text>
            <Text fontSize="sm">
              Last sync: {sapIntegrationStatus.lastSync} | 
              Pending: {sapIntegrationStatus.pendingSync} | 
              Failed: {sapIntegrationStatus.failedSync}
            </Text>
          </VStack>
          <Button size="sm" colorScheme="blue" variant="outline">
            View Details
          </Button>
        </Alert>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Pending Approval</StatLabel>
                <StatNumber color="orange.500">{pendingApprovalCount}</StatNumber>
                <StatHelpText>Payment requests</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Pending Amount</StatLabel>
                <StatNumber fontSize="lg">{formatCurrency(totalPendingAmount)}</StatNumber>
                <StatHelpText>Awaiting payment</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Paid This Month</StatLabel>
                <StatNumber fontSize="lg">{formatCurrency(monthlyPaid)}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  12.5% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>SAP Sync Rate</StatLabel>
                <StatNumber>
                  {Math.round((sapIntegrationStatus.totalSynced / 
                    (sapIntegrationStatus.totalSynced + sapIntegrationStatus.failedSync)) * 100)}%
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Success rate
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Tabs */}
        <HStack spacing={4} borderBottom="1px" borderColor="gray.200" pb={4}>
          <Button
            variant={activeTab === 'payments' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('payments')}
          >
            <Icon as={FiCreditCard} mr={2} />
            Payment Requests
          </Button>
          <Button
            variant={activeTab === 'sap-integration' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('sap-integration')}
          >
            <Icon as={FiRefreshCw} mr={2} />
            SAP Integration
          </Button>
        </HStack>

        {/* Payment Requests Tab */}
        {activeTab === 'payments' && (
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="md">Payment Requests</Heading>
              <HStack spacing={3}>
                <Select placeholder="Filter Status" maxW="200px">
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="process">In Process</option>
                  <option value="rejected">Rejected</option>
                </Select>
                <Select placeholder="Filter Category" maxW="180px">
                  <option value="materials">Materials</option>
                  <option value="services">Services</option>
                  <option value="other">Other</option>
                </Select>
                <Input placeholder="Search payments..." maxW="250px" />
              </HStack>
            </Flex>
            
            {dummyPaymentRequests.map((payment) => (
              <Card key={payment.id}>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="lg" fontWeight="bold">{payment.id}</Text>
                        <Text fontSize="md" color="blue.600">{payment.vendor}</Text>
                        <HStack>
                          <Text fontSize="sm" color="gray.600">{payment.projectName}</Text>
                          {payment.poId && (
                            <>
                              <Text fontSize="sm" color="gray.400">•</Text>
                              <Text fontSize="sm" color="gray.600">{payment.poId}</Text>
                            </>
                          )}
                        </HStack>
                      </VStack>
                      <VStack align="end" spacing={2}>
                        <Badge colorScheme={getStatusColor(payment.status)} variant="solid">
                          {payment.status}
                        </Badge>
                        <Badge 
                          colorScheme={getStatusColor(payment.sapStatus)} 
                          variant="outline"
                        >
                          SAP: {payment.sapStatus}
                        </Badge>
                      </VStack>
                    </Flex>
                    
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Amount</Text>
                        <Text fontSize="lg" fontWeight="bold" color="green.600">
                          {formatCurrency(payment.amount)}
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Category</Text>
                        <Badge variant="outline">{payment.category}</Badge>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Request Date</Text>
                        <Text fontSize="sm">{payment.requestDate}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Due Date</Text>
                        <Text fontSize="sm">{payment.dueDate}</Text>
                      </VStack>
                    </SimpleGrid>

                    {/* Description */}
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={1}>Description:</Text>
                      <Text fontSize="sm" color="gray.600">{payment.description}</Text>
                    </Box>

                    {/* Approval Info */}
                    {payment.approvedBy && (
                      <HStack justify="space-between" fontSize="sm" color="gray.500">
                        <Text>Approved by: {payment.approvedBy}</Text>
                        <Text>Date: {payment.approvalDate}</Text>
                      </HStack>
                    )}
                    
                    <HStack spacing={2} justify="end">
                      {payment.status === 'Pending Approval' && (
                        <>
                          <Button size="sm" colorScheme="red" variant="outline">
                            Reject
                          </Button>
                          <Button size="sm" colorScheme="green">
                            Approve
                          </Button>
                        </>
                      )}
                      {payment.sapStatus !== 'Processed' && payment.status === 'Approved' && (
                        <Button 
                          size="sm" 
                          leftIcon={<Icon as={FiRefreshCw} />}
                          colorScheme="orange" 
                          variant="outline"
                          onClick={() => syncToSAP(payment.id)}
                        >
                          Sync to SAP
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" colorScheme="blue">
                        <Icon as={FiEye} mr={2} />
                        Details
                      </Button>
                      <Button size="sm" variant="ghost" colorScheme="purple">
                        <Icon as={FiFileText} mr={2} />
                        Documents
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}

        {/* SAP Integration Tab */}
        {activeTab === 'sap-integration' && (
          <VStack spacing={6} align="stretch">
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">SAP Connection Status</Heading>
                  <Button leftIcon={<Icon as={FiRefreshCw} />} colorScheme="blue" size="sm">
                    Test Connection
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Connection Status</Text>
                      <Badge colorScheme={getStatusColor(sapIntegrationStatus.connectionStatus)} variant="solid">
                        {sapIntegrationStatus.connectionStatus}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Last Sync</Text>
                      <Text fontSize="sm">{sapIntegrationStatus.lastSync}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Total Synced</Text>
                      <Text fontSize="sm" fontWeight="medium" color="green.600">
                        {sapIntegrationStatus.totalSynced}
                      </Text>
                    </HStack>
                  </VStack>
                  
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Pending Sync</Text>
                      <Text fontSize="sm" fontWeight="medium" color="orange.600">
                        {sapIntegrationStatus.pendingSync}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Failed Sync</Text>
                      <Text fontSize="sm" fontWeight="medium" color="red.600">
                        {sapIntegrationStatus.failedSync}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Success Rate</Text>
                      <Text fontSize="sm" fontWeight="medium" color="green.600">
                        {Math.round((sapIntegrationStatus.totalSynced / 
                          (sapIntegrationStatus.totalSynced + sapIntegrationStatus.failedSync)) * 100)}%
                      </Text>
                    </HStack>
                  </VStack>
                </SimpleGrid>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size="md">Integration Actions</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">Sync All Pending</Text>
                      <Text fontSize="sm" color="gray.600">
                        Sync {sapIntegrationStatus.pendingSync} pending payment records to SAP
                      </Text>
                    </VStack>
                    <Button colorScheme="blue" leftIcon={<Icon as={FiRefreshCw} />}>
                      Sync Now
                    </Button>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">Retry Failed</Text>
                      <Text fontSize="sm" color="gray.600">
                        Retry {sapIntegrationStatus.failedSync} failed sync operations
                      </Text>
                    </VStack>
                    <Button colorScheme="orange" variant="outline" leftIcon={<Icon as={FiRefreshCw} />}>
                      Retry All
                    </Button>
                  </HStack>

                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">Export Integration Log</Text>
                      <Text fontSize="sm" color="gray.600">
                        Download detailed log of SAP integration activities
                      </Text>
                    </VStack>
                    <Button colorScheme="purple" variant="outline" leftIcon={<Icon as={FiDownload} />}>
                      Export Log
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size="md">Integration Settings</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" fontWeight="medium">Auto Sync</Text>
                      <Button size="sm" colorScheme="green" variant="outline">
                        Enabled
                      </Button>
                    </VStack>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" fontWeight="medium">Sync Interval</Text>
                      <Text fontSize="sm" color="gray.600">Every 30 minutes</Text>
                    </VStack>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" fontWeight="medium">Retry Attempts</Text>
                      <Text fontSize="sm" color="gray.600">3 times</Text>
                    </VStack>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" fontWeight="medium">Timeout</Text>
                      <Text fontSize="sm" color="gray.600">60 seconds</Text>
                    </VStack>
                  </SimpleGrid>
                  
                  <HStack justify="end" pt={4}>
                    <Button size="sm" variant="outline" colorScheme="gray">
                      Reset to Default
                    </Button>
                    <Button size="sm" colorScheme="blue">
                      Update Settings
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}