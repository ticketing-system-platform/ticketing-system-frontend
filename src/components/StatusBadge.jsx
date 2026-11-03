// Label status dengan warna. Warna selalu ditemani teks, tidak hanya warna saja.
const statuses = {
  pending: { label: 'Menunggu Bayar', className: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  paid: { label: 'Lunas', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  expired: { label: 'Kedaluwarsa', className: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
  failed: { label: 'Gagal', className: 'bg-rose-50 text-rose-700 ring-rose-600/20' },
  published: { label: 'Tayang', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
}

export default function StatusBadge({ status }) {
  const { label, className } = statuses[status] ?? { label: status, className: 'bg-slate-100' }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}
