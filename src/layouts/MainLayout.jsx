import { Outlet } from 'react-router'
import Navbar from '../components/Navbar'

const YEAR = new Date().getFullYear()

// Layout untuk halaman publik & customer: navbar di atas, footer di bawah
export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6">
          <p>© {YEAR} TiketEvent. Final Project Bootcamp Fullstack.</p>
          <p>Pembayaran diproses oleh Midtrans (Sandbox)</p>
        </div>
      </footer>
    </div>
  )
}
