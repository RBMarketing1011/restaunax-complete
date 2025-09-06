import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch user profile data
export async function GET (request: NextRequest, { params }: { params: Promise<{ userId: string }> })
{
  try
  {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email)
    {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Get the current user to check permissions
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser)
    {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 })
    }

    // Only allow users to access their own profile
    if (currentUser.id !== userId)
    {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        account: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!user)
    {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is account owner
    const isAccountOwner = user.account?.ownerId === user.id

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      accountId: user.accountId,
      isAccountOwner,
      account: user.account
    })
  } catch (error)
  {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update user profile
export async function PATCH (request: NextRequest, { params }: { params: Promise<{ userId: string }> })
{
  try
  {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email)
    {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params
    const body = await request.json()
    const { name, email } = body

    if (!name?.trim())
    {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Get the current user to check permissions
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser)
    {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 })
    }

    // Only allow users to update their own profile
    if (currentUser.id !== userId)
    {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user)
    {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email)
    {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser)
      {
        return NextResponse.json({ error: 'Email is already in use' }, { status: 400 })
      }
    }

    // Update user
    const updateData: {
      name: string
      email?: string
      emailVerified?: Date | null
    } = {
      name: name.trim()
    }

    // If email is being changed, reset email verification
    if (email && email !== user.email)
    {
      updateData.email = email
      updateData.emailVerified = null
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    let message = 'Profile updated successfully'
    if (email && email !== user.email)
    {
      message += '. Please check your email to verify your new email address.'
      // TODO: Send verification email
    }

    return NextResponse.json({ message })
  } catch (error)
  {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
