// ClosedIssues.js
import React, { useState, useEffect } from 'react';
import { Octokit } from "@octokit/rest";
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons

const octokit = new Octokit({
});

async function fetchClosedIssuesData(setGraphData, setTotalIssues, setIssuesLast14Days, repo) {
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/issues', {
      owner: 'octocat', // GitHub's example user
      repo: 'Hello-World', // Example repository
      state: 'closed',
      per_page: 100,
    });

    // Filter out pull requests (if you want only issues)
    const issues = response.data.filter(issue => !issue.pull_request);
    
    // Set total closed issues
    const totalClosedIssues = issues.length;
    setTotalIssues(totalClosedIssues);
  
    // Prepare data for graph
    const graphData = [{ date: new Date().toLocaleDateString(), count: totalClosedIssues }];
    setGraphData(graphData);

    // Calculate closed issues in the last 14 days
    const currentDate = new Date();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(currentDate.getDate() - 14);

    const issuesInLast14Days = issues.filter(issue => new Date(issue.closed_at) >= fourteenDaysAgo).length;
    setIssuesLast14Days(issuesInLast14Days);
  } catch (error) {
    console.error("Error fetching closed issues:", error);
    setTotalIssues(0); // Set to 0 or handle the error appropriately
    setGraphData([]); // Clear graph data on error
  }
}

export function ClosedIssues({ size, filter, repo }) {
  const [totalClosedIssues, setTotalClosedIssues] = useState(0);
  const [issuesLast14Days, setIssuesLast14Days] = useState(0);
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    fetchClosedIssuesData(setGraphData, setTotalClosedIssues, setIssuesLast14Days, repo);
  }, [repo]); // Fetch data when repo changes

  return (
    <div className="chart-container"> {/* Use the new chart-container class */}
      <h2 className="grey-text">
        <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} /> {/* GitHub logo icon */}
        Total Number of Closed Issues
      </h2>
      <p className="centered-text">{totalClosedIssues}</p> {/* Centered text */}

      {/* Closed Issues in Last 14 Days Section at Bottom Corner */}
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '10px', color: 'white' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'normal' }}>
          Last 14 Days - {issuesLast14Days > 0 
            ? `${issuesLast14Days}`
            : 'No closed issues '}
        </h3>
      </div>
    </div>
  );
}

export default ClosedIssues;
