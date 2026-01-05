/**
 * API Configuration
 * 
 * Reads API base URL from environment variable with fallback to localhost for development.
 * Set REACT_APP_API_BASE_URL in .env or as environment variable for different environments.
 */

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'

