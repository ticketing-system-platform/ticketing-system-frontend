import { Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import Alert from '../../components/Alert'
import EmptyState from '../../components/EmptyState'
import { Spinner } from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import api, { getErrorMessage, getFieldErrors } from '../../lib/api'
import { formatRupiah } from '../../lib/format'

const emptyForm = { name: '', price: '', quota: '' }

export default function TicketTypes() {
  const [events, setEvents] = useState([])
  const [ticketTypes, setTicketTypes] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null) // jenis tiket yang sedang diubah
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState({ type: 'success', text: '' })
  const [saving, setSaving] = useState(false)

  // Event yang dipilih disimpan di URL: /admin/ticket-types?event_id=1
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('event_id') || String(events[0]?.id ?? '')

  // Daftar event untuk dropdown
  useEffect(() => {
    api.get('/admin/events').then((res) => setEvents(res.data.data))
  }, [])

  function loadTicketTypes(eventId) {
    api
      .get('/admin/ticket-types', { params: { event_id: eventId } })
      .then((res) => setTicketTypes(res.data.data))
  }

  // Muat ulang jenis tiket setiap kali event yang dipilih berubah
  useEffect(() => {
    if (selectedId) loadTicketTypes(selectedId)
  }, [selectedId])

  function resetForm() {
    setForm(emptyForm)
    setEditing(null)
    setErrors({})
  }

  function handleSelectEvent(e) {
    setSearchParams({ event_id: e.target.value })
    resetForm()
    setMessage({ type: 'success', text: '' })
  }

  function handleEdit(ticketType) {
    setEditing(ticketType)
    setForm({ name: ticketType.name, price: ticketType.price, quota: ticketType.quota })
    setErrors({})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    try {
      if (editing) {
        await api.put(`/admin/ticket-types/${editing.id}`, form)
        setMessage({ type: 'success', text: 'Jenis tiket berhasil diubah.' })
      } else {
        await api.post('/admin/ticket-types', { ...form, event_id: selectedId })
        setMessage({ type: 'success', text: 'Jenis tiket berhasil ditambahkan.' })
      }
      resetForm()
      loadTicketTypes(selectedId)
    } catch (error) {
      setErrors(getFieldErrors(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(ticketType) {
    if (!confirm(`Hapus jenis tiket "${ticketType.name}"?`)) return

    try {
      const res = await api.delete(`/admin/ticket-types/${ticketType.id}`)
      setMessage({ type: 'success', text: res.data.message })
      loadTicketTypes(selectedId)
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error) })
    }
  }

  return (
    <>
      <PageHeader
        title="Jenis Tiket"
        description="Atur kategori tiket, harga, dan kuota untuk setiap event."
      />

      <div className="card mb-6 p-5">
        <label htmlFor="event" className="label">
          Pilih event
        </label>
        <select
          id="event"
          value={selectedId}
          onChange={handleSelectEvent}
          className="input max-w-lg"
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} {event.status === 'draft' ? '(Draft)' : ''}
            </option>
          ))}
        </select>
      </div>

      {message.text && (
        <div className="mb-4">
          <Alert type={message.type}>{message.text}</Alert>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form tambah / ubah */}
        <form onSubmit={handleSubmit} className="card h-fit space-y-4 p-5">
          <h2 className="font-semibold text-slate-900">
            {editing ? `Ubah "${editing.name}"` : 'Tambah jenis tiket'}
          </h2>

          <div>
            <label htmlFor="name" className="label">
              Nama
            </label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`input ${errors.name ? 'input-error' : ''}`}
              placeholder="Reguler, VIP, Early Bird..."
            />
            {errors.name && <p className="mt-1.5 text-xs text-rose-600">{errors.name[0]}</p>}
          </div>

          <div>
            <label htmlFor="price" className="label">
              Harga (Rp)
            </label>
            <input
              id="price"
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={`input ${errors.price ? 'input-error' : ''}`}
              placeholder="150000"
            />
            {errors.price && <p className="mt-1.5 text-xs text-rose-600">{errors.price[0]}</p>}
          </div>

          <div>
            <label htmlFor="quota" className="label">
              Kuota
            </label>
            <input
              id="quota"
              type="number"
              min="1"
              value={form.quota}
              onChange={(e) => setForm({ ...form, quota: e.target.value })}
              className={`input ${errors.quota ? 'input-error' : ''}`}
              placeholder="100"
            />
            {errors.quota && <p className="mt-1.5 text-xs text-rose-600">{errors.quota[0]}</p>}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving || !selectedId}
              className="btn btn-primary flex-1"
            >
              {saving ? <Spinner /> : <Plus className="size-4" />}
              {editing ? 'Simpan' : 'Tambah'}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Batal
              </button>
            )}
          </div>
        </form>

        {/* Tabel jenis tiket */}
        <div className="lg:col-span-2">
          {ticketTypes.length === 0 ? (
            <EmptyState
              icon={Tags}
              title="Belum ada jenis tiket"
              description="Tambahkan jenis tiket agar event bisa dibeli."
            />
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Nama</th>
                    <th className="px-5 py-3 text-right">Harga</th>
                    <th className="px-5 py-3 text-right">Kuota</th>
                    <th className="px-5 py-3 text-right">Terjual</th>
                    <th className="px-5 py-3 text-right">Sisa</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {ticketTypes.map((type) => (
                    <tr
                      key={type.id}
                      className={
                        editing?.id === type.id ? 'bg-indigo-50/60' : 'hover:bg-slate-50/60'
                      }
                    >
                      <td className="px-5 py-3 font-medium text-slate-900">{type.name}</td>
                      <td className="px-5 py-3 text-right text-slate-600">
                        {formatRupiah(type.price)}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-600">{type.quota}</td>
                      <td className="px-5 py-3 text-right text-slate-600">{type.sold}</td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-900">
                        {type.remaining}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEdit(type)}
                            className="btn btn-ghost px-2.5 py-2"
                            title="Ubah"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(type)}
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
        </div>
      </div>
    </>
  )
}
