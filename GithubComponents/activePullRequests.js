import * as React from 'react';
import { useState, useEffect } from 'react';
import { Octokit } from "@octokit/rest";
import '../App.css'; 
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons

const octokit = new Octokit({
});

// Fetch pull request data from GitHub
async function fetchActivePullRequests(setActivePRs, filter) {
  const pulls = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
     owner: 'octocat', // GitHub's example user
     repo: 'Hello-World', // Example repository
    state: 'all', // Fetch both open and closed pull requests
    per_page: 100, // Adjust based on your needs
  });

  // Get activity counts for each pull request
  const activityData = await Promise.all(pulls.data.map(async (pr) => {
    const { data: comments } = await octokit.request(`GET /repos/{owner}/{repo}/issues/${pr.number}/comments`, {
      owner: 'octocat',
      repo: 'Hello-World',
    });

    const { data: reviews } = await octokit.request(`GET /repos/{owner}/{repo}/pulls/${pr.number}/reviews`, {
      owner: 'octocat',
      repo: 'Hello-World',
    });

    // Return the pull request object along with the number of activities
    return {
      ...pr,
      activityCount: comments.length + reviews.length, // Combine number of comments and reviews as "activities"
    };
  }));

  // Sort pull requests by activity count
  const sortedPulls = activityData.sort((a, b) => b.activityCount - a.activityCount);

  // Optionally, filter the top N pull requests
  const topPullRequests = sortedPulls.slice(0, 5); // Adjust '5' to show the number of active PRs you want

  // Set the active pull requests state
  setActivePRs(topPullRequests);
}

export function TopActivePullRequests({ size }) { // Accept size prop
  const [activePRs, setActivePRs] = useState([]);

  useEffect(() => {
    fetchActivePullRequests(setActivePRs);
  }, []); // Removed filter from dependency array to fetch without filter

  // Set container dimensions and font size based on size prop
  let containerStyles = {};
  let tableStyles = {};
  if (size === 'small') {
    containerStyles = { width: '340px', height: '250px' };
    tableStyles = { fontSize: '10px' }; // Smaller font for small size
  } else if (size === 'medium') {
    containerStyles = { width: '620px', height: '300px' };
    tableStyles = { fontSize: '12px' };
  } else if (size === 'large') {
    containerStyles = { width: '600px', height: '850px' };
    tableStyles = { fontSize: '14px' }; // Larger font for large size
  }

  return (
    <div className="chart-container" style={containerStyles}> {/* Apply dynamic styles */}
      <h2 className="grey-text">
        <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} /> {/* GitHub logo icon */}
        Top Active Pull Requests
      </h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', ...tableStyles }}> {/* Apply dynamic font size */}
        <thead>
          <tr style={{ backgroundColor: '#333' }}> {/* Header row background color */}
            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #555', fontWeight: 'bold' }}>#</th> {/* Number column */}
            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #555', fontWeight: 'bold' }}>Pull Request</th>
            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #555', fontWeight: 'bold' }}>Number of Activities</th>
          </tr>
        </thead>
        <tbody>
          {activePRs.map((pr, index) => (
            <tr key={pr.id} style={{ backgroundColor: index % 2 === 0 ? '#444' : '#555', transition: 'background-color 0.3s' }}> {/* Alternating row colors */}
              <td style={{ padding: '12px', borderBottom: '1px solid #666', fontWeight: 'bold' }}>
                {index + 1}
              </td>
              <td style={{ padding: '12px', borderBottom: '1px solid #666', textAlign: 'left', fontWeight: 'bold' }}>
                <a href={pr.html_url} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }} onMouseEnter={e => e.target.style.textDecoration = 'underline'} onMouseLeave={e => e.target.style.textDecoration = 'none'}>
                  {pr.title} (#{pr.number})
                </a>
              </td>
              <td style={{ padding: '12px', borderBottom: '1px solid #666', fontWeight: 'bold' }}>
                {pr.activityCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TopActivePullRequests;
