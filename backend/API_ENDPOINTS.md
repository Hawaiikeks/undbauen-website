# API Endpoints Dokumentation
## undbauen Backend API

**Base URL:** `http://localhost:3000/api` (Development)  
**Base URL:** `https://undbauen.de/api` (Production)

---

## ✅ Implementierte Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout (requires auth)

### Users (`/api/users`) - Admin only

- `GET /api/users` - List all users (with search, filter by role/status)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id/role` - Update user role
- `PATCH /api/users/:id/status` - Update user status
- `DELETE /api/users/:id` - Delete user

### Profiles (`/api/profiles`)

- `GET /api/profiles/members` - List all members (public)
- `GET /api/profiles/members/:email` - Get member profile by email (public)
- `GET /api/profiles/me` - Get current user's profile (requires auth)
- `PUT /api/profiles/me` - Update current user's profile (requires auth)

### Events (`/api/events`)

- `GET /api/events` - List all events (optional: `?upcoming=true`)
- `GET /api/events/:id` - Get event by ID
- `POST /api/events/:id/book` - Book an event (requires auth)
- `DELETE /api/events/:id/book` - Cancel booking (requires auth)
- `GET /api/events/:id/participants` - Get event participants
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

---

## ✅ Weitere implementierte Endpoints

### Forum (`/api/forum`)

- `GET /api/forum/categories` - List forum categories
- `GET /api/forum/threads` - List forum threads (with search, category filter)
- `GET /api/forum/threads/:id` - Get forum thread
- `GET /api/forum/threads/:id/posts` - Get thread posts
- `POST /api/forum/threads` - Create forum thread (requires auth)
- `POST /api/forum/threads/:id/posts` - Reply to thread (requires auth)
- `DELETE /api/forum/posts/:id` - Delete post (requires auth)
- `POST /api/forum/threads/:id/like` - Like thread (requires auth)
- `PATCH /api/forum/threads/:id/pin` - Pin thread (admin only)
- `PATCH /api/forum/threads/:id/lock` - Lock thread (admin/moderator only)
- `DELETE /api/forum/threads/:id` - Delete thread (admin only)

### Messages (`/api/messages`)

- `GET /api/messages/threads` - List message threads (requires auth)
- `GET /api/messages/threads/:id` - Get thread details (requires auth)
- `GET /api/messages/threads/:id/messages` - Get thread messages (requires auth)
- `POST /api/messages/threads` - Create new thread (requires auth)
- `POST /api/messages/threads/:id/messages` - Send message (requires auth)
- `PATCH /api/messages/threads/:id/read` - Mark thread as read (requires auth)

### CMS (`/api/cms`)

- `GET /api/cms/updates` - List monthly updates (public)
- `GET /api/cms/updates/:id` - Get update by ID (public)
- `GET /api/cms/publications` - List publications (public)
- `POST /api/cms/updates` - Create update (admin only)
- `PUT /api/cms/updates/:id` - Update update (admin only)
- `GET /api/cms/updates/drafts/all` - Get all updates including drafts (admin only)
- `DELETE /api/cms/updates/:id` - Delete update (admin only)
- `POST /api/cms/publications` - Create publication (admin only)
- `DELETE /api/cms/publications/:id` - Delete publication (admin only)

---

## ⚠️ Noch zu implementieren

- `GET /api/forum/categories` - List forum categories
- `GET /api/forum/threads` - List forum threads
- `GET /api/forum/threads/:id` - Get forum thread
- `GET /api/forum/threads/:id/posts` - Get thread posts
- `POST /api/forum/threads` - Create forum thread (requires auth)
- `POST /api/forum/threads/:id/posts` - Reply to thread (requires auth)
- `DELETE /api/forum/posts/:id` - Delete post (requires auth)
- `POST /api/forum/threads/:id/like` - Like thread (requires auth)
- `POST /api/forum/threads/:id/watch` - Watch thread (requires auth)
- `PATCH /api/forum/threads/:id/pin` - Pin thread (admin only)
- `PATCH /api/forum/threads/:id/lock` - Lock thread (admin only)
- `DELETE /api/forum/threads/:id` - Delete thread (admin only)

### Messages (`/api/messages`)

- `GET /api/messages/threads` - List message threads (requires auth)
- `GET /api/messages/threads/:id` - Get thread details (requires auth)
- `GET /api/messages/threads/:id/messages` - Get thread messages (requires auth)
- `POST /api/messages/threads` - Create new thread (requires auth)
- `POST /api/messages/threads/:id/messages` - Send message (requires auth)
- `PATCH /api/messages/threads/:id/read` - Mark thread as read (requires auth)

### Notifications (`/api/notifications`)

- `GET /api/notifications` - List notifications (requires auth)
- `PATCH /api/notifications/:id/read` - Mark notification as read (requires auth)

### CMS (`/api/cms`)

- `GET /api/cms/updates` - List monthly updates (public)
- `GET /api/cms/updates/:id` - Get update by ID (public)
- `GET /api/cms/publications` - List publications (public)
- `POST /api/cms/updates` - Create update (admin only)
- `PUT /api/cms/updates/:id` - Update update (admin only)
- `DELETE /api/cms/updates/:id` - Delete update (admin only)
- `POST /api/cms/publications` - Create publication (admin only)
- `DELETE /api/cms/publications/:id` - Delete publication (admin only)

### Knowledge Base (`/api/knowledge`)

- `GET /api/knowledge/articles` - List articles
- `GET /api/knowledge/articles/:id` - Get article by ID
- `POST /api/knowledge/articles` - Create article (admin only)
- `PUT /api/knowledge/articles/:id` - Update article (admin only)
- `DELETE /api/knowledge/articles/:id` - Delete article (admin only)

### Resources (`/api/resources`)

- `GET /api/resources` - List resources
- `GET /api/resources/:id` - Get resource by ID
- `POST /api/resources` - Create resource (admin only)
- `PUT /api/resources/:id` - Update resource (admin only)
- `DELETE /api/resources/:id` - Delete resource (admin only)

### Reports (`/api/reports`)

- `GET /api/reports` - List reports (admin only)
- `POST /api/reports` - Create report (requires auth)
- `PATCH /api/reports/:id/status` - Update report status (admin only)

### Tickets (`/api/tickets`)

- `GET /api/tickets` - List tickets (requires auth)
- `GET /api/tickets/:id` - Get ticket by ID (requires auth)
- `POST /api/tickets` - Create ticket (requires auth)
- `PATCH /api/tickets/:id` - Update ticket (requires auth)
- `DELETE /api/tickets/:id` - Delete ticket (admin only)

### Files (`/api/files`)

- `POST /api/files/upload` - Upload file (requires auth)
- `GET /api/files/:id` - Get file metadata
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file (requires auth)

---

## 🔐 Authentication

Alle Endpoints, die `requires auth` benötigen, müssen einen JWT Token im Header mitführen:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

Token erhält man durch:
- `POST /api/auth/register` - Bei Registrierung
- `POST /api/auth/login` - Bei Login

---

## 📝 Beispiel-Requests

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test1234"
  }'
```

### Get Profile (mit Token)
```bash
curl -X GET http://localhost:3000/api/profiles/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### List Events
```bash
curl -X GET http://localhost:3000/api/events?upcoming=true
```

### Book Event (mit Token)
```bash
curl -X POST http://localhost:3000/api/events/EVENT_ID/book \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚀 Status

**Implementiert:** ✅ Auth, Users, Profiles, Events  
**In Arbeit:** ⚠️ Forum, Messages, CMS  
**Geplant:** 📋 Notifications, Knowledge, Resources, Reports, Tickets, Files

**Geschätzte Zeit für alle Endpoints:** 2-3 Wochen

