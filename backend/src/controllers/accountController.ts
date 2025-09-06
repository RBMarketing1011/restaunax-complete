import { Request, Response } from 'express'
import { updateAccountSchema } from '../utils/validation'
import
{
  UpdateAccountRequest,
  RequestWithPrisma
} from '../types'

export class AccountController
{

  // PATCH /api/account/update/:accountId
  static async updateAccount (req: Request, res: Response): Promise<void>
  {
    try
    {
      const { accountId } = req.params

      if (!accountId)
      {
        res.status(400).json({
          error: 'Account ID is required'
        })
        return
      }

      // Validate input
      const { error, value } = updateAccountSchema.validate(req.body)
      if (error)
      {
        res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        })
        return
      }

      const { name }: UpdateAccountRequest = value

      // Update account
      const updatedAccount = await (req as RequestWithPrisma).prisma.account.update({
        where: { id: accountId },
        data: { name }
      })

      res.status(200).json({
        message: 'Account updated successfully',
        account: {
          id: updatedAccount.id,
          name: updatedAccount.name
        }
      })
    }
    catch (error)
    {
      console.error('Update account error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  // DELETE /api/account/delete/:accountId
  static async deleteAccount (req: Request, res: Response): Promise<void>
  {
    try
    {
      const { accountId } = req.params

      if (!accountId)
      {
        res.status(400).json({
          error: 'Account ID is required'
        })
        return
      }

      // Delete the account and ALL associated data
      // Using transaction to ensure data consistency
      await (req as RequestWithPrisma).prisma.$transaction(async (prisma: any) =>
      {
        // First, check if account exists
        const account = await prisma.account.findUnique({
          where: { id: accountId }
        })

        if (!account)
        {
          throw new Error('Account not found')
        }

        // Delete all order items for orders in this account
        const orders = await prisma.order.findMany({
          where: { accountId: accountId }
        })

        for (const order of orders)
        {
          await prisma.orderItem.deleteMany({
            where: { orderId: order.id }
          })
        }

        // Delete all orders for this account
        await prisma.order.deleteMany({
          where: { accountId: accountId }
        })

        // Delete all users in this account EXCEPT the owner (to avoid FK constraint)
        await prisma.user.deleteMany({
          where: {
            accountId: accountId,
            id: { not: account.ownerId }
          }
        })

        // Delete the account itself (this removes the FK constraint to owner)
        await prisma.account.delete({
          where: { id: accountId }
        })

        // Finally, delete the owner user (now safe to delete)
        await prisma.user.delete({
          where: { id: account.ownerId }
        })
      })

      res.status(200).json({
        message: 'Account and all associated data deleted successfully'
      })
    }
    catch (error)
    {
      console.error('Delete account error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  // GET /api/account/profile/:accountId
  static async getAccountProfile (req: Request, res: Response): Promise<void>
  {
    try
    {
      const { accountId } = req.params

      if (!accountId)
      {
        res.status(400).json({
          error: 'Account ID is required'
        })
        return
      }

      const account = await (req as RequestWithPrisma).prisma.account.findUnique({
        where: { id: accountId },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      })

      if (!account)
      {
        res.status(404).json({
          error: 'Account not found'
        })
        return
      }

      res.status(200).json({
        account
      })
    }
    catch (error)
    {
      console.error('Get account profile error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

}
