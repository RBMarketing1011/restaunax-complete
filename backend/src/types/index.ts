import { Request } from 'express'
import { PrismaClient, Prisma } from '@prisma/client'

// Use Prisma generated types
type User = Prisma.UserGetPayload<{}>
type Account = Prisma.AccountGetPayload<{}>

export interface AuthenticatedUser extends User
{
  account: Account
}

export interface RequestWithPrisma extends Request
{
  prisma: PrismaClient
}

export interface AuthenticatedRequest extends RequestWithPrisma
{
  user: AuthenticatedUser
}

export interface RegisterRequest
{
  name: string
  email: string
  password: string
}

export interface LoginRequest
{
  email: string
  password: string
}

export interface CheckUserRequest
{
  email: string
  password: string
}

export interface ResendVerificationRequest
{
  email: string
}

export interface UpdateProfileRequest
{
  name?: string
  email?: string
}

export interface ChangePasswordRequest
{
  currentPassword: string
  newPassword: string
}

export interface UpdateAccountRequest
{
  name: string
}

export interface CreateOrderRequest
{
  customerName: string
  orderType: 'delivery' | 'pickup'
  items: OrderItemRequest[]
}

export interface OrderItemRequest
{
  name: string
  price: number
  quantity: number
}

export interface UpdateOrderRequest
{
  status: 'pending' | 'preparing' | 'ready' | 'delivered'
}

export interface JWTPayload
{
  userId: string
  email: string
  accountId: string
}

export interface ApiResponse<T = any>
{
  message?: string
  error?: string
  code?: string
  data?: T
}

export interface HealthCheckResponse
{
  status: 'healthy' | 'unhealthy'
  database: 'connected' | 'disconnected'
  orderCount: number
  timestamp: string
  version: string
  environment: string
}
