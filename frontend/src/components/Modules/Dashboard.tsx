'use client'

import {
  Box,
  Button,
  Badge,
  HStack,
  VStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Flex,
  Icon,
  SimpleGrid,
  Progress,
} from '@chakra-ui/react'
import { 
  FiTrendingUp, 
  FiDollarSign, 
  FiPackage, 
  FiUsers, 
  FiActivity, 
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiDownload
} from 'react-icons/fi'

const recentProjects = [
  {
    id: 'PRJ-001',
    name: 'KM. Sinar Jaya',
    status: 'In Progress',
    progress: 75,
    deadline: '2024-02-28',
    value: 'Rp 250M'
  },
  {
    id: 'PRJ-002',
    name: 'KM. Bahari Indah', 
    status: 'Planning',
    progress: 25,
    deadline: '2024-03-15',
    value: 'Rp 180M'
  },
  {
    id: 'PRJ-003',
    name: 'KM. Samudra Baru',
    status: 'Completed',
    progress: 100,
    deadline: '2024-01-10',
    value: 'Rp 320M'
  }
]

const recentActivities = [
  {
    id: 1,
    type: 'survey',
    description: 'Survey SUR-003 untuk KM. Nusantara Jaya telah diselesaikan',
    time: '2 jam yang lalu',
    user: 'Citra Dewi'
  },
  {
    id: 2,
    type: 'po',
    description: 'PO-003 untuk PT. Cat Maritime telah di-approve',
    time: '4 jam yang lalu',
    user: 'Manager Procurement'
  },
  {
    id: 3,
    type: 'project',
    description: 'Progress PRJ-001 diupdate menjadi 75%',
    time: '6 jam yang lalu',
    user: 'Ahmad Surya'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'green'
    case 'In Progress':
      return 'blue'
    case 'Planning':
      return 'yellow'
    default:
      return 'gray'
  }
}

export default function DashboardModule() {
  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Dashboard</Heading>
            <Text color="gray.600">Overview monitoring proyek pekerjaan docking kapal</Text>
          </VStack>
          <HStack spacing={3}>
            <Button leftIcon={<Icon as={FiDownload} />} colorScheme="blue" variant="outline" size="sm">
              Export Report
            </Button>
          </HStack>
        </Flex>

        {/* Overview Stats */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Card>
            <CardBody>
              <HStack spacing={4}>
                <Box p={3} bg="blue.100" borderRadius="lg">
                  <Icon as={FiActivity} boxSize={6} color="blue.600" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Total Proyek</Text>
                  <Text fontSize="2xl" fontWeight="bold">12</Text>
                  <HStack>
                    <Icon as={FiTrendingUp} color="green.500" boxSize={4} />
                    <Text fontSize="xs" color="green.500">+15% dari bulan lalu</Text>
                  </HStack>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <HStack spacing={4}>
                <Box p={3} bg="green.100" borderRadius="lg">
                  <Icon as={FiDollarSign} boxSize={6} color="green.600" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Total Nilai Proyek</Text>
                  <Text fontSize="2xl" fontWeight="bold">Rp 2.1B</Text>
                  <HStack>
                    <Icon as={FiTrendingUp} color="green.500" boxSize={4} />
                    <Text fontSize="xs" color="green.500">+8% YTD</Text>
                  </HStack>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <HStack spacing={4}>
                <Box p={3} bg="purple.100" borderRadius="lg">
                  <Icon as={FiPackage} boxSize={6} color="purple.600" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Purchase Orders</Text>
                  <Text fontSize="2xl" fontWeight="bold">24</Text>
                  <HStack>
                    <Badge colorScheme="purple" variant="subtle">5 pending</Badge>
                  </HStack>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <HStack spacing={4}>
                <Box p={3} bg="orange.100" borderRadius="lg">
                  <Icon as={FiUsers} boxSize={6} color="orange.600" />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Active Vendors</Text>
                  <Text fontSize="2xl" fontWeight="bold">18</Text>
                  <HStack>
                    <Badge colorScheme="green" variant="subtle">All verified</Badge>
                  </HStack>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md">Proyek Terkini</Heading>
                <Button size="sm" variant="ghost" colorScheme="blue">
                  Lihat Semua
                </Button>
              </Flex>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                {recentProjects.map((project) => (
                  <Card key={project.id} variant="outline" size="sm">
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold">{project.name}</Text>
                            <Text fontSize="sm" color="gray.500">{project.id}</Text>
                          </VStack>
                          <Badge colorScheme={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </Flex>
                        
                        <VStack spacing={2} align="stretch">
                          <HStack justify="space-between">
                            <Text fontSize="sm">Progress</Text>
                            <Text fontSize="sm" fontWeight="medium">{project.progress}%</Text>
                          </HStack>
                          <Progress 
                            value={project.progress} 
                            colorScheme={getStatusColor(project.status)} 
                            size="sm" 
                            borderRadius="lg"
                          />
                        </VStack>
                        
                        <HStack justify="space-between" fontSize="sm">
                          <Text color="gray.500">Deadline: {project.deadline}</Text>
                          <Text fontWeight="medium">{project.value}</Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md">Aktivitas Terkini</Heading>
                <Button size="sm" variant="ghost" colorScheme="blue">
                  Lihat Semua
                </Button>
              </Flex>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                {recentActivities.map((activity) => (
                  <HStack key={activity.id} spacing={4} align="start">
                    <Box 
                      p={2} 
                      bg={activity.type === 'survey' ? 'blue.100' : activity.type === 'po' ? 'green.100' : 'purple.100'}
                      borderRadius="lg"
                      flexShrink={0}
                    >
                      <Icon 
                        as={activity.type === 'survey' ? FiCheckCircle : activity.type === 'po' ? FiPackage : FiClock}
                        boxSize={4}
                        color={activity.type === 'survey' ? 'blue.600' : activity.type === 'po' ? 'green.600' : 'purple.600'}
                      />
                    </Box>
                    <VStack align="start" spacing={1} flex="1">
                      <Text fontSize="sm">{activity.description}</Text>
                      <HStack spacing={2}>
                        <Text fontSize="xs" color="gray.500">{activity.time}</Text>
                        <Text fontSize="xs" color="gray.400">•</Text>
                        <Text fontSize="xs" color="blue.600">{activity.user}</Text>
                      </HStack>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Status Summary Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card>
            <CardHeader pb={3}>
              <Heading size="sm">Status Proyek</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <HStack>
                    <Box w={3} h={3} bg="green.500" borderRadius="full" />
                    <Text fontSize="sm">Completed</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="medium">4</Text>
                </HStack>
                <HStack justify="space-between">
                  <HStack>
                    <Box w={3} h={3} bg="blue.500" borderRadius="full" />
                    <Text fontSize="sm">In Progress</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="medium">5</Text>
                </HStack>
                <HStack justify="space-between">
                  <HStack>
                    <Box w={3} h={3} bg="yellow.500" borderRadius="full" />
                    <Text fontSize="sm">Planning</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="medium">3</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader pb={3}>
              <Heading size="sm">Alerts & Notifications</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={3} align="stretch">
                <HStack>
                  <Icon as={FiAlertTriangle} color="red.500" boxSize={4} />
                  <Text fontSize="sm">2 proyek mendekati deadline</Text>
                </HStack>
                <HStack>
                  <Icon as={FiClock} color="yellow.500" boxSize={4} />
                  <Text fontSize="sm">5 PO menunggu approval</Text>
                </HStack>
                <HStack>
                  <Icon as={FiCheckCircle} color="green.500" boxSize={4} />
                  <Text fontSize="sm">3 survey selesai hari ini</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader pb={3}>
              <Heading size="sm">Quick Actions</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={2} align="stretch">
                <Button size="sm" colorScheme="blue" variant="outline">
                  Buat Proyek Baru
                </Button>
                <Button size="sm" colorScheme="green" variant="outline">
                  Tambah Survey
                </Button>
                <Button size="sm" colorScheme="purple" variant="outline">
                  Generate Report
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}