import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
  { name: 'Onion Rings', price: 6.99 },
  { name: 'Garlic Bread', price: 5.99 },
  { name: 'Breadsticks', price: 4.99 },
  { name: 'Chicken Alfredo Pasta', price: 17.99 },
  { name: 'Soft Drink', price: 2.99 },
  { name: 'Tiramisu', price: 6.99 },
  { name: 'Chocolate Cake', price: 8.99 }
]

// Customer names for random order generation
const customerNames = [
  'Alex Johnson', 'Sarah Chen', 'Mike Rodriguez', 'Emily Davis', 'James Wilson',
  'Lisa Thompson', 'Robert Brown', 'Jennifer Lee', 'Daniel Jackson', 'Maria Garcia',
  'David Smith', 'Ashley Miller', 'Chris Anderson', 'Jessica Taylor', 'Kevin Martinez',
  'Amanda White', 'Brian Clark', 'Nicole Lewis', 'Ryan Walker', 'Stephanie Hall'
]

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
    const ordersForDay = Math.floor(Math.random() * 5) + 1

    for (let i = 0; i < ordersForDay; i++)
    {
      // Random time during the day
      const hour = Math.floor(Math.random() * 14) + 9 // 9 AM to 11 PM
      const minute = Math.floor(Math.random() * 60)
      orderDate.setHours(hour, minute, 0, 0)

      // Random order items (1-4 items)
      const itemCount = Math.floor(Math.random() * 4) + 1
      const orderItems = []
      let total = 0

      for (let j = 0; j < itemCount; j++)
      {
        const item = menuItems[ Math.floor(Math.random() * menuItems.length) ]
        const quantity = Math.floor(Math.random() * 3) + 1
        orderItems.push({
          name: item.name,
          quantity: quantity,
          price: item.price
        })
        total += item.price * quantity
      }

      // Set realistic status based on order age
      let status = 'delivered'
      if (day === 0)
      {
        // Today's orders - mix of statuses
        const statuses = [ 'pending', 'preparing', 'ready', 'delivered' ]
        status = statuses[ Math.floor(Math.random() * statuses.length) ]
      } else if (day === 1)
      {
        // Yesterday's orders - mostly delivered, some ready
        status = Math.random() > 0.2 ? 'delivered' : 'ready'
      }
      // Older orders are all delivered

      orders.push({
        customerName: customerNames[ Math.floor(Math.random() * customerNames.length) ],
        orderType: (Math.random() > 0.5 ? 'pickup' : 'delivery') as 'pickup' | 'delivery',
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

export async function GET (request: NextRequest)
{
  try
  {
    // Only allow this in development
    if (process.env.NEXT_PUBLIC_NODE_ENV !== 'development')
    {
      return NextResponse.json(
        { message: 'Database reset is not allowed in production' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const userId = searchParams.get('userId')

    console.log('Starting database reset and reseed...')

    if (accountId && !userId)
    {
      // Seed specific account with orders for the last 30 days
      console.log(`Seeding account ${ accountId } with 30 days of order data...`)

      // Verify account exists
      const account = await prisma.account.findUnique({
        where: { id: accountId }
      })

      if (!account)
      {
        return NextResponse.json(
          { message: 'Account not found', accountId },
          { status: 404 }
        )
      }

      // Clear existing orders for this account
      await prisma.orderItem.deleteMany({
        where: {
          order: {
            accountId: accountId
          }
        }
      })

      await prisma.order.deleteMany({
        where: { accountId: accountId }
      })

      // Generate orders for the last 30 days
      const generatedOrders = generateOrdersForLast30Days(accountId)

      // Create orders for this account
      for (const orderData of generatedOrders)
      {
        await prisma.order.create({
          data: {
            customerName: orderData.customerName,
            orderType: orderData.orderType,
            status: orderData.status,
            total: orderData.total,
            createdAt: orderData.createdAt,
            updatedAt: orderData.createdAt,
            accountId: accountId,
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

      return NextResponse.json(
        {
          message: `Account seeded successfully with 30 days of order data`,
          accountId: accountId,
          ordersCreated: generatedOrders.length,
          dateRange: {
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      )

    } else if (userId && !accountId)
    {
      // Delete all data except the user and account
      console.log('Cleaning database and leaving user and account data intact...')

      // Find User
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      // find account
      const account = await prisma.account.findUnique({
        where: { id: user!.accountId! }
      })

      if (!user || !account)
      {
        return NextResponse.json(
          { message: 'User or account not found', userId, accountId },
          { status: 404 }
        )
      }

      // Clear all data in the correct order (respecting foreign key constraints)
      await prisma.verificationToken.deleteMany({})
      await prisma.orderItem.deleteMany({})
      await prisma.order.deleteMany({})
      await prisma.account.deleteMany({
        where: { id: { not: account.id } }
      })
      await prisma.user.deleteMany({
        where: { id: { not: user.id } }
      })

      console.log('Database cleared successfully')

      return NextResponse.json(
        {
          message: 'Database cleared successfully',
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      )

    } else
    {
      // Clear entire database only
      console.log('Clearing entire database...')

      // Clear all data in the correct order (respecting foreign key constraints)
      await prisma.verificationToken.deleteMany({})
      await prisma.orderItem.deleteMany({})
      await prisma.order.deleteMany({})
      await prisma.account.deleteMany({})
      await prisma.user.deleteMany({})

      console.log('Database cleared successfully')

      return NextResponse.json(
        {
          message: 'Database cleared successfully',
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      )
    }

  } catch (error)
  {
    console.error('Database reset and reseed error:', error)
    return NextResponse.json(
      {
        message: 'Failed to reset and reseed database',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}