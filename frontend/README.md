# RestaunaX - Restaurant Order Management

A modern restaurant order management dashboard built with Next.js, TypeScript, Material UI, and PostgreSQL.

## Quick Setup

1. **Install**
   ```bash
   git clone <repo-url>
   cd restaunax
   npm install
   ```

2. **Configure**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other settings
   ```

3. **Database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Run**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000)

## Features

- Order management dashboard
- Real-time order tracking
- User authentication
- Analytics dashboard
- Mobile responsive design

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Material UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma
- **Auth**: NextAuth.js

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npx prisma studio    # Database GUI
```

## Implementation Overview

This is a full-stack Next.js application designed with flexibility in mind. The architecture supports both monolithic deployment and easy separation into microservices.

**Key Design Decisions:**
- **Unified Codebase**: Frontend and backend in a single Next.js project for rapid development
- **Flexible API Layer**: Environment variables control whether to use internal APIs or external backend
- **Type Safety**: Full TypeScript implementation with Prisma for database operations
- **Modern Auth**: NextAuth.js handles authentication with email verification
- **Responsive Design**: Material UI components with mobile-first approach

**Architecture Benefits:**
- Can run as standalone application (current setup)
- Easy migration to separate backend by changing `NEXT_PUBLIC_API_BASE_URL`
- API endpoints include authentication headers for external service integration
- Clean separation of concerns with reusable components

## Challenges Faced

**Framework Architecture Decision:**
The main challenge was choosing the right architecture approach. Initially, I built this as a complete Next.js full-stack application with integrated API routes for rapid development and deployment.

However, anticipating that you might later want to separate the backend for microservices architecture, I refactored the application to support both approaches:

- **Phase 1**: Built unified Next.js app with internal API routes
- **Phase 2**: Made all API calls configurable via environment variables (`NEXT_PUBLIC_API_BASE_URL`)
- **Phase 3**: Added authentication headers (`x-api-key`) for external backend integration

This flexible approach means you can:
- Use it as-is for quick deployment
- Easily extract the API routes to a separate Node.js backend later
- Switch between internal and external APIs without code changes

The challenge was ensuring the authentication system worked seamlessly with both internal NextAuth routes and external API endpoints, which required adaptive response handling.
