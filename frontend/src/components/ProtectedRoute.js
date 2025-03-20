import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute component that checks if user is authenticated
 * If authenticated, renders the child components
 * If not authenticated, redirects to login page
 */
const ProtectedRoute = () => {
	const { isAuthenticated, loading } = useAuth()

	// If still loading authentication status, return null (or could show a loading spinner)
	if (loading) {
		return null // or return <LoadingSpinner />
	}

	// If not authenticated, redirect to login page
	// Otherwise render the child routes
	return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute