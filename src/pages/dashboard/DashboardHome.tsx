import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { FolderOpen, ImageIcon, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Folder } from '@/types/database'

export default function DashboardHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ folders: 0, images: 0 })
  const [recentFolders, setRecentFolders] = useState<Folder[]>([])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const [foldersRes, imagesRes, recentRes] = await Promise.all([
        supabase.from('folders').select('id', { count: 'exact' }).eq('owner_id', user.id),
        supabase.from('images').select('id', { count: 'exact' }).eq('uploaded_by', user.id),
        supabase.from('folders').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(5),
      ])
      setStats({ folders: foldersRes.count || 0, images: imagesRes.count || 0 })
      setRecentFolders((recentRes.data as Folder[]) || [])
    }
    load()
  }, [user])

  const ACCESS_LABELS: Record<string, string> = {
    private: 'Private',
    public: 'Public',
    access_private: 'Collab (hidden)',
    access_public: 'Collab (public)',
  }

  const ACCESS_COLORS: Record<string, string> = {
    private: 'bg-cream/10 text-cream/30',
    public: 'bg-soft-blue/20 text-soft-blue',
    access_private: 'bg-warm-brown/20 text-warm-brown',
    access_public: 'bg-dusty-pink/20 text-dusty-pink',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl text-off-white mb-1">Dashboard</h1>
        <p className="text-cream/40 text-sm">Your archive overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        {[
          { label: 'My Folders', value: stats.folders, icon: FolderOpen, color: '#D8D1BF' },
          { label: 'My Images', value: stats.images, icon: ImageIcon, color: '#B7C8CF' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-cream/5 border border-cream/10 rounded-xl p-5">
              <Icon size={18} style={{ color: stat.color }} className="opacity-70 mb-4" />
              <p className="font-display text-3xl text-off-white mb-1">{stat.value}</p>
              <p className="font-mono text-xs tracking-widest uppercase text-cream/35">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="mb-10">
        <h2 className="font-mono text-xs tracking-widest uppercase text-cream/35 mb-4">Quick Actions</h2>
        <div className="flex gap-3">
          <Link to="/dashboard/folders" className="flex items-center gap-2 bg-cream text-charcoal px-4 py-2.5 rounded-lg text-sm font-mono hover:bg-off-white transition-colors">
            <Plus size={15} />
            New Folder
          </Link>
          <Link to="/dashboard/folders" className="flex items-center gap-2 bg-cream/10 text-cream/70 px-4 py-2.5 rounded-lg text-sm font-mono hover:bg-cream/15 transition-colors border border-cream/15">
            <FolderOpen size={15} />
            Manage Folders
          </Link>
        </div>
      </div>

      <div>
        <h2 className="font-mono text-xs tracking-widest uppercase text-cream/35 mb-4">Recent Folders</h2>
        <div className="space-y-2">
          {recentFolders.map((folder) => (
            <Link key={folder.id} to={`/dashboard/folders/${folder.id}`}
              className="flex items-center justify-between bg-cream/5 border border-cream/10 rounded-lg px-4 py-3 hover:bg-cream/8 transition-colors group">
              <div className="flex items-center gap-3">
                <FolderOpen size={15} className="text-cream/30" />
                <span className="text-sm text-cream/70 group-hover:text-cream transition-colors">{folder.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full ${ACCESS_COLORS[folder.access_mode]}`}>
                  {ACCESS_LABELS[folder.access_mode]}
                </span>
                <span className="text-cream/20 text-xs group-hover:text-cream/40 transition-colors">→</span>
              </div>
            </Link>
          ))}
          {recentFolders.length === 0 && (
            <p className="text-cream/25 text-sm font-mono text-center py-8">No folders yet. Create your first one!</p>
          )}
        </div>
      </div>
    </div>
  )
}
