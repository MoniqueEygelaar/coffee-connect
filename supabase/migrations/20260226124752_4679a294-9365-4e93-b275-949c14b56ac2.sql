ALTER TABLE public.matches 
ADD COLUMN user1_status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN user2_status TEXT NOT NULL DEFAULT 'pending';