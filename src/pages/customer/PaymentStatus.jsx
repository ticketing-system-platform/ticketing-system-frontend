import { CircleCheck, CircleX, Clock, SearchX, TimerOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import Alert from '../../components/Alert'
import EmptyState from '../../components/EmptyState'
import PageLoader from '../../components/Loading'
import StatusBadge from '../../components/StatusBadge'
import api, { getErrorMessage } from '../../lib/api'
import { formatRupiah, formatShortDateTime } from '../../lib/format'
import { payWithSnap } from '../../lib/midtrans'

// Tampilan untuk setiap status order
const views = {
  pending: {
    icon: Clock,
    color: 'bg-amber-100 text-amber-600',
    title: 'Menunggu Pembayaran',
    text: 'Selesaikan pembayaran sebelum waktu habis. Halaman ini otomatis diperbarui setelah pembayaran diterima.',
  },
  paid: {
    icon: CircleCheck,
    color: 'bg-emerald-100 text-emerald-600',
    title: 'Pembayaran Berhasil',
    text: 'E-tiket sudah terbit dan dikirim ke email Anda. Tunjukkan QR code saat masuk ke lokasi acara.',
  },
  expired: {
    icon: TimerOff,
    color: 'bg-slate-100 text-slate-500',
    title: 'Order Kedaluwarsa',
    text: 'Batas waktu pembayaran sudah habis dan kuota tiket dikembalikan. Silakan pesan ulang.',
  },
  failed: {
    icon: CircleX,
    color: 'bg-rose-100 text-rose-600',
    title: 'Pembayaran Gagal',
    text: 'Pembayaran dibatalkan atau ditolak. Silakan pesan ulang.',
  },
}

// Hitung mundur menuju batas waktu pembayaran
function Countdown({ expiresAt }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = Math.max(0, new Date(expiresAt).getTime() - now)
  const minutes = String(Math.floor(diff / 60000)).padStart(2, '0')
  const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')

  return (
    <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
      {minutes}:{seconds}
    </span>
  )
}

export default function PaymentStatus() {
  const { code } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Ambil data order. Selama masih "pending", cek ulang setiap 5 detik (polling)
  // karena status berubah di backend saat webhook Midtrans masuk.
  useEffect(() => {
    let active = true
    let timer

    function fetchOrder() {
      api
        .get(`/orders/${code}`)
        .then((res) => {
          if (!active) return
          setOrder(res.data.data)
          if (res.data.data.status === 'pending') {
            timer = setTimeout(fetchOrder, 5000)
          }
        })
        .catch((err) => active && setError(getErrorMessage(err)))
        .finally(() => active && setLoading(false))
    }

    fetchOrder()

    // Cleanup: hentikan polling saat pindah halaman
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [code])

  async function handlePayAgain() {
    try {
      // Snap token yang sama masih bisa dipakai selama order belum kedaluwarsa
      await payWithSnap(order.snap_token)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <PageLoader text="Memeriksa status pembayaran..." />

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={SearchX}
          title="Order tidak ditemukan"
          description={error}
          action={
            <Link to="/orders" className="btn btn-primary">
              Lihat Pesanan Saya
            </Link>
          }
        />
      </div>
    )
  }

  const view = views[order.status]
  const Icon = view.icon
  const tickets = order.items.flatMap((item) =>
    (item.tickets || []).map((ticket) => ({ ...ticket, typeName: item.ticket_type.name })),
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Kartu status */}
      <div className="card p-8 text-center">
        <div
          className={`mx-auto flex size-16 items-center justify-center rounded-full ${view.color}`}
        >
          <Icon className="size-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{view.title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{view.text}</p>

        {order.status === 'pending' && (
          <div className="mt-6">
            <p className="text-xs font-medium text-slate-500">Sisa waktu pembayaran</p>
            <Countdown expiresAt={order.expires_at} />
            <div className="mt-5">
              <button onClick={handlePayAgain} className="btn btn-primary px-8 py-3">
                Bayar Sekarang
              </button>
            </div>
          </div>
        )}

        {order.status === 'paid' && (
          <Link to="/my-tickets" className="btn btn-primary mt-6 px-8 py-3">
            Lihat Tiket Saya
          </Link>
        )}

        {['expired', 'failed'].includes(order.status) && (
          <Link to="/" className="btn btn-secondary mt-6 px-8 py-3">
            Cari Event Lain
          </Link>
        )}

        {error && (
          <div className="mt-4 text-left">
            <Alert type="error">{error}</Alert>
          </div>
        )}
      </div>

      {/* Detail order */}
      <div className="card mt-6 divide-y divide-slate-100">
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-xs text-slate-500">Kode order</p>
            <p className="font-mono font-semibold text-slate-900">{order.order_code}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <ul className="space-y-3 p-5">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 text-sm">
              <div>
                <p className="font-medium text-slate-900">{item.ticket_type.event.title}</p>
                <p className="text-slate-500">
                  {item.ticket_type.name} × {item.qty}
                </p>
              </div>
              <span className="font-medium text-slate-900 tabular-nums">
                {formatRupiah(item.subtotal)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between p-5">
          <span className="font-semibold text-slate-900">Total</span>
          <span className="text-lg font-bold text-indigo-600">{formatRupiah(order.total)}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 p-5 text-sm">
          <div>
            <p className="text-slate-500">Dipesan</p>
            <p className="font-medium text-slate-900">{formatShortDateTime(order.created_at)}</p>
          </div>
          <div>
            <p className="text-slate-500">{order.paid_at ? 'Dibayar' : 'Batas bayar'}</p>
            <p className="font-medium text-slate-900">
              {formatShortDateTime(order.paid_at ?? order.expires_at)}
            </p>
          </div>
        </div>

        {tickets.length > 0 && (
          <div className="p-5">
            <p className="text-sm font-semibold text-slate-900">Kode tiket</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tickets.map((ticket) => (
                <span
                  key={ticket.id}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700"
                >
                  {ticket.code} · {ticket.typeName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
