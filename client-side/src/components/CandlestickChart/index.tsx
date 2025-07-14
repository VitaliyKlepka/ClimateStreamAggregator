import { FC } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { Candlestick, Timeframe } from '../../types';
import { formatTemperature } from '../../utils';

// Register Chart.js components including candlestick
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement
);

interface CandlestickChartProps {
  data: Candlestick[];
  city: string;
  timeframe: Timeframe;
  isLoading?: boolean;
}

export const CandlestickChart: FC<CandlestickChartProps> = ({
  data,
  city,
  timeframe,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="chart-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading {timeframe} chart data for {city}...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="chart-container">
        <div className="no-data">
          <h3>📊 No Data Available</h3>
          <p>No {timeframe} candlestick data available for {city}</p>
          <p>Try selecting a different time range or city.</p>
        </div>
      </div>
    );
  }

  // Convert candlestick data to financial chart format
  const candlestickData = data.map(candle => ({
    x: candle.timestamp,
    o: Number(candle.open),
    h: Number(candle.high),
    l: Number(candle.low),
    c: Number(candle.close),
  }));

  // Get timeframe-specific formatting
  const getTimeFormat = (timeframe: Timeframe) => {
    switch (timeframe) {
      case '15m': return 'MMM dd HH:mm';
      case '30m': return 'MMM dd HH:mm';
      case '1h': return 'MMM dd HH:mm';
      default: return 'MMM dd HH:mm';
    }
  };

  const getTimeUnit = (timeframe: Timeframe) => {
    switch (timeframe) {
      case '15m': return 'minute' as const;
      case '30m': return 'minute' as const;
      case '1h': return 'hour' as const;
      default: return 'hour' as const;
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: `${city} Temperature - ${timeframe.toUpperCase()} Candlesticks`,
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            const timestamp = context[0].parsed.x;
            return new Date(timestamp).toLocaleString();
          },
          label: (context: any) => {
            const point = context.parsed;
            return [
              `Open: ${formatTemperature(point.o)}`,
              `High: ${formatTemperature(point.h)}`,
              `Low: ${formatTemperature(point.l)}`,
              `Close: ${formatTemperature(point.c)}`,
            ];
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#26a69a',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: getTimeUnit(timeframe),
          displayFormats: {
            minute: getTimeFormat(timeframe),
            hour: getTimeFormat(timeframe),
          },
        },
        title: {
          display: true,
          text: 'Time',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const chartData = {
    datasets: [
      {
        label: `${timeframe.toUpperCase()} OHLC`,
        data: candlestickData,
        borderColor: '#26a69a',
        backgroundColor: 'rgba(38, 166, 154, 0.8)',
        borderWidth: 1,
        color: {
          up: '#26a69a',    // Green for bullish candles
          down: '#ef5350',  // Red for bearish candles
          unchanged: '#999', // Gray for unchanged
        },
        borderColorUp: '#26a69a',
        borderColorDown: '#ef5350',
        backgroundColorUp: 'rgba(38, 166, 154, 0.8)',
        backgroundColorDown: 'rgba(239, 83, 80, 0.8)',
      },
    ],
  };

  // Calculate statistics
  const latestCandle = data[data.length - 1];
  const highestTemp = Math.max(...data.map(d => d.high));
  const lowestTemp = Math.min(...data.map(d => d.low));
  const avgClose = data.reduce((sum, d) => sum + d.close, 0) / data.length;
  const totalVolume = data.reduce((sum, d) => sum + (d.volume || 1), 0);

  // Calculate price change
  const firstCandle = data[0];
  const priceChange = latestCandle && firstCandle ? latestCandle.close - firstCandle.open : 0;
  const priceChangePercent = firstCandle ? (priceChange / firstCandle.open) * 100 : 0;

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <Chart type="candlestick" data={chartData} options={options} />
      </div>
      
      <div className="chart-stats">
        <div className="stats-grid">
          <div className="stat-group">
            <h4>📊 Data Overview</h4>
            <div className="stat">
              <span className="stat-label">Timeframe:</span>
              <span className="stat-value">{timeframe.toUpperCase()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Candles:</span>
              <span className="stat-value">{data.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Volume:</span>
              <span className="stat-value">{totalVolume.toLocaleString()}</span>
            </div>
          </div>

          <div className="stat-group">
            <h4>🌡️ Temperature Stats</h4>
            <div className="stat">
              <span className="stat-label">Current:</span>
              <span className="stat-value">
                {latestCandle ? formatTemperature(latestCandle.close) : 'N/A'}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Highest:</span>
              <span className="stat-value">{formatTemperature(highestTemp)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Lowest:</span>
              <span className="stat-value">{formatTemperature(lowestTemp)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Average:</span>
              <span className="stat-value">{formatTemperature(avgClose)}</span>
            </div>
          </div>

          <div className="stat-group">
            <h4>📈 Change</h4>
            <div className="stat">
              <span className="stat-label">Change:</span>
              <span className={`stat-value ${priceChange >= 0 ? 'positive' : 'negative'}`}>
                {priceChange >= 0 ? '+' : ''}{formatTemperature(priceChange)}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Change %:</span>
              <span className={`stat-value ${priceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Last Update:</span>
              <span className="stat-value">
                {latestCandle ? new Date(latestCandle.timestamp).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};