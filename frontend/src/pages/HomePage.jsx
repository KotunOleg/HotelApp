import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { api } from '../api'
import HotelCard from '../components/HotelCard'

export default function HomePage() {
  const [hotels, setHotels]   = useState([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.hotels.list()
      .then(setHotels)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = hotels.filter(h =>
    `${h.name} ${h.city} ${h.country}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Знайдіть ідеальний готель
          </h1>
          <p className="text-brand-100 text-lg mb-10 max-w-xl mx-auto">
            Тисячі готелів по всьому світу. Вибирайте, бронюйте, відпочивайте.
          </p>
          <div className="max-w-lg mx-auto flex items-center bg-white rounded-2xl shadow-xl overflow-hidden">
            <Search size={20} className="ml-4 text-gray-400 shrink-0" />
            <input
              className="flex-1 px-4 py-4 text-gray-800 text-base outline-none"
              placeholder="Місто, назва готелю..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-4 transition-colors">
              Пошук
            </button>
          </div>
        </div>
      </section>

      {/* Hotels grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Всі готелі</h2>
            <p className="text-gray-500 mt-1">{filtered.length} результатів</p>
          </div>
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <SlidersHorizontal size={16} /> Фільтри
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🏨</p>
            <p className="text-gray-500 text-lg">Готелів не знайдено</p>
            <p className="text-gray-400 text-sm mt-1">Спробуйте змінити пошуковий запит</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(h => <HotelCard key={h.hotel_id} hotel={h} />)}
          </div>
        )}
      </section>
    </>
  )
}
