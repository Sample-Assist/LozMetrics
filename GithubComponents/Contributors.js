import * as React from 'react';
import { useEffect, useState } from 'react';
import { Octokit } from '@octokit/rest';
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons

// Initialize Octokit
const octokit = new Octokit({
});

const fetchContributors = async () => {
  try {
    const { data } = await octokit.repos.listContributors({
      owner: 'octocat', // GitHub's example user
      repo: 'Hello-World', // Example repository
    });

    // Sort contributors in ascending order by number of contributions
    const sortedContributors = data.sort((a, b) => a.contributions - b.contributions);
    return sortedContributors;
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return [];
  }
};

export default function ContributorsList() {
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    const getContributors = async () => {
      const contributorsData = await fetchContributors();
      setContributors(contributorsData);
    };

    getContributors();
  }, []);

  return (
    <div className="contributors-container">
      <h2 className="grey-text">
        <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} /> {/* GitHub logo icon */}
        List of Top Contributors
      </h2>
  
      <table className="contributors-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Members</th>
            <th># Commits</th>
          </tr>
        </thead>
        <tbody>
          {contributors.slice(0, 10).map((contributor, index) => ( // Only take the top 10 contributors
            <tr key={contributor.id} className="contributor-item">
              <td>{index + 1}</td> {/* Rank */}
              <td style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src={contributor.avatar_url} 
                  alt={`${contributor.login}'s avatar`} 
                  className="contributor-avatar" 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} 
                /> {/* Add the user's photo */}
                <a href={contributor.html_url} target="_blank" rel="noopener noreferrer" className="contributor-link truncate">
                  {contributor.login}
                </a>
              </td>
              <td>{contributor.contributions}</td> {/* # Commits */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
