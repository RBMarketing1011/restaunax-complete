# RestaunaX Backend API

Node.js/TypeScript restaurant management API with authentication, email verification, and order management.

## 🏗️ Overview

This backend can be used in two ways:
1. **Standalone Service** - Independent API server for microservices architecture
2. **Development Reference** - The frontend can run standalone with built-in API routes

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your settings. *See "Email Setup (SMTP)" section before launching*

3. **Setup Database**
   
   **If this is a fresh database:**
   ```bash
   npx prisma db push
   ```
   
   **If same database as frontend and already formatted, or if Prisma client not generated on db push:**
   ```bash
   npx prisma generate
   ```

4. **Start Server**
   ```bash
   npm run dev
   ```

5. **Access API**
   - API Base: http://localhost:8081
   - Health Check: http://localhost:8081/api/health
   - Prisma Studio: `npm run studio`

## 📧 Email Setup (SMTP)

This backend uses [Nodemailer](https://nodemailer.com/) for email verification. Most email providers require an **App Password** instead of your normal account password.

### 🔑 How to Get an App Password
- **Gmail**  
  1. Enable 2FA in your Google Account.  
  2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords).  
  3. Generate a new password and copy it.  

- **Zoho Mail**  
  1. Log into [Zoho Mail](https://mail.zoho.com).  
  2. Go to **My Account → Security → App Passwords**.  
  3. Generate a password for "SMTP/Nodemailer."  

- **Outlook / Office 365**  
  1. Enable 2FA in your Microsoft Account.  
  2. Go to [App Passwords](https://account.live.com/proofs/AppPassword).  
  3. Generate and copy the new password.

## ⚙️ Environment Variables

Configure your `.env` file:

```env
# Environment Configuration
NODE_ENV="development"
PORT="8081"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/restaunax"

# Authentication
JWT_SECRET="your-secret-key-here-change-this-in-production"
JWT_EXPIRES_IN="30d"
AUTH_KEY="same-as-frontend-auth-key"

# Email Configuration (for verification)
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="465"
EMAIL_FROM="RestaunaX Support <your-email@gmail.com>"

# Application
CORS_ORIGIN="http://localhost:3000" # Your frontend URL

# Development
DEBUG="true"
```

### Important Notes
- `AUTH_KEY` must match the frontend's `NEXT_PUBLIC_AUTH_KEY` exactly
- `CORS_ORIGIN` should be your frontend URL
- Use app passwords for email providers, not regular passwords

## 🛠️ Development Commands

```bash
npm run dev          # Start development server with nodemon
npm run build        # Compile TypeScript to dist/
npm run start        # Start compiled server
npm run type-check   # TypeScript type checking
npm run migrate      # Run Prisma migrations
npm run studio       # Open Prisma Studio
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-verification` - Resend verification email

### Users
- `GET /api/user/profile/:userId` - Get user profile
- `PATCH /api/user/profile/:userId` - Update user profile
- `POST /api/user/change-password` - Change password

### Accounts
- `PATCH /api/account/update/:accountId` - Update account
- `DELETE /api/account/delete/:accountId` - Delete account

### Orders
- `GET /api/orders` - Get orders for account
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get specific order
- `PATCH /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Development
- `GET /api/health` - Health check
- `POST /api/dev/reset-db` - Reset database with seed data (dev only)

## 🔐 Authentication & Security

### API Key Authentication
All endpoints require authentication via:
```http
x-api-key: your-auth-key-here
```

### JWT Tokens
User sessions are managed with JWT tokens containing:
- User ID and email
- Account information
- Expiration time

### CORS Protection
Configure `CORS_ORIGIN` to restrict frontend origins.

### Input Validation
All endpoints use Joi validation for request data.

## 🗄️ Database Schema

### User
- User accounts with email verification
- Password hashing with bcrypt
- Account relationship (many users per account)

### Account
- Restaurant account information
- Owner relationship
- Order aggregation

### Order
- Customer orders with items
- Status tracking (pending, confirmed, preparing, ready, delivered)
- Account association

### OrderItem
- Individual items within orders
- Quantity and pricing information

## 🚀 Production Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8081
CMD ["npm", "start"]
```

### Environment Setup
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production database
- Set up proper CORS origins
- Use secure email credentials

### Monitoring
- Health endpoint for uptime monitoring
- Error logging with proper error handling
- Debug mode controllable via `DEBUG` environment variable

## 🧪 Testing

### Manual Testing
Use the development reset endpoint to populate test data:
```bash
curl -X POST http://localhost:8081/api/dev/reset-db \
  -H "x-api-key: your-auth-key"
```

### API Testing
Use tools like Postman or curl to test endpoints. All requests require the `x-api-key` header.

## 🔧 Troubleshooting

### Common Issues

**Server Won't Start**
- Check if port 8081 is available
- Verify PostgreSQL is running
- Check DATABASE_URL format

**Database Connection Issues**
- Verify PostgreSQL credentials
- Run `npx prisma generate` if client is missing
- Check database exists and is accessible

**Email Not Sending**
- Verify SMTP credentials and app password
- Check firewall blocking email ports
- Test with a simple email provider first

**Frontend Connection Issues**
- Verify CORS_ORIGIN matches frontend URL
- Check AUTH_KEY matches frontend configuration
- Ensure server is running on correct port

## 📚 Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + API Keys
- **Email**: Nodemailer
- **Validation**: Joi
- **Security**: Helmet, CORS, bcrypt

## 📄 License

MIT License
