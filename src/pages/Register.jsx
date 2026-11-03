import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Alert from '../components/Alert'
import AuthCard from '../components/AuthCard'
import { Spinner } from '../components/Loading'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage, getFieldErrors } from '../lib/api'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setGeneralError(null)
    setErrors({})
    setSubmitting(true)

    try {
      await register(form)
      navigate('/', { replace: true })
    } catch (err) {
      setGeneralError(getErrorMessage(err))
      setErrors(getFieldErrors(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Buat Akun Baru"
      subtitle="Daftar untuk mulai memesan tiket event favorit Anda"
      footer={
        <span>
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Masuk ke akun
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {generalError && <Alert type="error">{generalError}</Alert>}

        <div>
          <label className="label" htmlFor="name">
            Nama Lengkap
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Nama Anda"
            className={`input ${errors.name ? 'input-error' : ''}`}
          />
          {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name[0]}</p>}
        </div>

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
            className={`input ${errors.email ? 'input-error' : ''}`}
          />
          {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email[0]}</p>}
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
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimal 8 karakter"
            className={`input ${errors.password ? 'input-error' : ''}`}
          />
          {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password[0]}</p>}
        </div>

        <div>
          <label className="label" htmlFor="password_confirmation">
            Konfirmasi Password
          </label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            required
            autoComplete="new-password"
            value={form.password_confirmation}
            onChange={handleChange}
            placeholder="Ulangi password"
            className="input"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary w-full mt-2">
          {submitting ? (
            <>
              <Spinner /> Mendaftar...
            </>
          ) : (
            'Daftar'
          )}
        </button>
      </form>
    </AuthCard>
  )
}
