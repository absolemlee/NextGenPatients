# Discipline Collection Update Required

## Overview
The Disciplines collection schema has been updated to better reflect certification and licensing requirements.

## Changes Needed in Appwrite Console

### Rename/Replace Attributes in `disciplines` Collection:

1. **Delete old attributes:**
   - `certificationRequired` (Boolean) - DELETE
   - `certificationCriteria` (String) - DELETE

2. **Add new attributes:**

   **`minCertificationLevel`**
   - Type: Enum
   - Values: provider, advanced, master, instructor, licensed, admin
   - Default: provider
   - Required: No
   - Description: Minimum certification level required to practice in this discipline

   **`licenseRequired`**
   - Type: Boolean
   - Default: false
   - Required: No
   - Description: Whether providers need an official license/authorization

   **`licenseType`**
   - Type: Enum
   - Values: permit, mission, clinic, patent, license, charter
   - Required: No
   - Description: Type of license required (only relevant when licenseRequired is true)

## Concept Changes

### Old Model:
- `certificationRequired` (Boolean) - Yes/No whether certification needed
- `certificationCriteria` (Text) - Free-text description of requirements

### New Model:
- `minCertificationLevel` (Enum) - **Selectable minimum certification level** required to practice
  - This sets the bar for who can provide services in the discipline
  - Options: provider, advanced, master, instructor, licensed, admin
  
- `licenseRequired` (Boolean) - Whether an **official license/authorization** is needed
  - This is separate from certification level
  
- `licenseType` (Enum) - **Type of license** required
  - Options: permit, mission, clinic, patent, license, charter
  - Only applicable when licenseRequired is true
  - A discipline might require "advanced" certification AND a "clinic" license
  - Or it might require "provider" certification with a "permit"

## Migration Steps

1. **Backup Data (Optional)**
   - Export any existing `certificationCriteria` text if you want to preserve it
   - Note which disciplines had `certificationRequired = true`

2. **Update Collection in Appwrite Console:**
   - Navigate to: Databases → Your Database → disciplines collection → Attributes
   - Delete `certificationRequired` attribute
   - Delete `certificationCriteria` attribute
   - Create `minCertificationLevel` (Enum with 6 values)
   - Create `licenseRequired` (Boolean)
   - Create `licenseType` (Enum with 6 values: permit, mission, clinic, patent, license, charter)

3. **Set Initial Values:**
   - For disciplines that previously had `certificationRequired = true`, set `minCertificationLevel = "advanced"` or appropriate level
   - Set `licenseRequired` based on your business rules

## Code Updates Already Complete ✅

The following files have been updated to use the new schema:
- `/pages/admin/disciplines.js` - Main management page
- `/pages/admin/disciplines/[disciplineId].js` - Detail page
- `/DISCIPLINE_ARCHITECTURE.md` - Architecture documentation
- `/APPWRITE_SETUP_DISCIPLINES.md` - Setup guide

The UI now shows:
- Dropdown selector for minimum certification level
- Yes/No selector for license requirement
- Table columns showing both fields
- Stats card for license requirements
