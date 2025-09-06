import { Request, Response, NextFunction } from 'express'

interface CustomError extends Error
{
  status?: number
  isJoi?: boolean
  details?: any[]
  code?: string
  meta?: any
}

const errorHandler = (err: CustomError, _req: Request, res: Response, _next: NextFunction): void =>
{
  console.error('Error:', err)

  // Prisma errors
  if (err.code === 'P2002')
  {
    res.status(400).json({
      error: 'Unique constraint violation',
      field: err.meta?.target?.[ 0 ] || 'unknown'
    })
    return
  }

  if (err.code === 'P2025')
  {
    res.status(404).json({
      error: 'Record not found'
    })
    return
  }

  // Validation errors (Joi)
  if (err.isJoi)
  {
    res.status(400).json({
      error: 'Validation error',
      details: err.details?.map(detail => detail.message) || []
    })
    return
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')
  {
    res.status(401).json({
      error: 'Invalid token'
    })
    return
  }

  if (err.name === 'TokenExpiredError')
  {
    res.status(401).json({
      error: 'Token expired'
    })
    return
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export default errorHandler
