import { ArrowLeft, ImagePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Alert from '../../components/Alert'
import PageLoader, { Spinner } from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import api, { getErrorMessage, getFieldErrors } from '../../lib/api'
import { toDateTimeLocal } from '../../lib/format'

// Pesan error di bawah input
function FieldError({ error }) {
  return error ? <p className="mt-1.5 text-xs text-rose-600">{error[0]}</p> : null
}

export default function EventForm() {
  const { id } = useParams() // ada id = mode edit, tidak ada = mode tambah
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    venue: '',
    start_at: '',
    status: 'draft',
    description: '',
  })
  const [bannerFile, setBannerFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  // Mode edit: isi form dengan data event yang sudah ada
  useEffect(() => {
    if (!isEdit) return
    // Abaikan respons yang datang terlambat (mis. effect dijalankan dua kali oleh
    // StrictMode, atau pindah ke event lain). Tanpa ini, respons lama bisa menimpa
    // isian form yang sudah diubah admin.
    let active = true

    api
      .get(`/admin/events/${id}`)
      .then((res) => {
        if (!active) return
        const event = res.data.data
        setForm({
          title: event.title,
          venue: event.venue,
          start_at: toDateTimeLocal(event.start_at),
          status: event.status,
          description: event.description,
        })
        setPreview(event.banner_url)
      })
      .finally(() => active && setLoading(false))

    return () => {
      active = false // cleanup: respons dari request ini tidak dipakai lagi
    }
  }, [id, isEdit])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setBannerFile(file)
    setPreview(URL.createObjectURL(file)) // pratinjau gambar sebelum di-upload
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setMessage('')

    // Upload file wajib memakai FormData (multipart/form-data), bukan JSON
    const data = new FormData()
    Object.entries(form).forEach(([key, value]) => data.append(key, value))
    if (bannerFile) data.append('banner', bannerFile)

    try {
      if (isEdit) {
        // PHP tidak bisa membaca file dari request PUT,
        // jadi kirim POST + _method=PUT (method spoofing Laravel)
        data.append('_method', 'PUT')
        await api.post(`/admin/events/${id}`, data)
        navigate('/admin/events')
      } else {
        const res = await api.post('/admin/events', data)
        // Event baru belum punya tiket: langsung arahkan ke halaman jenis tiket
        navigate(`/admin/ticket-types?event_id=${res.data.data.id}`)
      }
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      setErrors(fieldErrors)
      // Pesan umum hanya ditampilkan jika bukan error validasi per field
      if (Object.keys(fieldErrors).length === 0) setMessage(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <>
      <Link
        to="/admin/events"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="size-4" /> Kembali ke daftar event
      </Link>

      <PageHeader
        title={isEdit ? 'Ubah Event' : 'Tambah Event'}
        description="Event berstatus Draft tidak tampil di halaman publik."
      />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="card space-y-5 p-6 lg:col-span-2">
          {message && <Alert type="error">{message}</Alert>}

          <div>
            <label htmlFor="title" className="label">
              Judul event
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              className={`input ${errors.title ? 'input-error' : ''}`}
              placeholder="Contoh: Jakarta Music Festival 2026"
            />
            <FieldError error={errors.title} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="venue" className="label">
                Lokasi
              </label>
              <input
                id="venue"
                name="venue"
                value={form.venue}
                onChange={handleChange}
                className={`input ${errors.venue ? 'input-error' : ''}`}
                placeholder="Nama gedung, kota"
              />
              <FieldError error={errors.venue} />
            </div>
            <div>
              <label htmlFor="start_at" className="label">
                Waktu mulai
              </label>
              <input
                id="start_at"
                name="start_at"
                type="datetime-local"
                value={form.start_at}
                onChange={handleChange}
                className={`input ${errors.start_at ? 'input-error' : ''}`}
              />
              <FieldError error={errors.start_at} />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="label">
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              value={form.description}
              onChange={handleChange}
              className={`input ${errors.description ? 'input-error' : ''}`}
              placeholder="Ceritakan tentang event ini..."
            />
            <FieldError error={errors.description} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <label className="label">Banner</label>
            {/* Label membungkus input file agar area gambar bisa diklik */}
            <label className="group relative flex aspect-[2/1] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400">
              {preview ? (
                <img src={preview} alt="Pratinjau banner" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-slate-500">
                  <ImagePlus className="mx-auto size-8" />
                  <p className="mt-1 text-xs">Klik untuk memilih gambar</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
            <p className="mt-2 text-xs text-slate-500">JPG/PNG, maksimal 2 MB.</p>
            <FieldError error={errors.banner} />
          </div>

          <div className="card p-6">
            <label htmlFor="status" className="label">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="input"
            >
              <option value="draft">Draft (disembunyikan)</option>
              <option value="published">Tayang (tampil di publik)</option>
            </select>

            <button type="submit" disabled={saving} className="btn btn-primary mt-6 w-full py-3">
              {saving && <Spinner />}
              {isEdit ? 'Simpan Perubahan' : 'Simpan & Atur Tiket'}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
