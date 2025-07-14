import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { candlestickApi } from '../services/api';
import { Candlestick, CandlestickApiResponse } from '../types';

export const useCandlesticks = (
  timeframe: '15m' | '30m' | '1h',
  city: string,
  from?: number,
  to?: number,
  limit?: number,
  enabled: boolean = true
): UseQueryResult<CandlestickApiResponse, Error> => {
  const staleTime = timeframe === '15m' ? 30000 : timeframe === '30m' ? 60000 : 300000;
  const refetchInterval = timeframe === '15m' ? 60000 : timeframe === '30m' ? 120000 : 300000;

  return useQuery({
    queryKey: ['candlesticks', timeframe, city, from, to, limit],
    queryFn: () => candlestickApi.getCandlesticks(timeframe, city, from, to, limit),
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
  return useQuery({
    queryKey: ['candlesticks', timeframe, 'latest', city],
    queryFn: () => candlestickApi.getLatestCandlestick(timeframe, city),
    enabled: enabled && !!city,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

export const useCities = (): UseQueryResult<{ success: boolean; data: string[] }, Error> => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: () => candlestickApi.getCities(),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
