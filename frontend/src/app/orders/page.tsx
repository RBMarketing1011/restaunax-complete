'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import
{
  Container,
  Typography,
  Box,
  Button,
  Drawer,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import
{
  LocalShipping,
  ShoppingBag,
  Close,
  Refresh,
  Add,
  Restaurant
} from '@mui/icons-material'
import { Order, OrderStatus } from '@/types/order'
import CreateOrderDialog from '@/components/CreateOrderDialog'
import DashboardLayout from '@/components/DashboardLayout'
import OrderCard from '@/components/OrderCard'

interface TabPanelProps
{
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel (props: TabPanelProps)
{
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={ value !== index }
      id={ `order-tabpanel-${ index }` }
      aria-labelledby={ `order-tab-${ index }` }
      { ...other }
    >
      { value === index && <Box sx={ { pt: 3 } }>{ children }</Box> }
    </div>
  )
}

const statusColors = {
  pending: '#ff9800',
  preparing: '#2196f3',
  ready: '#4caf50',
  delivered: '#9e9e9e'
}

const statusLabels = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered'
}

// Check if an order is delayed
const isDelayed = (order: Order): boolean =>
{
  const now = new Date()
  const orderTime = new Date(order.createdAt)
  const diffMinutes = (now.getTime() - orderTime.getTime()) / (1000 * 60)

  // Orders are considered delayed based on status and time
  switch (order.status)
  {
    case 'pending':
      return diffMinutes > 10 // Pending for more than 10 minutes
    case 'preparing':
      return diffMinutes > 30 // Preparing for more than 30 minutes
    case 'ready':
      return diffMinutes > 15 // Ready for more than 15 minutes
    default:
      return false
  }
}

// Check if an order is from today
const isToday = (orderDate: string | Date): boolean =>
{
  const order = new Date(orderDate)
  const today = new Date()
  return order.toDateString() === today.toDateString()
}

export default function OrderDashboard ()
{
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ orders, setOrders ] = useState<Order[]>([])
  const [ selectedOrder, setSelectedOrder ] = useState<Order | null>(null)
  const [ loading, setLoading ] = useState(true)
  const [ error, setError ] = useState<string | null>(null)
  const [ tabValue, setTabValue ] = useState(0)
  const [ createOrderOpen, setCreateOrderOpen ] = useState(false)
  const [ drawerOpen, setDrawerOpen ] = useState(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Redirect to signin if not authenticated
  useEffect(() =>
  {
    if (status === 'loading') return // Still loading
    if (!session) router.push('/auth/signin')
  }, [ session, status, router ])

  const fetchOrders = async () =>
  {
    try
    {
      setLoading(true)
      const response = await fetch(`${ process.env.NEXT_PUBLIC_API_BASE_URL }/api/orders`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_AUTH_KEY || ''
        }
      })
      if (!response.ok)
      {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      setOrders(data)
      setError(null)
    } catch (err)
    {
      console.error('Error fetching orders:', err)
      setError('Failed to fetch orders. Please try again.')
      setOrders([])
    } finally
    {
      setLoading(false)
    }
  }

  useEffect(() =>
  {
    fetchOrders()
  }, [])

  const getOrdersByStatus = (status: OrderStatus) =>
  {
    return orders
      .filter(order => order.status === status)
      .filter(order => isToday(order.createdAt)) // Only show today's orders
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) =>
  {
    try
    {
      const response = await fetch(`${ process.env.NEXT_PUBLIC_API_BASE_URL }/api/orders/${ orderId }`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_AUTH_KEY || ''
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok)
      {
        throw new Error('Failed to update order')
      }

      const updatedOrder = await response.json()
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? updatedOrder : order
        )
      )
      setSelectedOrder(updatedOrder)
    } catch (error)
    {
      console.error('Error updating order:', error)
      alert('Failed to update order status')
    }
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

  const handleOrderClick = (order: Order) =>
  {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  if (loading && orders.length === 0)
  {
    return (
      <DashboardLayout title="Orders">
        <Container maxWidth="lg" sx={ { py: 8, textAlign: 'center' } }>
          <CircularProgress />
          <Typography variant="h6" sx={ { mt: 2 } }>
            Loading orders...
          </Typography>
        </Container>
      </DashboardLayout>
    )
  }

  if (!session)
  {
    return null // Will redirect
  }

  // Mobile actions for header
  const mobileActions = (
    <Box display="flex" gap={ 1 }>
      <IconButton
        color="inherit"
        onClick={ () => setCreateOrderOpen(true) }
        aria-label="add order"
      >
        <Add />
      </IconButton>
      <IconButton
        color="inherit"
        onClick={ fetchOrders }
        disabled={ loading }
        aria-label="refresh"
      >
        <Refresh />
      </IconButton>
    </Box>
  )

  return (
    <DashboardLayout title="Orders" mobileActions={ mobileActions }>
      <Container maxWidth="lg" sx={ { py: 3 } }>
        {/* Header with Actions */ }
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={ 3 }>
          <Typography variant="h4" component="h1" fontWeight="bold" sx={ { color: 'black' } }>
            Orders Management
          </Typography>
          <Box display="flex" gap={ 2 } sx={ { display: { xs: 'none', md: 'flex' } } }>
            <Button
              variant="contained"
              startIcon={ <Add /> }
              onClick={ () => setCreateOrderOpen(true) }
              sx={ {
                bgcolor: '#ff6b35',
                color: 'white',
                '&:hover': { bgcolor: '#e55a2b' }
              } }
            >
              New Order
            </Button>
            <Button
              variant="outlined"
              startIcon={ <Refresh /> }
              onClick={ fetchOrders }
              disabled={ loading }
              sx={ {
                borderColor: '#ff6b35',
                color: '#ff6b35',
                '&:hover': { borderColor: '#e55a2b', bgcolor: '#fff5f1' }
              } }
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Error Alert */ }
        { error && (
          <Alert
            severity="error"
            sx={ { mb: 3 } }
            action={
              <Button color="inherit" size="small" onClick={ fetchOrders }>
                Try Again
              </Button>
            }
          >
            { error }
          </Alert>
        ) }

        {/* Tabs */ }
        <Box sx={ { borderBottom: 1, borderColor: 'divider', mb: 3 } }>
          <Tabs
            value={ tabValue }
            onChange={ (_, newValue) => setTabValue(newValue) }
            variant={ isMobile ? "scrollable" : "standard" }
            scrollButtons="auto"
          >
            <Tab label={ `Pending (${ getOrdersByStatus('pending').length })` } />
            <Tab label={ `Preparing (${ getOrdersByStatus('preparing').length })` } />
            <Tab label={ `Ready (${ getOrdersByStatus('ready').length })` } />
            <Tab label={ `Delivered (${ getOrdersByStatus('delivered').length })` } />
          </Tabs>
        </Box>

        {/* Tab Panels */ }
        <TabPanel value={ tabValue } index={ 0 }>
          <Box sx={ { display: 'grid', gap: 2 } }>
            { getOrdersByStatus('pending').map(order => (
              <OrderCard
                key={ order.id }
                order={ order }
                onOrderClick={ handleOrderClick }
                onStatusUpdate={ updateOrderStatus }
                isDelayed={ isDelayed(order) }
              />
            )) }
            { getOrdersByStatus('pending').length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={ 4 }>
                No pending orders for today
              </Typography>
            ) }
          </Box>
        </TabPanel>

        <TabPanel value={ tabValue } index={ 1 }>
          <Box sx={ { display: 'grid', gap: 2 } }>
            { getOrdersByStatus('preparing').map(order => (
              <OrderCard
                key={ order.id }
                order={ order }
                onOrderClick={ handleOrderClick }
                onStatusUpdate={ updateOrderStatus }
                isDelayed={ isDelayed(order) }
              />
            )) }
            { getOrdersByStatus('preparing').length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={ 4 }>
                No orders being prepared today
              </Typography>
            ) }
          </Box>
        </TabPanel>

        <TabPanel value={ tabValue } index={ 2 }>
          <Box sx={ { display: 'grid', gap: 2 } }>
            { getOrdersByStatus('ready').map(order => (
              <OrderCard
                key={ order.id }
                order={ order }
                onOrderClick={ handleOrderClick }
                onStatusUpdate={ updateOrderStatus }
                isDelayed={ isDelayed(order) }
              />
            )) }
            { getOrdersByStatus('ready').length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={ 4 }>
                No orders ready today
              </Typography>
            ) }
          </Box>
        </TabPanel>

        <TabPanel value={ tabValue } index={ 3 }>
          <Box sx={ { display: 'grid', gap: 2 } }>
            { getOrdersByStatus('delivered').map(order => (
              <OrderCard
                key={ order.id }
                order={ order }
                onOrderClick={ handleOrderClick }
                onStatusUpdate={ updateOrderStatus }
              />
            )) }
            { getOrdersByStatus('delivered').length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={ 4 }>
                No delivered orders today
              </Typography>
            ) }
          </Box>
        </TabPanel>
      </Container>

      {/* Order Details Drawer */ }
      <Drawer
        anchor="right"
        open={ drawerOpen }
        onClose={ () => setDrawerOpen(false) }
        sx={ {
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : 500,
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
          },
        } }
      >
        { selectedOrder && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={ 2 }>
              <Typography variant="h5" fontWeight="bold">
                { selectedOrder.customerName }
              </Typography>
              <IconButton onClick={ () => setDrawerOpen(false) }>
                <Close />
              </IconButton>
            </Box>

            <Typography variant="subtitle1" color="text.secondary" mb={ 2 }>
              Order #{ selectedOrder.id }
            </Typography>

            <Box display="flex" gap={ 1 } mb={ 2 }>
              <Chip
                icon={ getStatusIcon(selectedOrder.orderType) }
                label={ selectedOrder.orderType }
                variant="outlined"
              />
              <Chip
                label={ statusLabels[ selectedOrder.status ] }
                sx={ {
                  backgroundColor: statusColors[ selectedOrder.status ],
                  color: 'white',
                } }
              />
            </Box>

            <Typography variant="body2" color="text.secondary" mb={ 3 }>
              Order placed: { new Date(selectedOrder.createdAt).toLocaleString() }
            </Typography>

            <Divider sx={ { mb: 2 } } />

            <Typography variant="h6" mb={ 2 }>
              Items
            </Typography>

            { selectedOrder.items.map((item) => (
              <Box
                key={ item.id }
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                py={ 1 }
                borderBottom="1px solid"
                borderColor="divider"
              >
                <Box>
                  <Typography variant="body1">{ item.name }</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Qty: { item.quantity }
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="bold">
                  ${ (item.price * item.quantity).toFixed(2) }
                </Typography>
              </Box>
            )) }

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={ 2 } mb={ 3 }>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">${ selectedOrder.total.toFixed(2) }</Typography>
            </Box>

            { getNextStatus(selectedOrder.status) && (
              <Button
                variant="contained"
                fullWidth
                startIcon={ getStatusIcon(getNextStatus(selectedOrder.status)!) }
                onClick={ () =>
                {
                  const nextStatus = getNextStatus(selectedOrder.status)
                  if (nextStatus)
                  {
                    updateOrderStatus(selectedOrder.id, nextStatus)
                  }
                } }
                sx={ { mt: 'auto', color: 'white' } }
              >
                Mark as { statusLabels[ getNextStatus(selectedOrder.status)! ] }
              </Button>
            ) }
          </>
        ) }
      </Drawer>

      {/* Create Order Dialog */ }
      <CreateOrderDialog
        open={ createOrderOpen }
        onClose={ () => setCreateOrderOpen(false) }
        onOrderCreated={ fetchOrders }
      />
    </DashboardLayout>
  )
}
