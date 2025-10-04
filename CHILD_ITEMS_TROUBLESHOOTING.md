# Child Items Not Displaying - Troubleshooting Guide

## 🔍 **Issue Analysis**
Child items are being created successfully but not showing in the WorkPlan table.

## 🛠 **Root Causes & Solutions**

### 1. **API Data Structure Issue**
**Problem**: API might not be including children properly in the response.

**Solution**: API has been updated to always include children:
```typescript
// In /api/projects/[id]/work-items/route.ts
children: {
  include: {
    template: { /* ... */ },
    children: { /* ... */ }
  }
}
```

### 2. **Frontend State Management**
**Problem**: Children not being auto-expanded or displayed.

**Solutions Implemented**:
- ✅ Auto-expand parents with children
- ✅ Pass expandedRows state to WorkPlanTable
- ✅ Debug logging added

### 3. **Component Hierarchy**
**Problem**: WorkPlanTable might not be receiving proper props.

**Solution**: Updated component structure:
```typescript
<WorkPlanTable 
  workItems={filteredItems} 
  onUpdate={fetchWorkItems} 
  onDelete={handleDeleteWorkItem} 
  onAddChild={handleAddChildItem}
  projectId={selectedProjectId}
  expandedRows={expandedRows}
  setExpandedRows={setExpandedRows}
/>
```

## 🧪 **Testing Steps**

### Step 1: Check API Response
1. Open browser DevTools → Network tab
2. Create a child item
3. Refresh the page
4. Look for API call to `/api/projects/{id}/work-items`
5. Check if response includes `children` array in parent items

### Step 2: Check Console Logs
With debug logging added, you should see:
```
🔍 Parent "Your Parent Title" has 1 children: ["Child Title"]
📂 Auto-expanding parent: Your Parent Title (WI-123)
✅ Auto-expanded items: ["WI-123"]
🎯 Rendering parent "Your Parent Title" - Has 1 children, Expanded: true
   🔸 Rendering child "Child Title" at level 1
```

### Step 3: Visual Verification
1. Parent item should show expand/collapse button (▼)
2. Parent should be auto-expanded 
3. Child should appear with:
   - Gray background
   - Indented 30px
   - "REALISASI" in package column
   - "Realisasi:" prefix in title

## 🔧 **Quick Fixes**

### Fix 1: Force Refresh Data
```typescript
// After creating child, force refresh
await fetchWorkItems()
```

### Fix 2: Manual Expand Test
In browser console:
```javascript
// Find your parent item ID and manually expand
const expandedSet = new Set(['your-parent-item-id']);
// Check if this shows children
```

### Fix 3: Check Data Structure
In browser console after loading:
```javascript
// Check if children exist in data
console.log('Work items with children:', 
  window.workItems?.filter(item => item.children?.length > 0)
);
```

## 🎯 **Expected Behavior**

After creating a child item:
1. **API Response**: Parent item should have `children` array with the new child
2. **Frontend State**: `expandedRows` should include parent ID
3. **Visual Display**: 
   - Parent row with expand button (▼)
   - Child row indented with gray background
   - "Realisasi:" label above child description

## 🚀 **Immediate Actions**

1. **Test the functionality** - Create a child item and check browser console
2. **Check Network tab** - Verify API response structure  
3. **Report findings** - Share console logs to identify exact issue
4. **Manual expand** - Click expand button on parent to see if children appear

The code changes are complete and should work. The debug logging will help identify where the issue occurs in the data flow.