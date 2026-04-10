-- ============================================================
-- Migration: Company & Feature Enhancement
-- Date: 2026-04-08
-- Description: Adds company role, verification system, job 
--   applications, resume downloads, notification improvements,
--   and ad/community enhancements.
-- ============================================================

-- ========== 1. PROFILES TABLE: Company fields ==========

-- Add company-specific columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS company_registration_number TEXT,
  ADD COLUMN IF NOT EXISTS company_website TEXT,
  ADD COLUMN IF NOT EXISTS company_phone TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS verification_documents JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_reviewed_by UUID;

-- Ensure role column supports 'company' value
-- (If there's a CHECK constraint, we update it)
DO $$
BEGIN
  -- Drop existing check if any
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  -- Add new check that includes 'company'
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('admin', 'user', 'company'));
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore if constraint doesn't exist
END $$;

-- Ensure verification_status is valid
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_verification_status_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_verification_status_check
  CHECK (verification_status IN ('none', 'pending', 'verified', 'rejected'));


-- ========== 2. JOB_APPLICATIONS TABLE ==========

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, user_id) -- one application per user per job
);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON job_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create applications
CREATE POLICY "Users can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Company users can view applications for their jobs
CREATE POLICY "Companies can view applications for their jobs"
  ON job_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = job_applications.job_id
      AND jobs.company = (SELECT company_name FROM profiles WHERE id = auth.uid())
    )
  );

-- Admins can view all
CREATE POLICY "Admins can view all applications"
  ON job_applications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ========== 3. RESUME_DOWNLOADS TABLE ==========

CREATE TABLE IF NOT EXISTS resume_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- owner of the resume
  downloaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_downloads_user_id ON resume_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_downloads_resume_id ON resume_downloads(resume_id);

ALTER TABLE resume_downloads ENABLE ROW LEVEL SECURITY;

-- Users can see who downloaded their resume
CREATE POLICY "Users can view downloads of own resumes"
  ON resume_downloads FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can insert (when downloading)
CREATE POLICY "Authenticated users can track downloads"
  ON resume_downloads FOR INSERT
  WITH CHECK (auth.uid() = downloaded_by);


-- ========== 4. COMMUNITY_POSTS: poster_type ==========

ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS poster_type TEXT DEFAULT 'user'
    CHECK (poster_type IN ('user', 'company'));


-- ========== 5. JOBS TABLE: company_user_id ==========

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS company_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;


-- ========== 6. ADS TABLE: image upload support ==========

ALTER TABLE ads
  ADD COLUMN IF NOT EXISTS image_storage_path TEXT;

-- Update placement check to include header/footer
DO $$
BEGIN
  ALTER TABLE ads DROP CONSTRAINT IF EXISTS ads_placement_check;
  ALTER TABLE ads ADD CONSTRAINT ads_placement_check
    CHECK (placement IN ('sidebar', 'banner', 'feed', 'header', 'footer'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;


-- ========== 7. NOTIFICATIONS TABLE (create if not exists) ==========

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow system to insert notifications
CREATE POLICY "Authenticated can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);


-- ========== 8. STORAGE BUCKETS ==========

-- These need to be created via Supabase Dashboard or API:
-- Bucket: 'verification-documents' (private)
-- Bucket: 'ad-images' (public)
-- Note: RLS policies for storage are configured in Supabase Dashboard


-- ========== 9. UPDATED_AT TRIGGERS ==========

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Job applications trigger
DROP TRIGGER IF EXISTS job_applications_updated_at ON job_applications;
CREATE TRIGGER job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
