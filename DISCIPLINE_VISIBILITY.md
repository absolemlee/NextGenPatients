# Discipline Visibility System

## Overview
Disciplines now support three visibility levels controlled by two boolean flags: `isPublic` and `isInternal`.

## Visibility Levels

### 1. Public Disciplines (`isPublic = true`)
- **Visible To:** Everyone (public, clients, providers, admins)
- **Where Shown:** 
  - `/specialists` - Public disciplines directory
  - `/specialists/[category]` - Individual discipline pages
- **Use Cases:** 
  - Spiritual Counseling
  - Energy Healing
  - Meditation Guidance
  - Any client-facing services

### 2. Internal Disciplines (`isInternal = true`)
- **Visible To:** Providers and admins only
- **Where Shown:**
  - Provider dashboards
  - Provider directories
  - Admin interfaces
- **Use Cases:**
  - Provider Support
  - Training & Development
  - Quality Assurance
  - Internal Operations

### 3. Admin-Only Disciplines (`isPublic = false, isInternal = false`)
- **Visible To:** Admins only
- **Where Shown:**
  - Admin interfaces only
- **Use Cases:**
  - Administrative disciplines
  - Testing/Development disciplines
  - Archived/Inactive programs

## Database Schema

### Appwrite Collection: `disciplines`

**New Attributes:**
```
isPublic: Boolean (default: false)
isInternal: Boolean (default: false)
```

## Implementation Details

### Admin Interface (`/pages/admin/disciplines.js`)

**Form Fields:**
- Visual toggle switches for both `isPublic` and `isInternal`
- Color-coded UI:
  - Blue background for Public toggle
  - Purple background for Internal toggle
- Helper text explaining each option
- Warning when neither is selected (admin-only)

**Table Display:**
- New "Visibility" column showing tags:
  - Blue "Public" tag when `isPublic = true`
  - Purple "Internal" tag when `isInternal = true`
  - Gray "Admin Only" tag when both are `false`

### Public Directory (`/pages/specialists/index.js`)

**Filter Logic:**
```javascript
const publicDisciplines = response.documents.filter(
  d => d.status === 'active' && d.isPublic === true
);
```

Only disciplines with both conditions are shown:
- `status === 'active'`
- `isPublic === true`

### Discipline Detail Page (`/pages/specialists/[category].js`)

**Access Control:**
- Currently allows viewing but logs a warning for non-public disciplines
- Displays visibility tags at the top of the page
- TODO: Add authentication check to restrict access based on user role

**Visibility Indicators:**
```javascript
{!discipline.isPublic && <Tag color="gold">Private Discipline</Tag>}
{discipline.isInternal && <Tag color="purple">Internal Only</Tag>}
```

## Usage Examples

### Creating a Public Discipline
1. Navigate to `/admin/disciplines`
2. Click "Create Discipline"
3. Fill in name, description, etc.
4. Toggle **Public** switch ON
5. Save

Result: Discipline appears in `/specialists` for all users

### Creating an Internal Discipline (Provider-Only)
1. Navigate to `/admin/disciplines`
2. Click "Create Discipline"
3. Fill in name, description, etc.
4. Toggle **Internal Only** switch ON
5. Keep Public switch OFF
6. Save

Result: Discipline visible only to providers and admins

### Creating an Admin-Only Discipline
1. Navigate to `/admin/disciplines`
2. Click "Create Discipline"
3. Fill in name, description, etc.
4. Keep both Public and Internal switches OFF
5. Save

Result: Discipline visible only in admin interfaces

## Future Enhancements

### Recommended Additions:
1. **Provider Dashboard:** Show internal disciplines to authenticated providers
2. **Role-Based Access:** Enforce visibility at the authentication level
3. **Discipline Permissions:** Fine-grained control over who can view/edit each discipline
4. **Activity Logging:** Track when non-public disciplines are accessed
5. **Bulk Operations:** Quick way to change visibility for multiple disciplines

### Authentication Integration:
```javascript
// In /specialists/[category].js
if (!discipline.isPublic) {
  const user = await getCurrentUserProfile();
  
  if (!user) {
    // Redirect to login
    router.push('/login');
    return;
  }
  
  if (discipline.isInternal && user.role !== 'provider' && user.role !== 'admin') {
    // Unauthorized
    router.push('/specialists');
    return;
  }
  
  if (!discipline.isInternal && user.role !== 'admin') {
    // Admin-only discipline
    router.push('/specialists');
    return;
  }
}
```

## Testing Checklist

- [ ] Create public discipline, verify it appears in `/specialists`
- [ ] Create internal discipline, verify it does NOT appear in `/specialists`
- [ ] Create admin-only discipline, verify it only shows in admin interface
- [ ] Toggle discipline from public to private, verify it disappears from public directory
- [ ] Verify visibility tags display correctly in admin table
- [ ] Verify visibility toggles work in create/edit modal
- [ ] Test filtering and searching with mixed visibility disciplines
- [ ] Verify discipline detail page shows appropriate visibility tags

## Migration Notes

### Existing Disciplines
All existing disciplines default to:
- `isPublic = false`
- `isInternal = false`

This means they are **admin-only** by default.

**Action Required:** Review all existing disciplines and set appropriate visibility flags.

### Recommended Migration Steps:
1. Export list of all disciplines
2. Categorize each as Public, Internal, or Admin-Only
3. Bulk update visibility flags
4. Test public directory to ensure expected disciplines appear
5. Notify providers about internal discipline access
