-- Admin Dashboard Analytics Schema
-- Track user metrics, revenue, and usage over time

-- Daily metrics snapshot table
CREATE TABLE IF NOT EXISTS admin_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_registered_users INTEGER DEFAULT 0,
  total_paying_users INTEGER DEFAULT 0,
  total_trialing_users INTEGER DEFAULT 0,
  mrr_cents INTEGER DEFAULT 0,
  arr_cents INTEGER DEFAULT 0,
  total_reports_generated INTEGER DEFAULT 0,
  total_chat_messages INTEGER DEFAULT 0,
  new_signups INTEGER DEFAULT 0,
  new_paid_conversions INTEGER DEFAULT 0,
  churned_users INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Usage events tracking (granular)
CREATE TABLE IF NOT EXISTS admin_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'report_generated', 'chat_message', 'login', etc.
  user_id UUID REFERENCES profiles(user_id),
  workspace_id UUID REFERENCES workspaces(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User activity log (for cohort analysis)
CREATE TABLE IF NOT EXISTS admin_user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  activity_date DATE NOT NULL,
  reports_count INTEGER DEFAULT 0,
  chat_messages_count INTEGER DEFAULT 0,
  logins_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Revenue events
CREATE TABLE IF NOT EXISTS admin_revenue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  event_type TEXT NOT NULL, -- 'subscription_started', 'subscription_ended', 'payment_failed'
  amount_cents INTEGER,
  plan_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_events_type ON admin_usage_events(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_events_created ON admin_usage_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON admin_user_activity(activity_date);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON admin_daily_metrics(date);

-- Enable RLS
ALTER TABLE admin_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_revenue_events ENABLE ROW LEVEL SECURITY;

-- Only admin can access
CREATE POLICY "Admin only" ON admin_daily_metrics
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true));

CREATE POLICY "Admin only" ON admin_usage_events
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true));

CREATE POLICY "Admin only" ON admin_user_activity
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true));

CREATE POLICY "Admin only" ON admin_revenue_events
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE is_admin = true));
