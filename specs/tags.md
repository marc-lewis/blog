# Tags Specification

## Overview

Tags are keywords used to categorise and organise both todos and blog posts. They provide a unified taxonomy across all content types.

## Data Model

```typescript
interface Tag {
  id: string;          // Auto-generated UUID
  slug: string;        // URL-friendly identifier (e.g., "infrastructure")
  name: string;        // Display name (e.g., "Infrastructure")
  description?: string; // Optional description of the tag
  colour?: string;     // Optional hex colour for display (e.g., "#FF5733")
  createdAt: Date;     // Timestamp of creation
  updatedAt: Date;     // Timestamp of last update
}
```

## Fields

### slug
- Lowercase
- Hyphenated (spaces become hyphens)
- No special characters except hyphens
- Maximum 50 characters
- Must be unique
- Used in URLs and as the reference key

### name
- Display name with proper capitalisation
- Maximum 100 characters
- Required

### description
- Optional explanatory text
- Maximum 500 characters
- Useful for tag management in admin

### colour
- Optional hex colour code
- Used for visual differentiation in UI
- Format: `#RRGGBB`

## Slug Generation

```typescript
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')       // Spaces to hyphens
    .replace(/-+/g, '-');       // Collapse multiple hyphens
}
```

## Relationships

### Todos
- Many-to-many relationship
- Stored as array of tag slugs on todo
- Join table: `todo_tags`

### Blog Posts
- Many-to-many relationship
- Stored as array of tag slugs on post
- Join table: `post_tags`

```typescript
// Join tables
interface TodoTag {
  todoId: string;
  tagSlug: string;
}

interface PostTag {
  postId: string;
  tagSlug: string;
}
```

## Display

### Chip Component
Tags are rendered using the existing `Chip.svelte` component:

```svelte
<Chip label={tag.name} href="/tags/{tag.slug}" />
```

### Tag Pages (Future)
- `/tags` - List all tags with counts
- `/tags/[slug]` - Show all content with that tag

## Existing Tags

From the current codebase, these tags are in use:

| Slug | Name | Used In |
|------|------|---------|
| blog | Blog | Todos |
| infra | Infra | Todos |
| content | Content | Todos |
| meta | Meta | Blog Posts |

## Business Rules

1. **Unique slugs**: Tag slugs must be unique
2. **Case-insensitive**: "Blog" and "blog" are the same tag
3. **No orphan tags**: Tags with no associated content may be flagged for cleanup
4. **Shared taxonomy**: Todos and blog posts use the same tag pool
5. **Dynamic creation**: New tags can be created on-the-fly when adding content (admin only)

## Admin Features

- Create, edit, delete tags
- Merge duplicate tags
- View tag usage statistics
- Bulk re-tagging

## API Endpoints

See [api.md](api.md) for full endpoint specifications.

- `GET /api/tags` - List all tags
- `POST /api/tags` - Create tag
- `GET /api/tags/:slug` - Get single tag with related content
- `PUT /api/tags/:slug` - Update tag
- `DELETE /api/tags/:slug` - Delete tag (fails if in use, or force option)
