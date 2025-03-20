import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

function RegisterPage() {
	const navigate = useNavigate()
	const { register, currentUser, isAdmin } = useAuth()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [email, setEmail] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	// Redirect if not admin
	useEffect(() => {
		// If user is not logged in or not an admin, redirect to home
		if (currentUser && !isAdmin()) {
			toast.error('Only administrators can register new users')
			navigate('/')
		} else if (!currentUser) {
			toast.error('You must be logged in as an administrator')
			navigate('/login')
		}
	}, [currentUser, isAdmin, navigate])

	const handleRegister = async (e) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			await register(username, password, email)
			toast.success('User registered successfully!')
			// Clear form
			setUsername('')
			setPassword('')
			setEmail('')
		} catch (err) {
			setError(err.response?.data?.error || 'Registration failed')
			toast.error('Registration failed!')
		} finally {
			setLoading(false)
		}
	}

	// If not admin, don't render the form
	if (currentUser && !isAdmin()) {
		return null
	}

	return (
		<Box sx={{ maxWidth: 500, mx: 'auto', py: 4 }}>
			<Typography variant='h4' component='h1' gutterBottom>
				Register New User
			</Typography>

			<Paper elevation={3} sx={{ p: 3, mb: 4 }}>
				{error && (
					<Alert severity='error' sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<Typography variant='body1' sx={{ mb: 2 }}>
					As an administrator, you can create new user accounts here.
				</Typography>

				<form onSubmit={handleRegister}>
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
										{showPassword ? (
											<VisibilityOffIcon />
										) : (
											<VisibilityIcon />
										)}
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
						{loading ? <CircularProgress size={24} /> : 'Register User'}
					</Button>
				</form>

				<Divider sx={{ my: 2 }} />

				<Box sx={{ textAlign: 'center' }}>
					<Button
						variant='outlined'
						color='primary'
						onClick={() => navigate('/')}
					>
						Back to Home
					</Button>
				</Box>
			</Paper>
		</Box>
	)
}

export default RegisterPage