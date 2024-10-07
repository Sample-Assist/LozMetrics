import * as React from 'react';
import { useState, useEffect } from 'react';
import { Octokit } from "@octokit/rest";
import { BarChart } from '@mui/x-charts/BarChart'; // Import BarChart from MUI X
import '../App.css';
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons

// Initialize Octokit with personal access token
const octokit = new Octokit({
});

// Function to generate a list of dates for the last 14 days in dd/mm format
function generateLast14Days() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    // Format the date as dd/mm
    const formattedDate = date.toLocaleDateString('en-GB'); // en-GB ensures dd/mm/yyyy format
    dates.push(formattedDate);
  }
  return dates.reverse(); // To ensure the dates are in chronological order
}

// Fetch commit data from GitHub
async function fetchCommitData(setGraphData, setTotalCommits, setTotalCommitsLast14Days, setError, filter) {
  try {
    const commits = await octokit.request('GET /repos/{owner}/{repo}/commits', {
      owner: 'Lozie2002', // Replace with your GitHub username
      repo: 'Metrics', // Replace with your repository name
      per_page: 100, // Adjust based on your needs
    });

    // Calculate the number of commits per day
    const commitsPerDay = {};
    let totalCommitsCount = 0;
    let totalCommitsLast14DaysCount = 0;
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14); // Calculate the date 14 days ago

    commits.data.forEach(commit => {
      const date = new Date(commit.commit.author.date);
      const dateString = date.toLocaleDateString('en-GB'); // Use dd/mm format
      commitsPerDay[dateString] = (commitsPerDay[dateString] || 0) + 1;
      
      totalCommitsCount++;

      // Check if the commit is within the last 14 days
      if (date >= fourteenDaysAgo) {
        totalCommitsLast14DaysCount++;
      }
    });

    // Generate dates for the last 14 days
    const last14Days = generateLast14Days();
    
    // Ensure each day has a count, even if it's 0
    const graphData = last14Days.map(date => ({
      date,
      count: commitsPerDay[date] || 0, // If no commits on a date, count will be 0
    }));

    setTotalCommits(totalCommitsCount);
    setTotalCommitsLast14Days(totalCommitsLast14DaysCount);
    setGraphData(graphData);
  } catch (error) {
    console.error("Error fetching commit data:", error);
    setError("Failed to fetch commit data. Please try again later.");
  }
}

export function CommitsBarGraph({ size, filter }) {
  const [totalCommits, setTotalCommits] = useState(0);
  const [totalCommitsLast14Days, setTotalCommitsLast14Days] = useState(0);
  const [graphData, setGraphData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCommitData(setGraphData, setTotalCommits, setTotalCommitsLast14Days, setError, filter)
      .finally(() => setLoading(false));
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
        Total Number of Commits
      </h2>

      <BarChart
        xAxis={[{ scaleType: 'band', data: labelsData, label: 'Dates (dd/mm)', labelStyle: { fill: 'white' } }]}
        series={[{ data: data.map(entry => entry.count) }]} // Use commit counts for the chart
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
    </div>
  );
}

export default CommitsBarGraph;
