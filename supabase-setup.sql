-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor

-- Create the projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  input_image_url TEXT NOT NULL,
  output_image_url TEXT,
  prompt TEXT NOT NULL,
  status TEXT DEFAULT 'pending'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Add Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations on projects" ON projects
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Instructions for Storage Buckets:
-- 1. Go to Storage in your Supabase dashboard
-- 2. Create a bucket named: input-images
--    - Make it PUBLIC
-- 3. Create a bucket named: output-images
--    - Make it PUBLIC
--
-- To make a bucket public:
-- - Click on the bucket
-- - Go to Settings
-- - Toggle "Public bucket" to ON
