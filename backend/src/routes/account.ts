import { Router } from 'express'
import { AccountController } from '../controllers/accountController'

const router = Router()

// Account routes
router.get('/profile/:accountId', AccountController.getAccountProfile)
router.patch('/update/:accountId', AccountController.updateAccount)
router.delete('/delete/:accountId', AccountController.deleteAccount)

export default router
