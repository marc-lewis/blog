# Todos Specification

## Overview

Todos are the primary task tracking feature of the site. Each todo represents a task or item to be completed, displayed prominently on the homepage.

## Data Model

```typescript
interface Todo {
  id: string;          // Auto-generated, see hashes.md
  hash: string;        // 6-digit unique identifier (e.g., "000001")
  emoji: string;       // Single emoji representing the task category
  description: string; // Brief description of the todo
  tags: string[];      // Array of tag slugs
  completed: boolean;  // Completion status
  createdAt: Date;     // Timestamp of creation
  updatedAt: Date;     // Timestamp of last update
  completedAt?: Date;  // Timestamp when marked complete (optional)
}
```

## Hash System

Each todo is assigned a unique 6-digit hash upon creation. See [hashes.md](hashes.md) for the full specification.

Display format: `#000001`

## Fields

### emoji
- Single emoji character
- Used for visual categorisation
- Examples: 🤖 (tech), 📝 (writing), 🎨 (design), 🔧 (maintenance)

### description
- Plain text, no markdown
- Maximum 280 characters
- Should be concise and actionable

### tags
- Array of tag slugs
- Tags are shared with blog posts
- See [tags.md](tags.md) for tag specification

### completed
- Boolean flag
- When set to `true`, `completedAt` should be populated
- Completed todos may be hidden from the homepage but remain in the database

## Display Requirements

### Homepage
- Show uncompleted todos
- Display in creation order (oldest first) or custom order
- Format: `#[hash] [emoji] [description] [tags...]`
- Tags rendered as Chip components

### Admin Panel
- Full CRUD interface
- Filter by completion status
- Filter/search by tags
- Bulk operations (mark complete, delete)

## Business Rules

1. Hash must be unique across all todos (past and present)
2. Hash cannot be modified after creation
3. Completed todos should not be permanently deleted (soft delete recommended)
4. At least one tag is recommended but not required
5. Emoji is required

## API Endpoints

See [api.md](api.md) for full endpoint specifications.

- `GET /api/todos` - List todos
- `POST /api/todos` - Create todo
- `GET /api/todos/:id` - Get single todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo (soft delete)
