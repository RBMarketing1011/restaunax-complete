import { Request, Response } from 'express'
import { hashPassword, comparePassword } from '../utils/password'
import { sendVerificationEmail } from '../utils/email'
import
{
  updateProfileSchema,
  changePasswordSchema
} from '../utils/validation'
import
{
  ChangePasswordRequest,
  RequestWithPrisma
} from '../types'

export class UserController
{

  // GET /api/user/profile/:userId
  static async getProfile (req: Request, res: Response): Promise<void>
  {
    try
    {
      // Get user ID from URL parameter
      const { userId } = req.params

      if (!userId)
      {
        res.status(400).json({
          error: 'User ID is required'
        })
        return
      }

      const user = await (req as RequestWithPrisma).prisma.user.findUnique({
        where: { id: userId },
        include: {
          account: {
            include: {
              users: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  emailVerified: true,
                  createdAt: true
                }
              }
            }
          }
        }
      })

      if (!user)
      {
        res.status(404).json({
          error: 'User not found'
        })
        return
      }

      // Remove sensitive information
      const { password, ...userProfile } = user

      res.json(userProfile)
    } catch (error)
    {
      console.error('Get profile error:', error)
      res.status(500).json({
        error: 'Failed to fetch profile'
      })
    }
  }

  // PATCH /api/user/profile/:userId
  static async updateProfile (req: Request, res: Response): Promise<void>
  {
    try
    {
      // Get user ID from URL parameter
      const { userId } = req.params

      if (!userId)
      {
        res.status(400).json({
          error: 'User ID is required'
        })
        return
      }

      // Validate input
      const { error, value } = updateProfileSchema.validate(req.body)
      if (error)
      {
        res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        })
        return
      }

      const updateData: any = {}
      let emailChanged = false

      // Handle name update
      if (value.name)
      {
        updateData.name = value.name
      }

      // Handle email update - get current user first
      let currentUser = null
      if (value.email)
      {
        currentUser = await (req as RequestWithPrisma).prisma.user.findUnique({
          where: { id: userId },
          select: { email: true }
        })
      }

      if (value.email && currentUser && value.email !== currentUser.email)
      {
        // Check if new email is already taken by different user
        const existingUser = await (req as RequestWithPrisma).prisma.user.findUnique({
          where: { email: value.email }
        })

        if (existingUser && existingUser.id !== userId)
        {
          res.status(400).json({
            error: 'Email is already taken'
          })
          return
        }

        updateData.email = value.email
        updateData.emailVerified = null // Reset verification status
        emailChanged = true
      }

      // Update user
      await (req as RequestWithPrisma).prisma.user.update({
        where: { id: userId },
        data: updateData
      })

      // Send verification email if email was changed
      if (emailChanged)
      {
        try
        {
          await sendVerificationEmail(
            updateData.email,
            updateData.name || 'User',
            'temp-token' // Simplified for now
          )
        } catch (emailError)
        {
          console.error('Failed to send verification email:', emailError)
          // Don't fail the update if email fails
        }
      }

      res.json({
        message: emailChanged
          ? 'Profile updated successfully. Please verify your new email address.'
          : 'Profile updated successfully'
      })
    } catch (error)
    {
      console.error('Update profile error:', error)
      res.status(500).json({
        error: 'Failed to update profile'
      })
    }
  }

  // POST /api/user/change-password/:userId
  static async changePassword (req: Request, res: Response): Promise<void>
  {
    try
    {
      const { userId } = req.params

      if (!userId)
      {
        res.status(400).json({
          error: 'User ID is required'
        })
        return
      }

      // Validate input
      const { error, value } = changePasswordSchema.validate(req.body)
      if (error)
      {
        res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        })
        return
      }

      const { currentPassword, newPassword }: ChangePasswordRequest = value

      // Get current user with password
      const user = await (req as RequestWithPrisma).prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user)
      {
        res.status(404).json({
          error: 'User not found'
        })
        return
      }

      // Verify current password
      const isValidPassword = await comparePassword(currentPassword, user.password)
      if (!isValidPassword)
      {
        res.status(400).json({
          error: 'Current password is incorrect'
        })
        return
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword)

      // Update password
      await (req as RequestWithPrisma).prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedNewPassword
        }
      })

      res.json({
        message: 'Password changed successfully'
      })
    } catch (error)
    {
      console.error('Change password error:', error)
      res.status(500).json({
        error: 'Failed to change password'
      })
    }
  }
}
