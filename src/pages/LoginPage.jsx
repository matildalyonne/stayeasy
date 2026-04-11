import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error } = await signIn(form.email, form.password)
      if (error) {
        setError(error.message)
      } else {
        const role = data?.user?.user_metadata?.role
        if (role === 'admin') {
          navigate('/admin', { replace: true })
        } else {
          navigate(from && from !== '/login' ? from : '/', { replace: true })
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logoWrap}>
          <img src="/logo.png" alt="UniNest" className={styles.logo} />
          <span className={styles.logoText}>Stay-Eazy</span>
        </Link>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to your student account</p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
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
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            icon={<Lock size={16} />}
            required
          />
          <Button type="submit" fullWidth loading={loading} size="lg">
            Log in
          </Button>
        </form>

        <p className={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.switchLink}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
