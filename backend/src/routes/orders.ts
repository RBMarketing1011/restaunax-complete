import { Router } from 'express'
import { OrderController } from '../controllers/orderController'

const router = Router()

// Order routes
router.get('/', OrderController.getOrders)
router.post('/', OrderController.createOrder)
router.patch('/:id', OrderController.updateOrder)
router.delete('/:id', OrderController.deleteOrder)

export default router
