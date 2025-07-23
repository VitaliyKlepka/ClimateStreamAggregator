import { FC } from 'react';
import { useCandlestickStore } from '../../store/useCandlestickStore';
import { CandlestickChart } from '../../components/CandlestickChart';
import { CitySelector } from '../../components/CitySelector';

import './styles.scss';
import { useCandlesticks } from '../../utils/useCandlesticks';
import { TimeframeSelector } from '../../components/TimeframeSelector';
import { useLogout } from '../../utils/useLogout';
import { useAppStore } from '../../store/useAppStore';

const AppContent: FC = () => {
  const { userSession, setUserSession, setUser } = useAppStore((state) => state);
  const {
    selectedCity,
    selectedTimeframe,
    fromTimestamp,
    toTimestamp,
    setSelectedCity,
    setSelectedTimeframe,
  } = useCandlestickStore();
    
  const {
    data: candlestickData,
    isLoading,
    isError,
    error,
    refetch,
  } = useCandlesticks(
    selectedTimeframe,
    selectedCity,
    fromTimestamp,
    toTimestamp,
    100,
    true
  );
  
  const handleRefresh = () => {
    refetch();
  };

  const logoutMutation = useLogout(() => {
    setUserSession(null);
    setUser(null);
  });
  
  return (
    <div className="app">
      <header className="app-header">
        <span>Climate Event Stream Aggregation</span>
        <button className="logout-button" onClick={() => logoutMutation.mutate({ session: userSession || '' })}>Logout</button>
      </header>

      <main className="app-main">
        <div className="controls-panel">
          <div className="controls-row">
            <CitySelector
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
            />
            
            <TimeframeSelector
              selectedTimeframe={selectedTimeframe}
              onTimeframeChange={setSelectedTimeframe}
              disabled={isLoading}
            />
            
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="refresh-button"
            >
              {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>

          <div className="filters-info">
            <span className="filter-item">
              <strong>{selectedCity}</strong>
            </span>
            <span className="filter-item">
              [<strong>{selectedTimeframe}</strong>]
            </span>
            <span className="filter-item">
              (<strong>{candlestickData?.data?.length || 0}</strong> candles)
            </span>
            <span className="filter-item">
              <strong>{new Date(fromTimestamp).toLocaleDateString()}</strong> - <strong>{new Date(toTimestamp).toLocaleDateString()}</strong>
            </span>
          </div>
        </div>

        {isError && (
          <div className="error-panel">
            <h3>Error Loading Data</h3>
            <p>{error?.message || 'Failed to load candlestick data'}</p>
            <button onClick={handleRefresh} className="retry-button">
              Retry
            </button>
          </div>
        )}

        <div className="chart-section">
          <CandlestickChart
            data={candlestickData?.data || []}
            city={selectedCity}
            timeframe={selectedTimeframe}
            isLoading={isLoading}
          />
        </div>
      </main>

      <footer className="app-footer"></footer>
    </div>
  );
};

export default AppContent;
