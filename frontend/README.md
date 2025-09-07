# RestauNax Frontend - Next.js Application

A modern restaurant order management dashboard built with Next.js, TypeScript, Material UI, and PostgreSQL.

## 🏗️ Deployment Modes

This frontend can run in two modes:

1. **Standalone Mode** - Complete full-stack application with built-in API routes
2. **Microservices Mode** - Frontend-only connecting to separate backend service

## 🚀 Standalone Setup (Recommended)

Run as a complete full-stack application with built-in API routes.

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

3. **Setup Database**
   ```bash
   npx prisma db push
   ```
   **If Prisma didn't auto generate:**
   ```bash
   npx prisma generate
   ```

4. **Run Development Server** 
   *See "Email Setup (SMTP)" & "Environment Variables" sections before launching*
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Frontend: http://localhost:3000
   - Prisma Studio: `npm run db:studio`

## 📧 Email Setup (SMTP)

This project uses [Nodemailer](https://nodemailer.com/) to send emails. Most email providers require an **App Password** instead of your normal account password when connecting via SMTP.

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

- **Other Providers**  
  - Check your provider's documentation for "SMTP settings" or "App Passwords."  
  - You'll need: SMTP host, port, your email, and an app password.

## ⚙️ Environment Variables

### Standalone Mode
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

### Microservices Mode
For connecting to a separate backend service:

```env
# Point to your backend server
NEXT_PUBLIC_API_BASE_URL="http://localhost:8081"
NEXT_PUBLIC_AUTH_KEY="same-auth-key-as-backend"

# NextAuth still needed for session management
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Database not needed in microservices mode
# EMAIL_* variables not needed (handled by backend)
```

## 🌱 Seeding Database
*Only allowed in development - NEXT_PUBLIC_NODE_ENV="development"*

- Sign up, verify email, log in
- Once logged in navigate to /profile or click user info in bottom of sidebar and select profile on popup
- Scroll down to "Account Management" section
- The "Seed Account" button will seed the account with random orders for the last 30 days
- The "Delete Data" button will delete all data except for the account and current user only

## 🛠️ Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run Prisma migrations
npm run db:studio    # Open Prisma Studio
```

## 🔄 Switching to Microservices Mode

1. Set up the backend service separately
2. Update your `.env` file:
   ```env
   NEXT_PUBLIC_API_BASE_URL="http://localhost:8081"
   NEXT_PUBLIC_AUTH_KEY="your-backend-auth-key"
   ```
3. Remove or comment out `DATABASE_URL` and `EMAIL_*` variables
4. Restart the development server

## 🚀 Production Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Configure environment variables

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📋 Features

- **Order Management**: Create, view, update, and track orders
- **User Authentication**: Email verification and secure login
- **Dashboard Analytics**: Order statistics and trends
- **Responsive Design**: Mobile-first Material UI components
- **Real-time Updates**: Live order status tracking
- **Account Management**: Multi-user restaurant accounts
- **Data Seeding**: Development data generation tools

## 🛡️ Security Features

- **NextAuth.js**: Secure authentication system
- **Email Verification**: Required for account activation
- **API Key Protection**: Secure backend communication
- **Input Validation**: Client and server-side validation
- **CSRF Protection**: Built-in Next.js security

## 🔧 Troubleshooting

### Common Issues

**Build Errors**
- Run `npx prisma generate` before building
- Check environment variables are properly set

**Email Not Sending**
- Verify SMTP credentials and app password
- Check firewall/antivirus blocking email ports

**Database Connection Issues**
- Verify PostgreSQL is running
- Check DATABASE_URL format and credentials

**API Connection Issues (Microservices)**
- Ensure backend service is running
- Verify NEXT_PUBLIC_API_BASE_URL points to correct backend
- Check AUTH_KEY matches between frontend and backend

## 📚 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Library**: Material UI (MUI)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Email**: Nodemailer
- **Styling**: Emotion (CSS-in-JS)
- **Charts**: Recharts

## 📄 License

MIT License
