import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { AuthController } from '../controllers/authController'

const router = Router()

// Rate limiting for email verification resends
const verificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per minute (increased from 1)
  message: 'Please wait before requesting another verification email.'
})

// Auth routes
router.post('/register', AuthController.register)
router.post('/check-credentials', AuthController.checkCredentials)
router.post('/check-user', AuthController.checkUser)
router.get('/verify-email', AuthController.verifyEmail)
router.post('/resend-verification', verificationLimiter, AuthController.resendVerification)

export default router
