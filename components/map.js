'use client'; // Ensure the component is rendered on the client side

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { match } from 'assert';

export default function MapComponent({ fipCodes }) {
  console.log("Logging fipcodes", fipCodes)
  const [countiesGeoJson, setCountiesGeoJson] = useState(null); // Store the GeoJSON data for the selected counties
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGeoJson = async () => {
      try {
        // Fetch the full GeoJSON file from the public directory
        const response = await fetch('/counties.geojson'); // Adjust the file name if needed
        if (!response.ok) {
          throw new Error('Failed to load GeoJSON data');
        }

        const geoJson = await response.json();

        // Find the specific counties by FIPS codes (combination of STATEFP and COUNTYFP)
        const matchingFeatures = geoJson.features.filter(feature => {
          const combinedFips = feature.properties.STATEFP + feature.properties.COUNTYFP;
          return fipCodes.includes(combinedFips);
        });
        console.log("Matching Features", matchingFeatures)

        if (matchingFeatures.length > 0) {
          // Create a new GeoJSON object with the matching features
          setCountiesGeoJson({
            type: "FeatureCollection",
            features: matchingFeatures
          });
        } else {
          throw new Error(`No counties found for the provided FIPS codes`);
        }
      } catch (error) {
        setError(error.message);
      }
    };

    console.log(fipCodes)
    if (fipCodes && fipCodes.length > 0) {
      fetchGeoJson();
    }
  }, [fipCodes]);

  return (
    <div style={{ height: '500px', width: '100%' }}>
      {error && <p>Error: {error}</p>} {/* Display error if one occurs */}
      
      <MapContainer center={[37.8, -96]} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Render the GeoJSON data for the selected counties if it exists */}
        {countiesGeoJson && (
          <GeoJSON data={countiesGeoJson} style={{ color: 'blue', weight: 2 }} />
        )}
      </MapContainer>
    </div>
  );
}
