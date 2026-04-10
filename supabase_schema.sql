-- ============================================================
-- UniNest - Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ── Profiles ────────────────────────────────────────────────
-- Mirrors auth.users with public metadata
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'student', -- 'student' | 'admin'
  created_at  timestamptz default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Hostels ─────────────────────────────────────────────────
create table if not exists public.hostels (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  location            text not null,
  description         text,
  price_per_semester  numeric not null,
  available_rooms     integer,
  amenities           text[] default '{}',
  photos              text[] default '{}',   -- array of public URLs
  contact_info        text,
  avg_rating          numeric default 0,
  rating_count        integer default 0,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── Reviews ─────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  hostel_id   uuid not null references public.hostels(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now(),
  unique (hostel_id, user_id)   -- one review per student per hostel
);

-- Recalculate avg_rating + rating_count on hostel after review insert/update/delete
create or replace function public.update_hostel_rating()
returns trigger language plpgsql as $$
declare
  h_id uuid;
begin
  h_id := coalesce(new.hostel_id, old.hostel_id);
  update public.hostels
  set
    avg_rating   = (select coalesce(avg(rating), 0) from public.reviews where hostel_id = h_id),
    rating_count = (select count(*)                 from public.reviews where hostel_id = h_id),
    updated_at   = now()
  where id = h_id;
  return null;
end;
$$;

drop trigger if exists on_review_change on public.reviews;
create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute procedure public.update_hostel_rating();

-- ── Bookings ─────────────────────────────────────────────────
create table if not exists public.bookings (
  id               uuid primary key default gen_random_uuid(),
  hostel_id        uuid not null references public.hostels(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  semester         text not null,          -- 'Semester 1' | 'Semester 2'
  academic_year    text not null,          -- e.g. '2024/2025'
  room_type        text,                   -- 'single' | 'double' | 'shared'
  special_requests text,
  payment_method   text default 'mobile_money',
  phone_number     text,
  total_amount     numeric,
  status           text not null default 'pending'
                   check (status in ('pending','confirmed','rejected','cancelled')),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── Storage bucket ───────────────────────────────────────────
-- Create a public bucket named "hostel-images" in Storage > Buckets
-- Then add this policy so anyone can read, only authenticated can upload:

-- insert into storage.buckets (id, name, public) values ('hostel-images', 'hostel-images', true);

-- ── Row Level Security ───────────────────────────────────────

alter table public.profiles  enable row level security;
alter table public.hostels   enable row level security;
alter table public.reviews   enable row level security;
alter table public.bookings  enable row level security;

-- profiles
create policy "Users can view all profiles"      on public.profiles for select using (true);
create policy "Users can update own profile"     on public.profiles for update using (auth.uid() = id);

-- hostels: public read, admin write
create policy "Anyone can view hostels"          on public.hostels for select using (true);
create policy "Admins can insert hostels"        on public.hostels for insert
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');
create policy "Admins can update hostels"        on public.hostels for update
  using ((select role from public.profiles where id = auth.uid()) = 'admin');
create policy "Admins can delete hostels"        on public.hostels for delete
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- reviews
create policy "Anyone can view reviews"          on public.reviews for select using (true);
create policy "Authenticated users can review"   on public.reviews for insert
  with check (auth.uid() = user_id);
create policy "Users can update own review"      on public.reviews for update
  using (auth.uid() = user_id);

-- bookings
create policy "Students see own bookings"        on public.bookings for select
  using (
    auth.uid() = user_id
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );
create policy "Students can create bookings"     on public.bookings for insert
  with check (auth.uid() = user_id);
create policy "Students can cancel own bookings" on public.bookings for update
  using (
    auth.uid() = user_id
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );
