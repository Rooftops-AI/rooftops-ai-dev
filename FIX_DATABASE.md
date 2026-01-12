# Fix Database - Run This Migration

Your app is broken because the tier system tables don't exist in your hosted Supabase database.

## Quick Fix (2 minutes)

### Option 1: Run migration from CLI (fastest)
```bash
# You'll be prompted for your database password
supabase db push --linked
```

Then run:
```bash
# Regenerate TypeScript types
supabase gen types typescript --linked > supabase/types.ts

# Restart dev server
pkill -f "next dev" && npm run dev
```

### Option 2: Run SQL in Supabase Dashboard
If you don't have the database password handy:

1. Go to: https://supabase.com/dashboard/project/hgmmcarutpmbxvkbsnpx/editor
2. Click "SQL Editor"
3. Click "New Query"
4. Copy the contents of this file: `supabase/migrations/20260112_add_tier_system_usage.sql`
5. Paste into the SQL editor
6. Click "Run"

Then run locally:
```bash
# Regenerate TypeScript types
supabase gen types typescript --linked > supabase/types.ts

# Restart dev server
pkill -f "next dev" && npm run dev
```

## What This Migration Does

Creates the `user_usage` table to track:
- Reports generated per month
- Chat messages used (premium vs free models)
- Web searches used
- Daily chat limits for free tier

Adds `tier` column to `subscriptions` table to track user tier (free/premium/business).

## Current Errors You're Seeing

```
Error: Could not find the table 'public.user_usage' in the schema cache
```

This will disappear once you run the migration.
