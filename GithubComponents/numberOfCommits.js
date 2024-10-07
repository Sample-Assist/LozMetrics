import * as React from 'react';
import { useState, useEffect } from 'react';
import { Octokit } from "@octokit/rest";
import '../App.css'; 
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons

const octokit = new Octokit({
});

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
    let totalCommitsCount = 0; // Initialize total commits count
    let totalCommitsLast14DaysCount = 0; // Initialize commits count for the last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14); // Calculate the date 14 days ago

    commits.data.forEach(commit => {
      const date = new Date(commit.commit.author.date);
      const dateString = date.toDateString(); // Group by date
      commitsPerDay[dateString] = (commitsPerDay[dateString] || 0) + 1; // Increment commit count for that date
      
      // Increment total commits count
      totalCommitsCount++;

      // Check if the commit is within the last 14 days
      if (date >= fourteenDaysAgo) {
        totalCommitsLast14DaysCount++;
      }
    });

    // Prepare data for the graph
    const graphData = Object.entries(commitsPerDay).map(([date, count]) => ({
      date,
      count,
    }));

    // Set total commits and total commits in the last 14 days
    setTotalCommits(totalCommitsCount);
    setTotalCommitsLast14Days(totalCommitsLast14DaysCount);

    // Pass data to graphData state
    setGraphData(graphData);
  } catch (error) {
    console.error("Error fetching commit data:", error);
    setError("Failed to fetch commit data. Please try again later."); // Set error message
  }
}

const generateDayLabels = (data) => {
  return data.map(entry => entry.date); // Extract dates for labels
};

export function Commits({ size, filter }) {
  const [totalCommits, setTotalCommits] = useState(0);
  const [totalCommitsLast14Days, setTotalCommitsLast14Days] = useState(0); // State for total commits in the last 14 days
  const [graphData, setGraphData] = useState([]);
  const [error, setError] = useState(null); // State for error handling
  const [loading, setLoading] = useState(true); // State for loading

  useEffect(() => {
    setLoading(true); // Set loading to true before fetching
    fetchCommitData(setGraphData, setTotalCommits, setTotalCommitsLast14Days, setError, filter)
      .finally(() => setLoading(false)); // Set loading to false after fetching
  }, [filter]); // Added filter as a dependency to re-fetch data on change

  const data = graphData;
  const labelsData = generateDayLabels(data); // Generate labels from data

  return (
    <div className="chart-container">
      <h2 className="grey-text">
        <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} /> {/* GitHub logo icon */}
        Total Number of Commits
      </h2>
      <p className="centered-text">{totalCommits}</p> {/* Centered text */} {/* Fixed totalCommitsCount reference */}

      {loading ? ( // Display loading message
        <p className="centered-text">Loading...</p>
      ) : error ? ( // Display error message if there is an error
        <p className="centered-text error-text">{error}</p>
      ) : (
        <>
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '10px', color: 'white' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'normal' }}>
            Last 14 Days - {totalCommitsLast14Days > 0 
              ? `${totalCommitsLast14Days} commits`
              : 'No commits in the last 14 days.'}
              </h3>
          </div>
        </>
      )}
    </div>
  );
}

export default Commits;
