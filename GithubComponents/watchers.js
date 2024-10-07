import * as React from 'react';
import { useState, useEffect } from 'react';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { Octokit } from "@octokit/rest";
import '../App.css'; 
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons

const octokit = new Octokit({
});

async function fetchWatchersData(setTotalWatchers, setWatchersLast14Days) {
  try {
    // Fetch watchers data from GitHub
    const response = await octokit.request('GET /repos/{owner}/{repo}', {
      owner: 'octocat', // GitHub's example user
      repo: 'Hello-World', // Example repository
      state: 'open',
      per_page: 100,
    });

    // Set total watchers
    setTotalWatchers(response.data.subscribers_count); // Using subscribers_count for watchers

    // Fetch events for the repository to calculate watchers in the last 14 days
    const events = await octokit.request('GET /repos/{owner}/{repo}/events', {
      owner: 'octocat',
      repo: 'Hello-World',
      per_page: 100,
    });

    // Calculate watchers added in the last 14 days
    const currentDate = new Date();
    const fourteenDaysAgo = new Date(currentDate);
    fourteenDaysAgo.setDate(currentDate.getDate() - 14);

    const watchersInLast14Days = events.data.filter(event => {
      return event.type === 'WatchEvent' && new Date(event.created_at) >= fourteenDaysAgo;
    }).length;

    // Set watchers in the last 14 days
    setWatchersLast14Days(watchersInLast14Days);

  } catch (error) {
    console.error('Error fetching watchers data:', error);
  }
}

export function Watchers({ size }) {
  const [totalWatchers, setTotalWatchers] = useState(0);
  const [watchersLast14Days, setWatchersLast14Days] = useState(0);

  useEffect(() => {
    fetchWatchersData(setTotalWatchers, setWatchersLast14Days);
  }, []); // Fetch data on component mount

  let graphWidth = 0, graphHeight = 0;
  if (size === 'small') {
    graphWidth = 340; graphHeight = 250;
  } else if (size === 'medium') {
    graphWidth = 420; graphHeight = 250;
  } else if (size === 'large') {
    graphWidth = 500; graphHeight = 350;
  }

  return (
    <div className="chart-container"> {/* Use the new chart-container class */}
      <h2 className="grey-text">
        <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} /> {/* GitHub logo icon */}
        Total Number of Watchers
      </h2>
      <p className="centered-text">{totalWatchers}</p> {/* Centered text */}

      {/* Watchers in Last 14 Days Section at Bottom Corner */}
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '10px', color: 'white' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'normal' }}>
          Last 14 Days - {watchersLast14Days > 0 
            ? `${watchersLast14Days}`
            : 'No watchers added in the last 14 days.'}
        </h3>
      </div>
    </div>
  );
}

export default Watchers;
