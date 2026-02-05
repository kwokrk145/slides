# Comments Gallery - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org))
- PostgreSQL database (free options: Neon, Supabase)
- Git (to clone repo)

## ⚡ 5-Minute Setup

### 1️⃣ Clone & Install (2 min)

```bash
# Install API dependencies
cd api
npm install

# Install Web dependencies
cd ../web
npm install
```

### 2️⃣ Get Database Connection (2 min)

**Option A: Neon (fastest)**
1. Go to [neon.tech](https://neon.tech)
2. Sign up
3. Copy your connection string

**Option B: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Copy connection string (set to "Prisma" format)

### 3️⃣ Configure Environment (30 sec)

**In `api/` folder, create `.env`:**

```env
DATABASE_URL="your-connection-string-here"
ADMIN_PASSWORD="MySecurePassword123"
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
```

**In `web/` folder, create `.env.local`:**

```env
VITE_API_URL=http://localhost:3000/api
```

### 4️⃣ Initialize Database (1 min)

```bash
cd api

# Generate Prisma
npm run prisma:generate

# Create tables
npm run prisma:migrate
# Name it: "init"

# Add sample data
npx prisma db seed
```

✅ You should see: `✅ Database seeded with sample data`

### 5️⃣ Start Development Servers

**Terminal 1: Backend**
```bash
cd api
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2: Frontend**
```bash
cd web
npm run dev
# Opens http://localhost:5173
```

## 🎉 Done!

Your app is running. Go to http://localhost:5173 and:

1. **Submit Page**: Click a card and add a comment
2. **Gallery Page**: Toggle the release state in Admin page, then view
3. **Admin Page**: Enter password (`MySecurePassword123`) to release gallery

---

## 📖 Common Tasks

### I need to see my database

```bash
cd api
npm run prisma:studio
# Opens http://localhost:5555
```

### Database error during migration

Try resetting (⚠️ **deletes data**):
```bash
npx prisma migrate reset
```

### Can't connect to database

1. Check `DATABASE_URL` in `api/.env`
2. Check password is correct
3. Verify PostgreSQL is accessible from your location

### Want to add more people?

Edit `api/prisma/seed.ts` and re-run:
```bash
npx prisma db seed
```

---

## 📚 Full Documentation

- **[README.md](./README.md)** - Project overview
- **[SETUP.md](./SETUP.md)** - Database setup details
- **[API.md](./API.md)** - API endpoint reference
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to production

---

## 🆘 Troubleshooting

**"Module not found"**
```bash
npm install
```

**"Port 3000 is in use"**
```bash
# Change PORT in api/.env to 3001, then restart
```

**"Prisma version mismatch"**
```bash
npm install @prisma/client prisma
npm run prisma:generate
```

---

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md)
