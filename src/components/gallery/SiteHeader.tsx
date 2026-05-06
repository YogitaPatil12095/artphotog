import { Link } from 'react-router-dom'

export default function SiteHeader() {
  return (
    <header className="border-b border-cream/10 px-6 py-5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-3">
          <div className="w-8 h-8 bg-cream/10 border border-cream/20 rounded-sm flex items-center justify-center group-hover:bg-cream/15 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="4" width="14" height="11" rx="1.5" fill="none" stroke="#D8D1BF" strokeWidth="1.2"/>
              <path d="M1 7h14" stroke="#D8D1BF" strokeWidth="1.2"/>
              <path d="M1 6c0-.83 0-1.24.15-1.56A1.5 1.5 0 012.44 3.5C2.76 3.35 3.17 3.35 4 3.35h1.17c.51 0 .77 0 1.01.08.21.07.4.19.55.35.18.18.28.43.49.93L7.5 5.5" stroke="#D8D1BF" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-mono text-sm tracking-[0.15em] uppercase text-cream/80 group-hover:text-cream transition-colors">
            Crony
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/admin"
            className="font-mono text-xs tracking-widest uppercase text-cream/30 hover:text-cream/60 transition-colors"
          >
            Admin ↗
          </Link>
        </nav>
      </div>
    </header>
  )
}
