import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarRange, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/common/Spinner'
import styles from './MyBookingsPage.module.css'

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: <Clock size={14} />, cls: 'pending' },
  confirmed: { label: 'Confirmed', icon: <CheckCircle size={14} />, cls: 'confirmed' },
  rejected: { label: 'Rejected', icon: <XCircle size={14} />, cls: 'rejected' },
  cancelled: { label: 'Cancelled', icon: <AlertCircle size={14} />, cls: 'cancelled' },
}

export default function MyBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, hostels(id, name, location, photos, price_per_semester)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setBookings(data || [])
    setLoading(false)
  }

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(bookingId)
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId)
    await fetchBookings()
    setCancelling(null)
  }

  if (loading) return <div className={styles.loadingWrap}><Spinner /></div>

  return (
    <div className={styles.page}>
      <div className="page-container">
        <div className={styles.header}>
          <h1 className={styles.title}>My Bookings</h1>
          <Link to="/hostels" className={styles.browseLink}>Browse more hostels →</Link>
        </div>

        {bookings.length === 0 ? (
          <div className={styles.empty}>
            <CalendarRange size={40} className={styles.emptyIcon} />
            <p>You haven't made any bookings yet.</p>
            <Link to="/hostels" className={styles.emptyLink}>Browse Hostels</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {bookings.map((b) => {
              const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
              const hostel = b.hostels
              return (
                <div key={b.id} className={styles.card}>
                  {hostel?.photos?.[0] && (
                    <img src={hostel.photos[0]} alt={hostel.name} className={styles.photo} />
                  )}
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <div>
                        <Link to={`/hostels/${hostel?.id}`} className={styles.hostelName}>
                          {hostel?.name || 'Hostel'}
                        </Link>
                        <div className={styles.hostelLocation}>
                          <MapPin size={13} /> {hostel?.location}
                        </div>
                      </div>
                      <span className={`${styles.statusBadge} ${styles[status.cls]}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>

                    <div className={styles.details}>
                      <div className={styles.detail}>
                        <span className={styles.detailLabel}>Semester</span>
                        <span className={styles.detailValue}>{b.semester}</span>
                      </div>
                      <div className={styles.detail}>
                        <span className={styles.detailLabel}>Academic Year</span>
                        <span className={styles.detailValue}>{b.academic_year}</span>
                      </div>
                      {b.room_type && (
                        <div className={styles.detail}>
                          <span className={styles.detailLabel}>Room Type</span>
                          <span className={styles.detailValue} style={{ textTransform: 'capitalize' }}>{b.room_type}</span>
                        </div>
                      )}
                      <div className={styles.detail}>
                        <span className={styles.detailLabel}>Payment</span>
                        <span className={styles.detailValue} style={{ textTransform: 'capitalize' }}>{b.payment_method?.replace('_', ' ')}</span>
                      </div>
                      <div className={styles.detail}>
                        <span className={styles.detailLabel}>Total</span>
                        <span className={styles.detailValue}>UGX {Number(b.total_amount).toLocaleString()}</span>
                      </div>
                      <div className={styles.detail}>
                        <span className={styles.detailLabel}>Booked on</span>
                        <span className={styles.detailValue}>{new Date(b.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {b.special_requests && (
                      <p className={styles.requests}>
                        <strong>Special requests:</strong> {b.special_requests}
                      </p>
                    )}

                    {b.status === 'pending' && (
                      <button
                        className={styles.cancelBtn}
                        onClick={() => handleCancel(b.id)}
                        disabled={cancelling === b.id}
                      >
                        {cancelling === b.id ? 'Cancelling…' : 'Cancel Booking'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
