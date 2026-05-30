/**
 * API Client Configuration
 * 
 * This file initializes an Axios instance for making HTTP requests to the NestJS backend.
 * It is configured to handle the base URL dynamically and ensure credentials (cookies) 
 * are included in all cross-origin requests.
 */
import axios from "axios";

/**
 * Shared Axios instance for the application.
 * use this for all manual API calls.
 */
export const api = axios.create({
  baseURL:
    `${process.env.NEXT_PUBLIC_API_URL}/api` || "http://localhost:3001/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
