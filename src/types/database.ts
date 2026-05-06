export type AccessMode = 'private' | 'public' | 'access_private' | 'access_public'

export interface Folder {
  id: string
  owner_id: string
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null
  sort_order: number
  access_mode: AccessMode
  date_from: string | null
  date_to: string | null
  created_at: string
  updated_at: string
}

export interface Image {
  id: string
  folder_id: string
  uploaded_by: string | null
  image_url: string
  caption: string | null
  filter_name: string | null
  sort_order: number
  created_at: string
}
