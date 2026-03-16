-- ═══════════════════════════════════════════════
-- TRANSCRIPTIA — Supabase Schema
-- Collez ce SQL dans : Supabase > SQL Editor > New query
-- ═══════════════════════════════════════════════

-- 1. Profiles (utilisateurs)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text unique,
  plan text default 'free' check (plan in ('free','pro')),
  credits integer default 3,
  transcriptions_count integer default 0,
  banned boolean default false,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 2. Transcriptions
create table public.transcriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  url text not null,
  title text,
  channel text,
  duration text,
  transcript text,
  summary text,
  detected_lang text default 'Français',
  favorite boolean default false,
  tags text[] default '{}',
  share_id text unique default 'tx_' || gen_random_uuid()::text,
  created_at timestamptz default now()
);
alter table public.transcriptions enable row level security;
create policy "Users can CRUD own transcriptions" on public.transcriptions
  for all using (auth.uid() = user_id);
create policy "Public share access" on public.transcriptions
  for select using (share_id is not null);

-- 3. Subscriptions
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text default 'free',
  status text default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz default now()
);
alter table public.subscriptions enable row level security;
create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);

-- 4. Reviews / Avis
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  author text not null,
  role text,
  text text not null,
  stars integer default 5 check (stars between 1 and 5),
  visible boolean default true,
  created_at timestamptz default now()
);
-- Admin only (no RLS pour simplifier, géré par anon key en lecture seule)
alter table public.reviews enable row level security;
create policy "Public can read visible reviews" on public.reviews for select using (visible = true);

-- 5. Promo codes
create table public.promo_codes (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  discount text not null,
  type text default 'monthly',
  uses integer default 0,
  max_uses integer default 100,
  active boolean default true,
  expires_at date,
  created_at timestamptz default now()
);

-- 6. Site config (bannière, maintenance, compteur)
create table public.site_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);
insert into public.site_config (key, value) values
  ('banner', '{"enabled":true,"text":"🎉 Offre de lancement — 50% sur le plan annuel","bg":"#0A0A0A","darkText":false,"link":"","linkLabel":"En profiter →"}'),
  ('maintenance', '{"enabled":false,"title":"Site en maintenance","message":"Nous revenons bientôt.","estimatedTime":""}'),
  ('counter', '{"min":100,"max":2000}');

-- 7. Fonction pour incrémenter les transcriptions
create or replace function increment_transcriptions(user_uuid uuid)
returns void language plpgsql security definer as $$
begin
  update public.profiles
  set transcriptions_count = transcriptions_count + 1,
      credits = greatest(0, credits - 1)
  where id = user_uuid and plan = 'free';
  
  update public.profiles
  set transcriptions_count = transcriptions_count + 1
  where id = user_uuid and plan = 'pro';
end;
$$;
