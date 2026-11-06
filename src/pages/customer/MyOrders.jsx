import { ChevronRight, Receipt } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import EmptyState from '../../components/EmptyState'
import PageLoader from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import api from '../../lib/api'
import { formatRupiah, formatShortDateTime } from '../../lib/format'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/orders')
      .then((res) => setOrders(res.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeader title="Pesanan Saya" description="Riwayat semua pembelian tiket Anda." />

      {orders.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Belum ada pesanan"
          description="Pesanan yang Anda buat akan muncul di sini."
          action={
            <Link to="/" className="btn btn-primary">
              Cari Event
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            // Nama event (tanpa duplikat) dan ringkasan tiket
            const events = [...new Set(order.items.map((item) => item.ticket_type.event.title))]
            const summary = order.items
              .map((item) => `${item.qty}× ${item.ticket_type.name}`)
              .join(', ')

            return (
              <Link
                key={order.id}
                to={`/orders/${order.order_code}`}
                className="card group flex flex-col gap-4 p-5 transition hover:border-indigo-200 hover:shadow-md sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-900">
                      {order.order_code}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-2 truncate font-semibold text-slate-900">{events.join(', ')}</p>
                  <p className="text-sm text-slate-500">
                    {summary} · {formatShortDateTime(order.created_at)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="font-bold text-slate-900">{formatRupiah(order.total)}</p>
                  </div>
                  <ChevronRight className="size-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
