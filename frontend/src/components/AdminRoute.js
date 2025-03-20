import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * AdminRoute component that checks if user is authenticated and has admin role
 * If authenticated and admin, renders the child components
 * If not authenticated or not admin, redirects to appropriate page
 */
const AdminRoute = () => {
	const { isAuthenticated, isAdmin, loading } = useAuth()

	// If still loading authentication status, return null (or could show a loading spinner)
	if (loading) {
		return null // or return <LoadingSpinner />
	}

	// If not authenticated, redirect to login page
	if (!isAuthenticated()) {
		return <Navigate to="/login" replace />
	}

	// If authenticated but not admin, redirect to home page
	if (!isAdmin()) {
		return <Navigate to="/" replace />
	}

	// If authenticated and admin, render the child routes
	return <Outlet />
}

export default AdminRoute