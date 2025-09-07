# RestaunaX - Restaurant Order Management System

A modern restaurant order management system built with Next.js and Node.js/Express, designed for flexibility and scalability.

## 🏗️ Architecture Overview

This project supports two deployment modes:

1. **Standalone Mode** - Next.js full-stack application with built-in API routes
2. **Microservices Mode** - Separate frontend and backend services

## 🚀 Quick Start (Standalone Next.js App)

The frontend can run as a complete standalone application with built-in API routes.

### Prerequisites
- Node.js 16+ 
- PostgreSQL database
- npm

### Setup

1. **Clone and Navigate**
   ```bash
   git clone https://github.com/RBMarketing1011/restaunax-complete.git
   cd restaunax-complete/frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database and email settings:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/restaunax"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT="465"
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_FROM="your-email@gmail.com"
   ```

4. **Setup Database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Access Application**
   - Frontend: http://localhost:3000
   - Prisma Studio: `npm run db:studio`

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
   
   Edit `backend/.env`:
   ```env
   NODE_ENV="development"
   PORT="8081"
   DATABASE_URL="postgresql://username:password@localhost:5432/restaunax"
   JWT_SECRET="your-secret-key-here"
   AUTH_KEY="your-auth-key-here"
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT="465"
   EMAIL_FROM="RestaunaX Support <your-email@gmail.com>"
   CORS_ORIGIN="http://localhost:3000"
   ```

4. **Setup Database & Start**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run dev
   ```

### Frontend Setup (Microservices Mode)

1. **Navigate to Frontend**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure for External Backend**
   
   Edit `frontend/.env` and add/update:
   ```env
   # Point to your backend server
   NEXT_PUBLIC_API_BASE_URL="http://localhost:8081"
   NEXT_PUBLIC_AUTH_KEY="your-auth-key-here"
   
   # NextAuth still needed for session management
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

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

## 📁 Project Structure

```
restaunax-complete/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages & API routes
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities & configurations
│   │   └── types/          # TypeScript definitions
│   ├── prisma/             # Database schema (standalone mode)
│   └── package.json
├── backend/                 # Node.js/Express API (optional)
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utilities
│   ├── prisma/             # Database schema
│   └── package.json
└── README.md               # This file
```

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both standalone and microservices modes
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the existing issues on GitHub
- Create a new issue with detailed description
- Include environment details and error messages
