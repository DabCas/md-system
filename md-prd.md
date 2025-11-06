# Merit & Demerit System - Product Requirements Document (PRD)

## 1. Overview
A Progressive Web App (PWA) for managing the school's **Merit and Demerit system**, replacing the current paper-based process. The app allows teachers to issue merits/demerits, students to view their progress, and principals to monitor trends, reports, and raffle draws.

**Timezone:** All timestamps use Asia/Manila (Philippine Time)

---

## 2. Core Rules

### Merit System
- Students can earn merits throughout the school week
- **Every 5 merits = 1 uniform pass + 1 raffle entry**
- Teachers have a limit of **5 merits per week (resets every Monday 00:00 PHT)**
- Teachers can issue multiple merits per submission (1–5) using a number picker
- Merit/demerit **counts reset on the 1st day of each calendar month** (e.g., Feb 1, Mar 1)
- Historical records are **permanently archived** (not deleted)
- Raffle entries calculated monthly based on total merits earned that month (15 merits = 3 raffle entries)

### Demerit System
- Demerits issued for violations (speaking non-English, tardiness, uniform issues, etc.)
- Quantity picker: 1–3 demerits per submission
- **Accumulating 3 demerits in a month = automatic detention**
- No teacher quota (unlimited issuance)
- Demerit counts reset monthly (same as merits)

---

## 3. User Roles & Permissions
### Teachers
- Issue merits and demerits.
- View summary of merits/demerits issued today.
- See remaining weekly merit quota.
- Can edit or delete own entries within 1 hour (silent update, no logs).
- Always signed in until logout.

### Principal
- View weekly/monthly summaries (auto-generated).
- Filter/search by student name, grade, or section.
- Edit (but not delete) any record.
- Manage raffle prizes, perform draws, and view reports.
- Upload new student roster (Excel/CSV).
- Automatically receives generated reports on dashboard (no email notifications).

### Students (and Parents)
- Login via Google SSO (shared credentials for student/parent).
- View personal dashboard with:
  - Merit and demerit progress bars.
  - Weekly progress toward uniform pass.
  - Full date/time, reason, and teacher name per record.
  - Recent activity with motivational messages.

---

## 4. Raffle System
- Monthly raffle draw.
- Principal manages prize pool (add, edit, remove prizes).
- **Two-stage spinner system:**
  1. Spin for prize (random from available list).
  2. Spin for winner (eligible students).
- Winners can win multiple times until all entries are used.
- Prizes auto-marked as claimed once drawn.

---

## 5. Principal Dashboard
- Combination layout:
  - Action items (uniform pass list, detention list).
  - Weekly/monthly summaries.
  - Charts: top merit reasons, common demerit causes.
- Auto-generated reports (weekly & monthly).
- Data export options: Excel (.xlsx) and PDF.
- Full search/filter system by grade, section, or name.
- Reports grouped by **student**, not teacher.

---

## 6. Teacher Dashboard
- Summary view showing:
  - Merits and demerits issued today.
  - Remaining merit quota (5 per week).
- Quick buttons for issuing merit/demerit.
- Minimal UI for fast mobile use.
- No recent action list (clean interface).

---

## 7. Data & Records
- Each record stores:
  - Student name, grade, section.
  - Teacher name.
  - Reason and type (Merit/Demerit).
  - Quantity (1–5 for merits, 1–3 for demerits).
  - Auto-filled date and time (non-editable by teacher).
- Principal may edit, but not delete.
- Students see full date/time and teacher name.

---

## 8. Roster Management
- Principal uploads **Excel/CSV** file each school year.
- File includes:
  - Full name (official)
  - English nickname
  - Grade
  - Section
  - Email
- Uploading a new roster starts a new academic year automatically.

---

## 9. Reports & Retention
- Reports automatically generated weekly and monthly.
- Stored on principal dashboard (view/download anytime).
- No email notifications.
- Data retained for the **current school year** only.
- Old school years archived (accessible to admins only).

---

## 10. System Features
- **Google SSO** for all logins (students, teachers, principal)
  - OAuth project can be created with personal Google account
  - App will validate allowed email domains in application logic
- **PWA** (installable on phones and desktops via manifest.json + service workers)
- **Offline Support:**
  - Service workers cache static assets
  - IndexedDB stores records locally when offline
  - Auto-sync when connection restored
  - Conflict resolution: server timestamp wins
- **Dark/Light Mode** toggle (persisted to localStorage)
- **Role-based access control** via Supabase RLS policies
- **Audit logs** stored internally (viewable by principal only)

---

## 11. Tech Stack (2025 Best Practices)

### Frontend
- **Framework:** Next.js 14+ (App Router, React Server Components)
- **Language:** TypeScript (strict mode)
- **UI Components:** shadcn/ui + Radix UI primitives
- **Styling:** Tailwind CSS v4
- **Forms:** React Hook Form + Zod validation
- **State Management:** TanStack Query (server state) + Zustand (client state)
- **Date/Time:** date-fns (with date-fns-tz for timezone)
- **Charts:** Recharts
- **Icons:** Lucide React
- **PWA:** Serwist (next-pwa successor)

### Backend & Infrastructure
- **Backend/Database:** Supabase (PostgreSQL + Auto REST API + Realtime + Auth + Storage)
- **Serverless Functions:** Supabase Edge Functions (Deno runtime) for:
  - Weekly quota reset job
  - Monthly reset job
  - Report generation
  - Raffle calculations
- **Auth:** Supabase Auth with Google OAuth provider
- **File Storage:** Supabase Storage (reports, roster uploads)
- **Hosting:** Vercel (frontend + edge functions)

### Development Tools
- **Package Manager:** pnpm
- **Linting:** ESLint + Prettier
- **Git Hooks:** Husky + lint-staged
- **Database Migrations:** Supabase CLI
- **API Client:** Auto-generated from Supabase (typed)

### Additional Libraries
- **Excel Export:** ExcelJS
- **PDF Export:** jsPDF + jsPDF-AutoTable
- **File Upload:** react-dropzone
- **CSV Parsing:** PapaParse
- **Notifications:** react-hot-toast or sonner
- **Loading States:** Skeleton components from shadcn/ui

---

## 12. Database Schema (Supabase)

### Tables

#### `users`
| Column | Type | Description |
|--------|------|--------------|
| id | uuid | Primary key (matches Supabase auth.users.id) |
| email | text | Email from Google SSO |
| role | enum('student','teacher','principal') | User role |
| full_name | text | Full name |
| created_at | timestamptz | Auto timestamp |
| updated_at | timestamptz | Auto timestamp |

**Indexes:** `email` (unique), `role`

---

#### `students`
| Column | Type | Description |
|--------|------|--------------|
| id | uuid | Primary key |
| user_id | uuid (FK → users.id) | Links to user account |
| full_name | text | Official student name |
| english_name | text | English nickname |
| grade | text | Grade level (e.g., "7", "8", "9") |
| section | text | Section name (e.g., "A", "B") |
| academic_year_id | uuid (FK → academic_years.id) | Current school year |
| created_at | timestamptz | Auto timestamp |
| updated_at | timestamptz | Auto timestamp |

**Indexes:** `user_id` (unique), `academic_year_id`, `grade`, `section`

---

#### `teachers`
| Column | Type | Description |
|--------|------|--------------|
| id | uuid | Primary key |
| user_id | uuid (FK → users.id) | Links to user account |
| name | text | Teacher's full name |
| created_at | timestamptz | Auto timestamp |
| updated_at | timestamptz | Auto timestamp |

**Indexes:** `user_id` (unique)

---

#### `principals`
| Column | Type | Description |
|--------|------|--------------|
| id | uuid | Primary key |
| user_id | uuid (FK → users.id) | Links to user account |
| name | text | Principal's full name |
| created_at | timestamptz | Auto timestamp |
| updated_at | timestamptz | Auto timestamp |

**Indexes:** `user_id` (unique)

---

#### `academic_years`
| Column | Type | Description |
|--------|------|--------------|
| id | uuid | Primary key |
| year_name | text | e.g., "2024-2025" |
| start_date | date | School year start |
| end_date | date | School year end |
| is_active | boolean | Only one can be true |
| created_at | timestamptz | Auto timestamp |

**Indexes:** `is_active`

---

#### `records`
| Column | Type | Description |
|--------|------|--------------|
| id | uuid | Primary key |
| student_id | uuid (FK → students.id) | Related student |
| teacher_id | uuid (FK → teachers.id) | Issuing teacher |
| academic_year_id | uuid (FK → academic_years.id) | School year |
| type | enum('merit', 'demerit') | Record type |
| reason | text | Description or violation |
| quantity | int | 1–5 for merits, 1–3 for demerits |
| created_at | timestamptz | Auto timestamp (PHT) |
| updated_at | timestamptz | Auto timestamp on edit |
| edited_by | uuid (FK → users.id) | Who edited last |
| is_deleted | boolean | Soft delete flag (default false) |

**Indexes:** `student_id`, `teacher_id`, `academic_year_id`, `type`, `created_at`

---

#### `uniform_passes`
| Column | Type | Description |
|--------|------|--------------|
| id | uuid | Primary key |
| student_id | uuid (FK → students.id) | Who earned it |
| academic_year_id | uuid (FK → academic_years.id) | School year |
| earned_on | timestamptz | When earned (auto) |
| merits_count | int | Merits that triggered it (5, 10, 15...) |
| month | text | Month earned (e.g., "2025-01") |
| created_at | timestamptz | Auto timestamp |

**Indexes:** `student_id`, `month`, `academic_year_id`

---

#### `detentions`
| Column | Type | Description |
|--------|------|--------------|
| id | uuid | Primary key |
| student_id | uuid (FK → students.id) | Who received detention |
| academic_year_id | uuid (FK → academic_years.id) | School year |
| triggered_on | timestamptz | When 3 demerits reached |
| demerits_count | int | Total demerits at trigger (usually 3) |
| month | text | Month triggered (e.g., "2025-01") |
| status | enum('pending','served','excused') | Detention status |
| created_at | timestamptz | Auto timestamp |

**Indexes:** `student_id`, `month`, `academic_year_id`, `status`

---

#### `raffle_prizes`
| Column | Type | Description |
|--------|------|--------------|
| id | uuid | Primary key |
| academic_year_id | uuid (FK → academic_years.id) | School year |
| prize_name | text | e.g., "SM Gift Card ₱500" |
| month | text | Raffle month (e.g., "2025-01") |
| claimed | boolean | True when drawn |
| winner_id | uuid (FK → students.id) | Winner (null if unclaimed) |
| drawn_at | timestamptz | When prize was drawn |
| created_at | timestamptz | Auto timestamp |

**Indexes:** `academic_year_id`, `month`, `claimed`

---

#### `raffle_entries`
| Column | Type | Description |
|--------|------|--------------|
| id | uuid | Primary key |
| student_id | uuid (FK → students.id) | Participant |
| academic_year_id | uuid (FK → academic_years.id) | School year |
| month | text | Month of raffle (e.g., "2025-01") |
| total_entries | int | Total entries (merits ÷ 5) |
| remaining_entries | int | Decreases as prizes won |
| created_at | timestamptz | Auto timestamp |
| updated_at | timestamptz | Auto timestamp |

**Indexes:** `student_id`, `month`, `academic_year_id`

---

#### `reports`
| Column | Type | Description |
|--------|------|--------------|
| id | uuid | Primary key |
| academic_year_id | uuid (FK → academic_years.id) | School year |
| report_type | enum('weekly','monthly') | Type of report |
| period | text | e.g., "2025-W05" or "2025-01" |
| generated_on | timestamptz | Auto-generated time |
| file_url | text | Link to Supabase Storage |
| created_at | timestamptz | Auto timestamp |

**Indexes:** `academic_year_id`, `report_type`, `period`

---

#### `audit_logs`
| Column | Type | Description |
|--------|------|--------------|
| id | uuid | Primary key |
| user_id | uuid (FK → users.id) | Who performed action |
| action | text | e.g., "EDIT_RECORD", "DELETE_RECORD" |
| table_name | text | Affected table |
| record_id | uuid | Affected record ID |
| old_data | jsonb | Before state (nullable) |
| new_data | jsonb | After state (nullable) |
| created_at | timestamptz | Auto timestamp |

**Indexes:** `user_id`, `table_name`, `created_at`

---

#### `weekly_quotas`
| Column | Type | Description |
|--------|------|--------------|
| id | uuid | Primary key |
| teacher_id | uuid (FK → teachers.id) | Teacher |
| week_start | date | Monday of the week |
| merits_issued | int | Count of merits issued |
| quota_limit | int | Default 5 |
| created_at | timestamptz | Auto timestamp |
| updated_at | timestamptz | Auto timestamp |

**Indexes:** `teacher_id`, `week_start` (unique together)

---

### Relationships
- `users.id` → `students.user_id`, `teachers.user_id`, `principals.user_id`
- `students.academic_year_id` → `academic_years.id`
- `records.student_id` → `students.id`
- `records.teacher_id` → `teachers.id`
- `records.academic_year_id` → `academic_years.id`
- `uniform_passes.student_id` → `students.id`
- `detentions.student_id` → `students.id`
- `raffle_entries.student_id` → `students.id`
- `raffle_prizes.winner_id` → `students.id`

---

### Row Level Security (RLS) Policies

**`users` table:**
- SELECT: Users can view their own record only
- INSERT/UPDATE/DELETE: Principal only

**`students` table:**
- SELECT: Students see own record, teachers/principal see all
- INSERT/UPDATE/DELETE: Principal only

**`teachers` table:**
- SELECT: All authenticated users
- INSERT/UPDATE/DELETE: Principal only

**`principals` table:**
- SELECT: All authenticated users
- INSERT/UPDATE/DELETE: No one (managed via Supabase dashboard)

**`records` table:**
- SELECT: Students see own records, teachers/principal see all
- INSERT: Teachers only
- UPDATE: Teachers can edit own records if `created_at > NOW() - INTERVAL '1 hour'`, principal can edit any
- DELETE: Teachers can delete own records if `created_at > NOW() - INTERVAL '1 hour'`, principal cannot delete (soft delete only)

**`uniform_passes`, `detentions`:**
- SELECT: Students see own, principal sees all
- INSERT/UPDATE/DELETE: Auto-generated via Edge Functions (service role)

**`raffle_prizes`, `raffle_entries`:**
- SELECT: All authenticated users
- INSERT/UPDATE/DELETE: Principal only

**`reports`:**
- SELECT: Principal only
- INSERT/UPDATE/DELETE: Auto-generated via Edge Functions (service role)

**`audit_logs`:**
- SELECT: Principal only
- INSERT: Auto-trigger on record changes
- UPDATE/DELETE: No one

**`weekly_quotas`:**
- SELECT: Teachers see own, principal sees all
- INSERT/UPDATE: Auto-managed via Edge Functions
- DELETE: No one

---

## 13. Business Logic & Algorithms

### Monthly Reset Process (Edge Function - Runs on 1st of each month at 00:00 PHT)
1. Archive all current month's merit/demerit counts (records table remains intact)
2. Calculate raffle entries for each student: `total_entries = floor(total_merits / 5)`
3. Insert into `raffle_entries` table with `remaining_entries = total_entries`
4. Reset student counts (handled via query filters on current month)
5. Archive previous month's data for reports

### Weekly Quota Reset (Edge Function - Runs every Monday at 00:00 PHT)
1. Update or insert `weekly_quotas` records for all teachers
2. Set `merits_issued = 0` for new week
3. Keep `quota_limit = 5` (unless changed by principal)

### Uniform Pass Auto-Generation (Database Trigger)
**Trigger on:** INSERT into `records` where `type = 'merit'`
1. Calculate student's total merits for current month
2. If `total_merits % 5 == 0` (multiple of 5):
   - Insert into `uniform_passes` table
   - Set `merits_count = total_merits`
3. Generate notification/motivational message

### Detention Auto-Generation (Database Trigger)
**Trigger on:** INSERT into `records` where `type = 'demerit'`
1. Calculate student's total demerits for current month
2. If `total_demerits >= 3`:
   - Insert into `detentions` table with `status = 'pending'`
   - Set `demerits_count = total_demerits`
3. Generate alert for principal dashboard

### Raffle Draw Algorithm
**Two-stage spinner system:**
1. **Stage 1 - Prize Selection:**
   - Filter prizes where `claimed = false` and `month = current_raffle_month`
   - Random selection from available prizes
   - Visual spinner animation (3-5 seconds)

2. **Stage 2 - Winner Selection:**
   - Get all students with `remaining_entries > 0` for selected month
   - Weighted random selection based on `remaining_entries` count
   - Visual spinner animation showing student names (3-5 seconds)

3. **Post-Draw Actions:**
   - Update prize: `claimed = true`, `winner_id = selected_student`, `drawn_at = NOW()`
   - Decrement winner's `remaining_entries` by 1
   - Log to `audit_logs`
   - Display winner announcement animation

### Report Generation (Edge Function - Scheduled)
**Weekly Report (Every Sunday at 23:00 PHT):**
- Aggregates data from Monday-Sunday
- Groups by student
- Includes: total merits, total demerits, uniform passes earned, detentions triggered
- Exports to Excel and PDF
- Stores in Supabase Storage
- Links in `reports` table

**Monthly Report (Last day of month at 23:00 PHT):**
- Aggregates entire month's data
- Includes: student rankings, top merit reasons, top demerit violations
- Charts: bar graphs, pie charts (using Recharts, exported as images)
- Exports to Excel and PDF
- Stores in Supabase Storage

### Edit Time Restriction Logic (Application Layer)
Teachers can edit/delete records if:
```typescript
const canEdit = (record: Record, currentUser: User): boolean => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const createdAt = new Date(record.created_at);

  if (currentUser.role === 'principal') {
    return true; // Principal can always edit (but not delete)
  }

  if (currentUser.role === 'teacher' && record.teacher_id === currentUser.id) {
    return createdAt > oneHourAgo;
  }

  return false;
};
```

---

## 14. Future Enhancements
- Optional parent portal (separate view access).
- Push/email notifications for threshold alerts.
- Graphs for individual student performance trends.
- Admin-level settings (for academic year, merit/demerit rule adjustments).

