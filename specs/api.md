# API Specification

## Overview

The API provides RESTful endpoints for managing todos, blog posts, and tags. All endpoints under `/api/admin/*` require authentication.

## Base URL

- **Development**: `http://localhost:5173/api`
- **Production**: `https://marclewis.io/api`

## Authentication

Admin endpoints require a valid session cookie. See [authentication.md](authentication.md).

Unauthenticated requests to admin endpoints return `401 Unauthorized`.

## Response Format

All responses are JSON with the following structure:

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Description is required",
    "details": {
      "field": "description"
    }
  }
}
```

## Public Endpoints

### GET /api/posts

List published blog posts.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| tag | string | - | Filter by tag slug |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "hello-world",
      "title": "Hello World",
      "description": "My first post",
      "tags": ["meta"],
      "publishedAt": "2026-01-22T00:00:00Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

### GET /api/posts/:slug

Get a single published post by slug.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "slug": "hello-world",
    "title": "Hello World",
    "description": "My first post",
    "content": "# Hello World\n\nThis is my first post...",
    "tags": ["meta"],
    "hashes": ["000001"],
    "publishedAt": "2026-01-22T00:00:00Z"
  }
}
```

### GET /api/todos

List uncompleted todos (public view).

**Response:**
```json
{
  "data": [
    {
      "hash": "000001",
      "emoji": "🤖",
      "description": "set up blog",
      "tags": ["blog", "infra"]
    }
  ]
}
```

### GET /api/tags

List all tags.

**Response:**
```json
{
  "data": [
    {
      "slug": "blog",
      "name": "Blog",
      "colour": "#3B82F6"
    }
  ]
}
```

### GET /api/tags/:slug

Get tag with associated content.

**Response:**
```json
{
  "data": {
    "slug": "blog",
    "name": "Blog",
    "description": "Blog-related content",
    "colour": "#3B82F6",
    "todos": [...],
    "posts": [...]
  }
}
```

---

## Admin Endpoints

All admin endpoints require authentication.

### Todos

#### GET /api/admin/todos

List all todos (including completed).

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 50 | Items per page |
| completed | boolean | - | Filter by completion status |
| tag | string | - | Filter by tag slug |
| search | string | - | Search in description |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "hash": "000001",
      "emoji": "🤖",
      "description": "set up blog",
      "tags": ["blog", "infra"],
      "completed": false,
      "createdAt": "2026-01-22T00:00:00Z",
      "updatedAt": "2026-01-22T00:00:00Z"
    }
  ],
  "meta": { ... }
}
```

#### POST /api/admin/todos

Create a new todo.

**Request Body:**
```json
{
  "emoji": "🔧",
  "description": "Fix navigation bug",
  "tags": ["bug", "frontend"]
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "hash": "000003",
    "emoji": "🔧",
    "description": "Fix navigation bug",
    "tags": ["bug", "frontend"],
    "completed": false,
    "createdAt": "2026-01-22T10:30:00Z"
  }
}
```

#### GET /api/admin/todos/:id

Get a single todo by ID.

#### PUT /api/admin/todos/:id

Update a todo.

**Request Body:**
```json
{
  "description": "Fix navigation bug on mobile",
  "tags": ["bug", "frontend", "mobile"],
  "completed": true
}
```

**Response:** `200 OK`

#### DELETE /api/admin/todos/:id

Soft delete a todo.

**Response:** `204 No Content`

---

### Blog Posts

#### GET /api/admin/posts

List all posts (including drafts).

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| published | boolean | - | Filter by publication status |
| tag | string | - | Filter by tag slug |
| search | string | - | Search in title/content |

#### POST /api/admin/posts

Create a new post.

**Request Body:**
```json
{
  "title": "My New Post",
  "slug": "my-new-post",
  "description": "A brief description",
  "content": "# My New Post\n\nContent here...",
  "tags": ["tech", "tutorial"],
  "hashes": ["000001"],
  "published": false
}
```

**Response:** `201 Created`

#### GET /api/admin/posts/:id

Get a single post by ID (includes unpublished).

#### PUT /api/admin/posts/:id

Update a post.

**Request Body:**
```json
{
  "title": "My Updated Post",
  "content": "Updated content...",
  "published": true
}
```

#### DELETE /api/admin/posts/:id

Delete a post.

**Response:** `204 No Content`

---

### Tags

#### GET /api/admin/tags

List all tags with usage counts.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "blog",
      "name": "Blog",
      "description": "Blog-related content",
      "colour": "#3B82F6",
      "todoCount": 5,
      "postCount": 3
    }
  ]
}
```

#### POST /api/admin/tags

Create a new tag.

**Request Body:**
```json
{
  "name": "Tutorial",
  "description": "Step-by-step guides",
  "colour": "#10B981"
}
```

#### PUT /api/admin/tags/:slug

Update a tag.

#### DELETE /api/admin/tags/:slug

Delete a tag.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| force | boolean | false | Delete even if in use (removes associations) |

**Response:** `204 No Content` or `409 Conflict` if in use and force=false.

---

## SvelteKit Implementation

### API Route Structure

```
src/routes/api/
├── posts/
│   ├── +server.ts          # GET /api/posts
│   └── [slug]/
│       └── +server.ts      # GET /api/posts/:slug
├── todos/
│   └── +server.ts          # GET /api/todos
├── tags/
│   ├── +server.ts          # GET /api/tags
│   └── [slug]/
│       └── +server.ts      # GET /api/tags/:slug
└── admin/
    ├── posts/
    │   ├── +server.ts      # GET, POST /api/admin/posts
    │   └── [id]/
    │       └── +server.ts  # GET, PUT, DELETE /api/admin/posts/:id
    ├── todos/
    │   ├── +server.ts      # GET, POST /api/admin/todos
    │   └── [id]/
    │       └── +server.ts  # GET, PUT, DELETE /api/admin/todos/:id
    └── tags/
        ├── +server.ts      # GET, POST /api/admin/tags
        └── [slug]/
            └── +server.ts  # GET, PUT, DELETE /api/admin/tags/:slug
```

### Example Endpoint Implementation

```typescript
// src/routes/api/admin/todos/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { todos, todoTags } from '$lib/server/db/schema';
import { generateHash } from '$lib/server/hash';

export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.session) {
    throw error(401, 'Unauthorized');
  }
  
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const limit = parseInt(url.searchParams.get('limit') ?? '50');
  const completed = url.searchParams.get('completed');
  
  const query = db.select().from(todos);
  
  if (completed !== null) {
    query.where(eq(todos.completed, completed === 'true'));
  }
  
  const results = await query
    .limit(limit)
    .offset((page - 1) * limit);
  
  return json({ data: results, meta: { page, limit } });
};

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.session) {
    throw error(401, 'Unauthorized');
  }
  
  const body = await request.json();
  
  // Validation
  if (!body.emoji || !body.description) {
    throw error(400, 'Emoji and description are required');
  }
  
  const hash = await generateHash();
  
  const [todo] = await db.insert(todos).values({
    id: crypto.randomUUID(),
    hash,
    emoji: body.emoji,
    description: body.description,
  }).returning();
  
  // Add tags
  if (body.tags?.length) {
    await db.insert(todoTags).values(
      body.tags.map((tag: string) => ({
        todoId: todo.id,
        tagSlug: tag,
      }))
    );
  }
  
  return json({ data: todo }, { status: 201 });
};
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| CONFLICT | 409 | Resource conflict (e.g., duplicate slug) |
| INTERNAL_ERROR | 500 | Server error |
