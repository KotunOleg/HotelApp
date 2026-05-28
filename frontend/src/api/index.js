const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  hotels: {
    list:   ()       => request('/hotels'),
    get:    (id)     => request(`/hotels/${id}`),
    create: (data)   => request('/hotels',     { method: 'POST', body: data }),
    update: (id, d)  => request(`/hotels/${id}`, { method: 'PUT',  body: d }),
    delete: (id)     => request(`/hotels/${id}`, { method: 'DELETE' }),
  },
  rooms: {
    list:   (params) => request(`/rooms?${new URLSearchParams(params)}`),
    create: (data)   => request('/rooms', { method: 'POST', body: data }),
    delete: (id)     => request(`/rooms/${id}`, { method: 'DELETE' }),
  },
  beds: {
    list:   (roomId) => request(`/beds?room_id=${roomId}`),
    create: (data)   => request('/beds', { method: 'POST', body: data }),
    delete: (id)     => request(`/beds/${id}`, { method: 'DELETE' }),
  },
  bookings: {
    list:   ()     => request('/bookings'),
    create: (data) => request('/bookings', { method: 'POST', body: data }),
    cancel: (id)   => request(`/bookings/${id}`, { method: 'DELETE' }),
  },
  reviews: {
    list:   (hotelId) => request(`/reviews?hotel_id=${hotelId}`),
    create: (data)    => request('/reviews', { method: 'POST', body: data }),
  },
  auth: {
    login:    (data) => request('/auth/login',    { method: 'POST', body: data }),
    register: (data) => request('/auth/register', { method: 'POST', body: data }),
  },
}
