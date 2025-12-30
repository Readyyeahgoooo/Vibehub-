# Design Document: GitHub Pages + Cloudflare Workers Architecture

## Overview

This design adapts the Vibe Hub secure submission system for deployment on GitHub Pages (frontend) with Cloudflare Workers (backend). This architecture provides completely free hosting while maintaining all security and functionality requirements.

### Key Differences from Vercel Design

1. **Frontend Hosting**: GitHub Pages instead of Vercel
2. **Backend**: Cloudflare Workers instead of Vercel Edge Functions
3. **Database**: Cloudflare KV instead of Vercel KV
4. **Image Storage**: Cloudflare R2 instead of Cloudinary
5. **Deployment**: GitHub Actions instead of Vercel CLI

### Technology Stack

- **Frontend Hosting**: GitHub Pages (free, unlimited bandwidth)
- **Backend**: Cloudflare Workers (free tier: 100k requests/day)
- **Database**: Cloudflare KV (free tier: 1GB storage, 100k reads/day, 1k writes/day)
- **Image Storage**: Cloudflare R2 (free tier: 10GB storage, 1M Class A operations/month, no egress fees)
- **AI Vision**: OpenRouter API with GPT-4o-mini
- **Deployment**: GitHub Actions (free for public repos)

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Pages (Static)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  React App   │  │ Submit Form  │  │  App Detail  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS + CORS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Workers                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /api/submit  │  │ /api/verify  │  │ /api/upload  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────┬────────────────┬────────────────┬──────────────────┘
         │                │                │
         ▼                ▼                ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Cloudflare KV  │ │  OpenRouter    │ │ Cloudflare R2  │
│  (Database)    │ │  (AI Vision)   │ │   (Images)     │
└────────────────┘ └────────────────┘ └────────────────┘
```

## Cloudflare Workers Implementation

### Worker Structure

```typescript
// workers/api/index.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS handling
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }
    
    // Route requests
    if (url.pathname === '/api/upload') {
      return handleUpload(request, env);
    } else if (url.pathname === '/api/verify') {
      return handleVerify(request, env);
    } else if (url.pathname === '/api/submit') {
      return handleSubmit(request, env);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
```

### CORS Configuration

```typescript
function handleCORS(): Response {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://yourusername.github.io',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }
  });
}

function addCORSHeaders(response: Response): Response {
  response.headers.set('Access-Control-Allow-Origin', 'https://yourusername.github.io');
  return response;
}
```

## Cloudflare R2 for Image Storage

### R2 Configuration

```typescript
// Upload to R2
async function uploadToR2(file: File, env: Env): Promise<string> {
  const filename = `${crypto.randomUUID()}.${getExtension(file.name)}`;
  
  await env.R2_BUCKET.put(filename, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });
  
  // Return public URL
  return `https://your-r2-domain.com/${filename}`;
}
```

### R2 Public Access

Configure R2 bucket with public access for image serving:
- Create R2 bucket in Cloudflare dashboard
- Enable public access or use custom domain
- Set up CORS rules for GitHub Pages domain

## GitHub Actions Deployment

### Workflow Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.CLOUDFLARE_WORKER_URL }}
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Environment Variables

### Frontend (.env.production)

```bash
VITE_API_BASE_URL=https://your-worker.your-subdomain.workers.dev
```

### Cloudflare Workers (wrangler.toml)

```toml
name = "vibe-hub-api"
main = "workers/api/index.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "vibe-hub-images"

[secrets]
OPENROUTER_API_KEY = "set via wrangler secret put"
ADMIN_TOKEN = "set via wrangler secret put"
```

## Cost Analysis (All Free)

### GitHub Pages
- ✅ Free for public repositories
- ✅ 1GB storage limit
- ✅ 100GB bandwidth/month
- ✅ Custom domain support

### Cloudflare Workers
- ✅ 100,000 requests/day (free tier)
- ✅ 10ms CPU time per request
- ✅ Sufficient for moderate traffic

### Cloudflare KV
- ✅ 1GB storage (free tier)
- ✅ 100,000 reads/day
- ✅ 1,000 writes/day
- ✅ Perfect for submission queue and cache

### Cloudflare R2
- ✅ 10GB storage/month (free tier)
- ✅ 1M Class A operations/month (writes)
- ✅ 10M Class B operations/month (reads)
- ✅ **Zero egress fees** (huge advantage over S3)

### OpenRouter
- Pay-per-use (GPT-4o-mini: ~$0.15/1M tokens)
- Estimated cost: <$1/month for moderate usage

## Deployment Steps

### 1. Setup GitHub Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/vibe-hub.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` (will be created by GitHub Actions)
4. Save

### 3. Setup Cloudflare Workers

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create KV namespace
wrangler kv:namespace create "KV"

# Create R2 bucket
wrangler r2 bucket create vibe-hub-images

# Set secrets
wrangler secret put OPENROUTER_API_KEY
wrangler secret put ADMIN_TOKEN

# Deploy worker
wrangler deploy
```

### 4. Configure GitHub Secrets

Add to repository Settings → Secrets:
- `CLOUDFLARE_WORKER_URL`: Your worker URL

### 5. Deploy

```bash
git push origin main
# GitHub Actions will automatically build and deploy
```

## API Endpoint Changes

Frontend will call Cloudflare Worker endpoints:

```typescript
// services/apiClient.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  return data.url;
}
```

## Correctness Properties

All 14 correctness properties from the original design remain the same. The implementation details change (Cloudflare Workers instead of Vercel), but the properties being tested are identical.

## Testing Strategy

Same as original design:
- Unit tests with Vitest
- Property tests with fast-check
- Integration tests with Playwright
- All tests run in GitHub Actions CI/CD

## Advantages of This Architecture

1. **Completely Free**: All services have generous free tiers
2. **No Egress Fees**: R2 has zero egress fees (unlike S3/Cloudinary)
3. **Global CDN**: Both GitHub Pages and Cloudflare have excellent CDN
4. **Simple Deployment**: Push to main branch = automatic deployment
5. **Scalable**: Can handle significant traffic on free tier
6. **Custom Domain**: Both support custom domains for free

## Limitations

1. **Request Limits**: 100k requests/day on Cloudflare Workers (sufficient for most use cases)
2. **KV Write Limits**: 1k writes/day (may need optimization for high submission volume)
3. **Build Time**: GitHub Actions may be slower than Vercel for builds
4. **No Preview Deployments**: Unlike Vercel, no automatic preview for PRs (can be added with additional setup)
