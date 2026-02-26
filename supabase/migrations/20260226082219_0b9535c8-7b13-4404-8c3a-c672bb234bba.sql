
-- Users table
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Public read/write since app uses email-based login, not Supabase Auth
CREATE POLICY "Anyone can read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Anyone can insert users" ON public.users FOR INSERT WITH CHECK (true);

-- Availability table
CREATE TABLE public.availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read availability" ON public.availability FOR SELECT USING (true);
CREATE POLICY "Anyone can insert availability" ON public.availability FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update availability" ON public.availability FOR UPDATE USING (true);

-- Matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_email TEXT NOT NULL,
  user2_email TEXT NOT NULL,
  shared_slot JSONB NOT NULL,
  week TEXT NOT NULL,
  matched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Anyone can insert matches" ON public.matches FOR INSERT WITH CHECK (true);

-- Seed initial users
INSERT INTO public.users (name, email) VALUES
  ('Alice', 'alice@fathom.dev'),
  ('admin', 'admin@fathom.dev'),
  ('Bob', 'bob@fathom.dev'),
  ('Charlie', 'charlie@fathom.dev'),
  ('Dana', 'dana@fathom.dev');

-- Enable pg_cron and pg_net for scheduled matching
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
