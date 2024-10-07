import * as React from 'react';
import { useState, useEffect } from 'react';
import { BarChart } from '@mui/x-charts';
import { Octokit } from "@octokit/rest";
import '../App.css'; 
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons
const octokit = new Octokit({
})

async function Git(graphData,totalDeploys,median,trend,filter,repo){
  //API calls
  // const previousYearCommits = await octokit.request('GET /repos/{owner}/{repo}/commits', {
  //   owner: 'Jdaunt0',
  //   repo: 'jdaunt0.github.io',
  //   since: '2022-01-01T00:00:00Z',
  //   until: '2022-12-31T23:59:59Z',
  //   headers: {
  //     'X-GitHub-Api-Version': '2022-11-28'
  //   }
  // });
  const Year = await octokit.request('GET /repos/{owner}/{repo}/stats/commit_activity', {
    owner: 'octocat', // GitHub's example user
    repo: 'Hello-World', // Example repository
    state: 'open',
    per_page: 100,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
  console.log(Year); // Debug

  //Graph Data
  let GraphWeek = [];
  try {
    GraphWeek = Year.data[51].days;
  } catch (error) {
      console.error("An error occurred while accessing GraphWeek:", error);
      GraphWeek = [];
  }

  const GraphMonth = [Year.data[51].total, Year.data[50].total, Year.data[49].total, Year.data[48].total];
  
  const groupDataByMonth = (yearData) => {
    const monthMapping = [
      [0, 1, 2, 3],           // Jan
      [4, 5, 6, 7],           // Feb
      [8, 9, 10, 11],         // Mar
      [12, 13, 14, 15],       // Apr
      [16, 17, 18, 19],       // May
      [20, 21, 22, 23],       // Jun
      [24, 25, 26, 27],       // Jul
      [28, 29, 30, 31],       // Aug
      [32, 33, 34, 35, 36],   // Sep
      [37, 38, 39, 40, 41],   // Oct
      [42, 43, 44, 45, 46],   // Nov
      [47, 48, 49, 50, 51]    // Dec 
    ];
  
    const monthlyTotals = monthMapping.map(weeks =>
      weeks.reduce((total, weekIndex) => total + (yearData[weekIndex]?.total || 0), 0)
    );
  
    return monthlyTotals;
  };
  const GraphYear = groupDataByMonth(Year.data);

  //Total Deploys
  const weekTotal = Year.data[51].total;
  let monthTotal = 0; let yearTotal = 0; let prevMonthTotal = 0;
  for(let i=0;i<51;i++){
    yearTotal += Year.data[i].total;
  }
  for(let i=47;i<51;i++){
    monthTotal += Year.data[i].total;
  }
  for(let i=43;i<47;i++){
    prevMonthTotal += Year.data[i].total;
  }

  //trend
  const weekTrend = (Year.data[51].total / Year.data[50].total) * 100;
  const monthTrend = (monthTotal / prevMonthTotal) * 100;

  //Output
  switch(filter){
    case 'week'://Week
      graphData(GraphWeek);
      totalDeploys(weekTotal);  
      median(Number(weekTotal/7).toFixed(2));
      trend(weekTrend);
      break;
    case 'month'://Month
      graphData(GraphMonth);
      totalDeploys(monthTotal);
      median(Number(monthTotal/30).toFixed(2));
      trend(monthTrend);
      break;
    case 'year'://Year
      graphData(GraphYear);
      totalDeploys(yearTotal); 
      median(Number(yearTotal/52).toFixed(2))
      trend(0);
      break;
    default:
      console.log("Type value out of bounds");
      break;
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

export function FrequencyOfDeployment({size, filter}){
  const [deploys, setDeploys] = useState(0);
  const [Graph, setGraph] = useState([]);
  const [median, setmedian] = useState(0);
  const [trend, setTrend] = useState(0);
  useEffect(() => {
    Git(setGraph,setDeploys,setmedian,setTrend,filter);
  }, []);

  const data = Graph;
  let labelsData = []; 
  if(filter === 'week'){
    labelsData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }else if(filter === 'month'){
    labelsData = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];
  }else if(filter === 'year'){
    labelsData = generateMonthLabels();;
  }
  console.log("filter", filter, "Labels: ",labelsData, "Data", Graph);

  let graphWidth = 0, graphHeight = 0;
  if(size === 'small'){
    graphWidth = 340; graphHeight = 250;
  }else if(size === 'medium'){
    graphWidth = 420; graphHeight = 250;
  }else if(size === 'large'){
    graphWidth = 500; graphHeight = 350;
  }



  console.log("Graph", Graph);
  return (
    <div>
       <h3 className="grey-text">
       <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} /> {/* GitHub logo icon */}       Frequency Deployment</h3>
       <h4 className="small-grey-text">Duration - {filter}</h4> {/* Smaller text for the filter */}


<div className={`chart-stats-container ${size === 'large' ? 'vertical-layout' : 'horizontal-layout'}`}>
      <BarChart
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
  colors={['#01b4d2']} // Set the fill color for the bars (can be the same as the outline for a clean look)
  height={graphHeight}
  width={graphWidth}
  grid={{ horizontal: false, vertical: false }} // Optional grid display
  layout="vertical" // Vertical layout of the bars
  sx={{
    '& .MuiChartsBar-bar': {
      backgroundColor: 'transparent', // Ensure the bars are transparent
      border: '2px solid #01b4d2', // Set the outline color
      boxShadow: '0 0 10px rgba(1, 180, 210, 0.8)', // Create a glow effect
      opacity: 1, // Fully opaque outline
    },
  }}
/>
        {(size === 'medium' || size === 'large')&& (
            <div className="stats">
              <div className="chart-stats-container">
                <h3>{deploys}</h3>
                <p>Total Deploys</p>
              </div>
              <div className="chart-stats-container">
                <h3>{median} /Wk</h3>
                <p>.. Median</p>
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