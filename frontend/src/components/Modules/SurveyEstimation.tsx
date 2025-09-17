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
  SimpleGrid,
  Checkbox,
} from '@chakra-ui/react'
import { FiPlus, FiCamera, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi'
import { useState } from 'react'

const dummySurveys = [
  {
    id: 'SUR-001',
    projectId: 'PRJ-001',
    kapal: 'KM. Sinar Jaya',
    surveyor: 'Ahmad Surya',
    status: 'Completed',
    date: '2024-01-20',
    estimatedCost: 'Rp 245.000.000',
    category: 'Hull & Deck',
    progress: 100,
  },
  {
    id: 'SUR-002',
    projectId: 'PRJ-002',
    kapal: 'KM. Bahari Indah',
    surveyor: 'Budi Santoso',
    status: 'In Progress',
    date: '2024-02-05',
    estimatedCost: 'Rp 175.000.000',
    category: 'Engine Room',
    progress: 65,
  },
  {
    id: 'SUR-003',
    projectId: 'PRJ-004',
    kapal: 'KM. Nusantara Jaya',
    surveyor: 'Citra Dewi',
    status: 'Pending',
    date: '2024-02-15',
    estimatedCost: 'Rp 420.000.000',
    category: 'Electrical',
    progress: 25,
  },
]

const checklistItems = [
  { id: 1, category: 'Hull & Deck', item: 'Pemeriksaan kondisi lambung kapal' },
  { id: 2, category: 'Hull & Deck', item: 'Inspeksi deck dan peralatan deck' },
  { id: 3, category: 'Engine Room', item: 'Pemeriksaan mesin utama' },
  { id: 4, category: 'Engine Room', item: 'Inspeksi sistem pendingin' },
  { id: 5, category: 'Electrical', item: 'Pemeriksaan panel listrik utama' },
  { id: 6, category: 'Electrical', item: 'Inspeksi sistem navigasi' },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'green'
    case 'In Progress':
      return 'blue'
    case 'Pending':
      return 'yellow'
    default:
      return 'gray'
  }
}

export default function SurveyEstimationModule() {
  const [activeTab, setActiveTab] = useState('surveys')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [checkedItems, setCheckedItems] = useState<number[]>([])

  const handleChecklistChange = (itemId: number) => {
    setCheckedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Survey & Estimasi</Heading>
            <Text color="gray.600">Kelola survey kondisi kapal dan estimasi biaya perbaikan</Text>
          </VStack>
          <Button leftIcon={<Icon as={FiPlus} />} colorScheme="blue" onClick={onOpen}>
            Survey Baru
          </Button>
        </Flex>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Total Survey</Text>
                <Text fontSize="2xl" fontWeight="bold">8</Text>
                <Badge colorScheme="blue" variant="subtle">Bulan ini</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Dalam Progress</Text>
                <Text fontSize="2xl" fontWeight="bold">3</Text>
                <Badge colorScheme="orange" variant="subtle">Active</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Selesai</Text>
                <Text fontSize="2xl" fontWeight="bold">4</Text>
                <Badge colorScheme="green" variant="subtle">Completed</Badge>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">Total Estimasi</Text>
                <Text fontSize="2xl" fontWeight="bold">Rp 840M</Text>
                <Badge colorScheme="purple" variant="subtle">+12%</Badge>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Tabs */}
        <HStack spacing={4} borderBottom="1px" borderColor="gray.200" pb={4}>
          <Button
            variant={activeTab === 'surveys' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('surveys')}
          >
            Daftar Survey
          </Button>
          <Button
            variant={activeTab === 'checklist' ? 'solid' : 'ghost'}
            colorScheme="blue"
            onClick={() => setActiveTab('checklist')}
          >
            Survey Checklist
          </Button>
        </HStack>

        {/* Survey List Tab */}
        {activeTab === 'surveys' && (
          <VStack spacing={4} align="stretch">
            <Heading size="md">Daftar Survey</Heading>
            {dummySurveys.map((survey) => (
              <Card key={survey.id}>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="lg" fontWeight="bold">{survey.id}</Text>
                        <Text fontSize="md" color="blue.600">{survey.kapal}</Text>
                      </VStack>
                      <Badge colorScheme={getStatusColor(survey.status)}>
                        {survey.status}
                      </Badge>
                    </Flex>
                    
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Surveyor</Text>
                        <Text fontSize="sm">{survey.surveyor}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Kategori</Text>
                        <Badge variant="outline">{survey.category}</Badge>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Estimasi Biaya</Text>
                        <Text fontSize="sm" fontWeight="medium">{survey.estimatedCost}</Text>
                      </VStack>
                    </SimpleGrid>
                    
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Progress Survey</Text>
                        <HStack>
                          <Text fontSize="sm">{survey.progress}%</Text>
                          <Box
                            w="100px"
                            h="6px"
                            bg="gray.200"
                            borderRadius="full"
                            overflow="hidden"
                          >
                            <Box
                              w={`${survey.progress}%`}
                              h="full"
                              bg={getStatusColor(survey.status) === 'green' ? 'green.500' : 'blue.500'}
                              borderRadius="full"
                            />
                          </Box>
                        </HStack>
                      </VStack>
                      
                      <VStack align="end" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Tanggal Survey</Text>
                        <Text fontSize="sm">{survey.date}</Text>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={2} justify="end">
                      <Button size="sm" variant="ghost" colorScheme="purple">
                        <Icon as={FiCamera} mr={2} />Foto
                      </Button>
                      <Button size="sm" variant="ghost" colorScheme="blue">
                        Detail Survey
                      </Button>
                      <Button size="sm" variant="ghost" colorScheme="green">
                        Update Progress
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <Card>
            <CardHeader>
              <Heading size="md">Survey Checklist Template</Heading>
              <Text fontSize="sm" color="gray.600">
                Template checklist untuk proses survey kondisi kapal
              </Text>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                {['Hull & Deck', 'Engine Room', 'Electrical'].map(category => (
                  <VStack key={category} align="stretch" spacing={3}>
                    <Flex align="center">
                      <Icon as={FiCheckCircle} color="blue.500" mr={2} />
                      <Text fontSize="lg" fontWeight="semibold">{category}</Text>
                    </Flex>
                    
                    <VStack align="stretch" spacing={2} pl={6}>
                      {checklistItems
                        .filter(item => item.category === category)
                        .map(item => (
                          <Checkbox
                            key={item.id}
                            isChecked={checkedItems.includes(item.id)}
                            onChange={() => handleChecklistChange(item.id)}
                            colorScheme="blue"
                          >
                            <Text fontSize="sm">{item.item}</Text>
                          </Checkbox>
                        ))}
                    </VStack>
                  </VStack>
                ))}
                
                <HStack justify="end" pt={4}>
                  <Text fontSize="sm" color="gray.500">
                    {checkedItems.length} dari {checklistItems.length} item selesai
                  </Text>
                  <Button colorScheme="green" size="sm">
                    Simpan Progress
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  )
}