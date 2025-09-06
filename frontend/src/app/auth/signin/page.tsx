'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import
{
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material'
import { Restaurant, Visibility, VisibilityOff } from '@mui/icons-material'

function SignInForm ()
{
  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ showPassword, setShowPassword ] = useState(false)
  const [ loading, setLoading ] = useState(false)
  const [ error, setError ] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for verification error on page load
  useEffect(() =>
  {
    const errorParam = searchParams.get('error')
    if (errorParam === 'verification')
    {
      setError('Please verify your email address before signing in. Check your email inbox for the verification link.')
    }
  }, [ searchParams ])

  const handleSubmit = async (e: React.FormEvent) =>
  {
    e.preventDefault()
    setLoading(true)
    setError('')

    try
    {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error)
      {
        // Check if this might be an unverified email issue
        try
        {
          const checkResponse = await fetch(`${ process.env.NEXT_PUBLIC_API_BASE_URL }/api/auth/check-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.NEXT_PUBLIC_AUTH_KEY || ''
            },
            body: JSON.stringify({ email, password })
          })

          const checkData = await checkResponse.json()

          if (checkData.unverified)
          {
            // Redirect with verification error
            router.push('/auth/signin?error=verification')
            return
          }
        } catch
        {
          // If check fails, show generic error
        }

        setError('Invalid email or password')
      } else
      {
        // Refresh the session and redirect
        await getSession()
        router.push('/orders')
      }
    } catch
    {
      setError('An error occurred. Please try again.')
    } finally
    {
      setLoading(false)
    }
  }

  return (
    <Box sx={ { minHeight: '100vh', bgcolor: 'grey.50', display: 'flex', alignItems: 'center' } }>
      <Container maxWidth="sm">
        <Paper sx={ { p: 4, borderRadius: 2, boxShadow: 3 } }>
          <Box sx={ { textAlign: 'center', mb: 4 } }>
            <Restaurant sx={ { fontSize: 48, color: 'primary.main', mb: 2 } } />
            <Typography variant="h4" fontWeight="bold" mb={ 1 }>
              Welcome Back
            </Typography>
            <Typography color="text.secondary">
              Sign in to your RestaunaX account
            </Typography>
          </Box>

          { error && (
            <Alert severity="error" sx={ { mb: 3 } }>
              { error }
            </Alert>
          ) }

          <form onSubmit={ handleSubmit }>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={ email }
              onChange={ (e) => setEmail(e.target.value) }
              required
              sx={ { mb: 3 } }
              disabled={ loading }
            />

            <TextField
              fullWidth
              label="Password"
              type={ showPassword ? 'text' : 'password' }
              value={ password }
              onChange={ (e) => setPassword(e.target.value) }
              required
              sx={ { mb: 3 } }
              disabled={ loading }
              InputProps={ {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={ () => setShowPassword(!showPassword) }
                      edge="end"
                      disabled={ loading }
                    >
                      { showPassword ? <VisibilityOff /> : <Visibility /> }
                    </IconButton>
                  </InputAdornment>
                )
              } }
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={ loading }
              sx={ { mb: 3, py: 1.5, color: 'white' } }
            >
              { loading ? <CircularProgress size={ 24 } color="inherit" /> : 'Sign In' }
            </Button>
          </form>

          <Divider sx={ { my: 3 } }>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={ () => router.push('/auth/signup') }
            sx={ { py: 1.5 } }
          >
            Create Account
          </Button>

          <Box sx={ { textAlign: 'center', mt: 3 } }>
            <Link
              component="button"
              variant="body2"
              onClick={ () => router.push('/') }
              sx={ { textDecoration: 'none' } }
            >
              ← Back to Home
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default function SignInPage ()
{
  return (
    <Suspense fallback={
      <Box sx={ { minHeight: '100vh', bgcolor: 'grey.50', display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
        <CircularProgress />
      </Box>
    }>
      <SignInForm />
    </Suspense>
  )
}
