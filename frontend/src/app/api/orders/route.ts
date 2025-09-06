import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET (request: NextRequest)
{
  try
  {
    // Get user session
    const session = await getServerSession(authOptions)

    if (!session?.user)
    {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const accountId = session.user.accountId

    if (!accountId)
    {
      return NextResponse.json(
        { error: 'No account associated with user' },
        { status: 400 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    // Filter orders by user's account
    const whereClause = {
      accountId: accountId,
      ...(status ? { status: status as 'pending' | 'preparing' | 'ready' | 'delivered' } : {})
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error)
  {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST (request: NextRequest)
{
  try
  {
    // Get user session
    const session = await getServerSession(authOptions)

    if (!session?.user)
    {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const accountId = session.user.accountId

    if (!accountId)
    {
      return NextResponse.json(
        { error: 'No account associated with user' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { customerName, orderType, items, total } = body

    const order = await prisma.order.create({
      data: {
        customerName,
        orderType,
        status: 'pending',
        total,
        accountId: accountId, // Link to user's account
        items: {
          create: items.map((item: { name: string; quantity: number; price: number }) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: true
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error)
  {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
