'use client'

import { ReactNode, useEffect, useState } from 'react'

interface NoSSRProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * NoSSR component that prevents server-side rendering to avoid hydration mismatches.
 * This component only renders its children on the client side.
 */
export default function NoSSR({ children, fallback = null }: NoSSRProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}