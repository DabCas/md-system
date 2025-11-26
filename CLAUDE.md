# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A school merit/demerit tracking system for St. Paul Clark. Teachers issue merits (rewards) and demerits (penalties) to students, with automatic quota tracking, uniform pass generation at 5-merit milestones, and detention creation at 3+ demerits.

## Commands

```bash
pnpm dev          # Start development server (port 3000)
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript type checking
```

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **State:** TanStack Query (server), Zustand (client)
- **Forms:** React Hook Form + Zod validation
- **Timezone:** Asia/Manila via date-fns-tz

## Architecture

### Authentication Flow
```
Google OAuth → /auth/callback → Email domain check (@stpaulclark.com) →
Role detection (checks admins → principals → teachers → students tables) →
Set user_metadata.role → Redirect to role-based dashboard
```

### Page/Component Split Pattern
- **Page components** (`src/app/`): Server-side rendering, auth checks, data fetching
- **Client components** (`src/components/*-client.tsx`): Interactive UI, forms, real-time updates

### Data Flow (Merit Issuance Example)
```
Teacher form → Supabase.records.insert() → DB triggers →
Auto-generate uniform_passes at 5/10/15 merits →
Auto-generate detentions at 3+ demerits
```

### Role Hierarchy
- **Admin** → `/dashboard/admin` - System administration
- **Principal** → `/dashboard/teacher` - Full visibility, all records
- **Teacher** → `/dashboard/teacher` - Issue merits/demerits, own quotas
- **Student** → `/dashboard/student` - View personal progress

## Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| `students` | Student profiles (grade, section, english_name) |
| `teachers` | Teacher profiles linked to auth users |
| `records` | Merit/demerit transactions with location |
| `weekly_quotas` | Teacher's 5 merits/week limit tracking |
| `uniform_passes` | Auto-generated at 5-merit milestones |
| `detentions` | Auto-generated at 3+ demerits |
| `raffle_entries` | Monthly raffle participation |

## Business Rules

1. **Soft deletes only** - Records use `is_deleted` flag, never hard-deleted
2. **1-hour edit window** - Teachers can only edit/delete own records within 1 hour
3. **Weekly quota** - Teachers limited to 5 merits per week (Mon-Sun)
4. **Monthly reset** - Merit/demerit counts reset on 1st of each month
5. **Auto-generation** - Uniform passes at 5-merit milestones; detentions at 3+ demerits

## Key Files

- `md-prd.md` - Complete product requirements, database schema, algorithms
- `IMPLEMENTATION-PLAN.md` - 6-phase development plan (Phases 1-3 complete)
- `src/lib/supabase/server.ts` - Server-side Supabase client
- `src/lib/supabase/client.ts` - Browser Supabase client
- `src/app/auth/callback/route.ts` - OAuth callback with role detection
- `src/types/database.types.ts` - Auto-generated Supabase types

## Whitelisted Test Emails

These bypass @stpaulclark.com domain check:
- `plukdennisalimpolos@gmail.com`
- `imdennisalimpolos@gmail.com`
- `mr.dennisalimpolos@gmail.com`

## Tailwind Brand Colors

- `camelot` (#8C2956) - maroon primary
- `biscay` (#17275C) - dark blue
- `pampas` (#EEE9E6) - light cream background
