import { ChevronLeft, ChevronRight, Receipt, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import EmptyState from '../../components/EmptyState'
import PageLoader from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import api from '../../lib/api'
import { formatRupiah, formatShortDateTime } from '../../lib/format'

const tabs = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'paid', label: 'Lunas' },
  { value: 'expired', label: 'Kedaluwarsa' },
  { value: 'failed', label: 'Gagal' },
]

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null) // info pagination dari Laravel
  const [loading, setLoading] = useState(true)

  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    api
      .get('/admin/orders', { params: { status, search, page } })
      .then((res) => {
        setOrders(res.data.data)
        setMeta(res.data.meta)
      })
      .finally(() => setLoading(false))
  }, [status, search, page])

  function changeStatus(value) {
    setStatus(value)
    setPage(1) // kembali ke halaman 1 setiap filter berubah
  }

  function handleSearch(e) {
    e.preventDefault()
    setSearch(keyword)
    setPage(1)
  }

  if (loading) return <PageLoader />

  return (
    <>
      <PageHeader
        title="Transaksi"
        description="Semua order yang masuk beserta status pembayarannya."
      />

      {/* Filter status + pencarian */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => changeStatus(tab.value)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                status === tab.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Kode order / nama / email"
              className="input pl-9"
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Cari
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Tidak ada transaksi"
          description="Coba ubah filter atau kata kunci."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Tiket</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="align-top hover:bg-slate-50/60">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <p className="font-mono font-medium text-slate-900">{order.order_code}</p>
                      <p className="text-xs text-slate-500">
                        {formatShortDateTime(order.created_at)}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{order.user.name}</p>
                      <p className="text-xs text-slate-500">{order.user.email}</p>
                    </td>
                    <td className="min-w-64 px-5 py-3">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-slate-600">
                          {item.qty}× {item.ticket_type.name}{' '}
                          <span className="text-xs text-slate-400">
                            · {item.ticket_type.event.title}
                          </span>
                        </p>
                      ))}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold whitespace-nowrap text-slate-900 tabular-nums">
                      {formatRupiah(order.total)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm">
            <p className="text-slate-500">
              {meta.from}–{meta.to} dari {meta.total} order
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="btn btn-secondary px-2.5 py-1.5"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="px-2 py-1.5 text-slate-600">
                {meta.current_page} / {meta.last_page}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= meta.last_page}
                className="btn btn-secondary px-2.5 py-1.5"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
