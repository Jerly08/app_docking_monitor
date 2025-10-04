'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Flex,
  Spinner,
  Card,
  CardBody,
  Divider,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react'
import {
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPhone,
  FiMail,
  FiMapPin,
  FiUser,
  FiBuilding,
  FiFileText,
  FiDownload,
  FiFilter,
} from 'react-icons/fi'
import React, { useState, useEffect, useRef } from 'react'
import { CustomerContact, CustomerFormData, CustomerStatus, VesselType } from '@/types/customer'

const CustomerContacts = () => {
  const [customers, setCustomers] = useState<CustomerContact[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerContact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerContact | null>(null)
  
  // Modal states
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  
  const cancelRef = useRef<HTMLButtonElement>(null)
  const toast = useToast()
  
  // Form state
  const [formData, setFormData] = useState<CustomerFormData>({
    vesselName: '',
    ownerCompany: '',
    vesselType: 'OIL TANKER',
    grt: 0,
    loa: 0,
    lbp: 0,
    breadth: 0,
    depth: 0,
    status: 'ACTIVE',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    address: '',
    notes: '',
  })

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockData: CustomerContact[] = [
      {
        id: '1',
        vesselName: 'MT. FERIMAS SEJAHTERA',
        ownerCompany: 'PT. Indoline Incomekita',
        vesselType: 'OIL TANKER',
        grt: 762,
        loa: 64.02,
        lbp: 59.90,
        breadth: 10.00,
        depth: 4.50,
        status: 'SPECIAL SURVEY',
        contactPerson: 'John Smith',
        phoneNumber: '+62 21 1234 5678',
        email: 'john.smith@indoline.com',
        address: 'Jakarta, Indonesia',
        notes: 'Regular customer, special survey scheduled',
        createdAt: '2024-01-15',
        updatedAt: '2024-10-04',
        lastDockingDate: '2024-09-15',
        nextScheduledDocking: '2025-03-15',
        totalDockings: 5,
      },
      {
        id: '2',
        vesselName: 'MV. OCEAN STAR',
        ownerCompany: 'PT. Marine Solutions',
        vesselType: 'CARGO SHIP',
        grt: 1200,
        loa: 85.50,
        lbp: 78.20,
        breadth: 12.50,
        depth: 6.80,
        status: 'MAINTENANCE',
        contactPerson: 'Sarah Johnson',
        phoneNumber: '+62 31 9876 5432',
        email: 'sarah.j@marinesol.com',
        address: 'Surabaya, Indonesia',
        notes: 'Routine maintenance required',
        createdAt: '2024-02-20',
        updatedAt: '2024-10-03',
        lastDockingDate: '2024-08-20',
        nextScheduledDocking: '2025-02-20',
        totalDockings: 3,
      },
    ]
    
    setTimeout(() => {
      setCustomers(mockData)
      setFilteredCustomers(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter customers based on search and status
  useEffect(() => {
    let filtered = customers.filter(customer =>
      customer.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.ownerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter)
    }

    setFilteredCustomers(filtered)
  }, [searchTerm, statusFilter, customers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (selectedCustomer) {
        // Update existing customer
        const updatedCustomers = customers.map(customer =>
          customer.id === selectedCustomer.id
            ? { ...customer, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
            : customer
        )
        setCustomers(updatedCustomers)
        toast({
          title: 'Customer Updated',
          description: 'Customer contact has been updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onEditClose()
      } else {
        // Add new customer
        const newCustomer: CustomerContact = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          totalDockings: 0,
        } as CustomerContact
        
        setCustomers([...customers, newCustomer])
        toast({
          title: 'Customer Added',
          description: 'New customer contact has been added successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onAddClose()
      }
      
      // Reset form and clear selected customer
      resetForm()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (customer: CustomerContact) => {
    setSelectedCustomer(customer)
    setFormData(customer)
    onEditOpen()
  }

  const resetForm = () => {
    setFormData({
      vesselName: '',
      ownerCompany: '',
      vesselType: 'OIL TANKER',
      grt: 0,
      loa: 0,
      lbp: 0,
      breadth: 0,
      depth: 0,
      status: 'ACTIVE',
      contactPerson: '',
      phoneNumber: '',
      email: '',
      address: '',
      notes: '',
    })
    setSelectedCustomer(null)
  }

  const handleCancel = () => {
    // Reset form data and clear selected customer
    resetForm()
    // Close appropriate modal
    if (isAddOpen) {
      onAddClose()
    } else if (isEditOpen) {
      onEditClose()
    }
  }

  const handleDelete = async () => {
    if (!selectedCustomer) return
    
    setLoading(true)
    try {
      const updatedCustomers = customers.filter(customer => customer.id !== selectedCustomer.id)
      setCustomers(updatedCustomers)
      toast({
        title: 'Customer Deleted',
        description: 'Customer contact has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      onDeleteClose()
      setSelectedCustomer(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete customer contact.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleView = (customer: CustomerContact) => {
    setSelectedCustomer(customer)
    onViewOpen()
  }

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'ACTIVE': 'green',
      'MAINTENANCE': 'yellow',
      'SPECIAL SURVEY': 'blue',
      'INACTIVE': 'gray',
      'URGENT': 'red',
    }
    
    return (
      <Badge colorScheme={statusColors[status] || 'gray'} variant="solid">
        {status}
      </Badge>
    )
  }

  // Statistics calculation
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'ACTIVE').length,
    maintenance: customers.filter(c => c.status === 'MAINTENANCE' || c.status === 'SPECIAL SURVEY').length,
    inactive: customers.filter(c => c.status === 'INACTIVE').length,
  }

  if (loading && customers.length === 0) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    )
  }

  return (
    <Box p={6}>
      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="bold">
            Customer Contacts
          </Text>
          <Text color="gray.600" fontSize="sm">
            Manage customer information from docking reports
          </Text>
        </VStack>
        <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onAddOpen}>
          Add Customer
        </Button>
      </HStack>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Stat size="sm">
              <StatLabel>Total Customers</StatLabel>
              <StatNumber color="blue.600">{stats.total}</StatNumber>
              <StatHelpText>All registered vessels</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat size="sm">
              <StatLabel>Active</StatLabel>
              <StatNumber color="green.600">{stats.active}</StatNumber>
              <StatHelpText>Currently active</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat size="sm">
              <StatLabel>In Service</StatLabel>
              <StatNumber color="yellow.600">{stats.maintenance}</StatNumber>
              <StatHelpText>Maintenance/Survey</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat size="sm">
              <StatLabel>Inactive</StatLabel>
              <StatNumber color="gray.600">{stats.inactive}</StatNumber>
              <StatHelpText>Not in service</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Card mb={6}>
        <CardBody>
          <HStack spacing={4}>
            <InputGroup maxW="300px">
              <InputLeftElement>
                <FiSearch />
              </InputLeftElement>
              <Input
                placeholder="Search by vessel name, company, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Select maxW="200px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="SPECIAL SURVEY">Special Survey</option>
              <option value="INACTIVE">Inactive</option>
              <option value="URGENT">Urgent</option>
            </Select>
            <Button leftIcon={<FiDownload />} variant="outline">
              Export
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Vessel Information</Th>
                  <Th>Owner Company</Th>
                  <Th>Specifications</Th>
                  <Th>Contact Person</Th>
                  <Th>Status</Th>
                  <Th>Last Docking</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredCustomers.map((customer) => (
                  <Tr key={customer.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">{customer.vesselName}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {customer.vesselType} • GRT: {customer.grt}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text>{customer.ownerCompany}</Text>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">LOA: {customer.loa}m</Text>
                        <Text fontSize="sm">LBP: {customer.lbp}m</Text>
                        <Text fontSize="sm">B: {customer.breadth}m • D: {customer.depth}m</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{customer.contactPerson}</Text>
                        <HStack spacing={2}>
                          <FiPhone size={12} />
                          <Text fontSize="sm">{customer.phoneNumber}</Text>
                        </HStack>
                      </VStack>
                    </Td>
                    <Td>{getStatusBadge(customer.status)}</Td>
                    <Td>
                      <Text fontSize="sm">{customer.lastDockingDate || 'N/A'}</Text>
                      {customer.nextScheduledDocking && (
                        <Text fontSize="xs" color="gray.500">
                          Next: {customer.nextScheduledDocking}
                        </Text>
                      )}
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="View customer"
                          icon={<FiEye />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleView(customer)}
                        />
                        <IconButton
                          aria-label="Edit customer"
                          icon={<FiEdit />}
                          size="sm"
                          variant="ghost"
                          colorScheme="yellow"
                          onClick={() => handleEdit(customer)}
                        />
                        <IconButton
                          aria-label="Delete customer"
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => {
                            setSelectedCustomer(customer)
                            onDeleteOpen()
                          }}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {filteredCustomers.length === 0 && (
              <Box textAlign="center" py={10}>
                <Text color="gray.500">No customers found</Text>
              </Box>
            )}
          </TableContainer>
        </CardBody>
      </Card>

      {/* Add/Edit Customer Modal */}
      <Modal isOpen={isAddOpen || isEditOpen} onClose={handleCancel} size="xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</ModalHeader>
            <ModalBody>
              <VStack spacing={4}>
                {/* Vessel Information */}
                <Text fontWeight="bold" alignSelf="start">Vessel Information</Text>
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Vessel Name</FormLabel>
                    <Input
                      value={formData.vesselName}
                      onChange={(e) => setFormData({...formData, vesselName: e.target.value})}
                      placeholder="e.g., MT. FERIMAS SEJAHTERA"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Vessel Type</FormLabel>
                    <Select
                      value={formData.vesselType}
                      onChange={(e) => setFormData({...formData, vesselType: e.target.value})}
                    >
                      <option value="">Select Type</option>
                      <option value="OIL TANKER">Oil Tanker</option>
                      <option value="CARGO SHIP">Cargo Ship</option>
                      <option value="CONTAINER SHIP">Container Ship</option>
                      <option value="BULK CARRIER">Bulk Carrier</option>
                      <option value="PASSENGER SHIP">Passenger Ship</option>
                      <option value="FISHING VESSEL">Fishing Vessel</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {/* Vessel Specifications */}
                <Text fontWeight="bold" alignSelf="start">Specifications</Text>
                <SimpleGrid columns={3} spacing={4} w="full">
                  <FormControl>
                    <FormLabel>GRT</FormLabel>
                    <Input
                      type="number"
                      value={formData.grt}
                      onChange={(e) => setFormData({...formData, grt: parseFloat(e.target.value)})}
                      placeholder="762"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>LOA (m)</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.loa}
                      onChange={(e) => setFormData({...formData, loa: parseFloat(e.target.value)})}
                      placeholder="64.02"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>LBP (m)</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.lbp}
                      onChange={(e) => setFormData({...formData, lbp: parseFloat(e.target.value)})}
                      placeholder="59.90"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Breadth (m)</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.breadth}
                      onChange={(e) => setFormData({...formData, breadth: parseFloat(e.target.value)})}
                      placeholder="10.00"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Depth (m)</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.depth}
                      onChange={(e) => setFormData({...formData, depth: parseFloat(e.target.value)})}
                      placeholder="4.50"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="SPECIAL SURVEY">Special Survey</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="URGENT">Urgent</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {/* Company & Contact Information */}
                <Text fontWeight="bold" alignSelf="start">Company & Contact Information</Text>
                <FormControl isRequired>
                  <FormLabel>Owner Company</FormLabel>
                  <Input
                    value={formData.ownerCompany}
                    onChange={(e) => setFormData({...formData, ownerCompany: e.target.value})}
                    placeholder="e.g., PT. Indoline Incomekita"
                  />
                </FormControl>
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Contact Person</FormLabel>
                    <Input
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      placeholder="Full Name"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      placeholder="+62 21 1234 5678"
                    />
                  </FormControl>
                </SimpleGrid>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@company.com"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Address</FormLabel>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Company address..."
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes..."
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" colorScheme="blue" isLoading={loading}>
                {selectedCustomer ? 'Update' : 'Add'} Customer
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* View Customer Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Customer Details</ModalHeader>
          <ModalBody>
            {selectedCustomer && (
              <VStack align="start" spacing={4}>
                <Card w="full">
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <HStack>
                        <FiUser />
                        <Text fontWeight="bold" fontSize="lg">{selectedCustomer.vesselName}</Text>
                        {getStatusBadge(selectedCustomer.status)}
                      </HStack>
                      <Divider />
                      <SimpleGrid columns={2} spacing={4} w="full">
                        <Box>
                          <Text fontSize="sm" color="gray.600">Owner Company</Text>
                          <Text fontWeight="medium">{selectedCustomer.ownerCompany}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">Vessel Type</Text>
                          <Text fontWeight="medium">{selectedCustomer.vesselType}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">GRT</Text>
                          <Text fontWeight="medium">{selectedCustomer.grt} GT</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">LOA</Text>
                          <Text fontWeight="medium">{selectedCustomer.loa} meter</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">LBP</Text>
                          <Text fontWeight="medium">{selectedCustomer.lbp} meter</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">Breadth</Text>
                          <Text fontWeight="medium">{selectedCustomer.breadth} meter</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">Depth</Text>
                          <Text fontWeight="medium">{selectedCustomer.depth} meter</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">Total Dockings</Text>
                          <Text fontWeight="medium">{selectedCustomer.totalDockings}</Text>
                        </Box>
                      </SimpleGrid>
                    </VStack>
                  </CardBody>
                </Card>

                <Card w="full">
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <HStack>
                        <FiUser />
                        <Text fontWeight="bold">Contact Information</Text>
                      </HStack>
                      <Divider />
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <FiUser />
                          <Text>{selectedCustomer.contactPerson}</Text>
                        </HStack>
                        <HStack>
                          <FiPhone />
                          <Text>{selectedCustomer.phoneNumber}</Text>
                        </HStack>
                        <HStack>
                          <FiMail />
                          <Text>{selectedCustomer.email}</Text>
                        </HStack>
                        <HStack align="start">
                          <FiMapPin />
                          <Text>{selectedCustomer.address}</Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>

                {selectedCustomer.notes && (
                  <Card w="full">
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <HStack>
                          <FiFileText />
                          <Text fontWeight="bold">Notes</Text>
                        </HStack>
                        <Divider />
                        <Text>{selectedCustomer.notes}</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Customer Contact
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete the contact for{' '}
              <strong>{selectedCustomer?.vesselName}</strong>? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} isLoading={loading}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default CustomerContacts