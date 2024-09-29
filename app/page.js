'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useGeolocation from '../hooks/get_location'; // Import the updated useGeolocation
import dynamic from 'next/dynamic';
import { LinearProgress, TextField, Button } from '@mui/material'; // Import Material-UI components

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import('../components/map'), { ssr: false });

export default function Home() {
  const router = useRouter();
  const { location, fipsCode, error, isLoading, getLocation } = useGeolocation();
  const [countyName, setCountyName] = useState('');
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const handleCountySearch = async () => {
    if (!countyName) {
      setSearchError('Please enter a county name.');
      return;
    }

    setSearchError('');
    setSearchLoading(true);

    try {
      const response = await fetch(`/api/getFips?category=health_data&county_name=${encodeURIComponent(countyName)}`);
      const result = await response.json();

      if (response.ok) {
        router.push(`/community?fipCode=${result.fipsCode}`);
      } else {
        setSearchError(result.error || 'No FIPS code found for the provided county.');
      }
    } catch (err) {
      setSearchError('An error occurred while fetching the FIPS code.');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className='page'>
      <div className='body-container'>
        <div className='description-container'>
          <div className='itac-description'>
            <h1 className='heading'>DISCOVER YOUR COMMUNITY</h1>

            <p className='statement'>
              <i>It Takes A Community</i> is a project intended
              <br /> to connect people with their community by
              <br /> providing key insights about demographics,
              <br /> education, and healthcare.
              <br />
              <br /> Click the button below to get started!
            </p>
          </div>

          {/* New container for the buttons */}
          <div className="button-container">
            <button onClick={getLocation} className="get-location">Get Location</button>
            {fipsCode && (
              <button onClick={() => router.push(`/community?fipCode=${fipsCode}`)} className='community-button'>
                Explore Community
              </button>
            )}
          </div>

          {/* Search bar for county input */}
          <div className="search-bar">
            <TextField
              label="Enter County Name"
              variant="outlined"
              value={countyName}
              onChange={(e) => setCountyName(e.target.value)}
              fullWidth
            />
            <button className='search-button'
              onClick={handleCountySearch}
              color="primary"
              disabled={searchLoading}
              style={{ marginTop: '20px' }}
            >
              {searchLoading ? 'Searching...' : 'Search County'}
            </button>
            {searchError && <p style={{ color: 'red' }}>{searchError}</p>}
          </div>

        </div>

        {isLoading && (
          <div style={{ width: '100%', marginTop: '20px' }}>
            <p>Getting location...</p>
            <LinearProgress className='progress-bar' />
          </div>
        )}

        <div className='map-container'>
          {fipsCode &&
            <MapComponent fipCodes={[fipsCode]} />
          }
        </div>
      </div>
    </div>
  );
}
