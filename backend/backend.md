# RestaunaX Backend API Documentation

## Overview
This document provides a comprehensive breakdown of all API routes in the RestaunaX restaurant management system. The backend uses Prisma ORM for database operations.

## Database Schema
- **User**: User accounts with email verification
- **Account**: Restaurant accounts (each user belongs to one account)
- **Order**: Customer orders with items
- **OrderItem**: Individual items within orders

## Authentication
All protected routes require authentication

---

## API Routes

### 🔐 Authentication Routes

#### `POST /api/auth/register`
**Purpose**: Register a new user account  
**Access**: Public  
**Body**:
```json
{
  "name": "string",
  "email": "string", 
  "password": "string"
}
```
**Response**: 
- Success: `{ "message": "User created successfully..." }`
- Error: `{ "message": "Error details" }`
**Features**:
- Creates new user with hashed password
- Creates associated restaurant account
- Sends email verification
- Validates input (6+ char password, unique email)

#### `POST /api/auth/check-credentials`
**Purpose**: Validate user credentials for NextAuth  
**Access**: Internal (used by NextAuth)  
**Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Response**:
- Success: `{ "id": "string", "email": "string", "name": "string", "accountId": "string" }`
- Error: `{ "error": "string", "code": "EMAIL_NOT_VERIFIED" }`
**Features**:
- Validates email/password against database
- Checks email verification status
- Returns user data with account information

#### `POST /api/auth/check-user`
**Purpose**: Check if user exists and verification status  
**Access**: Public  
**Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Response**: `{ "unverified": boolean }`
**Features**:
- Used for login error handling
- Identifies unverified email scenarios

#### `GET /api/auth/verify-email?token=string`
**Purpose**: Verify user email address  
**Access**: Public  
**Query**: `token` - verification token from email  
**Response**: Redirects to sign-in page with status message  
**Features**:
- Validates verification token
- Marks email as verified
- Handles expired/invalid tokens

#### `POST /api/auth/resend-verification`
**Purpose**: Resend email verification  
**Access**: Public  
**Body**:
```json
{
  "email": "string"
}
```
**Response**: `{ "message": "Verification email sent" }`
**Features**:
- Generates new verification token
- Sends new verification email
- Rate limiting (once per minute)

#### `GET|POST /api/auth/[...nextauth]`
**Purpose**: NextAuth.js authentication handler  
**Access**: Public  
**Features**:
- Handles sign-in, sign-out, session management
- JWT token generation and validation
- Session callbacks

---

### 👤 User Management Routes

#### `GET /api/user/profile`
**Purpose**: Fetch user profile data  
**Access**: Protected (requires session)  
**Response**:
```json
{
  "id": "string",
  "name": "string", 
  "email": "string",
  "accountId": "string",
  "isAccountOwner": boolean,
  "account": {
    "id": "string",
    "name": "string",
    "ownerId": "string",
    "users": [...]
  }
}
```
**Features**:
- Returns complete user profile
- Includes account information
- Shows account ownership status

#### `PATCH /api/user/profile`
**Purpose**: Update user profile  
**Access**: Protected (requires session)  
**Body**:
```json
{
  "name": "string",
  "email": "string" // optional
}
```
**Response**: `{ "message": "Profile updated successfully" }`
**Features**:
- Updates user name and email
- Email change requires re-verification
- Validates input data

#### `POST /api/user/change-password`
**Purpose**: Change user password  
**Access**: Protected (requires session)  
**Body**:
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```
**Response**: `{ "message": "Password changed successfully" }`
**Features**:
- Validates current password
- Enforces password strength (6+ characters)
- Hashes new password

---

### 🏢 Account Management Routes

#### `PATCH /api/account/update`
**Purpose**: Update account settings  
**Access**: Protected (account owner only)  
**Body**:
```json
{
  "name": "string"
}
```
**Response**: `{ "message": "Account updated successfully" }`
**Features**:
- Updates account name
- Owner-only access

#### `DELETE /api/account/delete`
**Purpose**: Delete entire account  
**Access**: Protected (account owner only)  
**Response**: `{ "message": "Account deleted successfully" }`
**Features**:
- Cascading delete of all account data
- Removes users, orders, and account
- Irreversible operation

---

### 📦 Order Management Routes

#### `GET /api/orders`
**Purpose**: Fetch orders for account  
**Access**: Protected (requires session)  
**Query Parameters**:
- `status` (optional): Filter by order status
**Response**: Array of order objects with items
```json
[
  {
    "id": "string",
    "accountId": "string",
    "customerName": "string",
    "orderType": "delivery|pickup",
    "status": "pending|preparing|ready|delivered",
    "total": number,
    "createdAt": "datetime",
    "items": [
      {
        "id": "string",
        "name": "string",
        "price": number,
        "quantity": number
      }
    ]
  }
]
```
**Features**:
- Returns orders for user's account only
- Includes order items
- Optional status filtering
- Ordered by creation date (newest first)

#### `POST /api/orders`
**Purpose**: Create new order  
**Access**: Protected (requires session)  
**Body**:
```json
{
  "customerName": "string",
  "orderType": "delivery|pickup",
  "items": [
    {
      "name": "string",
      "price": number,
      "quantity": number
    }
  ]
}
```
**Response**: Created order object
**Features**:
- Creates order with items
- Calculates total automatically
- Sets initial status to "pending"
- Associates with user's account

#### `PATCH /api/orders/[id]`
**Purpose**: Update order status  
**Access**: Protected (requires session)  
**Body**:
```json
{
  "status": "pending|preparing|ready|delivered"
}
```
**Response**: Updated order object
**Features**:
- Updates order status only
- Validates status values
- Account-scoped access

#### `DELETE /api/orders/[id]`
**Purpose**: Delete order  
**Access**: Protected (requires session)  
**Response**: `{ "message": "Order deleted successfully" }`
**Features**:
- Cascading delete of order items
- Account-scoped access

---

### 🛠️ Development & Utility Routes

#### `GET /api/dev/reset-db`
**Purpose**: Reset database with sample data (Development only)  
**Access**: Development environment only  
**Query Parameters**:
- `userId` (optional): Seed data for specific user
- `accountId` (optional): Seed data for specific account
**Response**: `{ "message": "Database reset successfully" }`
**Features**:
- **Development only** - disabled in production
- Clears existing orders
- Seeds realistic sample data
- Supports user or account-specific seeding

#### `GET /api/health`
**Purpose**: Health check endpoint  
**Access**: Public  
**Response**:
```json
{
  "status": "healthy|unhealthy",
  "database": "connected|disconnected", 
  "orderCount": number,
  "timestamp": "datetime"
}
```
**Features**:
- Tests database connectivity
- Returns system status
- Useful for monitoring and deployment checks

---

## Authentication Flow

1. **Registration**: `POST /api/auth/register` → Email verification required
2. **Email Verification**: `GET /api/auth/verify-email?token=xxx`
3. **Sign In**: NextAuth calls `POST /api/auth/check-credentials`
4. **Session Management**: NextAuth handles JWT tokens and sessions
5. **Protected Routes**: All `/api/user/*`, `/api/account/*`, `/api/orders/*` require valid session

## Error Handling

### Standard HTTP Status Codes
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (no session)
- `403`: Forbidden (email not verified, insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### Common Error Response Format
```json
{
  "error": "Error description",
  "code": "ERROR_CODE" // Optional specific error codes
}
```

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **Email Verification**: Required before account activation
- **Session-based Auth**: NextAuth.js JWT tokens
- **Account Scoping**: Users can only access their account's data
- **Owner Permissions**: Account deletion/modification restricted to owners
- **Input Validation**: All endpoints validate required fields and formats
- **Rate Limiting**: Email verification resend limited to once per minute

## Database Relationships

```
User (1) ←→ (1) Account
Account (1) ←→ (Many) Orders
Order (1) ←→ (Many) OrderItems
```

## Environment Variables Required

- `NEXTAUTH_SECRET`: JWT signing secret
- `NEXTAUTH_URL`: Application URL for callbacks
- `DATABASE_URL`: Prisma database connection
- `SMTP_*`: Email service configuration for verification emails

---

## Migration Notes for Separate Node.js Backend

When building a separate Node.js backend, consider:

1. **Remove NextAuth Dependencies**: Replace with custom JWT implementation
2. **Session Management**: Implement custom middleware for protected routes
3. **CORS Configuration**: Add CORS headers for frontend communication
4. **Environment Separation**: Separate database and configuration
5. **API Versioning**: Consider adding `/v1/` prefix to all routes
6. **Rate Limiting**: Implement rate limiting middleware
7. **Logging**: Add comprehensive request/response logging
8. **Health Checks**: Expand health endpoint for production monitoring

## Sample Environment Configuration

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/restaunax"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="30d"

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="RestaunaX <noreply@restaunax.com>"

# Application
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```
