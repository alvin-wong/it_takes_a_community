export async function getTopWorstPercentiles(fips5digit, isTop = true) {
    const response = await fetch(`http://localhost:3000/api/percentile?col_5_digit_fips_code=${fips5digit}&category=health_data`);
    const data = await response.json();

    // Ensure the fields we don't want are excluded
    const filteredPercentiles = Object.entries(data.percentiles).filter(
        ([metric]) => !['county_clustered_yes_1_no_0_', 'release_year'].includes(metric)
    );

    // Sort the percentiles in descending order
    const sortedPercentiles = filteredPercentiles.sort(([, a], [, b]) => b - a);

    // Return top 5 if isTop is true, otherwise returnf bottom 5
    const result = isTop ? sortedPercentiles.slice(0, 5) : sortedPercentiles.slice(-5);

    return result; // Returns an array of [metric, percentile] pairs
}
