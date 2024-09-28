'use client'

import { useState, useEffect} from 'react';

const getZipCode = async (latitude, longitude) => {
  const response = await fetch(`/api/get-zipcode?latitude=${latitude}&longitude=${longitude}`);
  const data = await response.json();
  if (response.ok) {
    console.log('Zip Code:', data.zipcode);
  } else {
    console.error('Error:', data.error);
  }
};

export default function Home() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLoading(false);
          console.log(location)
        },
        (err) => {
          setError(err.message);
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location.latitude && location.longitude) {
      console.log(location);
    }
  }, [location]);

  return (
    <div>
      <h1>Hello World!</h1>
      <button onClick={handleGetLocation}>Get Location</button>
      
      {isLoading && <p>Getting location...</p>}
      
      {error && <p>Error: {error}</p>}
      
      {location.latitude && location.longitude && (
        <p>
          Location: Latitude {location.latitude}, Longitude {location.longitude}
        </p>
      )}
    </div>
  );
}
