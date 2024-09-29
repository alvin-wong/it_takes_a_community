'use client';

import { useRouter } from 'next/navigation';
import useGeolocation from '../hooks/get_location'; // Import the updated useGeolocation
import dynamic from 'next/dynamic';
import { LinearProgress } from '@mui/material'; // Import LinearProgress from Material-UI

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import('../components/map'), { ssr: false });

export default function Home() {
  const router = useRouter();
  const { location, fipsCode, error, isLoading, getLocation } = useGeolocation(); 

  return (
    <div className='page'>
      <div className='body-container'>
        <div className='description-container'>
          <div className='itac-description'>
            <h1 className='heading'>DISCOVER YOUR COMMUNITY</h1>

            <p className='statement'> <i>It Takes A Community</i> is a project intended 
              <br></br>to connect people with their community by 
              <br></br>providing key insights about demographics, 
              <br></br>education, and healthcare. 
              <br></br>
              <br></br>Click the button below to get started!
            </p>
          </div>
          <button onClick={getLocation} className="get-location">Get Location</button>
        </div>

        {isLoading && (
          <div style={{ width: '100%', marginTop: '20px' }}>
            <p>Getting location...</p>
            <LinearProgress className='progress-bar'/>
          </div>
        )}

        <div className='map-container'>
          {fipsCode && 
            <MapComponent fipCodes={[fipsCode]} />
          }
        </div>

        {fipsCode && (
          <button onClick={() => router.push(`/community?fipCode=${fipsCode}`)} className='community-button'>
            Go to Community
          </button>
        )}
      </div>
    </div>
  );
}
