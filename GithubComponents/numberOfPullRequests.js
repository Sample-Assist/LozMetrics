import * as React from 'react';
import { useState, useEffect } from 'react';
import { Octokit } from "@octokit/rest";
import '../App.css'; 
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons

const octokit = new Octokit({
});

// Fetch pull request data from GitHub
async function fetchPullRequestData(setGraphData, setTotalPRs, setTotalPRsLast14Days, filter) {
    const pulls = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
        owner: 'octocat', // GitHub's example user
        repo: 'Hello-World', // Example repository
        state: 'all', // Fetch both open and closed pull requests
        per_page: 100, // Adjust based on your needs
    });

    // Calculate the date 14 days ago
    const today = new Date();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(today.getDate() - 14);

    // Calculate the number of pull requests per day
    const prsPerDay = {};
    let totalPRsLast14Days = 0; // Variable to hold the total PRs for the last 14 days

    pulls.data.forEach(pr => {
        const prDate = new Date(pr.created_at);
        const date = prDate.toDateString(); // Group by date

        // Increment count for the overall total
        prsPerDay[date] = (prsPerDay[date] || 0) + 1;

        // Check if the PR is within the last 14 days
        if (prDate >= fourteenDaysAgo) {
            totalPRsLast14Days++; // Increment the total for the last 14 days
        }
    });

    // Prepare data for the graph
    const graphData = Object.entries(prsPerDay).map(([date, count]) => ({
        date,
        count,
    }));

    // Set total pull requests
    setTotalPRs(graphData.reduce((acc, pr) => acc + pr.count, 0));

    // Set total pull requests for the last 14 days
    setTotalPRsLast14Days(totalPRsLast14Days);

    // Pass data to graphData state
    setGraphData(graphData);
}

const generateDayLabels = (data) => {
    return data.map(entry => entry.date); // Extract dates for labels
};

export function PullRequests({ size, filter }) {
    const [totalPRs, setTotalPRs] = useState(0);
    const [totalPRsLast14Days, setTotalPRsLast14Days] = useState(0); // State for last 14 days total
    const [graphData, setGraphData] = useState([]);

    useEffect(() => {
        fetchPullRequestData(setGraphData, setTotalPRs, setTotalPRsLast14Days, filter);
    }, [filter]); // Added filter as a dependency to re-fetch data on change

    const data = graphData;
    const labelsData = generateDayLabels(data); // Generate labels from data

    return (
        <div className="chart-container"> {/* Use the new chart-container class */}
            <h2 className="grey-text">
                <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} /> {/* GitHub logo icon */}
                Total Number of Pull Requests</h2>
            <p className="centered-text">{totalPRs}</p> {/* Centered text */}

            {/* Last 14 Days Section */}
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '10px', color: 'white' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'normal' }}>
                    Last 14 Days - {totalPRsLast14Days > 0 
                        ? `${totalPRsLast14Days}`
                        : 'No pull requests received in the last 14 days.'}
                </h3>
            </div>
        </div>
    );
}

export default PullRequests;
