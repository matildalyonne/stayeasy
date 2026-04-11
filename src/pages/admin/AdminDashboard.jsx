import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, CalendarCheck, Clock, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/common/Spinner'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [hostelsRes, bookingsRes, recentRes] = await Promise.all([
        supabase.from('hostels').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id, status'),
        supabase
          .from('bookings')
          .select('*, hostels(name), profiles!bookings_user_id_fkey(full_name)')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const allBookings = bookingsRes.data || []
      setStats({
        totalHostels: hostelsRes.count || 0,
        totalBookings: allBookings.length,
        pendingBookings: allBookings.filter((b) => b.status === 'pending').length,
        confirmedBookings: allBookings.filter((b) => b.status === 'confirmed').length,
      })
      setRecentBookings(recentRes.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className={styles.loadingWrap}><Spinner /></div>
  if (error) return <div className={styles.loadingWrap}><p style={{color:'var(--danger)'}}>{error}</p></div>

  const cards = [
    { label: 'Total Hostels', value: stats.totalHostels, icon: <Building2 size={20} />, color: 'blue', to: '/admin/hostels' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: <CalendarCheck size={20} />, color: 'green', to: '/admin/bookings' },
    { label: 'Pending', value: stats.pendingBookings, icon: <Clock size={20} />, color: 'amber', to: '/admin/bookings' },
    { label: 'Confirmed', value: stats.confirmedBookings, icon: <CheckCircle size={20} />, color: 'teal', to: '/admin/bookings' },
  ]

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.statsGrid}>
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className={`${styles.statCard} ${styles[c.color]}`}>
            <div className={styles.statIcon}>{c.icon}</div>
            <div>
              <p className={styles.statValue}>{c.value}</p>
              <p className={styles.statLabel}>{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Bookings</h2>
          <Link to="/admin/bookings" className={styles.seeAll}>See all →</Link>
        </div>

        {recentBookings.length === 0 ? (
          <p className={styles.empty}>No bookings yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Hostel</th>
                  <th>Semester</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.profiles?.full_name || b.user_id?.slice(0, 8) || '—'}</td>
                    <td>{b.hostels?.name || '—'}</td>
                    <td>{b.semester} · {b.academic_year}</td>
                    <td><span className={`${styles.badge} ${styles[b.status]}`}>{b.status}</span></td>
                    <td>{new Date(b.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
