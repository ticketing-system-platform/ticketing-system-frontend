import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // loading = true selama kita mengecek token yang tersimpan ke /api/me
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')))

  // Saat aplikasi pertama dibuka: jika ada token, ambil data user
  useEffect(() => {
    if (!localStorage.getItem('token')) return

    api
      .get('/me')
      .then((res) => setUser(res.data.data))
      .catch(() => localStorage.removeItem('token')) // token sudah tidak valid
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const res = await api.post('/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.data)
    return res.data.data
  }

  async function register(form) {
    const res = await api.post('/register', form)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.data)
    return res.data.data
  }

  async function logout() {
    try {
      await api.post('/logout')
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  // React 19: context bisa langsung dipakai sebagai provider
  // (versi lama: <AuthContext.Provider value={...}>)
  return <AuthContext value={{ user, loading, login, register, logout }}>{children}</AuthContext>
}

// Hook agar komponen cukup menulis: const { user } = useAuth()
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
