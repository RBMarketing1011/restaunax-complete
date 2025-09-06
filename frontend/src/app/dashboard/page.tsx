'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import
{
  Container,
  Typography,
  Box,
  Chip,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Stack,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  OutlinedInput,
  SelectChangeEvent,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TableContainer,
  useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import FilterListIcon from '@mui/icons-material/FilterList'
import
{
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer
} from 'recharts'
import DashboardLayout from '@/components/DashboardLayout'
import { Order } from '@/types/order'

// Types
interface FilterState
{
  timeRange: string
  statuses: string[]
  orderType: string
}

interface BucketData
{
  x: string
  count: number
}

interface TypeCountData
{
  type: string
  count: number
}

interface ItemData
{
  name: string
  quantity: number
}

// Data utility functions
const inRange = (orderDate: string | Date, filterRange: string): boolean =>
{
  const orderTime = new Date(orderDate).getTime()
  const now = new Date().getTime()

  switch (filterRange)
  {
    case 'today':
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      return orderTime >= todayStart.getTime()
    case 'last7days':
      return orderTime >= now - (7 * 24 * 60 * 60 * 1000)
    case 'last30days':
      return orderTime >= now - (30 * 24 * 60 * 60 * 1000)
    default:
      return true
  }
}

const filterOrders = (orders: Order[], { range, statuses, orderType }: { range: string, statuses: string[], orderType: string }): Order[] =>
{
  return orders.filter(order =>
  {
    const inTimeRange = inRange(order.createdAt, range)
    const matchesStatus = statuses.length === 0 || statuses.includes(order.status)
    const matchesType = orderType === 'all' || order.orderType === orderType
    return inTimeRange && matchesStatus && matchesType
  })
}

const groupByStatus = (orders: Order[]): Record<string, number> =>
{
  return orders.reduce((acc, order) =>
  {
    acc[ order.status ] = (acc[ order.status ] || 0) + 1
    return acc
  }, { pending: 0, preparing: 0, ready: 0, delivered: 0 } as Record<string, number>)
}

const sumRevenue = (orders: Order[]): number =>
{
  return orders.reduce((sum, order) => sum + order.total, 0)
}

const averageOrderValue = (orders: Order[]): number =>
{
  if (orders.length === 0) return 0
  return sumRevenue(orders) / orders.length
}

const timeBuckets = (orders: Order[], granularity: string): BucketData[] =>
{
  const buckets: Record<string, number> = {}

  orders.forEach(order =>
  {
    const date = new Date(order.createdAt)
    let key: string

    if (granularity === 'hour')
    {
      key = `${ date.getMonth() + 1 }/${ date.getDate() } ${ date.getHours() }:00`
    } else
    {
      key = `${ date.getMonth() + 1 }/${ date.getDate() }`
    }

    buckets[ key ] = (buckets[ key ] || 0) + 1
  })

  return Object.entries(buckets).map(([ x, count ]) => ({ x, count }))
}

const pickupVsDelivery = (orders: Order[]): TypeCountData[] =>
{
  const counts = orders.reduce((acc, order) =>
  {
    acc[ order.orderType ] = (acc[ order.orderType ] || 0) + 1
    return acc
  }, { pickup: 0, delivery: 0 } as Record<string, number>)

  return [
    { type: 'pickup', count: counts.pickup || 0 },
    { type: 'delivery', count: counts.delivery || 0 }
  ]
}

const topItems = (orders: Order[], limit = 10): ItemData[] =>
{
  const itemCounts: Record<string, number> = {}

  orders.forEach(order =>
  {
    order.items.forEach(item =>
    {
      itemCounts[ item.name ] = (itemCounts[ item.name ] || 0) + item.quantity
    })
  })

  return Object.entries(itemCounts)
    .map(([ name, quantity ]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
}

const formatCurrency = (amount: number): string =>
{
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatRelativeTime = (date: string | Date): string =>
{
  const now = new Date().getTime()
  const orderTime = new Date(date).getTime()
  const diffMinutes = Math.floor((now - orderTime) / (1000 * 60))

  if (diffMinutes < 60) return `${ diffMinutes }m ago`
  if (diffMinutes < 1440) return `${ Math.floor(diffMinutes / 60) }h ago`
  return `${ Math.floor(diffMinutes / 1440) }d ago`
}

// Components
function KpiCards ({ orders }: { orders: Order[] })
{
  const statusCounts = groupByStatus(orders)
  const revenue = sumRevenue(orders)
  const avgOrderValue = averageOrderValue(orders)

  return (
    <Box sx={ { display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' } }>
      <Box sx={ { flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } } }>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="body2">
              Total Orders
            </Typography>
            <Typography variant="h4" component="div">
              { orders.length }
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Box sx={ { flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } } }>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="body2">
              Orders by Status
            </Typography>
            <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 0.5 } }>
              <Chip label={ `Pending: ${ statusCounts.pending }` } size="small" />
              <Chip label={ `Preparing: ${ statusCounts.preparing }` } size="small" />
              <Chip label={ `Ready: ${ statusCounts.ready }` } size="small" />
              <Chip label={ `Delivered: ${ statusCounts.delivered }` } size="small" />
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Box sx={ { flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } } }>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="body2">
              Total Revenue
            </Typography>
            <Typography variant="h4" component="div">
              { formatCurrency(revenue) }
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Box sx={ { flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } } }>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="body2">
              Average Order Value
            </Typography>
            <Typography variant="h4" component="div">
              { formatCurrency(avgOrderValue) }
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

function FiltersBar ({ filters, onFiltersChange }: {
  filters: FilterState,
  onFiltersChange: (filters: FilterState) => void
})
{
  const [ filterModalOpen, setFilterModalOpen ] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleTimeRangeChange = (event: SelectChangeEvent) =>
  {
    onFiltersChange({ ...filters, timeRange: event.target.value })
  }

  const handleStatusChange = (event: SelectChangeEvent<string[]>) =>
  {
    const value = typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
    onFiltersChange({ ...filters, statuses: value })
  }

  const handleOrderTypeChange = (_event: React.MouseEvent<HTMLElement>, newType: string | null) =>
  {
    if (newType !== null)
    {
      onFiltersChange({ ...filters, orderType: newType })
    }
  }

  const FilterModal = () => (
    <Dialog
      open={ filterModalOpen }
      onClose={ () => setFilterModalOpen(false) }
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Filters</DialogTitle>
      <DialogContent>
        <Stack spacing={ 3 } sx={ { pt: 1 } }>
          <FormControl fullWidth>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={ filters.timeRange }
              onChange={ handleTimeRangeChange }
              label="Time Range"
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="last7days">Last 7 days</MenuItem>
              <MenuItem value="last30days">Last 30 days</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              multiple
              value={ filters.statuses }
              onChange={ handleStatusChange }
              input={ <OutlinedInput label="Status" /> }
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="preparing">Preparing</MenuItem>
              <MenuItem value="ready">Ready</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" sx={ { mb: 1 } }>Order Type</Typography>
            <ToggleButtonGroup
              value={ filters.orderType }
              exclusive
              onChange={ handleOrderTypeChange }
              aria-label="order type"
              fullWidth
            >
              <ToggleButton value="all" aria-label="all">
                All
              </ToggleButton>
              <ToggleButton value="pickup" aria-label="pickup">
                Pickup
              </ToggleButton>
              <ToggleButton value="delivery" aria-label="delivery">
                Delivery
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={ () => setFilterModalOpen(false) }>Close</Button>
      </DialogActions>
    </Dialog>
  )

  if (isMobile)
  {
    return (
      <>
        <Card sx={ { mb: 3 } }>
          <CardContent>
            <Stack direction="row" spacing={ 2 } alignItems="center" justifyContent="space-between">
              <IconButton
                onClick={ () => setFilterModalOpen(true) }
                sx={ {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                } }
              >
                <FilterListIcon />
              </IconButton>
              <Typography variant="h6">Dashboard Filters</Typography>
            </Stack>
          </CardContent>
        </Card>
        <FilterModal />
      </>
    )
  }

  // Desktop version
  return (
    <Card sx={ { mb: 3 } }>
      <CardContent>
        <Stack direction={ { xs: 'column', md: 'row' } } spacing={ 2 } alignItems="center">
          <FormControl sx={ { minWidth: 150 } }>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={ filters.timeRange }
              onChange={ handleTimeRangeChange }
              label="Time Range"
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="last7days">Last 7 days</MenuItem>
              <MenuItem value="last30days">Last 30 days</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={ { minWidth: 200 } }>
            <InputLabel>Status</InputLabel>
            <Select
              multiple
              value={ filters.statuses }
              onChange={ handleStatusChange }
              input={ <OutlinedInput label="Status" /> }
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="preparing">Preparing</MenuItem>
              <MenuItem value="ready">Ready</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={ filters.orderType }
            exclusive
            onChange={ handleOrderTypeChange }
            aria-label="order type"
          >
            <ToggleButton value="all" aria-label="all">
              All
            </ToggleButton>
            <ToggleButton value="pickup" aria-label="pickup">
              Pickup
            </ToggleButton>
            <ToggleButton value="delivery" aria-label="delivery">
              Delivery
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </CardContent>
    </Card>
  )
}

function OrdersOverTimeChart ({ orders, timeRange }: { orders: Order[], timeRange: string })
{
  const granularity = timeRange === 'today' ? 'hour' : 'day'
  const data = timeBuckets(orders, granularity)

  return (
    <Card>
      <CardHeader title="Orders Over Time" />
      <CardContent>
        <ResponsiveContainer width="100%" height={ 300 }>
          <LineChart data={ data }>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#ff6b35" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function PickupVsDeliveryChart ({ orders }: { orders: Order[] })
{
  const data = pickupVsDelivery(orders)

  return (
    <Card>
      <CardHeader title="Pickup vs Delivery" />
      <CardContent>
        <ResponsiveContainer width="100%" height={ 300 }>
          <BarChart data={ data }>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#ff6b35" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function TopItemsChart ({ orders }: { orders: Order[] })
{
  const data = topItems(orders, 5)

  // Debug logging
  console.log('TopItemsChart - orders count:', orders.length)
  console.log('TopItemsChart - data:', data)

  return (
    <Card>
      <CardHeader title="Top Selling Items" />
      <CardContent>
        { data.length === 0 ? (
          <Typography color="textSecondary" textAlign="center" py={ 4 }>
            No items data available
          </Typography>
        ) : (
          <Box>
            {/* Debug info */ }
            <Typography variant="caption" color="textSecondary" sx={ { mb: 2, display: 'block' } }>
              Showing { data.length } items
            </Typography>
            <ResponsiveContainer width="100%" height={ 300 }>
              <BarChart
                data={ data }
                margin={ { top: 20, right: 30, left: 20, bottom: 60 } }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={ -45 }
                  textAnchor="end"
                  height={ 60 }
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#ff6b35" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) }
      </CardContent>
    </Card>
  )
}

function LiveOrdersTable ({ orders }: { orders: Order[] })
{
  const [ page, setPage ] = useState(0)
  const [ rowsPerPage, setRowsPerPage ] = useState(10)
  const [ sortBy, setSortBy ] = useState('createdAt')
  const [ sortOrder, setSortOrder ] = useState('desc')

  const sortedOrders = useMemo(() =>
  {
    return [ ...orders ].sort((a, b) =>
    {
      let aValue: string | number = sortBy === 'createdAt' ? a.createdAt : sortBy === 'total' ? a.total : a.createdAt
      let bValue: string | number = sortBy === 'createdAt' ? b.createdAt : sortBy === 'total' ? b.total : b.createdAt

      if (sortBy === 'createdAt')
      {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      }

      if (sortOrder === 'asc')
      {
        return aValue > bValue ? 1 : -1
      } else
      {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [ orders, sortBy, sortOrder ])

  const paginatedOrders = sortedOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const getStatusChip = (status: string) =>
  {
    const colorMap: Record<string, "default" | "warning" | "info" | "success"> = {
      pending: 'default',
      preparing: 'warning',
      ready: 'info',
      delivered: 'success'
    }
    return <Chip label={ status } color={ colorMap[ status ] } size="small" />
  }

  return (
    <Card sx={ { height: { xs: 'auto', md: 'auto' }, display: 'flex', flexDirection: 'column' } }>
      <CardHeader title="Orders" />
      <CardContent sx={ { p: 0, flex: 1, overflow: 'hidden' } }>
        <TableContainer sx={ {
          height: { xs: '60vh', md: '500px' },
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555'
          }
        } }>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={ { minWidth: '120px' } }>Customer Name</TableCell>
                <TableCell sx={ { minWidth: '100px' } }>Order Type</TableCell>
                <TableCell sx={ { minWidth: '100px' } }>Items Count</TableCell>
                <TableCell
                  onClick={ () =>
                  {
                    if (sortBy === 'total')
                    {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    } else
                    {
                      setSortBy('total')
                      setSortOrder('desc')
                    }
                  } }
                  sx={ { cursor: 'pointer', minWidth: '80px' } }
                >
                  Total
                </TableCell>
                <TableCell sx={ { minWidth: '100px' } }>Status</TableCell>
                <TableCell
                  onClick={ () =>
                  {
                    if (sortBy === 'createdAt')
                    {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    } else
                    {
                      setSortBy('createdAt')
                      setSortOrder('desc')
                    }
                  } }
                  sx={ { cursor: 'pointer', minWidth: '100px' } }
                >
                  Created
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { paginatedOrders.map((order) => (
                <TableRow key={ order.id }>
                  <TableCell>{ order.customerName }</TableCell>
                  <TableCell>{ order.orderType }</TableCell>
                  <TableCell>{ order.items.length }</TableCell>
                  <TableCell>{ formatCurrency(order.total) }</TableCell>
                  <TableCell>{ getStatusChip(order.status) }</TableCell>
                  <TableCell>{ formatRelativeTime(order.createdAt) }</TableCell>
                </TableRow>
              )) }
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={ [ 5, 10, 25 ] }
          component="div"
          count={ orders.length }
          rowsPerPage={ rowsPerPage }
          page={ page }
          onPageChange={ (_event, newPage) => setPage(newPage) }
          onRowsPerPageChange={ (event) =>
          {
            setRowsPerPage(parseInt(event.target.value, 10))
            setPage(0)
          } }
          sx={ { px: 2, py: 1, borderTop: 1, borderColor: 'divider' } }
        />
      </CardContent>
    </Card>
  )
}

export default function OrdersDashboard ()
{
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ orders, setOrders ] = useState<Order[]>([])
  const [ loading, setLoading ] = useState(true)
  const [ error, setError ] = useState<string | null>(null)

  const [ filters, setFilters ] = useState<FilterState>({
    timeRange: 'today',
    statuses: [],
    orderType: 'all'
  })

  // Redirect to signin if not authenticated
  useEffect(() =>
  {
    if (status === 'loading') return
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

  const filteredOrders = useMemo(() =>
  {
    return filterOrders(orders, {
      range: filters.timeRange,
      statuses: filters.statuses,
      orderType: filters.orderType
    })
  }, [ orders, filters ])

  if (loading)
  {
    return (
      <DashboardLayout title="Dashboard">
        <Container maxWidth="lg" sx={ { py: 8, textAlign: 'center' } }>
          <CircularProgress />
          <Typography variant="h6" sx={ { mt: 2 } }>
            Loading dashboard...
          </Typography>
        </Container>
      </DashboardLayout>
    )
  }

  if (!session)
  {
    return null
  }

  return (
    <DashboardLayout title="Dashboard">
      <Container
        maxWidth="lg"
        sx={ {
          py: 3,
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%'
        } }
      >
        {/* Header */ }
        <Box mb={ 3 }>
          <Typography variant="h4" component="h1" fontWeight="bold" sx={ { color: 'black' } }>
            Dashboard
          </Typography>
        </Box>

        {/* Error Alert */ }
        { error && (
          <Alert severity="error" sx={ { mb: 3 } }>
            { error }
          </Alert>
        ) }

        {/* Filters */ }
        <FiltersBar
          filters={ filters }
          onFiltersChange={ setFilters }
        />

        {/* Dashboard Content */ }
        <>
          {/* KPI Cards */ }
          <KpiCards orders={ filteredOrders } />

          {/* Charts */ }
          <Box sx={ { display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' } }>
            <Box sx={ { flex: { xs: '1 1 100%', lg: '1 1 32%' } } }>
              <OrdersOverTimeChart orders={ filteredOrders } timeRange={ filters.timeRange } />
            </Box>
            <Box sx={ { flex: { xs: '1 1 100%', lg: '1 1 32%' } } }>
              <PickupVsDeliveryChart orders={ filteredOrders } />
            </Box>
            <Box sx={ { flex: { xs: '1 1 100%', lg: '1 1 32%' } } }>
              <TopItemsChart orders={ filteredOrders } />
            </Box>
          </Box>

          {/* Tables */ }
          <Box sx={ {
            display: 'flex',
            gap: 3,
            flexWrap: 'wrap',
            overflow: 'hidden',
            width: '100%'
          } }>
            <Box sx={ {
              flex: { xs: '1 1 100%' },
              overflow: 'hidden',
              minWidth: 0
            } }>
              <LiveOrdersTable orders={ filteredOrders } />
            </Box>
          </Box>
        </>
      </Container>
    </DashboardLayout>
  )
}
