import React, { useState } from 'react'
import {
	Paper,
	Typography,
	TextField,
	Button,
	Alert,
	CircularProgress,
} from '@mui/material'
import { toast } from 'react-toastify'
import api from '../services/api'

const UpdatePasswordForm = ({ onPasswordUpdated }) => {
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError(null)

		// Validate inputs
		if (!currentPassword || !newPassword || !confirmPassword) {
			setError('All fields are required')
			return
		}

		if (newPassword !== confirmPassword) {
			setError('New password and confirmation do not match')
			return
		}

		if (newPassword.length < 8) {
			setError('New password must be at least 8 characters long')
			return
		}

		try {
			setLoading(true)
			await api.post('/api/admin/update-password', {
				currentPassword,
				newPassword,
			})

			toast.success('Password updated successfully. Please login again.')

			// Clear form
			setCurrentPassword('')
			setNewPassword('')
			setConfirmPassword('')

			// Notify parent component
			if (onPasswordUpdated) {
				onPasswordUpdated()
			}
		} catch (error) {
			console.error('Error updating password:', error)
			setError(error.response?.data?.error || 'Failed to update password')
			toast.error('Failed to update password')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Paper elevation={3} sx={{ p: 3, mb: 4 }}>
			<Typography variant='h5' component='h2' gutterBottom>
				Update Admin Password
			</Typography>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{error}
				</Alert>
			)}

			<form onSubmit={handleSubmit}>
				<TextField
					fullWidth
					label='Current Password'
					type='password'
					value={currentPassword}
					onChange={(e) => setCurrentPassword(e.target.value)}
					margin='normal'
					required
				/>

				<TextField
					fullWidth
					label='New Password'
					type='password'
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
					margin='normal'
					required
					helperText='Password must be at least 8 characters long'
				/>

				<TextField
					fullWidth
					label='Confirm New Password'
					type='password'
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					margin='normal'
					required
				/>

				<Button
					type='submit'
					variant='contained'
					color='primary'
					disabled={loading}
					sx={{ mt: 2 }}
				>
					{loading ? <CircularProgress size={24} /> : 'Update Password'}
				</Button>
			</form>
		</Paper>
	)
}

export default UpdatePasswordForm
