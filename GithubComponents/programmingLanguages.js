import * as React from 'react';
import { useState, useEffect } from 'react';
import { Octokit } from "@octokit/rest";
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { CircularProgress, Typography } from '@mui/material';
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons

// Replace with your secure token method
const octokit = new Octokit({
});

async function fetchLanguageData(setLanguageData) {
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/languages', {
      owner: 'Lozie2002', // Replace with your GitHub user
      repo: 'aidanlozell.com', // Replace with your repository
    });

    if (response && response.data) {
      setLanguageData(response.data);
    } else {
      setLanguageData({});
    }
  } catch (error) {
    console.error('Error fetching language data:', error);
    setLanguageData({});
  }
}

export function LanguageChart({ size }) { // Accept size prop
  const [languageData, setLanguageData] = useState(null);

  useEffect(() => {
    fetchLanguageData(setLanguageData);
  }, []);

  // If data is not loaded yet, show a loading spinner
  if (!languageData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </div>
    );
  }

  // Prepare chart data
  const labels = Object.keys(languageData); // Languages
  const dataValues = Object.values(languageData); // Bytes

  // If there's no data, render a message
  if (labels.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Typography color="textSecondary">No language data available.</Typography>
      </div>
    );
  }

  // Calculate total bytes
  const totalBytes = dataValues.reduce((acc, value) => acc + value, 0);

  // Prepare the chart data with percentages
  const chartData = labels.map((label, index) => {
    const percentage = totalBytes > 0 ? (dataValues[index] / totalBytes) * 100 : 0; // Calculate percentage
    return {
      id: index,              // Use index as id
      value: percentage,      // Use calculated percentage
      label: `${label}: ${percentage.toFixed(1)}%`, // Update label with percentage
    };
  });

  // Set graph dimensions based on size prop
  let graphWidth = 0, graphHeight = 0; 
  if (size === 'small') {
    graphWidth = 340; graphHeight = 250;
  } else if (size === 'medium') {
    graphWidth = 420; graphHeight = 300;
  } else if (size === 'large') {
    graphWidth = 500; graphHeight = 350;
  }

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', color: 'white' }}>
      <h2 className="grey-text">
        <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} />
        Languages Used
      </h2>
      <PieChart
        series={[
          {
            data: chartData, // Pass the prepared chart data
            arcLabel: (item) => `${item.label}`, // Customize the arc label
            arcLabelMinAngle: 35, // Minimum angle for arc label to display
            arcLabelRadius: '60%', // Radius of arc label
            label: {
              display: true, // Enable label display
              position: 'bottom', // Position the labels at the bottom
              font: {
                size: 12, // Adjust font size as needed
                color: 'white', // Set label color to white
              },
            },
          },
        ]}
        sx={{
          // Set styles for pie arc labels
          [`& .${pieArcLabelClasses.root}`]: {
            fontWeight: 'bold', // Bold font for arc labels
            color: 'white', // White text color for arc labels
          },
          // Add style for the chart labels
          '& .MuiTypography-root': {
            color: 'white', // Ensure all labels are white
          },
        }}
        width={graphWidth} // Use dynamic width
        height={graphHeight} // Use dynamic height
      />
    </div>
  );
}

export default LanguageChart;
