import * as React from 'react';
import { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts';
import { Octokit } from "@octokit/rest";
import '../App.css'; 
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons

const octokit = new Octokit({
});

async function fetchChurnData(setGraphData, setTotalChurn, setMedian, setTrend, filter) {
  try {
    // Fetch commit data from GitHub
    const commits = await octokit.request('GET /repos/{owner}/{repo}/commits', {
      owner: 'Jdaunt0',
      repo: 'jdaunt0.github.io',
      per_page: 100 // Adjust based on your needs
    });

    // Calculate churn rates based on commits
    const churnRates = [];
    for (const commit of commits.data) {
      // Check if stats exist
      if (commit.stats) {
        const { stats } = commit;
        // Ensure total exists before calculation
        const churn = stats.total ? (stats.deletions + stats.additions) / stats.total : 0; // Simple churn rate calculation
        churnRates.push(churn);
      } else {
        console.warn('No stats available for commit:', commit);
      }
    }

    // Graph Data
    let graphData = [];
    switch (filter) {
      case 'week':
        graphData = churnRates.slice(-7); // Last week
        setTotalChurn(churnRates.slice(-7).reduce((a, b) => a + b, 0));
        setMedian(Number(churnRates.slice(-7).reduce((a, b) => a + b, 0) / 7).toFixed(2));
        setTrend(churnRates.length > 1 ? (churnRates.slice(-1)[0] / churnRates.slice(-2)[0]) * 100 : 0);
        break;
      case 'month':
        graphData = churnRates.slice(-30); // Last month
        setTotalChurn(churnRates.slice(-30).reduce((a, b) => a + b, 0));
        setMedian(Number(churnRates.slice(-30).reduce((a, b) => a + b, 0) / 30).toFixed(2));
        setTrend(churnRates.length > 1 ? (churnRates.slice(-1)[0] / churnRates.slice(-2)[0]) * 100 : 0);
        break;
      case 'year':
        graphData = churnRates; // Full year data
        setTotalChurn(churnRates.reduce((a, b) => a + b, 0));
        setMedian(Number(churnRates.reduce((a, b) => a + b, 0) / churnRates.length).toFixed(2));
        setTrend(0);
        break;
      default:
        console.log("Type value out of bounds");
        break;
    }

    // Pass data to graphData state
    setGraphData(graphData);
  } catch (error) {
    console.error('Error fetching churn data:', error);
  }
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

export function ChurnRate({ size, filter }) {
  const [totalChurn, setTotalChurn] = useState(0);
  const [graphData, setGraphData] = useState([]);
  const [median, setMedian] = useState(0);
  const [trend, setTrend] = useState(0);
  
  useEffect(() => {
    fetchChurnData(setGraphData, setTotalChurn, setMedian, setTrend, filter);
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
      <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} /> {/* GitHub logo icon */}      Churn Rate</h3>
      <h4 className="small-grey-text">Duration - {filter}</h4>
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
          colors={['blue']} // Change color to blue for churn rate
          height={graphHeight}
          width={graphWidth}
          grid={{ horizontal: false, vertical: false }}
          layout="vertical"
        />
        {(size === 'medium' || size === 'large') && (
          <div className="stats">
            <div className="chart-stats-container">
              <h3>{totalChurn.toFixed(2)}%</h3>
              <p>Total Churn Rate</p>
            </div>
            <div className="chart-stats-container">
              <h3>{median}%</h3>
              <p>Median Churn Rate</p>
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

export default ChurnRate; // Correct export statement
