import { BrowserRouter, Link, Route, Routes } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import EventDetail from './pages/EventDetail'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-extrabold text-indigo-600">404</h1>
      <p className="mt-2 text-lg font-semibold text-slate-800">Halaman Tidak Ditemukan</p>
      <p className="mt-1 text-sm text-slate-500">
        Halaman yang Anda cari belum tersedia atau dalam tahap pengembangan (P4–P8).
      </p>
      <Link to="/" className="btn btn-primary mt-6">
        Kembali ke Beranda
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Main Layout untuk halaman publik & customer */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="events/:slug" element={<EventDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Halaman Auth (tanpa header/footer MainLayout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
