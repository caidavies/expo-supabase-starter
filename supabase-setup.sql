-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

-- Create profiles table for user profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, phone, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NEW.phone, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 

-- Prompts table for conversation starters
CREATE TABLE public.prompts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  question text NOT NULL UNIQUE,
  category text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT prompts_pkey PRIMARY KEY (id)
);

-- User prompts table for storing user responses
CREATE TABLE public.user_prompts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  prompt_id uuid NOT NULL,
  answer text NOT NULL,
  order_index integer NOT NULL CHECK (order_index >= 0 AND order_index <= 2),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_prompts_pkey PRIMARY KEY (id),
  CONSTRAINT user_prompts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT user_prompts_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES public.prompts(id),
  CONSTRAINT user_prompts_user_order_unique UNIQUE (user_id, order_index)
);

-- Insert sample prompts
INSERT INTO public.prompts (question, category) VALUES
  ('What''s your ideal first date?', 'Dating'),
  ('What''s your love language?', 'Dating'),
  ('What''s your biggest dating red flag?', 'Dating'),
  ('What''s your biggest dating green flag?', 'Dating'),
  ('What''s your ideal Sunday morning?', 'Dating'),
  ('What''s your most controversial opinion?', 'Personality'),
  ('What''s your biggest fear?', 'Personality'),
  ('What''s your biggest strength?', 'Personality'),
  ('What''s your biggest weakness?', 'Personality'),
  ('What''s your biggest pet peeve?', 'Personality'),
  ('What''s your biggest accomplishment?', 'Personality'),
  ('What''s your biggest regret?', 'Personality'),
  ('What''s your most used emoji?', 'Fun'),
  ('What''s your most controversial food opinion?', 'Fun'),
  ('What''s your most embarrassing moment?', 'Fun'),
  ('What''s your most irrational fear?', 'Fun'),
  ('What''s your most used app?', 'Fun'),
  ('What''s your most controversial movie opinion?', 'Fun'),
  ('What''s your biggest life goal?', 'Life'),
  ('What''s your biggest deal breaker?', 'Life'),
  ('What''s your biggest turn on?', 'Life'),
  ('What''s your biggest turn off?', 'Life'),
  ('What''s your biggest passion?', 'Life'),
  ('What''s your biggest dream?', 'Life'); 

-- Areas table for Istanbul districts
CREATE TABLE public.areas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  region text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT areas_pkey PRIMARY KEY (id),
  CONSTRAINT areas_name_unique UNIQUE (name)
);

-- Insert Istanbul districts organized by region
INSERT INTO public.areas (name, region) VALUES
  -- European Side - Central
  ('Beyoğlu', 'European Side - Central'),
  ('Fatih', 'European Side - Central'),
  ('Şişli', 'European Side - Central'),
  ('Beşiktaş', 'European Side - Central'),
  ('Kadıköy', 'European Side - Central'),
  ('Üsküdar', 'European Side - Central'),
  
  -- European Side - North
  ('Sarıyer', 'European Side - North'),
  ('Eyüpsultan', 'European Side - North'),
  ('Kağıthane', 'European Side - North'),
  ('Sultangazi', 'European Side - North'),
  ('Gaziosmanpaşa', 'European Side - North'),
  ('Bayrampaşa', 'European Side - North'),
  ('Esenler', 'European Side - North'),
  ('Bağcılar', 'European Side - North'),
  ('Güngören', 'European Side - North'),
  ('Küçükçekmece', 'European Side - North'),
  ('Avcılar', 'European Side - North'),
  ('Esenyurt', 'European Side - North'),
  ('Büyükçekmece', 'European Side - North'),
  ('Çatalca', 'European Side - North'),
  ('Silivri', 'European Side - North'),
  
  -- European Side - West
  ('Bakırköy', 'European Side - West'),
  ('Zeytinburnu', 'European Side - West'),
  ('Bahçelievler', 'European Side - West'),
  ('Küçükçekmece', 'European Side - West'),
  ('Avcılar', 'European Side - West'),
  ('Esenyurt', 'European Side - West'),
  ('Büyükçekmece', 'European Side - West'),
  
  -- Asian Side - Central
  ('Kadıköy', 'Asian Side - Central'),
  ('Üsküdar', 'Asian Side - Central'),
  ('Maltepe', 'Asian Side - Central'),
  ('Kartal', 'Asian Side - Central'),
  ('Pendik', 'Asian Side - Central'),
  ('Tuzla', 'Asian Side - Central'),
  
  -- Asian Side - North
  ('Beykoz', 'Asian Side - North'),
  ('Çekmeköy', 'Asian Side - North'),
  ('Sancaktepe', 'Asian Side - North'),
  ('Sultanbeyli', 'Asian Side - North'),
  ('Pendik', 'Asian Side - North'),
  
  -- Asian Side - South
  ('Maltepe', 'Asian Side - South'),
  ('Kartal', 'Asian Side - South'),
  ('Pendik', 'Asian Side - South'),
  ('Tuzla', 'Asian Side - South'),
  ('Çatalca', 'Asian Side - South'); 