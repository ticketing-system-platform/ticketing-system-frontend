import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'
import PageLoader from './Loading'

/**
 * Pembungkus route yang wajib login.
 * <Route element={<ProtectedRoute />}>             -> wajib login
 * <Route element={<ProtectedRoute role="admin" />}> -> wajib login sebagai admin
 */
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (!user) {
    // Simpan halaman asal agar setelah login bisa kembali ke sini
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }

  // Outlet = tempat halaman anak (child route) ditampilkan
  return <Outlet />
}
