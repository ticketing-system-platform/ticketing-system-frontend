import { CalendarDays, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import EventCard from '../components/EventCard'
import api from '../lib/api'

export default function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Kata kunci disimpan di URL (?search=musik) supaya bisa dibagikan/di-refresh
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const [keyword, setKeyword] = useState(search)

  // Ambil data setiap kali kata kunci di URL berubah
  useEffect(() => {
    api
      .get('/events', { params: { search } })
      .then((res) => {
        setEvents(res.data.data)
        setError('')
      })
      .catch(() => setError('Gagal memuat event. Pastikan server Laravel sudah berjalan.'))
      .finally(() => setLoading(false))
  }, [search])

  function handleSearch(e) {
    e.preventDefault()
    if (keyword === search) return
    setLoading(true)
    setSearchParams(keyword ? { search: keyword } : {})
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-700">
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-sky-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100 ring-1 ring-white/20">
            <CalendarDays className="size-3.5" /> Konser · Seminar · Workshop
          </span>
          <h1 className="mt-5 max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Temukan event seru, pesan tiketnya dalam hitungan detik.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-indigo-100">
            Bayar dengan transfer bank, e-wallet, atau QRIS. Tiket QR langsung terbit setelah
            pembayaran berhasil.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8 flex max-w-xl gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-indigo-900/20"
          >
            <div className="flex flex-1 items-center gap-2 pl-3">
              <Search className="size-5 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Cari nama event atau kota..."
                className="w-full bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Cari
            </button>
          </form>
        </div>
      </section>

      {/* Daftar event */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {search ? `Hasil pencarian "${search}"` : 'Event Mendatang'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? 'Memuat...' : `${events.length} event tersedia`}
            </p>
          </div>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              // Skeleton: kotak abu-abu berkedip selama data dimuat
              <div key={i} className="card animate-pulse overflow-hidden">
                <div className="aspect-[2/1] bg-slate-200" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 rounded bg-slate-200" />
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 && !error ? (
          <EmptyState
            icon={CalendarDays}
            title="Event tidak ditemukan"
            description="Coba kata kunci lain atau kembali lagi nanti."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
