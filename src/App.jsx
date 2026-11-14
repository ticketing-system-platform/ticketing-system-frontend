import { Route, Routes } from 'react-router'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/admin/Dashboard'
import EventForm from './pages/admin/EventForm'
import AdminEvents from './pages/admin/Events'
import AdminOrders from './pages/admin/Orders'
import Scanner from './pages/admin/Scanner'
import TicketTypes from './pages/admin/TicketTypes'
import Checkout from './pages/customer/Checkout'
import MyOrders from './pages/customer/MyOrders'
import MyTickets from './pages/customer/MyTickets'
import PaymentStatus from './pages/customer/PaymentStatus'
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
        {/* Publik */}
        <Route path="/" element={<Home />} />
        <Route path="/events/:slug" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Wajib login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:code" element={<PaymentStatus />} />
          <Route path="/my-tickets" element={<MyTickets />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Halaman admin dengan Sidebar, wajib role admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="events/new" element={<EventForm />} />
          <Route path="events/:id/edit" element={<EventForm />} />
          <Route path="ticket-types" element={<TicketTypes />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="scanner" element={<Scanner />} />
        </Route>
      </Route>
    </Routes>
  )
}
