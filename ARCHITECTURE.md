# Architecture & Design

Technical overview of how the Comments Gallery system works.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   User's Browser                              │
│                                                               │
│  ┌──────────────────────────────────────┐                   │
│  │    React + TypeScript Frontend        │                   │
│  │  ┌────────────────────────────────┐  │                   │
│  │  │  Navigation Bar                │  │                   │
│  │  └────────────────────────────────┘  │                   │
│  │                                       │                   │
│  │  ┌─────────┬──────────┬──────────┐  │                   │
│  │  │ Submit  │ Gallery  │  Admin   │  │                   │
│  │  │ Page    │ Page     │ Page     │  │                   │
│  │  └─────────┴──────────┴──────────┘  │                   │
│  │                                       │                   │
│  │  localStorage: {                     │                   │
│  │    comment_1: "uuid-token",          │                   │
│  │    comment_2: "uuid-token"           │                   │
│  │  }                                    │                   │
│  └──────────────────────────────────────┘                   │
│              ▲                                                │
│              │ HTTP/REST                                     │
│              ▼                                                │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ HTTPS only
                        ▼
         ┌──────────────────────────┐
         │  Express.js API Server   │
         │  (Node.js)               │
         │                          │
         │ ┌──────────────────────┐ │
         │ │  Routes              │ │
         │ │  ├─ /comments        │ │
         │ │  ├─ /gallery         │ │
         │ │  └─ /health          │ │
         │ └──────────────────────┘ │
         │                          │
         │ ┌──────────────────────┐ │
         │ │  Middleware          │ │
         │ │  ├─ CORS             │ │
         │ │  ├─ Auth (tokens)    │ │
         │ │  └─ Admin check      │ │
         │ └──────────────────────┘ │
         │                          │
         │ ┌──────────────────────┐ │
         │ │  Prisma ORM          │ │
         │ └──────────────────────┘ │
         └──────────────────────────┘
                        │
                        │ TCP Connection
                        ▼
         ┌──────────────────────────┐
         │  PostgreSQL Database     │
         │  (Neon/Supabase/etc)     │
         │                          │
         │  Tables:                 │
         │  ├─ persons              │
         │  ├─ comments             │
         │  └─ gallery_states       │
         └──────────────────────────┘
```

## 🔄 Data Flow

### Submitting a Comment

```
1. User clicks person card
   ↓
2. Modal opens with comment form
   ↓
3. User types comment + clicks Submit
   ↓
4. Frontend: POST /api/comments
   {
     "personId": 1,
     "text": "Great person!"
   }
   ↓
5. Backend: Validate
   - Check person exists
   - Check text not empty
   - Generate UUID editToken
   ↓
6. Backend: Insert into comments table
   INSERT INTO comments (personId, text, editToken, isDeleted)
   VALUES (1, "Great person!", "uuid-123", false)
   ↓
7. Backend responds with: { id: 42, editToken: "uuid-123" }
   ↓
8. Frontend: Save to localStorage
   localStorage.comment_42 = "uuid-123"
   ↓
9. Show success message
   User can now edit/delete this comment using saved token
```

### Editing a Comment

```
1. User clicks "Edit" button on their comment
   ↓
2. Modal opens with comment text
   ↓
3. User updates text + clicks Save
   ↓
4. Frontend retrieves editToken from localStorage
   ↓
5. PUT /api/comments/42
   Headers: Authorization: Bearer "uuid-123"
   {
     "text": "Updated text"
   }
   ↓
6. Backend: Verify editToken matches comment
   ↓
7. Backend: Update row in comments table
   ↓
8. Frontend: Show success, close modal
```

### Gallery Release

```
1. Admin clicks "Admin" page
   ↓
2. Admin enters password
   ↓
3. Frontend: PUT /api/gallery/state
   Headers: Authorization: Bearer "MyAdminPassword"
   {
     "isReleased": true
   }
   ↓
4. Backend: Check admin password matches ADMIN_PASSWORD env var
   ↓
5. Backend: Update gallery_states table
   UPDATE gallery_states SET isReleased = true WHERE id = 1
   ↓
6. Gallery page now shows comments to all users
   - First checks: GET /api/gallery/state
   - If isReleased = true, shows comments
   - If false, shows "Gallery not released yet"
```

## 🔐 Authentication & Authorization

### Two Types of Auth

```
┌─────────────────────────────────┐
│  Edit Token (For Comments)      │
├─────────────────────────────────┤
│ Type: UUID v4 string            │
│ Generated: When comment created  │
│ Usage: Edit/delete own comments │
│ Stored: localStorage (client)   │
│ Sent: Authorization: Bearer ... │
│ Checked: Against comment.token  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Admin Password (For Gallery)   │
├─────────────────────────────────┤
│ Type: Plain text string         │
│ Stored: ADMIN_PASSWORD env var  │
│ Usage: Release/hide gallery     │
│ Sent: Authorization: Bearer ... │
│ Checked: Exact match in code    │
└─────────────────────────────────┘
```

### Authorization Flow

```
User Request → Backend
                ├─ Is this a public endpoint?
                │  YES → Process request
                │  ├─ GET /api/gallery/people ✓
                │  ├─ GET /api/comments/:id ✓
                │  └─ GET /api/gallery/state ✓
                │
                └─ Is this a protected endpoint?
                   YES → Check auth header
                   ├─ Edit comment?
                   │  └─ Check editToken matches
                   │     ├─ Valid? → Update comment
                   │     └─ Invalid? → 403 error
                   │
                   └─ Gallery state?
                      └─ Check admin password
                         ├─ Valid? → Update state
                         └─ Invalid? → 403 error
```

## 📦 Component Hierarchy

```
App (Main component)
├─ Navigation Bar
│  ├─ "Submit" button
│  ├─ "Gallery" button
│  └─ "Admin" button
│
├─ SubmitPage (when Submit selected)
│  └─ PersonCard (repeated for each person)
│     ├─ Image
│     ├─ Name + Year
│     └─ Modal (opens on click)
│        ├─ Comment textarea
│        ├─ Submit button
│        └─ Cancel button
│
├─ GalleryPage (when Gallery selected)
│  ├─ Slideshow
│  │  ├─ Image
│  │  ├─ Person info
│  │  ├─ Prev button
│  │  └─ Next button
│  └─ Comments section
│     └─ Comment list
│        └─ Comment item
│           ├─ Text
│           ├─ Date
│           ├─ Edit button (if own)
│           └─ Delete button (if own)
│
└─ AdminPage (when Admin selected)
   ├─ Login form (if not authenticated)
   │  ├─ Password input
   │  └─ Login button
   └─ Admin dashboard (if authenticated)
      ├─ Status display
      ├─ Toggle button
      └─ Logout button
```

## 🔄 State Management

### Frontend State

```
App Component
├─ currentPage: "submit" | "gallery" | "admin"
│  (Controls which page to show)
│
SubmitPage
├─ people: Person[]
├─ isLoading: boolean
└─ error: string

GalleryPage
├─ people: Person[]
├─ isReleased: boolean
├─ currentIndex: number (which person)
├─ comments: Comment[]
├─ editingCommentId: number | null
└─ editingText: string

AdminPage
├─ isLoggedIn: boolean
├─ password: string (temp, not stored)
├─ isReleased: boolean
├─ isLoading: boolean
└─ error: string

LocalStorage
└─ commentTokens: {
     "42": "uuid-token",
     "43": "uuid-token"
   }
```

### Backend State

```
Database (PostgreSQL)

persons table
├─ id (primary key)
├─ name (string)
├─ year (integer)
└─ imageUrl (string)

comments table
├─ id (primary key)
├─ personId (foreign key)
├─ text (string)
├─ editToken (string, unique)
├─ isDeleted (boolean, soft delete)
├─ createdAt (timestamp)
└─ updatedAt (timestamp)

gallery_states table
├─ id (always 1)
└─ isReleased (boolean)
```

## 🌐 Network Communication

### Request/Response Pattern

```
Frontend                            Backend
   │                                   │
   ├─ POST /api/comments ────────────>│
   │  Body: { personId, text }        │
   │                                   ├─ Validate
   │                                   ├─ Generate token
   │                                   ├─ Insert DB
   │<─────── 201 Created ──────────────┤
   │  Body: { id, editToken }         │
   │                                   │
   ├─ GET /api/comments/:id ─────────>│
   │                                   ├─ Query DB
   │<─────── 200 OK ────────────────── ┤
   │  Body: [comments...]             │
   │                                   │
   ├─ PUT /api/comments/:id ─────────>│
   │  Header: Auth: Bearer token      │
   │  Body: { text }                  │
   │                                   ├─ Validate token
   │                                   ├─ Update DB
   │<─────── 200 OK ────────────────── ┤
   │  Body: { id, text, updatedAt }   │
   │                                   │
   ├─ DELETE /api/comments/:id ──────>│
   │  Header: Auth: Bearer token      │
   │                                   ├─ Validate token
   │                                   ├─ Mark as deleted
   │<─────── 200 OK ────────────────── ┤
   │  Body: { message }               │
   │                                   │
   ├─ GET /api/gallery/state ────────>│
   │                                   ├─ Query DB
   │<─────── 200 OK ────────────────── ┤
   │  Body: { isReleased }            │
   │                                   │
   ├─ PUT /api/gallery/state ────────>│
   │  Header: Auth: Bearer password   │
   │  Body: { isReleased }            │
   │                                   ├─ Verify password
   │                                   ├─ Update DB
   │<─────── 200 OK ────────────────── ┤
   │  Body: { isReleased, message }   │
   │                                   │
```

## 🔍 Soft Delete Pattern

Why we never permanently delete comments:

```
Traditional Delete:
├─ DELETE FROM comments WHERE id = 42
└─ Data is GONE forever (risky!)

Soft Delete:
├─ UPDATE comments SET isDeleted = true WHERE id = 42
├─ Data still in database
├─ Invisible to users (isDeleted = true)
├─ Admin can see all history
└─ Safe - data can be recovered if needed
```

Benefits:
- Data recovery if mistakes happen
- Audit trail (can see what was deleted)
- No orphaned comment references

## 🔒 Security Layers

```
Frontend
├─ Only edit/delete if editToken in localStorage
└─ Token validated using form submission

Backend
├─ CORS: Only accept requests from approved origins
├─ Edit Token: Validate token matches comment
├─ Admin Password: Verify exact string match
└─ Input Validation: Check text not empty, personId exists

Database
├─ Unique constraint on editToken (can't be guessed)
├─ Foreign keys ensure personId exists
└─ isDeleted flag protects data from accidental exposure
```

## 📊 Scalability Considerations

Current setup handles:
- ✅ 1,000+ comments
- ✅ 100+ people
- ✅ 100+ concurrent users
- ✅ Unlimited gallery releases/toggles

If you need more:
1. Add database indexing (Prisma: `@@index([personId])`)
2. Implement caching (Redis)
3. Add pagination to comment endpoints
4. Use CDN for images
5. Read replicas for database scaling

---

See [README.md](./README.md) for project overview or [API.md](./API.md) for endpoint details.
