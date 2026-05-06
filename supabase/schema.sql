-- =============================================
-- FOLIO GALLERY - Supabase Database Setup
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Folders table
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT false,
  date_from DATE,
  date_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Images table
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  filter_name TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_folders_slug ON folders(slug);
CREATE INDEX idx_folders_sort_order ON folders(sort_order);
CREATE INDEX idx_folders_is_public ON folders(is_public);
CREATE INDEX idx_images_folder_id ON images(folder_id);
CREATE INDEX idx_images_sort_order ON images(sort_order);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Public can read public folders
CREATE POLICY "Public can read public folders"
  ON folders FOR SELECT
  USING (is_public = true);

-- Authenticated users (admin) can do everything
CREATE POLICY "Authenticated can manage folders"
  ON folders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public can read images in public folders
CREATE POLICY "Public can read images in public folders"
  ON images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM folders
      WHERE folders.id = images.folder_id
      AND folders.is_public = true
    )
  );

-- Authenticated can manage images
CREATE POLICY "Authenticated can manage images"
  ON images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- STORAGE
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public can view gallery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Authenticated can update images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated can delete images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery');

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
