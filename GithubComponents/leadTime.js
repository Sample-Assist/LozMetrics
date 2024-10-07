import * as React from 'react';
import { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts';
import { Octokit } from "@octokit/rest";
import '../App.css'; 
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons
const octokit = new Octokit({
});

async function fetchGitData(setGraphData, setTotalLeadTime, setMedian, setTrend, filter) {
  // Fetch commit data from GitHub
  const commits = await octokit.request('GET /repos/{owner}/{repo}/commits', {
    owner: 'octocat', // GitHub's example user
  repo: 'Hello-World', // Example repository
  state: 'open',
  per_page: 100,
  });

  // Calculate lead times between commits
  const leadTimes = [];
  for (let i = 1; i < commits.data.length; i++) {
    const previousCommitDate = new Date(commits.data[i - 1].commit.author.date);
    const currentCommitDate = new Date(commits.data[i].commit.author.date);
    const leadTime = (currentCommitDate - previousCommitDate) / (1000 * 60 * 60 * 24); // Convert to days
    leadTimes.push(leadTime);
  }

  // Graph Data
  let graphData = [];
  switch (filter) {
    case 'week':
      graphData = leadTimes.slice(-7); // Last week
      setTotalLeadTime(leadTimes.slice(-7).reduce((a, b) => a + b, 0));
      setMedian(Number(leadTimes.slice(-7).reduce((a, b) => a + b, 0) / 7).toFixed(2));
      setTrend((leadTimes.slice(-1)[0] / leadTimes.slice(-2)[0]) * 100);
      break;
    case 'month':
      graphData = leadTimes.slice(-30); // Last month
      setTotalLeadTime(leadTimes.slice(-30).reduce((a, b) => a + b, 0));
      setMedian(Number(leadTimes.slice(-30).reduce((a, b) => a + b, 0) / 30).toFixed(2));
      setTrend((leadTimes.slice(-1)[0] / leadTimes.slice(-2)[0]) * 100);
      break;
    case 'year':
      graphData = leadTimes; // Full year data
      setTotalLeadTime(leadTimes.reduce((a, b) => a + b, 0));
      setMedian(Number(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length).toFixed(2));
      setTrend(0);
      break;
    default:
      console.log("Type value out of bounds");
      break;
  }

  // Pass data to graphData state
  setGraphData(graphData);
}

const generateMonthLabels = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIndex = new Date().getMonth(); 

  const labels = [];
  for (let i = 0; i < 12; i++) {
    labels.push(months[(currentMonthIndex - i + 12) % 12]);
  }

  return labels.reverse();
};

export function LeadTime({ size, filter }) {
  const [leadTime, setLeadTime] = useState(0);
  const [graphData, setGraphData] = useState([]);
  const [median, setMedian] = useState(0);
  const [trend, setTrend] = useState(0);
  
  useEffect(() => {
    fetchGitData(setGraphData, setLeadTime, setMedian, setTrend, filter);
  }, [filter]); // Added filter as a dependency to re-fetch data on change

  const data = graphData;
  let labelsData = []; 
  if (filter === 'week') {
    labelsData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  } else if (filter === 'month') {
    labelsData = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];
  } else if (filter === 'year') {
    labelsData = generateMonthLabels();
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
        Lead Time</h3>
       <h4 className="small-grey-text">Duration - {filter}</h4> {/* Smaller text for the filter */}
      <div className={`chart-stats-container ${size === 'large' ? 'vertical-layout' : 'horizontal-layout'}`}>
        <LineChart
          series={[{ data }]}
          xAxis={[{
            data: labelsData,
            scaleType: 'band',
            tickSize: 10,
            sx: {
              '& .MuiChartsAxis-tickLabel': {
                fill: '#B0B0B0', // Light grey for tick labels
                fontSize: '12px', // Adjust font size for readability
              },
              '& .MuiChartsAxis-label': {
                fill: '#B0B0B0', // Light grey for axis labels
                fontSize: '14px', // Slightly larger for emphasis
                fontWeight: 'bold', // Bold labels for better visibility
              },
            },
          }]}
          yAxis={[{
            sx: {
              '& .MuiChartsAxis-tickLabel': {
                fill: '#B0B0B0', // Light grey for y-axis tick labels
                fontSize: '12px', // Adjust font size for readability
              },
              '& .MuiChartsAxis-label': {
                fill: '#B0B0B0', // Light grey for y-axis label
                fontSize: '14px', // Slightly larger for emphasis
                fontWeight: 'bold', // Bold labels for better visibility
              },
            },
          }]}
          colors={['green']}
          height={graphHeight}
          width={graphWidth}
          grid={{ horizontal: false, vertical: false }}
          layout="vertical"
        />
        {(size === 'medium' || size === 'large') && (
          <div className="stats">
            <div className="chart-stats-container">
              <h3>{leadTime.toFixed(2)} Sec</h3>
              <p>Total Lead Time</p>
            </div>
            <div className="chart-stats-container">
              <h3>{median} Sec</h3>
              <p> Median Lead Time</p>
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
