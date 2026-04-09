# imadeanapp

A community-driven platform for builders to publish, discover, and grow their apps. Powered by a gravity-based trending algorithm that rewards real engagement over vanity metrics.

## ✨ Features

- **Smart Feed** — Personalized discovery with real-time trending, category filtering, and platform-specific browsing.
- **Publish in Minutes** — Multi-platform app listings with screenshots, tags, tech stack, and auto-generated SEO slugs.
- **Creator Profiles** — Professional portfolios with skills, experience, social links, and a follow system.
- **Trending Algorithm** — Gravity-based ranking using weighted engagement (tries, feedback, reviews, saves, ratings) with time-decay.
- **Community Feedback** — Custom Q&A questionnaires and satisfaction surveys with publisher analytics.
- **Ratings & Reviews** — Star ratings with text reviews, duplicate-prevention, and review likes.
- **Authentication** — Email/password sign-up with email verification, plus Google OAuth.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript 5, Vite 5 |
| Styling | Tailwind CSS v3, shadcn/ui, Radix UI |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions) |
| State | React Query (TanStack) |
| Routing | React Router v6 |

## 📦 Getting Started

### Prerequisites

- Node.js 18+ and npm/bun
- A Supabase project (or Lovable Cloud)

### Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd imadeanapp

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |

## 🗄 Database

The project uses Supabase Postgres with the following core tables:

- `apps` — Published and draft app listings
- `profiles` — User profiles with skills and social links
- `ratings` — Star ratings and text reviews
- `comments` / `comment_likes` — Review discussions
- `follows` — User follow relationships
- `saved_apps` — Bookmarked apps
- `app_clicks` — Unique outbound click tracking (for trending)
- `app_tries` — "Try App" tracking (for feedback gating)
- `app_feedback_config` / `app_feedback_responses` — Custom feedback system
- `app_updates` — Version history

### Trending Algorithm

Apps are ranked using a gravity-based formula:

```
EngagementScore = (Tries × 15) + (Feedback × 10) + (Reviews × 5) + (Saves × 4) + (ReviewLikes × 2) + (Ratings × 1)
QualityScore = EngagementScore × AverageRating
TrendingScore = QualityScore / (AgeInHours + 2)^1.5
```

All engagement counts use **unique users only** to prevent gaming.

### Migrations

Database migrations are in `supabase/migrations/`. Apply them with:

```bash
supabase db push
```

## 🚀 Deployment

### Vercel

The project includes `vercel.json` for SPA routing. Deploy via:

```bash
vercel --prod
```

### Environment

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in your hosting provider's environment settings.

## 📄 License

MIT
