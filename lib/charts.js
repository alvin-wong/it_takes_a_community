import * as Plot from "@observablehq/plot";

// Chart to compare county data vs national averages for health indicators
export function createHealthComparisonChart(countyData, nationalAvgData, indicator, elementId) {
  const container = document.getElementById(elementId);

  // Clear the existing chart before rendering a new one
  if (container) {
    container.innerHTML = ''; // This removes any existing chart
  }

  const data = [
    { label: "County", value: countyData[indicator] },
    { label: "National Avg", value: nationalAvgData[`avg_${indicator}`] },
  ];

  const chart = Plot.plot({
    height: 200,
    width: 400,
    marks: [
      Plot.barY(data, {
        x: "label",
        y: "value",
        fill: "label",
      }),
      Plot.ruleY([countyData[indicator], nationalAvgData[`avg_${indicator}`]], { stroke: "red" }),
    ],
    y: {
      grid: true,
      label: `${indicator.replace(/_/g, " ")} Value`,
    },
  });

  container.appendChild(chart);
}
