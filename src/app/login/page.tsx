'use client'

import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  VStack,
  HStack,
  Image,
  Flex,
  Card,
  CardBody,
  Heading,
  Divider,
  useToast
} from '@chakra-ui/react'
import { FiEye, FiEyeOff, FiAnchor } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const toast = useToast()
  
  // ✅ Move all hooks BEFORE any conditional returns
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  // Don't render if still loading auth or already authenticated
  if (authLoading || isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!username || !password) {
      setError('Please enter both username and password')
      return
    }

    setIsLoading(true)
    
    try {
      const result = await login(username, password)
      
      if (result.success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome to Docking Monitor!',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
        <Stack spacing="8">
          <Stack spacing="6">
            {/* Logo and Header */}
            <VStack spacing={4}>
              <Box
                p={4}
                bg="blue.500"
                borderRadius="full"
                color="white"
              >
                <FiAnchor size="48px" />
              </Box>
              <Stack spacing={2} textAlign="center">
                <Heading size="lg" color={useColorModeValue('gray.900', 'white')}>
                  Aplikasi Monitoring Proyek Docking
                </Heading>
                <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="lg">
                  Sistem Manajemen & Monitoring Pekerjaan Docking Kapal
                </Text>
              </Stack>
            </VStack>

            {/* Login Card */}
            <Card bg={cardBg} shadow="lg">
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <Stack spacing="5">
                    <Stack spacing="6">
                      <Stack spacing={4}>
                        <Heading size="md" textAlign="center">
                          Sign In to Your Account
                        </Heading>
                        <Text textAlign="center" color={useColorModeValue('gray.600', 'gray.400')}>
                          Enter your credentials to access the system
                        </Text>
                      </Stack>

                      {error && (
                        <Alert status="error" borderRadius="md">
                          <AlertIcon />
                          {error}
                        </Alert>
                      )}

                      <Stack spacing="4">
                        <FormControl isRequired>
                          <FormLabel htmlFor="username">Username</FormLabel>
                          <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            size="lg"
                            autoComplete="username"
                            disabled={isLoading}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel htmlFor="password">Password</FormLabel>
                          <InputGroup size="lg">
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter your password"
                              autoComplete="current-password"
                              disabled={isLoading}
                            />
                            <InputRightElement>
                              <IconButton
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                icon={showPassword ? <FiEyeOff /> : <FiEye />}
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                              />
                            </InputRightElement>
                          </InputGroup>
                        </FormControl>
                      </Stack>
                    </Stack>

                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      fontSize="md"
                      isLoading={isLoading}
                      loadingText="Signing in..."
                      disabled={!username || !password}
                    >
                      Sign In
                    </Button>
                  </Stack>
                </form>

                <Divider my={6} />

                {/* Demo Credentials */}
                <VStack spacing={3}>
                  <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} textAlign="center">
                    Demo Credentials:
                  </Text>
                  <VStack spacing={2} fontSize="sm">
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="medium">Admin:</Text>
                      <Text color="blue.500">admin / admin123</Text>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="medium">Manager:</Text>
                      <Text color="blue.500">manager / manager123</Text>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="medium">User:</Text>
                      <Text color="blue.500">user / user123</Text>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </Stack>

          {/* Footer */}
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} textAlign="center">
            © 2024 Aplikasi Monitoring Proyek Docking. All rights reserved.
          </Text>
        </Stack>
      </Container>
    </Box>
  )
}