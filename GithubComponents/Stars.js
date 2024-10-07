import * as React from 'react';
import { useState, useEffect } from 'react';
import { Octokit } from "@octokit/rest";
import '../App.css'; 
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons

// Replace with your secure token method
const octokit = new Octokit({
});

// Function to fetch star data and stars in the last 14 days
async function fetchStarData(setTotalStars, setStarsLast14Days) {
  try {
    // Fetch repository details from GitHub
    const repoData = await octokit.request('GET /repos/{owner}/{repo}', {
      owner: 'octocat', // GitHub's example user
      repo: 'Hello-World', // Example repository
      state: 'open',
      per_page: 100,
    });

    // Get the total stars from the repository
    const currentStars = repoData.data.stargazers_count;

    // Fetch events for the repository
    const events = await octokit.request('GET /repos/{owner}/{repo}/events', {
      owner: 'octocat', // GitHub's example user
      repo: 'Hello-World', // Example repository
      per_page: 100,
    });

    // Calculate stars added in the last 14 days
    const currentDate = new Date();
    const fourteenDaysAgo = new Date(currentDate);
    fourteenDaysAgo.setDate(currentDate.getDate() - 14);

    const starsInLast14Days = events.data.filter(event => {
      return event.type === 'WatchEvent' && new Date(event.created_at) >= fourteenDaysAgo;
    }).length;

    // Set total stars and stars in last 14 days
    setTotalStars(currentStars);
    setStarsLast14Days(starsInLast14Days);
  } catch (error) {
    console.error('Error fetching star data:', error);
  }
}

export function StarChart() {
    const [totalStars, setTotalStars] = useState(0);
    const [starsLast14Days, setStarsLast14Days] = useState(0);
  
    useEffect(() => {
      fetchStarData(setTotalStars, setStarsLast14Days).then(() => {
        console.log('Total Stars fetched:', totalStars);
      });
    }, []); // Fetch star data once on component mount
  
    return (
        <div className="chart-container"> {/* Use the new chart-container class */}
          <h2 className="grey-text">  
            <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} /> {/* GitHub logo icon */}
            Total Number of Stars
          </h2>
          <p className="centered-text">{totalStars}</p> {/* Centered text */}

         {/* Stars in Last 14 Days Section at Bottom Corner */}
         <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '10px', color: 'white' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'normal' }}>Last 14 Days - {starsLast14Days > 0 
                
                ? `${starsLast14Days}`
                : 'No stars received in the last 14 days.'}</h3>
           
              
            
          </div>
        </div>
      );
}

export default StarChart;
