# Database Setup Guide

This guide covers setting up PostgreSQL with Prisma for both local development and deployment scenarios.

## 🏗️ Database Providers

We recommend one of these PostgreSQL providers:

1. **Neon** (recommended) - Free tier, serverless, generous limits
2. **Supabase** - Free tier, includes pgAdmin, real-time features
3. **Railway** - Pay per use, very affordable
4. **Render** - Free tier available, PostgreSQL included

## 🎯 Quick Start: Neon PostgreSQL

### 1. Create Neon Account & Database

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up with email
3. Create a new project
4. Once created, click "Databases" → Default database
5. Copy your connection string (looks like):
   ```
   postgresql://neondb_owner:AbC123...@ep-cool-lake-12345.us-east-1.neon.tech/neondb?sslmode=require
   ```

### 2. Copy Connection String

- Click "Connection string" 
- Select "Prisma" from dropdown
- Copy the entire string

### 3. Create API .env File

In the `api/` folder, create `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and paste your connection string:

```env
DATABASE_URL="postgresql://neondb_owner:AbC123...@ep-cool-lake-12345.us-east-1.neon.tech/neondb?sslmode=require"
ADMIN_PASSWORD="your-super-secret-password"
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
PORT=3000
NODE_ENV=development
```

### 4. Install Dependencies

```bash
cd api
npm install
```

### 5. Run Initial Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Create tables (migration)
npm run prisma:migrate
# When prompted, name it something like "init"

# Seed sample data
npx prisma db seed
```

**Output should show:**
```
✅ Database seeded with sample data
Created 4 people
```

### 6. Test Connection

```bash
# Open Prisma Studio (visual database explorer)
npm run prisma:studio
```

Opens at http://localhost:5555 - you should see 4 people and empty comments

## 🎯 Alternative: Supabase PostgreSQL

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in with GitHub
3. Click "New Project"
4. Enter project name & password
5. Wait for creation (2-3 minutes)

### 2. Get Connection String

1. Click "Settings" → "Database"
2. Find "Connection string" section
3. Select "Prisma" from URI dropdown
4. Copy the connection string
5. **Note:** Replace `[YOUR-PASSWORD]` with your database password

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres?sslmode=require
```

### 3. Add to API .env

```env
DATABASE_URL="postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres?sslmode=require"
ADMIN_PASSWORD="your-super-secret-password"
CORS_ORIGINS="http://localhost:5173"
```

### 4. Run Setup

```bash
cd api
npm install
npm run prisma:generate
npm run prisma:migrate
npx prisma db seed
```

## 📊 Understanding the Schema

Your database will have 3 tables:

### `persons` table
```
id        | name          | year | imageUrl
----------|---------------|------|----------
1         | Alice Johnson | 2024 | https://...
2         | Bob Smith     | 2023 | https://...
...
```

### `comments` table
```
id | personId | text           | editToken    | isDeleted | createdAt | updatedAt
---|----------|----------------|--------------|-----------|-----------|----------
1  | 1        | Great person!  | uuid-string  | false     | 2024-...  | 2024-...
2  | 1        | Amazing work   | uuid-string  | true      | 2024-...  | 2024-...
...
```

### `gallery_states` table
```
id | isReleased
---|----------
1  | false
```

The `gallery_states` table always has exactly 1 row with `id=1`. This controls whether users can see comments.

## 🔄 Making Schema Changes

### Add a Column

1. Edit `api/prisma/schema.prisma`:

```prisma
model Comment {
  id        Int       @id @default(autoincrement())
  personId  Int
  person    Person    @relation(fields: [personId], references: [id], onDelete: Cascade)
  text      String    @db.Text
  editToken String    @unique
  isDeleted Boolean   @default(false)
  starred   Boolean   @default(false)  // NEW
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  @@index([personId])
  @@map("comments")
}
```

2. Create and apply migration:

```bash
npm run prisma:migrate
# Name it: "add_starred_to_comments"
```

3. This creates a migration file and updates your database

### View Database

```bash
# Open Prisma Studio
npm run prisma:studio

# Or connect directly:
# Neon: Use web console at neon.tech
# Supabase: Use pgAdmin at supabase.com
```

## 🚀 Production Database Setup

### For Deployment

1. Create a **separate** PostgreSQL database for production
2. Note the connection string
3. Add to your hosting provider's environment variables (not in code)

**Common Providers:**

**Render:**
1. Create PostgreSQL database in Render dashboard
2. Copy connection string
3. Add to backend service environment variables

**Railway:**
1. Create PostgreSQL database plugin
2. Copy connection string
3. Add to backend service environment variables

**Vercel/Netlify (for backend on separate service):**
- Backend deployed on Render/Railway/Heroku
- Use their environment variable management
- Never commit .env to git

### Setting Environment Variables

**For Render:**
```
Dashboard → Service → Environment → Add Variable
DATABASE_URL = postgresql://...
ADMIN_PASSWORD = your-secure-password
CORS_ORIGINS = https://your-frontend-domain.com
```

**For Railway:**
```
Settings → Variables → DATABASE_URL, ADMIN_PASSWORD, etc.
```

### Running Migrations in Production

After deploying backend, run:

```bash
npm run prisma:migrate:prod
```

This applies pending migrations without creating new ones (safe for production).

## 🧪 Useful Commands

```bash
# View database GUI
npm run prisma:studio

# Create new migration (after schema change)
npm run prisma:migrate

# Apply pending migrations (production)
npm run prisma:migrate:prod

# Reset local database (⚠️ DELETES DATA)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Generate Prisma client
npm run prisma:generate

# Seed with sample data
npx prisma db seed

# View Prisma version
npx prisma --version
```

## 🔐 Connection String Parts

Example: `postgresql://user:pass@host:5432/db?sslmode=require`

- **user** - database user (usually "postgres" or your username)
- **pass** - database password (set during creation)
- **host** - server address (e.g., "ep-cool-lake.us-east-1.neon.tech")
- **5432** - standard PostgreSQL port
- **db** - database name (e.g., "neondb", "postgres")
- **sslmode=require** - required for cloud databases

## ❌ Troubleshooting

### "SSL certificate problem"
Add `?sslmode=require` to connection string (should already be there)

### "Role 'postgres' does not exist"
Check username in connection string matches your provider's default user

### "Initial migration failed"
Try reset (deletes data): `npx prisma migrate reset`

### "Seed script fails"
Check the Person imageUrl values are valid HTTPS URLs

### "Connection refused"
- Verify DATABASE_URL is correct
- Check if database service is running/accessible
- For cloud: ensure IP allowlist includes your machine

## 📚 Additional Resources

- **Prisma Docs:** https://www.prisma.io/docs/
- **Neon Guide:** https://neon.tech/docs
- **Supabase Guide:** https://supabase.com/docs
- **PostgreSQL Basics:** https://www.postgresql.org/docs/

---

**Next steps:** After setup, run `npm run dev` in `api/` folder to start the backend!
