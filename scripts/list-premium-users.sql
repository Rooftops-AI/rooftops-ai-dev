-- List all paid subscribers (Premium and Business users)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Summary counts
SELECT
  'SUMMARY' as section,
  COUNT(*) FILTER (WHERE status IN ('active', 'trialing')) as total_active,
  COUNT(*) FILTER (WHERE plan_type ILIKE '%premium%' AND status IN ('active', 'trialing')) as premium_users,
  COUNT(*) FILTER (WHERE plan_type ILIKE '%business%' AND status IN ('active', 'trialing')) as business_users,
  COUNT(*) FILTER (WHERE status = 'trialing') as on_trial,
  COUNT(*) FILTER (WHERE status = 'past_due') as past_due,
  COUNT(*) FILTER (WHERE cancel_at_period_end = true) as canceling
FROM subscriptions;

-- All paid subscribers with details
SELECT
  s.user_id,
  p.display_name,
  p.username,
  au.email,
  s.plan_type,
  s.status,
  s.current_period_start::date as period_start,
  s.current_period_end::date as period_end,
  s.cancel_at_period_end,
  s.stripe_customer_id,
  s.stripe_subscription_id,
  s.created_at::date as subscribed_on
FROM subscriptions s
LEFT JOIN profiles p ON s.user_id = p.user_id
LEFT JOIN auth.users au ON s.user_id = au.id
WHERE s.status IN ('active', 'trialing', 'past_due')
ORDER BY
  CASE
    WHEN s.plan_type ILIKE '%business%' THEN 1
    WHEN s.plan_type ILIKE '%premium%' THEN 2
    ELSE 3
  END,
  s.created_at DESC;

-- Just Premium users
SELECT
  au.email,
  p.display_name,
  s.plan_type,
  s.status,
  s.current_period_end::date as period_end
FROM subscriptions s
LEFT JOIN profiles p ON s.user_id = p.user_id
LEFT JOIN auth.users au ON s.user_id = au.id
WHERE s.plan_type ILIKE '%premium%'
  AND s.status IN ('active', 'trialing', 'past_due')
ORDER BY s.created_at DESC;

-- Just Business users
SELECT
  au.email,
  p.display_name,
  s.plan_type,
  s.status,
  s.current_period_end::date as period_end
FROM subscriptions s
LEFT JOIN profiles p ON s.user_id = p.user_id
LEFT JOIN auth.users au ON s.user_id = au.id
WHERE s.plan_type ILIKE '%business%'
  AND s.status IN ('active', 'trialing', 'past_due')
ORDER BY s.created_at DESC;
