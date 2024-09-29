'use client';

import { useRouter } from 'next/navigation';
import useGeolocation from '../hooks/get_location'; // Import the updated useGeolocation
import dynamic from 'next/dynamic';

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import('../components/map'), { ssr: false });
//comment

export default function Home() {
  const router = useRouter();
  const { location, fipsCode, error, isLoading, getLocation } = useGeolocation(); 

  return (
    <div className='page'>
      <div className='background-graphics'>
        <img src='./Asset 1.svg' className='asset1' />
        <img src='./Asset 2.svg' className='asset2' />
        <img src='./Asset 3.svg' className='asset3' />
        <img src='./Asset 4.svg' className='asset4' />
      </div>

      <div className='description-container'>
        <div className='itac-description'>
          <h1 className='heading'>DISCOVER YOUR COMMUNITY</h1>

          <p className='statement'>It Takes A Community is a project meant 
            <br></br>to connect people with their community by 
            <br></br>providing key insights about demographics, 
            <br></br>education, and healthcare. 
            <br></br>
            <br></br>Click the button below to get started!
            </p>
        </div>
        <button onClick={getLocation} className = "get-location">Get Location</button>
      </div>

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
