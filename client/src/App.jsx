import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AuthProvider from './context/AuthContext.jsx'
import BookingDetailPage from './pages/BookingDetailPage.jsx'
import BookingPage from './pages/BookingPage.jsx'
import HomePage from './pages/HomePage.jsx'
import JoinGroupPage from './pages/JoinGroupPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MyBookingsPage from './pages/MyBookingsPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import SpaceDetailPage from './pages/SpaceDetailPage.jsx'

function NotFound() {
  return (
    <section className="empty-state">
      <h1>ไม่พบหน้านี้</h1>
      <Link className="text-link" to="/">กลับหน้าหลัก</Link>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="spaces/:id" element={<SpaceDetailPage />} />
              <Route path="spaces/:id/book" element={<BookingPage />} />
              <Route path="bookings" element={<MyBookingsPage />} />
              <Route path="bookings/:id" element={<BookingDetailPage />} />
              <Route path="join/:token" element={<JoinGroupPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
