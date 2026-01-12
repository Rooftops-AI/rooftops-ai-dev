# US-36 Final Verification Setup

## Prerequisites - Run These First

The tier system requires database tables that haven't been created yet.

### Step 1: Start Docker Desktop
Open Docker Desktop and wait for it to fully start.

### Step 2: Start Supabase
```bash
supabase start
```

This will:
- Start PostgreSQL database
- Start Supabase services
- Apply migrations (creates `user_usage` and `subscriptions` tables)

### Step 3: Generate Types
```bash
npm run db-types
```

This regenerates TypeScript types from the database schema.

### Step 4: Restart Dev Server
```bash
# Kill existing server
pkill -f "next dev"

# Start fresh
npm run dev
```

## Current Error
```
Error: Could not find the table 'public.user_usage' in the schema cache
```

This means the migrations in `supabase/migrations/` haven't been applied yet.

## Once Complete
The app should load at http://localhost:3001 and I can proceed with the 14-item verification checklist for US-36.
