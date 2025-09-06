import { Request, Response } from 'express'
import { RequestWithPrisma } from '../types'

// Base menu items for generating orders
const menuItems = [
  { name: 'Margherita Pizza', price: 15.99 },
  { name: 'Pepperoni Pizza', price: 18.99 },
  { name: 'Supreme Pizza', price: 22.99 },
  { name: 'Hawaiian Pizza', price: 19.99 },
  { name: 'BBQ Chicken Pizza', price: 21.99 },
  { name: 'Veggie Pizza', price: 17.99 },
  { name: 'Meat Lovers Pizza', price: 24.99 },
  { name: 'Gluten-Free Pizza', price: 22.99 },
  { name: 'Seafood Pizza', price: 26.99 },
  { name: 'Caesar Salad', price: 8.99 },
  { name: 'Greek Salad', price: 11.99 },
  { name: 'Side Salad', price: 3.00 },
  { name: 'Buffalo Wings', price: 9.76 },
  { name: 'Chicken Wings', price: 14.98 },
  { name: 'Mozzarella Sticks', price: 10.99 },
  { name: 'Garlic Bread', price: 5.99 },
  { name: 'Breadsticks', price: 1.49 },
  { name: 'Chicken Alfredo', price: 16.99 },
  { name: 'Shrimp Scampi', price: 18.99 },
  { name: 'Tiramisu', price: 6.99 },
  { name: 'Soda', price: 2.99 }
]

const customerNames = [
  'Alex Johnson', 'Sarah Chen', 'Mike Rodriguez', 'Emily Davis', 'James Wilson',
  'Lisa Thompson', 'Robert Brown', 'Jennifer Lee', 'Daniel Jackson', 'Maria Garcia',
  'David Smith', 'Ashley Miller', 'Chris Anderson', 'Jessica Taylor', 'Kevin Martinez',
  'Amanda White', 'Brian Clark', 'Nicole Lewis', 'Ryan Walker', 'Stephanie Hall'
]

const orderTypes = [ 'pickup', 'delivery' ]

// Function to generate random order data for the last 30 days
function generateOrdersForLast30Days (accountId: string)
{
  const orders = []
  const now = new Date()

  for (let day = 0; day < 30; day++)
  {
    const orderDate = new Date(now)
    orderDate.setDate(now.getDate() - day)

    // Generate 1-5 orders per day (random)
    const dailyOrderCount = Math.floor(Math.random() * 5) + 1

    for (let orderIndex = 0; orderIndex < dailyOrderCount; orderIndex++)
    {
      // Random time during the day
      const hour = Math.floor(Math.random() * 14) + 8 // 8 AM to 10 PM
      const minute = Math.floor(Math.random() * 60)
      orderDate.setHours(hour, minute, 0, 0)

      // Generate random items (1-4 items per order)
      const itemCount = Math.floor(Math.random() * 4) + 1
      const orderItems = []
      let total = 0

      for (let i = 0; i < itemCount; i++)
      {
        const randomItem = menuItems[ Math.floor(Math.random() * menuItems.length) ]
        const quantity = Math.floor(Math.random() * 3) + 1 // 1-3 quantity
        const itemTotal = randomItem.price * quantity

        orderItems.push({
          name: randomItem.name,
          quantity: quantity,
          price: randomItem.price
        })

        total += itemTotal
      }

      // Determine status based on order age
      let status = 'delivered'
      if (day === 0)
      {
        // Today's orders - mix of all statuses
        const todayStatuses = [ 'pending', 'preparing', 'ready', 'delivered' ]
        status = todayStatuses[ Math.floor(Math.random() * todayStatuses.length) ]
      } else if (day === 1)
      {
        // Yesterday's orders - mostly delivered, some ready
        status = Math.random() > 0.2 ? 'delivered' : 'ready'
      }
      // Older orders are all delivered

      orders.push({
        customerName: customerNames[ Math.floor(Math.random() * customerNames.length) ],
        orderType: orderTypes[ Math.floor(Math.random() * orderTypes.length) ] as 'pickup' | 'delivery',
        status: status as 'pending' | 'preparing' | 'ready' | 'delivered',
        total: Math.round(total * 100) / 100, // Round to 2 decimal places
        createdAt: new Date(orderDate),
        accountId: accountId,
        items: orderItems
      })
    }
  }

  return orders
}

export class DevController
{
  // GET /api/dev/reset-db
  static async resetDatabase (req: Request, res: Response): Promise<void>
  {
    try
    {
      // Only allow this in development
      if (process.env.NODE_ENV !== 'development')
      {
        res.status(403).json({
          message: 'Database reset is not allowed in production'
        })
        return
      }

      const { accountId, userId } = req.query

      console.log('Starting database reset and reseed...')

      if (accountId && !userId)
      {
        // Seed specific account with orders for the last 30 days
        console.log(`Seeding account ${ accountId } with 30 days of order data...`)

        // Verify account exists
        const account = await (req as RequestWithPrisma).prisma.account.findUnique({
          where: { id: accountId as string }
        })

        if (!account)
        {
          res.status(404).json({
            message: 'Account not found',
            accountId
          })
          return
        }

        // Clear existing orders for this account
        await (req as RequestWithPrisma).prisma.orderItem.deleteMany({
          where: {
            order: {
              accountId: accountId as string
            }
          }
        })

        await (req as RequestWithPrisma).prisma.order.deleteMany({
          where: { accountId: accountId as string }
        })

        // Generate orders for the last 30 days
        const generatedOrders = generateOrdersForLast30Days(accountId as string)

        // Create orders for this account
        for (const orderData of generatedOrders)
        {
          await (req as RequestWithPrisma).prisma.order.create({
            data: {
              customerName: orderData.customerName,
              orderType: orderData.orderType,
              status: orderData.status,
              total: orderData.total,
              createdAt: orderData.createdAt,
              updatedAt: orderData.createdAt,
              accountId: accountId as string,
              items: {
                create: orderData.items.map(item => ({
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price
                }))
              }
            }
          })
        }

        console.log(`Account ${ accountId } seeded successfully with ${ generatedOrders.length } orders`)

        res.status(200).json({
          message: `Account seeded successfully with 30 days of order data`,
          accountId: accountId,
          ordersCreated: generatedOrders.length,
          dateRange: {
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        })

      } else if (userId && !accountId)
      {
        // Delete all data except the user and account
        console.log('Cleaning database and leaving user and account data intact...')

        // Find User
        const user = await (req as RequestWithPrisma).prisma.user.findUnique({
          where: { id: userId as string }
        })

        // find account
        const account = user?.accountId ? await (req as RequestWithPrisma).prisma.account.findUnique({
          where: { id: user.accountId }
        }) : null

        if (!user || !account)
        {
          res.status(404).json({
            message: 'User or account not found',
            userId,
            accountId: user?.accountId
          })
          return
        }

        // Clear all data in the correct order (respecting foreign key constraints)
        await (req as RequestWithPrisma).prisma.verificationtokens.deleteMany({})
        await (req as RequestWithPrisma).prisma.orderItem.deleteMany({})
        await (req as RequestWithPrisma).prisma.order.deleteMany({})
        await (req as RequestWithPrisma).prisma.account.deleteMany({
          where: { id: { not: account.id } }
        })
        await (req as RequestWithPrisma).prisma.user.deleteMany({
          where: { id: { not: user.id } }
        })

        console.log('Database cleared successfully')

        res.status(200).json({
          message: 'Database cleared successfully',
          timestamp: new Date().toISOString()
        })

      } else
      {
        // Clear entire database only
        console.log('Clearing entire database...')

        // Clear all data in the correct order (respecting foreign key constraints)
        await (req as RequestWithPrisma).prisma.verificationtokens.deleteMany({})
        await (req as RequestWithPrisma).prisma.orderItem.deleteMany({})
        await (req as RequestWithPrisma).prisma.order.deleteMany({})
        await (req as RequestWithPrisma).prisma.account.deleteMany({})
        await (req as RequestWithPrisma).prisma.user.deleteMany({})

        console.log('Database cleared successfully')

        res.status(200).json({
          message: 'Database cleared successfully',
          timestamp: new Date().toISOString()
        })
      }

    } catch (error)
    {
      console.error('Database reset and reseed error:', error)
      res.status(500).json({
        message: 'Failed to reset and reseed database',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
