import { Logo } from './Navbar'

// Bingkai kartu untuk halaman Login & Register
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden px-4 py-12">
      {/* Hiasan latar belakang */}
      <div className="absolute top-10 -left-24 size-80 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="absolute -right-24 bottom-0 size-80 rounded-full bg-fuchsia-200/40 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8 shadow-xl shadow-slate-200/60">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>}
      </div>
    </div>
  )
}
