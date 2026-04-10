import { Star } from 'lucide-react'
import styles from './StarRating.module.css'

export default function StarRating({ rating, count, interactive = false, onRate, size = 16 }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className={styles.wrap}>
      <div className={styles.stars}>
        {stars.map((s) => (
          <button
            key={s}
            className={`${styles.star} ${interactive ? styles.interactive : ''}`}
            onClick={() => interactive && onRate?.(s)}
            disabled={!interactive}
            aria-label={`Rate ${s} stars`}
            type="button"
          >
            <Star
              size={size}
              fill={s <= Math.round(rating) ? '#f59e0b' : 'none'}
              color={s <= Math.round(rating) ? '#f59e0b' : '#d1d5db'}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      {count !== undefined && (
        <span className={styles.count}>
          {rating ? rating.toFixed(1) : '—'} ({count})
        </span>
      )}
    </div>
  )
}
