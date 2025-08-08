-- Drop existing tables to start fresh
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_interests CASCADE;
DROP TABLE IF EXISTS user_interactions CASCADE;
DROP TABLE IF EXISTS user_analytics CASCADE;
DROP TABLE IF EXISTS match_history CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS interests CASCADE;

-- CORE USER TABLE (Minimal for auth/identity)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  
  -- Core identity (needed for matching)
  first_name text NOT NULL,
  last_name text,
  birthdate date NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'non-binary', 'other')),
  
  -- Core location (needed for matching)
  current_location text,
  
  -- Meta fields
  is_active boolean DEFAULT true,
  profile_completion_percentage integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- EXTENDED PROFILE (Display information)
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  bio text,
  height_cm integer,
  hometown text,
  work text,
  education text,
  
  -- Lifestyle basics (for profile display)
  religion text,
  smoking text,
  drinking text,
  
  -- Profile media
  profile_photo_url text,
  additional_photos jsonb DEFAULT '[]'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- INTERESTS/HOBBIES (For profile display & matching)
CREATE TABLE interests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category text NOT NULL, -- 'hobbies', 'sports', 'music', 'travel', etc.
  name text NOT NULL UNIQUE,
  icon text, -- emoji or icon identifier
  created_at timestamptz DEFAULT now()
);

CREATE TABLE user_interests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interest_id uuid NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
  intensity_level integer DEFAULT 3 CHECK (intensity_level BETWEEN 1 AND 5), -- 1-5 how much they're into it
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, interest_id)
);

-- DATING PREFERENCES (Clean version of your preferences)
CREATE TABLE user_dating_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Relationship preferences
  sexuality text,
  relationship_type text CHECK (relationship_type IN ('monogamous', 'open', 'polyamorous')),
  dating_intention text CHECK (dating_intention IN ('serious', 'casual', 'fun', 'long_term')),
  
  -- Lifestyle compatibility preferences
  smoking_preference text,
  drinking_preference text,
  children_preference text,
  pet_preference text,
  religion_importance text,
  
  -- Logistical preferences
  max_distance_km integer DEFAULT 20,
  age_range_min integer DEFAULT 18,
  age_range_max integer DEFAULT 65,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- APP PREFERENCES (Notifications, privacy, etc.)
CREATE TABLE user_app_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification preferences
  push_notifications boolean DEFAULT true,
  email_notifications boolean DEFAULT false,
  marketing_emails boolean DEFAULT false,
  analytics_sharing boolean DEFAULT false,
  
  -- Privacy preferences
  profile_visibility text DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  show_online_status boolean DEFAULT true,
  
  -- App behavior
  auto_swipe_enabled boolean DEFAULT false,
  daily_match_limit integer DEFAULT 50,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dating_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_app_preferences ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

-- User interests policies
CREATE POLICY "Users can view own interests" ON user_interests
  FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));
CREATE POLICY "Users can manage own interests" ON user_interests
  FOR ALL USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

-- Dating preferences policies
CREATE POLICY "Users can view own dating preferences" ON user_dating_preferences
  FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));
CREATE POLICY "Users can manage own dating preferences" ON user_dating_preferences
  FOR ALL USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

-- App preferences policies
CREATE POLICY "Users can view own app preferences" ON user_app_preferences
  FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));
CREATE POLICY "Users can manage own app preferences" ON user_app_preferences
  FOR ALL USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

-- Interests table is public readable
CREATE POLICY "Anyone can view interests" ON interests FOR SELECT USING (true);

-- INDEXES for performance
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_location ON users(current_location);
CREATE INDEX idx_users_gender_age ON users(gender, birthdate);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX idx_user_interests_interest_id ON user_interests(interest_id);
CREATE INDEX idx_interests_category ON interests(category);

-- SAMPLE INTERESTS DATA
INSERT INTO interests (category, name, icon) VALUES
-- Hobbies
('hobbies', 'Photography', '📷'),
('hobbies', 'Cooking', '👨‍🍳'),
('hobbies', 'Reading', '📚'),
('hobbies', 'Gaming', '🎮'),
('hobbies', 'Art & Drawing', '🎨'),
('hobbies', 'Writing', '✍️'),
('hobbies', 'Gardening', '🌱'),

-- Sports & Fitness
('sports', 'Football', '⚽'),
('sports', 'Basketball', '🏀'),
('sports', 'Tennis', '🎾'),
('sports', 'Swimming', '🏊'),
('sports', 'Running', '🏃'),
('sports', 'Gym & Fitness', '💪'),
('sports', 'Yoga', '🧘'),
('sports', 'Cycling', '🚴'),

-- Music & Arts
('music', 'Rock', '🎸'),
('music', 'Jazz', '🎷'),
('music', 'Electronic', '🎧'),
('music', 'Classical', '🎼'),
('music', 'Hip Hop', '🎤'),
('music', 'Playing Instruments', '🎹'),

-- Travel & Adventure
('travel', 'Beach Destinations', '🏖️'),
('travel', 'Mountain Adventures', '🏔️'),
('travel', 'City Exploration', '🏙️'),
('travel', 'Backpacking', '🎒'),
('travel', 'Camping', '🏕️'),

-- Food & Drinks
('food', 'Coffee Culture', '☕'),
('food', 'Wine Tasting', '🍷'),
('food', 'Craft Beer', '🍺'),
('food', 'Vegetarian/Vegan', '🥗'),
('food', 'Street Food', '🌮'),

-- Technology & Learning
('tech', 'Programming', '💻'),
('tech', 'Startups', '🚀'),
('tech', 'Cryptocurrency', '₿'),
('learning', 'Languages', '🗣️'),
('learning', 'Online Courses', '📖'),
('learning', 'Podcasts', '🎙️'),

-- Social & Entertainment
('social', 'Board Games', '🎲'),
('social', 'Karaoke', '🎤'),
('social', 'Stand-up Comedy', '😂'),
('social', 'Volunteering', '🤝'),
('entertainment', 'Movies & Cinema', '🎬'),
('entertainment', 'TV Series', '📺'),
('entertainment', 'Anime & Manga', '📚'),

-- Lifestyle
('lifestyle', 'Meditation', '🕯️'),
('lifestyle', 'Fashion', '👗'),
('lifestyle', 'Sustainability', '♻️'),
('lifestyle', 'Pets & Animals', '🐕'),
('lifestyle', 'DIY Projects', '🔨');
