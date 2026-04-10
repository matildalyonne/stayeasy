import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import styles from './StudentLayout.module.css'

export default function StudentLayout() {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
