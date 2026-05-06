import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { FolderOpen, LayoutDashboard, LogOut, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/folders', label: 'Folders', icon: FolderOpen, exact: false },
]

export default function AdminSidebar() {
  const location = useLocation()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const isActive = (href: string, exact: boolean) => {
    if (exact) return location.pathname === href
    return location.pathname.startsWith(href)
  }

  return (
    <aside className="w-56 bg-[#221F1D] border-r border-cream/8 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-cream/8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-cream/10 rounded-sm flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="4" width="14" height="11" rx="1.5" fill="none" stroke="#D8D1BF" strokeWidth="1.2"/>
              <path d="M1 7h14" stroke="#D8D1BF" strokeWidth="1.2"/>
            </svg>
          </div>
          <div>
            <span className="font-mono text-xs tracking-widest uppercase text-cream/70 group-hover:text-cream transition-colors block">Crony</span>
            <span className="font-mono text-[9px] tracking-widest uppercase text-cream/30 block">Admin</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'admin-nav-item',
                active ? 'bg-cream/10 text-off-white' : 'text-cream/40 hover:text-cream/70 hover:bg-cream/5'
              )}
            >
              <Icon size={15} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-cream/8 space-y-1">
        <Link to="/" target="_blank" className="admin-nav-item text-cream/30 hover:text-cream/60 hover:bg-cream/5">
          <ExternalLink size={15} />
          View Site
        </Link>
        <button onClick={handleSignOut} className="admin-nav-item w-full text-left text-cream/30 hover:text-dusty-pink hover:bg-cream/5">
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
