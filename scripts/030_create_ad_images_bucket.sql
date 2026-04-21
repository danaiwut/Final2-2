-- Create the ad-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-images', 'ad-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the ad-images bucket
-- Note: Supabase requires RLS on the storage.objects table to manage access

-- 1. Allow everyone to view/read ad images (Public Access)
CREATE POLICY "Public Read Access for Ad Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-images');

-- 2. Allow admins to insert/upload images
CREATE POLICY "Admin Upload Access for Ad Images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ad-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- 3. Allow admins to update images
CREATE POLICY "Admin Update Access for Ad Images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ad-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- 4. Allow admins to delete images
CREATE POLICY "Admin Delete Access for Ad Images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ad-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);
