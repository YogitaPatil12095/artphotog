import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { FolderOpen, ImageIcon, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ folders: 0, images: 0, publicFolders: 0 })
  const [recentFolders, setRecentFolders] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const [foldersRes, imagesRes, recentRes] = await Promise.all([
        supabase.from('folders').select('id, is_public', { count: 'exact' }),
        supabase.from('images').select('id', { count: 'exact' }),
        supabase.from('folders').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      const publicCount = (foldersRes.data || []).filter((f: any) => f.is_public).length
      setStats({ folders: foldersRes.count || 0, images: imagesRes.count || 0, publicFolders: publicCount })
      setRecentFolders(recentRes.data || [])
    }
    fetchData()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl text-off-white mb-1">Dashboard</h1>
        <p className="text-cream/40 text-sm">Overview of your archive</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Folders', value: stats.folders, icon: FolderOpen, color: '#D8D1BF' },
          { label: 'Public Folders', value: stats.publicFolders, icon: FolderOpen, color: '#D8B7B3' },
          { label: 'Total Images', value: stats.images, icon: ImageIcon, color: '#B7C8CF' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-cream/5 border border-cream/10 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <Icon size={18} style={{ color: stat.color }} className="opacity-70" />
              </div>
              <p className="font-display text-3xl text-off-white mb-1">{stat.value}</p>
              <p className="font-mono text-xs tracking-widest uppercase text-cream/35">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="mb-10">
        <h2 className="font-mono text-xs tracking-widest uppercase text-cream/35 mb-4">Quick Actions</h2>
        <div className="flex gap-3">
          <Link to="/admin/folders" className="flex items-center gap-2 bg-cream text-charcoal px-4 py-2.5 rounded-lg text-sm font-mono tracking-wide hover:bg-off-white transition-colors">
            <Plus size={15} />
            New Folder
          </Link>
          <Link to="/admin/folders" className="flex items-center gap-2 bg-cream/10 text-cream/70 px-4 py-2.5 rounded-lg text-sm font-mono tracking-wide hover:bg-cream/15 transition-colors border border-cream/15">
            <FolderOpen size={15} />
            Manage Folders
          </Link>
        </div>
      </div>

      <div>
        <h2 className="font-mono text-xs tracking-widest uppercase text-cream/35 mb-4">Recent Folders</h2>
        <div className="space-y-2">
          {recentFolders.map((folder) => (
            <Link
              key={folder.id}
              to={`/admin/folders/${folder.id}`}
              className="flex items-center justify-between bg-cream/5 border border-cream/10 rounded-lg px-4 py-3 hover:bg-cream/8 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FolderOpen size={15} className="text-cream/30" />
                <span className="text-sm text-cream/70 group-hover:text-cream transition-colors">{folder.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full ${folder.is_public ? 'bg-soft-blue/20 text-soft-blue' : 'bg-cream/10 text-cream/30'}`}>
                  {folder.is_public ? 'Public' : 'Private'}
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
