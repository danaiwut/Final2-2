-- Drop the existing constraint
ALTER TABLE ads DROP CONSTRAINT IF EXISTS ads_placement_check;

-- Add the updated constraint that includes sidebar_left and sidebar_right
ALTER TABLE ads ADD CONSTRAINT ads_placement_check 
  CHECK (placement IN ('sidebar', 'banner', 'feed', 'header', 'footer', 'sidebar_left', 'sidebar_right'));
