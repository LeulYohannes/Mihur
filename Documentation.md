# Mihur – Documentation

## 1. Overview

**Mihur** is a web-based platform that helps learners discover and save free online courses from multiple providers (Coursera, edX, Khan Academy, FutureLearn). It offers a questionnaire‑based personalization, category browsing, and a “My Learning” area where users can bookmark courses for later.

The application is built with **React (TypeScript)** and **Supabase** as the backend (authentication + database). No internal course hosting – users are redirected to the original provider.

---

## 2. Features

- 🔍 **Aggregated course discovery** – browse by category or search (search UI is present, backend integration can be extended).
- 📚 **Category pages** – each category shows its own set of courses.
- ❤️ **Save courses** – authenticated users can bookmark courses into “My Learning”.
- 📝 **Questionnaire** – users can store learning preferences (category, skill level, goal, etc.) in their profile.
- 🔐 **Authentication** – email/password sign‑up and sign‑in via Supabase Auth.
- 🎨 **Modern dark‑mode UI** – Tailwind CSS + Framer Motion animations.

---

## 3. Tech Stack

| Layer          | Technology                                                                 |
|----------------|----------------------------------------------------------------------------|
| Frontend       | React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion, Lucide React    |
| Routing        | React Router DOM 7                                                         |
| Backend (BaaS) | **Supabase** – PostgreSQL database + authentication (Row Level Security)   |
| Icons          | Lucide React (mapped via `iconMap.ts`)                                     |
| Build tool     | Vite 6                                                                     |
| Package manager| npm (see `package.json`)                                                   |

---

## 4. Project Structure

```
Mihur/
├── .env.local                 # Supabase keys (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── metadata.json              # AI Studio metadata
├── context.md                 # Original project spec (can be ignored)
├── README.md                  # Original placeholder
│
└── src/
    ├── main.tsx               # Entry point, wraps App with AuthProvider
    ├── App.tsx                # Routes + Navbar + Footer
    ├── index.css              # Global Tailwind + custom CSS variables
    ├── types.ts               # Course, Category interfaces
    │
    ├── lib/
    │   ├── supabase.ts        # Supabase client initialisation
    │   └── iconMap.ts         # Maps category icon names to Lucide components
    │
    ├── contexts/
    │   └── AuthContext.tsx    # Supabase auth state provider (useAuth hook)
    │
    ├── components/
    │   ├── Navbar.tsx
    │   ├── CategoryCard.tsx
    │   └── CourseCard.tsx     # Includes save/un‑save heart button
    │
    └── pages/
        ├── HomePage.tsx       # Hero, featured categories, popular courses
        ├── CategoriesPage.tsx # List all categories with tabs
        ├── CategoryDetailPage.tsx  # Courses filtered by category
        ├── MyLearningPage.tsx      # Saved courses for authenticated user
        ├── Questionnaire.tsx       # Learning preferences form (Upsert to user_profiles)
        └── AuthPage.tsx            # Sign in / Sign up
```

---

## 5. Database Schema (Supabase)

Based on the code, the following tables are expected:

### `categories`
| Column       | Type      | Description                       |
|--------------|-----------|-----------------------------------|
| `id`         | text (PK) | e.g., 'tech', 'business'          |
| `name`       | text      | Display name                      |
| `description`| text      | Short description                 |
| `icon_name`  | text      | Maps to Lucide icon via iconMap.ts|

### `courses`
| Column        | Type      | Description                         |
|---------------|-----------|-------------------------------------|
| `id`          | text (PK) | Course identifier                   |
| `title`       | text      |                                     |
| `provider`    | text      | e.g., 'Coursera'                    |
| `duration`    | text      | e.g., '24h total'                   |
| `level`       | text      | 'Beginner' / 'Intermediate' / 'Advanced' |
| `description` | text      |                                     |
| `image`       | text      | Unsplash / external URL             |
| `url`         | text      | Direct link to course               |
| `category_id` | text (FK) | References `categories.id`          |

### `saved_courses` (many‑to‑many between users and courses)
| Column        | Type      | Description                         |
|---------------|-----------|-------------------------------------|
| `id`          | (optional, can be composite) |   |
| `user_id`     | uuid (FK) | References `auth.users`             |
| `course_id`   | text (FK) | References `courses.id`             |
| `created_at`  | timestamp | Default `now()`                     |

> *Note: The code uses `user_id` and `course_id` without an explicit `id` column – Supabase automatically adds a primary key if not defined.*

### `user_profiles` (store questionnaire answers)
| Column          | Type      | Description                         |
|-----------------|-----------|-------------------------------------|
| `user_id`       | uuid (PK) | References `auth.users`             |
| `category`      | text      | e.g., 'tech'                        |
| `skill_level`   | text      | 'Beginner' / 'Intermediate' / 'Advanced' |
| `reason`        | text      | 'Employment' / 'Supplement' / 'General' |
| `weekly_hours`  | integer   |                                     |
| `goal`          | text      | free text                           |
| `experience`    | text      | 'None' / 'Minor' / 'Familiar' / 'Expert' |
| `updated_at`    | timestamp |                                     |

---

## 6. Environment Variables

Create a `.env.local` file in the root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> The current configuration (from the provided files) points to a specific Supabase instance. For a new deployment, replace with your own Supabase project keys.

---

## 7. Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm

### Steps

1. **Clone the repository**
   ```bash
   git clone <repo-url>
  cd Mihur
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project.
   - Run the SQL schema (see below) in the Supabase SQL editor.
   - Copy your project URL and anon key into `.env.local`.

4. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## 8. Database Setup SQL (Run once in Supabase)

```sql
-- Create tables
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  duration TEXT NOT NULL,
  level TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  url TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_courses (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT,
  skill_level TEXT,
  reason TEXT,
  weekly_hours INTEGER,
  goal TEXT,
  experience TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert sample categories (12 entries from your script)
INSERT INTO categories (id, name, icon_name, description) VALUES
  ('tech', 'Tech', 'Terminal', 'Coding, AI, Cybersecurity, and Cloud Computing.'),
  ('business', 'Business', 'Briefcase', 'Entrepreneurship, Finance, and Management.'),
  ('science', 'Science', 'FlaskConical', 'Physics, Biology, Chemistry, and Astronomy.'),
  ('design', 'Design', 'Palette', 'UI/UX, Graphic Design, and Motion Graphics.'),
  ('languages', 'Languages', 'Languages', 'Spanish, French, Mandarin, and more.'),
  ('arts', 'Arts', 'Theater', 'History, Literature, and Philosophy.'),
  ('marketing', 'Marketing', 'Megaphone', 'Digital Marketing, SEO, and Brand Strategy.'),
  ('health', 'Health', 'Heart', 'Nutrition, Fitness, and Mental Wellness.'),
  ('personal-dev', 'Personal Dev', 'User', 'Productivity, Leadership, and Soft Skills.'),
  ('math', 'Math', 'Calculator', 'Calculus, Statistics, and Discrete Math.'),
  ('music', 'Music', 'Music', 'Theory, Production, and Instrument Mastery.'),
  ('photography', 'Photography', 'Camera', 'Composition, Lighting, and Post-Processing.')
ON CONFLICT (id) DO NOTHING;

-- Insert a few sample courses (you can add more from your original INSERT script)
INSERT INTO courses (id, title, provider, duration, level, description, image, url, category_id) VALUES
  ('1','Neural Networks 101','Coursera','24h total','Intermediate','Master the fundamentals of deep learning...','https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80','https://www.coursera.org/learn/neural-networks-deep-learning','tech'),
  ('2','Python for Data Science','Coursera','30h total','Beginner','Start your journey into data analysis...','https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80','https://www.coursera.org/learn/python-for-applied-data-science','tech')
ON CONFLICT (id) DO NOTHING;
```

> **Important**: Enable Row Level Security (RLS) and create policies for `saved_courses` and `user_profiles` so that users can only access their own rows. Example policy:
> ```sql
> CREATE POLICY "Users can manage their own saved courses"
>   ON saved_courses FOR ALL USING (auth.uid() = user_id);
> ```

---

## 9. Available Scripts

| Command          | Description                                      |
|------------------|--------------------------------------------------|
| `npm run dev`    | Starts Vite dev server on port 3000              |
| `npm run build`  | Builds the production bundle to `dist/`          |
| `npm run preview`| Serves the production build locally              |
| `npm run lint`   | Runs TypeScript type checking without emitting   |
| `npm run clean`  | Deletes the `dist/` folder                       |

---

## 10. Key Implementation Details

### Authentication Flow
- `AuthContext` provides `user`, `session`, and `signOut`.
- Protected routes (e.g., `/my-learning`, `/questionnaire`) check `user` and show a login prompt if not authenticated.

### Save/Unsave Courses
- `CourseCard` fetches saved status for the current user using a `saved_courses` query.
- Clicking the heart toggles insertion/deletion in `saved_courses`.

### Questionnaire Persistence
- On page load, the questionnaire reads existing data from `user_profiles`.
- On submit, it performs an `upsert` (insert or update) based on `user_id`.

### Icon Mapping
- `iconMap.ts` maps database `icon_name` (e.g., `'Terminal'`) to a Lucide React component.
- Fallback is `HelpCircle`.

---

## 11. Deployment

The project is ready to be deployed on **Netlify**, **Vercel**, or any static host that supports single‑page apps (SPA).

### Deploy to Netlify
1. Build the project: `npm run build`
2. Deploy the `dist/` folder.
3. Set environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify’s UI.
4. Configure redirects for client‑side routing: create a `_redirects` file in `public/` with:
   ```
   /* /index.html 200
   ```

### Deploy to Vercel
- Connect the Git repository – Vercel automatically detects Vite and sets the build command.

---

## 12. Future Improvements (from original spec)

- Full‑text search across courses (currently only a UI placeholder).
- Recommendation engine based on questionnaire answers.
- Integration with external course APIs (Coursera, edX) to keep data fresh.
- Progress tracking and completion certificates.

---

## 13. Troubleshooting

| Error                                   | Solution                                                         |
|-----------------------------------------|------------------------------------------------------------------|
| `relation "categories" already exists`  | Use `CREATE TABLE IF NOT EXISTS` or drop tables first (see SQL above). |
| `saved_courses` or `user_profiles` missing | Create the tables using the provided schema.                  |
| User cannot save courses (RLS error)    | Enable RLS and add policies that allow `auth.uid() = user_id`.   |
| Environment variables not loaded        | Ensure `.env.local` exists and variables are prefixed with `VITE_`. |

---

## 14. License

This project is for educational/demo purposes. All external course links and provider trademarks are property of their respective owners.