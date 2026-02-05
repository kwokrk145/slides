# Deployment Guide

Complete instructions for deploying the Comments Gallery to production.

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────┐
│     Your Users' Browsers                │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
   ┌───▼───────┐   ┌───▼────────────────┐
   │  Netlify  │   │  Render/Railway    │
   │  Vercel   │   │  (Express API)     │
   │  Frontend │   │  Backend           │
   └───────────┘   └────────┬───────────┘
                            │
                   ┌────────▼──────────┐
                   │  Neon/Supabase    │
                   │  PostgreSQL       │
                   └───────────────────┘
```

## 📋 Pre-Deployment Checklist

- [ ] Local dev setup complete
- [ ] All .env variables documented
- [ ] No secrets committed to git
- [ ] Tests passing locally
- [ ] Updated imageUrl in seed.ts (if needed)
- [ ] Admin password changed from default
- [ ] CORS_ORIGINS configured for production domain

## 🔙 Backend Deployment (Express API)

### Option 1: Render (Recommended)

#### Step 1: Prepare Backend

```bash
cd api

# Create .env for production (Render will provide POST_ON vars)
# Don't commit .env - use Render dashboard instead

# Ensure build works
npm run build
```

#### Step 2: Create Render Account

1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub
3. Grant access to your repository

#### Step 3: Create New Service

1. Click "New+" → "Web Service"
2. Connect your GitHub repository
3. Select repository and branch (main)
4. Configure:
   - **Name:** `comments-gallery-api`
   - **Runtime:** `Node`
   - **Build Command:** `cd api && npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Keep free tier plan** (or upgrade if needed)

#### Step 4: Add Environment Variables

In Render dashboard:
1. Go to your service → "Environment"
2. Click "Add Environment Variable"
3. Add each variable:

```
DATABASE_URL = postgresql://...neon.tech/neondb...
ADMIN_PASSWORD = your-complex-secure-password
CORS_ORIGINS = https://your-frontend-domain.com
NODE_ENV = production
PORT = (Render uses this automatically)
```

#### Step 5: Deploy Migrations

1. Render will auto-build from your git push
2. Once deployed, run migrations:
   - Click "Shell" tab
   - Run: `npm run prisma:migrate:prod`
   - Run: `npx prisma db seed` (optional, only once)

#### Step 6: Test API

Get your service URL from Render dashboard (looks like `https://comments-gallery-api.onrender.com`)

Test health check:
```bash
curl https://comments-gallery-api.onrender.com/api/health
```

**Note:** Free tier services spin down after 30 minutes of inactivity

---

### Option 2: Railway

#### Step 1: Create Account

1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub

#### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository

#### Step 3: Add PostgreSQL

1. Click "Add" → "Database" → "PostgreSQL"
2. Railway auto-creates connection string in `DATABASE_URL` env var

#### Step 4: Configure Node Service

In Railway:
1. In left sidebar, click Node service
2. Go to "Variables"
3. Add environment variables:

```
ADMIN_PASSWORD = your-complex-secure-password
CORS_ORIGINS = https://your-frontend-domain.com
NODE_ENV = production
```

4. Go to "Settings" → "Deploy" 
5. Set:
   - **Start Command:** `npm run prisma:migrate:prod && npm run start`
   - Or after first deploy, just: `npm run start`

#### Step 5: Deploy

1. Push to main branch
2. Railway auto-deploys on git push
3. Watch logs in Railway dashboard

#### Step 6: Get Service URL

In Railway:
- Click your service
- Click "Settings" → "Domains"
- Generate domain (or use custom domain)

---

### Option 3: Heroku (Legacy but still works)

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create comments-gallery-api

# Add PostgreSQL add-on
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set ADMIN_PASSWORD="your-password"
heroku config:set CORS_ORIGINS="https://your-frontend.com"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main

# Run migrations
heroku run npm run prisma:migrate:prod

# View logs
heroku logs --tail
```

---

## 🌐 Frontend Deployment (React + Vite)

### Option 1: Netlify (Recommended)

#### Step 1: Build Locally

```bash
cd web
npm run build

# Creates: dist/ folder with optimized files
```

#### Step 2: Create Netlify Account

1. Go to [https://netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Grant access to your repository

#### Step 3: Deploy

1. Click "Add new site" → "Import an existing project"
2. Connect GitHub → Choose repository
3. Configure build:
   - **Base directory:** `web`
   - **Build command:** `npm run build`
   - **Publish directory:** `web/dist`
4. Click "Deploy site"

#### Step 4: Add Environment Variables

1. Go to site settings → "Build & deploy" → "Environment"
2. Add:
   ```
   VITE_API_URL = https://your-api-domain.com/api
   ```
3. Trigger redeploy (or push new commit)

#### Step 5: Test

Visit your Netlify domain and test all features

#### Custom Domain (Optional)

1. Go to "Site settings" → "Domain management"
2. Click "Add custom domain"
3. Follow DNS setup instructions

---

### Option 2: Vercel

#### Step 1: Prepare Project

```bash
cd web
npm run build
```

#### Step 2: Create Vercel Account

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub

#### Step 3: Import Project

1. Click "New Project" → "Import Git Repository"
2. Select your repository
3. Configure:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.vite/dist`

#### Step 4: Environment Variables

1. Go to "Settings" → "Environment Variables"
2. Add:
   ```
   VITE_API_URL = https://your-api-domain.com/api
   ```
3. Deploy

#### Step 5: Monitor Deployment

- Vercel auto-deploys on git push
- Watch build logs in dashboard
- Your site is live at vercel domain

---

### Option 3: GitHub Pages (Free but limited)

```bash
# Only works for static sites, but requires backend anyway
# For full app, use Netlify or Vercel instead
```

---

## 🔗 Connecting Frontend to Backend

### During Development

**web/.env.local:**
```
VITE_API_URL=http://localhost:3000/api
```

### After Deployment

**web environment variables (Netlify/Vercel):**
```
VITE_API_URL=https://your-api-domain.com/api
```

Replace `your-api-domain.com` with your actual backend URL:
- Render: `https://comments-gallery-api.onrender.com`
- Railway: `https://your-project.railway.app`
- Heroku: `https://comments-gallery-api.herokuapp.com`

---

## 🗄️ Production Database Setup

### Using Neon

1. Create **separate** database for production (not your dev one)
2. Get connection string
3. Add to backend environment variables

### Using Supabase

Same as Neon - create separate project for production

### First Deployment Steps

1. Deploy backend code to Render/Railway/Heroku
2. Connect production PostgreSQL database (add DATABASE_URL env var)
3. In service shell, run:
   ```bash
   npm run prisma:migrate:prod
   npx prisma db seed
   ```
4. Deploy frontend to Netlify/Vercel
5. Add `VITE_API_URL` pointing to your backend

---

## 🔐 Security Checklist

- [ ] ADMIN_PASSWORD is strong (16+ chars, mixed case/numbers/symbols)
- [ ] DATABASE_URL never committed to git
- [ ] CORS_ORIGINS points only to your frontend domain
- [ ] No debug logs in production
- [ ] HTTPS only (auto with Netlify/Vercel/Render)
- [ ] Regular backups of PostgreSQL database
- [ ] Monitor error logs regularly

---

## 📊 Production Monitoring

### Logs

**Render:**
- Dashboard → Service → "Logs" tab

**Railway:**
- Dashboard → Service → "Logs" tab

**Vercel:**
- Dashboard → Project → "Deployments" → click deploy → "Functions"

### Database

**Neon:**
- Visit [neon.tech](https://neon.tech)
- Click project → "Monitoring"

**Supabase:**
- Visit [supabase.com](https://supabase.com)
- Click project → "Database" → "Monitoring"

---

## 🔄 Continuous Deployment

All platforms auto-deploy when you push to main:

```bash
# Make changes locally
npm run dev  # test

# Commit and push
git add .
git commit -m "Feature: add comment sorting"
git push origin main

# Render/Railway/Netlify/Vercel automatically:
# 1. Build your code
# 2. Run tests (if configured)
# 3. Deploy to production
```

---

## 🐛 Troubleshooting Deployments

### "CORS error - blocked by browser"

Frontend → Backend communication failing

**Fix:** Check `CORS_ORIGINS` env var includes your frontend domain:
```
CORS_ORIGINS=https://your-frontend-domain.com
```

### "Cannot connect to database"

API can't reach PostgreSQL

**Fix:**
1. Verify `DATABASE_URL` is correct
2. Check internet connectivity
3. Ensure PostgreSQL server is running
4. For cloud DB, check IP allowlist

### "404 on /api routes"

Backend endpoints not found

**Fix:**
1. Verify backend deployed successfully
2. Check API_URL in frontend env vars
3. Test `https://your-api.com/api/health`

### "Application stuck in build loop"

Infinite build/deploy

**Fix on Render:**
1. Go to service → "Settings"
2. Disable "Auto-Deploy"
3. Fix the issue locally
4. Push fix to git
5. Re-enable auto-deploy

### "Migrations failed on deploy"

Database schema mismatch

**Fix:**
1. Stop deployment
2. Check Prisma schema locally
3. Run `npx prisma migrate status` locally
4. Fix any pending migrations
5. Push and redeploy

---

## 📚 Cost Estimates (Monthly)

**Free Tier Options:**

| Service | Cost | Limits |
|---------|------|--------|
| Render | $0 | Web: spins down after 30m inactivity |
| Railway | $5 | Generous free trial |
| Netlify | $0 | 100GB/month bandwidth |
| Vercel | $0 | 100GB/month serverless functions |
| Neon | $0 | 3 projects, 1 autoscaling replica |

**Small Production:**
- Railway PostgreSQL: $7/month
- Render Web Service: $7/month
- Total: ~$14/month

---

## 🎓 Next Steps

1. Deploy backend first
2. Test API endpoints in browser
3. Deploy frontend with correct API_URL
4. Test all features in production
5. Get custom domain (optional)
6. Set up monitoring/alerts

---

**Questions?** Check [SETUP.md](./SETUP.md) for database details or [API.md](./API.md) for endpoint reference.
