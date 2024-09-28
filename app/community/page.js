'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const AnotherPage = () => {
  const router = useRouter();
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
      fetch(`/api/resources/${col_5_digit_fips_code}`)
        .then(response => response.json())
        .then(result => {
          setResources(result.suggestions); // assuming suggestions is in result.suggestions
        })
        .catch(error => {
          console.error('Error fetching resources:', error);
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
      <p>FIPS 5-Digit Code: {col_5_digit_fips_code}</p>
      <h2>Health Data:</h2>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>No data found.</p>
      )}

      <h2>Suggested Resources:</h2>
      {resources ? (
        resources.map((resource, index) => (
          <div key={index}>
            <h3>{resource.metric}</h3>
            <p>{resource.text}</p>  {/* Display ChatGPT-generated suggestions */}
          </div>
        ))
      ) : (
        <p>Loading suggestions...</p>
      )}
    </div>
  );
};

export default AnotherPage;
