import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import Alert from '../components/Alert'
import AuthCard from '../components/AuthCard'
import { Spinner } from '../components/Loading'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage, getFieldErrors } from '../lib/api'

// Akun hasil seeder, memudahkan demo di kelas
const demoAccounts = [
  { label: 'Admin', email: 'admin@tiket.test' },
  { label: 'Customer', email: 'budi@tiket.test' },
]

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Tujuan setelah login: halaman asal (jika ada), admin ke dashboard
  const from = location.state?.from?.pathname
  const destination = (account) => from || (account.role === 'admin' ? '/admin' : '/')

  // Sudah login? Tidak perlu melihat halaman login lagi
  if (user) return <Navigate to={destination(user)} replace />

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    setMessage('')

    try {
      const loggedIn = await login(form.email, form.password)
      navigate(destination(loggedIn), { replace: true })
    } catch (error) {
      setErrors(getFieldErrors(error))
      setMessage(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Selamat datang kembali"
      subtitle="Masuk untuk membeli dan melihat tiket Anda."
      footer={
        <>
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Daftar sekarang
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && <Alert type="error">{message}</Alert>}

        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder="nama@email.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="input"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary w-full py-3">
          {submitting && <Spinner />} Masuk
        </button>
      </form>

      {/* Akun demo: klik untuk mengisi form otomatis */}
      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <p className="text-xs font-semibold text-slate-500">Akun demo (password: password)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => setForm({ email: account.email, password: 'password' })}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:ring-indigo-300"
            >
              {account.label}: {account.email}
            </button>
          ))}
        </div>
      </div>
    </AuthCard>
  )
}
