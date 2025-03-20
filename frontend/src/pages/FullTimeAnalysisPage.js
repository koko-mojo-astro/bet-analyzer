import React, { useState } from 'react'
import {
	Typography,
	Paper,
	Box,
	Grid,
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	CircularProgress,
	Alert,
	Divider,
	Card,
	CardContent,
	CardHeader,
} from '@mui/material'
import { toast } from 'react-toastify'
import api from '../services/api'
import { Bar } from 'react-chartjs-2'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function FulltimeAnalysisPage() {
	// State for form inputs
	const [league, setLeague] = useState('')

	// Over/Under state
	const [goalLine, setGoalLine] = useState(2.5)
	const [overOdds, setOverOdds] = useState('')
	const [underOdds, setUnderOdds] = useState('')

	// Odd/Even state
	const [oddOdds, setOddOdds] = useState('')
	const [evenOdds, setEvenOdds] = useState('')

	// BTTS state
	const [bttsYesOdds, setBttsYesOdds] = useState('')
	const [bttsNoOdds, setBttsNoOdds] = useState('')

	// Results state
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [results, setResults] = useState(null)

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

	// Available goal lines for Over/Under
	const goalLines = [0.5, 1.5, 2.5, 3.5]

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault()
		setError(null)

		// Validate inputs
		if (!league) {
			setError('Please select a league')
			return
		}

		// Validate all required odds fields
		if (!overOdds || !underOdds) {
			setError('Please enter both Over and Under odds')
			return
		}

		if (!oddOdds || !evenOdds) {
			setError('Please enter both Odd and Even odds')
			return
		}

		if (!bttsYesOdds || !bttsNoOdds) {
			setError('Please enter both BTTS Yes and No odds')
			return
		}

		// Prepare request body with all bet types
		const requestBody = {
			league,
			bet_odds: {
				over: {
					goal_line: goalLine,
					odd: parseFloat(overOdds),
				},
				under: {
					goal_line: goalLine,
					odd: parseFloat(underOdds),
				},
				odd_goals: {
					odd: parseFloat(oddOdds),
				},
				even_goals: {
					odd: parseFloat(evenOdds),
				},
				btts_yes: {
					odd: parseFloat(bttsYesOdds),
				},
				btts_no: {
					odd: parseFloat(bttsNoOdds),
				},
			},
		}

		try {
			setLoading(true)
			const response = await api.post(
				'/api/predict-fulltime-goals',
				requestBody
			)
			setResults(response.data)
			toast.success('Goal prediction completed successfully!')
		} catch (error) {
			console.error('Error predicting fulltime goals:', error)
			setError(
				error.response?.data?.error || 'Failed to predict fulltime goals'
			)
			toast.error('Failed to predict fulltime goals')
		} finally {
			setLoading(false)
		}
	}

	// Prepare bar chart data if results are available
	const barChartData = results
		? {
				labels: ['0 Goals', '1 Goal', '2 Goals', '3+ Goals'],
				datasets: [
					{
						label: 'Probability (%)',
						data: [
							results.goal_probabilities['0'],
							results.goal_probabilities['1'],
							results.goal_probabilities['2'],
							results.goal_probabilities['3+'],
						],
						backgroundColor: [
							'rgba(54, 162, 235, 0.6)',
							'rgba(75, 192, 192, 0.6)',
							'rgba(255, 206, 86, 0.6)',
							'rgba(255, 99, 132, 0.6)',
						],
						borderColor: [
							'rgba(54, 162, 235, 1)',
							'rgba(75, 192, 192, 1)',
							'rgba(255, 206, 86, 1)',
							'rgba(255, 99, 132, 1)',
						],
						borderWidth: 1,
					},
				],
		  }
		: null

	const chartOptions = {
		responsive: true,
		plugins: {
			legend: {
				position: 'top',
			},
			title: {
				display: true,
				text: 'Fulltime Goal Probabilities',
			},
			tooltip: {
				callbacks: {
					label: function (context) {
						const label = context.label || ''
						const value = context.raw
						return `${label}: ${value}%`
					},
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				max: 100,
				ticks: {
					callback: function (value) {
						return value + '%'
					},
				},
			},
		},
	}

	// Render results section
	const renderResults = () => {
		if (!results) return null

		return (
			<Box sx={{ mt: 4 }}>
				<Typography variant='h5' component='h2' gutterBottom>
					Goal Prediction Results
				</Typography>

				<Grid container spacing={4}>
					<Grid item xs={12} md={6}>
						<Card>
							<CardHeader title='Goal Probability Distribution' />
							<CardContent>
								<Box height={300}>
									<Bar data={barChartData} options={chartOptions} />
								</Box>
							</CardContent>
						</Card>
					</Grid>

					<Grid item xs={12}>
						<Card>
							<CardHeader title='Prediction Summary' />
							<CardContent>
								<Typography variant='body1' gutterBottom>
									<strong>League:</strong> {league}
								</Typography>
								<Typography variant='body1' gutterBottom>
									<strong>Total Matches Analyzed:</strong>{' '}
									{results.total_matches_analyzed}
								</Typography>
								{results.most_likely_outcome && (
									<Typography variant='body1' gutterBottom>
										<strong>Most Likely Outcome:</strong>{' '}
										{results.most_likely_outcome}
									</Typography>
								)}

								<Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
									{Object.entries(results.goal_probabilities).map(
										([goals, probability]) => (
											<Card
												key={goals}
												sx={{
													minWidth: 150,
													p: 2,
													textAlign: 'center',
													bgcolor:
														results.most_likely_outcome &&
														goals === results.most_likely_outcome.split(' ')[0]
															? 'rgba(76, 175, 80, 0.1)'
															: 'inherit',
												}}
											>
												<Typography variant='h6' color='primary'>
													{goals === '3+'
														? '3+ Goals'
														: `${goals} ${
																parseInt(goals) === 1 ? 'Goal' : 'Goals'
														  }`}
												</Typography>
												<Typography
													variant='h4'
													sx={{ fontWeight: 'bold', my: 1 }}
												>
													{probability}%
												</Typography>
											</Card>
										)
									)}
								</Box>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Box>
		)
	}

	return (
		<Box>
			<Typography variant='h4' component='h1' gutterBottom>
				Fulltime Analysis Tool
			</Typography>

			<Paper elevation={3} sx={{ p: 3, mb: 4 }}>
				<Typography variant='h5' component='h2' gutterBottom>
					Input Match Odds
				</Typography>

				{error && (
					<Alert severity='error' sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<form onSubmit={handleSubmit}>
					<Grid container spacing={3}>
						<Grid item xs={12} md={6}>
							<FormControl fullWidth>
								<InputLabel>League</InputLabel>
								<Select
									value={league}
									onChange={(e) => setLeague(e.target.value)}
									label='League'
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
							<Typography
								variant='subtitle1'
								color='primary'
								sx={{ fontWeight: 'bold', mt: 2 }}
							>
								All bet types and odds are mandatory
							</Typography>
						</Grid>

						{/* Over/Under Section */}
						<Grid item xs={12}>
							<Divider>
								<Typography variant='subtitle1'>Over/Under Odds</Typography>
							</Divider>
						</Grid>

						<Grid item xs={12} md={4}>
							<FormControl fullWidth>
								<InputLabel>Goal Line</InputLabel>
								<Select
									value={goalLine}
									onChange={(e) => setGoalLine(e.target.value)}
									label='Goal Line'
								>
									{goalLines.map((line) => (
										<MenuItem key={line} value={line}>
											{line}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} md={4}>
							<TextField
								fullWidth
								label={`Over ${goalLine} Goals Odds`}
								type='number'
								inputProps={{ step: 0.01, min: 1 }}
								value={overOdds}
								onChange={(e) => setOverOdds(e.target.value)}
								required
							/>
						</Grid>

						<Grid item xs={12} md={4}>
							<TextField
								fullWidth
								label={`Under ${goalLine} Goals Odds`}
								type='number'
								inputProps={{ step: 0.01, min: 1 }}
								value={underOdds}
								onChange={(e) => setUnderOdds(e.target.value)}
								required
							/>
						</Grid>

						{/* Odd/Even Section */}
						<Grid item xs={12}>
							<Divider>
								<Typography variant='subtitle1'>Odd/Even Goals Odds</Typography>
							</Divider>
						</Grid>

						<Grid item xs={12} md={6}>
							<TextField
								fullWidth
								label='Odd Goals Odds'
								type='number'
								inputProps={{ step: 0.01, min: 1 }}
								value={oddOdds}
								onChange={(e) => setOddOdds(e.target.value)}
								required
							/>
						</Grid>

						<Grid item xs={12} md={6}>
							<TextField
								fullWidth
								label='Even Goals Odds'
								type='number'
								inputProps={{ step: 0.01, min: 1 }}
								value={evenOdds}
								onChange={(e) => setEvenOdds(e.target.value)}
								required
							/>
						</Grid>

						{/* BTTS Section */}
						<Grid item xs={12}>
							<Divider>
								<Typography variant='subtitle1'>
									Both Teams To Score (BTTS) Odds
								</Typography>
							</Divider>
						</Grid>

						<Grid item xs={12} md={6}>
							<TextField
								fullWidth
								label='BTTS Yes Odds'
								type='number'
								inputProps={{ step: 0.01, min: 1 }}
								value={bttsYesOdds}
								onChange={(e) => setBttsYesOdds(e.target.value)}
								required
							/>
						</Grid>

						<Grid item xs={12} md={6}>
							<TextField
								fullWidth
								label='BTTS No Odds'
								type='number'
								inputProps={{ step: 0.01, min: 1 }}
								value={bttsNoOdds}
								onChange={(e) => setBttsNoOdds(e.target.value)}
								required
							/>
						</Grid>

						<Grid item xs={12}>
							<Button
								type='submit'
								variant='contained'
								color='primary'
								size='large'
								disabled={loading}
								sx={{ mt: 2 }}
							>
								{loading ? <CircularProgress size={24} /> : 'Analyze'}
							</Button>
						</Grid>
					</Grid>
				</form>
			</Paper>

			{loading && (
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						my: 4,
					}}
				>
					<CircularProgress />
					<Typography variant='h6' sx={{ ml: 2 }}>
						Analyzing data and predicting goals...
					</Typography>
				</Box>
			)}

			{results && !loading && renderResults()}
		</Box>
	)
}

export default FulltimeAnalysisPage
