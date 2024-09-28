'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import get_location from '../hooks/get_location';
import { get_fips_code } from '../utils/get_fips_code';

export default function Home() {

  const router = useRouter();
  const { location, error, isLoading, getLocation } = get_location();
  const [fipCode, setFipCode] = useState(null);
  const [fipError, setFipError] = useState(null);

  const handleGetFipCode = async () => {
    if (location.latitude && location.longitude) {
      try {
        const fipCode = await get_fips_code(location.latitude, location.longitude);
        setFipCode(fipCode);

        router.push(`/community?fipCode=${fipCode}`);
      } catch (err) {
        setFipError(err.message);
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
        <button onClick={handleGetFipCode}>Get Fip Code</button>
      )}

      {fipCode && <p>Fip Code: {fipCode}</p>}
      {fipError && <p>Error: {fipError}</p>}
    </div>
  );
}
