import { useState, useEffect } from 'react'
import { Plus, Trash2, Hotel, BedDouble, RefreshCw, Users, ShieldBan, ShieldCheck, CalendarCheck, XCircle, CheckCircle } from 'lucide-react'
import { api } from '../api'
import StarRating from '../components/StarRating'

const BED_TYPES = [
  { value: 'single', label: 'Односпальне (1 ос.)' },
  { value: 'double', label: 'Двоспальне (2 ос.)' },
  { value: 'queen',  label: 'Queen-size (2 ос.)' },
  { value: 'king',   label: 'King-size (2 ос.)' },
  { value: 'sofa',   label: 'Диван-ліжко (1 ос.)' },
]

const BED_CAPACITY = { single: 1, double: 2, queen: 2, king: 2, sofa: 1 }

function BedManager({ room, onClose }) {
  const [beds, setBeds]     = useState(room.beds ?? [])
  const [type, setType]     = useState('double')
  const [loading, setLoading] = useState(false)

  async function addBed() {
    setLoading(true)
    try {
      const bed = await api.beds.create({
        room_id:  room.room_id,
        bed_type: type,
        capacity: BED_CAPACITY[type] ?? 1,
      })
      setBeds(prev => [...prev, bed])
    } catch (err) { alert(err.message) }
    finally { setLoading(false) }
  }

  async function deleteBed(id) {
    await api.beds.delete(id)
    setBeds(prev => prev.filter(b => b.bed_id !== id))
  }

  const totalCapacity = beds.reduce((s, b) => s + b.capacity, 0)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Ліжка — кімната {room.room_number}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Загальна місткість: {totalCapacity} ос.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Add bed */}
          <div className="flex gap-2">
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="input text-sm flex-1"
            >
              {BED_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
            <button onClick={addBed} disabled={loading} className="btn-primary text-sm whitespace-nowrap flex items-center gap-1">
              <Plus size={15} /> Додати
            </button>
          </div>

          {/* Beds list */}
          {beds.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <BedDouble size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Ліжок ще немає</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {beds.map(b => {
                const label = BED_TYPES.find(t => t.value === b.bed_type)?.label ?? b.bed_type
                return (
                  <li key={b.bed_id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <BedDouble size={16} className="text-brand-400" />
                      <span className="text-sm text-gray-800">{label}</span>
                      <span className="text-xs text-gray-400">{b.capacity} ос.</span>
                    </div>
                    <button onClick={() => deleteBed(b.bed_id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Hotel form ────────────────────────────────────────────────────────────────
function HotelForm({ onSave }) {
  const [f, setF] = useState({ name: '', address: '', city: '', country: '', star_rating: 3, phone: '' })
  const [phoneError, setPhoneError] = useState('')
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))

  const validatePhone = v => {
    if (v && !/^\+[1-9]\d{7,14}$/.test(v)) {
      setPhoneError('Формат: +380XXXXXXXXX (міжнародний)')
    } else {
      setPhoneError('')
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (phoneError) return
    await onSave({ ...f, star_rating: +f.star_rating })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {[['name','Назва готелю','Готель Україна'],['address','Адреса','вул. Хрещатик 1'],
        ['city','Місто','Київ'],['country','Країна','Україна'],['phone','Телефон','+380441234567']]
        .map(([k, l, p]) => (
          <div key={k}>
            <label className="label">{l}</label>
            <input
              className={`input ${k === 'phone' && phoneError ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder={p} value={f[k]} required={k !== 'phone'}
              onChange={e => { set(k)(e); if (k === 'phone') validatePhone(e.target.value) }}
            />
            {k === 'phone' && phoneError && (
              <p className="text-red-500 text-xs mt-1">{phoneError}</p>
            )}
          </div>
        ))}
      <div>
        <label className="label">Зірки</label>
        <select className="input" value={f.star_rating} onChange={set('star_rating')}>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
        </select>
      </div>
      <button type="submit" className="btn-primary w-full mt-2">Додати готель</button>
    </form>
  )
}

// ── Room form ─────────────────────────────────────────────────────────────────
function RoomForm({ hotels, onSave }) {
  const [f, setF]       = useState({ hotel_id: hotels[0]?.hotel_id ?? '', room_number: '', room_type: 'standard', price_per_night: '', capacity: 2, floor: 1 })
  const [error, setError] = useState('')
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      await onSave({ ...f, hotel_id: +f.hotel_id, price_per_night: +f.price_per_night, capacity: +f.capacity, floor: +f.floor })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      <div>
        <label className="label">Готель</label>
        <select className="input" value={f.hotel_id} onChange={set('hotel_id')} required>
          {hotels.map(h => <option key={h.hotel_id} value={h.hotel_id}>{h.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Номер кімнати</label>
          <input
            className="input" placeholder="101" required
            pattern="^[A-Za-z0-9][A-Za-z0-9\-]*$"
            title="Лише цифри, літери та дефіс. Не може починатись з мінуса."
            value={f.room_number}
            onChange={e => setF(p => ({ ...p, room_number: e.target.value.replace(/^-+/, '') }))}
          />
        </div>
        <div>
          <label className="label">Тип</label>
          <select className="input" value={f.room_type} onChange={set('room_type')}>
            {['standard','deluxe','suite'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Ціна/ніч ₴</label>
          <input type="number" className="input" placeholder="1500" min={1} step={0.01} value={f.price_per_night} onChange={set('price_per_night')} required />
        </div>
        <div>
          <label className="label">Місць</label>
          <input type="number" className="input" min={1} value={f.capacity} onChange={set('capacity')} />
        </div>
        <div>
          <label className="label">Поверх</label>
          <input type="number" className="input" min={1} value={f.floor} onChange={set('floor')} />
        </div>
      </div>
      <button type="submit" className="btn-primary w-full mt-2">Додати кімнату</button>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab]           = useState('hotels')
  const [hotels, setHotels]     = useState([])
  const [rooms, setRooms]       = useState([])
  const [users, setUsers]       = useState([])
  const [bookings, setBookings] = useState([])
  const [modal, setModal]       = useState(null)
  const [bedRoom, setBedRoom]   = useState(null)
  const [loading, setLoading]   = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([api.hotels.list(), api.rooms.list({}), api.users.list(), api.bookings.list()])
      .then(([h, r, u, b]) => { setHotels(h); setRooms(r); setUsers(u); setBookings(b) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function addHotel(data) { await api.hotels.create(data); setModal(null); load() }
  async function addRoom(data) {
    await api.rooms.create(data)
    setModal(null)
    load()
  }

  async function deleteHotel(id) {
    if (!confirm('Видалити готель?')) return
    await api.hotels.delete(id); load()
  }
  async function deleteRoom(id) {
    if (!confirm('Видалити кімнату?')) return
    await api.rooms.delete(id); load()
  }
  async function confirmBooking(id) {
    await api.bookings.confirm(id)
    load()
  }
  async function cancelBooking(id) {
    if (!confirm('Скасувати бронювання?')) return
    await api.bookings.cancel(id)
    load()
  }

  async function deleteUser(id) {
    if (!confirm('Видалити користувача?')) return
    await api.users.delete(id); load()
  }
  async function toggleBlock(user) {
    if (user.is_blacklisted) {
      await api.users.unblock(user.user_id)
    } else {
      if (!confirm(`Заблокувати ${user.full_name}?`)) return
      await api.users.block(user.user_id)
    }
    load()
  }

  const blockedCount = users.filter(u => u.is_blacklisted).length
  const pendingCount = bookings.filter(b => b.status === 'pending').length

  const BOOKING_STATUS = {
    pending:   { label: 'Очікує',        cls: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Підтверджено',  cls: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Скасовано',     cls: 'bg-red-100 text-red-600' },
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const tabs = [
    { id: 'hotels',   label: 'Готелі',      icon: Hotel,         count: hotels.length },
    { id: 'rooms',    label: 'Кімнати',     icon: BedDouble,     count: rooms.length },
    { id: 'bookings', label: 'Бронювання',  icon: CalendarCheck, count: bookings.length, badge: pendingCount },
    { id: 'users',    label: 'Користувачі', icon: Users,         count: users.length },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Панель адміністратора</h1>
          <p className="text-gray-500 mt-1 text-sm">Управління готелями та кімнатами</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={15} /> Оновити
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
        {tabs.map(({ id, label, icon: Icon, count, badge }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === id ? 'bg-white shadow text-brand-700' : 'text-gray-600 hover:text-gray-900'
            }`}>
            <Icon size={16} /> {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === id ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-500'}`}>
              {count}
            </span>
            {badge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Hotels table */}
      {tab === 'hotels' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Список готелів</h2>
            <button onClick={() => setModal('hotel')} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16} /> Додати готель
            </button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Назва','Місто','Країна','Адреса','Рейтинг','Телефон',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array.from({length:3}).map((_,i) => (
                      <tr key={i}>{Array.from({length:7}).map((_,j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                      ))}</tr>
                    ))
                  : hotels.map(h => (
                      <tr key={h.hotel_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{h.name}</td>
                        <td className="px-4 py-3 text-gray-600">{h.city}</td>
                        <td className="px-4 py-3 text-gray-600">{h.country}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{h.address}</td>
                        <td className="px-4 py-3"><StarRating value={h.star_rating} /></td>
                        <td className="px-4 py-3 text-gray-500">{h.phone || '—'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => deleteHotel(h.hotel_id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
            {!loading && hotels.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Hotel size={32} className="mx-auto mb-2 opacity-30" />
                <p>Готелів ще немає</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rooms table */}
      {tab === 'rooms' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Список кімнат</h2>
            <button onClick={() => setModal('room')} disabled={hotels.length === 0}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-40">
              <Plus size={16} /> Додати кімнату
            </button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Назва','Тип','Ціна/ніч','Місць','Поверх','Ліжка','Статус',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rooms.map(r => {
                  const typeColor = {standard:'bg-blue-50 text-blue-700',deluxe:'bg-purple-50 text-purple-700',suite:'bg-amber-50 text-amber-700'}[r.room_type]??'bg-gray-50 text-gray-700'
                  const bedCount  = r.beds?.length ?? 0
                  return (
                    <tr key={r.room_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.capacity}-місний {r.room_type}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor}`}>{r.room_type}</span>
                      </td>
                      <td className="px-4 py-3 font-medium">{r.price_per_night?.toLocaleString()} ₴</td>
                      <td className="px-4 py-3 text-gray-600">{r.capacity}</td>
                      <td className="px-4 py-3 text-gray-600">{r.floor}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setBedRoom(r)}
                          className="flex items-center gap-1 text-brand-600 hover:text-brand-800 text-xs font-medium"
                        >
                          <BedDouble size={14} />
                          {bedCount > 0 ? `${bedCount} шт.` : 'Додати'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status==='available'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
                          {r.status==='available'?'Вільна':'Зайнята'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteRoom(r.room_id)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {!loading && rooms.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <BedDouble size={32} className="mx-auto mb-2 opacity-30" />
                <p>Кімнат ще немає</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookings table */}
      {tab === 'bookings' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">
              Всі бронювання
              {pendingCount > 0 && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                  {pendingCount} очікують
                </span>
              )}
            </h2>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['#', 'Кімната', 'Користувач', 'Заїзд', 'Виїзд', 'Сума', 'Статус', 'Дії'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                      ))}</tr>
                    ))
                  : bookings.map(b => {
                      const cfg = BOOKING_STATUS[b.status] ?? { label: b.status, cls: 'bg-gray-100 text-gray-600' }
                      return (
                        <tr key={b.booking_id} className={`transition-colors ${b.status === 'pending' ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'}`}>
                          <td className="px-4 py-3 text-gray-400 font-mono">#{b.booking_id}</td>
                          <td className="px-4 py-3 text-gray-700">
                            {b.room ? `Кімната ${b.room.room_number}` : `Room #${b.room_id}`}
                          </td>
                          <td className="px-4 py-3 text-gray-600">User #{b.user_id}</td>
                          <td className="px-4 py-3 text-gray-600">{formatDate(b.check_in_date)}</td>
                          <td className="px-4 py-3 text-gray-600">{formatDate(b.check_out_date)}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{b.total_price?.toLocaleString()} ₴</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.cls}`}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {b.status === 'pending' && (
                                <button
                                  onClick={() => confirmBooking(b.booking_id)}
                                  className="flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-all"
                                >
                                  <CheckCircle size={13} /> Підтвердити
                                </button>
                              )}
                              {b.status !== 'cancelled' && (
                                <button
                                  onClick={() => cancelBooking(b.booking_id)}
                                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <XCircle size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                }
              </tbody>
            </table>
            {!loading && bookings.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <CalendarCheck size={32} className="mx-auto mb-2 opacity-30" />
                <p>Бронювань ще немає</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users table */}
      {tab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">
              Користувачі
              {blockedCount > 0 && (
                <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  {blockedCount} заблокованих
                </span>
              )}
            </h2>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{["Ім'я", 'Email', 'Телефон', 'Статус', 'Дії'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}</tr>
                    ))
                  : users.map(u => (
                      <tr key={u.user_id} className={`transition-colors ${u.is_blacklisted ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                        <td className="px-4 py-3 font-medium text-gray-900">{u.full_name}</td>
                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                        <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                        <td className="px-4 py-3">
                          {u.is_blacklisted ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-100 text-red-700 px-2.5 py-1 rounded-full">
                              <ShieldBan size={12} /> Заблокований
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                              <ShieldCheck size={12} /> Активний
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleBlock(u)}
                              className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                                u.is_blacklisted
                                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100'
                              }`}
                            >
                              {u.is_blacklisted
                                ? <><ShieldCheck size={13} /> Розблокувати</>
                                : <><ShieldBan size={13} /> Заблокувати</>
                              }
                            </button>
                            <button
                              onClick={() => deleteUser(u.user_id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
            {!loading && users.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p>Користувачів ще немає</p>
              </div>
            )}
          </div>
        </div>
      )}

      {bedRoom && (
        <BedManager room={bedRoom} onClose={() => { setBedRoom(null); load() }} />
      )}

      {modal === 'hotel' && (
        <Modal title="Новий готель" onClose={() => setModal(null)}>
          <HotelForm onSave={addHotel} />
        </Modal>
      )}
      {modal === 'room' && (
        <Modal title="Нова кімната" onClose={() => setModal(null)}>
          <RoomForm hotels={hotels} onSave={addRoom} />
        </Modal>
      )}
    </div>
  )
}
