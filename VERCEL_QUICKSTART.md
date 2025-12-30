# ⚡ Vercel Deployment - Quick Start

## 🎯 3-Step Deployment (5 minutes)

### Step 1: Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub
2. Click **"Add New Project"**
3. Import **`Readyyeahgoooo/Vibehub-`**
4. Click **"Deploy"** (that's it!)

Your site will be live at: `https://vibehub-[random].vercel.app`

### Step 2: Add API Key

1. In Vercel dashboard, go to **Settings → Environment Variables**
2. Add new variable:
   - **Name**: `OPENROUTER_API_KEY`
   - **Value**: Your key from https://openrouter.ai/keys
   - **Environment**: ✅ Production
3. Click **"Save"**
4. Go to **Deployments** → Click **"..."** → **"Redeploy"**

### Step 3: Test It!

Visit your site and try:
- ✅ Browse apps (works immediately)
- ✅ AI search (type a query)
- ✅ Click app names (shareable pages)
- ✅ Language switcher

---

## ✨ What You Get

### Secure API Key Management
- API key stored in Vercel environment variables
- **Never exposed to browser**
- Serverless functions handle all API calls

### Features That Work Immediately
- Browse all apps
- Filter by category
- Sort columns
- Language switching (EN, 繁體, 简体)
- Shareable app detail pages
- Mobile responsive

### Features That Need API Key
- AI semantic search
- Screenshot verification (for submissions)

---

## 💰 Cost: $0/month

- Vercel Free Tier: 100GB bandwidth
- Your OpenRouter model: **FREE**
- Total: **$0** 🎉

---

## 🔄 Updates

Every time you push to GitHub, Vercel automatically redeploys:

```bash
git add .
git commit -m "Update"
git push origin main
```

---

## 📖 Full Guide

See `VERCEL_DEPLOY.md` for detailed instructions and troubleshooting.

---

## 🎉 That's It!

Much simpler than Cloudflare Workers, right? 😊
