'use client'

import { useState, useEffect } from 'react'
import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import Sidebar from './Sidebar'

interface DashboardLayoutProps
{
  children: React.ReactNode
  title?: string
  mobileActions?: React.ReactNode
}

export default function DashboardLayout ({ children, title, mobileActions }: DashboardLayoutProps)
{
  const [ mobileOpen, setMobileOpen ] = useState(false)
  const [ isMounted, setIsMounted ] = useState(false)

  // Handle hydration
  useEffect(() =>
  {
    setIsMounted(true)
  }, [])

  const handleDrawerToggle = () =>
  {
    setMobileOpen(!mobileOpen)
  }

  if (!isMounted)
  {
    // Return a basic layout structure during SSR
    return (
      <Box sx={ { display: 'flex', height: '100vh', bgcolor: 'white' } }>
        <Box component="main" sx={ { flexGrow: 1, p: 3 } }>
          { children }
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={ { display: 'flex', height: '100vh', bgcolor: 'white' } }>
      {/* Sidebar */ }
      <Sidebar mobileOpen={ mobileOpen } onMobileToggle={ handleDrawerToggle } />

      {/* Main content area */ }
      <Box sx={ { flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }>
        {/* Mobile header with hamburger menu - show on smaller screens */ }
        <Box sx={ { display: { xs: 'block', md: 'none' } } }>
          <AppBar
            position="static"
            sx={ {
              backgroundColor: 'white',
              color: 'black',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderBottom: '1px solid #e0e0e0'
            } }
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={ handleDrawerToggle }
                sx={ { mr: 2 } }
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={ { flexGrow: 1 } }>
                { title || 'RestaunaX' }
              </Typography>
              { mobileActions }
            </Toolbar>
          </AppBar>
        </Box>

        {/* Page content */ }
        <Box
          component="main"
          sx={ {
            flexGrow: 1,
            overflow: 'auto',
            backgroundColor: 'white',
            p: 3
          } }
        >
          { children }
        </Box>
      </Box>
    </Box>
  )
}
