'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  ModalProps,
  useDisclosure,
  IconButton,
  HStack,
} from '@chakra-ui/react'
import { FiX } from 'react-icons/fi'
import { useEffect, useCallback, useRef } from 'react'

interface RobustModalProps extends Omit<ModalProps, 'isOpen' | 'onClose' | 'children'> {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  
  // Enhanced options
  forceCloseAfter?: number // Auto-close after X seconds (emergency)
  preventStacking?: boolean // Prevent multiple modals
  debugMode?: boolean
  
  // Additional close methods
  enableEscClose?: boolean
  enableOverlayClose?: boolean
  showExtraCloseButton?: boolean
}

export function RobustModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  forceCloseAfter,
  preventStacking = true,
  debugMode = false,
  enableEscClose = true,
  enableOverlayClose = true,
  showExtraCloseButton = true,
  ...modalProps
}: RobustModalProps) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const isClosingRef = useRef(false)

  // Enhanced close handler with safety checks
  const safeClose = useCallback(() => {
    if (isClosingRef.current) {
      if (debugMode) console.log('RobustModal: Already closing, ignoring duplicate close')
      return
    }

    isClosingRef.current = true
    
    try {
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Call the original close handler
      onClose()

      if (debugMode) console.log('RobustModal: Successfully closed')
    } catch (error) {
      console.error('RobustModal: Error during close:', error)
      
      // Emergency DOM cleanup if close handler fails
      setTimeout(() => {
        const modals = document.querySelectorAll('[role="dialog"]')
        const overlays = document.querySelectorAll('[data-chakra-modal-overlay]')
        
        modals.forEach(modal => {
          if (modal.closest('[data-robust-modal]')) {
            modal.remove()
          }
        })
        
        overlays.forEach(overlay => overlay.remove())
        
        // Reset body styles
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
        
        if (debugMode) console.log('RobustModal: Emergency cleanup completed')
      }, 100)
    } finally {
      // Reset closing flag after a delay
      setTimeout(() => {
        isClosingRef.current = false
      }, 500)
    }
  }, [onClose, debugMode])

  // Force close timeout for emergency situations
  useEffect(() => {
    if (isOpen && forceCloseAfter && forceCloseAfter > 0) {
      timeoutRef.current = setTimeout(() => {
        console.warn(`RobustModal: Force closing after ${forceCloseAfter}s`)
        safeClose()
      }, forceCloseAfter * 1000)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isOpen, forceCloseAfter, safeClose])

  // Prevent modal stacking if enabled
  useEffect(() => {
    if (isOpen && preventStacking) {
      const existingModals = document.querySelectorAll('[role="dialog"]').length
      if (existingModals > 1) {
        console.warn('RobustModal: Multiple modals detected, closing older ones')
        
        // Close other modals
        document.querySelectorAll('[role="dialog"]').forEach((modal, index) => {
          if (index < existingModals - 1) {
            const closeBtn = modal.querySelector('[aria-label*="close" i]') as HTMLElement
            closeBtn?.click()
          }
        })
      }
    }
  }, [isOpen, preventStacking])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      // Final cleanup check
      setTimeout(() => {
        const staleOverlays = document.querySelectorAll('[data-chakra-modal-overlay]')
        staleOverlays.forEach(overlay => {
          if (!overlay.closest('[role="dialog"]')) {
            overlay.remove()
          }
        })
      }, 100)
    }
  }, [])

  // Enhanced keyboard handling
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && enableEscClose && isOpen) {
      event.preventDefault()
      event.stopPropagation()
      safeClose()
    }
  }, [enableEscClose, isOpen, safeClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true)
      return () => {
        document.removeEventListener('keydown', handleKeyDown, true)
      }
    }
  }, [isOpen, handleKeyDown])

  if (debugMode && isOpen) {
    console.log('RobustModal: Rendering with props:', { 
      isOpen, 
      title, 
      enableEscClose, 
      enableOverlayClose 
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={safeClose}
      closeOnEsc={enableEscClose}
      closeOnOverlayClick={enableOverlayClose}
      trapFocus={true}
      preserveScrollBarGap={true}
      {...modalProps}
    >
      <ModalOverlay 
        onClick={enableOverlayClose ? safeClose : undefined}
        data-robust-modal-overlay
      />
      <ModalContent data-robust-modal>
        {(title || showExtraCloseButton) && (
          <ModalHeader>
            <HStack justify="space-between" align="center">
              {title && <span>{title}</span>}
              {showExtraCloseButton && (
                <IconButton
                  aria-label="Close modal"
                  icon={<FiX />}
                  size="sm"
                  variant="ghost"
                  onClick={safeClose}
                  ml="auto"
                />
              )}
            </HStack>
          </ModalHeader>
        )}
        
        <ModalCloseButton onClick={safeClose} />
        
        <ModalBody>
          {children}
        </ModalBody>
        
        {footer && (
          <ModalFooter>
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  )
}

export default RobustModal