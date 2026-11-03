import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import AuthCard from '../components/AuthCard'
import { Spinner } from '../components/Loading'
import { useAuth } from '../context/AuthContext'
import { getFieldErrors } from '../lib/api'

// Satu input + pesan error di bawahnya
function Field({ label, name, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input ${error ? 'input-error' : ''}`}
      />
      {error && <p className="mt-1.5 text-xs text-rose-600">{error[0]}</p>}
    </div>
  )
}

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      await register(form)
      navigate('/', { replace: true })
    } catch (error) {
      setErrors(getFieldErrors(error)) // error validasi dari Laravel (422)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Buat akun baru"
      subtitle="Daftar gratis dan mulai pesan tiket event favoritmu."
      footer={
        <>
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Nama lengkap"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Budi Santoso"
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="nama@email.com"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Minimal 8 karakter"
        />
        <Field
          label="Ulangi password"
          name="password_confirmation"
          type="password"
          value={form.password_confirmation}
          onChange={handleChange}
          error={errors.password_confirmation}
          placeholder="Ketik ulang password"
        />

        <button type="submit" disabled={submitting} className="btn btn-primary w-full py-3">
          {submitting && <Spinner />} Daftar
        </button>
      </form>
    </AuthCard>
  )
}
