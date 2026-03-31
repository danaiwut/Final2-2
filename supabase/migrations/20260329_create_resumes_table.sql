-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  
  -- Personal Information (auto-populated from persona)
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  website TEXT,
  linkedin TEXT,
  github TEXT,
  
  -- Professional Summary
  summary TEXT,
  
  -- Experience (JSON array)
  experience JSONB DEFAULT '[]'::jsonb,
  
  -- Education (JSON array)
  education JSONB DEFAULT '[]'::jsonb,
  
  -- Skills (JSON array)
  skills JSONB DEFAULT '[]'::jsonb,
  
  -- Projects (JSON array)
  projects JSONB DEFAULT '[]'::jsonb,
  
  -- Certifications (JSON array)
  certifications JSONB DEFAULT '[]'::jsonb,
  
  -- Languages (JSON array)
  languages JSONB DEFAULT '[]'::jsonb,
  
  -- Resume Style/Template
  template_style TEXT DEFAULT 'modern' CHECK (template_style IN ('modern', 'classic', 'minimal', 'creative', 'professional')),
  color_scheme TEXT DEFAULT 'brown' CHECK (color_scheme IN ('brown', 'blue', 'green', 'purple', 'monochrome')),
  font_family TEXT DEFAULT 'inter' CHECK (font_family IN ('inter', 'playfair', 'roboto', 'lato', 'opensans')),
  
  -- Metadata
  title TEXT NOT NULL DEFAULT 'My Resume',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_persona_id ON resumes(persona_id);

-- Enable RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own resumes"
  ON resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own resumes"
  ON resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON resumes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON resumes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_resumes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_resumes_updated_at();
