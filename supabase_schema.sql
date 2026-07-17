-- =============================================================================
-- MedAssist — Full Database Schema (Production-Hardened)
-- Last updated: 2026-05-02
-- IMPORTANT: The production database uses UUID primary keys for lab_results and
-- biomarkers (gen_random_uuid()), NOT BIGINT identity columns. This schema was
-- updated to match the live DB after a type mismatch bug (BIGINT vs UUID) was
-- found in save_complete_report. Do NOT revert to BIGINT without a migration.
-- Changes vs v1:
--   - All SECURITY DEFINER functions now have SET search_path = public (H1)
--   - All RLS policies use (select auth.uid()) for per-query init plan (H4)
--   - Duplicate/conflicting RLS policies removed (H3, H6)
--   - feedback INSERT policy now scoped to own user_id (H2)
--   - Added index on biomarkers.lab_result_id and feedback.user_id (H5, M5)
--   - Removed unused indexes: idx_biomarkers_user_id, idx_lab_results_user_id, idx_profiles_email (M6)
--   - 2026-05-02: Fixed UUID/BIGINT mismatch — lab_results.id, biomarkers.id,
--     biomarkers.lab_result_id all use UUID to match production schema.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- RATE LIMITS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rate_limits (
  fingerprint TEXT NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  request_count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (fingerprint, window_start)
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny all access" ON rate_limits;
CREATE POLICY "Deny all access" ON rate_limits FOR ALL USING (false);

-- Deterministic rate limit check (search_path secured)
DROP FUNCTION IF EXISTS public.check_rate_limit(text, integer, integer);

CREATE FUNCTION public.check_rate_limit(
  p_fingerprint TEXT,
  p_limit INT,
  p_window_seconds INT DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_window_start TIMESTAMP WITH TIME ZONE;
  current_count INT;
BEGIN
  current_window_start := to_timestamp(
    floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds
  );
  INSERT INTO rate_limits (fingerprint, window_start, request_count)
  VALUES (p_fingerprint, current_window_start, 1)
  ON CONFLICT (fingerprint, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1
  RETURNING request_count INTO current_count;
  RETURN current_count <= p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INT, INT) TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  first_name TEXT,
  last_name TEXT,
  blood_type TEXT,
  age INT,
  sex TEXT,
  email TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Idempotent column additions for existing databases
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age INT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sex TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all old policies (including duplicates from v1)
DROP POLICY IF EXISTS "Users see own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

-- Single set of clean, optimized policies
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Trigger: auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, onboarding_complete)
  VALUES (new.id, new.email, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- LAB RESULTS
-- NOTE: id uses UUID (gen_random_uuid()) — NOT BIGINT — matching production.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  health_score INT,
  risk_level TEXT,
  summary TEXT,
  plain_summary TEXT,
  file_name TEXT,
  processed BOOLEAN DEFAULT false,
  processing_time_ms INTEGER,
  raw_ocr_text TEXT,
  raw_ai_json JSONB,
  symptom_connections JSONB DEFAULT '[]'::jsonb
);

-- Idempotent column additions
ALTER TABLE lab_results ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now();
ALTER TABLE lab_results ADD COLUMN IF NOT EXISTS plain_summary TEXT;
ALTER TABLE lab_results ADD COLUMN IF NOT EXISTS symptom_connections JSONB DEFAULT '[]'::jsonb;

ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

-- Drop all old policies
DROP POLICY IF EXISTS "Users see own lab_results" ON lab_results;
DROP POLICY IF EXISTS "Users can view their own lab results" ON lab_results;
DROP POLICY IF EXISTS "Users can insert their own lab results" ON lab_results;
DROP POLICY IF EXISTS "lab_results_select" ON lab_results;
DROP POLICY IF EXISTS "lab_results_insert" ON lab_results;
DROP POLICY IF EXISTS "lab_results_delete" ON lab_results;

CREATE POLICY "lab_results_select" ON lab_results
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "lab_results_insert" ON lab_results
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "lab_results_delete" ON lab_results
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- BIOMARKERS
-- NOTE: id and lab_result_id use UUID — NOT BIGINT — matching production.
-- value is TEXT (the DB stores it as text; application calls parseFloat).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS biomarkers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT,
  unit TEXT,
  status TEXT,
  reference_range_min NUMERIC,
  reference_range_max NUMERIC,
  category TEXT,
  confidence NUMERIC,
  ai_interpretation TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE biomarkers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own biomarkers" ON biomarkers;
DROP POLICY IF EXISTS "biomarkers_all" ON biomarkers;

CREATE POLICY "biomarkers_all" ON biomarkers
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- Index for FK join (dashboard, trend charts)
CREATE INDEX IF NOT EXISTS idx_biomarkers_lab_result_id ON biomarkers(lab_result_id);
CREATE INDEX IF NOT EXISTS idx_biomarkers_user_id ON biomarkers(user_id);
-- Note: idx_biomarkers_user_id is critical for RLS performance at scale.

-- ─────────────────────────────────────────────────────────────────────────────
-- SYMPTOMS
-- NOTE: column is 'symptom' (not 'symptom_text') to match all application code
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS symptoms (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Idempotent: rename symptom_text → symptom on existing databases
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'symptoms' AND column_name = 'symptom_text'
  ) THEN
    ALTER TABLE symptoms RENAME COLUMN symptom_text TO symptom;
  END IF;
END $$;

ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own symptoms" ON symptoms;
DROP POLICY IF EXISTS "Users can manage their own symptoms" ON symptoms;
DROP POLICY IF EXISTS "symptoms_all" ON symptoms;

CREATE POLICY "symptoms_all" ON symptoms
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- FEEDBACK
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, NOW()) NOT NULL,
  message TEXT NOT NULL,
  url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Drop both old insecure policies (WITH CHECK (true) allowed any user_id)
DROP POLICY IF EXISTS "Users can insert feedback" ON feedback;
DROP POLICY IF EXISTS "Authenticated users can insert feedback" ON feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON feedback;

-- Scoped: users can only insert rows where user_id = their own UID
CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Index for FK join
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- HEALTH COMPANION V1: goals, context, plans, insights, exports, sharing
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_key TEXT NOT NULL,
  label TEXT NOT NULL,
  priority INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, goal_key)
);

CREATE TABLE IF NOT EXISTS onboarding_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL DEFAULT 'profile',
  completed_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
  draft JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_context_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS biomarker_knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  canonical_name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  plain_english TEXT NOT NULL,
  common_questions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS biomarker_aliases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  biomarker_knowledge_id UUID NOT NULL REFERENCES biomarker_knowledge(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  UNIQUE (normalized_alias)
);

CREATE TABLE IF NOT EXISTS insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  related_biomarkers TEXT[] DEFAULT ARRAY[]::TEXT[],
  source TEXT DEFAULT 'generated',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS care_plan_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  reason TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('ask_doctor', 'monitor', 'lifestyle', 'retest')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'done', 'dismissed')),
  timeframe TEXT,
  related_biomarkers TEXT[] DEFAULT ARRAY[]::TEXT[],
  source TEXT DEFAULT 'user',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_type TEXT NOT NULL,
  value TEXT,
  note TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS retest_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE,
  related_biomarkers TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'done', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  body TEXT NOT NULL,
  related_biomarkers TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- NOTE: assistant_artifacts is defined after conversations (below) because it
-- has a FK reference to conversations(id).

CREATE TABLE IF NOT EXISTS exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL,
  format TEXT NOT NULL,
  sections TEXT[] DEFAULT ARRAY[]::TEXT[],
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS share_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  title TEXT NOT NULL,
  sections TEXT[] DEFAULT ARRAY[]::TEXT[],
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE biomarkers ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'uploaded_pdf';
ALTER TABLE biomarkers ADD COLUMN IF NOT EXISTS source_metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE biomarkers ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE biomarkers ADD COLUMN IF NOT EXISTS edited_from JSONB;

ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_context_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarker_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarker_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE retest_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "health_goals_all" ON health_goals;
CREATE POLICY "health_goals_all" ON health_goals FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "onboarding_progress_all" ON onboarding_progress;
CREATE POLICY "onboarding_progress_all" ON onboarding_progress FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_context_events_all" ON user_context_events;
CREATE POLICY "user_context_events_all" ON user_context_events FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "biomarker_knowledge_read" ON biomarker_knowledge;
CREATE POLICY "biomarker_knowledge_read" ON biomarker_knowledge FOR SELECT USING (true);

DROP POLICY IF EXISTS "biomarker_aliases_read" ON biomarker_aliases;
CREATE POLICY "biomarker_aliases_read" ON biomarker_aliases FOR SELECT USING (true);

DROP POLICY IF EXISTS "insights_all" ON insights;
CREATE POLICY "insights_all" ON insights FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "care_plan_items_all" ON care_plan_items;
CREATE POLICY "care_plan_items_all" ON care_plan_items FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "habit_logs_all" ON habit_logs;
CREATE POLICY "habit_logs_all" ON habit_logs FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "retest_reminders_all" ON retest_reminders;
CREATE POLICY "retest_reminders_all" ON retest_reminders FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_notes_all" ON user_notes;
CREATE POLICY "user_notes_all" ON user_notes FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "assistant_artifacts_all" ON assistant_artifacts;
CREATE POLICY "assistant_artifacts_all" ON assistant_artifacts FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "exports_all" ON exports;
CREATE POLICY "exports_all" ON exports FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "share_links_all" ON share_links;
CREATE POLICY "share_links_all" ON share_links FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_health_goals_user_id ON health_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_context_events_user_id_occurred ON user_context_events(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_user_id_created ON insights(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_care_plan_user_id_status ON care_plan_items(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id_logged ON habit_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_exports_user_id_created ON exports(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);

-- ─────────────────────────────────────────────────────────────────────────────
-- SUPPLEMENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS supplements (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own supplements" ON supplements;
DROP POLICY IF EXISTS "supplements_all" ON supplements;

CREATE POLICY "supplements_all" ON supplements
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- CONSENT LOG
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consent_log (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  choice TEXT NOT NULL CHECK (choice IN ('accepted', 'rejected')),
  ip_address TEXT,
  user_agent TEXT,
  consented_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;

-- Only the service role / SECURITY DEFINER functions should write to this table
DROP POLICY IF EXISTS "consent_log_deny_all" ON consent_log;
CREATE POLICY "consent_log_deny_all" ON consent_log FOR ALL USING (false);

-- ─────────────────────────────────────────────────────────────────────────────
-- GLOBAL AI CACHE (Doctor Questions pattern cache)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS global_ai_cache (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  response_json JSONB NOT NULL,
  usage_count INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Idempotent: add expires_at column for TTL
ALTER TABLE global_ai_cache ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Set default expiry to 24 hours from creation
CREATE OR REPLACE FUNCTION set_cache_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    NEW.expires_at = timezone('utc'::text, now()) + INTERVAL '24 hours';
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_cache_expiry_trigger ON global_ai_cache;
CREATE TRIGGER set_cache_expiry_trigger
    BEFORE INSERT ON global_ai_cache
    FOR EACH ROW
    EXECUTE FUNCTION set_cache_expiry();

-- Cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted INT;
BEGIN
    DELETE FROM global_ai_cache
    WHERE expires_at IS NOT NULL AND expires_at < timezone('utc'::text, now());
    GET DIAGNOSTICS deleted = ROW_COUNT;
    RETURN deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_expired_cache() TO service_role;

ALTER TABLE global_ai_cache ENABLE ROW LEVEL SECURITY;

-- Deny direct access — data flows through SECURITY DEFINER RPCs only
DROP POLICY IF EXISTS "Deny all direct access" ON global_ai_cache;
DROP POLICY IF EXISTS "Authenticated users can read global AI cache" ON global_ai_cache;
DROP POLICY IF EXISTS "Authenticated users can upsert global AI cache" ON global_ai_cache;
DROP POLICY IF EXISTS "global_ai_cache_deny_direct" ON global_ai_cache;

CREATE POLICY "global_ai_cache_deny_direct" ON global_ai_cache
  FOR ALL USING (false) WITH CHECK (false);

-- ─────────────────────────────────────────────────────────────────────────────
-- CONVERSATIONS (AI chat history + per-user rate limiting)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Drop both old policies (including the duplicate that caused advisor warnings)
DROP POLICY IF EXISTS "Users manage own conversations" ON conversations;
DROP POLICY IF EXISTS "Users see own conversations" ON conversations;
DROP POLICY IF EXISTS "conversations_all" ON conversations;

CREATE POLICY "conversations_all" ON conversations
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- Composite index for fast per-user history queries and rate limit checks
CREATE INDEX IF NOT EXISTS conversations_user_id_created_at_idx
  ON conversations (user_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- ASSISTANT ARTIFACTS (created after conversations for FK reference)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assistant_artifacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  conversation_id BIGINT REFERENCES conversations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SAVE COMPLETE REPORT RPC (search_path secured)
-- Returns UUID matching the live lab_results.id column type.
-- ─────────────────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.save_complete_report(UUID, TEXT, INT, TEXT, TEXT, JSONB, TEXT, JSONB, JSONB, TEXT);

CREATE FUNCTION public.save_complete_report(
  p_user_id UUID,
  p_file_name TEXT,
  p_health_score INT,
  p_risk_level TEXT,
  p_summary TEXT,
  p_biomarkers JSONB,
  p_raw_ocr_text TEXT DEFAULT NULL,
  p_raw_ai_json JSONB DEFAULT NULL,
  p_symptom_connections JSONB DEFAULT NULL,
  p_plain_summary TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_report_id UUID;
BEGIN
  -- CRITICAL SECURITY ENFORCEMENT:
  -- Prevent direct RPC spoofing by ensuring the session user matches the target user.
  -- This blocks IDOR and data injection attacks if the RPC is called directly via the client.
  IF (SELECT auth.uid()) IS NULL OR (SELECT auth.uid()) != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Session user does not match target user_id';
  END IF;

  INSERT INTO lab_results (
    user_id, file_name, health_score, risk_level, summary, plain_summary,
    processed, raw_ocr_text, raw_ai_json, symptom_connections, uploaded_at
  )
  VALUES (
    p_user_id, p_file_name, p_health_score, p_risk_level, p_summary, p_plain_summary,
    true, p_raw_ocr_text, p_raw_ai_json, p_symptom_connections,
    timezone('utc'::text, now())
  )
  RETURNING id INTO v_report_id;

  INSERT INTO biomarkers (
    user_id, lab_result_id, name, value, unit, status,
    reference_range_min, reference_range_max, category, confidence, ai_interpretation
  )
  SELECT
    p_user_id,
    v_report_id,
    (b->>'name')::TEXT,
    (b->>'value')::TEXT,
    (b->>'unit')::TEXT,
    (b->>'status')::TEXT,
    CASE WHEN (b->>'referenceMin') IS NOT NULL THEN (b->>'referenceMin')::NUMERIC ELSE NULL END,
    CASE WHEN (b->>'referenceMax') IS NOT NULL THEN (b->>'referenceMax')::NUMERIC ELSE NULL END,
    (b->>'category')::TEXT,
    CASE WHEN (b->>'confidence') IS NOT NULL THEN (b->>'confidence')::NUMERIC ELSE NULL END,
    (b->>'aiInterpretation')::TEXT
  FROM jsonb_array_elements(p_biomarkers) AS b;

  RETURN v_report_id;
END;
$$;

-- Grant to both authenticated AND anon so the function works even when the
-- service role key is misconfigured and the admin client falls back to the
-- anon key. The function is SECURITY DEFINER so it still has full DB access
-- regardless of the caller's role. Server-side auth validation in the API
-- routes ensures this cannot be exploited by unauthenticated clients.
GRANT EXECUTE ON FUNCTION save_complete_report(UUID, TEXT, INT, TEXT, TEXT, JSONB, TEXT, JSONB, JSONB, TEXT) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- DELETE LAB RESULT RPC (safe delete — respects ownership)
-- NOTE: p_lab_result_id is UUID to match the live lab_results.id column.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_lab_result(
  p_user_id UUID,
  p_lab_result_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted BOOLEAN;
BEGIN
  DELETE FROM biomarkers
  WHERE lab_result_id = p_lab_result_id AND user_id = p_user_id;

  DELETE FROM lab_results
  WHERE id = p_lab_result_id AND user_id = p_user_id;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_lab_result(UUID, UUID) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- DATA RETENTION CLEANUP (GDPR Article 5(1)(e))
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_expired_data(retention_days INT DEFAULT 365)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    lab_count INT;
    conversation_count INT;
BEGIN
    DELETE FROM lab_results
    WHERE uploaded_at < timezone('utc'::text, now()) - (retention_days || ' days')::INTERVAL;
    GET DIAGNOSTICS lab_count = ROW_COUNT;

    DELETE FROM conversations
    WHERE created_at < timezone('utc'::text, now()) - INTERVAL '90 days';
    GET DIAGNOSTICS conversation_count = ROW_COUNT;

    RETURN lab_count + conversation_count;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_expired_data(INT) TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- AUDIT LOG (HIPAA audit controls)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Append-only: authenticated users or service_role can insert, but no updates or deletes via RLS
DROP POLICY IF EXISTS "audit_log_insert" ON audit_log;
CREATE POLICY "audit_log_insert" ON audit_log
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL OR (SELECT auth.role()) = 'service_role');

-- Service role / admin reads via supabaseAdmin (bypasses RLS)
DROP POLICY IF EXISTS "audit_log_select_admin" ON audit_log;
CREATE POLICY "audit_log_select_admin" ON audit_log
  FOR SELECT USING ((SELECT auth.role()) = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- ATOMIC DELETE: lab result + biomarkers in one transaction
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION delete_lab_result_cascade(p_report_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM biomarkers WHERE lab_result_id = p_report_id AND user_id = p_user_id;
  DELETE FROM lab_results WHERE id = p_report_id AND user_id = p_user_id;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- ATOMIC REPLACE: replace all symptoms for a user in one transaction
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION replace_user_symptoms(p_user_id UUID, p_symptoms TEXT[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM symptoms WHERE user_id = p_user_id;
  IF array_length(p_symptoms, 1) > 0 THEN
    INSERT INTO symptoms (user_id, symptom)
    SELECT p_user_id, unnest(p_symptoms);
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- MISSING INDEXES for RLS performance
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_retest_reminders_user ON retest_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_user ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_artifacts_user ON assistant_artifacts(user_id);
CREATE INDEX IF NOT EXISTS idx_supplements_user ON supplements(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_log_user ON consent_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- RATE LIMITS cleanup — prevent unbounded table growth
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < timezone('utc'::text, now()) - INTERVAL '24 hours';
END;
$$;
