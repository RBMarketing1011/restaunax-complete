import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { randomUUID } from 'crypto'

export async function POST (request: NextRequest)
{
  try
  {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password)
    {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 6)
    {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser)
    {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create account first
    const account = await prisma.account.create({
      data: {
        name: null, // Will be set on first login
        owner: {
          create: {
            name,
            email,
            password: hashedPassword,
            emailVerified: null, // User starts unverified
          }
        }
      },
      include: {
        owner: true
      }
    })

    // Update the user to also be a member of the account they own
    const user = await prisma.user.update({
      where: { id: account.owner.id },
      data: { accountId: account.id },
      include: {
        ownedAccounts: true,
        account: true
      }
    })

    // Create verification token
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
      // If email fails, we should probably delete the user or handle this gracefully
      console.error('Failed to send verification email to:', email)
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        message: 'User created successfully. Please check your email to verify your account.',
        user: userWithoutPassword,
        emailSent: emailResult.success
      },
      { status: 201 }
    )

  } catch (error)
  {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
