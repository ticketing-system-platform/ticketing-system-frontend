import { CalendarDays, CircleCheck, MapPin, Ticket, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { Link } from 'react-router'
import EmptyState from '../../components/EmptyState'
import PageLoader from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import api from '../../lib/api'
import { formatDateTime, formatShortDateTime } from '../../lib/format'

// Kartu berbentuk tiket: info di kiri, QR code di kanan
function TicketCard({ ticket, onShowQr }) {
  const used = Boolean(ticket.checked_in_at)

  return (
    <div className={`card relative flex overflow-hidden ${used ? 'opacity-70' : ''}`}>
      <div className="w-1.5 shrink-0 bg-linear-to-b from-indigo-500 to-violet-500" />

      <div className="min-w-0 flex-1 p-5">
        <span className="inline-flex rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
          {ticket.ticket_type}
        </span>
        <h3 className="mt-2 truncate text-lg font-bold text-slate-900">{ticket.event.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <CalendarDays className="size-4 shrink-0" />
          <span className="truncate">{formatDateTime(ticket.event.start_at)}</span>
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">{ticket.event.venue}</span>
        </p>

        <div className="mt-4 text-xs">
          {used ? (
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
              <CircleCheck className="size-4" /> Check-in{' '}
              {formatShortDateTime(ticket.checked_in_at)}
            </span>
          ) : (
            <span className="text-slate-500">Atas nama {ticket.holder_name}</span>
          )}
        </div>
      </div>

      {/* Garis sobekan tiket */}
      <div className="relative border-l-2 border-dashed border-slate-200">
        <span className="absolute -top-3 -left-[13px] size-6 rounded-full bg-slate-50" />
        <span className="absolute -bottom-3 -left-[13px] size-6 rounded-full bg-slate-50" />
      </div>

      <button
        onClick={() => onShowQr(ticket)}
        className="flex shrink-0 flex-col items-center justify-center gap-2 p-4 transition hover:bg-slate-50"
        title="Perbesar QR"
      >
        <QRCode value={ticket.code} size={88} />
        <span className="font-mono text-[10px] text-slate-500">{ticket.code}</span>
      </button>
    </div>
  )
}

// Popup QR berukuran besar agar mudah di-scan petugas
function QrModal({ ticket, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card relative w-full max-w-sm p-8 text-center"
        onClick={(e) => e.stopPropagation()} // klik di dalam kartu tidak menutup popup
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="size-5" />
        </button>
        <p className="text-sm font-semibold text-indigo-600">{ticket.ticket_type}</p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">{ticket.event.title}</h3>
        <div className="mx-auto mt-6 w-fit rounded-2xl border border-slate-200 bg-white p-4">
          <QRCode value={ticket.code} size={220} />
        </div>
        <p className="mt-4 font-mono text-lg font-semibold tracking-wider text-slate-900">
          {ticket.code}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Tunjukkan QR code ini kepada petugas di pintu masuk.
        </p>
      </div>
    </div>
  )
}

export default function MyTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTicket, setActiveTicket] = useState(null) // tiket yang QR-nya diperbesar

  useEffect(() => {
    api
      .get('/my-tickets')
      .then((res) => setTickets(res.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Tiket Saya"
        description="Klik QR code untuk memperbesar saat check-in di lokasi acara."
      />

      {tickets.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Belum ada tiket"
          description="Tiket muncul di sini setelah pembayaran berhasil."
          action={
            <Link to="/" className="btn btn-primary">
              Cari Event
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onShowQr={setActiveTicket} />
          ))}
        </div>
      )}

      {activeTicket && <QrModal ticket={activeTicket} onClose={() => setActiveTicket(null)} />}
    </div>
  )
}
