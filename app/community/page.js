'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const AnotherPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();  // Access the query parameters using useSearchParams
  const col_5_digit_fips_code = searchParams.get('fipCode');

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch data from the API using the hardcoded col_5_digit_fips_code value
        fetch(`/api/retrieve?col_5_digit_fips_code=${col_5_digit_fips_code}&category=health_data`)
        .then((response) => response.json())
        .then((result) => {
            setData(result);
            setLoading(false);
        })
        .catch((error) => {
            setError(error);
            setLoading(false);
        });
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
        </div>
    );
    };

    export default AnotherPage;
