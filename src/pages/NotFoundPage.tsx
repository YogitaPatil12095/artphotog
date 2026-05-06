import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-cream/30 mb-4">404</p>
        <h1 className="font-display text-3xl text-off-white mb-4">Folder not found</h1>
        <p className="text-cream/40 text-sm mb-8">
          This archive entry doesn't exist or has been made private.
        </p>
        <Link
          to="/"
          className="font-mono text-sm tracking-widest uppercase text-cream/50 hover:text-cream transition-colors border-b border-cream/20 hover:border-cream/60 pb-0.5"
        >
          ← Return to Archive
        </Link>
      </div>
    </div>
  )
}
