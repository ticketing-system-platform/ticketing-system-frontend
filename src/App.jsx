import { Navigate, Route, Routes } from 'react-router'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import MainLayout from './layouts/MainLayout'
import EventForm from './pages/admin/EventForm'
import AdminEvents from './pages/admin/Events'
import TicketTypes from './pages/admin/TicketTypes'
import EventDetail from './pages/EventDetail'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Register from './pages/Register'

export default function App() {
  return (
    <Routes>
      {/* Halaman dengan Navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events/:slug" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Rute Admin (wajib login sebagai admin) */}
      <Route path="/admin" element={<ProtectedRoute role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="events" replace />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="events/new" element={<EventForm />} />
          <Route path="events/:id/edit" element={<EventForm />} />
          <Route path="ticket-types" element={<TicketTypes />} />
        </Route>
      </Route>
    </Routes>
  )
}
