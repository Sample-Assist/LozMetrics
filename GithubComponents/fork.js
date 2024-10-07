import * as React from 'react';
import { useState, useEffect } from 'react';
import { Octokit } from "@octokit/rest";
import '../App.css'; 
import { FaSquareGithub } from "react-icons/fa6"; 

const octokit = new Octokit({
});

async function fetchForkData(setGraphData, setTotalForks, setForksLast14Days, filter) {
  try {
    // Fetch fork data from GitHub
    const forks = await octokit.request('GET /repos/{owner}/{repo}/forks', {
      owner: 'Lozie2002', // Change to your GitHub username
      repo: 'Metrics', // Change to your repository name
      per_page: 100 // Adjust based on your needs
    });

    // Calculate the number of forks per day
    const forksPerDay = {};
    forks.data.forEach(fork => {
      const date = new Date(fork.created_at).toDateString(); // Group by date
      forksPerDay[date] = (forksPerDay[date] || 0) + 1; // Increment fork count for that date
    });

    // Prepare data for the graph
    const graphData = Object.entries(forksPerDay).map(([date, count]) => ({
      date,
      count,
    }));

    // Set total forks
    setTotalForks(graphData.reduce((acc, fork) => acc + fork.count, 0));

    // Calculate forks in the last 14 days
    const currentDate = new Date();
    const fourteenDaysAgo = new Date(currentDate);
    fourteenDaysAgo.setDate(currentDate.getDate() - 14);

    const forksInLast14Days = graphData.filter(entry => 
      new Date(entry.date) >= fourteenDaysAgo
    ).reduce((acc, entry) => acc + entry.count, 0);

    // Set forks in the last 14 days
    setForksLast14Days(forksInLast14Days);

    // Pass data to graphData state
    setGraphData(graphData);
  } catch (error) {
    console.error('Error fetching fork data:', error);
  }
}

const generateDayLabels = (data) => {
  return data.map(entry => entry.date); // Extract dates for labels
};

export function Fork({ size, filter }) {
  const [totalForks, setTotalForks] = useState(0);
  const [graphData, setGraphData] = useState([]);
  const [forksLast14Days, setForksLast14Days] = useState(0);

  useEffect(() => {
    fetchForkData(setGraphData, setTotalForks, setForksLast14Days, filter);
  }, [filter]); // Added filter as a dependency to re-fetch data on change

  const data = graphData;
  const labelsData = generateDayLabels(data); // Generate labels from data

  return (
    <div className="chart-container"> {/* Use the new chart-container class */}
      <h2 className="grey-text">
        <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} /> {/* GitHub logo icon */}
        Total Number of Forks
      </h2>
      <p className="centered-text">{totalForks}</p> {/* Centered text */}

      {/* Forks in Last 14 Days Section at Bottom Corner */}
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '10px', color: 'white' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'normal' }}>
          Last 14 Days - {forksLast14Days > 0 
            ? `${forksLast14Days}`
            : 'No forks received in the last 14 days.'}
        </h3>
      </div>
    </div>
  );
}

export default Fork;
