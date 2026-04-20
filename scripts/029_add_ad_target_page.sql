-- Add target_page column to ads table to support page-specific targeting
ALTER TABLE ads ADD COLUMN IF NOT EXISTS target_page TEXT DEFAULT 'all';

-- Existing target_page choices should likely be: 'all', 'dashboard', 'resumes', 'community', 'jobs'
