# undbauen Backend API

Backend API für die undbauen Community Platform.

## Features

- ✅ JWT Authentication
- ✅ PostgreSQL Database
- ✅ Password Hashing (bcrypt)
- ✅ Rate Limiting
- ✅ Security Headers (Helmet)
- ✅ CORS Support
- ✅ Input Validation

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE undbauen;
```

3. Run schema:
```bash
psql -U postgres -d undbauen -f database/schema.sql
```

### 3. Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=undbauen
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### 4. Start Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout (requires auth)

### Example Request

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get user info
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Project Structure

```
backend/
├── config/          # Configuration files
│   └── database.js  # Database connection
├── database/        # Database schema and migrations
│   └── schema.sql   # PostgreSQL schema
├── middleware/       # Express middleware
│   ├── auth.js      # Authentication middleware
│   ├── rateLimiter.js # Rate limiting
│   └── validation.js # Input validation
├── routes/          # API routes
│   └── auth.js      # Authentication routes
├── server.js        # Main server file
└── package.json     # Dependencies
```

## Next Steps

- [ ] Implement remaining API endpoints (users, messages, forum, admin)
- [ ] File upload endpoints
- [ ] S3/CDN integration
- [ ] Error logging (Sentry)
- [ ] API documentation (Swagger)






