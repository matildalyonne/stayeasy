import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Student pages
import HomePage from './pages/student/HomePage'
import HostelListPage from './pages/student/HostelListPage'
import HostelDetailPage from './pages/student/HostelDetailPage'
import BookingPage from './pages/student/BookingPage'
import MyBookingsPage from './pages/student/MyBookingsPage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminHostels from './pages/admin/AdminHostels'
import AdminHostelForm from './pages/admin/AdminHostelForm'
import AdminBookings from './pages/admin/AdminBookings'

// Auth pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Common
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminRoute from './components/common/AdminRoute'
import StudentLayout from './components/common/StudentLayout'
import AdminLayout from './components/common/AdminLayout'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student (public + protected) */}
          <Route element={<StudentLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/hostels" element={<HostelListPage />} />
            <Route path="/hostels/:id" element={<HostelDetailPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/book/:id" element={<BookingPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/hostels" element={<AdminHostels />} />
              <Route path="/admin/hostels/new" element={<AdminHostelForm />} />
              <Route path="/admin/hostels/:id/edit" element={<AdminHostelForm />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
