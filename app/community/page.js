'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createHealthComparisonChart } from '@/lib/charts';

const AnotherPage = () => {
  const searchParams = useSearchParams();
  const col_5_digit_fips_code = searchParams.get('fipCode');  // Get FIPS code from query

  const [data, setData] = useState(null);
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

      // Fetch resource suggestions based on worst health metrics
      fetch(`/api/resources?col_5_digit_fips_code=${col_5_digit_fips_code}`)  // Use fips5digit as a query param
        .then(response => response.json())
        .then(result => {
          if (result.error) {
            setError(result.error);
          } else {
            setResources(result.suggestions); // Access 'suggestions' directly from the response
          }
        })
        .catch(error => {
          setError(error);
        });
    }
  }, [col_5_digit_fips_code]);

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
      {resources.length > 0 ? (
        resources.map((resource, index) => (
          <div key={index} style={{ marginBottom: '1rem' }}>
            <h3>Resource {index + 1}</h3>
            <p>Title: {resource.title}</p>
            <p>Description:  {resource.description}</p>
            <p>How it helps: {resource.how_it_helps}</p>
            <a href={resource.link} target="_blank" rel="noopener noreferrer">
              {resource.link}
            </a>
          </div>
        ))
      ) : (
        <p>No resources found.</p>
      )}
    </div>
  );
};

export default AnotherPage;
