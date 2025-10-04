import { useEffect, useState } from 'react';

/**
 * Custom hook to ensure components only render on client-side
 * Prevents hydration mismatches for client-specific content
 */
export const useClientOnly = (): boolean => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

export default useClientOnly;