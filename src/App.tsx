import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FolderPage from './pages/FolderPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminFoldersPage from './pages/admin/AdminFoldersPage'
import AdminFolderDetailPage from './pages/admin/AdminFolderDetailPage'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/folder/:slug" element={<FolderPage />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="folders" element={<AdminFoldersPage />} />
        <Route path="folders/:id" element={<AdminFolderDetailPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
