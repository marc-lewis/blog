# Architecture Specification

## Overview

The marclewis.io website is a server-rendered SvelteKit application with a PostgreSQL database, deployed on Railway. It follows a monolithic architecture suitable for a personal site with low-to-moderate traffic.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                               │
│                    (Browser / Mobile)                        │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Railway Platform                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   SvelteKit App                        │  │
│  │                  (Node.js runtime)                     │  │
│  │                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │  │
│  │  │   Routes    │  │   API       │  │   Admin      │   │  │
│  │  │  (SSR/SSG)  │  │  Endpoints  │  │   Panel      │   │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘   │  │
│  │         │                │                │            │  │
│  │         └────────────────┼────────────────┘            │  │
│  │                          ▼                             │  │
│  │              ┌─────────────────────┐                   │  │
│  │              │   Drizzle ORM       │                   │  │
│  │              └──────────┬──────────┘                   │  │
│  │                         │                              │  │
│  │                         ▼                              │  │
│  │              ┌─────────────────────┐                   │  │
│  │              │  PostgreSQL Database│                   │  │
│  │              │  (Railway Managed)  │                   │  │
│  │              └─────────────────────┘                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Application Layers

### Presentation Layer

**Routes (`src/routes/`)**
- Server-side rendered pages
- Public pages: Home, Blog, About, individual posts
- Admin pages: Dashboard, CRUD interfaces
- Uses SvelteKit's file-based routing

**Components (`src/lib/components/`)**
- Reusable UI components
- Svelte 5 with runes (`$props`, `$state`, etc.)
- Styled with Tailwind CSS

### Application Layer

**Server Logic (`src/lib/server/`)**
- Database operations
- Authentication logic
- Business rules validation
- Hash generation

**API Endpoints (`src/routes/api/`)**
- RESTful JSON endpoints
- Public endpoints for read operations
- Admin endpoints for mutations (authenticated)

### Data Layer

**Database (`src/lib/server/db/`)**
- Drizzle ORM for type-safe queries
- PostgreSQL for data persistence (Railway managed)
- Schema definitions and migrations

## Directory Structure

```
src/
├── app.css                 # Global styles
├── app.d.ts                # TypeScript declarations
├── app.html                # HTML template
├── hooks.server.ts         # Server hooks (auth middleware)
│
├── lib/
│   ├── components/         # Svelte components
│   │   ├── Chip.svelte
│   │   ├── Footer.svelte
│   │   ├── Header.svelte
│   │   ├── PostCard.svelte
│   │   └── admin/          # Admin-specific components
│   │       ├── Sidebar.svelte
│   │       ├── DataTable.svelte
│   │       └── MarkdownEditor.svelte
│   │
│   ├── server/             # Server-only code
│   │   ├── db/
│   │   │   ├── index.ts    # Database connection
│   │   │   └── schema.ts   # Drizzle schema
│   │   ├── auth.ts         # Authentication utilities
│   │   └── hash.ts         # Hash generation
│   │
│   └── utils/              # Shared utilities
│       ├── posts.ts        # Post helpers (to be refactored)
│       └── validation.ts   # Input validation
│
├── routes/
│   ├── +layout.svelte      # Root layout
│   ├── +page.svelte        # Homepage
│   ├── +page.server.ts     # Homepage data loading
│   │
│   ├── about/
│   │   └── +page.svelte
│   │
│   ├── blog/
│   │   ├── +page.svelte
│   │   ├── +page.server.ts
│   │   └── [slug]/
│   │       ├── +page.svelte
│   │       └── +page.server.ts
│   │
│   ├── tags/
│   │   ├── +page.svelte    # Tag listing
│   │   └── [slug]/
│   │       └── +page.svelte # Content by tag
│   │
│   ├── api/
│   │   ├── posts/
│   │   ├── todos/
│   │   ├── tags/
│   │   └── admin/          # Protected API routes
│   │
│   └── admin/
│       ├── +layout.svelte  # Admin layout with sidebar
│       ├── +page.svelte    # Dashboard
│       ├── login/
│       ├── todos/
│       ├── posts/
│       └── tags/
│
├── .env                    # Database connection string (gitignored)
│
└── drizzle/                # Database migrations
    └── migrations/
```

## Request Flow

### Public Page Request

```
1. Browser requests /blog/hello-world
2. SvelteKit route matched: src/routes/blog/[slug]/+page.server.ts
3. load() function queries database for post
4. +page.svelte renders with data
5. HTML sent to client
6. Svelte hydrates for interactivity
```

### Admin API Request

```
1. Admin submits form to create todo
2. Request hits /api/admin/todos
3. hooks.server.ts validates session cookie
4. If valid, request proceeds to +server.ts
5. Drizzle ORM inserts into SQLite
6. JSON response returned
7. UI updates with new todo
```

## Data Flow

### Server-Side Rendering (SSR)

```typescript
// src/routes/blog/+page.server.ts
export async function load() {
  const posts = await db.select()
    .from(postsTable)
    .where(eq(postsTable.published, true))
    .orderBy(desc(postsTable.publishedAt));
  
  return { posts };
}
```

### Form Actions

```typescript
// src/routes/admin/todos/new/+page.server.ts
export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    // Validate, insert, redirect
  }
};
```

### API Endpoints

```typescript
// src/routes/api/admin/todos/+server.ts
export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  // Validate, insert, return JSON
};
```

## Security Architecture

### Authentication Boundary

```
Public Routes          │  Protected Routes
───────────────────────┼─────────────────────
/                      │  /admin/*
/blog/*                │  /api/admin/*
/about                 │
/api/posts             │
/api/todos (read)      │
/api/tags              │
```

### Middleware (hooks.server.ts)

```typescript
export const handle: Handle = async ({ event, resolve }) => {
  // 1. Extract session cookie
  // 2. Validate session against database
  // 3. Attach session to event.locals
  // 4. Redirect to login if accessing /admin/* without session
  return resolve(event);
};
```

## Caching Strategy

### Static Assets
- Served with long cache headers
- Fingerprinted filenames for cache busting

### Dynamic Content
- SSR with no caching by default
- Consider adding `Cache-Control` headers for public pages
- API responses: No caching for admin, optional for public

## Error Handling

### Client Errors
- Form validation errors displayed inline
- Toast notifications for API errors
- Custom error pages (404, 500)

### Server Errors
- Logged to Railway's logging service
- Generic error message to client
- Error boundaries in Svelte components

## Technology Decisions

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | SvelteKit | Fast, modern, good DX |
| Rendering | SSR | SEO, performance |
| Database | PostgreSQL | Railway managed, no volume needed, scales well |
| ORM | Drizzle | Type-safe, lightweight |
| Styling | Tailwind CSS | Utility-first, rapid development |
| Markdown | mdsvex | Native Svelte markdown support |
| Auth | Sessions + bcrypt | Simple, secure, no external deps |
| Hosting | Railway | Easy deployment, persistent volumes |

## Scalability Considerations

The current architecture is designed for a personal site. If scaling becomes necessary:

1. **Caching**: Add Redis for session storage and caching
2. **CDN**: Put Cloudflare in front for edge caching
3. **Search**: Add Meilisearch for full-text search
4. **Images**: Use external image hosting (Cloudinary, S3)
5. **Read replicas**: Add PostgreSQL read replicas if read traffic grows

These changes are not anticipated but the architecture allows for them.
