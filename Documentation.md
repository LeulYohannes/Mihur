# Mihur – Project Documentation

## Overview

Mihur is a web platform that helps learners find free online courses, generate personalised learning roadmaps, and track their progress. It uses a hybrid approach: a local rule‑based roadmap generator combined with YouTube API fallback for video recommendations. Users can save courses, favourite videos, and manage multiple learning paths.

**Live demo**: [your-vercel-url]  
**Repository**: [GitHub link]

## Core Features

- **Course discovery** – Browse by category, search, save courses to personal library.
- **Questionnaire** – Captures learning goals, skill level, weekly available hours.
- **Roadmap generator** – Creates structured step‑by‑step learning plans using your own course database + YouTube videos as supplemental material.
- **Progress tracking** – Check off steps, progress bar updates in real time.
- **Favourites** – Like YouTube videos; they appear in a dedicated “Favourite Videos” list.
- **My Learning** – Central dashboard for saved courses, roadmaps, and favourite videos.
- **Authentication** – Email/password via Supabase Auth.

## Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Frontend     | React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion, Lucide React |
| Backend (BaaS) | Supabase (PostgreSQL, Auth, Edge Functions, RLS) |
| External APIs| YouTube Data API v3 (via Edge Function proxy)   |
| Deployment   | Vercel (frontend), Supabase (backend)           |

## Project Structure

```
Mihur/
├── src/
│   ├── components/        # Navbar, CourseCard, CategoryCard
│   ├── contexts/          # AuthContext (Supabase auth)
│   ├── lib/               # supabase.ts, iconMap.ts
│   ├── pages/             # Home, Categories, CategoryDetail, Auth, MyLearning, Questionnaire, Roadmap
│   ├── utils/             # roadmapGenerator.ts
│   └── main.tsx, App.tsx, index.css
├── supabase/
│   └── functions/         # search-youtube (Edge Function)
├── .env.local             # Supabase URL + anon key
├── package.json
└── vercel.json            # rewrites for SPA routing
```

## Environment Variables

Create `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For YouTube integration, set secrets in Supabase Edge Functions (not in frontend):
- `YOUTUBE_API_KEY` – your YouTube Data API key (restricted)

## Database Schema (Relevant Tables)

### `categories`
`id (text)`, `name`, `description`, `icon_name`

### `courses`
`id (text)`, `title`, `provider`, `duration`, `level`, `description`, `image`, `url`, `category_id (fk)`

### `user_profiles`
`user_id (uuid, pk, fk auth.users)`, `category`, `skill_level`, `reason`, `weekly_hours`, `goal`, `experience`, `updated_at`

### `user_roadmaps`
`id (uuid)`, `user_id`, `title`, `description`, `category_id`, `total_steps`, `completed_steps`, `progress_percent`, `created_at`, `updated_at`

### `roadmap_steps`
`id (uuid)`, `roadmap_id (fk user_roadmaps)`, `title`, `description`, `step_order`, `is_completed`, `completed_at`, `course_id (fk courses)`, `estimated_hours`, `external_url`, `thumbnail`, `url`

### `saved_courses`
`id (bigserial)`, `user_id (uuid)`, `course_id (text)`, `created_at`

### `user_favorites`
`id (bigserial)`, `user_id (uuid)`, `external_url`, `title`, `thumbnail`, `created_at`

All tables have Row Level Security (RLS) policies restricting access to the owning user.

## Setup & Installation

```bash
git clone https://github.com/your-username/Mihur.git
cd Mihur
npm install
```

Copy `.env.local.example` to `.env.local` and fill in Supabase credentials.

Run locally:
```bash
npm run dev
```

## Edge Function: YouTube Search

We use a Supabase Edge Function as a secure proxy to the YouTube API. The frontend calls this function, which uses a secret API key.

**Location**: `supabase/functions/search-youtube/index.ts`  
**Deploy**: `supabase functions deploy search-youtube`  
**Secret**: `supabase secrets set YOUTUBE_API_KEY=your_key`

The function accepts `{ query, maxResults }` and returns a list of videos.

## Roadmap Generator Logic

`src/utils/roadmapGenerator.ts` does the following:

1. Fetches courses from Supabase filtered by user’s chosen category.
2. Sorts by level (Beginner → Advanced) and prioritises courses matching the user’s skill level.
3. Takes up to 6 courses as core roadmap steps.
4. Calls YouTube search (via Edge Function) with a query derived from the user’s goal and category to fetch up to 3 extra video recommendations.
5. Returns separate arrays: `dbCourses` and `youtubeVideos`.

No generic placeholder steps are added. If no courses exist, the roadmap will still contain YouTube videos, but the “learning path” section will be empty (user can still see recommended videos).

## Frontend Components

- **HomePage**: Hero, search bar, categories grid, popular courses, personalised recommendations (if logged in and questionnaire filled).
- **CategoriesPage**: Full list of categories.
- **CategoryDetailPage**: Shows all courses for a category.
- **AuthPage**: Sign in / sign up.
- **Questionnaire**: Collects user preferences; on submit redirects to `/roadmap`.
- **RoadmapPage**: Displays current roadmaps, allows generating new ones, shows steps from DB courses with working course links, and a separate “Recommended Videos” section. Each video has a like button (updates `user_favorites`).
- **MyLearningPage**: Three tabs – Saved courses, User roadmaps (with progress), Favourite videos.

## Deployment

### Frontend (Vercel)
- Connect GitHub repository.
- Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Create `vercel.json` for SPA routing:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```

### Backend (Supabase)
- Run all SQL schema scripts in Supabase SQL Editor.
- Deploy Edge Function `search-youtube` (see above).
- Enable RLS on all tables and set policies.

#tes progress and updates `selectedRoadmap` state. |

## Future Improvements

- Add AI re‑ordering of roadmap steps (e.g., using Groq API).
- Cache YouTube search results to reduce quota usage.
- Allow users to reorder steps manually.
- Embed YouTube videos directly on the page (iframe).

## Group Members and Contributions

-Hikma Abdu: Design inspiration and mockups
-Abem Mechal: Website Structure and UX
-Dagim Debebe: Course Aggregation and Schema design
-Leul Yohanned: System Development and Implementation

