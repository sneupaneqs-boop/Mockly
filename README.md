# Mockly — ACCA CBE Practice Platform

A pixel-matched ACCA CBE exam simulator built with React + Vite, Tailwind CSS, and Supabase.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema below in the Supabase SQL editor
3. Copy your project URL and anon key

### 3. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_EMAILS=your@email.com
```

### 4. Import questions

```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_KEY=your-service-role-key \
node scripts/importPM.js
```

Uses the **service role key** (not anon key) to bypass RLS. Find it in Supabase → Settings → API.

### 5. Dev server

```bash
npm run dev
```

### 6. Grant yourself access

Go to `/admin`, find your user UUID in Supabase → Authentication → Users, paste it in and grant PM access.

---

## Deploy to Netlify

1. Push to GitHub
2. Connect repo in Netlify
3. Set environment variables in Netlify → Site Settings → Environment Variables
4. Deploy — `netlify.toml` handles the build and SPA redirect

---

## Supabase Schema

```sql
create table user_access (
  user_id uuid references auth.users,
  subject text,
  primary key (user_id, subject)
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  subject text default 'PM',
  section text,
  topic_number int,
  topic_name text,
  category text,
  exam_session text,
  scenario text,
  q_number int,
  question_text text,
  options jsonb,
  correct_answer text,
  answer_type text,
  explanation text
);

create table section_c (
  id uuid primary key default gen_random_uuid(),
  subject text default 'PM',
  topic_number int,
  topic_name text,
  exam_session text,
  category text,
  scenario text,
  parts jsonb
);

create table mock_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  subject text,
  chapters_selected jsonb,
  created_at timestamptz default now(),
  completed_at timestamptz,
  score_a int,
  score_b int
);

create table mock_questions (
  id uuid primary key default gen_random_uuid(),
  mock_id uuid references mock_sessions,
  question_id uuid,
  question_table text,
  section text,
  user_answer text,
  is_correct boolean,
  display_order int
);

create table used_questions (
  user_id uuid references auth.users,
  question_id uuid,
  question_table text,
  primary key (user_id, question_id, question_table)
);
```

### Row Level Security

Enable RLS on all tables and add these policies:

```sql
-- user_access: users can read their own rows
alter table user_access enable row level security;
create policy "own access" on user_access for select using (auth.uid() = user_id);

-- questions / section_c: authenticated users can read
alter table questions enable row level security;
create policy "read questions" on questions for select to authenticated using (true);

alter table section_c enable row level security;
create policy "read section_c" on section_c for select to authenticated using (true);

-- mock_sessions: own rows only
alter table mock_sessions enable row level security;
create policy "own sessions" on mock_sessions for all using (auth.uid() = user_id);

-- mock_questions: own mocks only
alter table mock_questions enable row level security;
create policy "own mock questions" on mock_questions for all
  using (mock_id in (select id from mock_sessions where user_id = auth.uid()));

-- used_questions: own rows only
alter table used_questions enable row level security;
create policy "own used" on used_questions for all using (auth.uid() = user_id);
```

---

## File Structure

```
src/
  lib/
    supabase.js          Supabase client
    AuthContext.jsx      Auth provider + hook
  components/
    ProtectedRoute.jsx
  pages/
    Login.jsx
    Dashboard.jsx
    Subject.jsx          Browse questions by chapter
    MockCreate.jsx       Topic selection + mock generation
    Mock.jsx             CBE exam interface
    MockResults.jsx      Results, marking, explanations
    Admin.jsx            Grant user access
scripts/
  importPM.js            Bulk import Kaplan.json → Supabase
```
