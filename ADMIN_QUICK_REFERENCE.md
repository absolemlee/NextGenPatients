# Admin Interface Quick Reference

## Navigation Map

### Main Dashboard
**URL**: `/admin/dashboard`

**Quick Actions**:
- View system statistics
- Access all management areas via quick links
- See recent providers and clients

---

## Management Pages

### 1. Providers Management
**URL**: `/admin/providers`

**Actions**:
- ➕ Add Provider
- ✏️ Edit Provider
- ✅ Verify/Unverify Provider (one-click toggle)
- 🗑️ Delete Provider

**Key Features**:
- Searchable/sortable table
- Role assignment (Provider/Admin)
- License number tracking
- Verification workflow

---

### 2. Clients Management
**URL**: `/admin/clients`

**Actions**:
- ➕ Add Client
- ✏️ Edit Client
- 🗑️ Delete Client

**Key Features**:
- Contact information management
- Emergency contact tracking
- Registration date tracking
- Address management

---

### 3. Disciplines Management
**URL**: `/admin/disciplines`

**Actions**:
- ➕ Add Discipline
- ✏️ Edit Discipline
- 🗑️ Delete Discipline
- 👁️ View Details (click row → services page)

**Key Features**:
- License type configuration
- Minimum certification level
- Lead provider assignment
- Active/Inactive status

#### Discipline Detail Page
**URL**: `/admin/disciplines/[disciplineId]`

**Tabs**:
1. **Services** (CRUD)
   - Add/Edit/Delete services
   - Service types, pricing, duration
   
2. **Certified Providers** (Read-only)
   - View all providers certified in this discipline
   - See roles and certification levels

---

### 4. Provider Certifications
**URL**: `/admin/certifications`

**Actions**:
- ➕ Assign Certification
- 🔄 Toggle Active/Inactive
- 🗑️ Remove Certification

**Key Features**:
- Assign provider to discipline
- Set role (14 options)
- Set certification level (6 levels)
- Select specific service permissions
- Active/Inactive toggle

**Certification Levels**:
1. Foundational
2. Intermediate
3. Advanced
4. Expert
5. Master
6. Grandmaster

---

### 5. Appointments Management
**URL**: `/admin/appointments`

**Actions**:
- ✅ Confirm Appointment (pending → confirmed)
- ✔️ Mark Complete (confirmed → completed)
- ❌ Cancel Appointment (any → cancelled)
- 🗑️ Delete Appointment

**Filters**:
- Status (Pending/Confirmed/Completed/Cancelled)
- Provider (searchable dropdown)
- Date Range (calendar picker)

**Key Features**:
- Status workflow management
- Advanced filtering
- Provider and client name display
- Appointment notes viewing

---

## Common Patterns

### Modal Forms
All create/edit operations use modal dialogs with:
- Form fields
- Validation
- Save/Cancel buttons
- Success/Error messages

### Delete Confirmations
All delete operations show confirmation dialog:
```
"Are you sure you want to delete this [entity]?"
"This action cannot be undone."
[Cancel] [Delete]
```

### Table Features
- **Sorting**: Click column headers
- **Pagination**: 10 items per page
- **Search**: Provider/Client dropdowns support search
- **Actions Column**: Edit/Delete/Status buttons

### Status Indicators
- **Tags**: Colored badges for roles, statuses, levels
- **Toggle Buttons**: One-click status changes
- **Icons**: Visual indicators for actions

---

## Color Scheme

| Color | Usage |
|-------|-------|
| **Teal (#2A9988)** | Primary actions, Provider management |
| **Blue** | Clients, Confirmed status |
| **Purple** | Disciplines, Admin roles |
| **Orange** | Certifications, Pending status |
| **Green** | Completed, Active, Verified |
| **Red** | Delete, Cancel, Inactive |
| **Gold** | Intermediate certifications |

---

## Statistics Cards

Each management page shows relevant stats:

### Dashboard
- Total Providers
- Total Clients
- Pending Verifications
- Active Disciplines
- Total Appointments

### Providers
- Total Providers
- Verified
- Pending
- Admins

### Clients
- Total Clients
- New This Month
- With Emergency Contact

### Disciplines
- Total Disciplines
- Active Disciplines
- Requiring License
- Avg Services per Discipline

### Certifications
- Total Certifications
- Active Certifications
- Certified Providers
- Active Disciplines

### Appointments
- Total
- Pending
- Confirmed
- Completed
- Cancelled

---

## Keyboard & UI Tips

### Search in Dropdowns
- Start typing to filter options
- Works in Provider, Client, Discipline selectors

### Date Range Picker
- Click calendar icon
- Select start date
- Select end date
- Click outside to close

### Clear Filters
- "Clear Filters" button appears when filters active
- Resets all filters to default (All)

### Table Sorting
- Click column header to sort ascending
- Click again to sort descending
- Default sort: varies by page (usually by date or name)

---

## Workflow Examples

### Onboard New Provider
1. Go to `/admin/providers`
2. Click "Add Provider"
3. Fill in: Name, Email, Phone, Discipline, License Number
4. Set Role (Provider or Admin)
5. Set Verification Status (usually Pending initially)
6. Click "Create"
7. Provider appears in table
8. Go to `/admin/certifications`
9. Click "Add Certification"
10. Select the new provider and discipline
11. Set Role and Certification Level
12. Optionally select specific services
13. Click "Create"

### Manage Appointment
1. Go to `/admin/appointments`
2. Use filters to find appointment (by provider, date, status)
3. For pending appointment: Click "Confirm" or "Cancel"
4. For confirmed appointment: Click "Mark Complete"
5. Status updates immediately
6. To delete: Click "Delete" → Confirm

### Setup New Discipline
1. Go to `/admin/disciplines`
2. Click "Add Discipline"
3. Fill in: Name, Description, Slug
4. Set Status (Active/Inactive)
5. Set Minimum Certification Level
6. Toggle "License Required" if needed
7. If license required, select License Type
8. Optionally assign Lead Provider
9. Click "Create"
10. Click on discipline row to access detail page
11. Go to "Services" tab
12. Click "Add Service"
13. Fill in service details (Name, Type, Price, Duration)
14. Click "Create"
15. Repeat for all services in this discipline

---

## Access Control

**Required Role**: `admin`

**What happens if not admin**:
- Redirected to `/home`
- Cannot access any `/admin/*` pages

**Authentication Check**:
- Runs on every admin page load
- Uses `getCurrentUserProfile()` helper
- Checks `profile.role === 'admin'`

---

## Error Handling

### Success Messages
Green notifications at top of screen:
- "Provider created successfully!"
- "Appointment updated successfully!"
- "Certification removed successfully!"

### Error Messages
Red notifications at top of screen:
- "Failed to save provider"
- "Failed to update appointment"
- "Failed to remove certification"

### Validation
- Required fields marked with *
- Email format validation
- Confirmation dialogs for destructive actions

---

## Data Relationships

```
Provider ──┐
           │
           ├──→ Provider_Discipline (Certification)
           │
Discipline ┘         ↓
    ├──→ Services ───┘
    └──→ License Type

Client ────→ Appointment ←──── Provider
```

---

## Browser Support

- **Chrome/Edge**: ✅ Full support
- **Firefox**: ✅ Full support
- **Safari**: ✅ Full support
- **Mobile**: ⚠️ Responsive, but best on desktop/tablet

---

## Performance Notes

- Tables paginate at 10 items (configurable)
- Search dropdowns handle 100+ items smoothly
- Filters apply client-side (fast)
- All data loads on page mount (single fetch)

---

## Support & Troubleshooting

### Page won't load
- Check authentication (try logging out/in)
- Verify admin role in database
- Check browser console for errors

### Can't create/edit
- Ensure required fields filled (marked with *)
- Check database connection
- Verify Appwrite collections exist

### Data not showing
- Refresh page
- Check database has data
- Verify collection IDs in settings.config.js

---

## Quick Links Summary

| Page | URL | Primary Action |
|------|-----|---------------|
| Dashboard | `/admin/dashboard` | Overview & navigation |
| Providers | `/admin/providers` | Manage provider profiles |
| Clients | `/admin/clients` | Manage client profiles |
| Disciplines | `/admin/disciplines` | Configure disciplines |
| Discipline Detail | `/admin/disciplines/[id]` | Manage services |
| Certifications | `/admin/certifications` | Assign provider certs |
| Appointments | `/admin/appointments` | View/manage bookings |

---

**Last Updated**: System ready for full admin management operations
**Status**: ✅ All CRUD operations functional
