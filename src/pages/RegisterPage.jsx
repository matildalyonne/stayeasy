import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await signUp(form.email, form.password, { full_name: form.fullName, role: 'student' })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.title}>Check your email</h1>
          <p className={styles.subtitle}>
            We sent a confirmation link to <strong>{form.email}</strong>.
            Click it to activate your account.
          </p>
          <Button onClick={() => navigate('/login')} fullWidth variant="secondary">
            Back to login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logoWrap}>
          <img src="/logo.png" alt="Stay-Eazy" className={styles.logo} />
          <span className={styles.logoText}>Stay-Eazy</span>
        </Link>

        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Find and book your ideal student hostel</p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Full name"
            type="text"
            name="fullName"
            placeholder="Jane Namukasa"
            value={form.fullName}
            onChange={handleChange}
            icon={<User size={16} />}
            required
          />
          <Input
            label="Email address"
            type="email"
            name="email"
            placeholder="you@university.ac.ug"
            value={form.email}
            onChange={handleChange}
            icon={<Mail size={16} />}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
            icon={<Lock size={16} />}
            required
          />
          <Input
            label="Confirm password"
            type="password"
            name="confirm"
            placeholder="Repeat password"
            value={form.confirm}
            onChange={handleChange}
            icon={<Lock size={16} />}
            required
          />
          <Button type="submit" fullWidth loading={loading} size="lg" variant="accent">
            Create account
          </Button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.switchLink}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
