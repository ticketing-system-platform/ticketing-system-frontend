import { LayoutDashboard, LogOut, Menu, Ticket, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

// Logo aplikasi, juga dipakai di halaman login & admin
export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
      <span className="rounded-xl bg-indigo-600 p-1.5 text-white shadow-sm shadow-indigo-200">
        <Ticket className="size-5" />
      </span>
      <span className="text-lg tracking-tight">
        Tiket<span className="text-indigo-600">Event</span>
      </span>
    </Link>
  )
}

// className NavLink bisa berupa fungsi: isActive = true jika URL sedang dibuka
const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false) // menu mobile

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const links = (
    <>
      <NavLink to="/" end className={navClass} onClick={() => setOpen(false)}>
        Jelajahi Event
      </NavLink>
      {user && (
        <>
          <NavLink to="/my-tickets" className={navClass} onClick={() => setOpen(false)}>
            Tiket Saya
          </NavLink>
          <NavLink to="/orders" className={navClass} onClick={() => setOpen(false)}>
            Pesanan
          </NavLink>
        </>
      )}
      {user?.role === 'admin' && (
        <NavLink to="/admin" className={navClass} onClick={() => setOpen(false)}>
          <span className="inline-flex items-center gap-1.5">
            <LayoutDashboard className="size-4" /> Admin
          </span>
        </NavLink>
      )}
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">{links}</div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-full bg-slate-100 py-1 pr-3 pl-1">
                <span className="flex size-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-medium text-slate-700">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost px-3" title="Keluar">
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Masuk
              </Link>
              <Link to="/register" className="btn btn-primary">
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Tombol menu untuk layar kecil */}
        <button className="btn btn-ghost px-2 md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="space-y-3 border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">{links}</div>
          <div className="border-t border-slate-100 pt-3">
            {user ? (
              <button onClick={handleLogout} className="btn btn-secondary w-full">
                <LogOut className="size-4" /> Keluar ({user.name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" className="btn btn-secondary" onClick={() => setOpen(false)}>
                  Masuk
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setOpen(false)}>
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
