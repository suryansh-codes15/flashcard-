-- SQL Schema for FlashForge Public Library
-- Run this in your Supabase SQL Editor

-- 1. Create the Sample Library table
CREATE TABLE IF NOT EXISTS public.sample_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '📄',
    description TEXT,
    pdf_url TEXT NOT NULL, -- URL to the file in Supabase Storage
    difficulty_tag TEXT DEFAULT 'Standard',
    subject_mascot TEXT DEFAULT 'science',
    card_count_est INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Turn on Row Level Security
ALTER TABLE public.sample_library ENABLE ROW LEVEL SECURITY;

-- 3. Allow everyone (anon) to read the library
CREATE POLICY "Allow public read access" 
ON public.sample_library 
FOR SELECT 
TO anon 
USING (true);

-- 4. Seed Data: Add 3 High-Quality Samples
-- Note: Replace the URL with your actual storage URLs after uploading them
INSERT INTO public.sample_library (name, emoji, description, subject_mascot, difficulty_tag, pdf_url)
VALUES 
('Quantum Mechanics 101', '⚛️', 'Deep dive into wave functions, entanglement, and the fabric of reality.', 'science', 'Senior', 'https://your-project.supabase.co/storage/v1/object/public/library/quantum_101.pdf'),
('Cellular Biology', '🧬', 'Exploring the machinery of life, from mitochondria to DNA replication.', 'science', 'Standard', 'https://your-project.supabase.co/storage/v1/object/public/library/cell_bio.pdf'),
('Ancient Rome: Empire', '🏛️', 'Tactical summary of the rise and fall of the Roman Empire.', 'history', 'Junior', 'https://your-project.supabase.co/storage/v1/object/public/library/ancient_rome.pdf')
ON CONFLICT DO NOTHING;
