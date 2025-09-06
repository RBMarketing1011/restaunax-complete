import { Request, Response } from 'express'
import
{
  createOrderSchema,
  updateOrderSchema
} from '../utils/validation'
import
{
  CreateOrderRequest,
  UpdateOrderRequest,
  RequestWithPrisma,
  AuthenticatedRequest
} from '../types'

export class OrderController
{

  // GET /api/orders
  static async getOrders (req: Request, res: Response): Promise<void>
  {
    try
    {
      const { status } = req.query

      // Build where clause - handle both JWT auth and API key auth
      const whereClause: any = {}

      // If using JWT authentication, filter by user's account
      if ((req as AuthenticatedRequest).user?.account?.id)
      {
        whereClause.accountId = (req as AuthenticatedRequest).user.account.id
      }
      // For API key auth, return all orders (or you can add specific logic here)

      // Add status filter if provided
      if (status)
      {
        if (![ 'pending', 'preparing', 'ready', 'delivered' ].includes(status as string))
        {
          res.status(400).json({
            error: 'Invalid status. Must be one of: pending, preparing, ready, delivered'
          })
          return
        }
        whereClause.status = (status as string).toUpperCase()
      }

      // Fetch orders
      // First try a simple query to see if the table exists
      const orders = await (req as RequestWithPrisma).prisma.order.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Transform data to match API spec
      const transformedOrders = orders.map((order: any) => ({
        id: order.id,
        accountId: order.accountId,
        customerName: order.customerName,
        orderType: order.orderType.toLowerCase(),
        status: order.status.toLowerCase(),
        total: order.total,
        createdAt: order.createdAt,
        items: [] // Simplified for now
      }))

      res.json(transformedOrders)
    } catch (error)
    {
      console.error('Get orders error:', error)
      res.status(500).json({
        error: 'Failed to fetch orders'
      })
    }
  }

  // POST /api/orders
  static async createOrder (req: Request, res: Response): Promise<void>
  {
    try
    {
      // Validate input
      const { error, value } = createOrderSchema.validate(req.body)
      if (error)
      {
        res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        })
        return
      }

      const { customerName, orderType, items }: CreateOrderRequest = value

      // Calculate total
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      // Create order with items in a transaction
      const order = await (req as RequestWithPrisma).prisma.$transaction(async (prisma: any) =>
      {
        // Create order
        const newOrder = await prisma.order.create({
          data: {
            customerName,
            orderType: orderType.toLowerCase() as any,
            status: 'pending',
            total,
            accountId: 'default-account-id' // Simplified for API key auth
          }
        })

        // Create order items
        await prisma.orderItem.createMany({
          data: items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            orderId: newOrder.id
          }))
        })

        // Fetch the complete order with items
        return await prisma.order.findUnique({
          where: { id: newOrder.id },
          include: {
            items: {
              select: {
                id: true,
                name: true,
                price: true,
                quantity: true
              }
            }
          }
        })
      })

      if (!order)
      {
        res.status(500).json({
          error: 'Failed to create order'
        })
        return
      }

      // Transform response to match API spec
      const transformedOrder = {
        id: order.id,
        accountId: order.accountId,
        customerName: order.customerName,
        orderType: order.orderType.toLowerCase(),
        status: order.status.toLowerCase(),
        total: order.total,
        createdAt: order.createdAt,
        items: order.items
      }

      res.status(201).json(transformedOrder)
    } catch (error)
    {
      console.error('Create order error:', error)
      res.status(500).json({
        error: 'Failed to create order'
      })
    }
  }

  // PATCH /api/orders/:id
  static async updateOrder (req: Request, res: Response): Promise<void>
  {
    try
    {
      const { id } = req.params

      // Validate input
      const { error, value } = updateOrderSchema.validate(req.body)
      if (error)
      {
        res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        })
        return
      }

      const { status }: UpdateOrderRequest = value

      // Check if order exists and belongs to user's account
      const existingOrder = await (req as RequestWithPrisma).prisma.order.findFirst({
        where: {
          id
          // Removed accountId filter for API key auth - return any order
        }
      })

      if (!existingOrder)
      {
        res.status(404).json({
          error: 'Order not found'
        })
        return
      }

      // Update order status
      const updatedOrder = await (req as RequestWithPrisma).prisma.order.update({
        where: { id },
        data: {
          status: status.toUpperCase() as any
        },
        include: {
          items: {
            select: {
              id: true,
              name: true,
              price: true,
              quantity: true
            }
          }
        }
      })

      // Transform response to match API spec
      const transformedOrder = {
        id: updatedOrder.id,
        accountId: updatedOrder.accountId,
        customerName: updatedOrder.customerName,
        orderType: updatedOrder.orderType.toLowerCase(),
        status: updatedOrder.status.toLowerCase(),
        total: updatedOrder.total,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
        items: updatedOrder.items
      }

      res.json(transformedOrder)
    } catch (error)
    {
      console.error('Update order error:', error)
      res.status(500).json({
        error: 'Failed to update order'
      })
    }
  }

  // DELETE /api/orders/:id
  static async deleteOrder (req: Request, res: Response): Promise<void>
  {
    try
    {
      const { id } = req.params

      // Check if order exists and belongs to user's account
      const existingOrder = await (req as RequestWithPrisma).prisma.order.findFirst({
        where: {
          id
          // Removed accountId filter for API key auth - return any order
        }
      })

      if (!existingOrder)
      {
        res.status(404).json({
          error: 'Order not found'
        })
        return
      }

      // Delete order (this will cascade delete order items due to Prisma schema)
      await (req as RequestWithPrisma).prisma.order.delete({
        where: { id }
      })

      res.json({
        message: 'Order deleted successfully'
      })
    } catch (error)
    {
      console.error('Delete order error:', error)
      res.status(500).json({
        error: 'Failed to delete order'
      })
    }
  }
}
