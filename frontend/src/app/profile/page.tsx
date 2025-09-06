'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import
{
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  InputAdornment
} from '@mui/material'
import
{
  Delete,
  Warning,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'
import DashboardLayout from '@/components/DashboardLayout'

interface UserData
{
  id: string
  name: string
  email: string
  accountId: string
  isAccountOwner: boolean
  account?: {
    id: string
    name: string
    ownerId: string
    users: Array<{
      id: string
      name: string
      email: string
    }>
  }
}

export default function ProfilePage ()
{
  const { data: session, update } = useSession()
  const router = useRouter()
  const [ loading, setLoading ] = useState(true)
  const [ userData, setUserData ] = useState<UserData | null>(null)
  const [ error, setError ] = useState<string | null>(null)
  const [ success, setSuccess ] = useState<string | null>(null)

  // Individual loading states for each button
  const [ savingProfile, setSavingProfile ] = useState(false)
  const [ savingPassword, setSavingPassword ] = useState(false)
  const [ savingAccountName, setSavingAccountName ] = useState(false)
  const [ seedingAccount, setSeedingAccount ] = useState(false)
  const [ deletingAccountData, setDeletingAccountData ] = useState(false)
  const [ deletingAccount, setDeletingAccount ] = useState(false)

  // Form states
  const [ name, setName ] = useState('')
  const [ email, setEmail ] = useState('')
  const [ currentPassword, setCurrentPassword ] = useState('')
  const [ newPassword, setNewPassword ] = useState('')
  const [ confirmPassword, setConfirmPassword ] = useState('')
  const [ accountName, setAccountName ] = useState('')

  // Password visibility states
  const [ showCurrentPassword, setShowCurrentPassword ] = useState(false)
  const [ showNewPassword, setShowNewPassword ] = useState(false)
  const [ showConfirmPassword, setShowConfirmPassword ] = useState(false)

  // Dialog states
  const [ deleteAccountDialog, setDeleteAccountDialog ] = useState(false)

  // Redirect to signin if not authenticated
  useEffect(() =>
  {
    if (session === null) router.push('/auth/signin')
  }, [ session, router ])

  // Fetch user data
  const fetchUserData = useCallback(async () =>
  {
    if (!session?.user?.id) return

    try
    {
      setLoading(true)
      const response = await fetch(`${ process.env.NEXT_PUBLIC_API_BASE_URL }/api/user/profile/${ session.user.id }`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_AUTH_KEY || ''
        }
      })
      if (!response.ok)
      {
        throw new Error('Failed to fetch user data')
      }
      const data = await response.json()
      setUserData(data)
      setName(data.name || '')
      setEmail(data.email || '')
      setAccountName(data.account?.name || '')
    } catch (err)
    {
      console.error('Error fetching user data:', err)
      setError('Failed to load profile data')
    } finally
    {
      setLoading(false)
    }
  }, [ session?.user?.id ])

  useEffect(() =>
  {
    if (session)
    {
      fetchUserData()
    }
  }, [ session, fetchUserData ])

  const handleUpdateProfile = async () =>
  {
    if (!name.trim())
    {
      setError('Name is required')
      return
    }

    if (!userData?.id) return

    try
    {
      setSavingProfile(true)
      setError(null)

      const response = await fetch(`${ process.env.NEXT_PUBLIC_API_BASE_URL }/api/user/profile/${ userData.id }`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_AUTH_KEY || ''
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() !== userData?.email ? email.trim() : undefined
        })
      })

      if (!response.ok)
      {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      const data = await response.json()
      setSuccess(data.message)
      await update() // Refresh session data
      await fetchUserData() // Refresh user data
    } catch (err: unknown)
    {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally
    {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () =>
  {
    if (!currentPassword || !newPassword || !confirmPassword)
    {
      setError('All password fields are required')
      return
    }

    if (newPassword !== confirmPassword)
    {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 6)
    {
      setError('New password must be at least 6 characters')
      return
    }

    try
    {
      setSavingPassword(true)
      setError(null)

      const response = await fetch(`${ process.env.NEXT_PUBLIC_API_BASE_URL }/api/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_AUTH_KEY || ''
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      if (!response.ok)
      {
        const data = await response.json()
        throw new Error(data.error || 'Failed to change password')
      }

      setSuccess('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown)
    {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally
    {
      setSavingPassword(false)
    }
  }

  const handleUpdateAccountName = async () =>
  {
    if (!accountName.trim())
    {
      setError('Account name is required')
      return
    }

    if (!userData?.accountId) return

    try
    {
      setSavingAccountName(true)
      setError(null)

      const response = await fetch(`${ process.env.NEXT_PUBLIC_API_BASE_URL }/api/account/update/${ userData.accountId }`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_AUTH_KEY || ''
        },
        body: JSON.stringify({
          name: accountName.trim()
        })
      })

      if (!response.ok)
      {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update account name')
      }

      setSuccess('Account name updated successfully')
      await fetchUserData()
    } catch (err: unknown)
    {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally
    {
      setSavingAccountName(false)
    }
  }

  const handleSeedAccount = async (type: 'user' | 'account', id: string) =>
  {
    try
    {
      if (type === 'user')
      {
        setDeletingAccountData(true)
      } else
      {
        setSeedingAccount(true)
      }
      setError(null)

      const response = await fetch(`${ process.env.NEXT_PUBLIC_API_BASE_URL }/api/dev/reset-db?${ type === 'user' ? 'userId' : 'accountId' }=${ id }`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_AUTH_KEY || ''
        }
      })

      if (!response.ok)
      {
        const data = await response.json()
        throw new Error(data.error || 'Failed to seed account')
      }

      setSuccess('Account seeded successfully with sample data')
    } catch (err: unknown)
    {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally
    {
      if (type === 'user')
      {
        setDeletingAccountData(false)
      } else
      {
        setSeedingAccount(false)
      }
    }
  }

  const handleDeleteAccount = async () =>
  {
    if (!userData?.accountId) return

    try
    {
      setDeletingAccount(true)
      setError(null)

      const response = await fetch(`${ process.env.NEXT_PUBLIC_API_BASE_URL }/api/account/delete/${ userData.accountId }`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_AUTH_KEY || ''
        }
      })

      if (!response.ok)
      {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete account')
      }

      router.push('/auth/signin?message=Account deleted successfully')
    } catch (err: unknown)
    {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setDeletingAccount(false)
    }
  }

  if (loading)
  {
    return (
      <DashboardLayout title="Profile">
        <Container maxWidth="lg" sx={ { py: 8, textAlign: 'center' } }>
          <CircularProgress />
          <Typography variant="h6" sx={ { mt: 2 } }>
            Loading profile...
          </Typography>
        </Container>
      </DashboardLayout>
    )
  }

  if (!session || !userData)
  {
    return null
  }

  return (
    <DashboardLayout title="Profile">
      <Container maxWidth="lg" sx={ { py: 3 } }>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={ { mb: 3, color: 'black' } }>
          Profile Settings
        </Typography>

        {/* Error/Success Messages */ }
        { error && (
          <Alert severity="error" sx={ { mb: 3 } } onClose={ () => setError(null) }>
            { error }
          </Alert>
        ) }
        { success && (
          <Alert severity="success" sx={ { mb: 3 } } onClose={ () => setSuccess(null) }>
            { success }
          </Alert>
        ) }

        <Stack spacing={ 3 }>
          {/* Personal Information */ }
          <Card>
            <CardHeader title="Personal Information" />
            <CardContent>
              <Stack spacing={ 3 }>
                <TextField
                  label="Full Name"
                  value={ name }
                  onChange={ (e) => setName(e.target.value) }
                  fullWidth
                  required
                />
                <TextField
                  label="Email Address"
                  type="email"
                  value={ email }
                  onChange={ (e) => setEmail(e.target.value) }
                  fullWidth
                  required
                  helperText={ email !== userData.email ? "Changing email will require verification" : "" }
                />
                <Box>
                  <Button
                    variant="contained"
                    onClick={ handleUpdateProfile }
                    disabled={ savingProfile }
                    sx={ { bgcolor: '#ff6b35', color: 'white', '&:hover': { bgcolor: '#e55a2b' } } }
                  >
                    { savingProfile ? <CircularProgress size={ 20 } color="inherit" /> : 'Update Profile' }
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Change Password */ }
          <Card>
            <CardHeader title="Change Password" />
            <CardContent>
              <Stack spacing={ 3 }>
                <TextField
                  label="Current Password"
                  type={ showCurrentPassword ? 'text' : 'password' }
                  value={ currentPassword }
                  onChange={ (e) => setCurrentPassword(e.target.value) }
                  fullWidth
                  InputProps={ {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={ () => setShowCurrentPassword(!showCurrentPassword) }
                          edge="end"
                        >
                          { showCurrentPassword ? <VisibilityOff /> : <Visibility /> }
                        </IconButton>
                      </InputAdornment>
                    )
                  } }
                />
                <TextField
                  label="New Password"
                  type={ showNewPassword ? 'text' : 'password' }
                  value={ newPassword }
                  onChange={ (e) => setNewPassword(e.target.value) }
                  fullWidth
                  InputProps={ {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={ () => setShowNewPassword(!showNewPassword) }
                          edge="end"
                        >
                          { showNewPassword ? <VisibilityOff /> : <Visibility /> }
                        </IconButton>
                      </InputAdornment>
                    )
                  } }
                />
                <TextField
                  label="Confirm New Password"
                  type={ showConfirmPassword ? 'text' : 'password' }
                  value={ confirmPassword }
                  onChange={ (e) => setConfirmPassword(e.target.value) }
                  fullWidth
                  InputProps={ {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={ () => setShowConfirmPassword(!showConfirmPassword) }
                          edge="end"
                        >
                          { showConfirmPassword ? <VisibilityOff /> : <Visibility /> }
                        </IconButton>
                      </InputAdornment>
                    )
                  } }
                />
                <Box>
                  <Button
                    variant="contained"
                    onClick={ handleChangePassword }
                    disabled={ savingPassword }
                    sx={ { bgcolor: '#ff6b35', color: 'white', '&:hover': { bgcolor: '#e55a2b' } } }
                  >
                    { savingPassword ? <CircularProgress size={ 20 } color="inherit" /> : 'Change Password' }
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Account Management */ }
          <Card>
            <CardHeader
              title="Account Management"
            />
            <CardContent>
              <Stack spacing={ 3 }>
                <TextField
                  label="Account Name"
                  value={ accountName }
                  onChange={ (e) => setAccountName(e.target.value) }
                  fullWidth
                  required
                />

                <Box sx={ { display: 'flex', gap: 2, flexWrap: 'wrap' } }>
                  <Button
                    variant="contained"
                    onClick={ handleUpdateAccountName }
                    disabled={ savingAccountName }
                    sx={ { bgcolor: '#ff6b35', color: 'white', '&:hover': { bgcolor: '#e55a2b' } } }
                  >
                    { savingAccountName ? <CircularProgress size={ 20 } color="inherit" /> : 'Update Account Name' }
                  </Button>

                  { process.env.NEXT_PUBLIC_NODE_ENV === 'development' && (
                    <>
                      <Button
                        variant="outlined"
                        onClick={ () => handleSeedAccount('account', userData.accountId) }
                        disabled={ seedingAccount }
                        sx={ {
                          borderColor: '#4caf50',
                          color: '#4caf50',
                          '&:hover': {
                            borderColor: '#45a049',
                            bgcolor: 'rgba(76, 175, 80, 0.04)'
                          }
                        } }
                      >
                        {
                          seedingAccount ?
                            <CircularProgress
                              size={ 20 }
                              color="inherit"
                            />
                            :
                            'Seed Account'
                        }
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={ () => handleSeedAccount('user', userData.id) }
                        disabled={ deletingAccountData }
                        sx={ {
                          bgcolor: '#e6352b',
                          borderColor: '#e6352b',
                          color: '#ffffff',
                          '&:hover': {
                            borderColor: '#b32922',
                            bgcolor: '#b32922'
                          }
                        } }
                      >
                        {
                          deletingAccountData ?
                            <CircularProgress
                              size={ 20 }
                              color="inherit"
                            />
                            :
                            'Delete Data'
                        }
                      </Button>
                    </>
                  ) }
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Danger Zone */ }
          <Card sx={ { borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' } }>
            <CardHeader
              title="Danger Zone"
              titleTypographyProps={ { color: 'error.main' } }
            />
            <CardContent>
              <Alert severity="warning" sx={ { mb: 2 } }>
                <Typography variant="body2">
                  Deleting your account will permanently remove all data including orders, users, and settings.
                  This action cannot be undone.
                </Typography>
              </Alert>
              <Button
                variant="outlined"
                color="error"
                startIcon={ <Delete /> }
                onClick={ () => setDeleteAccountDialog(true) }
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Stack>

        {/* Delete Account Dialog */ }
        <Dialog open={ deleteAccountDialog } onClose={ () => setDeleteAccountDialog(false) }>
          <DialogTitle sx={ { color: 'error.main' } }>
            <Warning sx={ { mr: 1, verticalAlign: 'middle' } } />
            Delete Account
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you absolutely sure you want to delete your account and all associated data?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={ () => setDeleteAccountDialog(false) }>Cancel</Button>
            <Button
              onClick={ handleDeleteAccount }
              color="error"
              variant="contained"
              disabled={ deletingAccount }
            >
              { deletingAccount ? <CircularProgress size={ 20 } color="inherit" /> : 'Delete Account' }
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  )
}
