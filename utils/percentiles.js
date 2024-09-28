export async function getTopWorstPercentiles(fips5digit) {
    const response = await fetch(`http://localhost:3000/api/percentile?col_5_digit_fips_code=${fips5digit}&category=health_data`);
    const data = await response.json();

    // Ensure the fields we don't want are excluded
    const filteredPercentiles = Object.entries(data.percentiles).filter(
        ([metric]) => !['county_clustered_yes_1_no_0_', 'release_year'].includes(metric)
    );

    // Sort the percentiles in descending order and pick the top 5
    const sortedPercentiles = filteredPercentiles.sort(([, a], [, b]) => b - a);
    const top5 = sortedPercentiles.slice(0, 5); // Get top 5 worst metrics

    return top5; // Returns an array of [metric, percentile] pairs
}
