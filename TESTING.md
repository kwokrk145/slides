# API Testing & Examples

Complete examples for testing the Comments Gallery API.

## 🧪 Testing Setup

### Prerequisites

- Backend running: `npm run dev` in `api/` folder
- API URL: `http://localhost:3000/api`

### Tools for Testing

**Via Command Line:**
```bash
curl -X GET http://localhost:3000/api/health
```

**Via Browser:**
```
http://localhost:3000/api/health
```

**Via Postman/Insomnia:**
Import requests below

---

## 🟢 GET Requests (Read Data)

### 1. Health Check

**Purpose:** Verify API is running

**Command:**
```bash
curl http://localhost:3000/api/health
```

**Expected Response (200):**
```json
{
  "status": "ok"
}
```

---

### 2. Get Gallery State

**Purpose:** Check if gallery is released

**Command:**
```bash
curl http://localhost:3000/api/gallery/state
```

**Expected Response (200):**
```json
{
  "isReleased": false
}
```

---

### 3. Get All People

**Purpose:** Get list of all people for submit form

**Command:**
```bash
curl http://localhost:3000/api/gallery/people
```

**Expected Response (200):**
```json
[
  {
    "id": 1,
    "name": "Alice Johnson",
    "year": 2024,
    "imageUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    "commentCount": 2
  },
  {
    "id": 2,
    "name": "Bob Smith",
    "year": 2023,
    "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    "commentCount": 0
  }
]
```

---

### 4. Get Comments for a Person

**Purpose:** Fetch all comments for person ID 1

**Command:**
```bash
curl http://localhost:3000/api/comments/1
```

**Expected Response (200):**
```json
[
  {
    "id": 1,
    "text": "Amazing person!",
    "createdAt": "2024-02-05T10:30:00.000Z"
  },
  {
    "id": 2,
    "text": "Great work",
    "createdAt": "2024-02-04T15:45:00.000Z"
  }
]
```

**Error Cases:**

Invalid person ID:
```bash
curl http://localhost:3000/api/comments/invalid
```

Response (400):
```json
{
  "error": "Invalid personId"
}
```

---

## 🔵 POST Requests (Create Data)

### 1. Create a Comment

**Purpose:** Submit a new comment about a person

**Command:**
```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "personId": 1,
    "text": "This person is amazing!"
  }'
```

**Expected Response (201):**
```json
{
  "id": 42,
  "editToken": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Comment created successfully"
}
```

⚠️ **Save the editToken!** You'll need it to edit/delete this comment.

---

### Error Cases

**Missing fields:**
```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "personId": 1
  }'
```

Response (400):
```json
{
  "error": "personId and text are required"
}
```

**Empty comment text:**
```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "personId": 1,
    "text": "   "
  }'
```

Response (400):
```json
{
  "error": "Comment text cannot be empty"
}
```

**Invalid person ID:**
```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "personId": 999,
    "text": "Comment text"
  }'
```

Response (404):
```json
{
  "error": "Person not found"
}
```

---

## 🟡 PUT Requests (Update Data)

### 1. Update a Comment

**Purpose:** Edit your own comment using edit token

**Requirements:**
- Need the `editToken` from when comment was created
- Only comments matching the token can be updated

**Command:**
```bash
curl -X PUT http://localhost:3000/api/comments/42 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "text": "Updated comment text"
  }'
```

**Expected Response (200):**
```json
{
  "id": 42,
  "text": "Updated comment text",
  "updatedAt": "2024-02-05T11:00:00.000Z",
  "message": "Comment updated successfully"
}
```

---

### Error Cases

**Missing edit token:**
```bash
curl -X PUT http://localhost:3000/api/comments/42 \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Updated text"
  }'
```

Response (401):
```json
{
  "error": "Edit token required"
}
```

**Wrong edit token:**
```bash
curl -X PUT http://localhost:3000/api/comments/42 \
  -H "Authorization: Bearer wrong-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Updated text"
  }'
```

Response (403):
```json
{
  "error": "Unauthorized: Invalid edit token"
}
```

**Comment doesn't exist:**
```bash
curl -X PUT http://localhost:3000/api/comments/9999 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "text": "Updated text"
  }'
```

Response (404):
```json
{
  "error": "Comment not found"
}
```

---

### 2. Toggle Gallery Release (Admin)

**Purpose:** Release/hide gallery for all users

**Requirements:**
- Must provide correct `ADMIN_PASSWORD` from `.env`

**Command (Release Gallery):**
```bash
curl -X PUT http://localhost:3000/api/gallery/state \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YourAdminPassword123" \
  -d '{
    "isReleased": true
  }'
```

**Expected Response (200):**
```json
{
  "isReleased": true,
  "message": "Gallery released"
}
```

**Command (Hide Gallery):**
```bash
curl -X PUT http://localhost:3000/api/gallery/state \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YourAdminPassword123" \
  -d '{
    "isReleased": false
  }'
```

**Expected Response (200):**
```json
{
  "isReleased": false,
  "message": "Gallery hidden"
}
```

---

### Error Cases

**Wrong admin password:**
```bash
curl -X PUT http://localhost:3000/api/gallery/state \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer WrongPassword" \
  -d '{
    "isReleased": true
  }'
```

Response (403):
```json
{
  "error": "Invalid admin password"
}
```

**Missing authorization header:**
```bash
curl -X PUT http://localhost:3000/api/gallery/state \
  -H "Content-Type: application/json" \
  -d '{
    "isReleased": true
  }'
```

Response (401):
```json
{
  "error": "Missing or invalid authorization"
}
```

**Invalid isReleased type:**
```bash
curl -X PUT http://localhost:3000/api/gallery/state \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YourAdminPassword123" \
  -d '{
    "isReleased": "true"
  }'
```

Response (400):
```json
{
  "error": "isReleased must be boolean"
}
```

---

## 🔴 DELETE Requests (Remove Data)

### 1. Delete a Comment

**Purpose:** Soft delete your comment (marks as deleted but doesn't remove)

**Requirements:**
- Need the `editToken` from when comment was created
- Only comments matching the token can be deleted

**Command:**
```bash
curl -X DELETE http://localhost:3000/api/comments/42 \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000"
```

**Expected Response (200):**
```json
{
  "message": "Comment deleted successfully"
}
```

---

### Error Cases

**Missing edit token:**
```bash
curl -X DELETE http://localhost:3000/api/comments/42
```

Response (401):
```json
{
  "error": "Edit token required"
}
```

**Wrong edit token:**
```bash
curl -X DELETE http://localhost:3000/api/comments/42 \
  -H "Authorization: Bearer wrong-token"
```

Response (403):
```json
{
  "error": "Unauthorized: Invalid edit token"
}
```

**Comment doesn't exist:**
```bash
curl -X DELETE http://localhost:3000/api/comments/9999 \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000"
```

Response (404):
```json
{
  "error": "Comment not found"
}
```

---

## 🎯 Complete Workflow Test

Follow this sequence to test the entire app:

### 1. Check API Status
```bash
curl http://localhost:3000/api/health
```

### 2. Get People
```bash
curl http://localhost:3000/api/gallery/people
```
✅ Should return list of people

### 3. Check Gallery Status
```bash
curl http://localhost:3000/api/gallery/state
```
✅ Should return `isReleased: false`

### 4. Submit Comment
```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "personId": 1,
    "text": "Test comment"
  }'
```
✅ Should return `id` and `editToken`
📝 **Save the editToken!**

### 5. View Comments
```bash
curl http://localhost:3000/api/comments/1
```
✅ Should show your comment

### 6. Update Comment
Replace `42` with your comment ID and `TOKEN` with your edit token:
```bash
curl -X PUT http://localhost:3000/api/comments/42 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "text": "Updated test comment"
  }'
```
✅ Comment should be updated

### 7. Release Gallery (Admin)
Replace `PASSWORD` with your ADMIN_PASSWORD from `.env`:
```bash
curl -X PUT http://localhost:3000/api/gallery/state \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PASSWORD" \
  -d '{
    "isReleased": true
  }'
```
✅ Should return `isReleased: true`

### 8. Check Gallery Status Again
```bash
curl http://localhost:3000/api/gallery/state
```
✅ Should return `isReleased: true`

### 9. Delete Comment
```bash
curl -X DELETE http://localhost:3000/api/comments/42 \
  -H "Authorization: Bearer TOKEN"
```
✅ Should return success message

### 10. Verify Soft Delete
```bash
curl http://localhost:3000/api/comments/1
```
✅ Your comment should no longer appear (soft deleted)

---

## 📊 Using Prisma Studio

Visual database explorer - great for debugging:

```bash
cd api
npm run prisma:studio
```

Opens at http://localhost:5555

You can:
- View all tables
- See actual data
- Modify records
- Test queries

---

## 🔧 TypeScript Client

The frontend already has a complete API client. See [web/src/utils/api.ts](../web/src/utils/api.ts) for how to call these endpoints from JavaScript/TypeScript.

---

## 📝 Notes for Integration

- Always send `Content-Type: application/json` header
- Edit tokens are UUIDs (look like: `550e8400-e29b-41d4-a716-446655440000`)
- Timestamps are ISO 8601 format (UTC timezone)
- All IDs are integers
- Comments are sorted newest first (by createdAt DESC)

---

**Next:** See [API.md](./API.md) for complete endpoint documentation.
