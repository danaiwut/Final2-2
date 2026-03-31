# Database Migration Instructions

## Run Resume Table Migration

You need to run the migration to create the `resumes` table in your Supabase database.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/20260329_create_resumes_table.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

Or run the migration directly:

```bash
supabase db execute -f supabase/migrations/20260329_create_resumes_table.sql
```

### Option 3: Using psql (if you have PostgreSQL client)

```bash
psql "your-database-connection-string" -f supabase/migrations/20260329_create_resumes_table.sql
```

## Verify Migration

After running the migration, verify that the `resumes` table was created:

1. Go to Supabase Dashboard → Table Editor
2. You should see a new table called `resumes`
3. Check that it has all the columns defined in the migration

## What This Migration Creates

- **resumes** table with columns for:
  - Personal information (name, email, phone, location, etc.)
  - Professional summary
  - Experience, education, skills, projects (JSONB arrays)
  - Resume styling options (template, colors, fonts)
  - Metadata (created_at, updated_at, is_default)
- Row Level Security (RLS) policies
- Indexes for better query performance
- Auto-update trigger for `updated_at` timestamp
