import { useState, useEffect } from 'react'
import { Plus, Trash2, Hotel, BedDouble, RefreshCw } from 'lucide-react'
import { api } from '../api'
import StarRating from '../components/StarRating'

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
            <input className="input" placeholder={p} value={f[k]} onChange={set(k)}
              required={k !== 'phone'} />
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
  const [f, setF] = useState({ hotel_id: hotels[0]?.hotel_id ?? '', room_number: '', room_type: 'standard', price_per_night: '', capacity: 2, floor: 1 })
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    await onSave({ ...f, hotel_id: +f.hotel_id, price_per_night: +f.price_per_night, capacity: +f.capacity, floor: +f.floor })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="label">Готель</label>
        <select className="input" value={f.hotel_id} onChange={set('hotel_id')} required>
          {hotels.map(h => <option key={h.hotel_id} value={h.hotel_id}>{h.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Номер кімнати</label>
          <input className="input" placeholder="101" value={f.room_number} onChange={set('room_number')} required />
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
          <input type="number" className="input" placeholder="1500" value={f.price_per_night} onChange={set('price_per_night')} required />
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
  const [tab, setTab]         = useState('hotels')
  const [hotels, setHotels]   = useState([])
  const [rooms, setRooms]     = useState([])
  const [modal, setModal]     = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([api.hotels.list(), api.rooms.list({})])
      .then(([h, r]) => { setHotels(h); setRooms(r) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function addHotel(data) {
    await api.hotels.create(data)
    setModal(null)
    load()
  }

  async function addRoom(data) {
    await api.rooms.create(data)
    setModal(null)
    load()
  }

  async function deleteHotel(id) {
    if (!confirm('Видалити готель?')) return
    await api.hotels.delete(id)
    load()
  }

  async function deleteRoom(id) {
    if (!confirm('Видалити кімнату?')) return
    await api.rooms.delete(id)
    load()
  }

  const tabs = [
    { id: 'hotels', label: 'Готелі',  icon: Hotel,    count: hotels.length },
    { id: 'rooms',  label: 'Кімнати', icon: BedDouble, count: rooms.length },
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
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === id ? 'bg-white shadow text-brand-700' : 'text-gray-600 hover:text-gray-900'
            }`}>
            <Icon size={16} /> {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === id ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-500'}`}>
              {count}
            </span>
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
                <tr>{['Номер','Тип','Ціна/ніч','Місць','Поверх','Статус','Hotel ID',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rooms.map(r => {
                  const typeColor = {standard:'bg-blue-50 text-blue-700',deluxe:'bg-purple-50 text-purple-700',suite:'bg-amber-50 text-amber-700'}[r.room_type]??'bg-gray-50 text-gray-700'
                  return (
                    <tr key={r.room_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.room_number}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor}`}>{r.room_type}</span>
                      </td>
                      <td className="px-4 py-3 font-medium">{r.price_per_night?.toLocaleString()} ₴</td>
                      <td className="px-4 py-3 text-gray-600">{r.capacity}</td>
                      <td className="px-4 py-3 text-gray-600">{r.floor}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status==='available'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
                          {r.status==='available'?'Вільна':'Зайнята'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">#{r.hotel_id}</td>
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
