'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createHealthComparisonChart } from '@/lib/charts'; // Make sure this library can properly resize charts
import { LinearProgress } from '@mui/material'; // Import LinearProgress from Material-UI
import { getOpenAIResponse} from '@/utils/get_paragraph';


const CommunityPage = () => {

  const searchParams = useSearchParams();
  const col_5_digit_fips_code = searchParams.get('fipCode');  // Get FIPS code from query

  const [data, setData] = useState(null);
  const [nationalAvg, setNationalAvg] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countyName, setCountyName] = useState("");
  const [metrics, setMetrics] = useState(['adult smoking', 'obesity', 'physical inactivity']);
  const [paragraphText, setParagraphText] = useState("We have identified five key areas where Fulton County is currently in the bottom percentile in health-related metrics compared to national averages. These areas—such as adult smoking, obesity, and physical inactivity—are critical for improving the well-being of the community. By focusing on these metrics, you can help make a positive impact in your community. Below, you will find links to valuable resources that can guide you on how to get involved, whether you're looking to contribute to these efforts or seeking aid and support for yourself or others!")

  useEffect(() => {

    // Fetch percentiles data
    fetch(`http://localhost:3000/api/percentile?col_5_digit_fips_code=${col_5_digit_fips_code}&category=health_data`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Ensure the fields we don't want are excluded
      const filteredPercentiles = Object.entries(data.percentiles).filter(
        ([metric]) => !['county_clustered_yes_1_no_0_', 'release_year'].includes(metric)
      );

      // Sort the filtered percentiles in descending order
      const sortedPercentiles = filteredPercentiles.sort(([, a], [, b]) => b - a);

      // Return top 5 if isTop is true, otherwise return bottom 5
      const result =  sortedPercentiles.slice(0, 5);

      setMetrics(result);  // Set the result in the state
      setLoading(false);   // Set loading to false once done
    })
    .catch(error => {
      console.error('Error fetching percentiles:', error);
      setError(error);     // Set the error state if something goes wrong
      setLoading(false);   // Stop loading even if there's an error
    });

    fetch(`/api/retrieve?col_5_digit_fips_code=${col_5_digit_fips_code}&category=health_data`)
      .then(response => response.json())
      .then(result => {
        setData(result);
        setCountyName(result.name);
        const txt = getOpenAIResponse(metrics,result.name)
        console.log("txt",txt)
        setParagraphText(txt);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
        
      });

    fetch(`/api/average?category=health_data`)
      .then(response => response.json())
      .then(result => {
        setNationalAvg(result);
      })
      .catch(error => {
        setError(error);
      });

    fetch(`/api/resources?col_5_digit_fips_code=${col_5_digit_fips_code}`)
      .then(response => response.json())
      .then(result => {
        if (result.error) {
          setError(result.error);
        } else {
          const flattenedResources = result.map(suggestion => suggestion.resources).flat();
          setResources(flattenedResources);
        }
        setResourcesLoading(false);
      })
      .catch(error => {
        setError(error);
        setResourcesLoading(false);
      });

  }, [col_5_digit_fips_code]);

  useEffect(() => {
    if (data && nationalAvg) {
      // Make sure the charts are rendered after the DOM is ready and resized correctly
      createHealthComparisonChart(data, nationalAvg, 'adult_smoking_raw_value', 'smokingChart');
      createHealthComparisonChart(data, nationalAvg, 'adult_obesity_raw_value', 'obesityChart');
      createHealthComparisonChart(data, nationalAvg, 'physical_inactivity_raw_value', 'inactivityChart');
    }
  }, [data, nationalAvg]);

  return (
    <div className="community-page">
      <div className="community-container">
        <h1 className="heading">Health Comparisons for {countyName}</h1>


      {/* Wrap the charts in a container */}
      <div className="charts-container">
        <div id="smokingChart" className="chart"></div>
        <div id="obesityChart" className="chart"></div>
        <div id="inactivityChart" className="chart"></div>
      </div>
        {!resourcesLoading && (
    <div className="info-paragraph">
      <p>{paragraphText}</p>
    </div>
  )}

        <h2 className="heading">Suggested Resources:</h2>

        {loading || resourcesLoading ? (
          <div style={{ width: '100%', marginBottom: '20px' }}>
            <p className="statement">Loading resources...</p>
            <LinearProgress />
          </div>
        ) : error ? (
          <p className="statement">Error: {error.message}</p>
        ) : resources.length > 0 ? (
          <div className="resource-container">
            {resources.map((resource, index) => (
              <div key={index} className="resource-card">
                <h3 className="resource-title">Resource {index + 1}: {resource.title}</h3>
                <p className="resource-description">{resource.description}</p>
                <p className="resource-involvement">{resource.how_you_help}</p>
                <a href={resource.link} target="_blank" className="url">
                  {resource.link}
                </a>
              </div>
            ))}

          </div>
        ) : (
          <p className="statement">No resources found.</p>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
