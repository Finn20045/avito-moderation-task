import axios from 'axios';

// Vite перенаправит это на http://localhost:3001/api/v1
export const API_URL = '/api/v1'; 

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});