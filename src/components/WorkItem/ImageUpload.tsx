'use client'

import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Image,
  IconButton,
  useToast,
  Spinner,
  Badge,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
} from '@chakra-ui/react'
import {
  FiUpload,
  FiTrash2,
  FiEye,
  FiImage,
  FiX,
  FiCamera,
} from 'react-icons/fi'
import { useRef, useState, useEffect } from 'react'

interface WorkItemAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize?: number
  mimeType?: string
  uploadedAt: string
}

interface ImageUploadProps {
  workItemId: string
  workItemTitle?: string
  onAttachmentsChange?: (attachments: WorkItemAttachment[]) => void
  maxFiles?: number
  disabled?: boolean
}

export default function ImageUpload({
  workItemId,
  workItemTitle,
  onAttachmentsChange,
  maxFiles = 10,
  disabled = false,
}: ImageUploadProps) {
  const [attachments, setAttachments] = useState<WorkItemAttachment[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<WorkItemAttachment | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure()

  // Fetch existing attachments
  useEffect(() => {
    fetchAttachments()
  }, [workItemId])

  const fetchAttachments = async () => {
    try {
      setLoading(true)
      const encodedId = encodeURIComponent(workItemId)
      const response = await fetch(`/api/work-items/${encodedId}/attachments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAttachments(data.attachments || [])
        onAttachmentsChange?.(data.attachments || [])
      }
    } catch (error) {
      console.error('Error fetching attachments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      uploadFiles(files)
    }
  }

  const uploadFiles = async (files: File[]) => {
    if (attachments.length + files.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum ${maxFiles} images allowed`,
        status: 'error',
        duration: 3000,
      })
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })

      const encodedId = encodeURIComponent(workItemId)
      const response = await fetch(`/api/work-items/${encodedId}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Upload Successful',
          description: data.message,
          status: 'success',
          duration: 3000,
        })
        fetchAttachments() // Refresh the list
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload images. Please try again.',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const deleteAttachment = async (attachment: WorkItemAttachment) => {
    if (!confirm(`Delete "${attachment.fileName}"?`)) {
      return
    }

    try {
      const encodedId = encodeURIComponent(workItemId)
      const response = await fetch(
        `/api/work-items/${encodedId}/attachments?attachmentId=${attachment.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      )

      if (response.ok) {
        toast({
          title: 'Deleted',
          description: 'Image deleted successfully',
          status: 'success',
          duration: 2000,
        })
        fetchAttachments() // Refresh the list
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      console.error('Error deleting attachment:', error)
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete image. Please try again.',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(1)} MB`
    return `${kb.toFixed(1)} KB`
  }

  const openPreview = (attachment: WorkItemAttachment) => {
    setSelectedImage(attachment)
    onPreviewOpen()
  }

  if (loading) {
    return (
      <Box textAlign="center" py={6}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={2} color="gray.600">Loading attachments...</Text>
      </Box>
    )
  }

  return (
    <VStack align="stretch" spacing={4}>
      {/* Upload Section */}
      <HStack justify="space-between" align="center">
        <HStack>
          <FiCamera />
          <Text fontWeight="medium" color="gray.700">
            Image Attachments
          </Text>
          {attachments.length > 0 && (
            <Badge colorScheme="blue" variant="outline">
              {attachments.length}
            </Badge>
          )}
        </HStack>

        <Button
          leftIcon={<FiUpload />}
          size="sm"
          colorScheme="blue"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          isLoading={uploading}
          loadingText="Uploading..."
          disabled={disabled || attachments.length >= maxFiles}
        >
          {attachments.length === 0 ? 'Upload Images' : 'Add More'}
        </Button>
      </HStack>

      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        display="none"
        onChange={handleFileSelect}
      />

      {/* Attachments Grid */}
      {attachments.length > 0 ? (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
          {attachments.map((attachment) => (
            <Box
              key={attachment.id}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              p={2}
              position="relative"
              _hover={{ borderColor: 'blue.300', shadow: 'sm' }}
            >
              <Image
                src={attachment.fileUrl}
                alt={attachment.fileName}
                w="100%"
                h="100px"
                objectFit="cover"
                borderRadius="sm"
                cursor="pointer"
                onClick={() => openPreview(attachment)}
              />
              
              {/* Overlay with actions */}
              <Box
                position="absolute"
                top={2}
                right={2}
                bg="blackAlpha.700"
                borderRadius="md"
                p={1}
              >
                <HStack spacing={1}>
                  <IconButton
                    size="xs"
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    icon={<FiEye />}
                    aria-label="Preview"
                    onClick={() => openPreview(attachment)}
                  />
                  <IconButton
                    size="xs"
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    icon={<FiTrash2 />}
                    aria-label="Delete"
                    onClick={() => deleteAttachment(attachment)}
                  />
                </HStack>
              </Box>

              {/* File info */}
              <VStack align="start" spacing={1} mt={2}>
                <Text fontSize="xs" color="gray.600" noOfLines={1}>
                  {attachment.fileName}
                </Text>
                {attachment.fileSize && (
                  <Text fontSize="xs" color="gray.500">
                    {formatFileSize(attachment.fileSize)}
                  </Text>
                )}
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Box
          textAlign="center"
          py={8}
          px={4}
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="md"
          bg="gray.50"
          cursor="pointer"
          _hover={{ borderColor: 'blue.300', bg: 'blue.50' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <VStack spacing={3}>
            <FiImage size={32} color="#9CA3AF" />
            <VStack spacing={1}>
              <Text fontWeight="medium" color="gray.600">
                No images uploaded yet
              </Text>
              <Text fontSize="sm" color="gray.500">
                Click here or use the upload button to add images
              </Text>
            </VStack>
          </VStack>
        </Box>
      )}

      {/* Max files warning */}
      {attachments.length >= maxFiles && (
        <Text fontSize="sm" color="orange.600" textAlign="center">
          Maximum number of images ({maxFiles}) reached
        </Text>
      )}

      {/* Image Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack justify="space-between">
              <Text noOfLines={1}>
                {selectedImage?.fileName}
              </Text>
              <IconButton
                size="sm"
                variant="ghost"
                icon={<FiX />}
                aria-label="Close"
                onClick={onPreviewClose}
              />
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedImage && (
              <VStack spacing={4}>
                <Image
                  src={selectedImage.fileUrl}
                  alt={selectedImage.fileName}
                  maxW="100%"
                  maxH="400px"
                  objectFit="contain"
                  borderRadius="md"
                />
                <VStack spacing={2} align="start" w="100%">
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm" color="gray.600">
                      File Size: {formatFileSize(selectedImage.fileSize)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Type: {selectedImage.mimeType}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Uploaded: {new Date(selectedImage.uploadedAt).toLocaleDateString()}
                  </Text>
                </VStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  )
}