import * as React from 'react';
import { useState, useEffect } from 'react';
import { Octokit } from "@octokit/rest";
import { PieChart } from '@mui/x-charts/PieChart'; // Updated import
import { Typography } from '@mui/material';
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons

const octokit = new Octokit({
});

async function fetchContributors(setContributors, setError) {
  try {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/contributors', {
      owner: 'octocat',
      repo: 'Hello-World',
    });

    const contributorData = data.map(contributor => ({
      name: contributor.login,
      contributions: contributor.contributions,
    }));

    setContributors(contributorData); // Set the contributor data in state
  } catch (error) {
    console.error("Error fetching contributors:", error);
    setError("Failed to fetch contributors. Please try again later.");
  }
}

export function CodeMetrics({ size }) { // Accept size prop
  const [contributors, setContributors] = useState([]); // State to store contributors data
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    fetchContributors(setContributors, setError); // Fetch contributors when component mounts
  }, []);

  // Calculate total contributions
  const totalContributions = contributors.reduce((acc, contributor) => acc + contributor.contributions, 0);

  // Ensure contributors data is available and calculate percentages
  const data = contributors.length > 0 ? contributors.map((contributor, index) => ({
    id: index,
    value: totalContributions > 0 ? (contributor.contributions / totalContributions) * 100 : 0, // Calculate percentage
    label: `${contributor.name} (${((contributor.contributions / totalContributions) * 100).toFixed(1)}%)`, // Update label with percentage
  })) : []; // Provide a fallback to an empty array if no contributors

  const COLORS = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40'
  ];

  // Set container dimensions based on size prop
  let containerStyles = {};
  let chartWidth = 400;  // Default chart width
  let chartHeight = 200; // Default chart height

  if (size === 'small') {
    containerStyles = { width: '440px', height: '250px' };
    chartWidth = 400; // Adjusted smaller width for small size
    chartHeight = 200; // Adjusted height for small size
  } else if (size === 'medium') {
    containerStyles = { width: '500px', height: '300px' };
    chartWidth = 500; // Width for medium size
    chartHeight = 250; // Height for medium size
  } else if (size === 'large') {
    containerStyles = { width: '700px', height: '450px' }; // Increase container size for large
    chartWidth = 650; // Increased width for large size
    chartHeight = 400; // Increased height for large size
  }

  return (
    <div className="chart-container" style={{ 
        ...containerStyles, 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center' // Ensure everything is centered
      }}> 
      <h2 className="grey-text" style={{ textAlign: 'center' }}> {/* Center the title text */}
        <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} /> {/* GitHub logo icon */}
        Code Contributors Ratio
      </h2>
      {error ? ( // Display error message if there is an error
        <p className="centered-text error-text" style={{ textAlign: 'center' }}>{error}</p> // Center the error message
      ) : (
        <PieChart
          series={[{ data }]} // Use the updated data structure
          width={chartWidth}
          height={chartHeight}
          colors={COLORS}
           // Set the colors for the chart
        />
      )}
    </div>
  );
}

export default CodeMetrics;
