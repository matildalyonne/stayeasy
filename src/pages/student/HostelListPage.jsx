import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import HostelCard from '../../components/student/HostelCard'
import Spinner from '../../components/common/Spinner'
import styles from './HostelListPage.module.css'

const AMENITY_OPTIONS = ['wifi', 'electricity', 'water', 'security', 'parking', 'cafeteria']

export default function HostelListPage() {
  const [searchParams] = useSearchParams()
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    fetchHostels()
  }, [sortBy])

  const fetchHostels = async () => {
    setLoading(true)
    setError('')
    try {
      let q = supabase.from('hostels').select('*')

      if (sortBy === 'price_asc') q = q.order('price_per_semester', { ascending: true })
      else if (sortBy === 'price_desc') q = q.order('price_per_semester', { ascending: false })
      else if (sortBy === 'rating') q = q.order('avg_rating', { ascending: false })
      else q = q.order('created_at', { ascending: false })

      const { data, error } = await q
      if (error) setError(error.message)
      else setHostels(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load hostels.')
    } finally {
      setLoading(false)
    }
  }

  const toggleAmenity = (a) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )
  }

  const filtered = hostels.filter((h) => {
    const matchQuery =
      !query ||
      h.name.toLowerCase().includes(query.toLowerCase()) ||
      h.location.toLowerCase().includes(query.toLowerCase())
    const matchPrice = !maxPrice || Number(h.price_per_semester) <= Number(maxPrice)
    const matchAmenities =
      selectedAmenities.length === 0 ||
      selectedAmenities.every((a) => h.amenities?.includes(a))
    return matchQuery && matchPrice && matchAmenities
  })

  const clearFilters = () => {
    setQuery('')
    setMaxPrice('')
    setSelectedAmenities([])
  }

  const hasFilters = query || maxPrice || selectedAmenities.length > 0

  return (
    <div className={styles.page}>
      <div className="page-container">
        <div className={styles.topbar}>
          <div>
            <h1 className={styles.title}>Browse Hostels</h1>
            <p className={styles.count}>
              {loading ? 'Loading…' : `${filtered.length} hostel${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className={styles.topbarActions}>
            <div className={styles.searchWrap}>
              <Search size={16} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Search name or location…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <button
              className={`${styles.filterBtn} ${showFilters ? styles.filterBtnActive : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasFilters && <span className={styles.filterDot} />}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Max price per semester (UGX)</label>
              <input
                type="number"
                className={styles.filterInput}
                placeholder="e.g. 1500000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Amenities</label>
              <div className={styles.amenityToggles}>
                {AMENITY_OPTIONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`${styles.amenityToggle} ${selectedAmenities.includes(a) ? styles.amenityActive : ''}`}
                    onClick={() => toggleAmenity(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            {hasFilters && (
              <button className={styles.clearBtn} onClick={clearFilters}>
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className={styles.loadingWrap}><Spinner /></div>
        ) : error ? (
          <div className={styles.errorMsg}>
            <p>{error}</p>
            <button className={styles.clearBtn} onClick={fetchHostels} style={{ marginTop: 12 }}>
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <p>No hostels match your search.</p>
            {hasFilters && (
              <button className={styles.clearBtn} onClick={clearFilters}>Clear filters</button>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((h) => (
              <HostelCard key={h.id} hostel={h} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
