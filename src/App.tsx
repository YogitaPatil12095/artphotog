import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FolderPage from './pages/FolderPage'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import DashboardFoldersPage from './pages/dashboard/DashboardFoldersPage'
import DashboardFolderDetailPage from './pages/dashboard/DashboardFolderDetailPage'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/folder/:slug" element={<FolderPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Authenticated dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="folders" element={<DashboardFoldersPage />} />
        <Route path="folders/:id" element={<DashboardFolderDetailPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
