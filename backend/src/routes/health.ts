import { Router } from 'express'
import { HealthController } from '../controllers/healthController'

const router = Router()

// Health routes
router.get('/', HealthController.healthCheck)

export default router
