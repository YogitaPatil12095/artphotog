import { useEffect } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { FolderOpen, LayoutDashboard, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/dashboard/folders', label: 'My Folders', icon: FolderOpen, exact: false },
]

export default function DashboardLayout() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <p className="font-mono text-xs tracking-widest uppercase text-cream/30 animate-pulse">Loading…</p>
      </div>
    )
  }

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#2A2826] flex">
      {/* Sidebar */}
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
              <span className="font-mono text-[9px] tracking-widest uppercase text-cream/30 block truncate max-w-[100px]">{user.email}</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to)
            return (
              <Link key={to} to={to} className={cn('admin-nav-item', active ? 'bg-cream/10 text-off-white' : 'text-cream/40 hover:text-cream/70 hover:bg-cream/5')}>
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-cream/8">
          <button onClick={handleSignOut} className="admin-nav-item w-full text-left text-cream/30 hover:text-dusty-pink hover:bg-cream/5">
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
