'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { getTopWorstPercentiles } from "../utils/percentiles";

const CountyMapComponent = dynamic(() => import('./county_map'), { ssr: false });

const CountyMapPageComponent = ({ fipCode = '13121' }) => {
    const [fipCodes] = useState([fipCode]); // Use the passed fipCode prop
    const [mapData, setMapData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchGeoJsonData = useCallback(async () => {
        const response = await fetch('/counties.geojson');
        if (!response.ok) throw new Error('Failed to load GeoJSON data');
        return await response.json();
    }, []);

    const processGeoJsonData = useCallback((geoJson, targetFipCode) => {
        const targetCounty = geoJson.features.find(feature => {
            const combinedFips = feature.properties.STATEFP + feature.properties.COUNTYFP;
            return combinedFips === targetFipCode;
        });

        if (!targetCounty) throw new Error('Target county not found');
        
        const [targetLng, targetLat] = targetCounty.geometry.coordinates[0][0];
        const minLat = targetLat - 0.5, maxLat = targetLat + 1, minLng = targetLng - 0.75, maxLng = targetLng + 0.75;

        const filteredFeatures = geoJson.features.filter(feature => {
            const [lng, lat] = feature.geometry.coordinates[0][0];
            return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
        });

        const neighboring = filteredFeatures.filter(feature => {
            const combinedFips = feature.properties.STATEFP + feature.properties.COUNTYFP;
            return combinedFips !== targetFipCode;
        });

        const neighboringFips = neighboring.map(feature => 
            feature.properties.STATEFP + feature.properties.COUNTYFP
        );

        // Add target county to neighboring data
        neighboring.push(targetCounty);
        neighboringFips.push(targetFipCode);

        return {
            stateGeoJson: { type: 'FeatureCollection', features: filteredFeatures },
            neighboringCounties: neighboring,
            neighboringFipCodes: neighboringFips
        };
    }, []);

    const fetchAllData = useCallback(async () => {
        try {
            setIsLoading(true);
            const targetFipCode = fipCodes[0].toString();

            // Fetch percentiles
            const [worstResult, bestResult] = await Promise.all([
                getTopWorstPercentiles(targetFipCode, true),
                getTopWorstPercentiles(targetFipCode, false)
            ]);

            const fiveWorst = worstResult.reduce((acc, [metric, percentile]) => {
                acc[metric] = percentile;
                return acc;
            }, {});

            const fiveBest = bestResult.reduce((acc, [metric, percentile]) => {
                acc[metric] = percentile;
                return acc;
            }, {});

            // Fetch and process GeoJSON data
            const geoJson = await fetchGeoJsonData();
            const { stateGeoJson, neighboringCounties, neighboringFipCodes } = processGeoJsonData(geoJson, targetFipCode);

            // Fetch neighboring county data (including target county data now)
            const queryString = neighboringFipCodes.map(fips => `col_5_digit_fips_code=${fips}`).join('&');
            const neighboringDataResponse = await fetch(`/api/retrieve_multi?${queryString}&category=health_data`);
            if (!neighboringDataResponse.ok) {
                throw new Error('Failed to fetch neighboring counties data');
            }
            const neighboringFipData = await neighboringDataResponse.json();

            setMapData({
                fipCodes,
                stateGeoJson,
                fiveWorst,
                fiveBest,
                neighboringCounties,
                neighboringFipCodes,
                neighboringFipData
            });

        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }, [fipCodes, fetchGeoJsonData, processGeoJsonData]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            {mapData && <CountyMapComponent {...mapData} />}
        </div>
    );
};

export default CountyMapPageComponent;
