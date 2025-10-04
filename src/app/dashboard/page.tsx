'use client'

import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  Heading,
  Text,
  Progress,
  VStack,
  HStack,
  Icon,
  Badge,
  Flex,
  Container,
} from '@chakra-ui/react'
import {
  FiHome,
  FiUsers,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi'
import MainLayout from '@/components/Layout/MainLayout'

const StatCard = ({ title, stat, icon, helpText, change }: any) => (
  <Card>
    <CardBody>
      <Stat>
        <Flex align="center" justify="space-between">
          <Box>
            <StatLabel color="gray.500">{title}</StatLabel>
            <StatNumber fontSize="2xl">{stat}</StatNumber>
            <StatHelpText>
              {change && (
                <StatArrow type={change.type} />
              )}
              {helpText}
            </StatHelpText>
          </Box>
          <Box
            p={3}
            borderRadius="lg"
            bg="blue.50"
            color="blue.500"
          >
            <Icon as={icon} boxSize={6} />
          </Box>
        </Flex>
      </Stat>
    </CardBody>
  </Card>
)

export default function Dashboard() {
  const breadcrumbs = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Dashboard' }
  ]

  return (
    <MainLayout currentModule="dashboard" breadcrumbs={breadcrumbs}>
      <Container maxW="full" py={6}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" mb={2}>Dashboard Overview</Heading>
            <Text color="gray.600">
              Welcome to your project monitoring dashboard
            </Text>
          </Box>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <StatCard
              title="Total Projects"
              stat="24"
              icon={FiHome}
              helpText="8 active projects"
              change={{ type: "increase" }}
            />
            <StatCard
              title="Work Items"
              stat="156"
              icon={FiPackage}
              helpText="12 completed today"
              change={{ type: "increase" }}
            />
            <StatCard
              title="Team Members"
              stat="32"
              icon={FiUsers}
              helpText="5 online now"
            />
            <StatCard
              title="Total Revenue"
              stat="Rp 2.4M"
              icon={FiDollarSign}
              helpText="This month"
              change={{ type: "increase" }}
            />
          </SimpleGrid>

          {/* Progress and Recent Activity */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Project Progress */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Project Progress</Heading>
                  
                  <VStack spacing={3} align="stretch">
                    <Box>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm">Ship Docking - MV Ocean Star</Text>
                        <Text fontSize="sm" color="gray.500">85%</Text>
                      </Flex>
                      <Progress value={85} colorScheme="green" size="sm" />
                    </Box>

                    <Box>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm">Hull Inspection - MT Pacific</Text>
                        <Text fontSize="sm" color="gray.500">60%</Text>
                      </Flex>
                      <Progress value={60} colorScheme="blue" size="sm" />
                    </Box>

                    <Box>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm">Engine Maintenance - MV Atlantic</Text>
                        <Text fontSize="sm" color="gray.500">30%</Text>
                      </Flex>
                      <Progress value={30} colorScheme="yellow" size="sm" />
                    </Box>

                    <Box>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm">Survey Report - SS Navigator</Text>
                        <Text fontSize="sm" color="gray.500">90%</Text>
                      </Flex>
                      <Progress value={90} colorScheme="green" size="sm" />
                    </Box>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Recent Activity</Heading>
                  
                  <VStack spacing={3} align="stretch">
                    <HStack spacing={3}>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Box flex={1}>
                        <Text fontSize="sm">Hull inspection completed</Text>
                        <Text fontSize="xs" color="gray.500">MV Ocean Star • 2 hours ago</Text>
                      </Box>
                      <Badge colorScheme="green">Completed</Badge>
                    </HStack>

                    <HStack spacing={3}>
                      <Icon as={FiClock} color="blue.500" />
                      <Box flex={1}>
                        <Text fontSize="sm">Dock booking confirmed</Text>
                        <Text fontSize="xs" color="gray.500">MT Pacific • 4 hours ago</Text>
                      </Box>
                      <Badge colorScheme="blue">Scheduled</Badge>
                    </HStack>

                    <HStack spacing={3}>
                      <Icon as={FiAlertCircle} color="orange.500" />
                      <Box flex={1}>
                        <Text fontSize="sm">Resource conflict detected</Text>
                        <Text fontSize="xs" color="gray.500">Team Alpha • 6 hours ago</Text>
                      </Box>
                      <Badge colorScheme="orange">Warning</Badge>
                    </HStack>

                    <HStack spacing={3}>
                      <Icon as={FiTrendingUp} color="purple.500" />
                      <Box flex={1}>
                        <Text fontSize="sm">New work item added</Text>
                        <Text fontSize="xs" color="gray.500">SS Navigator • 8 hours ago</Text>
                      </Box>
                      <Badge colorScheme="purple">New</Badge>
                    </HStack>

                    <HStack spacing={3}>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Box flex={1}>
                        <Text fontSize="sm">Survey report approved</Text>
                        <Text fontSize="xs" color="gray.500">MV Atlantic • 1 day ago</Text>
                      </Box>
                      <Badge colorScheme="green">Approved</Badge>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Quick Actions */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Quick Actions</Heading>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <VStack
                    p={4}
                    bg="blue.50"
                    borderRadius="lg"
                    cursor="pointer"
                    _hover={{ bg: "blue.100" }}
                    transition="all 0.2s"
                  >
                    <Icon as={FiPackage} color="blue.500" boxSize={8} />
                    <Text fontSize="sm" fontWeight="medium" textAlign="center">
                      Add Work Item
                    </Text>
                  </VStack>

                  <VStack
                    p={4}
                    bg="green.50"
                    borderRadius="lg"
                    cursor="pointer"
                    _hover={{ bg: "green.100" }}
                    transition="all 0.2s"
                  >
                    <Icon as={FiCheckCircle} color="green.500" boxSize={8} />
                    <Text fontSize="sm" fontWeight="medium" textAlign="center">
                      Update Progress
                    </Text>
                  </VStack>

                  <VStack
                    p={4}
                    bg="purple.50"
                    borderRadius="lg"
                    cursor="pointer"
                    _hover={{ bg: "purple.100" }}
                    transition="all 0.2s"
                  >
                    <Icon as={FiUsers} color="purple.500" boxSize={8} />
                    <Text fontSize="sm" fontWeight="medium" textAlign="center">
                      Assign Team
                    </Text>
                  </VStack>

                  <VStack
                    p={4}
                    bg="orange.50"
                    borderRadius="lg"
                    cursor="pointer"
                    _hover={{ bg: "orange.100" }}
                    transition="all 0.2s"
                  >
                    <Icon as={FiTrendingUp} color="orange.500" boxSize={8} />
                    <Text fontSize="sm" fontWeight="medium" textAlign="center">
                      Generate Report
                    </Text>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </MainLayout>
  )
}