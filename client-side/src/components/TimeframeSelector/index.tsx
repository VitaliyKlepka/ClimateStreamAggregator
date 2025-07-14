import { FC } from 'react';
import { TIMEFRAMES, Timeframe } from '../../types';

interface TimeframeSelectorProps {
  selectedTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  disabled?: boolean;
}

export const TimeframeSelector: FC<TimeframeSelectorProps> = ({
  selectedTimeframe,
  onTimeframeChange,
  disabled = false,
}) => {
  return (
    <div className="timeframe-selector">
      <label htmlFor="timeframe-select" className="selector-label">
        Timeframe:
      </label>
      <select
        id="timeframe-select"
        value={selectedTimeframe}
        onChange={(e) => onTimeframeChange(e.target.value as Timeframe)}
        disabled={disabled}
        className="selector-input"
      >
        {TIMEFRAMES.map((timeframe: { value: Timeframe; label: string }) => (
          <option key={timeframe.value} value={timeframe.value}>
            {timeframe.label}
          </option>
        ))}
      </select>
    </div>
  );
};