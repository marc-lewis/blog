# Project Specifications

This document provides an overview of the marclewis.io personal website specifications. The site functions as both a todo list and blog platform with an admin panel for content management.

## Overview

The website combines:
- **Personal todo tracking** - Tasks tagged with unique hashes and keywords
- **Blog publishing** - Markdown posts with tags and metadata
- **Admin panel** - Secure interface for managing all content

## Specification Documents

### Domain Specs

| Domain | Description | Link |
|--------|-------------|------|
| Todos | Todo item structure, display, and management | [specs/todos.md](specs/todos.md) |
| Blog Posts | Blog post structure, rendering, and metadata | [specs/blog-posts.md](specs/blog-posts.md) |
| Hashes | Unique identifier system for todos | [specs/hashes.md](specs/hashes.md) |
| Tags | Keyword tagging system for todos and posts | [specs/tags.md](specs/tags.md) |

### Technical Specs

| Topic | Description | Link |
|-------|-------------|------|
| Architecture | System design, layers, and data flow | [specs/architecture.md](specs/architecture.md) |
| Admin Panel | Content management interface | [specs/admin-panel.md](specs/admin-panel.md) |
| Database | Data persistence and schema design | [specs/database.md](specs/database.md) |
| Authentication | Admin access control | [specs/authentication.md](specs/authentication.md) |
| API | Backend endpoints for data management | [specs/api.md](specs/api.md) |
| Deployment | Railway deployment and operations | [specs/deployment.md](specs/deployment.md) |

## Tech Stack

- **Framework**: SvelteKit with `adapter-node`
- **Styling**: Tailwind CSS
- **Content**: Markdown via mdsvex (for blog posts)
- **Database**: To be determined (see [specs/database.md](specs/database.md))
- **Deployment**: Railway

## Current State

The existing codebase includes:
- Static blog functionality with mdsvex
- Hardcoded placeholder todos
- Basic Chip component for tag display
- Homepage displaying both todos and recent posts

## Target State

- Dynamic todos stored in database
- Blog posts stored in database (migrating from static markdown)
- Admin panel for CRUD operations on todos and posts
- Tag management system
- Hash generation and tracking for todos
