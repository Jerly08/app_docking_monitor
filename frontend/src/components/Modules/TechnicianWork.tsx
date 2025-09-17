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
  Image,
} from '@chakra-ui/react'
import { 
  FiPlus, 
  FiUsers, 
  FiCamera, 
  FiCheckCircle, 
  FiClock,
  FiTool,
  FiClipboard,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiPlay,
  FiPause,
  FiUpload
} from 'react-icons/fi'
import { useState } from 'react'

const dummyTechnicians = [
  {
    id: 'TECH-001',
    name: 'Ahmad Surya',
    specialization: 'Engine Specialist',
    level: 'Senior',
    activeTasks: 2,
    completedTasks: 28,
    rating: 4.9,
    status: 'Working',
    currentProject: 'PRJ-001',
    location: 'Dock A-1',
    avatar: '/api/placeholder/40/40'
  },
  {
    id: 'TECH-002', 
    name: 'Budi Santoso',
    specialization: 'Hull Repair',
    level: 'Expert',
    activeTasks: 3,
    completedTasks: 45,
    rating: 4.7,
    status: 'Available',
    currentProject: null,
    location: 'Workshop',
    avatar: '/api/placeholder/40/40'
  },
  {
    id: 'TECH-003',
    name: 'Citra Dewi',
    specialization: 'Electrical Systems',
    level: 'Senior',
    activeTasks: 1,
    completedTasks: 32,
    rating: 4.8,
    status: 'On Break',
    currentProject: 'PRJ-002',
    location: 'Dock B-2',
    avatar: '/api/placeholder/40/40'
  }
]

const dummyTasks = [
  {
    id: 'TASK-001',
    title: 'Engine Oil Change - Main Engine',
    projectId: 'PRJ-001',
    projectName: 'KM. Sinar Jaya',
    assignedTo: 'TECH-001',
    technicianName: 'Ahmad Surya',
    status: 'In Progress',
    priority: 'High',
    startDate: '2024-02-15',
    dueDate: '2024-02-16',
    estimatedHours: 4,
    actualHours: 2.5,
    progress: 60,
    location: 'Engine Room',
    description: 'Penggantian oli mesin utama sesuai jadwal maintenance',
    photos: [
      { id: 1, type: 'before', url: '/api/placeholder/200/150', description: 'Kondisi oli sebelum diganti' },
      { id: 2, type: 'during', url: '/api/placeholder/200/150', description: 'Proses penggantian oli' }
    ],
    materials: [
      { name: 'Engine Oil SAE 40', quantity: '20 Liter', used: '15 Liter' },
      { name: 'Oil Filter', quantity: '2 Pcs', used: '1 Pcs' }
    ]
  },
  {
    id: 'TASK-002',
    title: 'Hull Welding Repair - Port Side',
    projectId: 'PRJ-001', 
    projectName: 'KM. Sinar Jaya',
    assignedTo: 'TECH-002',
    technicianName: 'Budi Santoso',
    status: 'Pending',
    priority: 'Medium',
    startDate: '2024-02-16',
    dueDate: '2024-02-18',
    estimatedHours: 12,
    actualHours: 0,
    progress: 0,
    location: 'Dock A-1',
    description: 'Perbaikan pengelasan lambung kapal bagian kiri',
    photos: [
      { id: 3, type: 'before', url: '/api/placeholder/200/150', description: 'Area yang perlu diperbaiki' }
    ],
    materials: [
      { name: 'Welding Rod 3.2mm', quantity: '5 kg', used: '0 kg' },
      { name: 'Steel Plate 10mm', quantity: '2 m²', used: '0 m²' }
    ]
  },
  {
    id: 'TASK-003',
    title: 'Electrical System Check',
    projectId: 'PRJ-002',
    projectName: 'KM. Bahari Indah',
    assignedTo: 'TECH-003',
    technicianName: 'Citra Dewi',
    status: 'Completed',
    priority: 'High',
    startDate: '2024-02-12',
    dueDate: '2024-02-14',
    estimatedHours: 8,
    actualHours: 7.5,
    progress: 100,
    location: 'Control Room',
    description: 'Pemeriksaan dan testing sistem kelistrikan kapal',
    photos: [
      { id: 4, type: 'before', url: '/api/placeholder/200/150', description: 'Panel listrik sebelum pengecekan' },
      { id: 5, type: 'after', url: '/api/placeholder/200/150', description: 'Panel listrik setelah perbaikan' }
    ],
    materials: [
      { name: 'Electrical Cable 2.5mm²', quantity: '50 m', used: '25 m' },
      { name: 'Circuit Breaker 20A', quantity: '3 Pcs', used: '2 Pcs' }
    ]
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
    case 'Working':
      return 'green'
    case 'In Progress':
    case 'Available':
      return 'blue'
    case 'Pending':
    case 'On Break':
      return 'yellow'
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

export default function TechnicianWorkModule() {
  const [activeTab, setActiveTab] = useState('tasks')

  const activeTasks = dummyTasks.filter(t => t.status === 'In Progress')
  const availableTechnicians = dummyTechnicians.filter(t => t.status === 'Available')

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Teknisi & Pelaksanaan Pekerjaan</Heading>
            <Text color="gray.600">Kelola assignment task, progress pekerjaan, dan dokumentasi foto</Text>
          </VStack>
          <HStack spacing={3}>
            <Button leftIcon={<Icon as={FiCalendar} />} colorScheme="purple" variant="outline" size="sm">
              Schedule
            </Button>
            <Button leftIcon={<Icon as={FiPlus} />} colorScheme="blue">
              Assign Task
            </Button>
          </HStack>
        </Flex>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Active Tasks</Text>
                <Text fontSize="2xl" fontWeight="bold">{activeTasks.length}</Text>
                <Badge colorScheme="blue" variant="subtle">In Progress</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Available Technicians</Text>
                <Text fontSize="2xl" fontWeight="bold">{availableTechnicians.length}</Text>
                <Badge colorScheme="green" variant="subtle">Ready to work</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Completed Today</Text>
                <Text fontSize="2xl" fontWeight="bold">8</Text>
                <Badge colorScheme="purple" variant="subtle">Tasks finished</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Avg Efficiency</Text>
                <Text fontSize="2xl" fontWeight="bold">94%</Text>
                <Badge colorScheme="green" variant="subtle">On target</Badge>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Tabs */}
        <HStack spacing={4} borderBottom="1px" borderColor="gray.200" pb={4}>
          <Button
            variant={activeTab === 'tasks' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('tasks')}
          >
            <Icon as={FiClipboard} mr={2} />
            Work Tasks
          </Button>
          <Button
            variant={activeTab === 'technicians' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('technicians')}
          >
            <Icon as={FiUsers} mr={2} />
            Technicians
          </Button>
        </HStack>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="md">Work Tasks</Heading>
              <HStack spacing={3}>
                <Select placeholder="Filter Status" maxW="180px">
                  <option value="in-progress">In Progress</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </Select>
                <Select placeholder="Filter Priority" maxW="180px">
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </Select>
                <Input placeholder="Search tasks..." maxW="250px" />
              </HStack>
            </Flex>
            
            {dummyTasks.map((task) => (
              <Card key={task.id}>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="lg" fontWeight="bold">{task.title}</Text>
                        <Text fontSize="md" color="blue.600">{task.projectName}</Text>
                        <HStack>
                          <Text fontSize="sm" color="gray.600">{task.id}</Text>
                          <Text fontSize="sm" color="gray.400">•</Text>
                          <Text fontSize="sm" color="gray.600">{task.location}</Text>
                        </HStack>
                      </VStack>
                      <VStack align="end" spacing={2}>
                        <Badge colorScheme={getStatusColor(task.status)} variant="solid">
                          {task.status}
                        </Badge>
                        <Badge colorScheme={getPriorityColor(task.priority)} variant="outline">
                          {task.priority} Priority
                        </Badge>
                      </VStack>
                    </Flex>
                    
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Assigned To</Text>
                        <HStack>
                          <Avatar size="sm" name={task.technicianName} />
                          <Text fontSize="sm">{task.technicianName}</Text>
                        </HStack>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Timeline</Text>
                        <Text fontSize="sm">{task.startDate} - {task.dueDate}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Hours</Text>
                        <Text fontSize="sm">
                          {task.actualHours}h / {task.estimatedHours}h
                        </Text>
                      </VStack>
                    </SimpleGrid>

                    {/* Progress */}
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.500">Task Progress</Text>
                        <Text fontSize="sm" fontWeight="medium">{task.progress}%</Text>
                      </HStack>
                      <Progress 
                        value={task.progress} 
                        colorScheme={getStatusColor(task.status)} 
                        size="sm" 
                        borderRadius="lg"
                      />
                    </VStack>

                    {/* Description */}
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Description:</Text>
                      <Text fontSize="sm" color="gray.600">{task.description}</Text>
                    </Box>

                    {/* Materials Used */}
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Materials Used:</Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                        {task.materials.map((material, index) => (
                          <HStack key={index} justify="space-between" fontSize="sm">
                            <Text>{material.name}</Text>
                            <Text color="gray.500">
                              {material.used} / {material.quantity}
                            </Text>
                          </HStack>
                        ))}
                      </SimpleGrid>
                    </Box>

                    {/* Photo Documentation */}
                    {task.photos.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Photo Documentation:</Text>
                        <HStack spacing={3} overflowX="auto">
                          {task.photos.map((photo) => (
                            <VStack key={photo.id} spacing={2} minW="150px">
                              <Image
                                src={photo.url}
                                alt={photo.description}
                                borderRadius="md"
                                w="150px"
                                h="100px"
                                objectFit="cover"
                                fallback={
                                  <Box
                                    w="150px"
                                    h="100px"
                                    bg="gray.100"
                                    borderRadius="md"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <Icon as={FiCamera} color="gray.400" boxSize={6} />
                                  </Box>
                                }
                              />
                              <Badge size="sm" variant="outline">
                                {photo.type}
                              </Badge>
                              <Text fontSize="xs" textAlign="center" color="gray.500">
                                {photo.description}
                              </Text>
                            </VStack>
                          ))}
                        </HStack>
                      </Box>
                    )}

                    <HStack spacing={2} justify="end">
                      {task.status === 'In Progress' && (
                        <>
                          <Button size="sm" leftIcon={<Icon as={FiPause} />} colorScheme="yellow" variant="outline">
                            Pause
                          </Button>
                          <Button size="sm" leftIcon={<Icon as={FiCamera} />} colorScheme="purple" variant="outline">
                            Add Photo
                          </Button>
                        </>
                      )}
                      {task.status === 'Pending' && (
                        <Button size="sm" leftIcon={<Icon as={FiPlay} />} colorScheme="green">
                          Start Task
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" colorScheme="blue">
                        View Details
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}

        {/* Technicians Tab */}
        {activeTab === 'technicians' && (
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="md">Technician Management</Heading>
              <HStack spacing={3}>
                <Select placeholder="Filter Specialization" maxW="200px">
                  <option value="engine">Engine Specialist</option>
                  <option value="hull">Hull Repair</option>
                  <option value="electrical">Electrical Systems</option>
                </Select>
                <Select placeholder="Filter Status" maxW="180px">
                  <option value="working">Working</option>
                  <option value="available">Available</option>
                  <option value="break">On Break</option>
                </Select>
                <Input placeholder="Search technicians..." maxW="250px" />
              </HStack>
            </Flex>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {dummyTechnicians.map((technician) => (
                <Card key={technician.id}>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Avatar size="lg" name={technician.name} src={technician.avatar} />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">{technician.name}</Text>
                            <Text fontSize="sm" color="gray.600">{technician.id}</Text>
                            <Badge colorScheme={getStatusColor(technician.status)} variant="solid">
                              {technician.status}
                            </Badge>
                          </VStack>
                        </HStack>
                      </Flex>
                      
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.500">Specialization</Text>
                          <Badge variant="outline">{technician.specialization}</Badge>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.500">Level</Text>
                          <Text fontSize="sm" fontWeight="medium">{technician.level}</Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.500">Rating</Text>
                          <HStack>
                            <Text fontSize="sm" fontWeight="medium">{technician.rating}</Text>
                            <Text fontSize="xs" color="yellow.500">★★★★★</Text>
                          </HStack>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.500">Active Tasks</Text>
                          <Text fontSize="sm" fontWeight="medium" color="blue.600">
                            {technician.activeTasks}
                          </Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.500">Completed</Text>
                          <Text fontSize="sm">{technician.completedTasks} tasks</Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.500">Location</Text>
                          <HStack>
                            <Icon as={FiMapPin} boxSize={3} color="gray.400" />
                            <Text fontSize="sm">{technician.location}</Text>
                          </HStack>
                        </HStack>
                        
                        {technician.currentProject && (
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.500">Current Project</Text>
                            <Text fontSize="sm" color="blue.600">{technician.currentProject}</Text>
                          </HStack>
                        )}
                      </VStack>

                      <HStack spacing={2}>
                        <Button size="sm" colorScheme="blue" variant="outline" flex={1}>
                          View Profile
                        </Button>
                        <Button size="sm" colorScheme="green" flex={1}>
                          Assign Task
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