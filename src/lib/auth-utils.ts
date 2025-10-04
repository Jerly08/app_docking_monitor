/**
 * Authentication and authorization utility functions
 */

export interface User {
  id: string
  username: string
  email: string
  role: string
  fullName?: string
}

/**
 * Check if user has admin role
 * @param user - User object from context
 * @returns boolean indicating if user is admin
 */
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'ADMIN'
}

/**
 * Check if user has admin or manager role
 * @param user - User object from context
 * @returns boolean indicating if user is admin or manager
 */
export const isAdminOrManager = (user: User | null): boolean => {
  return user?.role === 'ADMIN' || user?.role === 'MANAGER'
}

/**
 * Check if user can perform dangerous operations (admin only)
 * @param user - User object from context
 * @returns boolean indicating if user can perform dangerous operations
 */
export const canPerformDangerousOperations = (user: User | null): boolean => {
  return isAdmin(user)
}

/**
 * Get user role display name
 * @param role - Role string
 * @returns formatted role name
 */
export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'ADMIN':
      return 'Administrator'
    case 'MANAGER':
      return 'Manager'
    case 'USER':
      return 'User'
    default:
      return 'Unknown'
  }
}

/**
 * Check if user has permission for specific project operations
 * @param user - User object from context
 * @param operation - Operation type ('view', 'edit', 'delete', 'force_delete')
 * @returns boolean indicating if user has permission
 */
export const hasProjectPermission = (user: User | null, operation: 'view' | 'edit' | 'delete' | 'force_delete'): boolean => {
  if (!user) return false

  switch (operation) {
    case 'view':
      return true // All authenticated users can view
    case 'edit':
      return isAdminOrManager(user)
    case 'delete':
      return isAdminOrManager(user)
    case 'force_delete':
      return isAdmin(user) // Only admins can force delete
    default:
      return false
  }
}