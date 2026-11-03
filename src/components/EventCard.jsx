import { MapPin, Ticket } from 'lucide-react'
import { Link } from 'react-router'
import { dateParts, formatRupiah, formatShortDateTime } from '../lib/format'

// Gambar banner event. Jika tidak ada banner, tampilkan gradasi.
export function EventBanner({ event, className = '' }) {
  if (event.banner_url) {
    return (
      <img
        src={event.banner_url}
        alt={event.title}
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-500 via-violet-500 to-fuchsia-500 ${className}`}
    >
      <Ticket className="size-12 text-white/70" />
    </div>
  )
}

export default function EventCard({ event }) {
  const { day, month } = dateParts(event.start_at || event['start-at'])
  const soldOut = event.ticket_types?.every((type) => type.remaining === 0)

  return (
    <Link
      to={`/events/${event.slug}`}
      className="group card overflow-hidden transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200"
    >
      <div className="relative aspect-[2/1] overflow-hidden bg-slate-100">
        <EventBanner event={event} className="transition duration-500 group-hover:scale-105" />

        {/* Badge tanggal */}
        <div className="absolute top-3 left-3 rounded-xl bg-white/95 px-3 py-1.5 text-center shadow-sm backdrop-blur">
          <div className="text-lg leading-none font-bold text-slate-900">{day}</div>
          <div className="text-[10px] font-semibold tracking-wider text-indigo-600">{month}</div>
        </div>

        {soldOut && (
          <span className="absolute top-3 right-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white">
            Habis
          </span>
        )}
      </div>

      <div className="p-5">
        <p className="text-xs font-medium text-indigo-600">
          {formatShortDateTime(event.start_at || event['start-at'])}
        </p>
        <h3 className="mt-1 line-clamp-1 text-lg font-semibold text-slate-900 group-hover:text-indigo-600">
          {event.title}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="size-4 shrink-0" />
          <span className="line-clamp-1">{event.venue}</span>
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-500">Mulai dari</span>
          <span className="font-semibold text-slate-900">
            {event.min_price != null ? formatRupiah(event.min_price) : '-'}
          </span>
        </div>
      </div>
    </Link>
  )
}
