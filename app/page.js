'use client'

import { useState } from 'react';
import get_location from '../hooks/get_location';
import { get_fips_code } from '../utils/get_fips_code';

export default function Home() {
  const { location, error, isLoading, getLocation } = get_location();
  const [zipCode, setZipCode] = useState(null);
  const [zipError, setZipError] = useState(null);

  const handleGetZipCode = async () => {
    if (location.latitude && location.longitude) {
      try {
        const zip = await get_fips_code(location.latitude, location.longitude);
        setZipCode(zip);
      } catch (err) {
        setZipError(err.message);
      }
    }
  };

  return (
    <div>
      <h1>Hello World!</h1>
      <button onClick={getLocation}>Get Location</button>
      
      {isLoading && <p>Getting location...</p>}
      {error && <p>Error: {error}</p>}
      
      {location.latitude && location.longitude && (
        <p>
          Location: Latitude {location.latitude}, Longitude {location.longitude}
        </p>
      )}

      {location.latitude && location.longitude && (
        <button onClick={handleGetZipCode}>Get Zip Code</button>
      )}

      {zipCode && <p>Zip Code: {zipCode}</p>}
      {zipError && <p>Error: {zipError}</p>}
    </div>
  );
}
