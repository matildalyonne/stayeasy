import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} page-container`}>
        <div className={styles.brand}>
          <img src="/logo.png" alt="UniNest" className={styles.logo} />
          <span className={styles.name}>UniNest</span>
          <p className={styles.tagline}>Finding your home away from home.</p>
        </div>
        <div className={styles.links}>
          <Link to="/hostels">Browse Hostels</Link>
          <Link to="/login">Log In</Link>
          <Link to="/register">Sign Up</Link>
        </div>
        <p className={styles.copy}>© {new Date().getFullYear()} UniNest. All rights reserved.</p>
      </div>
    </footer>
  )
}
