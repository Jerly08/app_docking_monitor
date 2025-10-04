import { useState, useCallback, useEffect, useRef } from 'react';

interface UseModalStateReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  forceClose: () => void;
  isClosing: boolean;
}

/**
 * Enhanced modal state hook with better error handling and cleanup
 */
export const useModalState = (initialState: boolean = false): UseModalStateReturn => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [isClosing, setIsClosing] = useState(false);
  const isClosingRef = useRef(false);

  const onOpen = useCallback(() => {
    if (isClosingRef.current) {
      console.warn('useModalState: Attempted to open while closing, ignoring');
      return;
    }
    
    try {
      setIsOpen(true);
      setIsClosing(false);
    } catch (error) {
      console.error('useModalState: Error opening modal:', error);
    }
  }, []);

  const onClose = useCallback(() => {
    if (isClosingRef.current) {
      console.warn('useModalState: Already closing, ignoring duplicate close');
      return;
    }
    
    isClosingRef.current = true;
    setIsClosing(true);
    
    try {
      setIsOpen(false);
    } catch (error) {
      console.error('useModalState: Error closing modal:', error);
    } finally {
      // Reset closing flag after animation time
      setTimeout(() => {
        isClosingRef.current = false;
        setIsClosing(false);
      }, 300);
    }
  }, []);

  const onToggle = useCallback(() => {
    if (isClosingRef.current) {
      console.warn('useModalState: Cannot toggle while closing');
      return;
    }
    
    try {
      setIsOpen(prev => !prev);
    } catch (error) {
      console.error('useModalState: Error toggling modal:', error);
    }
  }, []);

  // Force close for emergency situations
  const forceClose = useCallback(() => {
    console.warn('useModalState: Force closing modal');
    isClosingRef.current = false;
    setIsClosing(false);
    setIsOpen(false);
    
    // Emergency DOM cleanup
    setTimeout(() => {
      const modals = document.querySelectorAll('[role="dialog"]');
      const overlays = document.querySelectorAll('[data-chakra-modal-overlay]');
      
      modals.forEach(modal => modal.remove());
      overlays.forEach(overlay => overlay.remove());
      
      // Reset body scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }, 50);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isClosingRef.current || isOpen) {
        // Final cleanup
        setTimeout(() => {
          const staleModals = document.querySelectorAll('[role="dialog"]');
          staleModals.forEach(modal => {
            if (!modal.isConnected) {
              modal.remove();
            }
          });
        }, 100);
      }
    };
  }, [isOpen]);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    forceClose,
    isClosing,
  };
};

export default useModalState;