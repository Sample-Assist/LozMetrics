import * as React from 'react';
import { useState, useEffect } from 'react';
import { Octokit } from "@octokit/rest";
import { BarChart } from '@mui/x-charts/BarChart'; // Import BarChart from MUI X
import '../App.css';
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons

// Initialize Octokit with a personal access token
const octokit = new Octokit({
});

// Fetch pull request data from GitHub
async function fetchPullRequestData(setGraphData, setTotalPRs, setTotalPRsLast14Days, filter) {
  try {
    const pulls = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
      owner: 'octocat', // Replace with your GitHub username
      repo: 'Hello-World', // Replace with your repository name
      state: 'all', // Fetch both open and closed pull requests
      per_page: 100, // Adjust based on your needs
    });

    // Calculate the date 14 days ago
    const today = new Date();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(today.getDate() - 14);

    // Calculate the number of pull requests per day
    const prsPerDay = {};
    let totalPRsLast14Days = 0;

    pulls.data.forEach(pr => {
      const prDate = new Date(pr.created_at);
      const dateString = prDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }); // Format date as dd/mm

      prsPerDay[dateString] = (prsPerDay[dateString] || 0) + 1;

      // Check if the PR is within the last 14 days
      if (prDate >= fourteenDaysAgo) {
        totalPRsLast14Days++;
      }
    });

    // Ensure each of the last 14 days has a value, even if it's 0
    const last14Days = generateLast14Days();
    const graphData = last14Days.map(date => ({
      date,
      count: prsPerDay[date] || 0, // Default to 0 if no pull requests on that day
    }));

    setTotalPRs(graphData.reduce((acc, pr) => acc + pr.count, 0));
    setTotalPRsLast14Days(totalPRsLast14Days);
    setGraphData(graphData);
  } catch (error) {
    console.error("Error fetching pull request data:", error);
  }
}

// Function to generate a list of dates for the last 14 days in dd/mm format
function generateLast14Days() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    dates.push(formattedDate);
  }
  return dates.reverse(); // Ensure the dates are in chronological order
}

export function PullRequestsBarChart({ size, filter }) {
  const [totalPRs, setTotalPRs] = useState(0);
  const [totalPRsLast14Days, setTotalPRsLast14Days] = useState(0);
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    fetchPullRequestData(setGraphData, setTotalPRs, setTotalPRsLast14Days, filter);
  }, [filter]);

  const data = graphData;
  const labelsData = data.map(entry => entry.date); // Use dates for x-axis labels in dd/mm format

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
    <div className="chart-container">
      <h2 className="grey-text">
        <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} />
        Total Number of Pull Requests
      </h2>

      <BarChart
        xAxis={[{ scaleType: 'band', data: labelsData, label: 'Dates (dd/mm)', labelStyle: { fill: 'white' } }]}
        series={[{ data: data.map(entry => entry.count) }]} // Use PR counts for the chart
        width={graphWidth}
        height={graphHeight}
        sx={{
          // Customize styles for axes and labels
          "& .MuiChartsAxis-tickContainer .MuiChartsAxis-tickLabel": {
            fill: "white",
          },
          "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
            stroke: "#0000FF",
            strokeWidth: 0.4,
          },
        }}
      />

      {/* Last 14 Days Section */}
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '10px', color: 'white' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'normal' }}>
          Last 14 Days - {totalPRsLast14Days > 0 
            ? `${totalPRsLast14Days}`
            : 'No pull requests received in the last 14 days.'}
        </h3>
      </div>
    </div>
  );
}

export default PullRequestsBarChart;
