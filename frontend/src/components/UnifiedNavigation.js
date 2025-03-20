import React from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

function UnifiedNavigation() {
	const { currentUser, logout, isAdmin } = useAuth()
	const navigate = useNavigate()

	const handleLogout = async () => {
		try {
			await logout()
			toast.success('Logged out successfully!')
			navigate('/')
		} catch (error) {
			console.error('Logout error:', error)
			toast.error('Failed to logout')
		}
	}
	return (
		<AppBar position='static'>
			<Toolbar>
				<AssessmentIcon sx={{ mr: 2 }} />
				<Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
					Bet Analyser
				</Typography>
				<Box>
					<Button color='inherit' component={RouterLink} to='/'>
						Home
					</Button>
					<Button
						color='inherit'
						component={RouterLink}
						to='/fulltime-analysis'
					>
						Fulltime Analysis
					</Button>
					<Button color='inherit' component={RouterLink} to='/goal-prediction'>
						Goal Prediction
					</Button>
					<Button color='inherit' component={RouterLink} to='/upload'>
						Upload Data
					</Button>

					{/* Authentication buttons */}
					{currentUser ? (
						<>
							{isAdmin() && (
								<Button color='inherit' component={RouterLink} to='/register'>
									Register User
								</Button>
							)}
							<Button color='inherit' onClick={handleLogout}>
								Logout
							</Button>
						</>
					) : (
						<Button color='inherit' component={RouterLink} to='/login'>
							Login
						</Button>
					)}
				</Box>
			</Toolbar>
		</AppBar>
	)
}

export default UnifiedNavigation
