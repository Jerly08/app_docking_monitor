# Admin Project Deletion Feature

## Overview
Tambahan fitur untuk admin yang memungkinkan menghapus project bahkan jika memiliki work items, dengan dialog konfirmasi yang lebih ketat dan logging untuk audit.

## Features Added

### 1. Role-based Permission System
- File: `src/lib/auth-utils.ts`
- Functions untuk mengecek permission berdasarkan user role
- Admin memiliki akses penuh untuk force delete

### 2. Enhanced API Endpoint 
- File: `src/app/api/projects/[id]/route.ts`
- Support parameter `?force=true` untuk admin force delete
- Proper authentication dan authorization checks
- Detailed logging untuk audit trail

### 3. Updated UI Components
- File: `src/components/Project/ProjectManager.tsx`  
- Different buttons untuk admin vs regular users
- Force delete button (⚠️ icon) untuk projects dengan work items
- Enhanced confirmation dialogs

## User Experience by Role

### Regular Users (USER/MANAGER)
- Dapat delete projects yang tidak memiliki work items
- Tidak dapat delete projects dengan work items
- Button delete akan disabled jika project memiliki work items

### Admin Users (ADMIN)
- Dapat delete semua projects
- Button force delete (⚠️) muncul untuk projects dengan work items
- Comprehensive confirmation dialog dengan warnings
- Action di-log untuk audit

## Safety Features

### 1. Authentication & Authorization
- JWT token verification
- Role-based access control
- Only ADMIN can force delete

### 2. Confirmation Dialogs
- Regular delete: standard confirmation
- Force delete: comprehensive warning dengan checklist
- Clear indication of consequences

### 3. Audit Logging
- All delete actions logged dengan user info
- Force deletes clearly marked in logs
- Traceable untuk compliance

## API Usage

### Regular Delete
```
DELETE /api/projects/{id}
Authorization: Bearer {token}
```

### Force Delete (Admin Only)  
```
DELETE /api/projects/{id}?force=true
Authorization: Bearer {token}
```

### Response Examples

#### Success
```json
{
  "message": "Project deleted successfully",
  "deletedProject": {
    "id": "proj_123",
    "name": "MT. Test Project",
    "workItemsCount": 5,
    "forceDeleted": true
  }
}
```

#### Permission Denied
```json
{
  "error": "Insufficient permissions. Only administrators can force delete projects."
}
```

## Testing Scenarios

### 1. Admin User Tests
- ✅ Can delete empty projects
- ✅ Can delete projects with work items using regular delete flow → force delete
- ✅ Can use force delete button directly
- ✅ Sees proper confirmation dialogs
- ✅ Actions are logged

### 2. Manager/User Tests  
- ✅ Can delete empty projects
- ✅ Cannot delete projects with work items
- ✅ Force delete button not visible
- ✅ API rejects force delete requests

### 3. Security Tests
- ✅ JWT token validation
- ✅ Role verification  
- ✅ Proper error messages
- ✅ No unauthorized access

## Screenshots/Mockups

### Admin View
```
Project: "MT. Test Project"
[📊 Stats] [✏️ Edit] [🗑️ Delete] [⚠️ Force Delete]
                                    ↑ Only for admins
```

### Force Delete Dialog
```
⚠️ Force Delete Project (Admin Action)

🚨 DANGER: Force Delete Action
This will permanently delete the project and ALL associated data.

Project: MT. Test Project  
📊 Work Items: 25
⚡ This action will delete the project and all work items permanently

⚠️ Admin Responsibility
As an administrator, you have authority to override normal restrictions.
Please ensure you have:
✅ Confirmed with the project team
✅ Backed up any necessary data  
✅ Understood the business impact

This action is logged and traceable to your admin account.

[Cancel] [🗑️ Force Delete Project]
```

## Implementation Complete ✅

All features have been implemented and are ready for testing:
1. ✅ Admin permission utilities
2. ✅ Enhanced API with force delete support  
3. ✅ Updated UI with role-based buttons
4. ✅ Comprehensive confirmation dialogs
5. ✅ Proper error handling and logging

## Next Steps
- Test with actual admin and non-admin users
- Verify audit logging works correctly
- Optional: Add email notifications for force deletes
- Optional: Add bulk delete functionality for admins