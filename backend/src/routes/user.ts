import { Router } from 'express'
import { UserController } from '../controllers/userController'

const router = Router()

// User routes
router.get('/profile/:userId', UserController.getProfile)
router.patch('/profile/:userId', UserController.updateProfile)
router.post('/change-password/:userId', UserController.changePassword)

export default router
