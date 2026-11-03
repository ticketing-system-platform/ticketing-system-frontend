import { Search, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import EventCard from '../components/EventCard'
import PageLoader from '../components/Loading'
import api, { getErrorMessage } from '../lib/api'

export default function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let ignore = false

    const params = query ? { search: query } : {}

    api
      .get('/events', { params })
      .then((res) => {
        if (!ignore) {
          setEvents(res.data.data || [])
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
  }, [query])

  function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    setQuery(search.trim())
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Hero Section */}
      <section className="mb-10 rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-800 to-purple-900 px-6 py-12 text-white shadow-xl sm:px-12 sm:py-16">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="size-3.5 text-amber-300" />
            Jelajahi Event Seru
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Temukan & Pesan Tiket Event Favoritmu
          </h1>
          <p className="mt-3 text-sm text-indigo-100 sm:text-base">
            Mulai dari konser musik, festival, seminar teknologi, hingga workshop interaktif.
            Dapatkan tiket resmi dengan pembayaran mudah dan aman.
          </p>

          {/* Form Pencarian */}
          <form onSubmit={handleSearch} className="mt-6 flex max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul event atau lokasi..."
                className="input pl-10 text-slate-900 bg-white"
              />
            </div>
            <button type="submit" className="btn btn-primary shrink-0">
              Cari
            </button>
          </form>
        </div>
      </section>

      {/* Daftar Event */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {query ? `Hasil Pencarian: "${query}"` : 'Event Mendatang'}
            </h2>
            <p className="text-sm text-slate-500">Pilih event yang ingin kamu ikuti</p>
          </div>
          {query && (
            <button
              onClick={() => {
                setSearch('')
                setLoading(true)
                setQuery('')
              }}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Reset Pencarian
            </button>
          )}
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <PageLoader text="Memuat daftar event..." />
        ) : events.length === 0 ? (
          <EmptyState
            title="Tidak ada event ditemukan"
            description={
              query
                ? `Tidak ada event yang cocok dengan kata kunci "${query}".`
                : 'Saat ini belum ada event yang tersedia.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
