-- Enhanced profiles table with all onboarding data
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pronouns TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sexuality TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relationship_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dating_intention TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_plans TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hometown TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS religion TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS drinking TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smoking TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  preferences JSONB DEFAULT '[]'::jsonb,
  notifications_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS policies for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
