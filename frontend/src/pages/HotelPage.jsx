import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Phone, ArrowLeft, BedDouble, Users, Send, X, CalendarDays, CalendarX, LogIn } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/StarRating'

const TYPE_UA = { standard: 'стандарт', deluxe: 'делюкс', suite: 'люкс' }
const BED_UA  = { single: 'односпальне', double: 'двоспальне', queen: 'queen', king: 'king', sofa: 'диван-ліжко' }
const TODAY   = new Date().toISOString().split('T')[0]

function bedsLabel(beds) {
  if (!beds?.length) return null
  const counts = beds.reduce((acc, b) => {
    const label = BED_UA[b.bed_type] ?? b.bed_type
    acc[label] = (acc[label] ?? 0) + 1
    return acc
  }, {})
  return Object.entries(counts).map(([type, n]) => `${n}× ${type}`).join(' • ')
}

function roomLabel(room) {
  return `${room.capacity}-місний ${TYPE_UA[room.room_type] ?? room.room_type}`
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' })
}

// checks if room has a booking conflicting with [checkIn, checkOut]
function hasConflict(room, checkIn, checkOut) {
  if (!checkIn || !checkOut || !room.bookings?.length) return false
  const ci = new Date(checkIn), co = new Date(checkOut)
  return room.bookings.some(b => new Date(b.check_in_date) < co && new Date(b.check_out_date) > ci)
}

// ── Occupied date ranges strip ───────────────────────────────────────────────
function OccupiedDates({ bookings }) {
  if (!bookings?.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {bookings.map(b => (
        <span
          key={b.booking_id}
          className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full"
          title="зайнято"
        >
          <CalendarX size={10} />
          {fmtDate(b.check_in_date)} – {fmtDate(b.check_out_date)}
        </span>
      ))}
    </div>
  )
}

// ── Room card ────────────────────────────────────────────────────────────────
function RoomCard({ room, selectedDates, onBook }) {
  const { checkIn, checkOut } = selectedDates
  const conflict = hasConflict(room, checkIn, checkOut)
  const datesSelected = checkIn && checkOut

  const typeColor = {
    standard: 'bg-blue-50 text-blue-700',
    deluxe:   'bg-purple-50 text-purple-700',
    suite:    'bg-amber-50 text-amber-700',
  }[room.room_type] ?? 'bg-gray-50 text-gray-700'

  let btnLabel = 'Забронювати'
  let btnClass = 'btn-primary text-sm whitespace-nowrap'
  let btnDisabled = false

  if (room.status !== 'available') {
    btnLabel = 'Зайнята'; btnDisabled = true
  } else if (!datesSelected) {
    btnLabel = 'Оберіть дати'; btnDisabled = true; btnClass += ' opacity-60 cursor-not-allowed'
  } else if (conflict) {
    btnLabel = 'Недоступна'; btnDisabled = true; btnClass = 'bg-red-100 text-red-600 font-medium px-5 py-2.5 rounded-xl text-sm whitespace-nowrap cursor-not-allowed'
  }

  return (
    <div className={`card p-5 flex flex-col sm:flex-row gap-4 ${conflict ? 'opacity-60' : ''}`}>
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900">{roomLabel(room)}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor}`}>
            {TYPE_UA[room.room_type] ?? room.room_type}
          </span>
          {datesSelected && !conflict && room.status === 'available' && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              Вільна на обрані дати
            </span>
          )}
          {conflict && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              Зайнята на обрані дати
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Users size={14} /> {room.capacity} осіб</span>
          <span className="flex items-center gap-1"><BedDouble size={14} /> Поверх {room.floor}</span>
        </div>

        {bedsLabel(room.beds) && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <BedDouble size={12} /> {bedsLabel(room.beds)}
          </p>
        )}

        <OccupiedDates bookings={room.bookings} />
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{room.price_per_night.toLocaleString()} ₴</p>
          <p className="text-xs text-gray-400">за ніч</p>
        </div>
        <button onClick={() => !btnDisabled && onBook(room)} disabled={btnDisabled} className={btnClass} title={!datesSelected ? 'Оберіть дати заїзду та виїзду' : undefined}>
          {btnLabel}
        </button>
      </div>
    </div>
  )
}

// ── Booking modal ────────────────────────────────────────────────────────────
function BookingModal({ room, prefillDates, userId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    checkIn:  prefillDates?.checkIn  ?? '',
    checkOut: prefillDates?.checkOut ?? '',
    guests: 1,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, (new Date(form.checkOut) - new Date(form.checkIn)) / 86400000)
    : 0

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.bookings.create({
        user_id:        userId,
        room_id:        room.room_id,
        check_in_date:  new Date(form.checkIn).toISOString(),
        check_out_date: new Date(form.checkOut).toISOString(),
        total_price:    nights * room.price_per_night,
      })
      setSuccess(true)
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold">Бронювання — {roomLabel(room)}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <p className="text-5xl mb-3">🎉</p>
            <p className="text-xl font-bold text-gray-900 mb-1">Заброньовано!</p>
            <p className="text-gray-500 text-sm mb-6">Очікуйте підтвердження від адміністратора.</p>
            <button onClick={onClose} className="btn-primary">Закрити</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Заїзд</label>
                <input type="date" className="input" required min={TODAY}
                  value={form.checkIn}
                  onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} />
              </div>
              <div>
                <label className="label">Виїзд</label>
                <input type="date" className="input" required
                  min={form.checkIn || TODAY}
                  value={form.checkOut}
                  onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Кількість гостей</label>
              <input type="number" className="input" min={1} max={room.capacity}
                value={form.guests}
                onChange={e => setForm(f => ({ ...f, guests: +e.target.value }))} />
            </div>

            {nights > 0 && (
              <div className="bg-brand-50 rounded-xl p-4 space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{room.price_per_night.toLocaleString()} ₴ × {nights} ночей</span>
                  <span>{(room.price_per_night * nights).toLocaleString()} ₴</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-brand-100">
                  <span>Разом</span>
                  <span>{(room.price_per_night * nights).toLocaleString()} ₴</span>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading || nights === 0} className="btn-primary w-full">
              {loading ? 'Обробка...' : 'Підтвердити бронювання'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function HotelPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hotel, setHotel]         = useState(null)
  const [rooms, setRooms]         = useState([])
  const [reviews, setReviews]     = useState([])
  const [bookingRoom, setBooking] = useState(null)
  const [review, setReview]       = useState({ content: '', rating: 5 })
  const [reviewError, setReviewError] = useState('')
  const [loading, setLoading]     = useState(true)

  // date filter
  const [checkIn,  setCheckIn]  = useState('')
  const [checkOut, setCheckOut] = useState('')

  // other room filters
  const [filterType,     setFilterType]     = useState('')
  const [filterStatus,   setFilterStatus]   = useState('')
  const [filterCapacity, setFilterCapacity] = useState('')
  const [filterMaxPrice, setFilterMaxPrice] = useState('')

  const roomTypes = useMemo(() => [...new Set(rooms.map(r => r.room_type))], [rooms])
  const maxPrice  = useMemo(() => Math.max(0, ...rooms.map(r => r.price_per_night)), [rooms])

  const loadRooms = (ci = checkIn, co = checkOut) => {
    const params = { hotel_id: id }
    if (ci)  params.check_in  = ci
    if (co)  params.check_out = co
    api.rooms.list(params).then(setRooms).catch(console.error)
  }

  useEffect(() => {
    Promise.all([
      api.hotels.get(id),
      api.rooms.list({ hotel_id: id }),
      api.reviews.list(id),
    ]).then(([h, r, rv]) => { setHotel(h); setRooms(r); setReviews(rv) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  function applyDates(ci, co) {
    setCheckIn(ci); setCheckOut(co)
    if (ci && co) loadRooms(ci, co)
    else if (!ci && !co) loadRooms('', '')
  }

  function resetDates() { applyDates('', '') }

  const activeRoomFilters = [filterType, filterStatus, filterCapacity, filterMaxPrice].filter(Boolean).length
  const datesSelected     = checkIn && checkOut

  const filteredRooms = useMemo(() => rooms.filter(r => {
    const matchType     = !filterType     || r.room_type === filterType
    const matchStatus   = !filterStatus   || r.status === filterStatus
    const matchCapacity = !filterCapacity || r.capacity >= +filterCapacity
    const matchPrice    = !filterMaxPrice || r.price_per_night <= +filterMaxPrice
    return matchType && matchStatus && matchCapacity && matchPrice
  }), [rooms, filterType, filterStatus, filterCapacity, filterMaxPrice])

  function handleBook(room) {
    if (!user) {
      navigate('/login', { state: { from: `/hotels/${id}`, message: 'Увійдіть, щоб забронювати кімнату' } })
      return
    }
    setBooking(room)
  }

  async function submitReview(e) {
    e.preventDefault()
    setReviewError('')
    try {
      const rv = await api.reviews.create({ user_id: user?.user_id ?? 0, hotel_id: +id, ...review })
      setReviews(prev => [rv, ...prev])
      setReview({ content: '', rating: 5 })
    } catch (err) {
      setReviewError(err.message)
    }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-4">
      <div className="h-64 bg-gray-200 rounded-2xl" />
      <div className="h-8 bg-gray-200 rounded w-1/3" />
    </div>
  )

  if (!hotel) return (
    <div className="text-center py-24">
      <p className="text-gray-500">Готель не знайдено</p>
      <Link to="/" className="btn-primary mt-4 inline-block">На головну</Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6">
        <ArrowLeft size={16} /> Всі готелі
      </Link>

      {/* Hotel header */}
      <div className="card mb-8 overflow-hidden">
        <div className="h-56 bg-gradient-to-br from-brand-600 to-brand-900 flex items-end p-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{hotel.name}</h1>
            <StarRating value={hotel.star_rating} size="lg" />
          </div>
        </div>
        <div className="p-6 flex flex-wrap gap-6">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={18} className="text-brand-500" />
            <span>{hotel.address}, {hotel.city}, {hotel.country}</span>
          </div>
          {hotel.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={18} className="text-brand-500" />
              <span>{hotel.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Rooms */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Кімнати{' '}
          <span className="text-gray-400 font-normal text-base">
            ({filteredRooms.length}{activeRoomFilters > 0 || datesSelected ? ` з ${rooms.length}` : ''})
          </span>
        </h2>

        {/* Filters */}
        {rooms.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-3">

            {/* Date filter — prominent row */}
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <CalendarDays size={12} /> Заїзд
                </p>
                <input
                  type="date" min={TODAY}
                  value={checkIn}
                  onChange={e => {
                    const ci = e.target.value
                    setCheckIn(ci)
                    if (ci && checkOut && ci < checkOut) loadRooms(ci, checkOut)
                    else if (!ci) applyDates('', '')
                  }}
                  className="input text-sm py-1.5 w-40"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <CalendarDays size={12} /> Виїзд
                </p>
                <input
                  type="date" min={checkIn || TODAY}
                  value={checkOut}
                  onChange={e => {
                    const co = e.target.value
                    setCheckOut(co)
                    if (checkIn && co && checkIn < co) loadRooms(checkIn, co)
                    else if (!co) applyDates('', '')
                  }}
                  className="input text-sm py-1.5 w-40"
                />
              </div>

              {datesSelected && (
                <button onClick={resetDates} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 pb-1">
                  <X size={14} /> Скинути дати
                </button>
              )}

              {datesSelected && (
                <p className="text-xs text-brand-600 font-medium pb-1">
                  Показано лише вільні на{' '}
                  {fmtDate(checkIn)} – {fmtDate(checkOut)}
                </p>
              )}
            </div>

            {/* Other filters */}
            <div className="flex flex-wrap gap-3 items-end pt-1 border-t border-gray-200">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Тип</p>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input text-sm py-1.5 w-36">
                  <option value="">Всі типи</option>
                  {roomTypes.map(t => <option key={t} value={t}>{TYPE_UA[t] ?? t}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Мін. місць</p>
                <input type="number" min={1} step={1} placeholder="Будь-яка"
                  value={filterCapacity}
                  onChange={e => setFilterCapacity(e.target.value < 1 ? '1' : e.target.value)}
                  className="input text-sm py-1.5 w-32" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Макс. ціна ₴</p>
                <input type="number" min={1} step={1} placeholder={maxPrice ? maxPrice.toLocaleString() : '—'}
                  value={filterMaxPrice}
                  onChange={e => setFilterMaxPrice(e.target.value < 1 ? '1' : e.target.value)}
                  className="input text-sm py-1.5 w-36" />
              </div>
              {activeRoomFilters > 0 && (
                <button onClick={() => { setFilterType(''); setFilterStatus(''); setFilterCapacity(''); setFilterMaxPrice('') }}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 pb-1">
                  <X size={14} /> Скинути
                </button>
              )}
            </div>
          </div>
        )}

        {!datesSelected && rooms.length > 0 && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
            <CalendarDays size={16} /> Оберіть дати заїзду та виїзду, щоб побачити доступні кімнати і активувати кнопку бронювання
          </p>
        )}

        {rooms.length === 0 ? (
          <p className="text-gray-400 text-sm">Кімнати відсутні</p>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <CalendarX size={32} className="mx-auto mb-2 opacity-40" />
            <p>{datesSelected ? 'Немає вільних кімнат на обрані дати' : 'Жодна кімната не відповідає фільтрам'}</p>
            <button onClick={() => { resetDates(); setFilterType(''); setFilterCapacity(''); setFilterMaxPrice('') }}
              className="btn-secondary text-sm mt-3">Скинути фільтри</button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRooms.map(r => (
              <RoomCard key={r.room_id} room={r}
                selectedDates={{ checkIn, checkOut }}
                onBook={handleBook} />
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Відгуки <span className="text-gray-400 font-normal text-base">({reviews.length})</span>
        </h2>
        {!user ? (
          <div className="card p-5 mb-6 flex items-center gap-3 text-gray-500 text-sm">
            <LogIn size={18} className="text-brand-400 shrink-0" />
            <span>Щоб залишити відгук, <Link to="/login" className="text-brand-600 hover:underline font-medium">увійдіть в акаунт</Link> і переконайтесь, що ваше бронювання вже завершилось.</span>
          </div>
        ) : (
          <form onSubmit={submitReview} className="card p-5 mb-6 space-y-3">
            <p className="font-medium text-gray-800">Залишити відгук</p>
            {reviewError && (
              <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm px-4 py-3 rounded-xl">
                {reviewError}
              </div>
            )}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Оцінка:</label>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button"
                  onClick={() => setReview(r => ({ ...r, rating: n }))}
                  className={`text-2xl transition-transform hover:scale-110 ${n <= review.rating ? 'text-amber-400' : 'text-gray-200'}`}>
                  ★
                </button>
              ))}
            </div>
            <textarea className="input resize-none" rows={3} placeholder="Поділіться враженнями..."
              value={review.content} onChange={e => setReview(r => ({ ...r, content: e.target.value }))} required />
            <button type="submit" className="btn-primary flex items-center gap-2 text-sm">
              <Send size={15} /> Надіслати
            </button>
          </form>
        )}
        <div className="space-y-3">
          {reviews.map(rv => (
            <div key={rv.review_id} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                    {rv.user_id}
                  </div>
                  <span className="text-sm font-medium text-gray-700">Гість #{rv.user_id}</span>
                </div>
                <StarRating value={rv.rating} />
              </div>
              <p className="text-gray-600 text-sm">{rv.content}</p>
            </div>
          ))}
        </div>
      </section>

      {bookingRoom && (
        <BookingModal
          room={bookingRoom}
          prefillDates={{ checkIn, checkOut }}
          userId={user?.user_id}
          onClose={() => setBooking(null)}
          onSuccess={() => loadRooms()}
        />
      )}
    </div>
  )
}
