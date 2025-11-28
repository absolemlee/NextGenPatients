# Services Management Interface

## Overview
The Services Management page (`/admin/services`) provides comprehensive CRUD operations for all services across disciplines.

## Access
- **URL:** `/admin/services`
- **Role Required:** Admin
- **Quick Access:** Dashboard > Services card

## Features

### Service Creation
Create new services with the following fields:

**Required Fields:**
- **Discipline** - Select from existing disciplines (searchable dropdown)
- **Service Name** - Descriptive name of the service

**Optional Fields:**
- **Description** - Detailed explanation of what the service includes
- **Service Type** - Individual, Group, Workshop, Retreat, Online, In-Person
- **Duration** - Length in minutes (5-480 min, default: 60)
- **Cost** - Price in dollars (0 = free, accepts decimals)
- **Max Participants** - Maximum number of participants (1-100, default: 1)
- **Status** - Active or Inactive
- **Requires Approval** - Whether bookings need provider approval

### Service Table Columns

1. **Service Name** - Name + Discipline name below
2. **Description** - Full description (truncated)
3. **Type** - Color-coded tag (Individual, Group, Workshop, etc.)
4. **Duration** - Minutes
5. **Cost** - Dollar amount or "Free"
6. **Max Participants** - Number
7. **Status** - Active/Inactive tag
8. **Approval** - Required/Auto tag
9. **Actions** - Edit, Delete

### Statistics Dashboard

Five stat cards showing:
1. **Total Services** - All services count
2. **Active** - Active services count
3. **Individual** - Individual session count
4. **Group** - Group session count
5. **Paid Services** - Services with cost > 0

### Service Types

| Type | Use Case | Color |
|------|----------|-------|
| Individual | One-on-one sessions | Blue |
| Group | Multiple participants | Purple |
| Workshop | Educational sessions | Cyan |
| Retreat | Multi-day immersive | Magenta |
| Online | Virtual sessions | Green |
| In-Person | Physical location | Orange |

## Relationships

### Services → Disciplines
- Each service belongs to ONE discipline
- Services are filtered by discipline in provider certifications
- When viewing a discipline, all its services are shown

### Services → Provider Certifications
- Providers can be certified for specific services within a discipline
- Or certified for all services in a discipline (if no specific services selected)
- See `/admin/certifications` for managing provider-service relationships

### Services → Appointments
- Appointments reference services to define what's being booked
- Service settings (duration, cost, approval) apply to bookings

## Workflow Examples

### Example 1: Creating Individual Counseling Service
1. Navigate to `/admin/services`
2. Click "Create Service"
3. Select "Spiritual Counseling" discipline
4. Name: "Individual Spiritual Counseling Session"
5. Description: "One-on-one guidance session..."
6. Type: Individual
7. Duration: 60 minutes
8. Cost: $75.00
9. Max Participants: 1
10. Requires Approval: No
11. Click "Create"

### Example 2: Creating Group Workshop
1. Click "Create Service"
2. Select "Energy Healing" discipline
3. Name: "Group Energy Healing Workshop"
4. Type: Workshop
5. Duration: 120 minutes
6. Cost: $45.00
7. Max Participants: 12
8. Requires Approval: Yes
9. Click "Create"

### Example 3: Creating Free Online Service
1. Click "Create Service"
2. Select "Meditation" discipline
3. Name: "Introduction to Meditation"
4. Type: Online
5. Duration: 30 minutes
6. Cost: 0 (Free)
7. Max Participants: 50
8. Requires Approval: No
9. Click "Create"

## Approval Workflow

### Auto-Approve (Requires Approval = No)
- Client books service
- Appointment immediately confirmed
- Provider notified
- Client receives confirmation

### Manual Approval (Requires Approval = Yes)
- Client books service
- Appointment status: "Pending"
- Provider receives request
- Provider approves or rejects
- Client notified of decision

Use manual approval for:
- High-value services
- Limited availability sessions
- Services requiring pre-screening
- Specialized workshops

## Best Practices

### Naming Conventions
✅ **Good:**
- "Individual Spiritual Counseling Session"
- "Group Energy Healing Workshop"
- "Advanced Meditation Retreat (3-Day)"

❌ **Bad:**
- "Session"
- "Healing"
- "Thing we do"

### Descriptions
Include:
- What the service provides
- Who it's for
- What to expect
- What to bring (if applicable)
- Prerequisites (if any)

### Pricing
- Research market rates for similar services
- Consider provider expertise level
- Account for preparation time
- Group discounts (lower per-person cost)
- Free intro sessions for new clients

### Duration
- Include buffer time for setup/cleanup
- Account for intake/outtake time
- Standard increments: 30, 60, 90, 120 min
- Workshops: 120-240 min
- Retreats: full-day blocks

## Integration Points

### Admin Dashboard
- Quick link card to services management
- No stats shown on dashboard (available in services page)

### Disciplines Detail Page
- Shows all services for that discipline
- Inline create/edit for discipline-specific services
- Alternative to global services page

### Certifications Page
- Services appear in certification form
- Filtered by selected discipline
- Assigns service permissions to providers

### Booking Flow (Client-facing)
- Services populate booking dropdowns
- Only active services shown
- Filtered by provider certifications
- Duration and cost displayed

## Common Tasks

### Deactivating a Service
1. Find service in table
2. Click "Edit"
3. Change Status to "Inactive"
4. Click "Update"

Result: Service no longer available for booking but preserves historical data

### Updating Service Cost
1. Click "Edit" on service
2. Update "Cost" field
3. Click "Update"

Note: Does not affect existing appointments, only future bookings

### Changing Approval Requirement
1. Click "Edit" on service
2. Toggle "Requires Approval"
3. Click "Update"

Note: Affects all future bookings immediately

### Deleting a Service
1. Click "Delete" on service
2. Confirm deletion
3. Service permanently removed

⚠️ **Warning:** This cannot be undone. Consider deactivating instead.

## Troubleshooting

### Service Not Appearing in Booking
**Possible Causes:**
- Status is "Inactive"
- Discipline is not public (`isPublic = false`)
- No providers certified for this service
- Provider certification is inactive

**Solutions:**
1. Check service status in `/admin/services`
2. Verify discipline is public in `/admin/disciplines`
3. Check provider certifications in `/admin/certifications`
4. Ensure provider is verified

### Service Shows Wrong Information
**Fix:**
1. Edit service in `/admin/services`
2. Update incorrect fields
3. Save changes
4. Refresh booking page

### Can't Create Service
**Common Issues:**
- Discipline not selected (required)
- Service name empty (required)
- No disciplines exist yet

**Solutions:**
1. Create disciplines first in `/admin/disciplines`
2. Ensure all required fields filled
3. Check console for specific errors

## Future Enhancements

### Potential Features:
- **Bulk Import** - CSV upload for multiple services
- **Service Templates** - Pre-configured service types
- **Scheduling Rules** - Days/times service is available
- **Seasonal Services** - Active during specific dates
- **Resource Requirements** - Room, equipment needs
- **Add-ons** - Optional extras for services
- **Package Deals** - Bundle multiple services
- **Waitlist** - Auto-manage when fully booked
- **Recurring Services** - Weekly/monthly sessions
- **Client Reviews** - Feedback on services

### Recommended Additions:
1. Service categories/tags for filtering
2. Image upload for service marketing
3. Cancellation policy per service
4. Refund policy configuration
5. Service-specific intake forms
6. Automated reminder templates
7. Service analytics (bookings, revenue)
8. Duplicate service feature

## Database Schema

### Appwrite Collection: `services`

**Attributes:**
```
name: String (required)
description: String
disciplineId: String (required, relationship to disciplines)
serviceType: String (enum)
duration: Integer (minutes)
cost: Float (dollars)
status: String (active/inactive)
requiresApproval: Boolean
maxParticipants: Integer
$createdAt: DateTime (auto)
$updatedAt: DateTime (auto)
```

## Quick Reference

| Action | Steps |
|--------|-------|
| Create Service | Services > Create > Fill form > Create |
| Edit Service | Services > Find in table > Edit > Update |
| Delete Service | Services > Find in table > Delete > Confirm |
| View by Discipline | Disciplines > View > Services tab |
| Assign to Provider | Certifications > Create/Edit > Select services |

## Navigation

- **Dashboard → Services:** `/admin/dashboard` → Services card
- **Services → Dashboard:** Services page → "Back to Dashboard" button
- **Services → Discipline:** Edit service → View discipline link
- **Discipline → Services:** Disciplines > View > Services tab
