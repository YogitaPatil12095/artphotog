import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Folder, Image } from '@/types/database'
import SiteHeader from '@/components/gallery/SiteHeader'
import GalleryGrid from '@/components/gallery/GalleryGrid'
import { Upload, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { compressImage, getPublicImageUrl } from '@/lib/utils'
import { FILTERS, getFilterStyle, FilterName } from '@/lib/filters'
import { AnimatePresence, motion } from 'framer-motion'

// re-export helper so FolderPage can use it
function getPublicUrl(path: string) {
  const { data } = supabase.storage.from('gallery').getPublicUrl(path)
  return data.publicUrl
}

export default function FolderPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [folder, setFolder] = useState<Folder | null>(null)
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [canContribute, setCanContribute] = useState(false)

  // upload state
  const [previews, setPreviews] = useState<{ file: File; url: string; filter: FilterName; caption: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    if (!slug) return
    async function load() {
      const { data: f, error } = await supabase
        .from('folders').select('*')
        .eq('slug', slug!)
        .in('access_mode', ['public', 'access_public', 'access_private'])
        .single()

      if (error || !f) { navigate('/404', { replace: true }); return }

      const folder = f as Folder

      // check visibility: access_private only visible to owner or logged-in users
      if (folder.access_mode === 'access_private' && !user) {
        navigate('/login', { replace: true }); return
      }

      const { data: imgs } = await supabase.from('images').select('*').eq('folder_id', folder.id).order('sort_order')
      setFolder(folder)
      setImages((imgs as Image[]) || [])
      // contributor = logged in + folder allows contributions
      setCanContribute(!!user && ['access_private', 'access_public'].includes(folder.access_mode))
      setLoading(false)
    }
    load()
  }, [slug, navigate, user])

  const onDrop = (files: File[]) => {
    setPreviews(prev => [...prev, ...files.map(file => ({ file, url: URL.createObjectURL(file), filter: 'none' as FilterName, caption: '' }))])
    setShowUpload(true)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: true, noClick: !showUpload })

  const handleUpload = async () => {
    if (!previews.length || !user || !folder) return
    setUploading(true); setUploadProgress(0)
    const uploaded: Image[] = []
    for (let i = 0; i < previews.length; i++) {
      const p = previews[i]
      const compressed = await compressImage(p.file)
      const path = `${folder.id}/${Date.now()}-${i}.${p.file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('gallery').upload(path, compressed, { contentType: p.file.type })
      if (!error) {
        const { data } = await supabase.from('images').insert({
          folder_id: folder.id, uploaded_by: user.id,
          image_url: getPublicUrl(path),
          caption: p.caption || null,
          filter_name: p.filter === 'none' ? null : p.filter,
          sort_order: images.length + i,
        }).select().single()
        if (data) uploaded.push(data as Image)
      }
      setUploadProgress(Math.round(((i + 1) / previews.length) * 100))
    }
    setImages(prev => [...prev, ...uploaded]); setPreviews([]); setUploading(false); setShowUpload(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center">
      <p className="font-mono text-xs tracking-widest uppercase text-cream/30 animate-pulse">Loading…</p>
    </div>
  )
  if (!folder) return null

  return (
    <div className="min-h-screen bg-charcoal flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-12">
        <div className="mb-10">
          <Link to="/" className="font-mono text-xs tracking-widest uppercase text-cream/40 hover:text-cream/70 transition-colors">← Archive</Link>
        </div>

        <div className="mb-12 border-b border-cream/10 pb-10 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-warm-brown mb-3">Folder</p>
            <h1 className="font-display text-3xl md:text-4xl text-off-white mb-4">{folder.title}</h1>
            {folder.description && <p className="text-cream/50 text-sm max-w-xl leading-relaxed">{folder.description}</p>}
            <p className="mt-4 font-mono text-xs text-cream/30 tracking-widest uppercase">{images.length} image{images.length !== 1 ? 's' : ''}</p>
          </div>

          {canContribute && (
            <button onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 bg-cream/10 border border-cream/20 text-cream/70 hover:text-cream hover:bg-cream/15 px-4 py-2.5 rounded-lg text-sm font-mono transition-colors flex-shrink-0">
              <Upload size={14} />
              Add Photos
            </button>
          )}
        </div>

        {/* Contributor upload panel */}
        <AnimatePresence>
          {showUpload && canContribute && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-10 bg-cream/5 border border-cream/15 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-xs tracking-widest uppercase text-cream/50">Add Photos to this Folder</h3>
                <button onClick={() => setShowUpload(false)} className="text-cream/30 hover:text-cream"><X size={16} /></button>
              </div>
              <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-cream/40 bg-cream/10' : 'border-cream/15 hover:border-cream/30 hover:bg-cream/5'}`}>
                <input {...getInputProps()} />
                <Upload size={24} className="mx-auto mb-3 text-cream/30" />
                <p className="text-cream/50 text-sm">{isDragActive ? 'Drop here…' : 'Drag & drop or click to select'}</p>
              </div>
              {previews.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-mono text-xs text-cream/40">{previews.length} image{previews.length > 1 ? 's' : ''} ready</p>
                    <button onClick={handleUpload} disabled={uploading} className="flex items-center gap-2 bg-cream text-charcoal px-4 py-2 rounded-lg text-sm font-mono hover:bg-off-white transition-colors disabled:opacity-50">
                      <Upload size={14} />
                      {uploading ? `${uploadProgress}%` : 'Upload All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {previews.map((p, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-cream/5 border border-cream/10">
                        <img src={p.url} alt="" className="w-full h-full object-cover" style={getFilterStyle(p.filter)} />
                        <button onClick={() => setPreviews(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 p-1 bg-charcoal/70 rounded-full text-cream/60 hover:text-cream">
                          <X size={10} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-1">
                          <select value={p.filter} onChange={e => setPreviews(prev => prev.map((item, j) => j === i ? { ...item, filter: e.target.value as FilterName } : item))}
                            className="w-full bg-charcoal/80 border-0 rounded text-[10px] text-cream/60 focus:outline-none font-mono px-1 py-0.5">
                            {FILTERS.map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {images.length === 0 ? (
          <div className="text-center py-24 text-cream/30">
            <p className="font-mono text-sm tracking-widest uppercase">This folder is empty</p>
          </div>
        ) : (
          <GalleryGrid images={images} />
        )}
      </main>

      <footer className="border-t border-cream/10 py-8 text-center">
        <p className="font-mono text-xs text-cream/30 tracking-widest uppercase">Crony — Made by Yogita Patil</p>
      </footer>
    </div>
  )
}
