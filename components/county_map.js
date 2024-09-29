'use client';

import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useCallback } from 'react';
import L from 'leaflet';

// Helper component to fit map bounds
function FitMapBounds({ geoJsonData }) {
  const map = useMap();

  useEffect(() => {
    if (geoJsonData) {
      const geoJsonLayer = L.geoJSON(geoJsonData);
      const bounds = geoJsonLayer.getBounds();
      map.fitBounds(bounds);
    }
  }, [geoJsonData, map]);

  return null;
}

export default function CountyMapComponent({ 
  fipCodes, 
  stateGeoJson, 
  fiveWorst, 
  fiveBest, 
  neighboringCounties, 
  neighboringFipCodes, 
  neighboringFipData 
}) {

  // Helper function to format the metric name: remove "raw", replace _ with spaces, and title-case
  const formatMetricName = (metric) => {
    return metric
      .replace(/raw/i, '') // Remove "raw" (case insensitive)
      .replace(/_/g, ' ')  // Replace underscores with spaces
      .trim()              // Remove leading/trailing spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Title case
  };

  const displayMetrics = useCallback((metrics, relevantMetrics) => {
    if (!metrics || Object.keys(metrics).length === 0) return "No data available";
    
    let metricString = ``;
    for (const metric of relevantMetrics) {
      if (metrics.hasOwnProperty(metric)) {
        const formattedMetric = formatMetricName(metric);
        metricString += `${formattedMetric}: ${metrics[metric]}<br/>`;
      }
    }
    return metricString;
  }, []);

  const handleMouseOver = useCallback((e, feature) => {
    const layer = e.target;
    const combinedFips = `${feature.properties.STATEFP}${feature.properties.COUNTYFP}`;
    
    let tooltipContent = `<strong>${feature.properties.NAME || 'Unknown County'}</strong><br/>`;

    // Show best and worst metrics only for the target FIP code
    if (combinedFips === fipCodes[0]) {
      tooltipContent += `<strong>Top 5 Metrics:</strong><br/>`;
      tooltipContent += displayMetrics(fiveBest, Object.keys(fiveBest));
      tooltipContent += `<br/><strong>Worst 5 Metrics:</strong><br/>`;
      tooltipContent += displayMetrics(fiveWorst, Object.keys(fiveWorst));
    } else if (neighboringFipCodes.includes(combinedFips)) {
      // For neighboring counties, show relevant metrics only if data is available
      const countyData = neighboringFipData[combinedFips];
      if (countyData) {
        tooltipContent += `<strong>Data for Neighboring County:</strong><br/>`;
        tooltipContent += `<strong>Comparing Metrics against Neighboring County...</strong><br/>`;
        tooltipContent += displayMetrics(countyData, [...Object.keys(fiveBest)]);
        tooltipContent += `<strong>Comparing Metrics against Neighboring County</strong><br/>`;
        tooltipContent += displayMetrics(countyData, [...Object.keys(fiveWorst)]);
    
      } else {
        tooltipContent += `No data available for this neighboring county.`;
      }
    }

    layer.bindTooltip(tooltipContent, { sticky: true }).openTooltip();
  }, [fipCodes, fiveBest, fiveWorst, neighboringFipCodes, neighboringFipData, displayMetrics]);

  const handleMouseOut = useCallback((e) => {
    const layer = e.target;
    layer.unbindTooltip();
  }, []);

  const onEachFeature = useCallback((feature, layer) => {
    layer.on({
      mouseover: (e) => handleMouseOver(e, feature),
      mouseout: (e) => handleMouseOut(e),
    });
  }, [handleMouseOver, handleMouseOut]);

  // Function to style the features based on whether it's the target FIP code or neighboring FIPs
  const styleFeature = useCallback((feature) => {
    const combinedFips = `${feature.properties.STATEFP}${feature.properties.COUNTYFP}`;
    if (combinedFips === fipCodes[0]) {
      // Target FIP code - color it green
      return { color: 'green', weight: 2 };
    } else if (neighboringFipCodes.includes(combinedFips)) {
      // Neighboring counties - color them red
      return { color: 'red', weight: 2 };
    } else {
      return { color: 'gray', weight: 1 }; // Default style (if any other county gets rendered)
    }
  }, [fipCodes, neighboringFipCodes]);

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapContainer center={[37.8, -96]} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {neighboringCounties.length > 0 && (
          <GeoJSON 
            data={{ type: 'FeatureCollection', features: neighboringCounties }} 
            style={styleFeature} // Apply the dynamic style
            onEachFeature={onEachFeature}
          />
        )}

        {stateGeoJson && (
          <>
            <GeoJSON 
              data={stateGeoJson} 
              style={styleFeature} // Apply the dynamic style
              onEachFeature={onEachFeature}
            />
            <FitMapBounds geoJsonData={stateGeoJson} />
          </>
        )}

      </MapContainer>
    </div>
  );
}
