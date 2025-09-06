import { Request, Response, NextFunction } from 'express'

const simpleAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> =>
{
  try
  {
    // Check for simple API key
    const apiKey = req.headers[ 'x-api-key' ] as string

    if (apiKey && apiKey === process.env.AUTH_KEY)
    {
      // Valid API key authentication
      next()
      return
    }

    // No valid API key found
    res.status(401).json({
      error: 'Authentication required',
      code: 'NO_API_KEY',
      message: 'Provide API key in x-api-key header'
    })
    return
  }
  catch (error)
  {
    console.error('Auth error:', error)
    res.status(500).json({
      error: 'Authentication error'
    })
  }
}

export default simpleAuthMiddleware
