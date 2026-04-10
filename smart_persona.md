# Project Overview: Professional Platform & HR System

## Architecture & Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4, Radix UI, Framer Motion, Lucide Icons
- **Database / Backend**: Supabase (PostgreSQL, Row Level Security, Storage, Auth)
- **Language**: TypeScript
- **State Management / Forms**: React Hook Form, Zod

## Core Features & Domain Entities

### 1. Profiles & Roles
- **Roles**: `admin`, `user`, `company`
- **Company Verification**: System to verify business legitimacy with statuses (`none`, `pending`, `verified`, `rejected`), reviewing process, and document storage.

### 2. Personas (Smart Personas)
- Users can create customized professional identities (`Persona`).
- **Attributes**: Tone, response style, personality traits, careers, education, and projects.
- **AI Integrations**: Integrated with AI settings (auto-reply, response delay, model selection).
- Analytics to track persona views, messages, and engagement.

### 3. Job Board & Matching
- Companies can post jobs with detailed requirements.
- Users can match with jobs (`match_score`, `status`).
- Job applications tracking with cover letters and statuses (`pending`, `reviewed`, `accepted`, `rejected`).
- **Resumes**: Uploading, downloading tracking (who downloaded which resume and when).

### 4. Community & Networking
- Community posts by users or companies (text, project, achievement, question).
- Interactions: Likes, Comments, Views.
- Networking: Following, Skill Endorsements.
- Ads system for various placements (sidebar, banner, feed, header, footer).

### 5. Chat & Channels
- Realtime messaging, channels (inbound/outbound directions).
- Sent, pending, delivered status on messages.

### 6. Notifications
- Comprehensive notification system for job matches, likes, comments, messages, and verification updates.

## Development Patterns & Best Practices

1. **Security**: Data access is heavily guarded using Supabase RLS (Row Level Security) policies (e.g., users can only see their own applications, companies can see applications for their jobs).
2. **UI/UX**: 
   - Consistent UI using Radix UI primitives and Tailwind.
   - Micro-interactions powered by Framer Motion.
   - Fully responsive design prioritizing aesthetic excellence.
3. **Typing**: Strict TypeScript definition in `lib/types.ts` mimicking database schemas and joined queries.
4. **Dates**: Handled via `date-fns`.
5. **Database Triggers**: Auto-updating `updated_at` timestamps using PostgreSQL triggers.

## Guidelines for AI Assistant
- Always ensure RLS policies are considered when adding new database tables.
- Use `lib/types.ts` as the source of truth for interfaces.
- Prefer Tailwind utility classes for styling. Use CSS variables defined in globals for brand consistency.
- Employ Next.js Server Components by default, dropping to `"use client"` only for interactivity.
