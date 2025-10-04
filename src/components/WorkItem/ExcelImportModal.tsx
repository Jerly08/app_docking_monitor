'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Input,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Progress,
  Badge,
  useToast,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  Code
} from '@chakra-ui/react'
import { FiUpload, FiFile, FiCheck, FiInfo, FiCheckCircle, FiDownload } from 'react-icons/fi'
import React, { useState, useRef } from 'react'

interface ExcelImportModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onImportSuccess: () => void
}

interface PreviewData {
  headers: string[]
  rows: unknown[][]
  totalRows: number
}

interface ImportSummary {
  totalProcessed: number
  packagesFound: string[]
  milestonesCount: number
  averageCompletion: number
}

interface ImportResponse {
  message: string
  workItems: unknown[]
  summary: ImportSummary
}

const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onImportSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [importResult, setImportResult] = useState<ImportResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'preview' | 'importing' | 'success' | 'error'>('select')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Please select an Excel file (.xlsx or .xls)')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setError(null)
    generatePreview(file)
  }

  const generatePreview = async (file: File) => {
    try {
      setStep('preview')
      
      // Read file for preview using FileReader
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = e.target?.result
          if (!data) throw new Error('Failed to read file')

          // For now, just show file info since we can't process Excel on client-side
          // The actual processing will happen on the server
          setPreviewData({
            headers: [
              'NO', 'PACKAGE', 'TASK NAME', 'DURATION (DAYS)', 
              'START', 'FINISH', '% COMPLETE', 'RESOURCE NAMES', 
              'MILESTONE', 'NOTES', 'DEPENDS ON'
            ],
            rows: [
              ['Preview will be available after processing...']
            ],
            totalRows: 0
          })
        } catch (error) {
          console.error('Preview generation error:', error)
          setError('Failed to generate preview. The file will be processed during import.')
          setPreviewData({
            headers: ['File Info'],
            rows: [
              [`File: ${file.name}`],
              [`Size: ${(file.size / 1024).toFixed(1)} KB`],
              [`Type: ${file.type || 'Excel file'}`]
            ],
            totalRows: 0
          })
        }
      }
      
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('Error generating preview:', error)
      setError('Failed to preview file')
    }
  }

  const handleImport = async () => {
    if (!selectedFile || !projectId) return

    setIsUploading(true)
    setStep('importing')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`/api/projects/${projectId}/work-items/import-excel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setImportResult(result)
        setStep('success')
        toast({
          title: 'Import Successful',
          description: result.message,
          status: 'success',
          duration: 5000
        })
        onImportSuccess()
      } else {
        let errorMessage = result.error || 'Import failed'
        
        // Add detailed error information if available
        if (result.details) {
          if (typeof result.details === 'string') {
            errorMessage += `\n\nDetails: ${result.details}`
          } else if (result.details.message) {
            errorMessage += `\n\n${result.details.message}`
            if (result.details.availableHeaders) {
              errorMessage += `\n\nAvailable columns in your Excel: ${result.details.availableHeaders}`
            }
            if (result.details.expectedHeaders) {
              errorMessage += `\n\nExpected columns: ${result.details.expectedHeaders}`
            }
          } else if (Array.isArray(result.details)) {
            errorMessage += `\n\nErrors found:\n${result.details.join('\n')}`
          }
        }
        
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Import error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to import Excel file'
      setError(errorMessage)
      setStep('error')
      toast({
        title: 'Import Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewData(null)
    setImportResult(null)
    setError(null)
    setStep('select')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/templates/excel', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'Work_Items_Import_Template.xlsx'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: 'Template Downloaded',
          description: 'Excel template has been downloaded successfully',
          status: 'success',
          duration: 3000
        })
      } else {
        throw new Error('Failed to download template')
      }
    } catch (error) {
      console.error('Download template error:', error)
      toast({
        title: 'Download Failed',
        description: 'Failed to download Excel template. Please try again.',
        status: 'error',
        duration: 3000
      })
    }
  }

  const renderFileSelection = () => (
    <VStack spacing={6} align="stretch">
      {/* File Upload Area */}
      <Box
        border="2px dashed"
        borderColor={selectedFile ? "green.300" : "gray.300"}
        borderRadius="lg"
        p={8}
        textAlign="center"
        cursor="pointer"
        _hover={{ borderColor: "blue.400", bg: "blue.50" }}
        onClick={() => fileInputRef.current?.click()}
        transition="all 0.2s"
      >
        <Input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          display="none"
        />
        
        <VStack spacing={4}>
          <Box fontSize="3xl" color={selectedFile ? "green.500" : "gray.400"}>
            {selectedFile ? <FiCheckCircle /> : <FiUpload />}
          </Box>
          
          {selectedFile ? (
            <VStack spacing={2}>
              <Text fontWeight="semibold" color="green.600">
                File Selected: {selectedFile.name}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Size: {(selectedFile.size / 1024).toFixed(1)} KB
              </Text>
            </VStack>
          ) : (
            <VStack spacing={2}>
              <Text fontWeight="semibold" color="gray.600">
                Click to select Excel file
              </Text>
              <Text fontSize="sm" color="gray.500">
                Supported formats: .xlsx, .xls (max 10MB)
              </Text>
            </VStack>
          )}
        </VStack>
      </Box>

      {/* Template Information */}
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left" fontWeight="semibold">
                <HStack>
                  <FiInfo />
                  <Text>Excel Template Structure</Text>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="semibold" mb={2} color="red.600">Required Columns:</Text>
                <List spacing={1}>
                  <ListItem>
                    <ListIcon as={FiCheck} color="red.500" />
                    <Code>TASK NAME</Code> - Description of the work item
                  </ListItem>
                </List>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Alternative names: TASK, DESCRIPTION, URAIAN PEKERJAAN, URAIAN-PEKERJAAN, PEKERJAAN, KEGIATAN, ITEM PEKERJAAN
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" mb={2} color="green.600">Optional Columns:</Text>
                <List spacing={1}>
                  <ListItem><ListIcon as={FiCheck} color="green.500" /><Code>NO</Code> - Sequential number</ListItem>
                  <ListItem><ListIcon as={FiCheck} color="green.500" /><Code>PACKAGE</Code> - Work package name</ListItem>
                  <ListItem><ListIcon as={FiCheck} color="green.500" /><Code>DURATION (DAYS)</Code> - Number of days</ListItem>
                  <ListItem><ListIcon as={FiCheck} color="green.500" /><Code>START</Code> - Start date</ListItem>
                  <ListItem><ListIcon as={FiCheck} color="green.500" /><Code>FINISH</Code> - Finish date</ListItem>
                  <ListItem><ListIcon as={FiCheck} color="green.500" /><Code>% COMPLETE</Code> - Completion percentage (0-100)</ListItem>
                  <ListItem><ListIcon as={FiCheck} color="green.500" /><Code>RESOURCE NAMES</Code> - Assigned resources</ListItem>
                  <ListItem><ListIcon as={FiCheck} color="green.500" /><Code>MILESTONE</Code> - YES/TRUE/1 for milestones</ListItem>
                  <ListItem><ListIcon as={FiCheck} color="green.500" /><Code>NOTES</Code> - Additional comments</ListItem>
                  <ListItem><ListIcon as={FiCheck} color="green.500" /><Code>DEPENDS ON</Code> - Dependencies (comma-separated)</ListItem>
                </List>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  💡 Tip: Sistem dapat membaca berbagai format Excel termasuk "Repair List Docking" dengan kolom seperti URAIAN-PEKERJAAN, VOL, SAT, KETERANGAN.
                </Text>
              </Box>

              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Supported Formats:</AlertTitle>
                  <AlertDescription>
                    ✅ Standard template (TASK NAME, PACKAGE, etc.)<br/>
                    ✅ Docking Repair List format (URAIAN-PEKERJAAN, VOL, SAT, KETERANGAN)<br/>
                    System automatically detects table headers and skips document headers.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>Need a template?</AlertTitle>
          <AlertDescription>
            Download our Excel template to get started quickly with the correct format.
          </AlertDescription>
        </Box>
      </Alert>

      <Button
        leftIcon={<FiDownload />}
        colorScheme="green"
        variant="outline"
        size="md"
        onClick={handleDownloadTemplate}
        w="full"
      >
        Download Excel Template
      </Button>

      {error && (
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Error:</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      )}
    </VStack>
  )

  const renderPreview = () => (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Text fontWeight="semibold" color="blue.600">
          File Preview: {selectedFile?.name}
        </Text>
        <Badge colorScheme="blue">Ready to Import</Badge>
      </HStack>

      {previewData && (
        <Box maxH="300px" overflowY="auto" border="1px solid" borderColor="gray.200" borderRadius="md">
          <TableContainer>
            <Table size="sm" variant="striped">
              <Thead bg="gray.50" position="sticky" top="0">
                <Tr>
                  {previewData.headers.map((header, index) => (
                    <Th key={index} fontSize="xs">{header}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {previewData.rows.slice(0, 10).map((row, rowIndex) => (
                  <Tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <Td key={cellIndex} fontSize="xs" maxW="150px" isTruncated>
                        {cell?.toString() || ''}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertDescription>
            This is a preview showing the expected column structure. 
            Actual data processing will happen during import.
          </AlertDescription>
        </Box>
      </Alert>
    </VStack>
  )

  const renderImporting = () => (
    <VStack spacing={6}>
      <Spinner size="xl" color="blue.500" />
      <Text fontSize="lg" fontWeight="semibold">Processing Excel file...</Text>
      <Progress colorScheme="blue" isIndeterminate w="100%" />
      <Text color="gray.600" textAlign="center">
        Please wait while we process your Excel file and create work items.
      </Text>
    </VStack>
  )

  const renderSuccess = () => (
    <VStack spacing={6} align="stretch">
      <Alert status="success">
        <AlertIcon />
        <Box>
          <AlertTitle>Import Successful!</AlertTitle>
          <AlertDescription>{importResult?.message}</AlertDescription>
        </Box>
      </Alert>

      {importResult?.summary && (
        <Box p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
          <Text fontWeight="semibold" mb={3} color="green.700">Import Summary:</Text>
          <HStack spacing={8} wrap="wrap">
            <VStack spacing={1} align="start">
              <Text fontSize="xl" fontWeight="bold" color="green.600">
                {importResult.summary.totalProcessed}
              </Text>
              <Text fontSize="xs" color="gray.600">ITEMS IMPORTED</Text>
            </VStack>
            <VStack spacing={1} align="start">
              <Text fontSize="xl" fontWeight="bold" color="blue.600">
                {importResult.summary.packagesFound.length}
              </Text>
              <Text fontSize="xs" color="gray.600">PACKAGES</Text>
            </VStack>
            <VStack spacing={1} align="start">
              <Text fontSize="xl" fontWeight="bold" color="purple.600">
                {importResult.summary.milestonesCount}
              </Text>
              <Text fontSize="xs" color="gray.600">MILESTONES</Text>
            </VStack>
            <VStack spacing={1} align="start">
              <Text fontSize="xl" fontWeight="bold" color="orange.600">
                {importResult.summary.averageCompletion}%
              </Text>
              <Text fontSize="xs" color="gray.600">AVG COMPLETION</Text>
            </VStack>
          </HStack>

          {importResult.summary.packagesFound.length > 0 && (
            <Box mt={3}>
              <Text fontSize="sm" color="gray.600" mb={1}>Packages found:</Text>
              <HStack wrap="wrap" spacing={2}>
                {importResult.summary.packagesFound.map((pkg, index) => (
                  <Badge key={index} colorScheme="blue" variant="subtle">
                    {pkg}
                  </Badge>
                ))}
              </HStack>
            </Box>
          )}
        </Box>
      )}
    </VStack>
  )

  const renderError = () => (
    <VStack spacing={4}>
      <Alert status="error">
        <AlertIcon />
        <Box>
          <AlertTitle>Import Failed!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Box>
      </Alert>
      
      <Text color="gray.600" textAlign="center">
        Please check your Excel file format and try again.
      </Text>
    </VStack>
  )

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl" closeOnOverlayClick={!isUploading}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <FiFile />
            <Text>Import Work Items from Excel</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={isUploading} />
        
        <ModalBody>
          {step === 'select' && renderFileSelection()}
          {step === 'preview' && renderPreview()}
          {step === 'importing' && renderImporting()}
          {step === 'success' && renderSuccess()}
          {step === 'error' && renderError()}
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            {step === 'select' && (
              <>
                <Button onClick={handleClose}>Cancel</Button>
                <Button 
                  colorScheme="blue" 
                  onClick={() => selectedFile && generatePreview(selectedFile)}
                  isDisabled={!selectedFile}
                  leftIcon={<FiCheck />}
                >
                  Continue
                </Button>
              </>
            )}
            
            {step === 'preview' && (
              <>
                <Button onClick={handleReset}>Select Different File</Button>
                <Button 
                  colorScheme="green" 
                  onClick={handleImport}
                  isLoading={isUploading}
                  leftIcon={<FiUpload />}
                >
                  Import Data
                </Button>
              </>
            )}
            
            {step === 'importing' && (
              <Button isDisabled>
                <Spinner size="sm" mr={2} />
                Importing...
              </Button>
            )}
            
            {(step === 'success' || step === 'error') && (
              <>
                <Button onClick={handleReset}>Import Another File</Button>
                <Button colorScheme="blue" onClick={handleClose}>
                  Done
                </Button>
              </>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ExcelImportModal