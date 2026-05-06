-- =============================================
-- CRONY - Database Setup
-- Run this in your Supabase SQL Editor
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Folders table
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  -- access_mode:
  --   private        = only owner sees + uploads
  --   public         = everyone views, only owner uploads
  --   access_private = only owner sees, any logged-in user can upload
  --   access_public  = everyone views, any logged-in user can upload
  access_mode TEXT NOT NULL DEFAULT 'private' CHECK (access_mode IN ('private','public','access_private','access_public')),
  date_from DATE,
  date_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Images table
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  filter_name TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_folders_owner ON folders(owner_id);
CREATE INDEX idx_folders_slug ON folders(slug);
CREATE INDEX idx_folders_sort_order ON folders(sort_order);
CREATE INDEX idx_folders_access_mode ON folders(access_mode);
CREATE INDEX idx_images_folder_id ON images(folder_id);
CREATE INDEX idx_images_sort_order ON images(sort_order);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- SELECT: public + access_public folders visible to all; private + access_private only to owner
CREATE POLICY "folders_select"
  ON folders FOR SELECT
  USING (
    access_mode IN ('public', 'access_public')
    OR owner_id = auth.uid()
  );

-- INSERT: any authenticated user can create a folder
CREATE POLICY "folders_insert"
  ON folders FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- UPDATE/DELETE: only owner
CREATE POLICY "folders_update"
  ON folders FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "folders_delete"
  ON folders FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Images SELECT: visible if folder is visible
CREATE POLICY "images_select"
  ON images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM folders f
      WHERE f.id = images.folder_id
      AND (f.access_mode IN ('public', 'access_public') OR f.owner_id = auth.uid())
    )
  );

-- Images INSERT: owner always can; others can if access_private or access_public
CREATE POLICY "images_insert"
  ON images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM folders f
      WHERE f.id = folder_id
      AND (
        f.owner_id = auth.uid()
        OR f.access_mode IN ('access_private', 'access_public')
      )
    )
  );

-- Images UPDATE/DELETE: uploader or folder owner
CREATE POLICY "images_update"
  ON images FOR UPDATE
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM folders f WHERE f.id = folder_id AND f.owner_id = auth.uid())
  );

CREATE POLICY "images_delete"
  ON images FOR DELETE
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM folders f WHERE f.id = folder_id AND f.owner_id = auth.uid())
  );

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
