import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, X, BookOpen, LogOut, User } from 'lucide-react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <header className={styles.header}>
      <div className={`${styles.inner} page-container`}>
        <Link to="/" className={styles.logo}>
          <img src="/logo.png" alt="UniNest" className={styles.logoImg} />
          <span className={styles.logoText}>UniNest</span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <NavLink to="/hostels" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={() => setMenuOpen(false)}>
            Browse Hostels
          </NavLink>
          {user && (
            <NavLink to="/my-bookings" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={() => setMenuOpen(false)}>
              My Bookings
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={() => setMenuOpen(false)}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className={styles.actions}>
          {user ? (
            <div className={styles.userMenu}>
              <span className={styles.userEmail}>
                <User size={14} />
                {user.email?.split('@')[0]}
              </span>
              <button onClick={handleSignOut} className={styles.signOutBtn}>
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login" className={styles.loginBtn}>Log in</Link>
              <Link to="/register" className={styles.registerBtn}>Sign up</Link>
            </div>
          )}
        </div>

        <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  )
}
