import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET (request: NextRequest)
{
  try
  {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token)
    {
      return NextResponse.json(
        { message: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken)
    {
      return NextResponse.json(
        { message: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (verificationToken.expires < new Date())
    {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token }
      })

      return NextResponse.json(
        { message: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Find user by email from the verification token
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    })

    if (!user)
    {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    })

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { token }
    })

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name || 'User')

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    )

  } catch (error)
  {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
