import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/common/Spinner'
import styles from './AdminBookings.module.css'

const STATUSES = ['all', 'pending', 'confirmed', 'rejected', 'cancelled']

const STATUS_ACTIONS = {
  pending:   [{ label: 'Confirm', next: 'confirmed', cls: 'confirm' }, { label: 'Reject', next: 'rejected', cls: 'reject' }],
  confirmed: [{ label: 'Reject', next: 'rejected', cls: 'reject' }],
  rejected:  [{ label: 'Confirm', next: 'confirmed', cls: 'confirm' }],
  cancelled: [],
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(null)

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, hostels(name), profiles!bookings_user_id_fkey(full_name)')
        .order('created_at', { ascending: false })
      if (error) setError(error.message)
      else setBookings(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      await supabase.from('bookings').update({ status }).eq('id', id)
      await fetchBookings()
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)

  if (loading) return <div className={styles.loadingWrap}><Spinner /></div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bookings</h1>
        <div className={styles.filters}>
          {STATUSES.map((s) => (
            <button
              key={s}
              className={`${styles.filterBtn} ${filter === s ? styles.filterActive : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== 'all' && (
                <span className={styles.filterCount}>
                  {bookings.filter((b) => b.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error}</p>}

      {filtered.length === 0 ? (
        <p className={styles.empty}>No bookings found.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Hostel</th>
                <th>Semester</th>
                <th>Room Type</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className={styles.studentCell}>
                      <span className={styles.studentName}>{b.profiles?.full_name || b.user_id?.slice(0, 8) || '—'}</span>
                      {b.phone_number && <span className={styles.studentPhone}>{b.phone_number}</span>}
                    </div>
                  </td>
                  <td className={styles.hostelName}>{b.hostels?.name || '—'}</td>
                  <td>{b.semester}<br /><span className={styles.year}>{b.academic_year}</span></td>
                  <td style={{ textTransform: 'capitalize' }}>{b.room_type || '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{b.payment_method?.replace('_', ' ')}</td>
                  <td>UGX {Number(b.total_amount).toLocaleString()}</td>
                  <td><span className={`${styles.badge} ${styles[b.status]}`}>{b.status}</span></td>
                  <td className={styles.dateCell}>{new Date(b.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      {(STATUS_ACTIONS[b.status] || []).map((action) => (
                        <button
                          key={action.next}
                          className={`${styles.actionBtn} ${styles[action.cls]}`}
                          onClick={() => updateStatus(b.id, action.next)}
                          disabled={updating === b.id}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
