# Comments Gallery - Fullstack Monorepo

A production-ready fullstack application for managing and displaying user comments about people. Built with React + TypeScript (frontend), Express + Node.js (backend), and PostgreSQL (database).

## 📁 Project Structure

```
.
├── api/                          # Backend (Express + Node.js)
│   ├── src/
│   │   ├── main.ts              # Express server entry point
│   │   ├── middleware/
│   │   │   └── auth.ts          # Admin & edit token auth
│   │   └── routes/
│   │       ├── comments.ts       # Comment CRUD endpoints
│   │       └── gallery.ts        # Gallery state endpoints
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Sample data seeder
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .gitignore
│
├── web/                          # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── App.tsx              # Main app with navigation
│   │   ├── pages/
│   │   │   ├── SubmitPage.tsx   # Comment submission interface
│   │   │   ├── GalleryPage.tsx  # Slideshow gallery view
│   │   │   └── AdminPage.tsx    # Admin controls
│   │   ├── components/
│   │   │   └── PersonCard.tsx   # Reusable person card
│   │   ├── utils/
│   │   │   └── api.ts           # API client & token storage
│   │   ├── main.tsx
│   │   └── index.css
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── .env.example
│   └── public/
│
├── SETUP.md                      # Database setup instructions
├── API.md                        # API documentation & examples
├── DEPLOYMENT.md                 # Deployment guide
└── README.md                     # This file
```

## 🎯 Features

### 1. Submit Page
- Grid of person cards (photo, name, graduation year)
- Click card to open modal
- Type and submit comment
- Edit token saved to localStorage
- Real-time comment count updates
- Loading, success, and error states

### 2. Gallery Page
- Full-screen slideshow interface
- Navigate between people with arrow buttons
- View all comments for each person
- Edit/delete your own comments (with edit token)
- "Not released yet" message when disabled
- Soft delete (comments never permanently removed)

### 3. Admin Page
- Password-protected login
- Toggle gallery visibility (release/hide)
- Session persistence
- Clean, intuitive toggle interface

## 🔒 Security

- Admin password via environment variables
- Edit tokens using UUID v4
- Soft delete system (data never lost)
- Edit token validation on all comment modifications
- CORS configuration for frontend origin
- Bearer token authentication for admin routes

## 🛠️ Tech Stack

**Frontend:**
- React 18+ with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- localStorage for token management

**Backend:**
- Express.js for REST API
- Prisma ORM for database access
- TypeScript for type safety
- CORS middleware for frontend access

**Database:**
- PostgreSQL (hosted on Neon, Supabase, etc.)
- Prisma for migrations and queries
- Soft delete pattern for safety

## 📋 Prerequisites

- Node.js 18+
- npm 9+ or pnpm 8+
- PostgreSQL 14+ (hosted service)

## 🚀 Local Development

### 1. Clone & Install Dependencies

```bash
# Install API dependencies
cd api
npm install
# or pnpm install

# Install Web dependencies
cd ../web
npm install
# or pnpm install
```

### 2. Database Setup

See [SETUP.md](./SETUP.md) for detailed instructions on:
- Creating a Neon or Supabase PostgreSQL database
- Setting up connection string
- Running migrations
- Seeding sample data

### 3. Environment Variables

**API (.env)**
```bash
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
ADMIN_PASSWORD="your-secure-password"
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
PORT=3000
NODE_ENV="development"
```

**Web (.env.local)**
```bash
VITE_API_URL=http://localhost:3000/api
```

### 4. Start Development Servers

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
# Runs on http://localhost:5173 (or first available port)
```

Visit http://localhost:5173 in your browser!

## 📖 Using the Application

### Submit a Comment
1. Navigate to "Submit" page
2. Click any person card to open modal
3. Type your comment and click "Submit Comment"
4. Your edit token is automatically saved

### View Gallery
1. Admins must first release the gallery (Admin page)
2. Navigate to "Gallery" page
3. Use arrow buttons to navigate between people
4. Comments appear once gallery is released
5. Edit/delete your own comments using saved tokens

### Admin Controls
1. Click "Admin" in navigation
2. Enter the admin password
3. Toggle the gallery release state
4. Your session persists during your browser session

## 🔑 API Endpoints

See [API.md](./API.md) for complete endpoint documentation with examples.

**Public Endpoints:**
- `GET /api/gallery/state` - Get gallery release status
- `GET /api/gallery/people` - Get all people
- `GET /api/comments/:personId` - Get comments for a person
- `POST /api/comments` - Submit new comment

**Protected Endpoints:**
- `PUT /api/comments/:commentId` - Edit comment (requires edit token)
- `DELETE /api/comments/:commentId` - Delete comment (requires edit token)
- `PUT /api/gallery/state` - Toggle gallery (admin only)

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions:

**Backend (Express API):**
- Deploy to Render, Railway, Heroku, or similar
- Environment variables from secrets management
- Database connection from provider

**Frontend (React):**
- Deploy to Netlify, Vercel, GitHub Pages, or similar
- Build: `npm run build`
- Environment variables for API URL

## 🗄️ Database Schema

```prisma
model Person {
  id       Int
  name     String
  year     Int
  imageUrl String
  comments Comment[]
}

model Comment {
  id        Int
  personId  Int
  person    Person
  text      String
  editToken String (UUID)
  isDeleted Boolean
  createdAt DateTime
  updatedAt DateTime
}

model GalleryState {
  id         Int     (always 1)
  isReleased Boolean
}
```

## 🎨 Customization

### Change Person Images
Edit [api/prisma/seed.ts](./api/prisma/seed.ts) and update URLs:
```typescript
imageUrl: "https://your-image-url.jpg"
```

### Modify Styling
All components use Tailwind CSS. Edit className values in:
- [web/src/pages/](./web/src/pages/)
- [web/src/components/](./web/src/components/)

### Add Firebase/Auth
Replace `tokenStorage` in [web/src/utils/api.ts](./web/src/utils/api.ts) with auth service

### Custom Comment Fields
Update [api/prisma/schema.prisma](./api/prisma/schema.prisma) and add migrations

## 🐛 Troubleshooting

**"Failed to connect to database"**
- Verify DATABASE_URL in .env
- Check PostgreSQL is running
- Ensure password and host are correct

**"CORS error when submitting comment"**
- Verify CORS_ORIGINS includes your frontend URL
- For local dev: `http://localhost:5173`

**"Edit token not found"**
- Check localStorage is enabled in browser
- Clear site data and resubmit comment to get new token
- Check browser developer tools → Application → Local Storage

**Port 3000 already in use**
- Change PORT in .env
- Or kill existing process: `lsof -i :3000`

## 📝 Notes

- Comments are **soft-deleted** (marked isDeleted: true)
- Edit tokens are UUIDs, stored only on client
- Admin password is checked via Bearer token
- Gallery state is single row in database (id: 1)
- All timestamps use ISO 8601 format

## 📄 License

MIT

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Submit pull request

---

**Questions or Issues?** Check [API.md](./API.md) and [SETUP.md](./SETUP.md) for detailed guides.
#   s l i d e s  
 