import { Link } from 'react-router-dom'
import { MapPin, Wifi, Zap, Droplets, Shield, Car, UtensilsCrossed, BedDouble, Star } from 'lucide-react'
import StarRating from '../common/StarRating'
import styles from './HostelCard.module.css'

const AMENITY_ICONS = {
  wifi: <Wifi size={13} />,
  electricity: <Zap size={13} />,
  water: <Droplets size={13} />,
  security: <Shield size={13} />,
  parking: <Car size={13} />,
  cafeteria: <UtensilsCrossed size={13} />,
}

export default function HostelCard({ hostel }) {
  const coverPhoto = hostel.photos?.[0] || null
  const avgRating = hostel.avg_rating || 0
  const ratingCount = hostel.rating_count || 0
  const roomsRemaining = hostel.available_rooms
  const roomsTotal = hostel.total_rooms

  return (
    <Link to={`/hostels/${hostel.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {coverPhoto ? (
          <img src={coverPhoto} alt={hostel.name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}><span>No photo</span></div>
        )}
        <div className={styles.priceBadge}>
          UGX {Number(hostel.price_per_semester).toLocaleString()}
          <span>/sem</span>
        </div>
        {hostel.is_featured && (
          <div className={styles.featuredBadge}>
            <Star size={10} fill="currentColor" /> Top Rated
          </div>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{hostel.name}</h3>

        <div className={styles.location}>
          <MapPin size={13} />
          <span>{hostel.location}</span>
        </div>

        <StarRating rating={avgRating} count={ratingCount} size={14} />

        {/* Rooms */}
        {(roomsRemaining != null || roomsTotal != null) && (
          <div className={styles.rooms}>
            <BedDouble size={13} />
            <span>
              {roomsRemaining != null ? (
                <span className={roomsRemaining > 0 ? styles.roomsAvail : styles.roomsFull}>
                  {roomsRemaining > 0 ? `${roomsRemaining} remaining` : 'Full'}
                </span>
              ) : null}
              {roomsTotal != null && (
                <span className={styles.roomsTotal}> / {roomsTotal} total</span>
              )}
            </span>
          </div>
        )}

        {hostel.amenities?.length > 0 && (
          <div className={styles.amenities}>
            {hostel.amenities.slice(0, 4).map((a) => (
              <span key={a} className={styles.amenityTag}>
                {AMENITY_ICONS[a] || null}
                {a}
              </span>
            ))}
            {hostel.amenities.length > 4 && (
              <span className={styles.amenityMore}>+{hostel.amenities.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
