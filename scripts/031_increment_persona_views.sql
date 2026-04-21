CREATE OR REPLACE FUNCTION increment_persona_views(p_persona_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE personas
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_persona_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
