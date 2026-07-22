# Startup Navigator

> AI-powered knowledge platform for startup founders — built with Next.js 16, JWT auth, OpenAI RAG, and Supabase.

**Live URL:** _https://your-deployment.vercel.app_ (update after deployment)

---

## 🔑 Login Credentials (for evaluation)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@startupnavigator.com` | `Admin@123456` |
| **User** | Register at `/sign-up` with any email | — |

---

## 🏗️ Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js 16 (App Router)                  │
├──────────────┬──────────────────────────────┬───────────────────┤
│  Public Pages │      Authenticated Pages     │    Admin Panel    │
│  /  /explore  │  /dashboard /dashboard/saved │  /admin           │
│  /resources   │  /dashboard/history /profile │  /admin/articles  │
│  /ai-search   │                              │  /admin/users     │
│  /articles/*  │                              │  /admin/ai        │
└──────┬────────┴──────────────┬───────────────┴───────┬───────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Routes (24 endpoints)                   │
│  /api/auth/*   /api/articles   /api/topics   /api/resources     │
│  /api/search   /api/saved      /api/history  /api/admin/*       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌─────────────┐  ┌────────────┐  ┌─────────────┐
   │  Supabase   │  │  OpenAI    │  │  Upstash    │
   │  PostgreSQL │  │  API       │  │  Redis      │
   │  + pgvector │  │            │  │  (optional) │
   └─────────────┘  └────────────┘  └─────────────┘
```

### Directory Structure

```
startup-navigator/
├── app/
│   ├── (auth)/          # Sign-in, Sign-up pages (no navbar)
│   ├── (main)/          # Public pages with shared Navbar + Footer
│   │   ├── page.tsx     # Homepage
│   │   ├── explore/     # Topic browser
│   │   ├── articles/    # Article detail pages
│   │   ├── resources/   # Curated tools & resources
│   │   └── ai-search/   # Public AI search page
│   ├── dashboard/       # Protected user dashboard
│   ├── admin/           # Role-protected admin panel
│   └── api/             # 24 REST API route handlers
├── components/
│   ├── auth/            # LoginForm, RegisterForm
│   ├── admin/           # ArticleEditor, ResourceManager, UserTable
│   ├── layout/          # Navbar, Footer, DashboardSidebar
│   ├── search/          # SearchInput, StreamingAnswer
│   └── shared/          # ArticleCard, TopicCard, SaveArticleButton
├── lib/
│   ├── ai/              # RAG pipeline (embeddings, vector search, prompts)
│   ├── auth/            # JWT sign/verify, cookies, session helpers
│   ├── cache/           # Redis client + rate limiter
│   ├── db/              # Drizzle ORM (schema, migrations, queries, seed)
│   ├── utils/           # API helpers, date, logger, slugify
│   └── validators/      # Zod schemas for all API inputs
├── store/               # Zustand auth store (client-side)
├── hooks/               # useSearch (AI streaming hook)
├── proxy.ts             # Next.js middleware (JWT auth + route protection)
└── types/               # Shared TypeScript types
```

### Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| **Auth** | Custom JWT (no Clerk/NextAuth) | Full control, no vendor lock-in, token rotation |
| **Database** | Supabase (PostgreSQL + pgvector) | Free tier, vector search built-in |
| **ORM** | Drizzle ORM | Type-safe, lightweight, great DX |
| **AI Search** | OpenAI embeddings + pgvector RAG | Semantic search over article knowledge base |
| **State** | Zustand (client) + Server Components (server) | Minimal client JS, fast page loads |
| **Styling** | Tailwind CSS v4 + shadcn/ui v4 | Production-quality components |
| **Deployment** | Vercel | Zero-config Next.js hosting |

---

## 🤖 AI Integration

### RAG Pipeline (Retrieval-Augmented Generation)

```
User Query
    │
    ▼
Generate Query Embedding (text-embedding-3-small)
    │
    ▼
pgvector Cosine Similarity Search  ──→  Top 5 article chunks
    │
    ▼
Build GPT-4o Prompt with context chunks
    │
    ▼
Stream response back to user (ReadableStream)
    │
    ▼
Store query + response in searches table
```

### AI Features

1. **Semantic Article Search** (`/api/search`)
   - Articles are chunked (500 tokens, 50-token overlap) and embedded using `text-embedding-3-small`
   - At query time, the user's question is embedded and compared via cosine similarity (`<=>` pgvector operator)
   - Top matching chunks are injected into a GPT-4o prompt
   - Response streams back character-by-character via `ReadableStream`

2. **Response Caching** (`lib/cache/redis.ts`)
   - Identical queries are cached in Upstash Redis for 6 hours (SHA-256 key)
   - Cache hits return instantly without hitting OpenAI

3. **Rate Limiting**
   - 10 requests/minute per IP using Upstash Ratelimit (sliding window)
   - Gracefully skipped if Redis is not configured

4. **Admin AI Knowledge Base** (`/admin/ai`)
   - Admins can re-embed individual articles or all published articles at once
   - Embedding status (chunk count) shown per article

### AI Tools & Models Used

| Model | Purpose |
|-------|---------|
| `text-embedding-3-small` | Article chunking → vector embeddings |
| `gpt-4o` | Answer synthesis from retrieved context |

---

## 💬 Prompts Used

### System Prompt (RAG Answer Generation)

```
You are a knowledgeable startup advisor for Startup Navigator, an AI-powered 
knowledge platform for founders. Your role is to answer questions about starting, 
funding, and scaling startups based ONLY on the provided knowledge base articles.

Guidelines:
- Answer based only on the provided context
- Be concise but comprehensive (aim for 200-400 words)
- Use markdown formatting (headers, bullet points, bold)
- If the context doesn't contain enough information, say so clearly
- Always be practical and actionable
- Cite specific concepts from the articles when relevant

Knowledge Base Context:
[Article chunks injected here at query time]
```

### Embedding Chunking Strategy

Articles are split into chunks of ~500 tokens with 50-token overlap to preserve context across chunk boundaries. Each chunk stores the article ID, chunk index, and the raw text for retrieval.

---

## 🚀 Deployment Process

### Prerequisites
- Node.js 20+, pnpm 9+
- Supabase project with `pgvector` extension enabled
- OpenAI API key

### Local Setup

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/startup-navigator.git
cd startup-navigator
pnpm install

# Configure environment
cp .env.example .env.local
# Fill in: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, OPENAI_API_KEY

# Run database migrations
pnpm db:migrate

# Seed the database (topics, articles, admin user)
pnpm db:seed

# Embed articles for AI search
pnpm ai:embed

# Start development server
pnpm dev
```

### Vercel Deployment

1. Push code to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Set environment variables (all from `.env.local` except `NEXT_PUBLIC_APP_URL` → set to your Vercel URL)
4. Deploy — Vercel auto-detects Next.js, zero config needed

### Environment Variables Required

```env
DATABASE_URL=          # Supabase connection pooler URL
JWT_SECRET=            # 64+ char random string
JWT_REFRESH_SECRET=    # 64+ char random string (different from above)
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
NEXT_PUBLIC_APP_URL=   # https://your-deployment.vercel.app
NEXT_PUBLIC_APP_NAME=Startup Navigator
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

---

## ✨ Feature Checklist

### Authentication
- [x] Register / Login / Logout
- [x] JWT access tokens (15 min) + refresh tokens (7 days)
- [x] Token rotation on every refresh
- [x] Refresh token hash stored in DB (prevents reuse)
- [x] Role-based access control (user / admin)
- [x] httpOnly cookies (XSS-safe)
- [x] Middleware route protection (`proxy.ts`)

### Public Pages
- [x] Homepage with hero, topic grid, featured articles
- [x] Explore topics page
- [x] Topic detail page (filtered articles)
- [x] Article detail page (markdown, tags, related articles)
- [x] Resources page (filterable by type & topic)
- [x] AI Search page (streaming, semantic search)

### User Dashboard
- [x] Dashboard overview (stats, recent searches, saved articles)
- [x] Search history (expandable, deletable, export JSON)
- [x] Saved articles (filterable by topic, unsave)
- [x] Profile (edit name, change password, delete account)

### Admin Panel
- [x] Dashboard with stats charts (Recharts)
- [x] Article management (create, edit, delete, markdown editor)
- [x] Resource management (CRUD)
- [x] User management (ban, unban, promote to admin)
- [x] AI Knowledge Base (per-article embedding status, re-embed)

### Polish
- [x] Dark mode (next-themes)
- [x] Loading skeletons for all data routes
- [x] Error boundaries (global + per route group)
- [x] Page transitions (Framer Motion)
- [x] Sitemap + robots.txt
- [x] Open Graph / Twitter Card metadata on every page
- [x] Accessibility: skip-nav link, aria labels, focus rings

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui v4 |
| Database | PostgreSQL via Supabase + pgvector |
| ORM | Drizzle ORM |
| Auth | Custom JWT (jsonwebtoken + bcrypt) |
| AI | OpenAI API (embeddings + chat) |
| Cache | Upstash Redis (optional) |
| State | Zustand + TanStack Query |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Animations | Framer Motion |
| Deployment | Vercel |

---

## 🧪 Testing

```bash
pnpm type-check   # TypeScript — 0 errors
pnpm build        # Production build — 44 routes, 0 errors
```

All 21 API endpoints verified end-to-end (auth, public, protected, admin).
