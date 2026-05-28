import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import HotelPage from './pages/HotelPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"            element={<HomePage />} />
            <Route path="/hotels/:id"  element={<HotelPage />} />
            <Route path="/login"       element={<LoginPage />} />
            <Route path="/register"    element={<RegisterPage />} />
            <Route path="/admin"       element={<AdminPage />} />
          </Routes>
        </main>
        <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm mt-16">
          © 2026 HotelApp — всі права захищено
        </footer>
      </div>
    </BrowserRouter>
  )
}
