import { useState, useCallback } from 'react';

interface UseModalStateReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

/**
 * Simple modal state hook - compatible dengan Chakra UI
 */
export const useModalState = (initialState: boolean = false): UseModalStateReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);


  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  };
};

export default useModalState;