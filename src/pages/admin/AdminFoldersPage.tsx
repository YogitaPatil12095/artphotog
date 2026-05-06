import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type { Folder } from '@/types/database'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, GripVertical, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function SortableFolderRow({
  folder, onDelete, onTogglePublic,
}: {
  folder: Folder
  onDelete: (id: string) => void
  onTogglePublic: (id: string, current: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: folder.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 bg-cream/5 border border-cream/10 rounded-lg px-4 py-3 group">
      <button {...attributes} {...listeners} className="drag-handle text-cream/20 hover:text-cream/50 touch-none">
        <GripVertical size={16} />
      </button>

      <div className="w-10 h-10 rounded-sm overflow-hidden bg-cream/10 flex-shrink-0">
        {folder.cover_image_url ? (
          <img src={folder.cover_image_url} alt={folder.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cream/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-cream/80 font-medium truncate">{folder.title}</p>
        <p className="font-mono text-[10px] text-cream/30 tracking-wide">/{folder.slug}</p>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onTogglePublic(folder.id, folder.is_public)}
          className={`p-1.5 rounded-md transition-colors ${folder.is_public ? 'text-soft-blue hover:bg-soft-blue/10' : 'text-cream/25 hover:bg-cream/10'}`}
          title={folder.is_public ? 'Make private' : 'Make public'}
        >
          {folder.is_public ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <Link to={`/admin/folders/${folder.id}`} className="p-1.5 rounded-md text-cream/40 hover:text-cream hover:bg-cream/10 transition-colors">
          <Pencil size={14} />
        </Link>
        <button onClick={() => onDelete(folder.id)} className="p-1.5 rounded-md text-cream/25 hover:text-dusty-pink hover:bg-dusty-pink/10 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>

      <span className={`flex-shrink-0 font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full ${folder.is_public ? 'bg-soft-blue/15 text-soft-blue/70' : 'bg-cream/8 text-cream/25'}`}>
        {folder.is_public ? 'Public' : 'Private'}
      </span>
    </div>
  )
}

export default function AdminFoldersPage() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchFolders = useCallback(async () => {
    const { data } = await supabase.from('folders').select('*').order('sort_order', { ascending: true })
    setFolders(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchFolders() }, [fetchFolders])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = folders.findIndex((f) => f.id === active.id)
    const newIndex = folders.findIndex((f) => f.id === over.id)
    const reordered = arrayMove(folders, oldIndex, newIndex)
    setFolders(reordered)
    await Promise.all(reordered.map((folder, index) => supabase.from('folders').update({ sort_order: index }).eq('id', folder.id)))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    const slug = slugify(newTitle)
    const { error } = await supabase.from('folders').insert({
      title: newTitle.trim(), slug, description: newDescription.trim() || null, sort_order: folders.length, is_public: false,
    })
    if (!error) { setNewTitle(''); setNewDescription(''); setShowCreate(false); fetchFolders() }
    setCreating(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this folder and all its images?')) return
    await supabase.from('images').delete().eq('folder_id', id)
    await supabase.from('folders').delete().eq('id', id)
    setFolders((prev) => prev.filter((f) => f.id !== id))
  }

  const handleTogglePublic = async (id: string, current: boolean) => {
    await supabase.from('folders').update({ is_public: !current }).eq('id', id)
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, is_public: !current } : f)))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-off-white mb-1">Folders</h1>
          <p className="text-cream/40 text-sm">Drag to reorder · Click to manage images</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-cream text-charcoal px-4 py-2.5 rounded-lg text-sm font-mono tracking-wide hover:bg-off-white transition-colors">
          <Plus size={15} />
          New Folder
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-cream/5 border border-cream/15 rounded-xl p-5"
          >
            <h3 className="font-mono text-xs tracking-widest uppercase text-cream/50 mb-4">New Folder</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Folder title" required
                className="w-full bg-cream/5 border border-cream/15 rounded-lg px-4 py-2.5 text-sm text-off-white placeholder-cream/25 focus:outline-none focus:border-cream/40 transition-colors"
              />
              <textarea
                value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Short description (optional)" rows={2}
                className="w-full bg-cream/5 border border-cream/15 rounded-lg px-4 py-2.5 text-sm text-off-white placeholder-cream/25 focus:outline-none focus:border-cream/40 transition-colors resize-none"
              />
              <div className="flex gap-2">
                <button type="submit" disabled={creating} className="bg-cream text-charcoal px-4 py-2 rounded-lg text-sm font-mono hover:bg-off-white transition-colors disabled:opacity-50">
                  {creating ? 'Creating…' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="bg-cream/10 text-cream/50 px-4 py-2 rounded-lg text-sm font-mono hover:bg-cream/15 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <p className="text-cream/30 font-mono text-sm text-center py-12">Loading…</p>
      ) : folders.length === 0 ? (
        <div className="text-center py-20 text-cream/25">
          <p className="font-mono text-sm tracking-widest uppercase mb-4">No folders yet</p>
          <button onClick={() => setShowCreate(true)} className="text-cream/50 hover:text-cream text-sm font-mono underline underline-offset-4 transition-colors">
            Create your first folder
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={folders.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {folders.map((folder) => (
                <SortableFolderRow key={folder.id} folder={folder} onDelete={handleDelete} onTogglePublic={handleTogglePublic} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
