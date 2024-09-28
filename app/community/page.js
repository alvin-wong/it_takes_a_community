    'use client'

    import { useEffect, useState } from 'react';

    const AnotherPage = () => {
    // Hardcoded fips5digit value
    const fips5digit = "20169";

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch data from the API using the hardcoded fips5digit value
        fetch(`/api/retrieve?fips5digit=${fips5digit}&category=health_data`)
        .then((response) => response.json())
        .then((result) => {
            setData(result);
            setLoading(false);
        })
        .catch((error) => {
            setError(error);
            setLoading(false);
        });
    }, [fips5digit]);

    if (loading) {
        return <p>Loading data...</p>;
    }

    if (error) {
        return <p>Error fetching data: {error.message}</p>;
    }

    return (
        <div>
        <p>FIPS 5-Digit Code: {fips5digit}</p>
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
