-- Restrict company accounts from managing personas and resumes.
-- Company users should still be able to post jobs, post in community, and chat.

-- Personas
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own personas" ON personas;
CREATE POLICY "Users can view their own personas"
  ON personas FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role <> 'company'
    )
  );

DROP POLICY IF EXISTS "Users can create their own personas" ON personas;
CREATE POLICY "Users can create their own personas"
  ON personas FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role <> 'company'
    )
  );

DROP POLICY IF EXISTS "Users can update their own personas" ON personas;
CREATE POLICY "Users can update their own personas"
  ON personas FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role <> 'company'
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role <> 'company'
    )
  );

DROP POLICY IF EXISTS "Users can delete their own personas" ON personas;
CREATE POLICY "Users can delete their own personas"
  ON personas FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role <> 'company'
    )
  );

DROP POLICY IF EXISTS "Public personas are viewable by everyone" ON personas;
CREATE POLICY "Public personas are viewable by everyone"
  ON personas FOR SELECT
  USING (visibility = 'published');

-- Resumes
DROP POLICY IF EXISTS "Users can view their own resumes" ON resumes;
CREATE POLICY "Users can view their own resumes"
  ON resumes FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role <> 'company'
    )
  );

DROP POLICY IF EXISTS "Users can create their own resumes" ON resumes;
CREATE POLICY "Users can create their own resumes"
  ON resumes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role <> 'company'
    )
  );

DROP POLICY IF EXISTS "Users can update their own resumes" ON resumes;
CREATE POLICY "Users can update their own resumes"
  ON resumes FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role <> 'company'
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role <> 'company'
    )
  );

DROP POLICY IF EXISTS "Users can delete their own resumes" ON resumes;
CREATE POLICY "Users can delete their own resumes"
  ON resumes FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role <> 'company'
    )
  );
