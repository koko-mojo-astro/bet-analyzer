import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'

// Create the authentication context
const AuthContext = createContext()

// Custom hook to use the auth context
export const useAuth = () => {
	return useContext(AuthContext)
}

// Provider component
export const AuthProvider = ({ children }) => {
	const [currentUser, setCurrentUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	// Check if user is already logged in (from localStorage)
	useEffect(() => {
		const checkLoggedIn = async () => {
			try {
				const token = localStorage.getItem('token')
				if (token) {
					// Set authorization header
					api.defaults.headers.common['Authorization'] = `Bearer ${token}`

					// Verify token by getting current user
					const response = await api.get('/api/auth/me')
					setCurrentUser(response.data)
				}
			} catch (err) {
				// If token is invalid, remove it
				localStorage.removeItem('token')
				delete api.defaults.headers.common['Authorization']
				setCurrentUser(null)
				setError('Session expired. Please login again.')
			} finally {
				setLoading(false)
			}
		}

		checkLoggedIn()

		// Setup axios interceptor for handling 401 errors
		const interceptor = api.interceptors.response.use(
			(response) => response,
			(error) => {
				// If unauthorized error
				if (error.response && error.response.status === 401) {
					// Clear user data and token
					localStorage.removeItem('token')
					delete api.defaults.headers.common['Authorization']
					setCurrentUser(null)
					setError('Session expired. Please login again.')
					toast.error('Your session has expired. Please login again.')
				}
				return Promise.reject(error)
			}
		)

		// Cleanup interceptor on unmount
		return () => {
			api.interceptors.response.eject(interceptor)
		}
	}, [])

	// Login function
	const login = async (username, password) => {
		if (!username || !password) {
			const error = new Error('Username and password are required')
			setError('Username and password are required')
			throw error
		}

		try {
			setError(null)
			const response = await api.post('/api/auth/login', { username, password })
			const { user, token } = response.data

			// Save token to localStorage
			localStorage.setItem('token', token)

			// Set authorization header
			api.defaults.headers.common['Authorization'] = `Bearer ${token}`

			// Update user state
			setCurrentUser(user)
			toast.success('Login successful!')
			return user
		} catch (err) {
			const errorMessage = err.response?.data?.error || 'Login failed'
			setError(errorMessage)
			toast.error(errorMessage)
			throw err
		}
	}

	// Register function
	const register = async (username, password, email) => {
		// Check if user is admin before allowing registration
		if (!currentUser || currentUser.role !== 'ADMIN') {
			const error = new Error('Only administrators can register new users')
			setError('Only administrators can register new users')
			throw error
		}

		try {
			setError(null)
			const response = await api.post('/api/auth/register', {
				username,
				password,
				email,
			})
			toast.success('User registered successfully!')
			return response.data
		} catch (err) {
			const errorMessage = err.response?.data?.error || 'Registration failed'
			setError(errorMessage)
			toast.error(errorMessage)
			throw err
		}
	}

	// Logout function
	const logout = async () => {
		try {
			// Call the logout endpoint to invalidate token on server
			await api.post('/api/auth/logout')

			// Remove token from localStorage
			localStorage.removeItem('token')

			// Remove authorization header
			delete api.defaults.headers.common['Authorization']

			// Clear user state
			setCurrentUser(null)
			setError(null)

			// Notify user
			toast.info('You have been logged out successfully')
			return true
		} catch (err) {
			console.error('Logout error:', err)
			toast.error('Error during logout')

			// Still remove token and user data on client side even if server logout fails
			localStorage.removeItem('token')
			delete api.defaults.headers.common['Authorization']
			setCurrentUser(null)

			return false
		}
	}

	// Update password function
	const updatePassword = async (currentPassword, newPassword) => {
		// Check if user is authenticated
		if (!currentUser) {
			const error = new Error('You must be logged in to update your password')
			setError('You must be logged in to update your password')
			throw error
		}

		// Validate inputs
		if (!currentPassword || !newPassword) {
			const error = new Error('Current and new passwords are required')
			setError('Current and new passwords are required')
			throw error
		}

		try {
			setError(null)
			const response = await api.post('/api/auth/update-password', {
				currentPassword,
				newPassword,
			})
			toast.success('Password updated successfully')
			return response.data
		} catch (err) {
			const errorMessage =
				err.response?.data?.error || 'Failed to update password'
			setError(errorMessage)
			toast.error(errorMessage)
			throw err
		}
	}

	// Check if user is admin
	const isAdmin = () => {
		return currentUser?.role === 'ADMIN'
	}

	// Check if user is authenticated
	const isAuthenticated = () => {
		return !!currentUser
	}

	// Context value
	const value = {
		currentUser,
		loading,
		error,
		login,
		register,
		logout,
		updatePassword,
		isAdmin,
		isAuthenticated,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
