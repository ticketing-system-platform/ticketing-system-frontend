import { Compass } from 'lucide-react'
import { Link } from 'react-router'
import EmptyState from '../components/EmptyState'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <EmptyState
        icon={Compass}
        title="Halaman tidak ditemukan"
        description="Alamat yang Anda buka tidak tersedia."
        action={
          <Link to="/" className="btn btn-primary">
            Kembali ke Beranda
          </Link>
        }
      />
    </div>
  )
}
