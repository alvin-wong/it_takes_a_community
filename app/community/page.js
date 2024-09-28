'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const AnotherPage = () => {
  const searchParams = useSearchParams();
  const col_5_digit_fips_code = searchParams.get('fipCode');  // Get FIPS code from query

  const [data, setData] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch health data from the API
    fetch(`/api/retrieve?col_5_digit_fips_code=${col_5_digit_fips_code}&category=health_data`)
      .then(response => response.json())
      .then(result => {
        setData(result);  // Set health data
        setLoading(false); // Stop loading state
      })
      .catch(error => {
        setError(error);  // Set error if fetching fails
        setLoading(false);
      });
  
    // Fetch resource suggestions based on worst health metrics
    fetch(`/api/resources?col_5_digit_fips_code=${col_5_digit_fips_code}`)
      .then(response => response.json())
      .then(result => {
        console.log("Result", result);
        if (result.error) {
          setError(result.error);  // Handle error response
        } else {
          // Flatten all the resources from the parsed suggestions
          const flattenedResources = result.map(suggestion => suggestion.resources).flat();
          console.log("Flattened Resources", flattenedResources);
          setResources(flattenedResources);  // Set flattened resources
        }
      })
      .catch(error => {
        setError(error);  // Handle any network errors
      });
  
  }, []);
  

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
