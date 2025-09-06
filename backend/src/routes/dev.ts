import { Router } from 'express'
import { DevController } from '../controllers/devController'

const router = Router()

// Development routes
router.get('/reset-db', DevController.resetDatabase)

export default router
