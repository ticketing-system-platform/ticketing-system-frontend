import { ArrowLeft, Calendar, MapPin, Tag, Ticket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import { EventBanner } from '../components/EventCard'
import PageLoader from '../components/Loading'
import StatusBadge from '../components/StatusBadge'
import api, { getErrorMessage } from '../lib/api'
import { formatDateTime, formatRupiah } from '../lib/format'

export default function EventDetail() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    api
      .get(`/events/${slug}`)
      .then((res) => {
        if (!ignore) {
          setEvent(res.data.data)
          setError(null)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(getErrorMessage(err))
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [slug])

  if (loading) {
    return <PageLoader text="Memuat detail event..." />
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="size-4" /> Kembali ke Jelajahi Event
        </Link>
        <Alert type="error">{error || 'Event tidak ditemukan'}</Alert>
      </div>
    )
  }

  const ticketTypes = event.ticket_types || event.tickets_type || []
  const startAt = event.start_at || event['start-at']

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Tombol kembali */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" /> Kembali ke Jelajahi Event
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Banner, Info, Deskripsi */}
        <div className="space-y-6 lg:col-span-2">
          {/* Banner Event */}
          <div className="card overflow-hidden">
            <div className="aspect-[16/9] w-full bg-slate-100">
              <EventBanner event={event} />
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={event.status} />
                <span className="text-xs font-semibold text-indigo-600">
                  {ticketTypes.length} Pilihan Tiket
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {event.title}
              </h1>

              <div className="mt-4 grid grid-cols-1 gap-3 border-y border-slate-100 py-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">Waktu & Tanggal</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {startAt ? formatDateTime(startAt) : '-'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">Lokasi / Venue</div>
                    <div className="text-sm font-semibold text-slate-800">{event.venue}</div>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="mt-6">
                <h2 className="text-base font-semibold text-slate-900">Deskripsi Event</h2>
                <div className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-600">
                  {event.description || 'Tidak ada deskripsi untuk event ini.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Pilihan Tiket */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Ticket className="size-5 text-indigo-600" /> Pilihan Tiket
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Pilih tiket yang tersedia untuk event ini
            </p>

            <div className="mt-6 space-y-4">
              {ticketTypes.length === 0 ? (
                <EmptyState
                  icon={Tag}
                  title="Belum Ada Tiket"
                  description="Tiket untuk event ini belum dibuka atau belum ditambahkan oleh penyelenggara."
                />
              ) : (
                ticketTypes.map((ticket) => {
                  const isSoldOut = ticket.remaining === 0

                  return (
                    <div
                      key={ticket.id}
                      className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{ticket.name}</h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {isSoldOut ? (
                              <span className="font-semibold text-rose-600">Tiket Habis</span>
                            ) : (
                              `Sisa kuota: ${ticket.remaining ?? ticket.quota}`
                            )}
                          </p>
                        </div>
                        <span className="text-sm font-extrabold text-indigo-600">
                          {formatRupiah(ticket.price)}
                        </span>
                      </div>

                      <div className="mt-3 border-t border-slate-100 pt-3 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Termasuk pajak & biaya layanan</span>
                        <button
                          type="button"
                          disabled={isSoldOut}
                          className="btn btn-primary text-xs py-1.5 px-3"
                          onClick={() => {
                            alert(`Pembelian tiket akan dibuka pada modul transaksi (P4). Tiket: ${ticket.name}`)
                          }}
                        >
                          {isSoldOut ? 'Habis' : 'Pesan'}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
