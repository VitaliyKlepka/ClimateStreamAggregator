import { create } from 'zustand';
import { City, Timeframe, CandlestickFilters } from '../types';

interface CandlestickStore {
  selectedCity: City;
  selectedTimeframe: Timeframe;
  fromTimestamp: number;
  toTimestamp: number;
  isLoading: boolean;
  error: string | null;
  
  setSelectedCity: (city: City) => void;
  setSelectedTimeframe: (timeframe: Timeframe) => void;
  setFromTimestamp: (timestamp: number) => void;
  setToTimestamp: (timestamp: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getFilters: () => CandlestickFilters;
  resetFilters: () => void;
  setTimeRange: (hoursBack: number) => void;
}

const getCurrentTimestamp = (): number => {
  return Date.now();
};

const getHoursAgoTimestamp = (hoursBack: number): number => {
  return Date.now() - (hoursBack * 60 * 60 * 1000);
};

export const useCandlestickStore = create<CandlestickStore>((set, get) => ({
  // Initial state
  selectedCity: 'Berlin',
  selectedTimeframe: '1h',
  fromTimestamp: getHoursAgoTimestamp(24),
  toTimestamp: getCurrentTimestamp(),
  isLoading: false,
  error: null,

  setSelectedCity: (city) => set({ selectedCity: city }),
  setSelectedTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
  setFromTimestamp: (timestamp) => set({ fromTimestamp: timestamp }),
  setToTimestamp: (timestamp) => set({ toTimestamp: timestamp }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  getFilters: () => {
    const state = get();
    return {
      city: state.selectedCity,
      timeframe: state.selectedTimeframe,
      fromTimestamp: state.fromTimestamp,
      toTimestamp: state.toTimestamp,
      limit: 100,
    };
  },

  resetFilters: () => set({
    selectedCity: 'Berlin',
    selectedTimeframe: '1h',
    fromTimestamp: getHoursAgoTimestamp(24),
    toTimestamp: getCurrentTimestamp(),
    error: null,
  }),

  setTimeRange: (hoursBack: number) => set({
    fromTimestamp: getHoursAgoTimestamp(hoursBack),
    toTimestamp: getCurrentTimestamp(),
  }),
}));