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
  Select,
  Flex,
  Progress,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react'
import {
  FiDownload,
  FiPrinter,
  FiCalendar,
  FiBarChart,
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi'
import { useState } from 'react'
import MainLayout from '@/components/Layout/MainLayout'

export default function Reporting() {
  const [reportType, setReportType] = useState('monthly')
  const [dateRange, setDateRange] = useState('current')

  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Reporting' }
  ]

  const reports = [
    { id: 1, name: 'Monthly Progress Report', date: '2024-01-31', status: 'Ready', type: 'PDF' },
    { id: 2, name: 'Work Items Summary', date: '2024-01-30', status: 'Processing', type: 'Excel' },
    { id: 3, name: 'Team Performance Report', date: '2024-01-29', status: 'Ready', type: 'PDF' },
    { id: 4, name: 'Cost Analysis Report', date: '2024-01-28', status: 'Ready', type: 'Excel' },
  ]

  const projectSummary = [
    { project: 'MV Ocean Star Docking', progress: 85, status: 'On Track', due: '2024-02-15' },
    { project: 'MT Pacific Hull Repair', progress: 60, status: 'Delayed', due: '2024-02-20' },
    { project: 'SS Navigator Survey', progress: 90, status: 'Ahead', due: '2024-02-10' },
    { project: 'MV Atlantic Engine Fix', progress: 30, status: 'On Track', due: '2024-02-25' },
  ]

  return (
    <MainLayout currentModule="reporting" breadcrumbs={breadcrumbs}>
      <Container maxW="full" py={6}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" mb={2}>Reporting & Analytics</Heading>
              <Text color="gray.600">
                Generate reports and view project analytics
              </Text>
            </Box>
            <HStack>
              <Button leftIcon={<FiDownload />} colorScheme="blue">
                Export Report
              </Button>
              <Button leftIcon={<FiPrinter />} variant="outline">
                Print
              </Button>
            </HStack>
          </Flex>

          {/* Report Controls */}
          <Card>
            <CardBody>
              <HStack spacing={4} wrap="wrap">
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Report Type</Text>
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    minW="200px"
                  >
                    <option value="daily">Daily Report</option>
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                    <option value="quarterly">Quarterly Report</option>
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Date Range</Text>
                  <Select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    minW="200px"
                  >
                    <option value="current">Current Period</option>
                    <option value="previous">Previous Period</option>
                    <option value="ytd">Year to Date</option>
                    <option value="custom">Custom Range</option>
                  </Select>
                </Box>

                <Box alignSelf="end">
                  <Button leftIcon={<FiBarChart />} colorScheme="purple">
                    Generate
                  </Button>
                </Box>
              </HStack>
            </CardBody>
          </Card>

          {/* Key Metrics */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Projects Completed</StatLabel>
                  <StatNumber>23</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    23.36% from last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Average Progress</StatLabel>
                  <StatNumber>78%</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    8.2% from last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Team Efficiency</StatLabel>
                  <StatNumber>92%</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    5.1% from last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Cost Savings</StatLabel>
                  <StatNumber>Rp 2.3M</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    12.5% from last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Charts and Analytics */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Project Progress Chart */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md">Project Progress</Heading>
                    <Badge colorScheme="green">Live Data</Badge>
                  </HStack>
                  
                  <VStack spacing={3} align="stretch">
                    {projectSummary.map((project, index) => (
                      <Box key={index} p={3} bg="gray.50" borderRadius="md">
                        <VStack spacing={2} align="stretch">
                          <HStack justify="space-between">
                            <Text fontSize="sm" fontWeight="medium">{project.project}</Text>
                            <Badge
                              colorScheme={
                                project.status === 'On Track' ? 'green' :
                                project.status === 'Ahead' ? 'blue' : 'red'
                              }
                              size="sm"
                            >
                              {project.status}
                            </Badge>
                          </HStack>
                          <Progress
                            value={project.progress}
                            colorScheme={
                              project.progress >= 80 ? 'green' :
                              project.progress >= 50 ? 'blue' : 'red'
                            }
                            size="sm"
                          />
                          <HStack justify="space-between" fontSize="xs" color="gray.600">
                            <Text>{project.progress}% Complete</Text>
                            <Text>Due: {project.due}</Text>
                          </HStack>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Performance Metrics</Heading>
                  
                  <SimpleGrid columns={2} spacing={4}>
                    <Box textAlign="center" p={4} bg="blue.50" borderRadius="md">
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">156</Text>
                      <Text fontSize="sm" color="gray.600">Total Work Items</Text>
                    </Box>
                    
                    <Box textAlign="center" p={4} bg="green.50" borderRadius="md">
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">89%</Text>
                      <Text fontSize="sm" color="gray.600">Success Rate</Text>
                    </Box>
                    
                    <Box textAlign="center" p={4} bg="purple.50" borderRadius="md">
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">4.2</Text>
                      <Text fontSize="sm" color="gray.600">Avg Rating</Text>
                    </Box>
                    
                    <Box textAlign="center" p={4} bg="orange.50" borderRadius="md">
                      <Text fontSize="2xl" fontWeight="bold" color="orange.600">12</Text>
                      <Text fontSize="sm" color="gray.600">Active Teams</Text>
                    </Box>
                  </SimpleGrid>

                  <Box mt={4}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Resource Utilization</Text>
                    <VStack spacing={2}>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Dock A</Text>
                        <Text fontSize="sm">85%</Text>
                      </HStack>
                      <Progress value={85} colorScheme="blue" size="sm" w="full" />
                      
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Dock B</Text>
                        <Text fontSize="sm">67%</Text>
                      </HStack>
                      <Progress value={67} colorScheme="green" size="sm" w="full" />
                      
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Workshop</Text>
                        <Text fontSize="sm">92%</Text>
                      </HStack>
                      <Progress value={92} colorScheme="orange" size="sm" w="full" />
                    </VStack>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Generated Reports */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Generated Reports</Heading>
                  <Button size="sm" leftIcon={<FiCalendar />} variant="outline">
                    Schedule Report
                  </Button>
                </HStack>

                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Report Name</Th>
                        <Th>Date Generated</Th>
                        <Th>Status</Th>
                        <Th>Type</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {reports.map((report) => (
                        <Tr key={report.id}>
                          <Td fontWeight="medium">{report.name}</Td>
                          <Td>{report.date}</Td>
                          <Td>
                            <Badge
                              colorScheme={report.status === 'Ready' ? 'green' : 'yellow'}
                              size="sm"
                            >
                              {report.status}
                            </Badge>
                          </Td>
                          <Td>{report.type}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <Button size="sm" colorScheme="blue" variant="ghost">
                                <FiDownload />
                              </Button>
                              <Button size="sm" colorScheme="gray" variant="ghost">
                                <FiPrinter />
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