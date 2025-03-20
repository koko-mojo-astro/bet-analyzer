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
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
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

function AnalysisPage() {
	// State for form inputs
	const [league, setLeague] = useState('')

	// Over/Under state
	const [goalLine, setGoalLine] = useState(1.5)
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
			const response = await api.post('/api/analyze-bet-history', requestBody)
			setResults(response.data)
			toast.success('Analysis completed successfully!')
		} catch (error) {
			console.error('Error analyzing bet history:', error)
			setError(error.response?.data?.error || 'Failed to analyze bet history')
			toast.error('Failed to analyze bet history')
		} finally {
			setLoading(false)
		}
	}

	// Prepare chart data if results are available
	const chartData = results
		? {
				labels: Object.keys(results.success_rates),
				datasets: [
					{
						label: 'Success Rate (%)',
						data: Object.values(results.success_rates).map((rate) =>
							parseInt(rate)
						),
						backgroundColor: [
							'rgba(54, 162, 235, 0.6)',
							'rgba(255, 99, 132, 0.6)',
							'rgba(75, 192, 192, 0.6)',
							'rgba(255, 206, 86, 0.6)',
							'rgba(153, 102, 255, 0.6)',
							'rgba(255, 159, 64, 0.6)',
						],
						borderColor: [
							'rgba(54, 162, 235, 1)',
							'rgba(255, 99, 132, 1)',
							'rgba(75, 192, 192, 1)',
							'rgba(255, 206, 86, 1)',
							'rgba(153, 102, 255, 1)',
							'rgba(255, 159, 64, 1)',
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
				text: 'Bet Success Rates',
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

	return (
		<Box>
			<Typography variant='h4' component='h1' gutterBottom>
				Betting Analysis Tool
			</Typography>

			<Paper elevation={3} sx={{ p: 3, mb: 4 }}>
				<Typography variant='h5' component='h2' gutterBottom>
					Input Bet Details
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
								{loading ? <CircularProgress size={24} /> : 'Analyze Bet'}
							</Button>
						</Grid>
					</Grid>
				</form>
			</Paper>

			{loading && (
				<Box className='loading-container'>
					<CircularProgress />
					<Typography variant='h6' sx={{ ml: 2 }}>
						Analyzing betting data...
					</Typography>
				</Box>
			)}

			{results && !loading && (
				<Box className='results-container'>
					<Typography variant='h5' component='h2' gutterBottom>
						Analysis Results
					</Typography>

					<Grid container spacing={4}>
						<Grid item xs={12} md={6}>
							<Card>
								<CardHeader title='Success Rates' />
								<CardContent>
									<Box height={300}>
										<Bar data={chartData} options={chartOptions} />
									</Box>
								</CardContent>
							</Card>
						</Grid>

						<Grid item xs={12} md={6}>
							<Card>
								<CardHeader title='Summary' />
								<CardContent>
									<Typography variant='body1' gutterBottom>
										<strong>League:</strong> {league}
									</Typography>
									<Typography variant='body1' gutterBottom>
										<strong>Total Matches Analyzed:</strong>{' '}
										{results.total_matches_analyzed}
									</Typography>
									<Typography variant='body1' gutterBottom>
										<strong>Best Bet Options:</strong>{' '}
										{Object.entries(results.success_rates)
											.sort((a, b) => parseInt(b[1]) - parseInt(a[1]))
											.slice(0, 2)
											.map(([bet, rate]) => `${bet} (${rate})`)
											.join(', ')}
									</Typography>
									{results.most_probable_goals && (
										<Typography
											variant='body1'
											gutterBottom
											sx={{ mt: 2, fontWeight: 'bold', color: 'success.main' }}
										>
											<strong>Most Probable Total Goals:</strong>{' '}
											{results.most_probable_goals.count} (
											{results.most_probable_goals.percentage} probability)
										</Typography>
									)}
								</CardContent>
							</Card>
						</Grid>
					</Grid>

					<Box mt={4}>
						<Accordion defaultExpanded>
							<AccordionSummary expandIcon={<ExpandMoreIcon />}>
								<Typography variant='h6'>Goal Distribution Analysis</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<Grid container spacing={3}>
									<Grid item xs={12} md={6}>
										<Typography
											variant='subtitle1'
											gutterBottom
											fontWeight='bold'
										>
											Goal Distribution Table
										</Typography>
										<TableContainer component={Paper} sx={{ maxHeight: 300 }}>
											<Table stickyHeader size='small'>
												<TableHead>
													<TableRow>
														<TableCell>Total Goals</TableCell>
														<TableCell>Number of Matches</TableCell>
														<TableCell>Percentage</TableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													{results.goal_distribution &&
														Object.entries(results.goal_distribution)
															.sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
															.map(([goals, count]) => {
																const percentage = Math.round(
																	(count / results.total_matches_analyzed) * 100
																)
																return (
																	<TableRow
																		key={goals}
																		sx={{
																			bgcolor:
																				parseInt(goals) ===
																				results.most_probable_goals.count
																					? 'rgba(76, 175, 80, 0.1)'
																					: 'inherit',
																		}}
																	>
																		<TableCell>{goals}</TableCell>
																		<TableCell>{count}</TableCell>
																		<TableCell>{percentage}%</TableCell>
																	</TableRow>
																)
															})}
												</TableBody>
											</Table>
										</TableContainer>
									</Grid>
									<Grid item xs={12} md={6}>
										<Typography
											variant='subtitle1'
											gutterBottom
											fontWeight='bold'
										>
											Goal Distribution Chart
										</Typography>
										<Box height={300}>
											{results.goal_distribution && (
												<Bar
													data={{
														labels: Object.keys(results.goal_distribution).sort(
															(a, b) => parseInt(a) - parseInt(b)
														),
														datasets: [
															{
																label: 'Number of Matches',
																data: Object.entries(results.goal_distribution)
																	.sort(
																		(a, b) => parseInt(a[0]) - parseInt(b[0])
																	)
																	.map(([_, count]) => count),
																backgroundColor: Object.entries(
																	results.goal_distribution
																)
																	.sort(
																		(a, b) => parseInt(a[0]) - parseInt(b[0])
																	)
																	.map(([goals, _]) =>
																		parseInt(goals) ===
																		results.most_probable_goals.count
																			? 'rgba(76, 175, 80, 0.8)'
																			: 'rgba(54, 162, 235, 0.6)'
																	),
																borderColor: Object.entries(
																	results.goal_distribution
																)
																	.sort(
																		(a, b) => parseInt(a[0]) - parseInt(b[0])
																	)
																	.map(([goals, _]) =>
																		parseInt(goals) ===
																		results.most_probable_goals.count
																			? 'rgba(76, 175, 80, 1)'
																			: 'rgba(54, 162, 235, 1)'
																	),
																borderWidth: 1,
															},
														],
													}}
													options={{
														responsive: true,
														plugins: {
															legend: {
																position: 'top',
															},
															title: {
																display: true,
																text: 'Match Count by Total Goals',
															},
															tooltip: {
																callbacks: {
																	label: function (context) {
																		const label = context.dataset.label || ''
																		const value = context.parsed.y
																		const percentage = Math.round(
																			(value / results.total_matches_analyzed) *
																				100
																		)
																		return `${label}: ${value} (${percentage}%)`
																	},
																},
															},
														},
														scales: {
															x: {
																title: {
																	display: true,
																	text: 'Total Goals',
																},
															},
															y: {
																beginAtZero: true,
																title: {
																	display: true,
																	text: 'Number of Matches',
																},
															},
														},
													}}
												/>
											)}
										</Box>
									</Grid>
								</Grid>
							</AccordionDetails>
						</Accordion>

						<Accordion sx={{ mt: 2 }}>
							<AccordionSummary expandIcon={<ExpandMoreIcon />}>
								<Typography variant='h6'>Historical Match Data</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<TableContainer component={Paper}>
									<Table>
										<TableHead>
											<TableRow>
												<TableCell>Match</TableCell>
												<TableCell>Date</TableCell>
												<TableCell>Halftime Goals</TableCell>
												<TableCell>Bet Results</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{results.historical_results.map((match, index) => (
												<TableRow key={index}>
													<TableCell>{match.match}</TableCell>
													<TableCell>{match.date}</TableCell>
													<TableCell>{match.halftime_goals}</TableCell>
													<TableCell>
														{Object.entries(match.bet_success).map(
															([bet, success]) => (
																<Box
																	key={bet}
																	sx={{
																		display: 'flex',
																		alignItems: 'center',
																		mb: 0.5,
																	}}
																>
																	<Box
																		sx={{
																			width: 10,
																			height: 10,
																			borderRadius: '50%',
																			bgcolor: success
																				? 'success.main'
																				: 'error.main',
																			mr: 1,
																		}}
																	/>
																	{bet}: {success ? 'Win' : 'Loss'}
																</Box>
															)
														)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
							</AccordionDetails>
						</Accordion>
					</Box>
				</Box>
			)}
		</Box>
	)
}

export default AnalysisPage
