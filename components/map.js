'use client'; // Ensure the component is rendered on the client side

import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Helper component to fit map bounds
function FitMapBounds({ geoJsonData }) {
  const map = useMap();

  useEffect(() => {
    if (geoJsonData) {
      const geoJsonLayer = L.geoJSON(geoJsonData);
      const bounds = geoJsonLayer.getBounds();
      map.fitBounds(bounds); // Fit the map to the bounds of the GeoJSON data
    }
  }, [geoJsonData, map]);

  return null;
}

export default function MapComponent({ fipCodes }) {
  const [countiesGeoJson, setCountiesGeoJson] = useState(null); // Store the filtered GeoJSON data for the selected counties
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

        // Convert fipCodes to strings and pad them properly
        const fipCodesAsString = fipCodes.map(fipCode => fipCode.toString());

        // Find the specific counties by FIPS codes (combination of STATEFP and COUNTYFP)
        const matchingFeatures = geoJson.features.filter(feature => {
          // Ensure STATEFP and COUNTYFP are padded to the correct length
          const combinedFips = feature.properties.STATEFP + feature.properties.COUNTYFP;

          // Return true if the combined FIPS matches any in the fipCodes array
          return fipCodesAsString.includes(combinedFips);
        });

        if (matchingFeatures.length > 0) {
          // Create a new GeoJSON object with the matching features
          setCountiesGeoJson({
            type: 'FeatureCollection',
            features: matchingFeatures,
          });
        } else {
          throw new Error(`No counties found for the provided FIPS codes`);
        }
      } catch (error) {
        setError(error.message);
      }
    };

    if (fipCodes && fipCodes.length > 0) {
      fetchGeoJson();
    }
  }, [fipCodes]);

  // Function to bind tooltips for each feature
  const onEachFeature = (feature, layer) => {
    const countyName = feature.properties.NAME || 'Unknown County'; 
    layer.bindTooltip(countyName, { sticky: true }); // 'sticky' option ensures the tooltip follows the cursor
  
    // Alternatively, for popups:
    // layer.bindPopup(`County: ${countyName}`);
  };

  return (
    <div style={{ height: '500px', width: '100%' }}>
      {error && <p>Error: {error}</p>} {/* Display error if one occurs */}
      
      <MapContainer center={[37.8, -96]} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'/>

        {countiesGeoJson && (
          <>
            <GeoJSON data={countiesGeoJson} style={{ color: 'blue', weight: 2 }} onEachFeature={onEachFeature}/>
            <FitMapBounds geoJsonData={countiesGeoJson} /> {/* Fit the map to the bounds */}
          </>
        )}
      </MapContainer>
    </div>
  );
}
