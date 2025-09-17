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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
} from '@chakra-ui/react'
import { 
  FiDownload,
  FiBarChart,
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiFilter,
  FiEye
} from 'react-icons/fi'
import { useState } from 'react'

// Dummy data untuk berbagai jenis report
const projectSummary = {
  totalProjects: 24,
  completedProjects: 18,
  activeProjects: 4,
  onHoldProjects: 2,
  totalValue: 4200000000,
  completedValue: 3150000000,
  averageCompletion: 78,
  onTimeCompletion: 85
}

const monthlySummary = [
  { month: 'Jan 2024', projects: 3, completed: 2, value: 650000000, efficiency: 87 },
  { month: 'Feb 2024', projects: 4, completed: 3, value: 820000000, efficiency: 92 },
  { month: 'Mar 2024', projects: 2, completed: 2, value: 450000000, efficiency: 95 },
  { month: 'Apr 2024', projects: 3, completed: 1, value: 720000000, efficiency: 73 },
  { month: 'May 2024', projects: 5, completed: 4, value: 980000000, efficiency: 88 },
  { month: 'Jun 2024', projects: 7, completed: 6, value: 1320000000, efficiency: 91 }
]

const vendorPerformance = [
  { 
    name: 'PT. Spare Part Marine', 
    totalOrders: 15, 
    onTimeDelivery: 93, 
    qualityScore: 4.8, 
    totalValue: 850000000,
    status: 'Excellent'
  },
  { 
    name: 'CV. Baut Kapal Sejahtera', 
    totalOrders: 8, 
    onTimeDelivery: 87, 
    qualityScore: 4.5, 
    totalValue: 420000000,
    status: 'Good'
  },
  { 
    name: 'PT. Cat Maritime', 
    totalOrders: 12, 
    onTimeDelivery: 91, 
    qualityScore: 4.6, 
    totalValue: 650000000,
    status: 'Excellent'
  },
  { 
    name: 'PT. Hydraulic Supply', 
    totalOrders: 5, 
    onTimeDelivery: 78, 
    qualityScore: 4.2, 
    totalValue: 285000000,
    status: 'Average'
  }
]

const financialSummary = {
  totalBudget: 5000000000,
  actualSpent: 3850000000,
  pendingPayments: 420000000,
  costSavings: 185000000,
  budgetUtilization: 77,
  averageProjectMargin: 18.5
}

const workforceAnalytics = {
  totalTechnicians: 18,
  activeTechnicians: 15,
  avgEfficiency: 87,
  totalWorkHours: 2840,
  completedTasks: 156,
  pendingTasks: 23,
  avgTaskCompletion: 4.2 // hours
}

const materialUsage = [
  { category: 'Engine Parts', used: 85, stock: 245, value: 650000000 },
  { category: 'Hull Materials', used: 67, stock: 189, value: 890000000 },
  { category: 'Electrical Components', used: 43, stock: 156, value: 420000000 },
  { category: 'Paints & Coatings', used: 29, stock: 98, value: 285000000 },
  { category: 'Fasteners', used: 156, stock: 425, value: 125000000 }
]

const formatCurrency = (amount: number) => {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}B`
  } else if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}M`
  } else {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }
}

const getPerformanceColor = (score: number, threshold: number = 80) => {
  if (score >= 90) return 'green'
  if (score >= threshold) return 'yellow'
  return 'red'
}

export default function ReportingModule() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('6-months')

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Reporting & Analytics</Heading>
            <Text color="gray.600">Comprehensive reports dan analytics untuk monitoring proyek docking</Text>
          </VStack>
          <HStack spacing={3}>
            <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} maxW="150px" size="sm">
              <option value="1-month">1 Month</option>
              <option value="3-months">3 Months</option>
              <option value="6-months">6 Months</option>
              <option value="1-year">1 Year</option>
            </Select>
            <Button leftIcon={<Icon as={FiRefreshCw} />} colorScheme="blue" variant="outline" size="sm">
              Refresh
            </Button>
            <Button leftIcon={<Icon as={FiDownload} />} colorScheme="green">
              Export All Reports
            </Button>
          </HStack>
        </Flex>

        {/* Tabs */}
        <HStack spacing={4} borderBottom="1px" borderColor="gray.200" pb={4}>
          <Button
            variant={activeTab === 'overview' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('overview')}
          >
            <Icon as={FiBarChart} mr={2} />
            Overview
          </Button>
          <Button
            variant={activeTab === 'projects' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('projects')}
          >
            <Icon as={FiPieChart} mr={2} />
            Project Analytics
          </Button>
          <Button
            variant={activeTab === 'financial' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('financial')}
          >
            <Icon as={FiDollarSign} mr={2} />
            Financial Reports
          </Button>
          <Button
            variant={activeTab === 'operational' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('operational')}
          >
            <Icon as={FiUsers} mr={2} />
            Operational
          </Button>
        </HStack>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <VStack spacing={6} align="stretch">
            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <Heading size="md">Key Performance Indicators</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                  <Stat>
                    <StatLabel>Project Completion Rate</StatLabel>
                    <StatNumber>{projectSummary.onTimeCompletion}%</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      +5% from last quarter
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Total Project Value</StatLabel>
                    <StatNumber>{formatCurrency(projectSummary.totalValue)}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      {formatCurrency(projectSummary.completedValue)} completed
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Active Projects</StatLabel>
                    <StatNumber>{projectSummary.activeProjects}</StatNumber>
                    <StatHelpText>
                      {projectSummary.totalProjects} total projects
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Cost Savings</StatLabel>
                    <StatNumber>{formatCurrency(financialSummary.costSavings)}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      8.2% optimization
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Monthly Performance Trends</Heading>
                  <Button size="sm" leftIcon={<Icon as={FiDownload} />} variant="outline">
                    Export Chart
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {monthlySummary.map((month, index) => (
                    <Card key={index} variant="outline">
                      <CardBody py={3}>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{month.month}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {month.completed}/{month.projects} projects completed
                            </Text>
                          </VStack>
                          <HStack spacing={6}>
                            <VStack align="center" spacing={1}>
                              <Text fontSize="sm" color="gray.500">Value</Text>
                              <Text fontWeight="medium">{formatCurrency(month.value)}</Text>
                            </VStack>
                            <VStack align="center" spacing={1}>
                              <Text fontSize="sm" color="gray.500">Efficiency</Text>
                              <Badge colorScheme={getPerformanceColor(month.efficiency)}>
                                {month.efficiency}%
                              </Badge>
                            </VStack>
                            <Box>
                              <Progress
                                value={(month.completed / month.projects) * 100}
                                colorScheme="green"
                                size="sm"
                                w="100px"
                                borderRadius="md"
                              />
                            </Box>
                          </HStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        )}

        {/* Project Analytics Tab */}
        {activeTab === 'projects' && (
          <VStack spacing={6} align="stretch">
            {/* Project Status Distribution */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card>
                <CardHeader>
                  <Heading size="md">Project Status Distribution</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <HStack justify="space-between" w="full">
                      <HStack>
                        <Box w={4} h={4} bg="green.500" borderRadius="sm" />
                        <Text fontSize="sm">Completed</Text>
                      </HStack>
                      <Text fontWeight="medium">{projectSummary.completedProjects}</Text>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <HStack>
                        <Box w={4} h={4} bg="blue.500" borderRadius="sm" />
                        <Text fontSize="sm">Active</Text>
                      </HStack>
                      <Text fontWeight="medium">{projectSummary.activeProjects}</Text>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <HStack>
                        <Box w={4} h={4} bg="yellow.500" borderRadius="sm" />
                        <Text fontSize="sm">On Hold</Text>
                      </HStack>
                      <Text fontWeight="medium">{projectSummary.onHoldProjects}</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="medium">Total Projects</Text>
                      <Text fontWeight="bold">{projectSummary.totalProjects}</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size="md">Project Value Analysis</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Total Value</Text>
                      <Text fontWeight="bold">{formatCurrency(projectSummary.totalValue)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Completed Value</Text>
                      <Text fontWeight="medium" color="green.600">
                        {formatCurrency(projectSummary.completedValue)}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Remaining Value</Text>
                      <Text fontWeight="medium" color="blue.600">
                        {formatCurrency(projectSummary.totalValue - projectSummary.completedValue)}
                      </Text>
                    </HStack>
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" color="gray.500">Completion Progress</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {Math.round((projectSummary.completedValue / projectSummary.totalValue) * 100)}%
                        </Text>
                      </HStack>
                      <Progress
                        value={(projectSummary.completedValue / projectSummary.totalValue) * 100}
                        colorScheme="green"
                        size="md"
                        borderRadius="md"
                      />
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Vendor Performance */}
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Vendor Performance Analysis</Heading>
                  <Button size="sm" leftIcon={<Icon as={FiDownload} />} variant="outline">
                    Export Vendor Report
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {vendorPerformance.map((vendor, index) => (
                    <Card key={index} variant="outline">
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <Text fontWeight="bold">{vendor.name}</Text>
                            <Badge colorScheme={getPerformanceColor(vendor.onTimeDelivery)}>
                              {vendor.status}
                            </Badge>
                          </HStack>
                          
                          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" color="gray.500">Total Orders</Text>
                              <Text fontWeight="medium">{vendor.totalOrders}</Text>
                            </VStack>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" color="gray.500">On-Time Delivery</Text>
                              <Text fontWeight="medium" color={getPerformanceColor(vendor.onTimeDelivery) + '.500'}>
                                {vendor.onTimeDelivery}%
                              </Text>
                            </VStack>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" color="gray.500">Quality Score</Text>
                              <HStack>
                                <Text fontWeight="medium">{vendor.qualityScore}</Text>
                                <Text fontSize="xs" color="yellow.500">★★★★★</Text>
                              </HStack>
                            </VStack>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" color="gray.500">Total Value</Text>
                              <Text fontWeight="medium">{formatCurrency(vendor.totalValue)}</Text>
                            </VStack>
                          </SimpleGrid>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        )}

        {/* Financial Reports Tab */}
        {activeTab === 'financial' && (
          <VStack spacing={6} align="stretch">
            {/* Financial Overview */}
            <Card>
              <CardHeader>
                <Heading size="md">Financial Overview</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <Stat>
                    <StatLabel>Budget Utilization</StatLabel>
                    <StatNumber>{financialSummary.budgetUtilization}%</StatNumber>
                    <StatHelpText>
                      {formatCurrency(financialSummary.actualSpent)} of {formatCurrency(financialSummary.totalBudget)}
                    </StatHelpText>
                    <Progress
                      value={financialSummary.budgetUtilization}
                      colorScheme="blue"
                      size="sm"
                      mt={2}
                      borderRadius="md"
                    />
                  </Stat>
                  <Stat>
                    <StatLabel>Pending Payments</StatLabel>
                    <StatNumber>{formatCurrency(financialSummary.pendingPayments)}</StatNumber>
                    <StatHelpText>Awaiting processing</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Average Project Margin</StatLabel>
                    <StatNumber>{financialSummary.averageProjectMargin}%</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      +2.3% from last quarter
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Cost Breakdown */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card>
                <CardHeader>
                  <Heading size="md">Cost Breakdown by Category</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {materialUsage.map((item, index) => (
                      <VStack key={index} align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">{item.category}</Text>
                          <Text fontWeight="bold">{formatCurrency(item.value)}</Text>
                        </HStack>
                        <Progress
                          value={(item.value / 2370000000) * 100} // Total dari semua nilai
                          colorScheme="purple"
                          size="sm"
                          borderRadius="md"
                        />
                        <HStack justify="space-between" fontSize="sm" color="gray.500">
                          <Text>Used: {item.used} units</Text>
                          <Text>Stock: {item.stock} units</Text>
                        </HStack>
                      </VStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size="md">Payment Status Summary</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiCheckCircle} color="green.500" />
                          <Text>Completed Payments</Text>
                        </HStack>
                        <Text fontWeight="bold" color="green.600">
                          {formatCurrency(financialSummary.actualSpent - financialSummary.pendingPayments)}
                        </Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiClock} color="yellow.500" />
                          <Text>Pending Payments</Text>
                        </HStack>
                        <Text fontWeight="bold" color="yellow.600">
                          {formatCurrency(financialSummary.pendingPayments)}
                        </Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiTrendingDown} color="green.500" />
                          <Text>Cost Savings</Text>
                        </HStack>
                        <Text fontWeight="bold" color="green.600">
                          {formatCurrency(financialSummary.costSavings)}
                        </Text>
                      </HStack>
                    </VStack>

                    <Divider />

                    <HStack justify="space-between">
                      <Text fontWeight="bold">Remaining Budget</Text>
                      <Text fontWeight="bold" fontSize="lg" color="blue.600">
                        {formatCurrency(financialSummary.totalBudget - financialSummary.actualSpent)}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        )}

        {/* Operational Tab */}
        {activeTab === 'operational' && (
          <VStack spacing={6} align="stretch">
            {/* Workforce Analytics */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card>
                <CardHeader>
                  <Heading size="md">Workforce Analytics</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text>Total Technicians</Text>
                      <Badge colorScheme="blue" variant="solid">{workforceAnalytics.totalTechnicians}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Active Today</Text>
                      <Badge colorScheme="green" variant="solid">{workforceAnalytics.activeTechnicians}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Average Efficiency</Text>
                      <Badge colorScheme={getPerformanceColor(workforceAnalytics.avgEfficiency)}>
                        {workforceAnalytics.avgEfficiency}%
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Total Work Hours</Text>
                      <Text fontWeight="medium">{workforceAnalytics.totalWorkHours}h</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Avg Task Completion</Text>
                      <Text fontWeight="medium">{workforceAnalytics.avgTaskCompletion}h</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size="md">Task Management Summary</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Stat textAlign="center">
                      <StatLabel>Task Completion Rate</StatLabel>
                      <StatNumber>
                        {Math.round((workforceAnalytics.completedTasks / 
                          (workforceAnalytics.completedTasks + workforceAnalytics.pendingTasks)) * 100)}%
                      </StatNumber>
                      <StatHelpText>
                        {workforceAnalytics.completedTasks} completed, {workforceAnalytics.pendingTasks} pending
                      </StatHelpText>
                    </Stat>

                    <Box>
                      <Progress
                        value={(workforceAnalytics.completedTasks / 
                          (workforceAnalytics.completedTasks + workforceAnalytics.pendingTasks)) * 100}
                        colorScheme="green"
                        size="lg"
                        borderRadius="md"
                      />
                    </Box>

                    <SimpleGrid columns={2} spacing={4}>
                      <VStack>
                        <Icon as={FiCheckCircle} color="green.500" boxSize={6} />
                        <Text fontSize="sm" color="gray.500">Completed</Text>
                        <Text fontSize="lg" fontWeight="bold">{workforceAnalytics.completedTasks}</Text>
                      </VStack>
                      <VStack>
                        <Icon as={FiClock} color="yellow.500" boxSize={6} />
                        <Text fontSize="sm" color="gray.500">Pending</Text>
                        <Text fontSize="lg" fontWeight="bold">{workforceAnalytics.pendingTasks}</Text>
                      </VStack>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Material Usage Analysis */}
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Material Usage & Inventory Analysis</Heading>
                  <Button size="sm" leftIcon={<Icon as={FiDownload} />} variant="outline">
                    Export Inventory Report
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {materialUsage.map((material, index) => (
                    <Card key={index} variant="outline">
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <Text fontWeight="bold" textAlign="center">{material.category}</Text>
                          
                          <VStack spacing={2} align="stretch">
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.500">Used</Text>
                              <Text fontWeight="medium">{material.used} units</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.500">In Stock</Text>
                              <Text fontWeight="medium">{material.stock} units</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.500">Value</Text>
                              <Text fontWeight="bold" color="green.600">
                                {formatCurrency(material.value)}
                              </Text>
                            </HStack>
                          </VStack>

                          <Box>
                            <HStack justify="space-between" mb={1}>
                              <Text fontSize="sm" color="gray.500">Usage Rate</Text>
                              <Text fontSize="sm" fontWeight="medium">
                                {Math.round((material.used / (material.used + material.stock)) * 100)}%
                              </Text>
                            </HStack>
                            <Progress
                              value={(material.used / (material.used + material.stock)) * 100}
                              colorScheme={material.stock < 100 ? 'red' : 'blue'}
                              size="sm"
                              borderRadius="md"
                            />
                          </Box>

                          {material.stock < 100 && (
                            <HStack>
                              <Icon as={FiAlertTriangle} color="red.500" boxSize={4} />
                              <Text fontSize="sm" color="red.500">Low Stock Alert</Text>
                            </HStack>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
          </VStack>
        )}

        {/* Export Options */}
        <Card>
          <CardHeader>
            <Heading size="md">Export Options</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <Button leftIcon={<Icon as={FiDownload} />} colorScheme="blue" variant="outline">
                Project Summary (PDF)
              </Button>
              <Button leftIcon={<Icon as={FiDownload} />} colorScheme="green" variant="outline">
                Financial Report (Excel)
              </Button>
              <Button leftIcon={<Icon as={FiDownload} />} colorScheme="purple" variant="outline">
                Vendor Analysis (PDF)
              </Button>
              <Button leftIcon={<Icon as={FiDownload} />} colorScheme="orange" variant="outline">
                Operational Data (CSV)
              </Button>
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}