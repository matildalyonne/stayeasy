import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, MapPin, Star, Shield, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Button from '../../components/common/Button'
import HostelCard from '../../components/student/HostelCard'
import Spinner from '../../components/common/Spinner'
import styles from './HomePage.module.css'

const FEATURES = [
  { icon: <Search size={22} />, title: 'Easy Search', desc: 'Filter hostels by price, location, and amenities to find your perfect match.' },
  { icon: <Shield size={22} />, title: 'Verified Listings', desc: 'All hostels are reviewed and verified before appearing on the platform.' },
  { icon: <Star size={22} />, title: 'Student Reviews', desc: 'Real ratings from students who have lived in the hostels.' },
  { icon: <Zap size={22} />, title: 'Instant Booking', desc: 'Book your spot in minutes with secure online payments.' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [featured, setFeatured] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await supabase
          .from('hostels')
          .select('*')
          .eq('is_featured', true)
          .order('avg_rating', { ascending: false })
          .limit(6)
        setFeatured(data || [])
      } catch (_) {}
      finally { setFeaturedLoading(false) }
    }
    fetchFeatured()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/hostels${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`${styles.heroInner} page-container`}>
          <div className={styles.heroBadge}>
            <MapPin size={13} /> Student housing made simple
          </div>
          <h1 className={styles.heroTitle}>
            Find your <span className={styles.heroAccent}>perfect hostel</span><br />
            near campus
          </h1>
          <p className={styles.heroSub}>
            Browse verified hostels, compare prices and amenities, and book your space — all in one place.
          </p>
          <form onSubmit={handleSearch} className={styles.searchBar}>
            <div className={styles.searchInput}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name or location…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg">Search Hostels</Button>
          </form>
        </div>
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.blob1} />
          <div className={styles.blob2} />
        </div>
      </section>

      {/* Top Rated */}
      <section className={styles.featured}>
        <div className="page-container">
          <div className={styles.featuredHeader}>
            <div>
              <div className={styles.featuredBadge}><Star size={13} fill="currentColor" /> Top Rated</div>
              <h2 className={styles.sectionTitle}>Hostels students love</h2>
            </div>
            <Link to="/hostels" className={styles.seeAll}>See all hostels →</Link>
          </div>

          {featuredLoading ? (
            <div className={styles.featuredLoading}><Spinner /></div>
          ) : featured.length === 0 ? (
            <p className={styles.featuredEmpty}>No featured hostels yet.</p>
          ) : (
            <div className={styles.featuredGrid}>
              {featured.map((h) => (
                <HostelCard key={h.id} hostel={h} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className="page-container">
          <h2 className={styles.sectionTitle}>Why students choose UniNest</h2>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureName}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className="page-container">
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>Ready to find your home?</h2>
            <p className={styles.ctaSub}>Browse all available hostels and book today.</p>
            <Button onClick={() => navigate('/hostels')} size="lg" variant="accent">
              Browse Hostels
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
