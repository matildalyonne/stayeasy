import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, CalendarRange, CreditCard } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Spinner from '../../components/common/Spinner'
import styles from './BookingPage.module.css'

export default function BookingPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [hostel, setHostel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    semester: '',
    academic_year: '',
    room_type: '',
    special_requests: '',
    payment_method: 'mobile_money',
    phone_number: '',
  })

  useEffect(() => {
    supabase.from('hostels').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) setError(error.message)
      else setHostel(data)
      setLoading(false)
    })
  }, [id])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.semester || !form.academic_year) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.from('bookings').insert({
      hostel_id: id,
      user_id: user.id,
      semester: form.semester,
      academic_year: form.academic_year,
      room_type: form.room_type,
      special_requests: form.special_requests,
      payment_method: form.payment_method,
      phone_number: form.phone_number,
      status: 'pending',
      total_amount: hostel.price_per_semester,
    })
    setSubmitting(false)
    if (error) setError(error.message)
    else setSuccess(true)
  }

  if (loading) return <div className={styles.loadingWrap}><Spinner /></div>

  if (success) {
    return (
      <div className={styles.page}>
        <div className={`${styles.successCard} page-container`}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.successTitle}>Booking Submitted!</h1>
          <p className={styles.successMsg}>
            Your booking for <strong>{hostel?.name}</strong> has been received.
            The hostel will confirm your reservation shortly.
          </p>
          <div className={styles.successActions}>
            <Button onClick={() => navigate('/my-bookings')} size="lg">View My Bookings</Button>
            <Button onClick={() => navigate('/hostels')} variant="secondary" size="lg">Browse More</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={`page-container ${styles.inner}`}>
        <Link to={`/hostels/${id}`} className={styles.back}>
          <ChevronLeft size={16} /> Back to hostel
        </Link>

        <div className={styles.layout}>
          {/* Form */}
          <div className={styles.formSection}>
            <h1 className={styles.title}>Complete your booking</h1>
            <p className={styles.subtitle}>Fill in the details below to reserve your room at <strong>{hostel?.name}</strong>.</p>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <h3 className={styles.formSectionTitle}><CalendarRange size={16} /> Stay Details</h3>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Semester *</label>
                  <select name="semester" className={styles.select} value={form.semester} onChange={handleChange} required>
                    <option value="">Select semester</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Academic Year *</label>
                  <input
                    name="academic_year"
                    className={styles.input}
                    type="text"
                    placeholder="e.g. 2024/2025"
                    value={form.academic_year}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Room Type (if applicable)</label>
                <select name="room_type" className={styles.select} value={form.room_type} onChange={handleChange}>
                  <option value="">No preference</option>
                  <option value="single">Single Room</option>
                  <option value="double">Double Room</option>
                  <option value="shared">Shared Room</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Special Requests</label>
                <textarea
                  name="special_requests"
                  className={styles.textarea}
                  placeholder="Any special requirements or requests…"
                  value={form.special_requests}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <h3 className={styles.formSectionTitle}><CreditCard size={16} /> Payment Details</h3>

              <div className={styles.field}>
                <label className={styles.label}>Payment Method</label>
                <select name="payment_method" className={styles.select} value={form.payment_method} onChange={handleChange}>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash on Arrival</option>
                </select>
              </div>

              {form.payment_method === 'mobile_money' && (
                <Input
                  label="Mobile Money Number"
                  name="phone_number"
                  type="tel"
                  placeholder="07XX XXX XXX"
                  value={form.phone_number}
                  onChange={handleChange}
                />
              )}

              <Button type="submit" fullWidth loading={submitting} size="lg" variant="accent">
                Confirm Booking
              </Button>
            </form>
          </div>

          {/* Summary sidebar */}
          <aside className={styles.summary}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Booking Summary</h3>
              {hostel?.photos?.[0] && (
                <img src={hostel.photos[0]} alt={hostel.name} className={styles.summaryPhoto} />
              )}
              <p className={styles.summaryName}>{hostel?.name}</p>
              <p className={styles.summaryLocation}>{hostel?.location}</p>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryRow}>
                <span>Semester fee</span>
                <span className={styles.summaryAmount}>UGX {Number(hostel?.price_per_semester).toLocaleString()}</span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryRow}>
                <span className={styles.summaryTotalLabel}>Total</span>
                <span className={styles.summaryTotal}>UGX {Number(hostel?.price_per_semester).toLocaleString()}</span>
              </div>
              <p className={styles.summaryNote}>
                Your booking will be confirmed by the hostel administrator. You will be notified once confirmed.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
