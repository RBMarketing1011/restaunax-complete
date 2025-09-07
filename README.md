# RestauNax - Restaurant Order Management System

A modern restaurant order management system built with Next.js and Node.js/Express, designed for flexibility and scalability.

## 🏗️ Architecture Overview

This project supports two deployment modes:

1. **Standalone Mode** - Next.js full-stack application with built-in API routes
2. **Microservices Mode** - Separate frontend and backend services

## 🚀 Quick Start (Standalone Next.js App)

The frontend can run as a complete standalone application with built-in API routes.

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm

### Setup
 - Navigate to the folder you want the application(s) installed

1. **Clone and Navigate**
   ```bash
   git clone https://github.com/RBMarketing1011/restaunax-complete.git ./
   ```
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

4. **Setup Database**
   ```bash
   npx prisma db push
   ```
   **If Prisma didnt auto generate**
   ```bash
   npx prisma generate
   ```

5. **Run Development Server** - see "Email Setup (SMTP)" &  "Environment Variables" before launching
   ```bash
   npm run dev
   ```

6. **Access Application**
   - Frontend: http://localhost:3000
   - Prisma Studio: `npm run db:studio`

---

📧 Email Setup (SMTP)

This project uses [Nodemailer](https://nodemailer.com/) to send emails. Most email providers require an **App Password** instead of your normal account password when connecting via SMTP.

### 🔑 How to Get an App Password
- **Gmail**  
  1. Enable 2FA in your Google Account.  
  2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords).  
  3. Generate a new password and copy it.  

- **Zoho Mail**  
  1. Log into [Zoho Mail](https://mail.zoho.com).  
  2. Go to **My Account → Security → App Passwords**.  
  3. Generate a password for “SMTP/Nodemailer.”  

- **Outlook / Office 365**  
  1. Enable 2FA in your Microsoft Account.  
  2. Go to [App Passwords](https://account.live.com/proofs/AppPassword).  
  3. Generate and copy the new password.  

- **Other Providers**  
  - Check your provider’s documentation for “SMTP settings” or “App Passwords.”  
  - You’ll need: SMTP host, port, your email, and an app password.

---

### ⚙️ Environment Variables

Add credentials to your `.env` file:

```env
NEXT_PUBLIC_NODE_ENV="development"

NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_AUTH_KEY="same-as-backend-auth-key"

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/restaunax"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email Configuration (for verification)
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_SERVER_HOST="smtp.provider.com"
EMAIL_SERVER_PORT="465" # 587 for unsecure
EMAIL_FROM="RestauNax Support <your-email@gmail.com>"
```

---

### 🌱 Seeding Database
###### Only allowed in development - NEXT_PUBLIC_NODE_ENV="development"
- sign up, verify email, log in
- once logged in navigate to /profile or click user info in bottom of sidebar and select profile on popup
- scroll down to "Account Management" section
- the "Seed Account" button will seed the account with random orders for the last 30 days
- the "Delete Data" button will delete all data except for the account and current user only

---

## 🔧 Microservices Setup (Separate Frontend & Backend)

For production or when you need separate backend services.

### Backend Setup

1. **Navigate to Backend**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `backend/.env`: - see "Email Setup (SMTP)" **ABOVE** before launching
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
   EMAIL_FROM="RestauNax Support <your-email@gmail.com>"

   # Application
   CORS_ORIGIN="http://localhost:3000" # Your frontend url

   # Development
   DEBUG="true"
   ```

4. **Setup Database**
   **If this is a fresh database**
   ```bash
   npx prisma db push
   ```
   **If same database as frontend and already formatted**
   **Or Prisma client not generated on db push**
   ```bash
   npx prisma generate
   ```
   
5. **Start Server**
   ```bash
   npm run dev
   ```

### Frontend Setup (Microservices Mode)

1. **Navigate to Frontend**
   ```bash
   cd frontend
   ```
   ```bash
   npm install
   ```

2. **Configure for External Backend**
   
   Edit `frontend/.env` and add/update:
   ```env
   # Point to your backend server
   NEXT_PUBLIC_API_BASE_URL="http://localhost:8081"
   NEXT_PUBLIC_AUTH_KEY="same-auth-key-as-backend"
   
   # NextAuth still needed for session management
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   ##### Frontend `NEXT_PUBLIC_AUTH_KEY` and Backend `AUTH_KEY` need to be the exact same to work.

   ##### Should have created an auth token generation system but didnt have time

3. **Start Frontend**
   ```bash
   npm run dev
   ```

## 🌐 Environment Variables Explained

### Frontend (.env)
- `DATABASE_URL` - PostgreSQL connection (standalone mode only)
- `NEXTAUTH_SECRET` - NextAuth.js session encryption
- `NEXTAUTH_URL` - Your application URL
- `EMAIL_SERVER_*` - SMTP settings for email verification
- `NEXT_PUBLIC_API_BASE_URL` - Backend URL (microservices mode)
- `NEXT_PUBLIC_AUTH_KEY` - API key for backend auth (microservices mode)

### Backend (.env)
- `PORT` - Backend server port (default: 8081)
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT token signing key
- `AUTH_KEY` - API key for frontend authentication
- `EMAIL_SERVER_*` - SMTP settings
- `CORS_ORIGIN` - Allowed frontend origins

## 🛠️ Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run Prisma migrations
npm run db:studio    # Open Prisma Studio
```

### Backend
```bash
npm run dev          # Start development server with nodemon
npm run build        # Compile TypeScript
npm run start        # Start compiled server
npm run type-check   # TypeScript type checking
npm run migrate      # Run Prisma migrations
npm run studio       # Open Prisma Studio
```

## 🔄 Switching Between Modes

### From Standalone to Microservices
1. Set up the backend following the microservices setup
2. Update `frontend/.env`:
   ```env
   NEXT_PUBLIC_API_BASE_URL="http://localhost:8081"
   NEXT_PUBLIC_AUTH_KEY="your-backend-auth-key"
   ```
3. Restart the frontend

### From Microservices to Standalone
1. Remove or comment out in `frontend/.env`:
   ```env
   # NEXT_PUBLIC_API_BASE_URL="http://localhost:8081"
   # NEXT_PUBLIC_AUTH_KEY="your-backend-auth-key"
   ```
2. Ensure frontend has `DATABASE_URL` configured
3. Restart the frontend

## 🚀 Production Deployment

### Standalone (Vercel/Netlify)
- Deploy the `frontend` folder
- Configure environment variables in your platform
- Database migrations run automatically on build

### Microservices (Docker/Cloud)
- Deploy backend and frontend separately
- Use environment variables to connect services
- Consider using container orchestration

## � Challenges Faced

### Framework Architecture Decision

The biggest challenge during development was determining the right framework and architecture approach. Initially, I chose Next.js because it allows building both frontend React and backend Node.js seamlessly with no issues, getting the application up and running as quickly as possible.

However, partway through development, I noticed the requirement mentioning "Successful connection between frontend and backend," which made me think you wanted a separated Node.js backend for frontend microservice architecture. This led me to refactor the application to make the frontend capable of using the backend as a separate service.

Then, while looking at your website, I noticed the Vite logo and thought, "Dang, maybe they wanted this built with the Vite framework!" But by that point, I already had most of the Next.js frontend up and running, so I decided to continue with Next.js and complete the implementation.

**Solution**: I ended up building a flexible architecture that supports both approaches:
- **Standalone Mode**: Complete Next.js full-stack application 
- **Microservices Mode**: Separate frontend and backend with configurable API endpoints

This dual approach actually turned out to be beneficial, as it gives maximum deployment flexibility regardless of the preferred architecture.

## �📝 License

MIT License