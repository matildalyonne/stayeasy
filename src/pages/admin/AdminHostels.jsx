import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import StarRating from '../../components/common/StarRating'
import styles from './AdminHostels.module.css'

export default function AdminHostels() {
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { fetchHostels() }, [])

  const fetchHostels = async () => {
    const { data } = await supabase
      .from('hostels')
      .select('*')
      .order('created_at', { ascending: false })
    setHostels(data || [])
    setLoading(false)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    await supabase.from('hostels').delete().eq('id', id)
    await fetchHostels()
    setDeleting(null)
  }

  if (loading) return <div className={styles.loadingWrap}><Spinner /></div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Hostels</h1>
        <Link to="/admin/hostels/new">
          <Button icon={<Plus size={16} />}>Add Hostel</Button>
        </Link>
      </div>

      {hostels.length === 0 ? (
        <div className={styles.empty}>
          <p>No hostels added yet.</p>
          <Link to="/admin/hostels/new">
            <Button icon={<Plus size={16} />}>Add your first hostel</Button>
          </Link>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Location</th>
                <th>Price / Sem</th>
                <th>Rooms</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hostels.map((h) => (
                <tr key={h.id}>
                  <td>
                    {h.photos?.[0] ? (
                      <img src={h.photos[0]} alt={h.name} className={styles.thumb} />
                    ) : (
                      <div className={styles.noThumb} />
                    )}
                  </td>
                  <td className={styles.nameCell}>{h.name}</td>
                  <td>
                    <span className={styles.location}><MapPin size={12} />{h.location}</span>
                  </td>
                  <td>UGX {Number(h.price_per_semester).toLocaleString()}</td>
                  <td>{h.available_rooms ?? '—'}</td>
                  <td>
                    <StarRating rating={h.avg_rating || 0} size={13} />
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link to={`/admin/hostels/${h.id}/edit`}>
                        <button className={styles.editBtn}><Pencil size={14} /></button>
                      </Link>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(h.id, h.name)}
                        disabled={deleting === h.id}
                      >
                        <Trash2 size={14} />
                      </button>
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
