import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, BedDouble, MapPin, XCircle } from 'lucide-react'
import { api } from '../api'

const STATUS_CONFIG = {
  pending:   { label: 'Очікує',    cls: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Підтверджено', cls: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Скасовано', cls: 'bg-red-100 text-red-600' },
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' })
}

function nights(checkIn, checkOut) {
  return Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')

  const load = () => {
    setLoading(true)
    api.bookings.list()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function cancel(id) {
    if (!confirm('Скасувати бронювання?')) return
    try {
      await api.bookings.cancel(id)
      load()
    } catch (err) { alert(err.message) }
  }

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter)

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Мої бронювання</h1>
        <p className="text-gray-500 mt-1 text-sm">{bookings.length} загалом</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {[
          { id: 'all',       label: 'Всі',          count: bookings.length },
          { id: 'pending',   label: 'Очікують',     count: counts.pending   ?? 0 },
          { id: 'confirmed', label: 'Підтверджені', count: counts.confirmed ?? 0 },
          { id: 'cancelled', label: 'Скасовані',    count: counts.cancelled ?? 0 },
        ].map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === t.id ? 'bg-white shadow text-brand-700' : 'text-gray-500 hover:text-gray-800'
            }`}>
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === t.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <CalendarDays size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 text-lg font-medium">Бронювань немає</p>
          <p className="text-gray-400 text-sm mt-1">Знайдіть готель і забронюйте кімнату</p>
          <Link to="/" className="btn-primary mt-6 inline-block text-sm">Переглянути готелі</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => {
            const n   = nights(b.check_in_date, b.check_out_date)
            const cfg = STATUS_CONFIG[b.status] ?? { label: b.status, cls: 'bg-gray-100 text-gray-600' }
            return (
              <div key={b.booking_id} className="card p-5 flex flex-col sm:flex-row gap-4">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <BedDouble size={24} className="text-brand-500" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Бронювання #{b.booking_id}
                      </p>
                      {b.room && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={13} />
                          Кімната {b.room.room_number} · {b.room.room_type}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-brand-400" />
                      {formatDate(b.check_in_date)} → {formatDate(b.check_out_date)}
                    </span>
                    <span className="text-gray-400">{n} {n === 1 ? 'ніч' : n < 5 ? 'ночі' : 'ночей'}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <p className="font-bold text-gray-900 text-lg">
                      {b.total_price?.toLocaleString()} ₴
                    </p>
                    {b.status !== 'cancelled' && (
                      <button
                        onClick={() => cancel(b.booking_id)}
                        className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                      >
                        <XCircle size={15} /> Скасувати
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
