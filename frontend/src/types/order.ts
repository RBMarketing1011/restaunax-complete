export type OrderType = 'delivery' | 'pickup'
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered'

export interface OrderItem
{
  id: string
  name: string
  quantity: number
  price: number
}

export interface Order
{
  id: string
  customerName: string
  orderType: OrderType
  status: OrderStatus
  total: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export interface CreateOrderRequest
{
  customerName: string
  orderType: OrderType
  items: Omit<OrderItem, 'id'>[]
  total: number
}

export interface UpdateOrderRequest
{
  status: OrderStatus
}
