# Deployment Specification

## Overview

The application is deployed on Railway using the Node.js adapter for SvelteKit. This document covers the deployment pipeline, environment configuration, and operational procedures.

## Platform

**Railway** (https://railway.app)

Chosen for:
- Simple Git-based deployments
- Managed PostgreSQL with automatic backups
- Automatic HTTPS
- Reasonable pricing for personal projects
- Good DX with CLI and dashboard

## Deployment Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│   Railway   │────▶│    Build    │────▶│   Deploy    │
│    Push     │     │   Webhook   │     │   Process   │     │   & Start   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                                        │                    │
      │                                        │                    │
      ▼                                        ▼                    ▼
  main branch                           npm run build         node build/
  triggers deploy                       vite build            index.js
```

### Build Process

1. Railway detects push to `main` branch
2. Installs dependencies: `npm install`
3. Runs build: `npm run build`
4. SvelteKit compiles to Node.js server
5. Output in `build/` directory
6. Starts server: `npm run start` → `node build/index.js`

## Configuration

### Railway Service Settings

```yaml
# railway.toml (optional, can also configure via dashboard)
[build]
  builder = "nixpacks"
  buildCommand = "npm run build"

[deploy]
  startCommand = "npm run start"
  healthcheckPath = "/"
  healthcheckTimeout = 30
  restartPolicyType = "on_failure"
  restartPolicyMaxRetries = 3
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ORIGIN` | Yes | Full URL of the site (e.g., `https://marclewis.io`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string (auto-set when linking Railway Postgres) |
| `NODE_ENV` | No | Set to `production` by Railway |
| `PORT` | No | Set automatically by Railway |

**Setting via Railway CLI:**
```bash
railway variables set ORIGIN=https://marclewis.io
```

### PostgreSQL Setup

Railway provides managed PostgreSQL:

1. Create PostgreSQL service in Railway dashboard (or via CLI)
2. Link PostgreSQL service to your app service
3. `DATABASE_URL` is automatically injected

```bash
# Railway CLI
railway add --plugin postgresql
# DATABASE_URL is automatically available to your app
```

## Domain Configuration

### Custom Domain Setup

1. **Railway Dashboard**: Settings → Networking → Custom Domain
2. **Add domain**: `marclewis.io`
3. **DNS Configuration** (at domain registrar):

```
Type    Name    Value                          TTL
CNAME   @       <railway-provided-domain>      3600
CNAME   www     <railway-provided-domain>      3600
```

Or for apex domain with some registrars:
```
ALIAS   @       <railway-provided-domain>
```

4. Railway automatically provisions SSL certificate via Let's Encrypt

### HTTPS

- Automatic SSL/TLS via Railway
- HTTP automatically redirects to HTTPS
- HSTS headers recommended (configured in SvelteKit)

## Database Migrations

### Running Migrations on Deploy

Add a migration step to the build or use a release command:

**Option 1: Build command**
```json
// package.json
{
  "scripts": {
    "build": "npm run db:migrate && vite build",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

**Option 2: Railway release command**
```yaml
# railway.toml
[deploy]
  releaseCommand = "npm run db:migrate"
```

### Manual Migration

```bash
# Connect to Railway environment
railway run npm run db:migrate
```

## Monitoring

### Railway Dashboard

- CPU and memory usage
- Request logs
- Build logs
- Deployment history

### Health Checks

Railway performs health checks on the configured path:

```typescript
// src/routes/health/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async () => {
  try {
    // Simple database connectivity check
    await db.select().from(todos).limit(1);
    return json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    return json({ status: 'unhealthy', error: 'Database connection failed' }, { status: 503 });
  }
};
```

Configure in Railway:
- Health check path: `/health`
- Timeout: 30 seconds
- Interval: 30 seconds

### Logging

Logs are available in Railway dashboard. For structured logging:

```typescript
// src/lib/server/logger.ts
export function log(level: 'info' | 'warn' | 'error', message: string, data?: object) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  };
  console.log(JSON.stringify(entry));
}
```

## Backup Strategy

### Database Backups

Railway's managed PostgreSQL includes automatic backups:

- **Automatic daily backups** with point-in-time recovery
- **Configurable retention** via Railway dashboard
- Backups are stored securely by Railway

**Manual backup (if needed):**
```bash
# Using pg_dump via Railway CLI
railway run pg_dump $DATABASE_URL > backup-$(date +%Y-%m-%d).sql

# Or connect directly with psql
railway connect postgres
```

**Restore from backup:**
```bash
# Via Railway dashboard: Select backup point to restore
# Or manually:
railway run psql $DATABASE_URL < backup.sql
```

### Backup Schedule (Railway Managed)

- Automatic daily backups
- Point-in-time recovery available
- Retention configured in Railway dashboard

## Rollback Procedures

### Via Railway Dashboard

1. Navigate to Deployments
2. Find the last known good deployment
3. Click "Redeploy"

### Via CLI

```bash
# List deployments
railway deployments list

# Redeploy specific deployment
railway up --detach --deployment <deployment-id>
```

### Database Rollback

Use Railway's point-in-time recovery:

1. Go to PostgreSQL service in Railway dashboard
2. Navigate to Backups
3. Select point-in-time to restore
4. Confirm restore

Or restore from a manual backup:
```bash
railway run psql $DATABASE_URL < backup.sql
```

## CI/CD Considerations

### GitHub Actions (Optional)

For additional checks before Railway deployment:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run check
      - run: npm run build
```

Railway will still handle the actual deployment.

## Production Checklist

Before going live:

- [ ] Environment variables set (`ORIGIN`)
- [ ] PostgreSQL service created and linked (`DATABASE_URL` auto-injected)
- [ ] Custom domain configured with SSL
- [ ] Database migrations run
- [ ] Admin user created
- [ ] Health check endpoint working
- [ ] Backup retention configured in Railway
- [ ] Error monitoring configured (optional: Sentry)

## Costs

Railway pricing (as of writing):

- **Hobby plan**: $5/month
  - 512 MB RAM
  - Shared CPU
  - 1 GB persistent storage
  - Sufficient for personal site

- **Usage-based**: ~$5-10/month typical for low-traffic site

## Security Hardening

### HTTP Headers

```typescript
// src/hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }
  
  return response;
};
```

### Rate Limiting

Consider adding rate limiting for login and API endpoints:

```typescript
// Simple in-memory rate limiter (use Redis for production at scale)
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimiter.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimiter.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}
```

## Troubleshooting

### Common Issues

**Build fails:**
- Check Railway build logs
- Ensure all dependencies in package.json
- Verify TypeScript compiles locally

**Database errors after deploy:**
- Verify PostgreSQL service is linked to app
- Check DATABASE_URL is set (should be automatic)
- Ensure migrations have run
- Check PostgreSQL service health in Railway dashboard

**502 errors:**
- Check health endpoint
- Review application logs
- Verify ORIGIN is set correctly

**SSL certificate issues:**
- DNS propagation can take up to 48 hours
- Verify CNAME/ALIAS records are correct
