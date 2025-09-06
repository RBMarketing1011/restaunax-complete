'use client'

import React, { useState } from 'react'
import
{
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Divider
} from '@mui/material'
import { Add, Remove, Close } from '@mui/icons-material'
import { OrderType } from '@/types/order'

interface OrderItem
{
  name: string
  quantity: number
  price: number
}

interface CreateOrderDialogProps
{
  open: boolean
  onClose: () => void
  onOrderCreated: () => void
}

export default function CreateOrderDialog ({ open, onClose, onOrderCreated }: CreateOrderDialogProps)
{
  const [ customerName, setCustomerName ] = useState('')
  const [ orderType, setOrderType ] = useState<OrderType>('delivery')
  const [ items, setItems ] = useState<OrderItem[]>([
    { name: '', quantity: 1, price: 0 }
  ])
  const [ loading, setLoading ] = useState(false)

  const addItem = () =>
  {
    setItems([ ...items, { name: '', quantity: 1, price: 0 } ])
  }

  const removeItem = (index: number) =>
  {
    if (items.length > 1)
    {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) =>
  {
    const newItems = [ ...items ]
    newItems[ index ] = { ...newItems[ index ], [ field ]: value }
    setItems(newItems)
  }

  const calculateTotal = () =>
  {
    return items.reduce((total, item) => total + (item.quantity * item.price), 0)
  }

  const handleSubmit = async () =>
  {
    if (!customerName.trim() || items.some(item => !item.name.trim() || item.price <= 0))
    {
      return
    }

    setLoading(true)
    try
    {
      const response = await fetch(`${ process.env.NEXT_PUBLIC_API_BASE_URL }/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_AUTH_KEY || ''
        },
        body: JSON.stringify({
          customerName,
          orderType,
          items: items.filter(item => item.name.trim()),
          total: calculateTotal()
        })
      })

      if (response.ok)
      {
        resetForm()
        onOrderCreated()
        onClose()
      }
    } catch (error)
    {
      console.error('Error creating order:', error)
    } finally
    {
      setLoading(false)
    }
  }

  const resetForm = () =>
  {
    setCustomerName('')
    setOrderType('delivery')
    setItems([ { name: '', quantity: 1, price: 0 } ])
  }

  return (
    <Dialog
      open={ open }
      onClose={ onClose }
      maxWidth="sm"
      fullWidth
      PaperProps={ { sx: { borderRadius: 2 } } }
    >
      <DialogTitle sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
        Create New Order
        <IconButton onClick={ onClose }>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 3, mt: 1 } }>
          <TextField
            label="Customer Name"
            fullWidth
            value={ customerName }
            onChange={ (e) => setCustomerName(e.target.value) }
            required
          />

          <FormControl fullWidth>
            <InputLabel>Order Type</InputLabel>
            <Select
              value={ orderType }
              label="Order Type"
              onChange={ (e) => setOrderType(e.target.value as OrderType) }
            >
              <MenuItem value="delivery">Delivery</MenuItem>
              <MenuItem value="pickup">Pickup</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="h6" gutterBottom>
              Items
            </Typography>
            { items.map((item, index) => (
              <Box key={ index } sx={ { display: 'flex', gap: 1, mb: 2, alignItems: 'center' } }>
                <TextField
                  label="Item Name"
                  value={ item.name }
                  onChange={ (e) => updateItem(index, 'name', e.target.value) }
                  sx={ { flex: 2 } }
                  size="small"
                />
                <TextField
                  label="Qty"
                  type="number"
                  value={ item.quantity }
                  onChange={ (e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1) }
                  sx={ { width: 80 } }
                  size="small"
                  inputProps={ { min: 1 } }
                />
                <TextField
                  label="Price"
                  type="number"
                  value={ item.price }
                  onChange={ (e) => updateItem(index, 'price', parseFloat(e.target.value) || 0) }
                  sx={ { width: 100 } }
                  size="small"
                  inputProps={ { min: 0, step: 0.01 } }
                />
                <IconButton
                  onClick={ () => removeItem(index) }
                  disabled={ items.length === 1 }
                  size="small"
                  color="error"
                >
                  <Remove />
                </IconButton>
              </Box>
            )) }

            <Button
              startIcon={ <Add /> }
              onClick={ addItem }
              variant="outlined"
              size="small"
            >
              Add Item
            </Button>
          </Box>

          <Divider />

          <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
            <Typography variant="h6">
              Total: ${ calculateTotal().toFixed(2) }
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={ { p: 3, pt: 0 } }>
        <Button onClick={ onClose } disabled={ loading }>
          Cancel
        </Button>
        <Button
          onClick={ handleSubmit }
          variant="contained"
          disabled={ loading || !customerName.trim() || items.some(item => !item.name.trim() || item.price <= 0) }
          sx={ { color: 'white' } }
        >
          { loading ? 'Creating...' : 'Create Order' }
        </Button>
      </DialogActions>
    </Dialog>
  )
}
