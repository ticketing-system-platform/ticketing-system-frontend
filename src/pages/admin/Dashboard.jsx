import { Clock, Receipt, ScanLine, Ticket, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import PageLoader from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import api from '../../lib/api'
import { formatRupiah, formatShortDateTime } from '../../lib/format'

// Kartu angka ringkas (KPI)
function StatTile({ icon: Icon, label, value, hint }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="size-4" /> {label}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

// Bar progres terjual/kuota. Warna berubah saat hampir habis & habis.
function SalesMeter({ sold, quota }) {
  const percent = quota > 0 ? Math.round((sold / quota) * 100) : 0
  const tone =
    percent >= 100
      ? { track: 'bg-rose-100', fill: 'bg-rose-500' }
      : percent >= 80
        ? { track: 'bg-amber-100', fill: 'bg-amber-500' }
        : { track: 'bg-indigo-100', fill: 'bg-indigo-500' }

  return (
    <div className="flex items-center gap-3">
      <div className={`h-2 flex-1 overflow-hidden rounded-full ${tone.track}`}>
        <div
          className={`h-full rounded-full ${tone.fill}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-medium text-slate-600 tabular-nums">
        {percent}%
      </span>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data.data))
  }, [])

  if (!stats) return <PageLoader />

  const checkinRate = stats.tickets_issued
    ? Math.round((stats.tickets_checked_in / stats.tickets_issued) * 100)
    : 0

  return (
    <>
      <PageHeader title="Dashboard" description="Ringkasan penjualan tiket dan kehadiran." />

      {/* Angka utama: total pendapatan */}
      <div className="card relative overflow-hidden bg-linear-to-br from-indigo-600 to-violet-600 p-6 text-white">
        <div className="absolute -top-16 -right-10 size-56 rounded-full bg-white/10 blur-2xl" />
        <p className="flex items-center gap-2 text-sm text-indigo-100">
          <Wallet className="size-4" /> Total pendapatan (order lunas)
        </p>
        <p className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {formatRupiah(stats.revenue)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Receipt} label="Order lunas" value={stats.paid_orders} />
        <StatTile icon={Clock} label="Menunggu bayar" value={stats.pending_orders} />
        <StatTile icon={Ticket} label="Tiket terbit" value={stats.tickets_issued} />
        <StatTile
          icon={ScanLine}
          label="Sudah check-in"
          value={stats.tickets_checked_in}
          hint={`${checkinRate}% dari tiket terbit`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Penjualan per event */}
        <section className="card lg:col-span-3">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Penjualan per event</h2>
            <p className="text-xs text-slate-500">
              Terjual = tiket lunas + tiket yang sedang ditahan order pending
            </p>
          </div>
          <ul className="divide-y divide-slate-100">
            {stats.events.map((event) => (
              <li key={event.id} className="px-5 py-4">
                <div className="mb-2 flex items-baseline justify-between gap-4">
                  <p className="truncate text-sm font-medium text-slate-900">{event.title}</p>
                  <p className="shrink-0 text-xs text-slate-500 tabular-nums">
                    {event.tickets_sold} / {event.tickets_quota}
                  </p>
                </div>
                <SalesMeter sold={event.tickets_sold} quota={event.tickets_quota} />
              </li>
            ))}
          </ul>
        </section>

        {/* Order terbaru */}
        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Order terbaru</h2>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Lihat semua
            </Link>
          </div>
          {stats.recent_orders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">Belum ada order.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.recent_orders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{order.user.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatShortDateTime(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 tabular-nums">
                      {formatRupiah(order.total)}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
