import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import Alert from '../components/Alert'
import AuthCard from '../components/AuthCard'
import { Spinner } from '../components/Loading'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../lib/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Masuk ke Akun"
      subtitle="Masukkan email dan password Anda untuk melanjutkan"
      footer={
        <span>
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Daftar sekarang
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="nama@email.com"
            className="input"
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="input"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary w-full mt-2">
          {submitting ? (
            <>
              <Spinner /> Memproses...
            </>
          ) : (
            'Masuk'
          )}
        </button>
      </form>
    </AuthCard>
  )
}
