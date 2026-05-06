import { Link } from 'react-router-dom'
import { Folder } from '@/types/database'

interface FolderCardProps {
  folder: Folder
  colorIndex: number
  imageCount?: number
}

const FOLDER_COLORS = [
  { bg: '#D8D1BF', tab: '#C4BAA6', text: '#2F2F2F', label: 'cream' },
  { bg: '#D8B7B3', tab: '#C4A09C', text: '#2F2F2F', label: 'dusty-pink' },
  { bg: '#B7C8CF', tab: '#9FB5BC', text: '#2F2F2F', label: 'soft-blue' },
  { bg: '#EDE8DC', tab: '#D8D1BF', text: '#2F2F2F', label: 'light-cream' },
]

export default function FolderCard({ folder, colorIndex, imageCount }: FolderCardProps) {
  const color = FOLDER_COLORS[colorIndex % FOLDER_COLORS.length]

  return (
    <Link to={`/folder/${folder.slug}`} className="block group">
      <div className="relative pt-3">
        <div className="absolute top-0 left-5 px-4 py-1 rounded-t-md z-10" style={{ backgroundColor: color.tab }}>
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase font-medium" style={{ color: color.text }}>
            {folder.title.length > 18 ? folder.title.slice(0, 18) + '…' : folder.title}
          </span>
        </div>

        <div className="relative rounded-b-lg rounded-tr-lg overflow-hidden shadow-folder group-hover:shadow-folder-hover transition-shadow duration-300" style={{ backgroundColor: color.bg }}>
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            {folder.cover_image_url ? (
              <img
                src={folder.cover_image_url}
                alt={folder.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/10">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: color.text }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                  <p className="font-mono text-xs opacity-40" style={{ color: color.text }}>No cover set</p>
                </div>
              </div>
            )}
            <div className="absolute top-3 right-4 w-10 h-5 rounded-sm opacity-40 rotate-12" style={{ backgroundColor: color.tab }} />
          </div>

          <div className="p-4">
            <h3 className="font-display text-lg leading-tight mb-1" style={{ color: color.text }}>{folder.title}</h3>
            {folder.description && (
              <p className="text-xs leading-relaxed opacity-60 line-clamp-2 mb-3" style={{ color: color.text }}>{folder.description}</p>
            )}
            <div className="flex items-center justify-between">
              {imageCount !== undefined && (
                <span className="font-mono text-[10px] tracking-widest uppercase opacity-50" style={{ color: color.text }}>
                  {imageCount} image{imageCount !== 1 ? 's' : ''}
                </span>
              )}
              {(folder.date_from || folder.date_to) && (
                <span className="font-mono text-[10px] tracking-wide opacity-50" style={{ color: color.text }}>
                  {folder.date_from ? new Date(folder.date_from).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                  {folder.date_from && folder.date_to ? ' – ' : ''}
                  {folder.date_to ? new Date(folder.date_to).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </span>
              )}
              <span className="font-mono text-[10px] tracking-widest uppercase opacity-40 ml-auto group-hover:opacity-70 transition-opacity" style={{ color: color.text }}>
                Open →
              </span>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-1 left-2 right-2 h-2 rounded-b-lg -z-10 opacity-40" style={{ backgroundColor: color.tab }} />
        <div className="absolute -bottom-2 left-4 right-4 h-2 rounded-b-lg -z-20 opacity-20" style={{ backgroundColor: color.tab }} />
      </div>
    </Link>
  )
}
