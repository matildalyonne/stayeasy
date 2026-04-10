# UniNest — Student Hostel Booking Platform

A full-stack hostel booking service for university students, built with **React + Vite** (frontend) and **Supabase** (backend), deployed on **Netlify**.

---

## Project Structure

```
hostel-booking/
├── public/
│   └── logo.png                  ← Add your logo here
├── src/
│   ├── components/
│   │   ├── common/               ← Shared UI (Navbar, Footer, Button, Input…)
│   │   └── student/              ← Student-facing components (HostelCard)
│   ├── context/
│   │   └── AuthContext.jsx       ← Auth state (user, signIn, signOut, isAdmin)
│   ├── lib/
│   │   └── supabase.js           ← Supabase client
│   ├── pages/
│   │   ├── student/              ← Home, HostelList, HostelDetail, Booking, MyBookings
│   │   ├── admin/                ← Dashboard, Hostels CRUD, Bookings management
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── App.jsx                   ← Router
│   └── main.jsx
├── supabase_schema.sql           ← Run this in Supabase SQL Editor
├── netlify.toml                  ← SPA redirect rule
└── .env.example                  ← Copy to .env and fill in your keys
```

---

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase_schema.sql`
3. Go to **Storage > Buckets**, create a bucket named `hostel-images`, set it to **public**
4. Copy your **Project URL** and **Anon Key** from **Settings > API**

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Deploy to Netlify

1. Push your repo to GitHub
2. Connect the repo in [Netlify](https://netlify.com)
3. Set build command: `npm run build`, publish directory: `dist`
4. Add your environment variables in **Site Settings > Environment Variables**
5. The `netlify.toml` already handles SPA routing

---

## Creating an Admin Account

Supabase doesn't expose role setting in the default sign-up UI, so to create an admin:

1. Go to **Supabase Dashboard > Authentication > Users**
2. Create a user manually, or sign up normally then:
3. Go to **Table Editor > profiles**, find the user's row, and change `role` from `student` to `admin`

Alternatively, when signing up programmatically, pass `role: 'admin'` in the metadata.

---

## Features

### Student
- Browse and search hostels by name/location
- Filter by max price and amenities
- Sort by price (asc/desc), rating, or newest
- View hostel details with photo gallery & lightbox
- Leave and update star ratings with comments
- Book a hostel (semester, room type, payment method)
- View and cancel own bookings

### Admin
- Dashboard with stats (total hostels, bookings, pending, confirmed)
- Create, edit, and delete hostels
- Upload photos via file upload or URL
- Manage amenities with checkbox UI
- View all bookings filtered by status
- Confirm or reject bookings

---

## Database Tables

| Table      | Purpose                          |
|------------|----------------------------------|
| `profiles` | Extended user data (name, role)  |
| `hostels`  | Hostel listings                  |
| `reviews`  | Student ratings & comments       |
| `bookings` | Reservation records              |

---

## Adding Your Logo

Place your logo file at `public/logo.png`. It will appear in the navbar, footer, login/register pages, and browser tab icon.
