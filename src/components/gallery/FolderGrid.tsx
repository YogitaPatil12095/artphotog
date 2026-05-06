import { Folder } from '@/types/database'
import FolderCard from './FolderCard'
import { motion } from 'framer-motion'

interface FolderGridProps {
  folders: Folder[]
}

const FOLDER_COLORS = ['cream', 'dusty-pink', 'soft-blue', 'light-cream']

export default function FolderGrid({ folders }: FolderGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
      {folders.map((folder, index) => (
        <motion.div
          key={folder.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <FolderCard folder={folder} colorIndex={index % FOLDER_COLORS.length} />
        </motion.div>
      ))}
    </div>
  )
}
