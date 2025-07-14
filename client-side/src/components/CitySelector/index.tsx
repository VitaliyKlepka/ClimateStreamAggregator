import { FC } from 'react';
import { CITIES, City } from '../../types';

import './styles.css';

interface CitySelectorProps {
  selectedCity: City;
  onCityChange: (city: City) => void;
}

export const CitySelector: FC<CitySelectorProps> = ({
  selectedCity,
  onCityChange,
}) => {
  return (
    <div className="city-selector">
      <label htmlFor="city-select" className="selector-label">
        Select City:
      </label>
      <select
        id="city-select"
        value={selectedCity}
        onChange={(e) => onCityChange(e.target.value as City)}
        className="city-select"
      >
        {
          CITIES.map((city: City) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))
        }
      </select>
    </div>
  );
};