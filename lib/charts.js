import * as Plot from "@observablehq/plot";

// Chart to compare county data vs national averages for health indicators
export function createHealthComparisonChart(countyData, nationalAvgData, indicator, elementId) {
  const container = document.getElementById(elementId);

  // Clear the existing chart before rendering a new one
  if (container) {
    container.innerHTML = ''; // This removes any existing chart
  }

  // Get the CSS variables (colors) from the :root in globals.css
  const rootStyles = getComputedStyle(document.documentElement);
  const primaryColor = rootStyles.getPropertyValue('--primary-color').trim();
  const secondaryColor = rootStyles.getPropertyValue('--secondary-color').trim();
  const accentColor = rootStyles.getPropertyValue('--accent-color').trim();

  const data = [
    { label: "County", value: countyData[indicator], color: accentColor },
    { label: "National Avg", value: nationalAvgData[`avg_${indicator}`], color: secondaryColor },
  ];

  const chart = Plot.plot({
    height: 200,
    width: 400,
    marks: [
      Plot.barY(data, {
        x: "label",
        y: "value",
        fill: d => d.color, // Use the custom colors
      }),
      Plot.ruleY([countyData[indicator], nationalAvgData[`avg_${indicator}`]], { stroke: accentColor }),
    ],
    y: {
      grid: true,
      label: `${indicator.replace(/_/g, " ")}`,
    },
  });

  container.appendChild(chart);
}
