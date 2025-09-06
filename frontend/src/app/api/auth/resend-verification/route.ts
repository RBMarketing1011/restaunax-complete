import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { randomUUID } from 'crypto'

export async function POST (request: NextRequest)
{
  try
  {
    const { email } = await request.json()

    if (!email)
    {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user)
    {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.emailVerified)
    {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

    // Create new verification token
    const token = randomUUID()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    })

    // Send verification email
    const emailResult = await sendVerificationEmail(email, token)

    if (!emailResult.success)
    {
      return NextResponse.json(
        { message: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Verification email sent successfully' },
      { status: 200 }
    )

  } catch (error)
  {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
