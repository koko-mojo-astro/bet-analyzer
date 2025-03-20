// API configuration
// Determine if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development'

// In development, use the proxy setting from package.json
// In production, use the REACT_APP_API_URL environment variable
const API_URL = isDevelopment ? '' : process.env.REACT_APP_API_URL || ''

export { API_URL }
