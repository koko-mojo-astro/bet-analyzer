import React, { useState, useEffect } from 'react'
import {
	Box,
	Paper,
	Typography,
	TextField,
	Button,
	Alert,
	CircularProgress,
	Divider,
	IconButton,
	InputAdornment,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../services/api'

function AdminSetupPage() {
	const navigate = useNavigate()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [email, setEmail] = useState('')
	const [adminKey, setAdminKey] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showAdminKey, setShowAdminKey] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [adminExists, setAdminExists] = useState(false)

	// Check if admin already exists
	useEffect(() => {
		const checkAdminExists = async () => {
			try {
				// Try to login with a dummy request to see if we get "Admin user already exists"
				await api.post('/api/auth/create-admin', {
					adminKey: 'check-only',
					username: 'check-only',
					password: 'check-only',
					email: 'check@example.com',
				})
			} catch (err) {
				if (
					err.response &&
					err.response.data &&
					err.response.data.error === 'Admin user already exists'
				) {
					setAdminExists(true)
				}
			}
		}

		checkAdminExists()
	}, [])

	const handleCreateAdmin = async (e) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			// Validate inputs
			if (!username || !password || !email || !adminKey) {
				throw new Error('All fields are required')
			}

			// Call the create-admin API
			const response = await api.post('/api/auth/create-admin', {
				adminKey,
				username,
				password,
				email,
			})
			console.log('response data', response.data)
			toast.success('Admin user created successfully!')

			// Clear form
			setUsername('')
			setPassword('')
			setEmail('')
			setAdminKey('')

			// Redirect to login page
			navigate('/login')
		} catch (err) {
			const errorMessage =
				err.response?.data?.error ||
				err.message ||
				'Failed to create admin user'
			setError(errorMessage)
			toast.error(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	// If admin already exists, show a message
	if (adminExists) {
		return (
			<Box sx={{ maxWidth: 500, mx: 'auto', py: 4 }}>
				<Typography variant='h4' component='h1' gutterBottom>
					Admin Setup
				</Typography>

				<Paper elevation={3} sx={{ p: 3, mb: 4 }}>
					<Alert severity='info' sx={{ mb: 2 }}>
						An admin user already exists. Please use the login page.
					</Alert>

					<Box sx={{ textAlign: 'center', mt: 2 }}>
						<Button
							variant='contained'
							color='primary'
							onClick={() => navigate('/login')}
						>
							Go to Login
						</Button>
					</Box>
				</Paper>
			</Box>
		)
	}

	return (
		<Box sx={{ maxWidth: 500, mx: 'auto', py: 4 }}>
			<Typography variant='h4' component='h1' gutterBottom>
				Admin Setup
			</Typography>

			<Paper elevation={3} sx={{ p: 3, mb: 4 }}>
				{error && (
					<Alert severity='error' sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<Typography variant='body1' sx={{ mb: 2 }}>
					Create the initial administrator account for your application.
				</Typography>

				<form onSubmit={handleCreateAdmin}>
					<TextField
						label='Admin Setup Key'
						variant='outlined'
						fullWidth
						margin='normal'
						type={showAdminKey ? 'text' : 'password'}
						value={adminKey}
						onChange={(e) => setAdminKey(e.target.value)}
						required
						InputProps={{
							endAdornment: (
								<InputAdornment position='end'>
									<IconButton
										onClick={() => setShowAdminKey(!showAdminKey)}
										edge='end'
									>
										{showAdminKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>

					<TextField
						label='Username'
						variant='outlined'
						fullWidth
						margin='normal'
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
					/>

					<TextField
						label='Email'
						type='email'
						variant='outlined'
						fullWidth
						margin='normal'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>

					<TextField
						label='Password'
						variant='outlined'
						fullWidth
						margin='normal'
						type={showPassword ? 'text' : 'password'}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						InputProps={{
							endAdornment: (
								<InputAdornment position='end'>
									<IconButton
										onClick={() => setShowPassword(!showPassword)}
										edge='end'
									>
										{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>

					<Button
						type='submit'
						variant='contained'
						color='primary'
						fullWidth
						sx={{ mt: 2 }}
						disabled={loading}
					>
						{loading ? <CircularProgress size={24} /> : 'Create Admin'}
					</Button>
				</form>

				<Divider sx={{ my: 2 }} />

				<Box sx={{ textAlign: 'center' }}>
					<Button
						variant='outlined'
						color='primary'
						onClick={() => navigate('/login')}
					>
						Back to Login
					</Button>
				</Box>
			</Paper>
		</Box>
	)
}

export default AdminSetupPage
