import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'

// Create a custom theme
const theme = createTheme({
	palette: {
		primary: {
			main: '#1976d2',
		},
		secondary: {
			main: '#dc004e',
		},
		background: {
			default: '#f5f5f5',
		},
	},
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
		h1: {
			fontSize: '2.2rem',
			fontWeight: 500,
		},
		h2: {
			fontSize: '1.8rem',
			fontWeight: 500,
		},
	},
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<React.StrictMode>
		<BrowserRouter>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<AuthProvider>
					<App />
					<ToastContainer position='bottom-right' autoClose={5000} />
				</AuthProvider>
			</ThemeProvider>
		</BrowserRouter>
	</React.StrictMode>
)
