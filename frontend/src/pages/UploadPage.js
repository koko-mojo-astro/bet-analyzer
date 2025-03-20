import React, { useState } from 'react'
import {
	Box,
	Typography,
	Paper,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Alert,
	CircularProgress,
	Divider,
	Grid,
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import api from '../services/api'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext' // Corrected import path

function UploadPage() {
	// Use the centralized auth context instead of local state
	const { logout } = useAuth() // Added logout from useAuth

	// Upload state
	const [file, setFile] = useState(null)
	const [league, setLeague] = useState('')
	const [uploadLoading, setUploadLoading] = useState(false)
	const [uploadError, setUploadError] = useState(null)
	const [uploadSuccess, setUploadSuccess] = useState(false)
	const [uploadStats, setUploadStats] = useState(null)

	// Available leagues
	const leagues = [
		'English Premier League',
		'Spanish La Liga',
		'Italian Serie A',
		'French Ligue 1',
		'German Bundesliga',
		'Dutch Eredivisie',
		'Japanese J1 League',
		'Swedish Allsvenskan',
	]

	// Handle logout function
	const handleLogout = async () => {
		try {
			await logout()
			toast.success('Logged out successfully!')
		} catch (error) {
			console.error('Logout error:', error)
			toast.error('Failed to logout')
		}
	}

	// No longer need handleLogin as we're using ProtectedRoute

	// Handle file change
	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0]

		if (selectedFile) {
			// Check file extension
			const fileExtension = selectedFile.name.split('.').pop().toLowerCase()
			if (fileExtension !== 'xlsx' && fileExtension !== 'csv') {
				setUploadError('Only XLSX and CSV files are allowed')
				setFile(null)
				return
			}

			setFile(selectedFile)
			setUploadError(null)
		}
	}

	// Handle upload
	const handleUpload = async (e) => {
		e.preventDefault()
		setUploadError(null)
		setUploadSuccess(false)
		setUploadStats(null)

		// Validate inputs
		if (!file) {
			setUploadError('Please select a file to upload')
			return
		}

		if (!league) {
			setUploadError('Please select a league')
			return
		}

		// Create form data
		const formData = new FormData()
		formData.append('file', file)
		formData.append('league', league)

		setUploadLoading(true)

		try {
			const response = await api.post('/api/upload-data', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})

			setUploadSuccess(true)
			setUploadStats(response.data)
			toast.success('Data uploaded and processed successfully!')
		} catch (error) {
			console.error('Upload error:', error)
			setUploadError(
				error.response?.data?.error || 'Failed to upload and process data'
			)
			toast.error('Failed to upload and process data')
		} finally {
			setUploadLoading(false)
		}
	}

	return (
		<Box>
			<Typography variant='h4' component='h1' gutterBottom>
				Data Upload Portal
			</Typography>

			{
				// Upload Form
				<Paper elevation={3} sx={{ p: 3, mb: 4 }}>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							mb: 2,
						}}
					>
						<Typography variant='h5' component='h2'>
							Upload Match Data
						</Typography>

						<Button variant='outlined' color='secondary' onClick={handleLogout}>
							Logout
						</Button>
					</Box>

					<Divider sx={{ mb: 3 }} />

					{uploadError && (
						<Alert severity='error' sx={{ mb: 2 }}>
							{uploadError}
						</Alert>
					)}

					{uploadSuccess && (
						<Alert severity='success' sx={{ mb: 2 }}>
							Data uploaded and processed successfully!
							{uploadStats && (
								<Typography variant='body2' component='p' sx={{ mt: 1 }}>
									Processed: {uploadStats.processed} matches, Skipped:{' '}
									{uploadStats.skipped} matches
								</Typography>
							)}
						</Alert>
					)}

					<form onSubmit={handleUpload}>
						<Grid container spacing={3}>
							<Grid item xs={12} md={6}>
								<FormControl fullWidth>
									<InputLabel>League</InputLabel>
									<Select
										value={league}
										onChange={(e) => setLeague(e.target.value)}
										label='League'
										required
									>
										{leagues.map((leagueName) => (
											<MenuItem key={leagueName} value={leagueName}>
												{leagueName}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>

							<Grid item xs={12} md={6}>
								<Button
									variant='outlined'
									component='label'
									startIcon={<UploadFileIcon />}
									fullWidth
									sx={{ height: '56px' }}
								>
									{file ? file.name : 'Select File (XLSX or CSV)'}
									<input
										type='file'
										hidden
										accept='.xlsx,.csv'
										onChange={handleFileChange}
									/>
								</Button>
							</Grid>

							<Grid item xs={12}>
								<Button
									type='submit'
									variant='contained'
									color='primary'
									fullWidth
									disabled={uploadLoading || !file || !league}
									sx={{ mt: 2 }}
								>
									{uploadLoading ? (
										<CircularProgress size={24} />
									) : (
										'Upload and Process Data'
									)}
								</Button>
							</Grid>
						</Grid>
					</form>
				</Paper>
			}

			<Paper elevation={3} sx={{ p: 3 }}>
				<Typography variant='h6' gutterBottom>
					Instructions
				</Typography>

				<Typography variant='body1' paragraph>
					This page allows authorized users to upload match data in XLSX or CSV
					format.
				</Typography>

				<Typography variant='body2' component='div'>
					<ul>
						<li>Select the league for the data you are uploading</li>
						<li>Choose an XLSX or CSV file containing match data</li>
						<li>Click "Upload and Process Data" to update the database</li>
						<li>
							The system will automatically process the data and update the
							database
						</li>
						<li>Duplicate matches will be skipped automatically</li>
					</ul>
				</Typography>
			</Paper>
		</Box>
	)
}

export default UploadPage
