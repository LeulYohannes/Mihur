# Mihur – Personalised Learning Roadmaps

Mihur helps learners discover free online courses, generate custom step‑by‑step roadmaps, and track progress. It combines your own course database with YouTube recommendations – no AI costs, no quotas.

🔗 **Live**: https://mihur-mrrobot461s-projects.vercel.app/ 
📦 **Repo**: https://github.com/LeulYohannes/Mihur

## ✨ Features

- **Course discovery** – Browse by category, search, save favourites.
- **Learning questionnaire** – Tell Mihur your goal, skill level, and weekly hours.
- **Smart roadmap generator** – Uses your database courses (sorted by level) + YouTube videos as supplements.
- **Progress tracking** – Check off steps, see progress bar update in real time.
- **Video likes** – Save YouTube videos to your personal “Favourites” list.
- **My Learning dashboard** – One place for saved courses, roadmaps, and liked videos.
- **Authentication** – Email/password via Supabase.

## 🧰 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, RLS)
- **APIs**: YouTube Data API v3 (via Supabase Edge Function)
- **Deployment**: Vercel (frontend), Supabase (backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- A Supabase project (free tier works)
- A YouTube Data API key (optional – without it, only your own courses are used)

### 1. Clone & Install
```bash
git clone https://github.com/LeulYohannes/Mihur
cd Mihur
npm install
```

### 2. Set up environment variables
Create `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
Intentionally left for security
```

### 3. Set up Supabase
- Run the SQL schema (see `documentation.md` or `supabase/schema.sql`).
- Enable Row Level Security (RLS) on all tables.
- Deploy the YouTube search Edge Function:
  ```bash
  supabase functions deploy search-youtube
  supabase secrets set YOUTUBE_API_KEY=your_key
  ```

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Vercel
- Connect GitHub repo to Vercel.
- Add the same environment variables.
- Create `vercel.json` with rewrite rule for SPA:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```

## 📁 Project Structure 

```
Mihur/
├── src/
│   ├── components/      # Navbar, CourseCard, CategoryCard
│   ├── contexts/        # AuthContext (Supabase)
│   ├── lib/             # supabase.ts, iconMap.ts
│   ├── pages/           # Home, Categories, Roadmap, MyLearning, etc.
│   └── utils/           # roadmapGenerator.ts (core logic)
├── supabase/
│   └── functions/       # search-youtube Edge Function
└── public/
```

## 🧠 How the Roadmap Generator Works

1. Fetches courses from your DB that match the user’s chosen category.
2. Sorts them by level (Beginner → Advanced) and prefers those matching the user’s skill level.
3. Uses up to 6 of those courses as core roadmap steps.
4. **Separately** calls YouTube API (via Edge Function) to fetch up to 3 relevant videos.
5. The roadmap page shows **both** the step list (from DB courses) and a **Recommended Videos** section (YouTube).

No generic “do exercise” placeholders – only real content.

## 🔐 Environment Variables & Secrets

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | `.env.local` & Vercel | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` & Vercel | Supabase anon key |
| `YOUTUBE_API_KEY` | Supabase Edge Function secret | Used by `search-youtube` function |



## 🙌 Acknowledgements

- [Supabase](https://supabase.com/) for the backend.
- [YouTube Data API](https://developers.google.com/youtube/v3) for video suggestions.
- [Tailwind CSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/).

---
