import { Request, Response } from 'express'
import { hashPassword, comparePassword } from '../utils/password'
import { generateToken } from '../utils/jwt'
import { sendVerificationEmail } from '../utils/email'
import
{
  registerSchema,
  loginSchema,
  checkUserSchema,
  resendVerificationSchema
} from '../utils/validation'
import
{
  RegisterRequest,
  LoginRequest,
  CheckUserRequest,
  ResendVerificationRequest,
  RequestWithPrisma
} from '../types'

export class AuthController
{

  // POST /api/auth/register
  static async register (req: Request, res: Response): Promise<void>
  {
    try
    {
      // Validate input
      const { error, value } = registerSchema.validate(req.body)
      if (error)
      {
        res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        })
        return
      }

      const { name, email, password }: RegisterRequest = value

      // Check if user already exists
      const existingUser = await (req as RequestWithPrisma).prisma.user.findUnique({
        where: { email }
      })

      if (existingUser)
      {
        res.status(400).json({
          error: 'User with this email already exists'
        })
        return
      }

      // Hash password
      const hashedPassword = await hashPassword(password)

      // Generate verification token
      const verificationToken = require('crypto').randomBytes(32).toString('hex')
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

      // Use transaction to create user, account, and verification token
      const result = await (req as RequestWithPrisma).prisma.$transaction(async (prisma: any) =>
      {
        // Create user first (without account association, email NOT verified)
        const user = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            emailVerified: null // NOT verified yet
          }
        })

        // Create account with the user as owner
        const account = await prisma.account.create({
          data: {
            name: `${ name }'s Restaurant`,
            ownerId: user.id
          }
        })

        // Update user to link to the account
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { accountId: account.id }
        })

        // Create verification token
        await prisma.verificationtokens.create({
          data: {
            identifier: email,
            token: verificationToken,
            expires: tokenExpiry
          }
        })

        return { user: updatedUser, account }
      })

      const { user, account } = result

      // Send verification email with token
      try
      {
        await sendVerificationEmail(email, name, verificationToken)
      } catch (emailError)
      {
        console.error('Failed to send verification email:', emailError)
        // Don't fail registration if email fails
      }

      res.status(201).json({
        message: 'User created successfully. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified
        },
        account: {
          id: account.id,
          name: account.name
        }
      })
    } catch (error)
    {
      console.error('Registration error:', error)
      res.status(500).json({
        error: 'Failed to create user'
      })
    }
  }

  // POST /api/auth/check-credentials (for login)
  static async checkCredentials (req: Request, res: Response): Promise<void>
  {
    try
    {
      // Validate input
      const { error, value } = loginSchema.validate(req.body)
      if (error)
      {
        res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        })
        return
      }

      const { email, password }: LoginRequest = value

      // Find user with account information
      const user = await (req as RequestWithPrisma).prisma.user.findUnique({
        where: { email },
        include: {
          account: true
        }
      })

      if (!user)
      {
        res.status(401).json({
          error: 'Invalid credentials'
        })
        return
      }

      // Check password
      const isValidPassword = await comparePassword(password, user.password)
      if (!isValidPassword)
      {
        res.status(401).json({
          error: 'Invalid credentials'
        })
        return
      }

      // Check email verification (emailVerified is now Date | null)
      if (!user.emailVerified)
      {
        res.status(403).json({
          error: 'Email not verified. Please check your email and verify your account.',
          code: 'EMAIL_NOT_VERIFIED'
        })
        return
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        accountId: user.accountId || 'default-account'
      })

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          accountId: user.accountId,
          account: user.account
        }
      })
    } catch (error)
    {
      console.error('Login error:', error)
      res.status(500).json({
        error: 'Login failed'
      })
    }
  }

  // POST /api/auth/check-user
  static async checkUser (req: Request, res: Response): Promise<void>
  {
    try
    {
      // Validate input
      const { error, value } = checkUserSchema.validate(req.body)
      if (error)
      {
        res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        })
        return
      }

      const { email, password }: CheckUserRequest = value

      // Find user
      const user = await (req as RequestWithPrisma).prisma.user.findUnique({
        where: { email }
      })

      if (!user)
      {
        res.json({ unverified: false })
        return
      }

      // Check password
      const isValidPassword = await comparePassword(password, user.password)
      if (!isValidPassword)
      {
        res.json({ unverified: false })
        return
      }

      // Return verification status
      res.json({
        unverified: !user.emailVerified
      })
    } catch (error)
    {
      console.error('Check user error:', error)
      res.status(500).json({
        error: 'Failed to check user'
      })
    }
  }

  // GET /api/auth/verify-email
  static async verifyEmail (req: Request, res: Response): Promise<void>
  {
    try
    {
      const { token } = req.query

      if (!token || typeof token !== 'string')
      {
        res.status(400).json({
          error: 'Verification token is required'
        })
        return
      }

      // Find verification token in database
      const verificationToken = await (req as RequestWithPrisma).prisma.verificationtokens.findUnique({
        where: { token }
      })

      if (!verificationToken)
      {
        res.status(400).json({
          error: 'Invalid verification token'
        })
        return
      }

      // Check if token has expired
      if (verificationToken.expires < new Date())
      {
        // Delete expired token
        await (req as RequestWithPrisma).prisma.verificationtokens.delete({
          where: { token }
        })

        res.status(400).json({
          error: 'Verification token has expired. Please request a new verification email.'
        })
        return
      }

      // Find user by email (identifier in the token)
      const user = await (req as RequestWithPrisma).prisma.user.findUnique({
        where: { email: verificationToken.identifier }
      })

      if (!user)
      {
        res.status(400).json({
          error: 'User not found'
        })
        return
      }

      // Mark user as verified and delete the verification token
      await (req as RequestWithPrisma).prisma.$transaction(async (prisma: any) =>
      {
        // Update user email verification
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: new Date()
          }
        })

        // Delete the used verification token
        await prisma.verificationtokens.delete({
          where: { token }
        })
      })

      res.json({
        message: 'Email verified successfully! You can now sign in.'
      })
    } catch (error)
    {
      console.error('Email verification error:', error)
      res.status(500).json({
        error: 'Failed to verify email'
      })
    }
  }

  // POST /api/auth/resend-verification
  static async resendVerification (req: Request, res: Response): Promise<void>
  {
    try
    {
      // Validate input
      const { error, value } = resendVerificationSchema.validate(req.body)
      if (error)
      {
        res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        })
        return
      }

      const { email }: ResendVerificationRequest = value

      // Find user
      const user = await (req as RequestWithPrisma).prisma.user.findUnique({
        where: { email }
      })

      if (!user)
      {
        res.status(404).json({
          error: 'User not found'
        })
        return
      }

      if (user.emailVerified)
      {
        res.status(400).json({
          error: 'Email is already verified'
        })
        return
      }

      // Generate new verification token
      const verificationToken = require('crypto').randomBytes(32).toString('hex')
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

      // Delete any existing verification tokens for this user
      await (req as RequestWithPrisma).prisma.verificationtokens.deleteMany({
        where: { identifier: email }
      })

      // Create new verification token
      await (req as RequestWithPrisma).prisma.verificationtokens.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: tokenExpiry
        }
      })

      // Send verification email with new token
      try
      {
        if (user.name)
        {
          await sendVerificationEmail(email, user.name, verificationToken)
        }
        res.json({
          message: 'Verification email sent'
        })
      } catch (emailError)
      {
        console.error('Failed to send verification email:', emailError)
        res.status(500).json({
          error: 'Failed to send verification email'
        })
      }
    } catch (error)
    {
      console.error('Resend verification error:', error)
      res.status(500).json({
        error: 'Failed to resend verification email'
      })
    }
  }
}
