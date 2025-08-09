-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.api_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  endpoint text NOT NULL,
  method text NOT NULL,
  request_data jsonb,
  response_status integer,
  response_time_ms integer,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT api_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cron_jobs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  job_name text NOT NULL,
  status text CHECK (status = ANY (ARRAY['pending'::text, 'running'::text, 'completed'::text, 'failed'::text])),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  error_message text,
  execution_time_ms integer,
  records_processed integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cron_jobs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.interests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category text NOT NULL,
  name text NOT NULL UNIQUE,
  icon text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT interests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.system_config (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  config_key text NOT NULL UNIQUE,
  config_value jsonb NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT system_config_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_app_preferences (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  push_notifications boolean DEFAULT true,
  email_notifications boolean DEFAULT false,
  marketing_emails boolean DEFAULT false,
  analytics_sharing boolean DEFAULT false,
  profile_visibility text DEFAULT 'public'::text CHECK (profile_visibility = ANY (ARRAY['public'::text, 'friends'::text, 'private'::text])),
  show_online_status boolean DEFAULT true,
  auto_swipe_enabled boolean DEFAULT false,
  daily_match_limit integer DEFAULT 50,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_app_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_app_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_dating_preferences (
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
CREATE TABLE public.user_interests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  interest_id uuid NOT NULL,
  intensity_level integer DEFAULT 3 CHECK (intensity_level >= 1 AND intensity_level <= 5),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_interests_pkey PRIMARY KEY (id),
  CONSTRAINT user_interests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_interests_interest_id_fkey FOREIGN KEY (interest_id) REFERENCES public.interests(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  bio text,
  height_cm integer,
  hometown text,
  work text,
  education text,
  religion text,
  smoking text,
  drinking text,
  profile_photo_url text,
  additional_photos jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  auth_user_id uuid NOT NULL UNIQUE,
  email text UNIQUE,
  first_name text NOT NULL,
  last_name text,
  birthdate date NOT NULL,
  gender text NOT NULL CHECK (gender = ANY (ARRAY['male'::text, 'female'::text, 'non-binary'::text, 'other'::text])),
  current_location text,
  is_active boolean DEFAULT true,
  profile_completion_percentage integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);