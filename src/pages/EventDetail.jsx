import { ArrowLeft, CalendarDays, MapPin, Minus, Plus, SearchX, Ticket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import EmptyState from '../components/EmptyState'
import { EventBanner } from '../components/EventCard'
import PageLoader from '../components/Loading'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { formatDateTime, formatRupiah } from '../lib/format'

const MAX_PER_TYPE = 10 // sama dengan validasi max:10 di CheckoutRequest

export default function EventDetail() {
  const { slug } = useParams() // ambil :slug dari URL /events/:slug
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState({}) // { ticketTypeId: qty }

  useEffect(() => {
    api
      .get(`/events/${slug}`)
      .then((res) => setEvent(res.data.data))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <PageLoader />

  if (!event) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={SearchX}
          title="Event tidak ditemukan"
          description="Event mungkin sudah dihapus atau belum dipublikasikan."
          action={
            <Link to="/" className="btn btn-primary">
              Kembali ke Beranda
            </Link>
          }
        />
      </div>
    )
  }

  function changeQty(ticketType, delta) {
    const max = Math.min(ticketType.remaining, MAX_PER_TYPE)
    const current = quantities[ticketType.id] ?? 0
    const next = Math.max(0, Math.min(max, current + delta))
    setQuantities({ ...quantities, [ticketType.id]: next })
  }

  // Jenis tiket yang jumlahnya > 0
  const selected = event.ticket_types
    .filter((type) => (quantities[type.id] ?? 0) > 0)
    .map((type) => ({ ticketType: type, qty: quantities[type.id] }))

  const total = selected.reduce((sum, item) => sum + item.ticketType.price * item.qty, 0)

  function handleBuy() {
    if (!user) {
      // Belum login: arahkan ke login, lalu kembali ke halaman ini
      navigate('/login', { state: { from: location } })
      return
    }
    // Kirim data pilihan tiket ke halaman Checkout lewat "state" navigasi
    navigate('/checkout', { state: { event, items: selected } })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="size-4" /> Kembali
      </Link>

      <div className="aspect-[21/9] overflow-hidden rounded-3xl bg-slate-100 shadow-sm">
        <EventBanner event={event} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Informasi event */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {event.title}
          </h1>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="card flex items-start gap-3 p-4">
              <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <CalendarDays className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-slate-500">Tanggal & Waktu</p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatDateTime(event.start_at)}
                </p>
              </div>
            </div>
            <div className="card flex items-start gap-3 p-4">
              <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <MapPin className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-slate-500">Lokasi</p>
                <p className="text-sm font-semibold text-slate-900">{event.venue}</p>
              </div>
            </div>
          </div>

          <h2 className="mt-8 text-lg font-bold text-slate-900">Tentang Event</h2>
          {/* whitespace-pre-line: baris baru (\n) di deskripsi tetap tampil */}
          <p className="mt-2 leading-relaxed whitespace-pre-line text-slate-600">
            {event.description}
          </p>
        </div>

        {/* Pilih tiket */}
        <aside>
          <div className="card sticky top-24 p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Ticket className="size-5 text-indigo-600" /> Pilih Tiket
            </h2>

            <div className="mt-4 space-y-3">
              {event.ticket_types.length === 0 && (
                <p className="text-sm text-slate-500">Tiket belum tersedia.</p>
              )}

              {event.ticket_types.map((type) => {
                const qty = quantities[type.id] ?? 0
                const soldOut = type.remaining === 0

                return (
                  <div
                    key={type.id}
                    className={`rounded-xl border p-4 transition ${
                      qty > 0 ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200'
                    } ${soldOut ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{type.name}</p>
                        <p className="text-sm font-medium text-indigo-600">
                          {formatRupiah(type.price)}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          soldOut
                            ? 'text-rose-600'
                            : type.remaining <= 10
                              ? 'text-amber-600'
                              : 'text-slate-500'
                        }`}
                      >
                        {soldOut ? 'Habis' : `Sisa ${type.remaining}`}
                      </span>
                    </div>

                    {!soldOut && (
                      <div className="mt-3 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => changeQty(type, -1)}
                          disabled={qty === 0}
                          className="btn btn-secondary size-8 rounded-lg p-0"
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="w-6 text-center font-semibold tabular-nums">{qty}</span>
                        <button
                          type="button"
                          onClick={() => changeQty(type, 1)}
                          disabled={qty >= Math.min(type.remaining, MAX_PER_TYPE)}
                          className="btn btn-secondary size-8 rounded-lg p-0"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-500">Total</span>
              <span className="text-xl font-bold text-slate-900">{formatRupiah(total)}</span>
            </div>

            <button
              onClick={handleBuy}
              disabled={selected.length === 0}
              className="btn btn-primary mt-4 w-full py-3"
            >
              {user ? 'Beli Tiket' : 'Masuk untuk Membeli'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
