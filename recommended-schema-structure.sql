-- CORE USER TABLE (Keep minimal for auth/identity)
-- Your current users table is actually good, just clean it up:
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id),
  email text UNIQUE,
  
  -- Core identity (needed for matching)
  first_name text NOT NULL,
  last_name text,
  birthdate date NOT NULL,
  gender text NOT NULL,
  
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
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
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
  name text NOT NULL,
  icon text, -- emoji or icon identifier
  created_at timestamptz DEFAULT now()
);

CREATE TABLE user_interests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  interest_id uuid REFERENCES interests(id) ON DELETE CASCADE,
  intensity_level integer DEFAULT 3, -- 1-5 how much they're into it
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, interest_id)
);

-- DATING PREFERENCES (Your current table is good, just organize it)
CREATE TABLE user_dating_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Relationship preferences
  sexuality text,
  relationship_type text, -- monogamous, open, polyamorous
  dating_intention text,  -- serious, casual, fun, long_term
  
  -- Lifestyle compatibility preferences
  smoking_preference text,
  drinking_preference text,
  children_preference text,
  pet_preference text,
  religion_importance text,
  
  -- Logistical preferences
  max_distance_km integer DEFAULT 20,
  age_range_min integer,
  age_range_max integer,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- APP PREFERENCES (Notifications, privacy, etc.)
CREATE TABLE user_app_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification preferences
  push_notifications boolean DEFAULT true,
  email_notifications boolean DEFAULT false,
  marketing_emails boolean DEFAULT false,
  
  -- Privacy preferences
  profile_visibility text DEFAULT 'public', -- public, friends, private
  show_online_status boolean DEFAULT true,
  
  -- App behavior
  auto_swipe_enabled boolean DEFAULT false,
  daily_match_limit integer DEFAULT 50,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SAMPLE INTERESTS DATA
INSERT INTO interests (category, name, icon) VALUES
('hobbies', 'Photography', '📷'),
('hobbies', 'Cooking', '👨‍🍳'),
('hobbies', 'Reading', '📚'),
('hobbies', 'Gaming', '🎮'),
('sports', 'Football', '⚽'),
('sports', 'Basketball', '🏀'),
('sports', 'Tennis', '🎾'),
('sports', 'Swimming', '🏊'),
('music', 'Rock', '🎸'),
('music', 'Jazz', '🎷'),
('music', 'Electronic', '🎧'),
('travel', 'Beach', '🏖️'),
('travel', 'Mountains', '🏔️'),
('travel', 'Cities', '🏙️'),
('lifestyle', 'Fitness', '💪'),
('lifestyle', 'Yoga', '🧘'),
('lifestyle', 'Meditation', '🕯️'),
('food', 'Vegetarian', '🥗'),
('food', 'Coffee Lover', '☕'),
('food', 'Wine Tasting', '🍷');
