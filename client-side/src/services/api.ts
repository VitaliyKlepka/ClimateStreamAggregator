import axios from 'axios';
import { Candlestick, CandlestickApiResponse } from '../types';

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

// Interceptor for auth
api.interceptors.request.use(
  (config) => {
    // TODO: Add Authorization header here
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

export const candlestickApi = {

  getCandlesticks: async (
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

    const response = await api.get(`/candlesticks?${params.toString()}`);
    return response.data;
  },

  getLatestCandlestick: async (
    timeframe: '15m' | '30m' | '1h',
    city: string
  ): Promise<{ success: boolean; data: Candlestick }> => {
    const params = new URLSearchParams();
    params.append('city', city);
    params.append('timeframe', timeframe);

    const response = await api.get(`/candlesticks/latest?${params.toString()}`);
    return response.data;
  },

  getCities: async (): Promise<{ success: boolean; data: string[] }> => {
    const response = await api.get('/cities');
    return response.data;
  },

};

export default candlestickApi;