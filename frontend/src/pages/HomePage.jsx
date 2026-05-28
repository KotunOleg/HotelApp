import { useState, useEffect, useMemo } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { api } from '../api'
import HotelCard from '../components/HotelCard'

const SORT_OPTIONS = [
  { value: 'default',    label: 'За замовчуванням' },
  { value: 'stars_desc', label: 'Зірки: від більшого' },
  { value: 'stars_asc',  label: 'Зірки: від меншого' },
  { value: 'name_asc',   label: 'Назва: А → Я' },
  { value: 'name_desc',  label: 'Назва: Я → А' },
]

export default function HomePage() {
  const [hotels, setHotels]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const [search,    setSearch]    = useState('')
  const [stars,     setStars]     = useState([])
  const [city,      setCity]      = useState('')
  const [country,   setCountry]   = useState('')
  const [sortBy,    setSortBy]    = useState('default')

  useEffect(() => {
    api.hotels.list()
      .then(setHotels)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const cities    = useMemo(() => [...new Set(hotels.map(h => h.city))].sort(),    [hotels])
  const countries = useMemo(() => [...new Set(hotels.map(h => h.country))].sort(), [hotels])

  const activeCount = [
    stars.length > 0,
    city !== '',
    country !== '',
  ].filter(Boolean).length

  function toggleStar(n) {
    setStars(prev => prev.includes(n) ? prev.filter(s => s !== n) : [...prev, n])
  }

  function resetFilters() {
    setStars([]); setCity(''); setCountry(''); setSortBy('default')
  }

  const filtered = useMemo(() => {
    let list = hotels.filter(h => {
      const matchSearch  = `${h.name} ${h.city} ${h.country}`.toLowerCase().includes(search.toLowerCase())
      const matchStars   = stars.length === 0 || stars.includes(h.star_rating)
      const matchCity    = city === ''    || h.city === city
      const matchCountry = country === '' || h.country === country
      return matchSearch && matchStars && matchCity && matchCountry
    })

    switch (sortBy) {
      case 'stars_desc': return [...list].sort((a, b) => b.star_rating - a.star_rating)
      case 'stars_asc':  return [...list].sort((a, b) => a.star_rating - b.star_rating)
      case 'name_asc':   return [...list].sort((a, b) => a.name.localeCompare(b.name))
      case 'name_desc':  return [...list].sort((a, b) => b.name.localeCompare(a.name))
      default:           return list
    }
  }, [hotels, search, stars, city, country, sortBy])

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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Всі готелі</h2>
            <p className="text-gray-500 mt-1 text-sm">{filtered.length} результатів</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none btn-secondary text-sm pr-8 cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`btn-secondary flex items-center gap-2 text-sm ${showFilters ? 'ring-2 ring-brand-400' : ''}`}
            >
              <SlidersHorizontal size={16} />
              Фільтри
              {activeCount > 0 && (
                <span className="bg-brand-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6">
            <div className="flex flex-wrap gap-6">

              {/* Stars */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Зірки</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => toggleStar(n)}
                      className={`w-9 h-9 rounded-lg border text-sm font-semibold transition-all ${
                        stars.includes(n)
                          ? 'bg-amber-400 border-amber-400 text-white shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-500'
                      }`}
                    >
                      {n}★
                    </button>
                  ))}
                </div>
              </div>

              {/* City */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Місто</p>
                <div className="relative">
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="appearance-none input text-sm w-44 pr-8"
                  >
                    <option value="">Всі міста</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Country */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Країна</p>
                <div className="relative">
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="appearance-none input text-sm w-44 pr-8"
                  >
                    <option value="">Всі країни</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Reset */}
              {activeCount > 0 && (
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={15} /> Скинути фільтри
                  </button>
                </div>
              )}
            </div>

            {/* Active filter chips */}
            {activeCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {stars.map(n => (
                  <span key={n} className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-3 py-1 rounded-full border border-amber-200">
                    {n}★
                    <button onClick={() => toggleStar(n)} className="hover:text-amber-900"><X size={11} /></button>
                  </span>
                ))}
                {city && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200">
                    {city}
                    <button onClick={() => setCity('')} className="hover:text-blue-900"><X size={11} /></button>
                  </span>
                )}
                {country && (
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full border border-green-200">
                    {country}
                    <button onClick={() => setCountry('')} className="hover:text-green-900"><X size={11} /></button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Grid */}
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
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 text-lg">Нічого не знайдено</p>
            <p className="text-gray-400 text-sm mt-1">Спробуйте змінити фільтри або пошуковий запит</p>
            {activeCount > 0 && (
              <button onClick={resetFilters} className="btn-secondary mt-4 text-sm mx-auto">
                Скинути фільтри
              </button>
            )}
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
