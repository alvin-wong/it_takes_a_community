'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createHealthComparisonChart } from '@/lib/charts';

const AnotherPage = () => {
  const searchParams = useSearchParams();
  const col_5_digit_fips_code = searchParams.get('fipCode');  // Get FIPS code from query

  const [data, setData] = useState(null);
  const [nationalAvg, setNationalAvg] = useState(null);
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (col_5_digit_fips_code) {
      // Fetch health data from the API
      fetch(`/api/retrieve?col_5_digit_fips_code=${col_5_digit_fips_code}&category=health_data`)
        .then(response => response.json())
        .then(result => {
          setData(result);
          setLoading(false);
        })
        .catch(error => {
          setError(error);
          setLoading(false);
        });

      // Fetch national average data
      fetch(`/api/average?category=health_data`)
        .then(response => response.json())
        .then(result => {
          setNationalAvg(result);
        })
        .catch(error => {
          setError(error);
        });

      fetch(`/api/resources?col_5_digit_fips_code=${col_5_digit_fips_code}`)  // Use fips5digit as a query param
        .then(response => response.json())
        .then(result => {
          if (result.error) {
            setError(result.error);
          } else {
            setResources(result.suggestions); // Access 'suggestions' directly from the response
          }
        });
    }
  }, [col_5_digit_fips_code]);

  useEffect(() => {
    if (data && nationalAvg) {
      // Create charts after data is loaded and ensure to clear the previous charts
      createHealthComparisonChart(data, nationalAvg, 'adult_smoking_raw_value', 'smokingChart');
      createHealthComparisonChart(data, nationalAvg, 'adult_obesity_raw_value', 'obesityChart');
      createHealthComparisonChart(data, nationalAvg, 'physical_inactivity_raw_value', 'inactivityChart');
    }
  }, [data, nationalAvg]);

  if (loading) {
    return <p>Loading data...</p>;
  }

  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }

  return (
    <div>
      <h2>Health Comparisons for Fulton County</h2>

      <div id="smokingChart"></div>
      <div id="obesityChart"></div>
      <div id="inactivityChart"></div>

      <h2>Suggested Resources:</h2>
      {resources ? (
        resources.map((resource, index) => (
          <div key={index} style={{ marginBottom: '1rem' }}>
            <h3>Resource {index + 1}</h3>
            <p>{resource}</p>  {/* Display each resource */}
          </div>
        ))
      ) : (
        <p>Loading suggestions...</p>
      )}
    </div>
  );
};

export default AnotherPage;
