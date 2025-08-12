-- Complete Dating Areas Setup
-- This script sets up all necessary tables and columns for dating area preferences

-- 1. Ensure areas table exists and has correct data
CREATE TABLE IF NOT EXISTS public.areas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  region text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT areas_pkey PRIMARY KEY (id),
  CONSTRAINT areas_name_unique UNIQUE (name)
);

-- Clear and re-insert areas data (fixing duplicates)
TRUNCATE TABLE public.areas;

INSERT INTO public.areas (name, region) VALUES
  -- European Side - Central
  ('Beyoğlu', 'European Side - Central'),
  ('Fatih', 'European Side - Central'),
  ('Şişli', 'European Side - Central'),
  ('Beşiktaş', 'European Side - Central'),
  
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
  ('Büyükçekmece', 'European Side - West'),
  ('Çatalca', 'European Side - West'),
  ('Silivri', 'European Side - West'),
  
  -- European Side - West
  ('Bakırköy', 'European Side - West'),
  ('Zeytinburnu', 'European Side - West'),
  ('Bahçelievler', 'European Side - West'),
  
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
  
  -- Asian Side - South
  ('Çanakkale', 'Asian Side - South');

-- 2. Ensure user_dating_preferences table exists
CREATE TABLE IF NOT EXISTS public.user_dating_preferences (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  sexuality text,
  relationship_type text CHECK (relationship_type = ANY (ARRAY['monogamous'::text, 'open'::text, 'polyamorous'::text])),
  dating_intention text CHECK (dating_intention = ANY (ARRAY['serious'::text, 'casual'::text, 'fun'::text, 'long_term'::text])),
  smoking_preference text,
  drinking_preference text,
  children_preference text,
  pet_preference text,
  religion_importance text,
  max_distance_km integer DEFAULT 20,
  age_range_min integer DEFAULT 18,
  age_range_max integer DEFAULT 65,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_dating_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_dating_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 3. Add preferred_areas column to user_dating_preferences table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_dating_preferences' 
                   AND column_name = 'preferred_areas') THEN
        ALTER TABLE public.user_dating_preferences ADD COLUMN preferred_areas text[];
    END IF;
END $$;

-- 4. Add preferred_dating_areas column to user_profiles table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' 
                   AND column_name = 'preferred_dating_areas') THEN
        ALTER TABLE public.user_profiles ADD COLUMN preferred_dating_areas text[];
    END IF;
END $$;

-- 5. Add current_location column to user_profiles table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' 
                   AND column_name = 'current_location') THEN
        ALTER TABLE public.user_profiles ADD COLUMN current_location text;
    END IF;
END $$;

-- 6. Add indexes for better performance (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_dating_preferences_preferred_areas') THEN
        CREATE INDEX idx_user_dating_preferences_preferred_areas 
        ON public.user_dating_preferences USING GIN (preferred_areas);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_preferred_dating_areas') THEN
        CREATE INDEX idx_user_profiles_preferred_dating_areas 
        ON public.user_profiles USING GIN (preferred_dating_areas);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_current_location') THEN
        CREATE INDEX idx_user_profiles_current_location 
        ON public.user_profiles(current_location);
    END IF;
END $$;

-- 7. Add comments for documentation
COMMENT ON COLUMN public.user_dating_preferences.preferred_areas IS 'Array of area names where user would like to date';
COMMENT ON COLUMN public.user_profiles.preferred_dating_areas IS 'Array of area names where user would like to date (duplicate for quick access)';
COMMENT ON COLUMN public.user_profiles.current_location IS 'Stores the district ID from areas table for user location';

-- 8. Create or update the updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers for updated_at (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_dating_preferences_updated_at') THEN
        CREATE TRIGGER update_user_dating_preferences_updated_at
            BEFORE UPDATE ON public.user_dating_preferences
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at') THEN
        CREATE TRIGGER update_user_profiles_updated_at
            BEFORE UPDATE ON public.user_profiles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 10. Enable RLS on new tables
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dating_preferences ENABLE ROW LEVEL SECURITY;

-- 11. Create basic RLS policies
CREATE POLICY "Users can view all areas" ON public.areas FOR SELECT USING (true);

CREATE POLICY "Users can view own dating preferences" ON public.user_dating_preferences
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own dating preferences" ON public.user_dating_preferences
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own dating preferences" ON public.user_dating_preferences
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 12. Verify the setup
SELECT 'Setup complete! Tables and columns created successfully.' as status;
SELECT COUNT(*) as areas_count FROM public.areas;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'user_dating_preferences' AND column_name = 'preferred_areas';
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name IN ('preferred_dating_areas', 'current_location');
