# Frontend Integration Testing Guide
## Admin Project Deletion Feature

## Overview
Panduan testing untuk integrasi fitur admin project deletion dengan frontend yang sudah ada.

## UI Components Updated

### 1. ProjectSelector Component (`src/components/Project/ProjectSelector.tsx`)
**Changes Made:**
- ✅ Added `ProjectManager` component integration
- ✅ Added admin permission checks with `hasProjectPermission()`
- ✅ Added admin indicators in project dropdown (⚠️ for projects with work items)
- ✅ Added "ADMIN" badge in project info section
- ✅ Added "Manage Projects" button for admin/manager users

### 2. Frontend Integration Points
- **Project Dropdown**: Shows admin-specific indicators
- **Project Info Section**: Shows admin status badge and manage button
- **Button Visibility**: Role-based button showing/hiding

## Testing Scenarios

### 1. **Admin User Login**
```
Steps:
1. Login with admin credentials
2. Navigate to Work Plan & Report page
3. Verify admin indicators appear
```

**Expected Results:**
- ✅ "ACCESS: ADMIN" badge visible in project info
- ✅ "Manage Projects" button visible
- ✅ Projects with work items show ⚠️ in dropdown
- ✅ Force delete option available in ProjectManager modal

### 2. **Manager User Login**  
```
Steps:
1. Login with manager credentials
2. Navigate to Work Plan & Report page
3. Check available actions
```

**Expected Results:**
- ✅ "Manage Projects" button visible (regular delete only)
- ✅ No admin badge shown
- ✅ No force delete options in modal
- ✅ Cannot delete projects with work items

### 3. **Regular User Login**
```
Steps:
1. Login with user credentials  
2. Navigate to Work Plan & Report page
3. Check button visibility
```

**Expected Results:**
- ❌ No "Manage Projects" button
- ❌ No admin indicators
- ❌ No delete options available

### 4. **Admin Project Deletion Flow**
```
Steps:
1. Login as admin
2. Select project with work items
3. Click "Manage Projects" button
4. Try regular delete → should show force delete option
5. Use force delete with confirmation dialog
```

**Expected Results:**
- ✅ Comprehensive warning dialog appears
- ✅ Project and work items deleted successfully
- ✅ Success toast notification
- ✅ Project list refreshed
- ✅ Selection cleared if current project deleted

## Visual Indicators

### Project Dropdown Options
```
Regular User View:
- TEST001 (5 tasks)
- MV. OCEAN STAR (20 tasks) - COMPLETED

Admin View:  
- TEST001 (5 tasks) ⚠️
- MV. OCEAN STAR (20 tasks) ⚠️
- Legacy Project (0 tasks)
```

### Project Info Section
```
Regular User:
┌─────────────────────────────────────┐
│ TEST001                      ACTIVE │
│ VESSEL: MT. Test | TASKS: 5         │
│ CREATED: 10/04/2025          [⚙️]   │
└─────────────────────────────────────┘

Admin User:
┌─────────────────────────────────────────┐
│ TEST001                        ACTIVE   │  
│ VESSEL: MT. Test | ACCESS: ADMIN        │
│ TASKS: 5 | CREATED: 10/04/2025          │
│                            [👥] [⚙️]    │
│                            ↑ Manage     │
└─────────────────────────────────────────┘
```

## API Integration Points

### Authentication Check
```typescript
// ProjectSelector checks user role
const { user } = useAuth()
const canManageProjects = hasProjectPermission(user, 'delete')
const isAdminUser = isAdmin(user)
```

### Project Refresh Integration
```typescript
// When ProjectManager updates/deletes projects
const handleProjectsUpdated = () => {
  fetchProjects() // Refresh project list
  // Clear selection if current project deleted
  if (!projects.find(p => p.id === selectedProjectId)) {
    setSelectedProject(null)
    onProjectChange('', null)
  }
}
```

## Error Handling

### Frontend Error Scenarios
1. **Token Expired**: Redirects to login
2. **Insufficient Permissions**: Shows error toast
3. **Network Error**: Shows retry message
4. **Project Not Found**: Refreshes project list

### User Feedback
- ✅ Success toasts for completed operations
- ✅ Error toasts with specific messages  
- ✅ Loading states during operations
- ✅ Confirmation dialogs for dangerous actions

## Integration Status: ✅ COMPLETE

All frontend components have been updated and integrated:
- [x] Admin permission system
- [x] Role-based UI elements  
- [x] ProjectManager integration
- [x] Visual indicators and feedback
- [x] Error handling and validation

## Ready for Testing

The system is now ready for end-to-end testing with actual admin, manager, and user accounts to verify all functionality works as expected across different user roles.