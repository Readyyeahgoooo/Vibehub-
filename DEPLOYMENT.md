# Vibe Hub Deployment Guide

This guide covers deployment to both **GitHub Pages + Cloudflare Workers** (completely free) and **Vercel** (also free).

## Table of Contents

1. [GitHub Pages + Cloudflare Workers (Recommended for Free Hosting)](#github-pages--cloudflare-workers)
2. [Vercel Deployment (Alternative)](#vercel-deployment)
3. [Environment Variables](#environment-variables)
4. [Post-Deployment Verification](#post-deployment-verification)

---

## GitHub Pages + Cloudflare Workers

### Prerequisites

- GitHub account
- Cloudflare account (free)
- Node.js 18+ installed
- Git installed

### Step 1: Setup GitHub Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/vibe-hub.git
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. Save

### Step 3: Setup Cloudflare Workers

#### Install Wrangler CLI

```bash
npm install -g wrangler
```

#### Login to Cloudflare

```bash
wrangler login
```

#### Create KV Namespace

```bash
# Create production KV namespace
wrangler kv:namespace create "KV"

# Note the ID returned, update wrangler.toml with it
```

#### Create R2 Bucket

```bash
# Create R2 bucket for images
wrangler r2 bucket create vibe-hub-images
```

#### Update wrangler.toml

Edit `wrangler.toml` and update:

```toml
[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_NAMESPACE_ID"  # Replace with actual ID from above

[vars]
ALLOWED_ORIGIN = "https://YOUR_USERNAME.github.io"  # Replace with your GitHub Pages URL
```

#### Set Secrets

```bash
# Set OpenRouter API key
wrangler secret put OPENROUTER_API_KEY
# Paste your OpenRouter API key when prompted

# Set admin token (create a secure random string)
wrangler secret put ADMIN_TOKEN
# Paste a secure token when prompted
```

#### Deploy Worker

```bash
wrangler deploy
```

Note the worker URL (e.g., `https://vibe-hub-api.YOUR_SUBDOMAIN.workers.dev`)

### Step 4: Configure GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add:
   - Name: `API_BASE_URL`
   - Value: Your Cloudflare Worker URL (from Step 3)

### Step 5: Deploy Frontend

```bash
# Push to main branch to trigger deployment
git push origin main
```

GitHub Actions will automatically:
1. Build your React app
2. Deploy to GitHub Pages

Check the **Actions** tab to monitor deployment progress.

### Step 6: Configure R2 Public Access (Optional)

For public image access, you can:

**Option A: Use R2 Custom Domain**
1. Go to Cloudflare Dashboard → R2
2. Select your bucket
3. Settings → Public Access → Allow Access
4. Add custom domain

**Option B: Use Worker for Image Serving**
Images will be served through the worker (already configured).

---

## Vercel Deployment

### Prerequisites

- Vercel account (free)
- Node.js 18+ installed

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# From project root
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? vibe-hub
# - Directory? ./
# - Override settings? No
```

### Step 4: Set Environment Variables

```bash
# Set OpenRouter API key
vercel env add VITE_OPENROUTER_API_KEY

# Paste your API key when prompted
# Select: Production, Preview, Development
```

### Step 5: Setup Vercel KV (for backend features)

1. Go to Vercel Dashboard → Your Project
2. Navigate to **Storage** tab
3. Click **Create Database** → **KV**
4. Name it `vibe-hub-kv`
5. Connect to your project

### Step 6: Deploy to Production

```bash
vercel --prod
```

Your site will be live at: `https://vibe-hub.vercel.app`

---

## Environment Variables

### Frontend (.env.local for development)

```bash
# For GitHub Pages + Cloudflare Workers
VITE_API_BASE_URL=https://vibe-hub-api.YOUR_SUBDOMAIN.workers.dev

# For Vercel (API calls are same-origin)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Cloudflare Workers (via wrangler secret)

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
ADMIN_TOKEN=your_secure_admin_token_here
```

### Get OpenRouter API Key

1. Go to https://openrouter.ai/keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-or-...`)

---

## Post-Deployment Verification

### Test Checklist

- [ ] Frontend loads correctly
- [ ] Language switcher works (EN, 繁體, 简体)
- [ ] AI search works
- [ ] Submit form opens
- [ ] Category filtering works
- [ ] Sorting works
- [ ] No console errors
- [ ] HTTPS is enabled
- [ ] API endpoints respond (check Network tab)

### Test API Endpoints

```bash
# Test worker is running (replace with your worker URL)
curl https://vibe-hub-api.YOUR_SUBDOMAIN.workers.dev/api/apps

# Should return: {"message": "Get apps endpoint - to be implemented"}
```

### Common Issues

**GitHub Pages: 404 on refresh**
- Ensure `public/404.html` exists
- Check GitHub Actions deployment succeeded

**CORS errors**
- Verify `ALLOWED_ORIGIN` in `wrangler.toml` matches your GitHub Pages URL
- Redeploy worker after changes: `wrangler deploy`

**API calls failing**
- Check `API_BASE_URL` secret in GitHub repository settings
- Verify worker is deployed: `wrangler deployments list`

**Images not loading**
- Check R2 bucket exists: `wrangler r2 bucket list`
- Verify R2 binding in `wrangler.toml`

---

## Custom Domain (Optional)

### GitHub Pages Custom Domain

1. Go to repository **Settings** → **Pages**
2. Under "Custom domain", enter your domain
3. Add DNS records at your domain provider:
   ```
   Type: CNAME
   Name: www (or @)
   Value: YOUR_USERNAME.github.io
   ```

### Cloudflare Worker Custom Domain

1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your worker
3. Settings → Triggers → Custom Domains
4. Add your domain

---

## Cost Breakdown

### GitHub Pages + Cloudflare Workers
- **GitHub Pages**: Free (100GB bandwidth/month)
- **Cloudflare Workers**: Free (100k requests/day)
- **Cloudflare KV**: Free (1GB storage, 100k reads/day)
- **Cloudflare R2**: Free (10GB storage, zero egress fees)
- **OpenRouter API**: ~$0-1/month (pay-per-use)
- **Total**: $0-1/month

### Vercel
- **Hosting**: Free (100GB bandwidth)
- **Functions**: Free (unlimited invocations, 5s timeout)
- **Vercel KV**: Free (256MB storage, 3000 commands/day)
- **OpenRouter API**: ~$0-1/month (pay-per-use)
- **Total**: $0-1/month

Both options are essentially free for moderate traffic!

---

## Next Steps

After deployment:

1. **Test all features** thoroughly
2. **Monitor usage** in Cloudflare/Vercel dashboards
3. **Set up monitoring** (optional: Sentry, LogRocket)
4. **Implement remaining features** from tasks.md
5. **Add your first app** via the submission form

For implementation details, see:
- `.kiro/specs/secure-submission-system/` - Full feature spec
- `.kiro/specs/github-pages-deployment/` - GitHub Pages specific details

---

## Support

- **OpenRouter**: https://openrouter.ai/docs
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **GitHub Pages**: https://docs.github.com/pages
- **Vercel**: https://vercel.com/docs

For issues, create a GitHub issue in your repository.
