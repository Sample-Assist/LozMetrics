import * as React from 'react';
import { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts';
import { Octokit } from "@octokit/rest";
import '../App.css'; 
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons
const octokit = new Octokit({
});

async function fetchGitData(setGraphData, setFailureRate, setMedian, setTrend, filter) {
  // Fetch commit data from GitHub
  const commits = await octokit.request('GET /repos/{owner}/{repo}/commits', {
    owner: 'octocat', // Replace with the repository owner's username
    repo: 'Hello-World', // Replace with your repository name
    per_page: 100,
  });

  // Calculate failure rate (for example, consider every 5th commit as a failure for demonstration)
  const totalCommits = commits.data.length;
  const failedCommits = Math.floor(totalCommits * 0.1); // Example: 10% failure rate
  const successCommits = totalCommits - failedCommits;

  const failureRate = (failedCommits / totalCommits) * 100; // Calculate failure rate percentage

  // Graph Data
  let graphData = [];
  switch (filter) {
    case 'week':
      graphData = Array(7).fill(failureRate); // Example data for last week
      setFailureRate(failureRate);
      setMedian(failureRate); // Setting median as the same for this example
      setTrend(0); // Set trend calculation logic here
      break;
    case 'month':
      graphData = Array(30).fill(failureRate); // Example data for last month
      setFailureRate(failureRate);
      setMedian(failureRate); // Setting median as the same for this example
      setTrend(0); // Set trend calculation logic here
      break;
    case 'year':
      graphData = Array(12).fill(failureRate); // Example data for last year
      setFailureRate(failureRate);
      setMedian(failureRate); // Setting median as the same for this example
      setTrend(0); // Set trend calculation logic here
      break;
    default:
      console.log("Type value out of bounds");
      break;
  }

  // Pass data to graphData state
  setGraphData(graphData);
}

export function ChangeFailureRate({ size, filter }) {
  const [failureRate, setFailureRate] = useState(0);
  const [graphData, setGraphData] = useState([]);
  const [median, setMedian] = useState(0);
  const [trend, setTrend] = useState(0);
  
  useEffect(() => {
    fetchGitData(setGraphData, setFailureRate, setMedian, setTrend, filter);
  }, [filter]); // Re-fetch data on filter change

  const data = graphData;
  let labelsData = []; 
  if (filter === 'week') {
    labelsData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  } else if (filter === 'month') {
    labelsData = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'];
  } else if (filter === 'year') {
    labelsData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }
  
  let graphWidth = 0, graphHeight = 0;
  if (size === 'small') {
    graphWidth = 340; graphHeight = 250;
  } else if (size === 'medium') {
    graphWidth = 420; graphHeight = 250;
  } else if (size === 'large') {
    graphWidth = 500; graphHeight = 350;
  }
  
  return (
    <div>
      <h3 className="grey-text">
      <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} /> {/* GitHub logo icon */}
      Change Failure Rate</h3>
      <h4 className="small-grey-text">Failure Rate - {filter}</h4>
      <div className={`chart-stats-container ${size === 'large' ? 'vertical-layout' : 'horizontal-layout'}`}>
        <LineChart
          series={[{ data }]}
          xAxis={[{
            data: labelsData,
            scaleType: 'band',
            tickSize: 10,
            sx: {
              '& .MuiChartsAxis-tickLabel': {
                fill: '#B0B0B0', 
                fontSize: '12px', 
              },
              '& .MuiChartsAxis-label': {
                fill: '#B0B0B0', 
                fontSize: '14px', 
                fontWeight: 'bold', 
              },
            },
          }]}
          yAxis={[{
            sx: {
              '& .MuiChartsAxis-tickLabel': {
                fill: '#B0B0B0', 
                fontSize: '12px', 
              },
              '& .MuiChartsAxis-label': {
                fill: '#B0B0B0', 
                fontSize: '14px', 
                fontWeight: 'bold', 
              },
            },
          }]}
          colors={['red']} // Change color as needed
          height={graphHeight}
          width={graphWidth}
          grid={{ horizontal: false, vertical: false }}
          layout="vertical"
        />
        {(size === 'medium' || size === 'large') && (
          <div className="stats">
            <div className="chart-stats-container">
              <h3>{failureRate.toFixed(2)}%</h3>
              <p>Current Failure Rate</p>
            </div>
            <div className="chart-stats-container">
              <h3>{median.toFixed(2)}%</h3>
              <p>Median Failure Rate</p>
            </div>
            <div className="chart-stats-container">
              <h3>{trend}%</h3>
              <p>Trend</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default ChangeFailureRate;

