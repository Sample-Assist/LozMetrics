import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { useEffect, useState } from 'react';
import { Octokit } from '@octokit/rest';
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons

// Initialize Octokit with your personal access token
const octokit = new Octokit({
});

// Fetch GitHub traffic data
const fetchGitHubTraffic = async () => {
  try {
    const { data } = await octokit.repos.getViews({
      owner: 'Lozie2002', // Replace with your GitHub username
      repo: 'aidanlozell.com', // Replace with your repository name
    });
    return data.views; // Ensure this returns the correct data structure
  } catch (error) {
    console.error('Error fetching GitHub traffic data:', error);
    return []; // Return an empty array in case of error
  }
};

// Generate the last 14 days
const generateLast14Days = () => {
  const today = new Date();
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date); // Store Date objects
  }
  return days;
};

// Format date as dd/mm
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with zero if necessary
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed) and pad
  return `${day}/${month}`; // Format as dd/mm
};

export default function GitHubTrafficChart({ size = 'medium' }) { // Add size prop with default value
  const [dataset, setDataset] = useState([]);

  useEffect(() => {
    const getTrafficData = async () => {
      const trafficData = await fetchGitHubTraffic();
      if (trafficData) {
        const formattedData = trafficData.map((entry) => ({
          date: new Date(entry.timestamp), // Convert timestamp to Date object
          count: entry.count,
          unique: entry.unique || 0, // Add unique views if available
        }));

        // Generate the last 14 days
        const last14Days = generateLast14Days();

        // Create a complete dataset including days with no data
        const completeDataset = last14Days.map((date) => {
          const entry = formattedData.find((item) => item.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]);
          return {
            date: formatDate(date), // Format date as dd/mm
            count: entry ? entry.count : 0, // Use 0 if there is no data for that date
            unique: entry ? entry.unique : 0, // Use 0 if no unique views
          };
        });

        setDataset(completeDataset);
      }
    };

    getTrafficData();
  }, []);

  // Set dimensions based on size prop
  let graphWidth = 0, graphHeight = 0;
  if (size === 'small') {
    graphWidth = 340; graphHeight = 250;
  } else if (size === 'medium') {
    graphWidth = 420; graphHeight = 250;
  } else if (size === 'large') {
    graphWidth = 500; graphHeight = 350;
  }

  return (
    <div className="chart-container"> {/* Use the new chart-container class */}
      <h2 className="grey-text">
      <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} /> {/* GitHub logo icon */}

        Total Number of Visitors over the last 14 days</h2>
      <LineChart
        dataset={dataset}
        xAxis={[{ scaleType: 'band', dataKey: 'date', label: 'Dates', labelStyle: { fill: 'white' } }]} // Set scale type to 'band' for categorical data
        series={[
          { dataKey: 'count', label: 'Views', area: true },
          { dataKey: 'unique', label: 'Unique Views', area: true, color: 'orange' }, // Add unique views series
        ]}
        yAxis={[ // Correctly formatted yAxis prop
          {
            label: 'Views',
            labelStyle: { fill: 'white' }, // Change label color to white
          },
        ]}
        width={graphWidth} // Set dynamic width
        height={graphHeight} // Set dynamic height
        sx={{
          // Change left yAxis label styles
          "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
            strokeWidth: "0.4",
            fill: "#ff0000",
          },
          // Change all labels fontFamily shown on both xAxis and yAxis
          "& .MuiChartsAxis-tickContainer .MuiChartsAxis-tickLabel": {
            fill: "white",
          },
          // Change bottom label styles
          "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
            fill: "white",
          },
          // Bottom axis line styles
          "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
            stroke: "#0000FF",
            strokeWidth: 0.4,
          },
          // Left axis line styles
          "& .MuiChartsAxis-left .MuiChartsAxis-line": {
            // Add any specific styles here if needed
          },
        }}
      />
    </div>
  );
}
