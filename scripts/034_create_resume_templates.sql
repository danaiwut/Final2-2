-- Create resume_templates table
CREATE TABLE IF NOT EXISTS public.resume_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    base_layout TEXT NOT NULL, -- e.g., 'modern', 'minimal', 'professional', 'creative'
    primary_color TEXT NOT NULL, -- e.g., '#0071e3'
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;

-- Everyone can read active templates
CREATE POLICY "Anyone can view active templates" 
ON public.resume_templates FOR SELECT 
USING (is_active = true);

-- Admins can read all templates
CREATE POLICY "Admins can view all templates" 
ON public.resume_templates FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Admins can insert/update/delete templates
CREATE POLICY "Admins can insert templates" 
ON public.resume_templates FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Admins can update templates" 
ON public.resume_templates FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Admins can delete templates" 
ON public.resume_templates FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.resume_templates
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('updated_at');

-- Insert default system templates
INSERT INTO public.resume_templates (id, name, base_layout, primary_color, is_active)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Modern Dark Side', 'modern', '#0F172A', true),
    ('00000000-0000-0000-0000-000000000002', 'Blue Minimal', 'minimal', '#3B82F6', true),
    ('00000000-0000-0000-0000-000000000003', 'Circle Photo', 'professional', '#10B981', true),
    ('00000000-0000-0000-0000-000000000004', 'Peach Split', 'creative', '#F97316', true)
ON CONFLICT (id) DO NOTHING;
