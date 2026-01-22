# Admin Panel Specification

## Overview

The admin panel provides a secure interface for managing todos, blog posts, and tags. It is accessible only to authenticated administrators.

## Routes

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard overview |
| `/admin/todos` | Todo list and management |
| `/admin/todos/new` | Create new todo |
| `/admin/todos/:id` | Edit existing todo |
| `/admin/posts` | Blog post list and management |
| `/admin/posts/new` | Create new blog post |
| `/admin/posts/:id` | Edit existing blog post |
| `/admin/tags` | Tag management |

## Dashboard (`/admin`)

### Overview Statistics
- Total todos (completed/uncompleted)
- Total blog posts (published/draft)
- Total tags
- Recent activity feed

### Quick Actions
- Create new todo
- Create new blog post
- View site

## Todos Management (`/admin/todos`)

### List View
- Sortable table of all todos
- Columns: Hash, Emoji, Description, Tags, Status, Created, Actions
- Filters: All, Completed, Uncompleted
- Search by description or hash
- Bulk actions: Mark complete, Delete

### Create/Edit Form
Fields:
- **Emoji** (required): Emoji picker or text input
- **Description** (required): Text input, max 280 chars
- **Tags**: Multi-select dropdown with typeahead, ability to create new
- **Completed**: Checkbox (edit only)

Hash is auto-generated on creation and displayed read-only on edit.

## Blog Posts Management (`/admin/posts`)

### List View
- Sortable table of all posts
- Columns: Title, Slug, Status, Tags, Published Date, Actions
- Filters: All, Published, Drafts
- Search by title or content

### Create/Edit Form
Fields:
- **Title** (required): Text input
- **Slug**: Auto-generated, manually overridable
- **Description** (required): Textarea, max 500 chars
- **Content** (required): Markdown editor with live preview
- **Tags**: Multi-select dropdown with typeahead
- **Hashes**: Multi-select to link related todos
- **Published**: Toggle switch

### Markdown Editor Requirements
- Syntax highlighting
- Live preview pane
- Toolbar for common formatting (bold, italic, headers, links, code)
- Image upload support (future)
- Full-screen mode option

## Tags Management (`/admin/tags`)

### List View
- Table: Name, Slug, Colour, Usage Count, Actions
- Sort by name or usage
- Search by name

### Create/Edit Form
Fields:
- **Name** (required): Text input
- **Slug**: Auto-generated, manually overridable
- **Description**: Textarea
- **Colour**: Colour picker

### Additional Features
- View all content using a tag
- Merge tags (combine two tags into one)
- Delete tag (with confirmation, blocked if in use)

## UI/UX Requirements

### Layout
- Sidebar navigation with route links
- Top bar with user info and logout
- Main content area
- Responsive (mobile-friendly, but desktop-first)

### Styling
- Consistent with main site aesthetics
- Clean, minimal interface
- Clear visual hierarchy
- Use existing Tailwind configuration

### Components
- Reusable form components
- Confirmation modals for destructive actions
- Toast notifications for success/error feedback
- Loading states for async operations

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Security

See [authentication.md](authentication.md) for full authentication specification.

- All `/admin/*` routes require authentication
- Session-based authentication
- CSRF protection (built into SvelteKit)
- Rate limiting on login attempts
- Secure password storage (bcrypt)

## State Management

- Server-side rendering where possible
- Form actions for mutations (SvelteKit form actions)
- Client-side validation before submission
- Optimistic UI updates where appropriate

## Error Handling

- Form validation errors shown inline
- Server errors displayed as notifications
- 404 handling for invalid IDs
- Graceful degradation on API failures
