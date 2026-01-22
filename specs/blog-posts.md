# Blog Posts Specification

## Overview

Blog posts are long-form content published on the site. Posts can be tagged with keywords and optionally linked to todo hashes to show related work.

## Data Model

```typescript
interface BlogPost {
  id: string;           // Auto-generated UUID
  slug: string;         // URL-friendly identifier (e.g., "hello-world")
  title: string;        // Post title
  description: string;  // Brief summary for previews and SEO
  content: string;      // Markdown content body
  tags: string[];       // Array of tag slugs
  hashes: string[];     // Array of related todo hashes (optional)
  published: boolean;   // Publication status
  createdAt: Date;      // Timestamp of creation
  updatedAt: Date;      // Timestamp of last update
  publishedAt?: Date;   // Timestamp when first published (optional)
}
```

## Fields

### slug
- Auto-generated from title on creation
- Can be manually overridden
- Must be unique
- Lowercase, hyphenated (e.g., "my-first-post")
- Used in URL: `/blog/[slug]`

### title
- Plain text
- Maximum 200 characters
- Required

### description
- Plain text
- Maximum 500 characters
- Used in post cards and meta descriptions
- Required

### content
- Full markdown support
- Rendered via mdsvex
- Supports code blocks with syntax highlighting (Shiki)
- No character limit

### tags
- Array of tag slugs
- Shared tag system with todos
- See [tags.md](tags.md)

### hashes
- Array of todo hash strings (e.g., ["000001", "000002"])
- Links the post to related todos
- Displayed on the post page
- Optional

### published
- Boolean flag
- Unpublished posts are drafts, visible only in admin
- When first set to `true`, `publishedAt` is populated

## Display Requirements

### Blog Listing (`/blog`)
- Show only published posts
- Sort by `publishedAt` descending (newest first)
- Display as PostCard components
- Show title, description, date, and tags

### Individual Post (`/blog/[slug]`)
- Full post rendering
- Display related todo hashes if present
- Show tags as clickable Chips
- Display formatted date and reading time

### Homepage
- Show 4 most recent published posts
- Same PostCard format as blog listing

### Admin Panel
- Full CRUD interface
- Markdown editor with preview
- Draft/publish toggle
- Tag selection
- Hash linking interface

## Migration

The current system stores posts as static markdown files in `src/lib/posts/`. Migration to database:

1. Create database schema
2. Write migration script to import existing posts
3. Update `getPosts()` utility to query database
4. Remove static markdown files after verification

## SEO

Each post should generate:
- `<title>` tag: `[title] - Marc Lewis`
- `<meta name="description">`: Post description
- Open Graph tags for social sharing

## API Endpoints

See [api.md](api.md) for full endpoint specifications.

- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
