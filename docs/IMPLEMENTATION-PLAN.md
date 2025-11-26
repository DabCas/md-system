# Merit & Demerit System - Phased Implementation Plan

## Overview
This plan breaks down the project into **5 testable phases**, each building on the previous one. Every phase has clear deliverables and testing criteria.

---

## Phase 1: Foundation & Authentication (Week 1)
**Goal:** Set up project infrastructure, database, and working authentication

### Tasks:
1. **Project Setup**
   - Initialize Next.js 14 project with TypeScript
   - Install and configure Tailwind CSS
   - Set up shadcn/ui components
   - Configure ESLint, Prettier, and Git hooks
   - Set up project structure (app/, components/, lib/, etc.)

2. **Database Schema**
   - Create all database tables in Supabase
   - Set up Row Level Security (RLS) policies
   - Create database indexes for performance
   - Set up database triggers (uniform passes, detentions)

3. **Authentication**
   - Configure Google OAuth in Supabase
   - Create auth helper functions
   - Build login page with Google SSO
   - Implement role-based routing (student/teacher/principal)

4. **Basic UI Shell**
   - Create layout components (header, sidebar, footer)
   - Implement dark/light mode toggle
   - Build role-based navigation menus
   - Create loading and error states

### Testing Criteria:
- ✅ Users can sign in with Google
- ✅ Users are redirected based on role (student/teacher/principal)
- ✅ Database tables exist with proper RLS policies
- ✅ Dark/light mode toggle works
- ✅ Navigation shows appropriate links per role

### Deliverables:
- Working Next.js app with authentication
- Complete database schema deployed
- Basic UI shell with navigation

---

## Phase 2: Teacher Features (Week 2)
**Goal:** Teachers can issue merits/demerits and view their quota

### Tasks:
1. **Teacher Dashboard**
   - Display merits/demerits issued today
   - Show remaining weekly quota (5 per week)
   - Quick action buttons for issuing merit/demerit

2. **Issue Merit/Demerit Forms**
   - Student selector (searchable dropdown)
   - Reason input field
   - Quantity picker (1-5 for merits, 1-3 for demerits)
   - Submission with validation
   - Success/error notifications

3. **Teacher History View**
   - List of records created today
   - Edit button (only if within 1 hour)
   - Delete button (only if within 1 hour)
   - Real-time quota updates

4. **Backend Logic**
   - Weekly quota tracking and enforcement
   - Record creation with auto-timestamps
   - Edit/delete within 1-hour window
   - Trigger uniform pass generation (every 5 merits)
   - Trigger detention generation (every 3 demerits)

### Testing Criteria:
- ✅ Teacher can issue merit (1-5 quantity)
- ✅ Teacher can issue demerit (1-3 quantity)
- ✅ Weekly quota enforces 5 merits max
- ✅ Edit/delete only works within 1 hour
- ✅ Uniform passes auto-generate at 5, 10, 15 merits
- ✅ Detentions auto-trigger at 3 demerits
- ✅ Real-time quota counter updates

### Deliverables:
- Fully functional teacher dashboard
- Working merit/demerit issuance system
- Auto-generation of uniform passes and detentions

---

## Phase 3: Student Features (Week 3)
**Goal:** Students can view their progress and records

### Tasks:
1. **Student Dashboard**
   - Merit progress bar (toward next uniform pass)
   - Demerit progress bar (warning at 3)
   - Current month stats (total merits, demerits, uniform passes, detentions)
   - Raffle entries count for current month

2. **Student Records View**
   - Table of all merits/demerits for current month
   - Columns: Date/Time, Type, Reason, Quantity, Teacher Name
   - Filtering by type (merit/demerit)
   - Sorting by date (newest first)

3. **Motivational Messages**
   - Display encouraging messages based on progress
   - Badge system for milestones (5, 10, 15, 20+ merits)
   - Visual celebrations for uniform passes earned

4. **Historical View**
   - View past months' data (read-only)
   - Archive of previous school years (if applicable)

### Testing Criteria:
- ✅ Student sees current month's merit/demerit counts
- ✅ Progress bars accurately reflect status
- ✅ Uniform pass count displays correctly
- ✅ Raffle entries calculated correctly (merits ÷ 5)
- ✅ All records show teacher name, date/time, reason
- ✅ Motivational messages appear appropriately

### Deliverables:
- Complete student dashboard with progress tracking
- Detailed records view with filtering
- Motivational messaging system

---

## Phase 4: Principal Features (Week 4-5)
**Goal:** Principal can manage system, view reports, and conduct raffles

### Tasks:
1. **Principal Dashboard**
   - Weekly/monthly summary cards
   - Uniform pass list (downloadable)
   - Detention list with status tracking
   - Top merit reasons (chart)
   - Common demerit violations (chart)

2. **Student Management**
   - Search/filter by name, grade, section
   - View individual student records
   - Edit any record (with audit logging)
   - Cannot delete records (soft delete only)

3. **Roster Upload**
   - CSV/Excel file upload component
   - File validation and preview
   - Bulk student import
   - Create new academic year on upload
   - Archive previous year's data

4. **Raffle Management**
   - Prize pool management (add/edit/remove prizes)
   - Two-stage spinner system:
     - Stage 1: Spin for prize
     - Stage 2: Spin for winner
   - Winner announcement animation
   - Track prizes claimed/unclaimed
   - Export raffle results

5. **Reports System**
   - Auto-generated weekly reports (every Sunday)
   - Auto-generated monthly reports (last day of month)
   - View/download past reports
   - Export to Excel (.xlsx)
   - Export to PDF

6. **Audit Logs**
   - View all record edits/deletes
   - Filter by user, date, action
   - Export audit trail

### Testing Criteria:
- ✅ Principal can view all students' data
- ✅ Principal can edit (but not delete) any record
- ✅ Roster upload creates new students and academic year
- ✅ Raffle spinner selects random prize and winner
- ✅ Raffle entries decrease correctly after winning
- ✅ Reports generate automatically on schedule
- ✅ Excel and PDF exports work correctly
- ✅ Audit logs capture all edits

### Deliverables:
- Full principal dashboard with analytics
- Working roster upload system
- Complete raffle system with animations
- Automated report generation
- Audit logging system

---

## Phase 5: PWA, Offline Support & Polish (Week 6)
**Goal:** Make app installable, work offline, and production-ready

### Tasks:
1. **PWA Configuration**
   - Create manifest.json (app name, icons, colors)
   - Generate app icons (multiple sizes)
   - Configure service workers with Serwist
   - Enable "Add to Home Screen" prompt

2. **Offline Support**
   - Cache static assets (CSS, JS, images)
   - Store records in IndexedDB when offline
   - Queue pending operations
   - Auto-sync when connection restored
   - Conflict resolution (server timestamp wins)
   - Offline indicator UI

3. **Scheduled Jobs (Supabase Edge Functions)**
   - Weekly quota reset (every Monday 00:00 PHT)
   - Monthly reset (1st of month 00:00 PHT)
   - Weekly report generation (Sunday 23:00 PHT)
   - Monthly report generation (last day 23:00 PHT)

4. **Performance Optimization**
   - Implement React Server Components
   - Add image optimization
   - Lazy load components
   - Database query optimization
   - Implement pagination for large lists
   - Add skeleton loaders

5. **Testing & Bug Fixes**
   - Cross-browser testing (Chrome, Safari, Firefox, Edge)
   - Mobile responsiveness testing (iOS, Android)
   - Accessibility testing (WCAG 2.1 AA)
   - Fix bugs found during testing
   - Performance testing (Lighthouse)

6. **Documentation & Deployment**
   - User guide for teachers
   - User guide for students/parents
   - Admin guide for principal
   - Deployment to Vercel
   - Production environment variables
   - Monitoring and error tracking setup

### Testing Criteria:
- ✅ App installs on mobile devices
- ✅ App works offline (view data, queue actions)
- ✅ Offline changes sync when reconnected
- ✅ Weekly quota resets every Monday
- ✅ Monthly reset happens on 1st of month
- ✅ Reports auto-generate on schedule
- ✅ Lighthouse score: 90+ on all metrics
- ✅ Works on iOS Safari, Android Chrome, Desktop browsers
- ✅ Passes WCAG 2.1 AA accessibility standards

### Deliverables:
- Fully functional PWA (installable)
- Complete offline support
- Automated scheduled jobs
- Production deployment
- Complete documentation

---

## Technology Stack Summary

### Frontend
- **Framework:** Next.js 14 (App Router, TypeScript)
- **UI:** shadcn/ui + Radix UI + Tailwind CSS v4
- **Forms:** React Hook Form + Zod
- **State:** TanStack Query + Zustand
- **Charts:** Recharts
- **Icons:** Lucide React
- **PWA:** Serwist

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Google OAuth)
- **Storage:** Supabase Storage
- **Functions:** Supabase Edge Functions
- **API:** Auto-generated REST API

### Tools
- **Package Manager:** pnpm
- **Linting:** ESLint + Prettier
- **Migrations:** Supabase CLI
- **Deployment:** Vercel

---

## Development Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1 | Week 1 | Auth + Database + UI Shell |
| Phase 2 | Week 2 | Teacher Features |
| Phase 3 | Week 3 | Student Features |
| Phase 4 | Week 4-5 | Principal Features + Reports |
| Phase 5 | Week 6 | PWA + Offline + Production |
| **Total** | **6 weeks** | **Full Production App** |

---

## Next Steps

1. **Review this plan** - Make sure all requirements are covered
2. **Start Phase 1** - Set up project foundation
3. **Test incrementally** - Each phase must pass all tests before moving forward
4. **Iterate** - Adjust plan as needed based on discoveries

Ready to begin Phase 1? 🚀
