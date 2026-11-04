import { CalendarDays, Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Alert from '../../components/Alert'
import EmptyState from '../../components/EmptyState'
import { EventBanner } from '../../components/EventCard'
import PageLoader from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import api, { getErrorMessage } from '../../lib/api'
import { formatShortDateTime } from '../../lib/format'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: 'success', text: '' })

  function loadEvents() {
    return api
      .get('/admin/events')
      .then((res) => setEvents(res.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadEvents()
  }, [])

  async function handleDelete(event) {
    if (!confirm(`Hapus event "${event.title}"?`)) return

    try {
      const res = await api.delete(`/admin/events/${event.id}`)
      setMessage({ type: 'success', text: res.data.message })
      loadEvents()
    } catch (error) {
      // mis. event sudah punya transaksi -> 422
      setMessage({ type: 'error', text: getErrorMessage(error) })
    }
  }

  if (loading) return <PageLoader />

  return (
    <>
      <PageHeader
        title="Kelola Event"
        description="Tambah, ubah, dan atur status tayang event."
        action={
          <Link to="/admin/events/new" className="btn btn-primary">
            <Plus className="size-4" /> Tambah Event
          </Link>
        }
      />

      {message.text && (
        <div className="mb-4">
          <Alert type={message.type}>{message.text}</Alert>
        </div>
      )}

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Belum ada event"
          description="Mulai dengan menambahkan event pertama."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Terjual</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <EventBanner event={event} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{event.title}</p>
                        <p className="truncate text-xs text-slate-500">{event.venue}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-slate-600">
                    {formatShortDateTime(event.start_at)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap text-slate-600 tabular-nums">
                    {event.tickets_sold} / {event.tickets_quota}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/admin/ticket-types?event_id=${event.id}`}
                        className="btn btn-ghost px-2.5 py-2"
                        title="Jenis tiket"
                      >
                        <Tags className="size-4" />
                      </Link>
                      <Link
                        to={`/admin/events/${event.id}/edit`}
                        className="btn btn-ghost px-2.5 py-2"
                        title="Ubah"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(event)}
                        className="btn btn-ghost px-2.5 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        title="Hapus"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
