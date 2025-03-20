import { Container } from '@mui/material'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminRoute from './components/AdminRoute'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import UnifiedNavigation from './components/UnifiedNavigation'
import FulltimeAnalysisPage from './pages/FullTimeAnalysisPage'
import AdminSetupPage from './pages/AdminSetupPage'
import GoalPredictionPage from './pages/GoalPredictionPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'
import UploadPage from './pages/UploadPage'

function App() {
	return (
		<>
			<UnifiedNavigation />
			<Routes>
				<Route
					path='/'
					element={
						<div className='app'>
							<Container
								maxWidth='lg'
								sx={{ py: 4, minHeight: 'calc(100vh - 140px)' }}
							>
								<HomePage />
							</Container>
							<Footer />
						</div>
					}
				/>
				<Route element={<ProtectedRoute />}>
					<Route
						path='/fulltime-analysis'
						element={
							<div className='app'>
								<Container
									maxWidth='lg'
									sx={{ py: 4, minHeight: 'calc(100vh - 140px)' }}
								>
									<FulltimeAnalysisPage />
								</Container>
								<Footer />
							</div>
						}
					/>
					\t{' '}
					<Route
						path='/goal-prediction'
						element={
							<div className='app'>
								<Container
									maxWidth='lg'
									sx={{ py: 4, minHeight: 'calc(100vh - 140px)' }}
								>
									<GoalPredictionPage />
								</Container>
								<Footer />
							</div>
						}
					/>
					\t{' '}
					<Route
						path='/upload'
						element={
							<div className='app'>
								<Container
									maxWidth='lg'
									sx={{ py: 4, minHeight: 'calc(100vh - 140px)' }}
								>
									<UploadPage />
								</Container>
								<Footer />
							</div>
						}
					/>
				</Route>
				<Route
					path='/login'
					element={
						<div className='app'>
							<Container
								maxWidth='lg'
								sx={{ py: 4, minHeight: 'calc(100vh - 140px)' }}
							>
								<LoginPage />
							</Container>
							<Footer />
						</div>
					}
				/>
				<Route
					path='/admin-setup'
					element={
						<div className='app'>
							<Container
								maxWidth='lg'
								sx={{ py: 4, minHeight: 'calc(100vh - 140px)' }}
							>
								<AdminSetupPage />
							</Container>
							<Footer />
						</div>
					}
				/>
				<Route element={<AdminRoute />}>
					<Route
						path='/register'
						element={
							<div className='app'>
								<Container
									maxWidth='lg'
									sx={{ py: 4, minHeight: 'calc(100vh - 140px)' }}
								>
									<RegisterPage />
								</Container>
								<Footer />
							</div>
						}
					/>
				</Route>
				<Route
					path='*'
					element={
						<div className='app'>
							<Container
								maxWidth='lg'
								sx={{ py: 4, minHeight: 'calc(100vh - 140px)' }}
							>
								<NotFoundPage />
							</Container>
							<Footer />
						</div>
					}
				/>
			</Routes>
		</>
	)
}

export default App
