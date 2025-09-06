import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH - Update account name
export async function PATCH (request: NextRequest, { params }: { params: Promise<{ accountId: string }> })
{
  try
  {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email)
    {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { accountId } = await params
    const body = await request.json()
    const { name } = body

    if (!name?.trim())
    {
      return NextResponse.json({ error: 'Account name is required' }, { status: 400 })
    }

    // Get the current user to check permissions
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { account: true }
    })

    if (!currentUser)
    {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 })
    }

    // Check if the user belongs to the account they're trying to update
    if (currentUser.accountId !== accountId)
    {
      return NextResponse.json({ error: 'Forbidden: You can only update your own account' }, { status: 403 })
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId }
    })

    if (!account)
    {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Check if user is account owner
    if (account.ownerId !== currentUser.id)
    {
      return NextResponse.json({ error: 'Only account owners can update account name' }, { status: 403 })
    }

    // Update account name
    await prisma.account.update({
      where: { id: accountId },
      data: { name: name.trim() }
    })

    return NextResponse.json({ message: 'Account name updated successfully' })
  } catch (error)
  {
    console.error('Account update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
