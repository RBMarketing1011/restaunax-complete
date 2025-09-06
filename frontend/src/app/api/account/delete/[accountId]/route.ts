import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE - Delete account and all associated data
export async function DELETE (request: NextRequest, { params }: { params: Promise<{ accountId: string }> })
{
  try
  {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email)
    {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { accountId } = await params

    // Get the current user to check permissions
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { account: true }
    })

    if (!currentUser)
    {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 })
    }

    // Check if the user belongs to the account they're trying to delete
    if (currentUser.accountId !== accountId)
    {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own account' }, { status: 403 })
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
      return NextResponse.json({ error: 'Only account owners can delete accounts' }, { status: 403 })
    }

    // Delete in the correct order due to foreign key constraints
    // 1. Delete order items (cascade should handle this)
    // 2. Delete orders
    await prisma.order.deleteMany({
      where: { accountId: accountId }
    })

    // 3. Remove all users from the account (set accountId to null)
    await prisma.user.updateMany({
      where: { accountId: accountId },
      data: { accountId: null }
    })

    // 4. Delete the account
    await prisma.account.delete({
      where: { id: accountId }
    })

    // 5. Delete the owner user
    await prisma.user.delete({
      where: { id: currentUser.id }
    })

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error)
  {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
