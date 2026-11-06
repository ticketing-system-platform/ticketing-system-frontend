import { CalendarDays, Check, Clock, MapPin, ShieldCheck, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import Alert from '../../components/Alert'
import EmptyState from '../../components/EmptyState'
import { EventBanner } from '../../components/EventCard'
import { Spinner } from '../../components/Loading'
import { useAuth } from '../../context/AuthContext'
import api, { getErrorMessage } from '../../lib/api'
import { formatDateTime, formatRupiah } from '../../lib/format'
import { payWithSnap } from '../../lib/midtrans'

// Indikator langkah: Pilih Tiket -> Pembayaran -> E-Tiket
function Steps() {
  const steps = ['Pilih Tiket', 'Pembayaran', 'E-Tiket']
  return (
    <ol className="mb-8 flex items-center gap-2 text-sm">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-2">
          <span
            className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
              index === 0
                ? 'bg-indigo-600 text-white'
                : index === 1
                  ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600'
                  : 'bg-slate-200 text-slate-500'
            }`}
          >
            {index === 0 ? <Check className="size-4" /> : index + 1}
          </span>
          <span className={index === 1 ? 'font-semibold text-slate-900' : 'text-slate-500'}>
            {step}
          </span>
          {index < steps.length - 1 && <span className="mx-1 h-px w-8 bg-slate-300 sm:w-12" />}
        </li>
      ))}
    </ol>
  )
}

export default function Checkout() {
  const { state } = useLocation() // data dari halaman Detail Event
  const { user } = useAuth()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  // Halaman di-refresh / dibuka langsung: data pilihan tiket hilang
  if (!state?.items?.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Belum ada tiket yang dipilih"
          description="Pilih event dan jumlah tiket terlebih dahulu."
          action={
            <Link to="/" className="btn btn-primary">
              Lihat Event
            </Link>
          }
        />
      </div>
    )
  }

  const { event, items } = state
  const total = items.reduce((sum, item) => sum + item.ticketType.price * item.qty, 0)

  async function handlePay() {
    setProcessing(true)
    setError('')

    try {
      // 1. Buat order di backend (kuota dikunci, Snap token dibuat)
      const res = await api.post('/checkout', {
        items: items.map((item) => ({ ticket_type_id: item.ticketType.id, qty: item.qty })),
      })
      const order = res.data.data

      // 2. Buka popup Midtrans. Apa pun hasilnya, arahkan ke halaman status.
      //    Status final tetap ditentukan webhook di backend.
      const goToStatus = () => navigate(`/orders/${order.order_code}`, { replace: true })
      await payWithSnap(order.snap_token, {
        onSuccess: goToStatus,
        onPending: goToStatus,
        onError: goToStatus,
        onClose: goToStatus,
      })
    } catch (err) {
      setError(getErrorMessage(err)) // mis. "Sisa kuota tiket VIP tinggal 1."
      setProcessing(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Steps />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {/* Ringkasan event */}
          <section className="card overflow-hidden">
            <div className="flex gap-4 p-5">
              <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                <EventBanner event={event} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-slate-900">{event.title}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <CalendarDays className="size-4" /> {formatDateTime(event.start_at)}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="size-4" /> {event.venue}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Tiket yang dipesan</h3>
              <ul className="mt-3 space-y-2">
                {items.map(({ ticketType, qty }) => (
                  <li key={ticketType.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {ticketType.name}{' '}
                      <span className="text-slate-400">
                        × {qty} @ {formatRupiah(ticketType.price)}
                      </span>
                    </span>
                    <span className="font-medium text-slate-900 tabular-nums">
                      {formatRupiah(ticketType.price * qty)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Data pemesan */}
          <section className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900">Data pemesan</h3>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Nama</dt>
                <dd className="font-medium text-slate-900">{user.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900">{user.email}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-slate-500">
              E-tiket akan dikirim ke email di atas setelah pembayaran berhasil.
            </p>
          </section>
        </div>

        {/* Pembayaran */}
        <aside className="lg:col-span-2">
          <div className="card sticky top-24 p-5">
            <h3 className="font-semibold text-slate-900">Ringkasan pembayaran</h3>

            <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-4 text-sm">
              <span className="text-slate-500">
                {items.reduce((sum, item) => sum + item.qty, 0)} tiket
              </span>
              <span className="text-slate-900 tabular-nums">{formatRupiah(total)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Total bayar</span>
              <span className="text-2xl font-bold text-indigo-600">{formatRupiah(total)}</span>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              <Clock className="mt-0.5 size-4 shrink-0" />
              Selesaikan pembayaran dalam 30 menit. Lewat dari itu, order otomatis dibatalkan.
            </div>

            {error && (
              <div className="mt-4">
                <Alert type="error">{error}</Alert>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={processing}
              className="btn btn-primary mt-5 w-full py-3"
            >
              {processing && <Spinner />}
              {processing ? 'Memproses...' : 'Bayar Sekarang'}
            </button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="size-4 text-emerald-600" />
              Transfer Bank · GoPay · QRIS · Kartu Kredit
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
