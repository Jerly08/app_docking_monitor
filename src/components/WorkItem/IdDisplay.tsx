'use client'

import { Box, Text, Badge, Tooltip, HStack, VStack } from '@chakra-ui/react'
import { IdGeneratorService } from '@/lib/idGeneratorService'

interface IdDisplayProps {
  id: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showFormat?: boolean
  showTooltip?: boolean
  color?: string
}

export default function IdDisplay({ 
  id, 
  size = 'sm', 
  showFormat = true, 
  showTooltip = true,
  color 
}: IdDisplayProps) {
  const isNewFormat = IdGeneratorService.isNewFormat(id)
  const parsedId = isNewFormat ? IdGeneratorService.parseNewFormatId(id) : null
  
  const getIdDescription = () => {
    if (!isNewFormat) {
      return 'Legacy ID format - consider migrating to new format'
    }
    
    if (parsedId) {
      const date = new Date(parsedId.fullYear, parsedId.month - 1, parsedId.day)
      return `Created: ${date.toLocaleDateString('id-ID')} - Item #${parsedId.sequentialNumber}`
    }
    
    return 'New date-based ID format'
  }
  
  const formatIdForDisplay = () => {
    if (isNewFormat && parsedId) {
      // For new format, we can add some visual separation if needed
      return id // Keep original format for now
    }
    
    // For old format, truncate if too long
    if (id.length > 20) {
      return `${id.substring(0, 17)}...`
    }
    
    return id
  }
  
  const fontSize = {
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg'
  }[size]
  
  const content = (
    <HStack spacing={2} align="center">
      <Text 
        fontSize={fontSize} 
        color={color || (isNewFormat ? 'blue.600' : 'gray.600')}
        fontWeight={isNewFormat ? 'medium' : 'normal'}
        fontFamily={isNewFormat ? 'mono' : 'inherit'}
      >
        {formatIdForDisplay()}
      </Text>
      
      {showFormat && (
        <Badge 
          size="xs" 
          colorScheme={isNewFormat ? 'blue' : 'orange'}
          variant="subtle"
        >
          {isNewFormat ? 'New' : 'Legacy'}
        </Badge>
      )}
    </HStack>
  )
  
  if (showTooltip) {
    return (
      <Tooltip 
        label={getIdDescription()}
        placement="top"
        hasArrow
        bg={isNewFormat ? 'blue.600' : 'orange.500'}
      >
        {content}
      </Tooltip>
    )
  }
  
  return content
}

// Helper component for detailed ID information
export function IdDetailsPanel({ id }: { id: string }) {
  const isNewFormat = IdGeneratorService.isNewFormat(id)
  const parsedId = isNewFormat ? IdGeneratorService.parseNewFormatId(id) : null
  
  return (
    <Box p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
      <VStack spacing={3} align="start">
        <HStack spacing={2}>
          <Text fontWeight="semibold" fontSize="sm">ID:</Text>
          <Text fontFamily="mono" fontSize="sm">{id}</Text>
        </HStack>
        
        <HStack spacing={2}>
          <Text fontWeight="semibold" fontSize="sm">Format:</Text>
          <Badge colorScheme={isNewFormat ? 'blue' : 'orange'}>
            {isNewFormat ? 'Date-based (DD/MM/YY/###)' : 'Legacy format'}
          </Badge>
        </HStack>
        
        {isNewFormat && parsedId && (
          <VStack spacing={2} align="start" pl={4} borderLeft="2px solid" borderColor="blue.200">
            <Text fontSize="sm" color="blue.600" fontWeight="semibold">
              Date-based ID Details:
            </Text>
            
            <HStack spacing={4} wrap="wrap">
              <VStack spacing={0} align="start">
                <Text fontSize="xs" color="gray.500">Date</Text>
                <Text fontSize="sm" fontWeight="medium">
                  {String(parsedId.day).padStart(2, '0')}/{String(parsedId.month).padStart(2, '0')}/{String(parsedId.year).padStart(2, '0')}
                </Text>
              </VStack>
              
              <VStack spacing={0} align="start">
                <Text fontSize="xs" color="gray.500">Full Date</Text>
                <Text fontSize="sm" fontWeight="medium">
                  {new Date(parsedId.fullYear, parsedId.month - 1, parsedId.day).toLocaleDateString('id-ID')}
                </Text>
              </VStack>
              
              <VStack spacing={0} align="start">
                <Text fontSize="xs" color="gray.500">Sequence #</Text>
                <Text fontSize="sm" fontWeight="medium">
                  {parsedId.sequentialNumber}
                </Text>
              </VStack>
            </HStack>
          </VStack>
        )}
        
        {!isNewFormat && (
          <VStack spacing={1} align="start" pl={4} borderLeft="2px solid" borderColor="orange.200">
            <Text fontSize="sm" color="orange.600" fontWeight="semibold">
              Legacy ID Format
            </Text>
            <Text fontSize="xs" color="gray.600">
              This work item uses the old ID format. Consider migrating to the new date-based format for better organization.
            </Text>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}
