import * as React from 'react';
import { useEffect, useState } from 'react';
import { Octokit } from '@octokit/rest';
import { FaSquareGithub } from "react-icons/fa6"; // GitHub logo icon from react-icons
import { Box, Typography } from '@mui/material'; // Import Material-UI components
import { BarChart } from '@mui/x-charts/BarChart'; // Import BarChart from MUI X

// Initialize Octokit
const octokit = new Octokit({
});

const fetchContributors = async () => {
  try {
    const { data } = await octokit.repos.listContributors({
      owner: 'octocat', // GitHub's example user
      repo: 'Hello-World', // Example repository
    });

    // Sort contributors in descending order by number of contributions
    const sortedContributors = data.sort((a, b) => b.contributions - a.contributions);
    return sortedContributors.slice(0, 5); // Limit to top 5 contributors
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return [];
  }
};

export default function ContributorsBarChart({ size = 'medium' }) { // Add size prop with default value
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    const getContributors = async () => {
      const contributorsData = await fetchContributors();
      setContributors(contributorsData);
    };

    getContributors();
  }, []);

  // Prepare data for the BarChart
  const xAxisData = contributors.map(contributor => contributor.login); // Contributor usernames
  const contributionsData = contributors.map(contributor => contributor.contributions); // Number of commits

  // Set dimensions based on size prop
  let graphWidth = 0, graphHeight = 0;
  if (size === 'small') {
    graphWidth = 340; graphHeight = 250;
  } else if (size === 'medium') {
    graphWidth = 420; graphHeight = 300;
  } else if (size === 'large') {
    graphWidth = 500; graphHeight = 350;
  }

  return (
     
    <div className="chart-container"> {/* Use the new chart-container class */}
    <h2 className="grey-text">
    <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} /> {/* GitHub logo icon */}

    Top 5 Contributors
    </h2>
    
    

      <BarChart
        xAxis={[{ scaleType: 'band', data: xAxisData }]} // Contributor usernames for the x-axis
        series={[{ data: contributionsData }]} // Number of contributions for the y-axis
        width={graphWidth} // Set dynamic width based on size
        height={graphHeight} // Set dynamic height based on size
        sx={{
          // Change axis and label styles if needed
          "& .MuiChartsAxis-tickContainer .MuiChartsAxis-tickLabel": {
            fill: "white",
          },
          "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
            stroke: "#0000FF",
            strokeWidth: 0.4,
          },
        }}
      />
    </div>
  );
}
