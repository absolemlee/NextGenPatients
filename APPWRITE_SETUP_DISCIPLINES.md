# Appwrite Collection Setup Guide

## Required Collections for Discipline Management

You need to create three new collections in your Appwrite database. Here's how:

### 1. Create "disciplines" Collection

**Steps:**
1. Go to Appwrite Console → Your Project → Databases → Your Database
2. Click "Create Collection"
3. Collection ID: `disciplines`
4. Collection Name: `Disciplines`

**Attributes to add:**
- `name` (String, 255 characters, required)
- `description` (String, 5000 characters)
- `slug` (String, 255 characters, required)
- `imageUrl` (String, 500 characters)
- `status` (Enum: active, inactive, archived, default: active)
- `minCertificationLevel` (Enum: provider, advanced, master, instructor, licensed, admin, default: provider)
- `licenseRequired` (Boolean, default: false)
- `licenseType` (Enum: permit, mission, clinic, patent, license, charter) - Optional, only relevant when licenseRequired is true
- `leadProviderId` (String, 255 characters)

**Note:** Appwrite automatically manages `$createdAt` and `$updatedAt` as datetime attributes. Do not create these manually.

**Field Explanations:**
- `minCertificationLevel` - The minimum certification level a provider must have to offer services in this discipline
- `licenseRequired` - Whether providers need an official license/authorization
- `licenseType` - Specifies which type of license: permit, mission, clinic, patent, license, or charter

**Indexes:**
- Index 1: Key `slug`, Type: Unique, Attribute: slug
- Index 2: Key `status`, Type: Key, Attribute: status

**Permissions:**
- Read: Role: Users
- Create: Role: Users (or restrict to admin if you have custom roles)
- Update: Role: Users
- Delete: Role: Users

---

### 2. Create "services" Collection

**Steps:**
1. Click "Create Collection"
2. Collection ID: `services`
3. Collection Name: `Services`

**Attributes to add:**
- `disciplineId` (String, 255 characters, required)
- `name` (String, 255 characters, required)
- `description` (String, 5000 characters)
- `serviceType` (Enum: clinical, community, consult, ministerial, casework, coaching, admin, provider_support, customer_support, ceremonial, event, kava, orientation, retreat, group, default: clinical)
- `status` (Enum: active, inactive, under-review, archived, default: active)
- `certificationLevel` (Enum: provider, advanced, master, instructor, licensed, admin, default: provider)
- `duration` (Integer, default: 60)
- `capacity` (Integer, default: 1)
- `cost` (Float, default: 0)
- `approvedBy` (String, 255 characters)
- `reviewedDate` (DateTime) - Optional, set when service is reviewed
- `nextReviewDate` (DateTime) - Optional, for scheduling reviews
- `providerIds` (String, 10000 characters) - Store as JSON array string

**Note:** Appwrite automatically manages `$createdAt` and `$updatedAt` as datetime attributes. Do not create these manually.

**Indexes:**
- Index 1: Key `disciplineId`, Type: Key, Attribute: disciplineId
- Index 2: Key `status`, Type: Key, Attribute: status
- Index 3: Key `serviceType`, Type: Key, Attribute: serviceType

**Permissions:**
- Read: Role: Users
- Create: Role: Users
- Update: Role: Users
- Delete: Role: Users

---

### 3. Create "provider_disciplines" Collection

**Steps:**
1. Click "Create Collection"
2. Collection ID: `provider_disciplines`
3. Collection Name: `Provider Disciplines`

**Attributes to add:**
- `providerId` (String, 255 characters, required)
- `disciplineId` (String, 255 characters, required)
- `role` (Enum: practitioner, coordinator, lead, apprendtice, mentor, instructor, admin, technologist, author, chaplain, minister, adept, master, peer, default: practitioner)
- `certificationLevel` (Enum: provider, advanced, master, instructor, licensed, admin, default: provider)
- `certificationDate` (DateTime) - When provider was certified
- `certifiedBy` (String, 255 characters)
- `certificationExpiryDate` (DateTime) - When certification expires
- `serviceIds` (String, 10000 characters) - Store as JSON array string
- `status` (Enum: active, inactive, suspended, pending, under_review, default: pending)

**Note:** Appwrite automatically manages `$createdAt` and `$updatedAt` as datetime attributes. Do not create these manually.

**Indexes:**
- Index 1: Key `providerId`, Type: Key, Attribute: providerId
- Index 2: Key `disciplineId`, Type: Key, Attribute: disciplineId
- Index 3: Key `provider_discipline`, Type: Unique, Attributes: providerId, disciplineId

**Permissions:**
- Read: Role: Users
- Create: Role: Users
- Update: Role: Users
- Delete: Role: Users

---

## Update Environment Variables

Add these collection IDs to your `.env` file:

```env
NEXT_PUBLIC_DISCIPLINES_COLLECTION_ID=disciplines
NEXT_PUBLIC_SERVICES_COLLECTION_ID=services
NEXT_PUBLIC_PROVIDER_DISCIPLINES_COLLECTION_ID=provider_disciplines
```

## Update settings.config.js

Add to the COLLECTIONS object:

```javascript
export const COLLECTIONS = {
  DOCTORS: 'doctors',
  PATIENTS: 'patients',
  APPOINTMENTS: 'appointments',
  DISCIPLINES: 'disciplines',
  SERVICES: 'services',
  PROVIDER_DISCIPLINES: 'provider_disciplines'
};
```

## Verification

After creating all collections:
1. Visit `/admin/disciplines` to access Discipline Management
2. Create your first discipline
3. Click on a discipline to manage its services
4. Services can be categorized by type (clinical, administrative, etc.)
5. Providers can be certified for specific disciplines and services

## Next Steps

1. **Seed Initial Disciplines** - Convert your existing specialties to disciplines
2. **Define Services** - Break down each discipline into specific services
3. **Migrate Provider Data** - Link existing providers to disciplines
4. **Setup Certification Workflow** - Define how providers get certified
5. **Create Provider Certification UI** - Allow providers to request certification
