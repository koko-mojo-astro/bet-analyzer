import React, { useState } from 'react'
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

function LoginPage() {
	const navigate = useNavigate()
	const { login, error: authError } = useAuth()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const handleLogin = async (e) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			await login(username, password)
			toast.success('Login successful!')
			navigate('/')
		} catch (err) {
			setError(err.response?.data?.error || 'Login failed')
			toast.error('Login failed!')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Box sx={{ maxWidth: 500, mx: 'auto', py: 4 }}>
			<Typography variant='h4' component='h1' gutterBottom>
				Login
			</Typography>

			<Paper elevation={3} sx={{ p: 3, mb: 4 }}>
				{(error || authError) && (
					<Alert severity='error' sx={{ mb: 2 }}>
						{error || authError}
					</Alert>
				)}

				<form onSubmit={handleLogin}>
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
						{loading ? <CircularProgress size={24} /> : 'Login'}
					</Button>
				</form>

				<Divider sx={{ my: 2 }} />

				<Box sx={{ textAlign: 'center' }}>
					<Typography variant='body2'>
						Only administrators can register new users
					</Typography>
				</Box>
			</Paper>
		</Box>
	)
}

export default LoginPage
