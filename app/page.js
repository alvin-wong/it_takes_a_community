'use client';

import { useRouter } from 'next/navigation';
import useGeolocation from '../hooks/get_location'; // Import the updated useGeolocation
import dynamic from 'next/dynamic';

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import('../components/map'), { ssr: false });

export default function Home() {
  const router = useRouter();
  const { location, fipsCode, error, isLoading, getLocation } = useGeolocation(); 

  return (
    <div>
      <h1>It takes a community!</h1>

      {/* Trigger fetching the location */}
      <button onClick={getLocation}>Get Location</button>

      {isLoading && <p>Getting location...</p>}
      {error && <p>Error: {error}</p>}

      {/* Display the location if available */}
      {location.latitude && location.longitude && (
        <p>
          Location: Latitude {location.latitude}, Longitude {location.longitude}
        </p>
      )}

      {/* Display FIPS code if available */}
      {fipsCode && <p>Fip Code: {fipsCode}</p>}

      {/* Render the MapComponent only if we have the fipsCode */}
      {fipsCode && <MapComponent fipCodes={[fipsCode]} />}

      {/* Optional: you can use the router to navigate somewhere based on the fipCode */}
      {fipsCode && (
        <button onClick={() => router.push(`/community?fipCode=${fipsCode}`)}>
          Go to Community
        </button>
      )}
    </div>
  );
}
