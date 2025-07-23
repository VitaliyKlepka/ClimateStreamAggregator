import axios from 'axios';
import { Candlestick, CandlestickApiResponse, LoginResponse } from '../types';

// @ts-ignore
const API_BASE_URL = /*import.meta.env.VITE_API_BASE_URL ||*/ 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// // Interceptor for auth
// api.interceptors.request.use(
//   (config) => {
//     // TODO: Add Authorization header here
//     // const token = getAuthToken();
//     // if (token) {
//     //   config.headers.Authorization = `Bearer ${token}`;
//     // }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

export const apiClient = {

  getCandlesticks: async (
    session: string,
    timeframe: '15m' | '30m' | '1h',
    city: string,
    from?: number,
    to?: number,
    limit?: number
  ): Promise<CandlestickApiResponse> => {
    const params = new URLSearchParams();
    params.append('city', city);
    params.append('timeframe', timeframe);

    from && params.append('from', from.toString());
    to && params.append('to', to.toString());
    limit && params.append('limit', limit.toString());

    const response = await api.get(`/candlesticks?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${session}`
      }
    });
    return response.data;
  },

  getLatestCandlestick: async (
    session: string,
    timeframe: '15m' | '30m' | '1h',
    city: string
  ): Promise<{ success: boolean; data: Candlestick }> => {
    const params = new URLSearchParams();
    params.append('city', city);
    params.append('timeframe', timeframe);

    const response = await api.get(`/candlesticks/latest?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${session}`
      }
    });
    return response.data;
  },

  getCities: async (
    session: string
  ): Promise<{ success: boolean; data: string[] }> => {
    const response = await api.get('/cities', {
      headers: {
        'Authorization': `Bearer ${session}`
      }
    });
    return response.data;
  },

  login: async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {
    try{
      const response = await api.post(`/login`, { email, password });
      return response.data;
    } catch (err: any) {
      console.error("Login error", err);
      const originalError = err?.response?.data?.message;
      throw new Error(originalError || 'Login failed!');
    }
  },

  logout: async (session: string): Promise<void> => {
    console.log("Logout session", session);
    const response = await api.post(`/logout`, undefined, { headers: { 'Authorization': `Bearer ${session}` } });
    console.log("Logout response", response);
    return response.data;
  },

};

export default apiClient;