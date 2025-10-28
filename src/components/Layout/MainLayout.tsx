'use client'

import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Icon,
  Button,
  Avatar,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react'
import React, { ReactNode, useState, useEffect } from 'react'
import {
  FiHome,
  FiSearch,
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiUsers,
  FiCreditCard,
  FiBarChart,
  FiMenu,
  FiBell,
  FiSettings,
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiPhone,
} from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface NavItemProps {
  icon: React.ElementType
  children: ReactNode
  isActive?: boolean
  onClick?: () => void
  badge?: string
}

const NavItem = ({ icon, children, isActive, onClick, badge }: NavItemProps) => {
  return (
    <Button
      variant={isActive ? 'solid' : 'ghost'}
      justifyContent="flex-start"
      alignItems="center"
      w="full"
      h="40px"
      px={4}
      colorScheme={isActive ? 'blue' : undefined}
      onClick={onClick}
      fontWeight={isActive ? 'semibold' : 'normal'}
      fontSize="sm"
      position="relative"
      suppressHydrationWarning
    >
      <Icon as={icon} mr={3} boxSize={4} />
      <Text flex="1" textAlign="left">{children}</Text>
      {badge && (
        <Badge ml={2} colorScheme="red" variant="solid" fontSize="xs">
          {badge}
        </Badge>
      )}
    </Button>
  )
}

interface MainLayoutProps {
  children: ReactNode
  currentModule?: string
  breadcrumbs?: { label: string; href?: string }[]
  onModuleChange?: (moduleId: string) => void
}

const modules = [
  { id: 'dashboard', name: 'Dashboard', icon: FiHome },
  { id: 'work-plan-report', name: 'Work Plan & Report', icon: FiBarChart },
  { id: 'customer-contacts', name: 'Customer Contacts', icon: FiPhone },
  { id: 'settings', name: 'Settings', icon: FiSettings },
  // Hidden modules - uncomment when ready to use
  // { id: 'project-management', name: 'Manajemen Proyek & Nota Dinas', icon: FiHome },
  // { id: 'survey-estimation', name: 'Survey & Estimasi', icon: FiSearch },
  // { id: 'quotation-negotiation', name: 'Penawaran & Negosiasi', icon: FiDollarSign },
  // { id: 'procurement-vendor', name: 'Procurement & Vendor', icon: FiShoppingCart },
  // { id: 'warehouse-material', name: 'Gudang & Material', icon: FiPackage },
  // { id: 'technician-work', name: 'Teknisi & Pelaksanaan', icon: FiUsers },
  // { id: 'finance-payment', name: 'Finance & Payment', icon: FiCreditCard },
  // { id: 'reporting', name: 'Reporting', icon: FiBarChart },
]

export default function MainLayout({ children, currentModule = 'dashboard', breadcrumbs, onModuleChange }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeModule, setActiveModule] = useState(currentModule)
  const { user, logout } = useAuth()
  const router = useRouter()
  
  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId)
    if (onModuleChange) {
      onModuleChange(moduleId)
    }
    // Navigate to the module page
    router.push(`/${moduleId}`)
  }

  // Color mode values - simplified to avoid hydration issues
  const bgColor = 'white'
  const borderColor = 'gray.200'
  const sidebarBg = 'gray.50'
  const contentBg = 'gray.50'

  return (
    <Flex h="100vh">
      {/* Sidebar */}
      <Box
        w={isCollapsed ? '80px' : '280px'}
        bg={sidebarBg}
        borderRight="1px"
        borderColor={borderColor}
        transition="width 0.2s"
        position="relative"
      >
        {/* Header */}
        <Flex
          h="60px"
          align="center"
          justify="space-between"
          px={4}
          borderBottom="1px"
          borderColor={borderColor}
        >
          {!isCollapsed && (
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              Docking Monitor
            </Text>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCollapsed(!isCollapsed)}
            suppressHydrationWarning
          >
            <Icon as={FiMenu} />
          </Button>
        </Flex>

        {/* Navigation */}
        <VStack spacing={1} p={3} align="stretch">
          {modules.map((module) => (
            <NavItem
              key={module.id}
              icon={module.icon}
              isActive={activeModule === module.id}
              onClick={() => handleModuleClick(module.id)}
              badge={module.id === 'finance-payment' ? '3' : undefined}
            >
              {isCollapsed ? '' : module.name}
            </NavItem>
          ))}
        </VStack>

      </Box>

      {/* Main Content */}
      <Flex flex="1" direction="column">
        {/* Top Header */}
        <Flex
          h="60px"
          bg={bgColor}
          borderBottom="1px"
          borderColor={borderColor}
          align="center"
          justify="space-between"
          px={6}
        >
          <Box>
            {breadcrumbs ? (
              <Breadcrumb separator=">">
                {breadcrumbs.map((crumb, index) => (
                  <BreadcrumbItem key={index}>
                    <BreadcrumbLink href={crumb.href} fontSize="sm">
                      {crumb.label}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                ))}
              </Breadcrumb>
            ) : (
              <Text fontSize="lg" fontWeight="medium">
                {modules.find(m => m.id === activeModule)?.name || 'Dashboard'}
              </Text>
            )}
          </Box>

          <HStack spacing={4}>
            <Button size="sm" variant="ghost" position="relative" suppressHydrationWarning>
              <Icon as={FiBell} />
              <Box
                position="absolute"
                top="5px"
                right="5px"
                w="8px"
                h="8px"
                bg="red.500"
                borderRadius="full"
              />
            </Button>
            
            <Menu>
              <MenuButton as={Button} variant="ghost" size="sm" rightIcon={<FiChevronDown />}>
                <HStack spacing={3}>
                  <Avatar size="sm" name={user?.fullName || user?.username || 'User'} />
                  <VStack spacing={0} align="start">
                    <Text fontSize="sm" fontWeight="medium">
                      {user?.fullName || user?.username || 'User'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {user?.role || 'Admin'}
                    </Text>
                  </VStack>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiUser />}>
                  Profile
                </MenuItem>
                <MenuItem icon={<FiSettings />}>
                  Settings
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<FiLogOut />} onClick={logout} color="red.500">
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>

        {/* Content Area */}
        <Box flex="1" overflow="auto" bg={contentBg}>
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}