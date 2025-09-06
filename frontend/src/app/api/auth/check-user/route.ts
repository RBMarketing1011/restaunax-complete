import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST (request: NextRequest)
{
  try
  {
    const { email, password } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user)
    {
      return NextResponse.json({ unverified: false })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid)
    {
      return NextResponse.json({ unverified: false })
    }

    // Credentials are correct, check if email is unverified
    if (!user.emailVerified)
    {
      return NextResponse.json({ unverified: true })
    }

    return NextResponse.json({ unverified: false })

  } catch
  {
    return NextResponse.json({ unverified: false })
  }
}
