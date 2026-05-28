import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import StarRating from './StarRating'

const GRADIENTS = [
  'from-blue-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-violet-400 to-purple-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-600',
  'from-sky-400 to-cyan-600',
]

export default function HotelCard({ hotel }) {
  const grad = GRADIENTS[hotel.hotel_id % GRADIENTS.length]

  return (
    <Link to={`/hotels/${hotel.hotel_id}`} className="card group cursor-pointer block">
      <div className={`h-44 bg-gradient-to-br ${grad} relative flex items-end p-4`}>
        <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {hotel.star_rating}★
        </span>
        <h3 className="text-white font-bold text-lg leading-tight drop-shadow">
          {hotel.name}
        </h3>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
          <MapPin size={14} />
          <span>{hotel.city}, {hotel.country}</span>
        </div>
        <StarRating value={hotel.star_rating} />
        {hotel.phone && (
          <p className="text-xs text-gray-400 mt-2">{hotel.phone}</p>
        )}
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-400">{hotel.address}</span>
          <span className="text-brand-600 text-sm font-medium group-hover:underline">
            Переглянути →
          </span>
        </div>
      </div>
    </Link>
  )
}
