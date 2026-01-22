# Database Specification

## Overview

The application requires persistent storage for todos, blog posts, tags, and user accounts. This document specifies the database schema and requirements.

## Database Selection

### Recommended: PostgreSQL with Drizzle ORM

**Rationale:**
- Railway provides managed PostgreSQL with automatic backups
- No persistent volume management required
- Better concurrent connection handling than SQLite
- Scales well if traffic grows
- Drizzle provides type-safe queries and migrations
- Easy local development with Docker or local PostgreSQL

**Alternative Options:**
- SQLite (simpler but requires persistent volume on Railway)
- Turso (SQLite-compatible, distributed, edge-friendly)

## Schema

### Tables

```sql
-- Users table (for admin authentication)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Todos table
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  hash TEXT UNIQUE NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Blog posts table
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Tags table
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  colour TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Todo-Tag junction table
CREATE TABLE todo_tags (
  todo_id TEXT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  tag_slug TEXT NOT NULL REFERENCES tags(slug) ON DELETE CASCADE,
  PRIMARY KEY (todo_id, tag_slug)
);

-- Post-Tag junction table
CREATE TABLE post_tags (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_slug TEXT NOT NULL REFERENCES tags(slug) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_slug)
);

-- Post-Hash junction table (linking posts to related todos)
CREATE TABLE post_hashes (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  hash TEXT NOT NULL REFERENCES todos(hash) ON DELETE CASCADE,
  PRIMARY KEY (post_id, hash)
);

-- Sessions table (for authentication)
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Drizzle Schema

```typescript
// src/lib/server/db/schema.ts
import { pgTable, text, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const todos = pgTable('todos', {
  id: text('id').primaryKey(),
  hash: text('hash').unique().notNull(),
  emoji: text('emoji').notNull(),
  description: text('description').notNull(),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  content: text('content').notNull(),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  publishedAt: timestamp('published_at'),
});

export const tags = pgTable('tags', {
  id: text('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  colour: text('colour'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const todoTags = pgTable('todo_tags', {
  todoId: text('todo_id').notNull().references(() => todos.id, { onDelete: 'cascade' }),
  tagSlug: text('tag_slug').notNull().references(() => tags.slug, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.todoId, table.tagSlug] }),
}));

export const postTags = pgTable('post_tags', {
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tagSlug: text('tag_slug').notNull().references(() => tags.slug, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.postId, table.tagSlug] }),
}));

export const postHashes = pgTable('post_hashes', {
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  hash: text('hash').notNull().references(() => todos.hash, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.postId, table.hash] }),
}));

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

## Indexes

```sql
CREATE INDEX idx_todos_hash ON todos(hash);
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

## Dependencies

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

## Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

```typescript
// src/lib/server/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

## Database Connection

- **Development**: Local PostgreSQL or Docker container
  ```bash
  # Example Docker command
  docker run --name marclewis-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=marclewis -p 5432:5432 -d postgres:16
  ```
  ```
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marclewis
  ```
- **Production**: Railway managed PostgreSQL (connection string provided automatically via `DATABASE_URL` environment variable)

## Migrations

Use Drizzle Kit for migrations:

```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate

# Push schema directly (development)
npm run db:push
```

## Seeding

Initial seed script for development:

```typescript
// scripts/seed.ts
import { db } from '$lib/server/db';
import { todos, tags, todoTags } from '$lib/server/db/schema';

async function seed() {
  // Create initial tags
  await db.insert(tags).values([
    { id: '1', slug: 'blog', name: 'Blog' },
    { id: '2', slug: 'infra', name: 'Infrastructure' },
    { id: '3', slug: 'content', name: 'Content' },
    { id: '4', slug: 'meta', name: 'Meta' },
  ]);

  // Create initial todos
  await db.insert(todos).values([
    { id: '1', hash: '000001', emoji: '🤖', description: 'set up blog' },
    { id: '2', hash: '000002', emoji: '📝', description: 'write first post' },
  ]);

  // Link todos to tags
  await db.insert(todoTags).values([
    { todoId: '1', tagSlug: 'blog' },
    { todoId: '1', tagSlug: 'infra' },
    { todoId: '2', tagSlug: 'content' },
    { todoId: '2', tagSlug: 'blog' },
  ]);
}
```

## Backup Strategy

- Railway: Automatic daily backups with point-in-time recovery (included with managed PostgreSQL)
- Manual: `pg_dump` for on-demand backups
- Export: JSON export functionality in admin panel (future)
