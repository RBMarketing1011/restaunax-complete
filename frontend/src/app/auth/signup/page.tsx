'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function SignUpPage ()
{
  const [ name, setName ] = useState('')
  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ confirmPassword, setConfirmPassword ] = useState('')
  const [ showPassword, setShowPassword ] = useState(false)
  const [ showConfirmPassword, setShowConfirmPassword ] = useState(false)
  const [ loading, setLoading ] = useState(false)
  const [ error, setError ] = useState('')
  const [ success, setSuccess ] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) =>
  {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic validation
    if (password !== confirmPassword)
    {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6)
    {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try
    {
      const response = await fetch(`${ process.env.NEXT_PUBLIC_API_BASE_URL }/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_AUTH_KEY || ''
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok)
      {
        throw new Error(data.message || 'Something went wrong')
      }

      setSuccess(true)
      // User will manually click button to go to sign in page

    } catch (err: unknown)
    {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.'
      setError(errorMessage)
    } finally
    {
      setLoading(false)
    }
  }

  if (success)
  {
    return (
      <Box sx={ { minHeight: '100vh', bgcolor: 'grey.50', display: 'flex', alignItems: 'center' } }>
        <Container maxWidth="sm">
          <Paper sx={ { p: 4, borderRadius: 2, boxShadow: 3, textAlign: 'center' } }>
            <Restaurant sx={ { fontSize: 48, color: 'success.main', mb: 2 } } />
            <Typography variant="h4" fontWeight="bold" mb={ 2 } color="success.main">
              Account Created!
            </Typography>
            <Typography color="text.secondary" mb={ 3 }>
              Your account has been successfully created. Please check your email inbox for a verification link to activate your account.
            </Typography>
            <Alert severity="info" sx={ { mb: 3, textAlign: 'left' } }>
              <Typography variant="body2">
                <strong>Important:</strong> You must verify your email address before you can sign in.
                Check your email (including spam folder) and click the verification link.
              </Typography>
            </Alert>
            <Button
              variant="contained"
              onClick={ () => router.push('/auth/signin') }
              sx={ { color: 'white' } }
            >
              Go to Sign In
            </Button>
          </Paper>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={ { minHeight: '100vh', bgcolor: 'grey.50', display: 'flex', alignItems: 'center' } }>
      <Container maxWidth="sm">
        <Paper sx={ { p: 4, borderRadius: 2, boxShadow: 3 } }>
          <Box sx={ { textAlign: 'center', mb: 4 } }>
            <Restaurant sx={ { fontSize: 48, color: 'primary.main', mb: 2 } } />
            <Typography variant="h4" fontWeight="bold" mb={ 1 }>
              Create Account
            </Typography>
            <Typography color="text.secondary">
              Join RestaunaX and start managing your orders
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
              label="Full Name"
              value={ name }
              onChange={ (e) => setName(e.target.value) }
              required
              sx={ { mb: 3 } }
              disabled={ loading }
            />

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
              helperText="Must be at least 6 characters long"
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

            <TextField
              fullWidth
              label="Confirm Password"
              type={ showConfirmPassword ? 'text' : 'password' }
              value={ confirmPassword }
              onChange={ (e) => setConfirmPassword(e.target.value) }
              required
              sx={ { mb: 3 } }
              disabled={ loading }
              InputProps={ {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={ () => setShowConfirmPassword(!showConfirmPassword) }
                      edge="end"
                      disabled={ loading }
                    >
                      { showConfirmPassword ? <VisibilityOff /> : <Visibility /> }
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
              { loading ? <CircularProgress size={ 24 } color="inherit" /> : 'Create Account' }
            </Button>
          </form>

          <Divider sx={ { my: 3 } }>
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={ () => router.push('/auth/signin') }
            sx={ { py: 1.5 } }
          >
            Sign In
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
