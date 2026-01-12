-- Add scheduled_plan_type field to track scheduled tier changes
ALTER TABLE subscriptions
ADD COLUMN scheduled_plan_type TEXT;

-- Add comment
COMMENT ON COLUMN subscriptions.scheduled_plan_type IS 'Tracks scheduled plan changes (e.g., downgrade from business to premium at period end)';
