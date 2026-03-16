# Campaign Volunteer Scheduler

A simple webapp for coordinating volunteer availability for weekend canvassing.

**Volunteers** visit a link, enter their name/email, and click on calendar slots to mark when they're available. **Admins** visit `/admin` to see a heatmap of all availability.

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Copy your **Project URL** and **Service Role Key** from Settings → API

### 2. Environment Variables

Create `.env.local` in the project root:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Local Development

```bash
npm install
npx vercel dev
```

### 4. Deploy to Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add the two environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
4. Deploy

## Project Structure

```
├── api/             # Vercel serverless functions
│   ├── _supabase.ts # Shared Supabase client
│   ├── volunteers.ts
│   ├── availability/
│   └── admin/
├── src/             # React frontend
│   ├── pages/       # LandingPage, VolunteerPage, AdminPage
│   ├── api.ts       # Frontend API client
│   └── types.ts
├── vercel.json      # Routing config
└── supabase-schema.sql
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/volunteer` | Calendar availability picker |
| `/admin` | Admin dashboard (heatmap + per-person views) |
