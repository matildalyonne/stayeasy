import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ChevronLeft, Plus, X, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Spinner from '../../components/common/Spinner'
import styles from './AdminHostelForm.module.css'

const AMENITY_OPTIONS = ['wifi', 'electricity', 'water', 'security', 'parking', 'cafeteria']

const EMPTY_FORM = {
  name: '',
  location: '',
  description: '',
  price_per_semester: '',
  available_rooms: '',
  amenities: [],
  contact_info: '',
  photos: [],
}

export default function AdminHostelForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    const fetchHostel = async () => {
      try {
        const { data, error } = await supabase
          .from('hostels').select('*').eq('id', id).single()
        if (error) { setError(error.message); return }
        setForm({
          name: data.name || '',
          location: data.location || '',
          description: data.description || '',
          price_per_semester: data.price_per_semester || '',
          available_rooms: data.available_rooms ?? '',
          amenities: data.amenities || [],
          contact_info: data.contact_info || '',
          photos: data.photos || [],
        })
      } catch (err) {
        setError(err.message || 'Failed to load hostel.')
      } finally {
        setLoading(false)
      }
    }
    fetchHostel()
  }, [id])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }))
  }

  const addPhotoUrl = () => {
    const url = photoUrl.trim()
    if (!url) return
    setForm((f) => ({ ...f, photos: [...f.photos, url] }))
    setPhotoUrl('')
  }

  const removePhoto = (idx) => {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `hostel-photos/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('hostel-images').upload(path, file, { upsert: true })
      if (uploadError) { setError('Upload failed: ' + uploadError.message); return }
      const { data: urlData } = supabase.storage.from('hostel-images').getPublicUrl(path)
      setForm((f) => ({ ...f, photos: [...f.photos, urlData.publicUrl] }))
    } catch (err) {
      setError('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.location || !form.price_per_semester) {
      setError('Name, location, and price are required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price_per_semester: Number(form.price_per_semester),
        available_rooms: form.available_rooms !== '' ? Number(form.available_rooms) : null,
      }
      const { error } = isEdit
        ? await supabase.from('hostels').update(payload).eq('id', id)
        : await supabase.from('hostels').insert(payload)
      if (error) setError(error.message)
      else navigate('/admin/hostels')
    } catch (err) {
      setError(err.message || 'Failed to save hostel.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className={styles.loadingWrap}><Spinner /></div>

  return (
    <div className={styles.page}>
      <Link to="/admin/hostels" className={styles.back}>
        <ChevronLeft size={16} /> Back to hostels
      </Link>

      <h1 className={styles.title}>{isEdit ? 'Edit Hostel' : 'Add New Hostel'}</h1>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>
          <div className={styles.grid2}>
            <Input label="Hostel Name *" name="name" placeholder="e.g. Makerere View Hostel"
              value={form.name} onChange={handleChange} required />
            <Input label="Location / Address *" name="location" placeholder="e.g. Wandegeya, Kampala"
              value={form.location} onChange={handleChange} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea name="description" className={styles.textarea}
              placeholder="Describe the hostel…" value={form.description}
              onChange={handleChange} rows={4} />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Pricing & Availability</h2>
          <div className={styles.grid2}>
            <Input label="Price per Semester (UGX) *" name="price_per_semester" type="number"
              placeholder="e.g. 1200000" value={form.price_per_semester} onChange={handleChange} required />
            <Input label="Available Rooms" name="available_rooms" type="number"
              placeholder="e.g. 20" value={form.available_rooms} onChange={handleChange} />
          </div>
          <Input label="Contact Info" name="contact_info"
            placeholder="Phone number or email for inquiries"
            value={form.contact_info} onChange={handleChange} />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Amenities</h2>
          <div className={styles.amenityGrid}>
            {AMENITY_OPTIONS.map((a) => (
              <label key={a} className={`${styles.amenityOption} ${form.amenities.includes(a) ? styles.amenityChecked : ''}`}>
                <input type="checkbox" className={styles.srOnly}
                  checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                <span className={styles.amenityCheckmark}>{form.amenities.includes(a) ? '✓' : ''}</span>
                <span style={{ textTransform: 'capitalize' }}>{a}</span>
              </label>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Photos</h2>
          <div className={styles.uploadWrap}>
            <label className={styles.uploadLabel}>
              <Upload size={16} />
              {uploading ? 'Uploading…' : 'Upload from device'}
              <input type="file" accept="image/*" onChange={handleFileUpload}
                className={styles.srOnly} disabled={uploading} />
            </label>
          </div>
          <div className={styles.urlRow}>
            <input type="url" className={styles.urlInput}
              placeholder="Or paste an image URL…"
              value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhotoUrl())} />
            <button type="button" className={styles.addUrlBtn} onClick={addPhotoUrl}>
              <Plus size={16} /> Add
            </button>
          </div>
          {form.photos.length > 0 && (
            <div className={styles.photoGrid}>
              {form.photos.map((p, i) => (
                <div key={i} className={styles.photoItem}>
                  <img src={p} alt={`Photo ${i + 1}`} />
                  <button type="button" className={styles.removePhoto} onClick={() => removePhoto(i)}>
                    <X size={12} />
                  </button>
                  {i === 0 && <span className={styles.coverBadge}>Cover</span>}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className={styles.formActions}>
          <Link to="/admin/hostels">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" loading={saving}>
            {isEdit ? 'Save Changes' : 'Create Hostel'}
          </Button>
        </div>
      </form>
    </div>
  )
}
