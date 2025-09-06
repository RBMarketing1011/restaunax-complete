# RestaunaX Backend API

Node.js/TypeScript restaurant management API with authentication, email verification, and order management.

## What This Covers

**� Authentication & Security**
- User registration with email verification
- JWT sessions + API key protection
- Rate limiting and input validation

**👥 User & Account Management**
- User profiles and account ownership
- Password changes and cascade deletes

**📦 Order Management**
- Full CRUD for orders and order items
- Status tracking and filtering

**🛠️ Development Tools**
- Database seeding with realistic test data
- Health checks and dev endpoints

## Quick Setup

### 1. Install & Configure
```bash
npm install
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/restaunax"
AUTH_KEY="simple-auth-key-123"
JWT_SECRET="your-jwt-secret"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
```

### 2. Database & Start
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### 3. Test It
```bash
# Health check
curl -H "x-api-key: simple-auth-key-123" http://localhost:8081/api/health

## Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL, Prisma ORM
- **Auth:** JWT + bcryptjs + API keys
- **Email:** Nodemailer with verification tokens
- **Validation:** Joi schemas

---
*Ready-to-use restaurant API in minutes*