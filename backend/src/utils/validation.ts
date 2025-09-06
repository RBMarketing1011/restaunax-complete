import Joi from 'joi'

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

export const checkUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required()
})

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email()
}).min(1)

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
})

export const updateAccountSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
})

export const createOrderSchema = Joi.object({
  customerName: Joi.string().min(2).max(100).required(),
  orderType: Joi.string().valid('delivery', 'pickup').required(),
  items: Joi.array().items(
    Joi.object({
      name: Joi.string().min(1).max(100).required(),
      price: Joi.number().positive().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required()
})

export const updateOrderSchema = Joi.object({
  status: Joi.string().valid('pending', 'preparing', 'ready', 'delivered').required()
})
