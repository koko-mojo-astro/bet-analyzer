import axios from 'axios'
import { API_URL } from '../config'

// Create an axios instance with the base URL from environment
const api = axios.create({
	baseURL: API_URL,
})

export default api
