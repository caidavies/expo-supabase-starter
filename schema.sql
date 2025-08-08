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
  CONSTRAINT api_logs_pkey PRIMARY KEY (id),
  CONSTRAINT api_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
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
  interest_tag text NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT interests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.match_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  match_user_id uuid,
  compatibility_score numeric NOT NULL,
  match_type text NOT NULL,
  match_factors jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT match_history_pkey PRIMARY KEY (id),
  CONSTRAINT match_history_match_user_id_fkey FOREIGN KEY (match_user_id) REFERENCES public.users(id),
  CONSTRAINT match_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.matches (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  match_user_id uuid,
  compatibility_score numeric NOT NULL,
  match_type text CHECK (match_type = ANY (ARRAY['mutual'::text, 'potential'::text, 'super_match'::text])),
  match_factors jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT matches_match_user_id_fkey FOREIGN KEY (match_user_id) REFERENCES public.users(id)
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
CREATE TABLE public.user_analytics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  event_type text NOT NULL,
  event_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT user_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_interactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  target_user_id uuid,
  interaction_type text CHECK (interaction_type = ANY (ARRAY['like'::text, 'dislike'::text, 'block'::text, 'super_like'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT user_interactions_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES public.users(id),
  CONSTRAINT user_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_interests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  interest_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_interests_pkey PRIMARY KEY (id),
  CONSTRAINT user_interests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_interests_interest_id_fkey FOREIGN KEY (interest_id) REFERENCES public.interests(id)
);
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE,
  smoking_preference text CHECK (smoking_preference = ANY (ARRAY['I smoke'::text, 'I don''t smoke but don''t mind'::text, 'I don''t smoke and prefer non-smokers'::text, 'I don''t smoke and won''t date smokers'::text])),
  children_preference text CHECK (children_preference = ANY (ARRAY['I have children'::text, 'I want children'::text, 'I don''t want children'::text, 'I''m open to either'::text])),
  pet_preference text CHECK (pet_preference = ANY (ARRAY['I have pets'::text, 'I want pets'::text, 'I don''t want pets'::text, 'I''m allergic to pets'::text])),
  religion_importance text CHECK (religion_importance = ANY (ARRAY['Very important'::text, 'Somewhat important'::text, 'Not important'::text, 'I''m not religious'::text])),
  work_schedule text CHECK (work_schedule = ANY (ARRAY['9-5 regular hours'::text, 'Shift work'::text, 'Remote/flexible'::text, 'Freelance/irregular'::text])),
  social_energy text CHECK (social_energy = ANY (ARRAY['Very extroverted'::text, 'Somewhat extroverted'::text, 'Somewhat introverted'::text, 'Very introverted'::text])),
  travel_frequency text CHECK (travel_frequency = ANY (ARRAY['I travel frequently'::text, 'I travel occasionally'::text, 'I travel rarely'::text, 'I prefer staying local'::text])),
  living_situation text CHECK (living_situation = ANY (ARRAY['I live alone'::text, 'I have roommates'::text, 'I live with family'::text, 'I''m looking for a place'::text])),
  car_ownership text CHECK (car_ownership = ANY (ARRAY['I have a car'::text, 'I don''t have a car but it''s fine'::text, 'I prefer partners with cars'::text, 'I don''t drive'::text])),
  meeting_frequency text CHECK (meeting_frequency = ANY (ARRAY['Daily'::text, '2-3 times per week'::text, 'Once a week'::text, 'Once a month'::text])),
  preferred_date_types ARRAY,
  communication_style text CHECK (communication_style = ANY (ARRAY['Text mostly'::text, 'Calls and texts'::text, 'Video calls'::text, 'In person only'::text])),
  exclusivity text CHECK (exclusivity = ANY (ARRAY['I date multiple people'::text, 'I prefer exclusive dating'::text, 'I''m open to either'::text, 'I want serious relationships only'::text])),
  physical_timeline text CHECK (physical_timeline = ANY (ARRAY['First date'::text, 'After a few dates'::text, 'When in a relationship'::text, 'I take things slow'::text])),
  max_distance_km integer DEFAULT 20,
  preferred_meeting_areas ARRAY,
  transportation text CHECK (transportation = ANY (ARRAY['Public transit'::text, 'Car'::text, 'Walking'::text, 'Any method'::text])),
  availability text CHECK (availability = ANY (ARRAY['Weekdays only'::text, 'Weekends only'::text, 'Evenings only'::text, 'Any time'::text])),
  education_importance text CHECK (education_importance = ANY (ARRAY['Very important'::text, 'Somewhat important'::text, 'Not important'::text])),
  career_importance text CHECK (career_importance = ANY (ARRAY['Very important'::text, 'Somewhat important'::text, 'Not important'::text])),
  family_background text CHECK (family_background = ANY (ARRAY['Turkish local'::text, 'Expat'::text, 'Mixed background'::text, 'Other'::text])),
  holiday_observance text CHECK (holiday_observance = ANY (ARRAY['I observe religious holidays'::text, 'I observe secular holidays'::text, 'I don''t observe holidays'::text, 'I''m flexible'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  auth_user_id uuid,
  email text UNIQUE,
  first_name text,
  last_name text,
  birthdate date,
  gender text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text, 'non-binary'::text, 'other'::text])),
  pronouns text,
  height_cm integer,
  hometown text,
  current_location text,
  home_location text,
  religion text,
  smoking text,
  drinking text,
  sexuality text,
  relationship_type text CHECK (relationship_type = ANY (ARRAY['monogamous'::text, 'open'::text, 'polyamorous'::text])),
  dating_intention text CHECK (dating_intention = ANY (ARRAY['serious'::text, 'fun'::text, 'long_term'::text, 'casual'::text])),
  family_plans text,
  work text,
  profile_photo_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  last_login timestamp with time zone,
  profile_completion_percentage integer DEFAULT 0,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);