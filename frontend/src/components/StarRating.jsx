export default function StarRating({ value, max = 5, size = 'sm' }) {
  const sz = size === 'lg' ? 'text-xl' : 'text-sm'
  return (
    <span className={`${sz} tracking-tight`} aria-label={`${value} з ${max} зірок`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? 'text-amber-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}
