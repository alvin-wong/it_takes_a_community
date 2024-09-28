import { useState } from 'react';
import { get_fips_code } from '../utils/get_fips_code';

export default function useGeolocation() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [fipsCode, setFipsCode] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          console.log("Lat, lon", latitude, longitude)
          
          setLocation({ latitude, longitude });

          try {
            const fips = await get_fips_code(latitude, longitude);
            setFipsCode(fips);  // Save the FIPS code in state
          } catch (fipsError) {
            setError(`Error fetching FIPS code: ${fipsError.message}`);
          }

          setIsLoading(false);
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

  return { location, fipsCode, error, isLoading, getLocation };
}
