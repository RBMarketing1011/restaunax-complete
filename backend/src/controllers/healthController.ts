import { Request, Response } from 'express'
import { RequestWithPrisma, HealthCheckResponse } from '../types'

export class HealthController
{

  // GET /api/health
  static async healthCheck (req: Request, res: Response<HealthCheckResponse>): Promise<void>
  {
    try
    {
      let databaseStatus: 'connected' | 'disconnected' = 'connected'
      let orderCount = 0

      // Test database connectivity and get order count
      try
      {
        orderCount = await (req as RequestWithPrisma).prisma.order.count()
      } catch (dbError)
      {
        console.error('Database health check failed:', dbError)
        databaseStatus = 'disconnected'
      }

      const status: 'healthy' | 'unhealthy' = databaseStatus === 'connected' ? 'healthy' : 'unhealthy'

      res.json({
        status,
        database: databaseStatus,
        orderCount,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      })
    } catch (error)
    {
      console.error('Health check error:', error)
      res.status(500).json({
        status: 'unhealthy',
        database: 'disconnected',
        orderCount: 0,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      })
    }
  }
}
