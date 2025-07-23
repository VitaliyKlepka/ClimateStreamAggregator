import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { Candlestick, CandlestickApiResponse } from '../types';
import { useAppStore } from '../store/useAppStore';

export const useCandlesticks = (
  timeframe: '15m' | '30m' | '1h',
  city: string,
  from?: number,
  to?: number,
  limit?: number,
  enabled: boolean = true
): UseQueryResult<CandlestickApiResponse, Error> => {
  const { userSession } = useAppStore((state) => state);
  console.log("[DBUG]::User session", userSession);
  const staleTime = timeframe === '15m' ? 30000 : timeframe === '30m' ? 60000 : 300000;
  const refetchInterval = timeframe === '15m' ? 60000 : timeframe === '30m' ? 120000 : 300000;

  return useQuery({
    queryKey: ['candlesticks', timeframe, city, from, to, limit],
    queryFn: () => apiClient.getCandlesticks(userSession || '', timeframe, city, from, to, limit),
    enabled: enabled && !!city,
    staleTime,
    refetchInterval,
  });
};

export const useLatestCandlestick = (
  timeframe: '15m' | '30m' | '1h',
  city: string,
  enabled: boolean = true
): UseQueryResult<{ success: boolean; data: Candlestick }, Error> => {
  const { userSession } = useAppStore((state) => state);
  return useQuery({
    queryKey: ['candlesticks', timeframe, 'latest', city],
    queryFn: () => apiClient.getLatestCandlestick(userSession || '', timeframe, city),
    enabled: enabled && !!city,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

export const useCities = (): UseQueryResult<{ success: boolean; data: string[] }, Error> => { 
  const { userSession } = useAppStore((state) => state);
  return useQuery({
    queryKey: ['cities'],
    queryFn: () => apiClient.getCities(userSession || ''),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
