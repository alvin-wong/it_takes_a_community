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

      <button onClick={getLocation}>Get Location</button>

      {isLoading && 
        <p>Getting location...</p>
      }

      {fipsCode &&
        <MapComponent fipCodes={[fipsCode]}
      />}

      {fipsCode && (
        <button onClick={() => router.push(`/community?fipCode=${fipsCode}`)}>
          Go to Community
        </button>
      )}
    </div>
  );
}
