import axios from 'axios'

// Satu instance axios untuk semua request ke Laravel
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:8000/api
  headers: { Accept: 'application/json' },
})

// Interceptor: otomatis menyisipkan token Sanctum di setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Ambil pesan error dari response Laravel ({ message: '...' })
export function getErrorMessage(error) {
  return error.response?.data?.message || 'Terjadi kesalahan, silakan coba lagi.'
}

// Ambil error validasi per field ({ errors: { email: ['...'] } })
export function getFieldErrors(error) {
  return error.response?.data?.errors || {}
}

export default api
