'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import
{
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button
} from '@mui/material'
import
{
  CheckCircle,
  Error as ErrorIcon,
  Restaurant
} from '@mui/icons-material'

function VerifyEmailForm ()
{
  const [ status, setStatus ] = useState<'loading' | 'success' | 'error'>('loading')
  const [ message, setMessage ] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() =>
  {
    const token = searchParams.get('token')

    if (!token)
    {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    const verifyEmail = async () =>
    {
      try
      {
        const response = await fetch(`${ process.env.NEXT_PUBLIC_API_BASE_URL }/api/auth/verify-email?token=${ token }`, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_AUTH_KEY || ''
          }
        })
        const data = await response.json()

        if (response.ok)
        {
          setStatus('success')
          setMessage(data.message)
        } else
        {
          setStatus('error')
          setMessage(data.message || 'Verification failed')
        }
      } catch
      {
        setStatus('error')
        setMessage('An error occurred during verification')
      }
    }

    verifyEmail()
  }, [ searchParams ])

  const handleSignIn = () =>
  {
    router.push('/auth/signin')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleResendEmail = async () =>
  {
    // Implementation for resending verification email could go here
    router.push('/auth/signin')
  }

  return (
    <Box sx={ { minHeight: '100vh', bgcolor: 'grey.50', display: 'flex', alignItems: 'center' } }>
      <Container maxWidth="sm">
        <Paper sx={ { p: 4, borderRadius: 2, boxShadow: 3, textAlign: 'center' } }>
          <Restaurant sx={ { fontSize: 48, color: 'primary.main', mb: 2 } } />

          { status === 'loading' && (
            <>
              <CircularProgress sx={ { mb: 3 } } />
              <Typography variant="h5" fontWeight="bold" mb={ 2 }>
                Verifying Your Email
              </Typography>
              <Typography color="text.secondary">
                Please wait while we verify your email address...
              </Typography>
            </>
          ) }

          { status === 'success' && (
            <>
              <CheckCircle sx={ { fontSize: 64, color: 'success.main', mb: 3 } } />
              <Typography variant="h4" fontWeight="bold" mb={ 2 } color="success.main">
                Email Verified!
              </Typography>
              <Typography color="text.secondary" mb={ 4 }>
                { message }
              </Typography>
              <Alert severity="success" sx={ { mb: 3 } }>
                Your account has been successfully verified. You can now sign in and access your RestaunaX dashboard.
              </Alert>
              <Button
                variant="contained"
                size="large"
                onClick={ handleSignIn }
                sx={ { px: 4, py: 1.5 } }
              >
                Sign In to Dashboard
              </Button>
            </>
          ) }

          { status === 'error' && (
            <>
              <ErrorIcon sx={ { fontSize: 64, color: 'error.main', mb: 3 } } />
              <Typography variant="h4" fontWeight="bold" mb={ 2 } color="error.main">
                Verification Failed
              </Typography>
              <Typography color="text.secondary" mb={ 3 }>
                { message }
              </Typography>
              <Alert severity="error" sx={ { mb: 3 } }>
                { message.includes('expired')
                  ? 'Your verification link has expired. Please request a new one.'
                  : 'There was a problem verifying your email address.'
                }
              </Alert>
              <Box sx={ { display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' } }>
                <Button
                  variant="outlined"
                  onClick={ () => router.push('/auth/signup') }
                >
                  Try Again
                </Button>
                <Button
                  variant="contained"
                  onClick={ handleSignIn }
                >
                  Back to Sign In
                </Button>
              </Box>
            </>
          ) }

          <Box sx={ { mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' } }>
            <Typography variant="body2" color="text.secondary">
              Need help? Contact support at{ ' ' }
              <Typography component="span" color="primary.main">
                support@restaunax.com
              </Typography>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default function VerifyEmailPage ()
{
  return (
    <Suspense fallback={
      <Box sx={ { minHeight: '100vh', bgcolor: 'grey.50', display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
        <CircularProgress />
      </Box>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
