import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Folder, Image } from '@/types/database'
import SiteHeader from '@/components/gallery/SiteHeader'
import GalleryGrid from '@/components/gallery/GalleryGrid'

export default function FolderPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [folder, setFolder] = useState<Folder | null>(null)
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    async function load() {
      const { data: folderData, error } = await supabase
        .from('folders')
        .select('*')
        .eq('slug', slug!)
        .eq('is_public', true)
        .single()

      if (error || !folderData) {
        navigate('/404', { replace: true })
        return
      }

      const { data: imagesData } = await supabase
        .from('images')
        .select('*')
        .eq('folder_id', folderData.id)
        .order('sort_order', { ascending: true })

      setFolder(folderData as Folder)
      setImages((imagesData || []) as Image[])
      setLoading(false)
    }

    load()
  }, [slug, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <p className="font-mono text-xs tracking-widest uppercase text-cream/30 animate-pulse">Loading…</p>
      </div>
    )
  }

  if (!folder) return null

  return (
    <div className="min-h-screen bg-charcoal">
      <SiteHeader />
      <main className="max-w-screen-2xl mx-auto px-4 py-12">
        <div className="mb-10">
          <Link to="/" className="font-mono text-xs tracking-widest uppercase text-cream/40 hover:text-cream/70 transition-colors">
            ← Archive
          </Link>
        </div>

        <div className="mb-12 border-b border-cream/10 pb-10">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-warm-brown mb-3">Folder</p>
          <h1 className="font-display text-3xl md:text-4xl text-off-white mb-4">{folder.title}</h1>
          {folder.description && (
            <p className="text-cream/50 text-sm max-w-xl leading-relaxed">{folder.description}</p>
          )}
          <p className="mt-4 font-mono text-xs text-cream/30 tracking-widest uppercase">
            {images.length} image{images.length !== 1 ? 's' : ''}
          </p>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-24 text-cream/30">
            <p className="font-mono text-sm tracking-widest uppercase">This folder is empty</p>
          </div>
        ) : (
          <GalleryGrid images={images} />
        )}
      </main>

      <footer className="border-t border-cream/10 mt-24 py-8 text-center">
        <p className="font-mono text-xs text-cream/30 tracking-widest uppercase">Crony — Personal Archive</p>
      </footer>
    </div>
  )
}
