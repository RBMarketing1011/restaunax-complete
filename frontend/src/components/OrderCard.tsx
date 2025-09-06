import
{
  Card,
  CardContent,
  CardActions,
  Chip,
  Button,
  Typography,
  Box
} from '@mui/material'
import
{
  LocalShipping,
  ShoppingBag,
  Restaurant
} from '@mui/icons-material'
import { Order, OrderStatus } from '@/types/order'

interface OrderCardProps
{
  order: Order
  onOrderClick: (order: Order) => void
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void
  isDelayed?: boolean
}

const getStatusIcon = (orderType: string) =>
{
  switch (orderType)
  {
    case 'delivery':
      return <LocalShipping />
    case 'pickup':
      return <ShoppingBag />
    default:
      return <Restaurant />
  }
}

const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null =>
{
  const statusFlow: Record<OrderStatus, OrderStatus | null> = {
    pending: 'preparing',
    preparing: 'ready',
    ready: 'delivered',
    delivered: null
  }
  return statusFlow[ currentStatus ]
}

export default function OrderCard ({ order, onOrderClick, onStatusUpdate, isDelayed = false }: OrderCardProps)
{
  return (
    <Card
      sx={ {
        mb: 2,
        cursor: 'pointer',
        '&:hover': { elevation: 4 },
        transition: 'box-shadow 0.2s',
        position: 'relative',
        overflow: 'hidden'
      } }
      onClick={ () => onOrderClick(order) }
    >
      {/* Delayed Watermark - Mobile */ }
      { isDelayed && (
        <Box
          sx={ {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-25deg)',
            fontSize: '3.5rem',
            fontWeight: '900',
            color: 'transparent',
            WebkitTextStroke: '2px rgba(211, 47, 47, 0.3)',
            textStroke: '2px rgba(211, 47, 47, 0.3)',
            zIndex: 1,
            pointerEvents: 'none',
            userSelect: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            display: { xs: 'block', md: 'none' }
          } }
        >
          DELAYED
        </Box>
      ) }

      {/* Delayed Watermark - Desktop/Laptop */ }
      { isDelayed && (
        <Box
          sx={ {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-25deg)',
            fontSize: { md: '4rem' },
            fontWeight: '900',
            color: 'transparent',
            WebkitTextStroke: '3px rgba(211, 47, 47, 0.3)',
            textStroke: '3px rgba(211, 47, 47, 0.3)',
            zIndex: 1,
            pointerEvents: 'none',
            userSelect: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            display: { xs: 'none', md: 'block' }
          } }
        >
          DELAYED
        </Box>
      ) }

      <CardContent sx={ { pb: 1, position: 'relative', zIndex: 2 } }>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={ 1 }>
          <Typography variant="h6" component="h3">
            { order.customerName }
          </Typography>
          <Chip
            icon={ getStatusIcon(order.orderType) }
            label={ order.orderType }
            size="small"
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" mb={ 1 }>
          Order #{ order.id }
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={ 1 }>
          { new Date(order.createdAt).toLocaleString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }) }
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={ 2 }>
          { order.items.length } item(s)
        </Typography>

        <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
          <Typography variant="h6" color="primary.main" fontWeight="bold">
            ${ order.total.toFixed(2) }
          </Typography>

          <CardActions sx={ { p: 0 } }>
            { getNextStatus(order.status) && (
              <Button
                size="small"
                variant="contained"
                onClick={ (e: React.MouseEvent) =>
                {
                  e.stopPropagation()
                  const nextStatus = getNextStatus(order.status)
                  if (nextStatus)
                  {
                    onStatusUpdate(order.id, nextStatus)
                  }
                } }
                sx={ { color: 'white' } }
              >
                Mark as { getNextStatus(order.status)! }
              </Button>
            ) }
          </CardActions>
        </Box>
      </CardContent>
    </Card>
  )
}
