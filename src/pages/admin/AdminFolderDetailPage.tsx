import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase, getPublicImageUrl } from '@/lib/supabase'
import { slugify, compressImage } from '@/lib/utils'
import { FILTERS, getFilterStyle, FilterName } from '@/lib/filters'
import type { Folder, Image as GalleryImage } from '@/types/database'
import { useDropzone } from 'react-dropzone'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, rectSortingStrategy, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowLeft, Save, Trash2, GripVertical, Upload, Star, MessageSquare,
  Eye, EyeOff, X, FolderInput, ImagePlus,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface UploadPreview {
  file: File
  url: string
  filter: FilterName
  caption: string
}

function SortableImage({
  image, isCover, onDelete, onSetCover, onUpdateCaption, onMoveToFolder, folders,
}: {
  image: GalleryImage
  isCover: boolean
  onDelete: (id: string) => void
  onSetCover: (url: string) => void
  onUpdateCaption: (id: string, caption: string) => void
  onMoveToFolder: (id: string, folderId: string) => void
  folders: Folder[]
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id })
  const [editCaption, setEditCaption] = useState(false)
  const [caption, setCaption] = useState(image.caption || '')
  const [showMove, setShowMove] = useState(false)

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="relative group rounded-lg overflow-hidden bg-cream/5 border border-cream/10">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image.image_url}
          alt={image.caption || ''}
          className="w-full h-full object-cover"
          style={getFilterStyle(image.filter_name)}
        />
        {image.filter_name && image.filter_name !== 'none' && (
          <div className="absolute top-2 left-2 bg-charcoal/70 rounded-full px-2 py-0.5">
            <span className="font-mono text-[9px] text-cream/60 uppercase tracking-wide">{image.filter_name}</span>
          </div>
        )}
        {isCover && (
          <div className="absolute top-2 right-2 bg-warm-brown/80 rounded-full px-2 py-0.5">
            <span className="font-mono text-[9px] text-cream uppercase tracking-wide">Cover</span>
          </div>
        )}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button {...attributes} {...listeners} className="p-1.5 bg-cream/20 hover:bg-cream/30 rounded-md text-cream/80 touch-none">
            <GripVertical size={14} />
          </button>
          <button onClick={() => onSetCover(image.image_url)} className={`p-1.5 rounded-md transition-colors ${isCover ? 'bg-warm-brown/60 text-cream' : 'bg-cream/20 hover:bg-cream/30 text-cream/80'}`} title="Set as folder cover">
            <Star size={14} />
          </button>
          <button onClick={() => setEditCaption(!editCaption)} className="p-1.5 bg-cream/20 hover:bg-cream/30 rounded-md text-cream/80" title="Edit caption">
            <MessageSquare size={14} />
          </button>
          <button onClick={() => setShowMove(!showMove)} className="p-1.5 bg-cream/20 hover:bg-cream/30 rounded-md text-cream/80" title="Move to folder">
            <FolderInput size={14} />
          </button>
          <button onClick={() => onDelete(image.id)} className="p-1.5 bg-dusty-pink/30 hover:bg-dusty-pink/50 rounded-md text-dusty-pink" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {editCaption && (
        <div className="p-2 border-t border-cream/10">
          <div className="flex gap-1.5">
            <input
              type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add caption…"
              className="flex-1 bg-cream/5 border border-cream/15 rounded-md px-2 py-1 text-xs text-off-white placeholder-cream/20 focus:outline-none"
            />
            <button onClick={() => { onUpdateCaption(image.id, caption); setEditCaption(false) }} className="px-2 py-1 bg-cream/15 rounded-md text-xs text-cream/70 hover:bg-cream/20 font-mono">
              Save
            </button>
          </div>
        </div>
      )}

      {showMove && (
        <div className="p-2 border-t border-cream/10">
          <select
            onChange={(e) => { if (e.target.value) { onMoveToFolder(image.id, e.target.value); setShowMove(false) } }}
            defaultValue=""
            className="w-full bg-cream/5 border border-cream/15 rounded-md px-2 py-1.5 text-xs text-off-white focus:outline-none"
          >
            <option value="" disabled>Move to…</option>
            {folders.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}

export default function AdminFolderDetailPage() {
  const { id: folderId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [folder, setFolder] = useState<Folder | null>(null)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [allFolders, setAllFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)

  const [previews, setPreviews] = useState<UploadPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const fetchData = useCallback(async () => {
    if (!folderId) return
    const [folderRes, imagesRes, foldersRes] = await Promise.all([
      supabase.from('folders').select('*').eq('id', folderId).single(),
      supabase.from('images').select('*').eq('folder_id', folderId).order('sort_order'),
      supabase.from('folders').select('*').neq('id', folderId).order('title'),
    ])
    if (folderRes.data) {
      setFolder(folderRes.data)
      setTitle(folderRes.data.title)
      setDescription(folderRes.data.description || '')
      setIsPublic(folderRes.data.is_public)
      setDateFrom(folderRes.data.date_from || '')
      setDateTo(folderRes.data.date_to || '')
    }
    setImages(imagesRes.data || [])
    setAllFolders(foldersRes.data || [])
    setLoading(false)
  }, [folderId])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSaveFolder = async () => {
    setSaving(true)
    await supabase.from('folders').update({
      title, slug: slugify(title), description: description || null,
      is_public: isPublic, date_from: dateFrom || null, date_to: dateTo || null,
      updated_at: new Date().toISOString(),
    }).eq('id', folderId!)
    setSaving(false)
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverUploading(true)
    const compressed = await compressImage(file)
    const ext = file.name.split('.').pop()
    const path = `${folderId}/cover-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('gallery').upload(path, compressed, { contentType: file.type, upsert: true })
    if (!error) {
      const publicUrl = getPublicImageUrl(path)
      await supabase.from('folders').update({ cover_image_url: publicUrl }).eq('id', folderId!)
      setFolder((prev) => prev ? { ...prev, cover_image_url: publicUrl } : null)
    }
    setCoverUploading(false)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPreviews: UploadPreview[] = acceptedFiles.map((file) => ({
      file, url: URL.createObjectURL(file), filter: 'none' as FilterName, caption: '',
    }))
    setPreviews((prev) => [...prev, ...newPreviews])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: true })

  const updatePreviewFilter = (index: number, filter: FilterName) =>
    setPreviews((prev) => prev.map((p, i) => i === index ? { ...p, filter } : p))

  const updatePreviewCaption = (index: number, caption: string) =>
    setPreviews((prev) => prev.map((p, i) => i === index ? { ...p, caption } : p))

  const removePreview = (index: number) =>
    setPreviews((prev) => prev.filter((_, i) => i !== index))

  const handleUpload = async () => {
    if (previews.length === 0) return
    setUploading(true)
    setUploadProgress(0)
    const uploaded: GalleryImage[] = []

    for (let i = 0; i < previews.length; i++) {
      const preview = previews[i]
      const compressed = await compressImage(preview.file)
      const ext = preview.file.name.split('.').pop()
      const path = `${folderId}/${Date.now()}-${i}.${ext}`
      const { error: uploadError } = await supabase.storage.from('gallery').upload(path, compressed, { contentType: preview.file.type })
      if (!uploadError) {
        const publicUrl = getPublicImageUrl(path)
        const { data: imgData } = await supabase.from('images').insert({
          folder_id: folderId!, image_url: publicUrl,
          caption: preview.caption || null,
          filter_name: preview.filter === 'none' ? null : preview.filter,
          sort_order: images.length + i,
        }).select().single()
        if (imgData) uploaded.push(imgData)
      }
      setUploadProgress(Math.round(((i + 1) / previews.length) * 100))
    }

    setImages((prev) => [...prev, ...uploaded])
    setPreviews([])
    setUploading(false)
  }

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Delete this image?')) return
    await supabase.from('images').delete().eq('id', id)
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const handleSetCover = async (url: string) => {
    await supabase.from('folders').update({ cover_image_url: url }).eq('id', folderId!)
    setFolder((prev) => prev ? { ...prev, cover_image_url: url } : null)
  }

  const handleUpdateCaption = async (id: string, caption: string) => {
    await supabase.from('images').update({ caption: caption || null }).eq('id', id)
    setImages((prev) => prev.map((img) => img.id === id ? { ...img, caption } : img))
  }

  const handleMoveImage = async (imageId: string, targetFolderId: string) => {
    await supabase.from('images').update({ folder_id: targetFolderId }).eq('id', imageId)
    setImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = images.findIndex((img) => img.id === active.id)
    const newIndex = images.findIndex((img) => img.id === over.id)
    const reordered = arrayMove(images, oldIndex, newIndex)
    setImages(reordered)
    await Promise.all(reordered.map((img, index) => supabase.from('images').update({ sort_order: index }).eq('id', img.id)))
  }

  const handleDeleteFolder = async () => {
    if (!confirm('Delete this entire folder and all images?')) return
    await supabase.from('images').delete().eq('folder_id', folderId!)
    await supabase.from('folders').delete().eq('id', folderId!)
    navigate('/admin/folders')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-mono text-sm text-cream/30 animate-pulse tracking-widest uppercase">Loading…</p>
      </div>
    )
  }

  if (!folder) {
    return (
      <div className="text-center py-20">
        <p className="text-cream/30 font-mono text-sm">Folder not found</p>
        <Link to="/admin/folders" className="mt-4 text-cream/50 hover:text-cream text-sm font-mono underline">Back to folders</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link to="/admin/folders" className="p-2 rounded-lg text-cream/30 hover:text-cream hover:bg-cream/10 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-2xl text-off-white">{folder.title}</h1>
            <p className="text-cream/35 text-sm font-mono mt-0.5">/{folder.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/folder/${folder.slug}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-mono text-cream/40 hover:text-cream hover:bg-cream/10 transition-colors border border-cream/10">
            <Eye size={14} />
            Preview
          </Link>
          <button onClick={handleDeleteFolder} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-mono text-dusty-pink/60 hover:text-dusty-pink hover:bg-dusty-pink/10 transition-colors border border-dusty-pink/20">
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Folder settings */}
        <section className="bg-cream/5 border border-cream/10 rounded-xl p-6">
          <h2 className="font-mono text-xs tracking-widest uppercase text-cream/40 mb-5">Folder Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-mono text-[10px] tracking-widest uppercase text-cream/35 mb-2">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-cream/5 border border-cream/15 rounded-lg px-3 py-2.5 text-sm text-off-white placeholder-cream/25 focus:outline-none focus:border-cream/40 transition-colors" />
            </div>
            <div>
              <label className="block font-mono text-[10px] tracking-widest uppercase text-cream/35 mb-2">Visibility</label>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-mono border transition-colors w-full ${isPublic ? 'bg-soft-blue/15 border-soft-blue/30 text-soft-blue' : 'bg-cream/5 border-cream/15 text-cream/40'}`}
              >
                {isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
                {isPublic ? 'Public' : 'Private'}
              </button>
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-mono text-[10px] tracking-widest uppercase text-cream/35 mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="A short description…" className="w-full bg-cream/5 border border-cream/15 rounded-lg px-3 py-2.5 text-sm text-off-white placeholder-cream/25 focus:outline-none focus:border-cream/40 transition-colors resize-none" />
          </div>

          <div className="mb-4">
            <label className="block font-mono text-[10px] tracking-widest uppercase text-cream/35 mb-2">Cover Image</label>
            <div className="flex items-center gap-4">
              {folder.cover_image_url && (
                <div className="relative w-20 h-14 rounded-md overflow-hidden flex-shrink-0 border border-cream/15">
                  <img src={folder.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-mono border border-cream/15 cursor-pointer transition-colors ${coverUploading ? 'opacity-50 pointer-events-none' : 'hover:bg-cream/10 text-cream/50 hover:text-cream'}`}>
                <ImagePlus size={14} />
                {coverUploading ? 'Uploading…' : folder.cover_image_url ? 'Change Cover' : 'Upload Cover'}
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block font-mono text-[10px] tracking-widest uppercase text-cream/35 mb-2">Album Start Date</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full bg-cream/5 border border-cream/15 rounded-lg px-3 py-2.5 text-sm text-off-white focus:outline-none focus:border-cream/40 transition-colors" />
            </div>
            <div>
              <label className="block font-mono text-[10px] tracking-widest uppercase text-cream/35 mb-2">Album End Date</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full bg-cream/5 border border-cream/15 rounded-lg px-3 py-2.5 text-sm text-off-white focus:outline-none focus:border-cream/40 transition-colors" />
            </div>
          </div>
          <button onClick={handleSaveFolder} disabled={saving} className="flex items-center gap-2 bg-cream text-charcoal px-4 py-2 rounded-lg text-sm font-mono hover:bg-off-white transition-colors disabled:opacity-50">
            <Save size={14} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </section>

        {/* Upload section */}
        <section className="bg-cream/5 border border-cream/10 rounded-xl p-6">
          <h2 className="font-mono text-xs tracking-widest uppercase text-cream/40 mb-5">Upload Images</h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-cream/40 bg-cream/10' : 'border-cream/15 hover:border-cream/30 hover:bg-cream/5'}`}
          >
            <input {...getInputProps()} />
            <Upload size={24} className="mx-auto mb-3 text-cream/30" />
            <p className="text-cream/50 text-sm mb-1">{isDragActive ? 'Drop images here…' : 'Drag & drop images, or click to select'}</p>
            <p className="font-mono text-xs text-cream/25 tracking-wide">JPG, PNG, WEBP, GIF · Multiple files supported</p>
          </div>

          {previews.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-xs tracking-widest uppercase text-cream/40">
                  {previews.length} image{previews.length > 1 ? 's' : ''} ready to upload
                </p>
                <button onClick={handleUpload} disabled={uploading} className="flex items-center gap-2 bg-cream text-charcoal px-4 py-2 rounded-lg text-sm font-mono hover:bg-off-white transition-colors disabled:opacity-50">
                  <Upload size={14} />
                  {uploading ? `Uploading… ${uploadProgress}%` : 'Upload All'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative bg-cream/5 border border-cream/10 rounded-lg overflow-hidden">
                    <div className="relative aspect-square overflow-hidden">
                      <img src={preview.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" style={getFilterStyle(preview.filter)} />
                      <button onClick={() => removePreview(index)} className="absolute top-2 right-2 p-1 bg-charcoal/60 rounded-full text-cream/60 hover:text-cream transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                    <div className="p-2 space-y-1.5">
                      <select value={preview.filter} onChange={(e) => updatePreviewFilter(index, e.target.value as FilterName)} className="w-full bg-cream/5 border border-cream/15 rounded-md px-1.5 py-1 text-xs text-off-white focus:outline-none font-mono">
                        {FILTERS.map((f) => <option key={f.name} value={f.name}>{f.label}</option>)}
                      </select>
                      <input type="text" value={preview.caption} onChange={(e) => updatePreviewCaption(index, e.target.value)} placeholder="Caption…" className="w-full bg-cream/5 border border-cream/15 rounded-md px-1.5 py-1 text-xs text-off-white placeholder-cream/20 focus:outline-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Image management */}
        <section className="bg-cream/5 border border-cream/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-mono text-xs tracking-widest uppercase text-cream/40">Images ({images.length})</h2>
            <p className="text-cream/25 text-xs font-mono">Drag to reorder · Hover for options</p>
          </div>
          {images.length === 0 ? (
            <div className="text-center py-12 text-cream/20">
              <p className="font-mono text-sm tracking-widest uppercase">No images yet</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {images.map((image) => (
                    <SortableImage
                      key={image.id}
                      image={image}
                      isCover={folder.cover_image_url === image.image_url}
                      onDelete={handleDeleteImage}
                      onSetCover={handleSetCover}
                      onUpdateCaption={handleUpdateCaption}
                      onMoveToFolder={handleMoveImage}
                      folders={allFolders}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </section>
      </div>
    </div>
  )
}
