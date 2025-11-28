# Discipline & Services Architecture

## Overview
Disciplines are the highest-level organizational structure in the system. All provider services, community efforts, programs, and organizational support flow through Disciplines.

## Data Structure

### Disciplines Collection
**Collection Name:** `disciplines`

**Attributes:**
- `name` (string, required) - Name of the discipline (e.g., "Spiritual Counseling", "Energy Healing")
- `description` (text) - Detailed description of the discipline
- `slug` (string, unique) - URL-friendly identifier
- `imageUrl` (string) - Path to discipline image/icon
- `status` (enum: active, inactive, archived) - Current status
- `minCertificationLevel` (enum: provider, advanced, master, instructor, licensed, admin) - Minimum certification level required to practice in this discipline
- `licenseRequired` (boolean) - Whether providers need an official license
- `licenseType` (enum: n/a, permit, mission, clinic, patent, license, charter) - Type of license required (default: "n/a" when licenseRequired is false)
- `leadProviderId` (string) - User ID of discipline lead/coordinator
- `createdAt` (datetime) - Creation timestamp
- `updatedAt` (datetime) - Last update timestamp
- `metadata` (json) - Additional flexible data

**Indexes:**
- `slug` (unique)
- `status`

### Services Collection
**Collection Name:** `services`

**Attributes:**
- `disciplineId` (string, required) - Reference to parent discipline
- `name` (string, required) - Service name
- `description` (text) - Service description
- `serviceType` (enum: clinical, community, consult, ministerial, casework, coaching, admin, provider_support, customer_support, ceremonial, event, kava, orientation, retreat, group) - Type of service
- `status` (enum: active, inactive, under-review, archived)
- `certificationLevel` (enum: provider, advanced, master, instructor, licensed, admin) - Required certification
- `duration` (number) - Typical duration in minutes
- `capacity` (number) - Max participants/clients
- `cost` (number) - Base cost (if applicable)
- `approvedBy` (string) - Admin user ID who approved
- `reviewedDate` (datetime) - Last review date
- `nextReviewDate` (datetime) - Scheduled review date
- `providerIds` (array of strings) - Providers certified for this service
- `createdAt` (datetime)
- `updatedAt` (datetime)
- `metadata` (json)

**Indexes:**
- `disciplineId`
- `status`
- `serviceType`
- `certificationLevel`

### Provider-Discipline Relationship
**Collection Name:** `provider_disciplines`

**Attributes:**
- `providerId` (string, required)
- `disciplineId` (string, required)
- `role` (enum: practitioner, coordinator, lead, apprendtice, mentor, instructor, admin, technologist, author, chaplain, minister, adept, master, peer)
- `certificationLevel` (enum: provider, advanced, master, instructor, licensed, admin)
- `certificationDate` (datetime)
- `certifiedBy` (string) - Admin user ID
- `certificationExpiryDate` (datetime)
- `serviceIds` (array of strings) - Services this provider is certified for
- `status` (enum: active, inactive, suspended, pending, under_review)
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Indexes:**
- `providerId`
- `disciplineId`
- Compound: `providerId + disciplineId` (unique)

## Service Types

1. **Clinical** - Direct client care and consultations
2. **Community** - Community outreach, education, awareness programs
3. **Consult** - Consultation services
4. **Ministerial** - Ministerial and spiritual guidance services
5. **Casework** - Individual case management and support
6. **Coaching** - Personal development and coaching
7. **Admin** - Administrative services and operations
8. **Provider Support** - Support services for providers
9. **Customer Support** - Client support services
10. **Ceremonial** - Ceremonial and ritual services
11. **Event** - Events and gatherings
12. **Kava** - Kava ceremonies and sessions
13. **Orientation** - Orientation and onboarding
14. **Retreat** - Retreat programs and experiences
15. **Group** - Group sessions and activities

## Certification & Review Process

1. **Service Creation** - Admin creates service within discipline
2. **Review Period** - Service enters "under-review" status
3. **Approval** - Lead provider or admin approves service
4. **Provider Certification** - Providers apply for service certification
5. **Periodic Review** - Services reviewed on schedule
6. **Renewal/Updates** - Services updated based on review

## Admin Management Capabilities

- Create/Edit/Archive Disciplines
- Create/Edit/Archive Services within Disciplines
- Assign Discipline Leads
- Certify Providers for Disciplines/Services
- Review and approve Services
- Set certification criteria
- Monitor discipline activity and metrics
- Generate reports on services and providers
