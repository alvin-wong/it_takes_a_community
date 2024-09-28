export async function getTopWorstPercentiles(fips5digit) {
    const response = await fetch(`/api/percentile?col_5_digit_fips_code=${fips5digit}&category=health_data`);
    const data = await response.json();
  
    // Sort the percentiles in descending order and pick the top 5
    const sortedPercentiles = Object.entries(data.percentiles).sort(([, a], [, b]) => b - a);
    const top5 = sortedPercentiles.slice(0, 5); // Get top 5 worst metrics
  
    return top5; // Returns an array of [metric, percentile] pairs
  }
  