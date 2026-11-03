import { LoaderCircle } from 'lucide-react'

// Ikon berputar kecil, mis. di dalam tombol
export function Spinner({ className = 'size-4' }) {
  return <LoaderCircle className={`animate-spin ${className}`} />
}

// Loading satu halaman penuh
export default function PageLoader({ text = 'Memuat data...' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Spinner className="size-7 text-indigo-600" />
      <p className="text-sm">{text}</p>
    </div>
  )
}
