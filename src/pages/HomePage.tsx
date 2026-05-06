import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Folder } from '@/types/database'
import FolderGrid from '@/components/gallery/FolderGrid'
import SiteHeader from '@/components/gallery/SiteHeader'

export default function HomePage() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('folders')
      .select('*')
      .in('access_mode', ['public', 'access_public'])
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setFolders((data as Folder[]) || [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-charcoal flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-16">
        <div className="mb-16 max-w-2xl">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-warm-brown mb-4">
            Shared Archive
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-off-white leading-tight mb-6">
            A place for<br />
            <em className="text-cream">shared moments</em>
          </h1>
          <p className="text-cream/60 text-sm leading-relaxed font-sans">
            Create folders, set who can view and contribute. Open a folder to anyone — or keep it just for you.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-24 text-cream/40">
            <p className="font-mono text-sm tracking-widest uppercase animate-pulse">Loading…</p>
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center py-24 text-cream/40">
            <p className="font-mono text-sm tracking-widest uppercase">No public folders yet</p>
          </div>
        ) : (
          <FolderGrid folders={folders} />
        )}
      </main>

      <footer className="border-t border-cream/10 py-8 text-center">
        <p className="font-mono text-xs text-cream/30 tracking-widest uppercase">
          Crony — Made by Yogita Patil
        </p>
      </footer>
    </div>
  )
}
