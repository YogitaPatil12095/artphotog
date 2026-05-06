import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

const HomePage = lazy(() => import('./pages/HomePage'))
const FolderPage = lazy(() => import('./pages/FolderPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignUpPage = lazy(() => import('./pages/SignUpPage'))
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'))
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'))
const DashboardFoldersPage = lazy(() => import('./pages/dashboard/DashboardFoldersPage'))
const DashboardFolderDetailPage = lazy(() => import('./pages/dashboard/DashboardFolderDetailPage'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center">
      <p className="font-mono text-xs tracking-widest uppercase text-cream/30 animate-pulse">Loading…</p>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/folder/:slug" element={<FolderPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="folders" element={<DashboardFoldersPage />} />
          <Route path="folders/:id" element={<DashboardFolderDetailPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
