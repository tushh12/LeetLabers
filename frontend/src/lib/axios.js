import axios from "axios";

// Check if we are running locally or on the live internet
const isDevelopment = import.meta.env.MODE === 'development';

// Use localhost for dev, and Render for production!
const API_URL = isDevelopment 
    ? "http://localhost:8080/api/v1" 
    : "https://leetlabers.onrender.com/api/v1";

export const axiosInstance = axios.create({
    baseURL: API_URL, 
    withCredentials: true,
});