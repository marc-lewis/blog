# marclewis.io

Personal blog built with SvelteKit, deployed on Railway.

## Tech Stack

- **Framework**: SvelteKit with `adapter-node`
- **Styling**: Tailwind CSS
- **Content**: Markdown via mdsvex
- **Syntax Highlighting**: Shiki
- **Deployment**: Railway

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Writing Posts

Create a new `.md` file in `src/lib/posts/` with frontmatter:

```markdown
---
title: Your Post Title
description: A brief description of your post
date: '2026-01-22'
tags:
  - tag1
  - tag2
published: true
---

Your content here...
```

Set `published: false` to hide drafts.

## Deployment

This project is configured for Railway deployment:

1. Push to GitHub
2. Connect repo to Railway
3. Railway auto-detects the build command (`npm run build`)
4. The `start` script runs `node build/index.js`

### Environment Variables

Set `ORIGIN=https://marclewis.io` in Railway for CSRF protection.

### Custom Domain

1. In Railway: Settings → Networking → Custom Domain
2. Add `marclewis.io`
3. Configure DNS: CNAME to Railway's provided domain

## Project Structure

```
src/
├── lib/
│   ├── components/    # Svelte components
│   ├── posts/         # Markdown blog posts
│   └── utils/         # Helper functions
├── routes/
│   ├── +layout.svelte # Global layout
│   ├── +page.svelte   # Homepage
│   ├── about/         # About page
│   └── blog/          # Blog routes
│       ├── +page.svelte       # Post listing
│       └── [slug]/            # Individual posts
└── app.html           # HTML template
```

## Licence

MIT
