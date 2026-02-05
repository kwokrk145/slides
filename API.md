# API Documentation

Complete reference for all REST endpoints in the Comments Gallery backend.

## Base URL

**Development:** `http://localhost:3000/api`
**Production:** `https://your-backend-domain.com/api`

## Authentication

Two types of authentication are used:

1. **Edit Token** (for comment operations)
   - Format: UUID string
   - Passed in header: `Authorization: Bearer <editToken>`
   - Obtained when creating a comment
   - Required to edit/delete only your own comments

2. **Admin Password** (for gallery state)
   - Format: Plain text (stored in ADMIN_PASSWORD env var)
   - Passed in header: `Authorization: Bearer <password>`
   - Required to toggle gallery release state

## Response Format

All responses are JSON.

**Success Response:**
```json
{
  "id": 123,
  "text": "Great person!",
  "message": "Success message (optional)"
}
```

**Error Response:**
```json
{
  "error": "Description of what went wrong"
}
```

---

## 📝 Comments Endpoints

### POST /api/comments

**Submit a new comment**

#### Request

```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d {
    "personId": 1,
    "text": "Great person, amazing talents!"
  }
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| personId | integer | Yes | ID of the person being commented on |
| text | string | Yes | Comment text (non-empty) |

#### Response (201 Created)

```json
{
  "id": 42,
  "editToken": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Comment created successfully"
}
```

**⚠️ Important:** Save the `editToken` immediately! It's the only way to edit/delete this comment.

#### Error Cases

| Status | Error | Reason |
|--------|-------|--------|
| 400 | "personId and text are required" | Missing fields |
| 400 | "Comment text cannot be empty" | Text is empty or whitespace |
| 404 | "Person not found" | Invalid personId |
| 500 | "Failed to create comment" | Server error |

---

### GET /api/comments/:personId

**Get all comments for a person (public)**

#### Request

```bash
curl http://localhost:3000/api/comments/1
```

#### Response (200 OK)

```json
[
  {
    "id": 1,
    "text": "Amazing person!",
    "createdAt": "2024-02-05T10:30:00Z"
  },
  {
    "id": 2,
    "text": "Great work",
    "createdAt": "2024-02-04T15:45:00Z"
  }
]
```

**Notes:**
- Returns non-deleted comments only
- Ordered by createdAt (newest first)
- **Edit tokens are NOT included** for security
- Public endpoint (no auth required)

#### Error Cases

| Status | Error | Reason |
|--------|-------|--------|
| 400 | "Invalid personId" | personId is not a number |
| 500 | "Failed to fetch comments" | Server error |

---

### PUT /api/comments/:commentId

**Update a comment (requires edit token)**

#### Request

```bash
curl -X PUT http://localhost:3000/api/comments/42 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000" \
  -d {
    "text": "Updated comment text"
  }
```

#### Request Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer <editToken> | Yes |
| Content-Type | application/json | Yes |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | Yes | New comment text |

#### Response (200 OK)

```json
{
  "id": 42,
  "text": "Updated comment text",
  "updatedAt": "2024-02-05T11:00:00Z",
  "message": "Comment updated successfully"
}
```

#### Error Cases

| Status | Error | Reason |
|--------|-------|--------|
| 400 | "Invalid commentId" | commentId is not a number |
| 400 | "Comment text cannot be empty" | Text is empty |
| 401 | "Edit token required" | No Authorization header |
| 403 | "Unauthorized: Invalid edit token" | Wrong token for this comment |
| 404 | "Comment not found" | Comment doesn't exist |
| 500 | "Failed to update comment" | Server error |

---

### DELETE /api/comments/:commentId

**Delete a comment (soft delete, requires edit token)**

#### Request

```bash
curl -X DELETE http://localhost:3000/api/comments/42 \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000"
```

#### Request Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer <editToken> | Yes |

#### Response (200 OK)

```json
{
  "message": "Comment deleted successfully"
}
```

**Note:** This is a "soft delete" - the comment is marked as deleted in the database but never actually removed. This protects data integrity.

#### Error Cases

| Status | Error | Reason |
|--------|-------|--------|
| 400 | "Invalid commentId" | commentId is not a number |
| 401 | "Edit token required" | No Authorization header |
| 403 | "Unauthorized: Invalid edit token" | Wrong token for this comment |
| 404 | "Comment not found" | Comment doesn't exist |
| 500 | "Failed to delete comment" | Server error |

---

## 🎨 Gallery Endpoints

### GET /api/gallery/state

**Get current gallery release state (public)**

#### Request

```bash
curl http://localhost:3000/api/gallery/state
```

#### Response (200 OK)

```json
{
  "isReleased": false
}
```

**Notes:**
- Public endpoint (no auth required)
- When `isReleased: false`, gallery comments should not be visible to users
- When `isReleased: true`, all non-deleted comments are visible

#### Error Cases

| Status | Error | Reason |
|--------|-------|--------|
| 500 | "Failed to fetch gallery state" | Server error |

---

### GET /api/gallery/people

**Get all people (public)**

#### Request

```bash
curl http://localhost:3000/api/gallery/people
```

#### Response (200 OK)

```json
[
  {
    "id": 1,
    "name": "Alice Johnson",
    "year": 2024,
    "imageUrl": "https://images.unsplash.com/...",
    "commentCount": 3
  },
  {
    "id": 2,
    "name": "Bob Smith",
    "year": 2023,
    "imageUrl": "https://images.unsplash.com/...",
    "commentCount": 1
  }
]
```

**Notes:**
- Public endpoint (no auth required)
- `commentCount` is count of non-deleted comments
- Ordered by ID (ascending)

#### Error Cases

| Status | Error | Reason |
|--------|-------|--------|
| 500 | "Failed to fetch people" | Server error |

---

### PUT /api/gallery/state

**Toggle gallery release state (admin only)**

#### Request

```bash
curl -X PUT http://localhost:3000/api/gallery/state \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-password" \
  -d {
    "isReleased": true
  }
```

#### Request Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer <ADMIN_PASSWORD> | Yes |
| Content-Type | application/json | Yes |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| isReleased | boolean | Yes | New gallery state |

#### Response (200 OK)

```json
{
  "isReleased": true,
  "message": "Gallery released"
}
```

Or if closing:

```json
{
  "isReleased": false,
  "message": "Gallery hidden"
}
```

#### Error Cases

| Status | Error | Reason |
|--------|-------|--------|
| 400 | "isReleased must be boolean" | Wrong type for isReleased |
| 401 | "Missing or invalid authorization" | No Authorization header |
| 403 | "Invalid admin password" | Wrong password |
| 500 | "Failed to update gallery state" | Server error |

---

## 🏥 Health Check

### GET /api/health

**Check if API is running**

#### Request

```bash
curl http://localhost:3000/api/health
```

#### Response (200 OK)

```json
{
  "status": "ok"
}
```

---

## 📊 Common Use Cases

### Submit a Comment and Save Token

```javascript
// 1. Submit comment
const response = await fetch('http://localhost:3000/api/comments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    personId: 1,
    text: "Great person!"
  })
});

const { id, editToken } = await response.json();

// 2. Save token to localStorage
localStorage.setItem(`comment_${id}`, editToken);
```

### Edit Comment Using Saved Token

```javascript
// 1. Get saved token
const editToken = localStorage.getItem('comment_42');

// 2. Update comment
const response = await fetch('http://localhost:3000/api/comments/42', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${editToken}`
  },
  body: JSON.stringify({
    text: "Updated text"
  })
});
```

### Check Gallery Status Before Showing Comments

```javascript
const galleryState = await fetch('http://localhost:3000/api/gallery/state')
  .then(r => r.json());

if (galleryState.isReleased) {
  // Show comments
} else {
  // Show "Gallery not released yet"
}
```

### Admin: Release Gallery

```javascript
const adminPassword = 'my-secret-admin-password';

const response = await fetch('http://localhost:3000/api/gallery/state', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminPassword}`
  },
  body: JSON.stringify({
    isReleased: true
  })
});
```

---

## 📋 Status Codes Reference

| Code | Meaning | when Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (comment creation) |
| 400 | Bad Request | Invalid parameters, missing fields |
| 401 | Unauthorized | Missing auth header |
| 403 | Forbidden | Wrong auth credentials |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |

---

## 🔄 CORS Headers

All responses include CORS headers configured from `CORS_ORIGINS` environment variable.

**Request from frontend:**
```
Origin: http://localhost:5173
```

**Response includes:**
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## 📚 Integration Example

See [web/src/utils/api.ts](../web/src/utils/api.ts) for a complete TypeScript client implementation of all these endpoints.

---

**Have questions?** Check [SETUP.md](./SETUP.md) for database setup or [README.md](./README.md) for overview.
