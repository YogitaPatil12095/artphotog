export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      folders: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          cover_image_url: string | null
          sort_order: number
          is_public: boolean
          date_from: string | null
          date_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          cover_image_url?: string | null
          sort_order?: number
          is_public?: boolean
          date_from?: string | null
          date_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          cover_image_url?: string | null
          sort_order?: number
          is_public?: boolean
          date_from?: string | null
          date_to?: string | null
          updated_at?: string
        }
      }
      images: {
        Row: {
          id: string
          folder_id: string
          image_url: string
          caption: string | null
          filter_name: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          folder_id: string
          image_url: string
          caption?: string | null
          filter_name?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          folder_id?: string
          image_url?: string
          caption?: string | null
          filter_name?: string | null
          sort_order?: number
        }
      }
    }
  }
}

export type Folder = Database['public']['Tables']['folders']['Row']
export type Image = Database['public']['Tables']['images']['Row']
export type FolderInsert = Database['public']['Tables']['folders']['Insert']
export type ImageInsert = Database['public']['Tables']['images']['Insert']
