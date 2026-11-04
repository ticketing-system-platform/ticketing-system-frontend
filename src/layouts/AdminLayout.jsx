import {
  CalendarDays,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Receipt,
  ScanLine,
  Tags,
} from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { Logo } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const menu = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/events', label: 'Event', icon: CalendarDays },
  { to: '/admin/ticket-types', label: 'Jenis Tiket', icon: Tags },
  { to: '/admin/orders', label: 'Transaksi', icon: Receipt },
  { to: '/admin/scanner', label: 'Scan Check-in', icon: ScanLine },
]

const linkClass = ({ isActive }) =>
  `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar (desktop) / menu atas (mobile) */}
      <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex h-16 items-center justify-between px-5">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              Admin
            </span>
            {/* Tombol keluar khusus layar kecil */}
            <button onClick={handleLogout} className="btn btn-ghost px-2 lg:hidden" title="Keluar">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:pt-4">
          {menu.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-slate-200 p-4 lg:block">
          <Link to="/" className="btn btn-ghost mb-2 w-full justify-start px-3">
            <ExternalLink className="size-4" /> Lihat Website
          </Link>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-600"
              title="Keluar"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
