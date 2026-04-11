import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  MapPin, Wifi, Zap, Droplets, Shield, Car, UtensilsCrossed,
  ChevronLeft, ChevronRight, X, BedDouble
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import StarRating from '../../components/common/StarRating'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import styles from './HostelDetailPage.module.css'

const AMENITY_ICONS = {
  wifi: <Wifi size={16} />,
  electricity: <Zap size={16} />,
  water: <Droplets size={16} />,
  security: <Shield size={16} />,
  parking: <Car size={16} />,
  cafeteria: <UtensilsCrossed size={16} />,
}

export default function HostelDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [hostel, setHostel] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [photoIndex, setPhotoIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const [userRating, setUserRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [existingReview, setExistingReview] = useState(null)

  useEffect(() => {
    fetchHostel()
    fetchReviews()
  }, [id])

  useEffect(() => {
    if (user && reviews.length > 0) {
      const mine = reviews.find((r) => r.user_id === user.id)
      if (mine) {
        setExistingReview(mine)
        setUserRating(mine.rating)
        setReviewText(mine.comment || '')
      }
    }
  }, [reviews, user])

  const fetchHostel = async () => {
    try {
      const { data, error } = await supabase.from('hostels').select('*').eq('id', id).single()
      if (error) setError(error.message)
      else setHostel(data)
    } catch (err) {
      setError(err.message || 'Failed to load hostel.')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const { data } = await supabase
        .from('reviews')
        .select('*, profiles(full_name)')
        .eq('hostel_id', id)
        .order('created_at', { ascending: false })
      setReviews(data || [])
    } catch (_) {}
  }

  const submitReview = async () => {
    if (!userRating) { setReviewError('Please select a star rating.'); return }
    setSubmitting(true)
    setReviewError('')
    try {
      const payload = { hostel_id: id, user_id: user.id, rating: userRating, comment: reviewText }
      const { error } = existingReview
        ? await supabase.from('reviews').update(payload).eq('id', existingReview.id)
        : await supabase.from('reviews').insert(payload)
      if (error) setReviewError(error.message)
      else { await fetchReviews(); await fetchHostel() }
    } catch (err) {
      setReviewError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const photos = hostel?.photos || []
  const prevPhoto = () => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)
  const nextPhoto = () => setPhotoIndex((i) => (i + 1) % photos.length)

  const hasMap = hostel?.latitude != null && hostel?.longitude != null
  const mapSrc = hasMap
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${hostel.longitude - 0.005},${hostel.latitude - 0.005},${hostel.longitude + 0.005},${hostel.latitude + 0.005}&layer=mapnik&marker=${hostel.latitude},${hostel.longitude}`
    : null

  const roomsRemaining = hostel?.available_rooms
  const roomsTotal = hostel?.total_rooms

  if (loading) return <div className={styles.loadingWrap}><Spinner /></div>
  if (error || !hostel) return (
    <div className={styles.errorPage}>
      <p>{error || 'Hostel not found.'}</p>
      <Link to="/hostels">← Back to listings</Link>
    </div>
  )

  return (
    <div className={styles.page}>
      {lightbox && photos.length > 0 && (
        <div className={styles.lightbox} onClick={() => setLightbox(false)}>
          <button className={styles.lightboxClose}><X size={24} /></button>
          <button className={styles.lightboxPrev} onClick={(e) => { e.stopPropagation(); prevPhoto() }}><ChevronLeft size={28} /></button>
          <img src={photos[photoIndex]} alt={`Photo ${photoIndex + 1}`} className={styles.lightboxImg} onClick={(e) => e.stopPropagation()} />
          <button className={styles.lightboxNext} onClick={(e) => { e.stopPropagation(); nextPhoto() }}><ChevronRight size={28} /></button>
          <span className={styles.lightboxCount}>{photoIndex + 1} / {photos.length}</span>
        </div>
      )}

      <div className="page-container">
        <Link to="/hostels" className={styles.back}><ChevronLeft size={16} /> Back to listings</Link>

        {/* Gallery */}
        <div className={styles.gallery}>
          {photos.length > 0 ? (
            <>
              <div className={styles.mainPhoto} onClick={() => setLightbox(true)}>
                <img src={photos[photoIndex]} alt={hostel.name} />
                {photos.length > 1 && (
                  <>
                    <button className={`${styles.galleryNav} ${styles.galleryPrev}`} onClick={(e) => { e.stopPropagation(); prevPhoto() }}><ChevronLeft size={20} /></button>
                    <button className={`${styles.galleryNav} ${styles.galleryNext}`} onClick={(e) => { e.stopPropagation(); nextPhoto() }}><ChevronRight size={20} /></button>
                    <span className={styles.galleryCount}>{photoIndex + 1} / {photos.length}</span>
                  </>
                )}
                <span className={styles.expandHint}>Click to expand</span>
              </div>
              {photos.length > 1 && (
                <div className={styles.thumbs}>
                  {photos.map((p, i) => (
                    <button key={i} className={`${styles.thumb} ${i === photoIndex ? styles.thumbActive : ''}`} onClick={() => setPhotoIndex(i)}>
                      <img src={p} alt={`Thumb ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.noPhotos}>No photos available</div>
          )}
        </div>

        <div className={styles.layout}>
          <div className={styles.main}>
            <h1 className={styles.name}>{hostel.name}</h1>
            <div className={styles.meta}>
              <span className={styles.location}><MapPin size={15} />{hostel.location}</span>
              <StarRating rating={hostel.avg_rating || 0} count={hostel.rating_count || 0} size={16} />
            </div>

            {hostel.description && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>About this hostel</h2>
                <p className={styles.description}>{hostel.description}</p>
              </section>
            )}

            {hostel.amenities?.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Amenities</h2>
                <div className={styles.amenitiesGrid}>
                  {hostel.amenities.map((a) => (
                    <div key={a} className={styles.amenityItem}>
                      <span className={styles.amenityIcon}>{AMENITY_ICONS[a] || null}</span>
                      <span className={styles.amenityLabel}>{a}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* OpenStreetMap */}
            {hasMap && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Location</h2>
                <div className={styles.mapWrap}>
                  <iframe
                    title={`Map of ${hostel.name}`}
                    src={mapSrc}
                    className={styles.mapFrame}
                    allowFullScreen
                  />
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${hostel.latitude}&mlon=${hostel.longitude}#map=17/${hostel.latitude}/${hostel.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.mapLink}
                  >
                    View larger map ↗
                  </a>
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Student Reviews ({reviews.length})</h2>
              {user ? (
                <div className={styles.reviewForm}>
                  <p className={styles.reviewFormTitle}>{existingReview ? 'Update your review' : 'Leave a review'}</p>
                  <StarRating rating={userRating} interactive onRate={setUserRating} size={24} />
                  <textarea
                    className={styles.reviewTextarea}
                    placeholder="Share your experience (optional)…"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                  />
                  {reviewError && <p className={styles.reviewError}>{reviewError}</p>}
                  <Button onClick={submitReview} loading={submitting} size="sm">
                    {existingReview ? 'Update Review' : 'Submit Review'}
                  </Button>
                </div>
              ) : (
                <p className={styles.loginPrompt}><Link to="/login">Log in</Link> to leave a review.</p>
              )}
              <div className={styles.reviewList}>
                {reviews.length === 0 && <p className={styles.noReviews}>No reviews yet. Be the first!</p>}
                {reviews.map((r) => (
                  <div key={r.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewAuthor}>{r.profiles?.full_name || 'Student'}</span>
                      <StarRating rating={r.rating} size={14} />
                      <span className={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Booking sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.bookingCard}>
              <div className={styles.priceRow}>
                <span className={styles.price}>UGX {Number(hostel.price_per_semester).toLocaleString()}</span>
                <span className={styles.priceLabel}>/ semester</span>
              </div>

              {/* Rooms display */}
              {(roomsRemaining != null || roomsTotal != null) && (
                <div className={styles.roomsWrap}>
                  <BedDouble size={15} className={styles.roomsIcon} />
                  <div className={styles.roomsInfo}>
                    {roomsTotal != null && (
                      <span className={styles.roomsTotal}>{roomsTotal} total rooms</span>
                    )}
                    {roomsRemaining != null && (
                      <span className={roomsRemaining > 0 ? styles.available : styles.unavailable}>
                        {roomsRemaining > 0 ? `${roomsRemaining} remaining` : 'No rooms left'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Rooms progress bar */}
              {roomsTotal != null && roomsRemaining != null && (
                <div className={styles.roomsBar}>
                  <div
                    className={styles.roomsBarFill}
                    style={{ width: `${Math.max(0, Math.min(100, (roomsRemaining / roomsTotal) * 100))}%` }}
                  />
                </div>
              )}

              <Button
                fullWidth size="lg" variant="accent"
                onClick={() => user ? navigate(`/book/${hostel.id}`) : navigate('/login')}
                disabled={roomsRemaining === 0}
              >
                {user ? 'Book Now' : 'Log in to Book'}
              </Button>

              {hostel.contact_info && (
                <div className={styles.contact}>
                  <p className={styles.contactLabel}>Contact</p>
                  <p className={styles.contactValue}>{hostel.contact_info}</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
