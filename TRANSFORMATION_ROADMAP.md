# NextGenPatients → Spiritual Care Portal Transformation Roadmap

## Current State Analysis

### Existing Features
✅ User authentication (email/password)  
✅ Appointment booking system  
✅ User profiles  
✅ Search functionality  
✅ PWA capabilities  
✅ Responsive design  

### Missing/Needed Features
❌ Role-based access control (Patient/Practitioner/Admin)  
❌ Practitioner-specific dashboards  
❌ Admin panel  
❌ Spiritual care-specific content  
❌ Holistic wellness features  

---

## Phase 1: Understanding Current Architecture (✓ COMPLETE)

### Database Collections Identified
1. **Specialists/Doctors Collection** - Store practitioner profiles
2. **Appointments (Upcoming)** - Active bookings
3. **Appointments (History)** - Past sessions
4. **Users Database** - User information
5. **Storage Bucket** - Images/files

### Current User Flow
```
Index (/) → Login/Signup → Home → Browse Practitioners → Book Appointment
```

---

## Phase 2: Implement Role-Based Access Control

### Step 1: Add Role Selection to Signup
**File:** `/pages/sign-up.js`

```javascript
// Add role selection dropdown
const [userRole, setUserRole] = useState('seeker'); // seeker, practitioner, admin

// Options:
// - 'seeker' (spiritual seeker/patient)
// - 'practitioner' (spiritual care provider/healer)
// - 'admin' (portal administrator)
```

### Step 2: Create User Profile Collection
**Appwrite Console Setup:**

Create collection: `user_profiles`
```json
{
  "userId": "string (unique)",
  "role": "string (enum: seeker, practitioner, admin)",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "dateOfBirth": "datetime",
  
  // Seeker-specific
  "spiritualGoals": "string[]",
  "preferences": "object",
  
  // Practitioner-specific
  "specialty": "string[]", // e.g., meditation, reiki, counseling
  "certifications": "string[]",
  "bio": "string",
  "yearsOfPractice": "integer",
  "availability": "object",
  
  // Common
  "profileImage": "string (file ID)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Step 3: Create Role-Based Routing
**New files needed:**
- `/pages/seeker/dashboard.js` - For seekers
- `/pages/practitioner/dashboard.js` - For practitioners  
- `/pages/admin/dashboard.js` - For admins

---

## Phase 3: Transform Medical → Spiritual Care

### Terminology Changes
| Current | New |
|---------|-----|
| Doctor/Physician | Practitioner/Guide/Healer |
| Patient | Seeker/Client |
| Medical Appointment | Session/Consultation |
| Hospital | Wellness Center/Sanctuary |
| Prescription | Spiritual Practice Plan |
| Diagnosis | Assessment |

### Feature Adaptations

#### Home Page (`/pages/home.js`)
**Current:** Search for doctors by medical specialty  
**New:** Search for practitioners by:
- Modality (Meditation, Reiki, Sound Healing, etc.)
- Tradition (Buddhist, Shamanic, Eclectic, etc.)
- Focus Area (Trauma healing, Life purpose, Energy work)

#### Specialists Collection
**Transform to:** `practitioners` collection
```json
{
  "type": "Meditation Guide",
  "imgSrc": "/meditation-guide.svg",
  "link": "/practitioners/meditation",
  "description": "Inner peace and mindfulness practices"
}
```

#### Booking Page (`/pages/booking.js`)
**Add spiritual care specific fields:**
- Session type (In-person, Virtual, Hybrid)
- Intention for session
- Previous spiritual practices
- Specific concerns or goals

---

## Phase 4: Admin Panel Implementation

### Admin Dashboard Features
**File:** `/pages/admin/dashboard.js`

```javascript
// Admin capabilities:
1. View all users (seekers + practitioners)
2. Approve/verify practitioner accounts
3. Manage practitioner profiles
4. View appointment statistics
5. Content management (spiritual resources)
6. User support tickets
7. Platform analytics
```

### Admin Access Control
```javascript
// Middleware or protected route
const checkAdmin = async () => {
  const user = await accountClient.get();
  const prefs = await accountClient.getPrefs();
  
  if (prefs.role !== 'admin') {
    router.push('/unauthorized');
    return false;
  }
  return true;
};
```

### Create First Admin User
**Manual process via Appwrite Console:**
1. Sign up through the app normally
2. Open Appwrite Console → Auth → Users
3. Find your user account
4. Click "Update Preferences"
5. Add: `{ "role": "admin" }`

---

## Phase 5: New Spiritual Care Features

### 1. Wellness Resources Library
**New page:** `/pages/resources.js`
- Guided meditations (audio/video)
- Articles on spiritual practices
- Downloadable worksheets
- Community events calendar

### 2. Practice Tracking
**New page:** `/pages/seeker/practice-journal.js`
- Daily meditation log
- Mood/energy tracking
- Gratitude journal
- Progress visualization

### 3. Community Features
**New pages:**
- `/pages/community/circles.js` - Group sessions/circles
- `/pages/community/forum.js` - Discussion boards
- `/pages/community/events.js` - Workshops and retreats

### 4. Practitioner Tools
**New pages:**
- `/pages/practitioner/clients.js` - Client management
- `/pages/practitioner/availability.js` - Calendar management
- `/pages/practitioner/resources.js` - Share resources with clients
- `/pages/practitioner/notes.js` - Session notes (encrypted)

---

## Phase 6: Database Schema Redesign

### New Collections to Create

#### 1. `practitioners`
```json
{
  "userId": "string (link to auth)",
  "displayName": "string",
  "bio": "string",
  "specialties": "string[]",
  "certifications": "string[]",
  "languages": "string[]",
  "sessionTypes": "string[]",
  "rates": {
    "individual": "number",
    "group": "number"
  },
  "verified": "boolean",
  "rating": "number",
  "totalSessions": "number"
}
```

#### 2. `sessions` (replaces appointments)
```json
{
  "seekerId": "string",
  "practitionerId": "string",
  "sessionType": "string",
  "scheduledAt": "datetime",
  "duration": "number (minutes)",
  "intention": "string",
  "status": "string (scheduled/completed/cancelled)",
  "notes": "string (encrypted)",
  "followUp": "object"
}
```

#### 3. `spiritual_resources`
```json
{
  "title": "string",
  "type": "string (meditation/article/video/audio)",
  "category": "string",
  "description": "string",
  "content": "string",
  "fileId": "string",
  "author": "string",
  "tags": "string[]",
  "featured": "boolean"
}
```

#### 4. `practice_entries`
```json
{
  "userId": "string",
  "date": "datetime",
  "practiceType": "string",
  "duration": "number",
  "notes": "string",
  "mood": "string",
  "energy": "number (1-10)"
}
```

---

## Phase 7: UI/UX Transformation

### Color Palette Shift
**Current:** Medical green `#2A9988`  
**Consider:**
- Purple/Indigo: Spirituality, intuition (#7C3AED, #6366F1)
- Soft Gold: Enlightenment, wisdom (#F59E0B, #D97706)
- Deep Blue: Tranquility, depth (#1E40AF, #1E3A8A)
- Earth tones: Grounding (#92400E, #78350F)

### Icon & Imagery Updates
- Replace medical icons with spiritual symbols
- Use nature imagery (mandala, lotus, trees, water)
- Soft, calming aesthetic
- Inclusive spiritual imagery (multicultural)

---

## Phase 8: Testing & Deployment

### Test Scenarios
1. ✅ Seeker can browse practitioners
2. ✅ Seeker can book session
3. ✅ Practitioner can view bookings
4. ✅ Practitioner can manage availability
5. ✅ Admin can verify practitioners
6. ✅ Admin can view analytics
7. ✅ Resources are accessible
8. ✅ Practice journal saves data

### Environment Variables Needed
```env
# Appwrite Configuration
DATABASE_ID=your_database_id
COLLECTION_ID=practitioners_collection_id
USERS_DATABASE_ID=user_profiles_collection_id
SESSIONS_COLLECTION_ID=sessions_collection_id
RESOURCES_COLLECTION_ID=resources_collection_id
PRACTICE_ENTRIES_COLLECTION_ID=practice_entries_collection_id
BUCKET_ID=your_storage_bucket_id
PROJECT_ID=647e5f3a54caf6c3a4f7

# Feature Flags
ENABLE_COMMUNITY_FEATURES=true
ENABLE_PRACTICE_TRACKING=true
ENABLE_VIDEO_SESSIONS=true
```

---

## Quick Start Checklist

### Immediate Actions (Today)
- [ ] Access Appwrite Console (https://cloud.appwrite.io)
- [ ] Review existing database structure
- [ ] Create your first account via signup
- [ ] Manually set yourself as admin in Appwrite Console
- [ ] Document current data structure

### Week 1: Foundation
- [ ] Add role selection to signup
- [ ] Create user_profiles collection
- [ ] Implement role-based routing
- [ ] Create basic admin dashboard
- [ ] Update terminology (doctor → practitioner)

### Week 2: Core Features
- [ ] Transform specialists to practitioners
- [ ] Update booking flow for spiritual sessions
- [ ] Create practitioner dashboard
- [ ] Implement practitioner verification workflow

### Week 3: Enhanced Features
- [ ] Add resources library
- [ ] Implement practice journal
- [ ] Create community features (phase 1)
- [ ] Add practitioner tools

### Week 4: Polish & Testing
- [ ] UI/UX updates (colors, icons, imagery)
- [ ] Comprehensive testing
- [ ] Documentation
- [ ] Soft launch

---

## Key Files to Modify

### Priority 1 (Core Auth & Roles)
1. `/pages/sign-up.js` - Add role selection
2. `/pages/login.js` - Role-based redirect
3. `/appWrite-client/settings.config.js` - Add helper functions
4. `/pages/_app.js` - Add auth middleware

### Priority 2 (User Interfaces)
5. `/pages/home.js` - Rename doctor → practitioner
6. `/pages/booking.js` - Spiritual care fields
7. `/pages/appointments.js` - Rename to sessions
8. Create `/pages/admin/dashboard.js`
9. Create `/pages/practitioner/dashboard.js`

### Priority 3 (New Features)
10. Create `/pages/resources.js`
11. Create `/pages/seeker/practice-journal.js`
12. Update `/components/Nav.jsx` - Add new routes

---

## Resources & References

### Appwrite Documentation
- [Authentication](https://appwrite.io/docs/client/account)
- [Databases](https://appwrite.io/docs/client/databases)
- [Storage](https://appwrite.io/docs/client/storage)
- [Permissions](https://appwrite.io/docs/permissions)

### Spiritual Care Best Practices
- Confidentiality & privacy (HIPAA-like for spiritual care)
- Trauma-informed design
- Cultural sensitivity
- Accessibility considerations
- Consent & boundaries

---

## Support & Questions

If you need help with:
- **Appwrite setup**: Check Appwrite Discord
- **Next.js**: Next.js documentation
- **Role implementation**: Happy to provide code examples
- **Design decisions**: Let's discuss your vision

---

*Last Updated: [Current Date]*
*Project: NextGenPatients → Spiritual Care Portal*
