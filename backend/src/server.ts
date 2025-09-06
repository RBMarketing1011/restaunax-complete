import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import 'express-async-errors'
import dotenv from 'dotenv'

dotenv.config()

import { PrismaClient } from '@prisma/client'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import accountRoutes from './routes/account'
import orderRoutes from './routes/orders'
import devRoutes from './routes/dev'
import healthRoutes from './routes/health'
import errorHandler from './middleware/errorHandler'
import simpleAuthMiddleware from './middleware/simpleAuth'

// Initialize Prisma Client
const prisma = new PrismaClient()

// Create Express app
const app: Application = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (increased from 100)
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs (increased from 10)
  message: 'Too many authentication attempts, please try again later.'
})
app.use('/api/auth', authLimiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging
if (process.env.NODE_ENV !== 'test')
{
  app.use(morgan('combined'))
}

// Make Prisma client available to all routes
app.use((req: Request, _res: Response, next: NextFunction) =>
{
  (req as any).prisma = prisma
  next()
})

// Routes
app.use('/api/auth', authRoutes)  // Basic auth routes (register, login)
app.use('/api/user', simpleAuthMiddleware, userRoutes)  // User profile routes with API key
app.use('/api/account', simpleAuthMiddleware, accountRoutes)  // Account routes with API key
app.use('/api/orders', simpleAuthMiddleware, orderRoutes)
app.use('/api/health', healthRoutes)

// Development routes (only in development)
if (process.env.NODE_ENV === 'development')
{
  app.use('/api/dev', devRoutes)
}

// Basic route
app.get('/', (_req: Request, res: Response) =>
{
  res.json({
    message: 'RestaunaX Backend API',
    version: '1.0.0',
    documentation: '/api/health'
  })
})

// 404 handler
app.use('*', (req: Request, res: Response) =>
{
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Graceful shutdown
process.on('SIGINT', async () =>
{
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () =>
{
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

const PORT = process.env.PORT || 8081

app.listen(PORT, () =>
{
  console.log(`🚀 Server running on port ${ PORT }`)
  console.log(`📖 Environment: ${ process.env.NODE_ENV }`)
  console.log(`🔗 API Base URL: http://localhost:${ PORT }/api`)
})

export default app