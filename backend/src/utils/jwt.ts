import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { JWTPayload } from '../types'

export const generateToken = (payload: JWTPayload): string =>
{
  return jwt.sign(payload as object, process.env.JWT_SECRET!)
}

export const verifyToken = (token: string): JWTPayload =>
{
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
}

export const generateVerificationToken = (): string =>
{
  return randomBytes(32).toString('hex')
}
