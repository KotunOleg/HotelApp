import { Link, useLocation } from 'react-router-dom'
import { Hotel, LayoutDashboard, LogIn, UserPlus, CalendarDays } from 'lucide-react'

const links = [
  { to: '/',         label: 'Готелі',      icon: Hotel },
  { to: '/bookings', label: 'Бронювання',  icon: CalendarDays },
  { to: '/admin',    label: 'Адмін',       icon: LayoutDashboard },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brand-700">
          <span className="bg-brand-600 text-white p-1.5 rounded-lg">
            <Hotel size={20} />
          </span>
          HotelApp
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === to
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}

          <div className="ml-3 flex items-center gap-2">
            <Link to="/login" className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-3">
              <LogIn size={15} /> Увійти
            </Link>
            <Link to="/register" className="btn-primary flex items-center gap-1.5 text-sm py-2 px-3">
              <UserPlus size={15} /> Реєстрація
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
