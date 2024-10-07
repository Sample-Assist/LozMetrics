import { Octokit } from "@octokit/rest";
import React, { useEffect, useState } from "react";
import { Box } from '@mui/material';
import { FaSquareGithub } from "react-icons/fa6"; // Import GitHub logo icon from react-icons

const ViewMetrics = () => {
  const [totalViews, setTotalViews] = useState(null);
  const [uniqueVisitors, setUniqueVisitors] = useState(null);
  const [dailyViews, setDailyViews] = useState([]);

  useEffect(() => {
    const octokit = new Octokit({
    });

    async function fetchViewData() {
      try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/traffic/views', {
          owner: 'Lozie2002', // Replace with your GitHub username
          repo: 'aidanlozell.com', // Replace with your repository name
        });

        // Set total views, unique visitors, and daily views
        setTotalViews(response.data.count);
        setUniqueVisitors(response.data.uniques);
        setDailyViews(response.data.views); // Store daily view data
      } catch (error) {
        console.error("Error fetching view data:", error);
      }
    }

    fetchViewData();
  }, []);

  return (
    <div className="chart-container"> {/* Use the new chart-container class */}
            <h2 className="grey-text">
            <FaSquareGithub style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '5px', marginBottom: '5px' }} /> {/* GitHub logo icon */}

              Total Number of Vistors over the last 14 days</h2>
    <p className="centered-text">{totalViews}</p> {/* Centered text */}
  </div>
  );
};

export default ViewMetrics;
