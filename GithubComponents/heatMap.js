import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { Heatmap } from '@mui/x-charts-pro/Heatmap';
import { Octokit } from '@octokit/rest';
import dayjs from 'dayjs';
import Typography from '@mui/material/Typography';

const octokit = new Octokit({
});

const GitHubHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCommits() {
      try {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/commits', {
            owner: 'octocat',
            repo: 'Hello-World',
          since: '2024-01-01T00:00:00Z',
          until: '2024-12-31T23:59:59Z',
          per_page: 100,
        });

        const groupedActivity = data.reduce((acc, commit) => {
          const date = dayjs(commit.commit.committer.date).format('YYYY-MM-DD');
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const heatmapFormattedData = Object.keys(groupedActivity).map(date => ({
          x: date,
          y: 'Commits',
          value: groupedActivity[date],
        }));

        setHeatmapData(heatmapFormattedData);
      } catch (error) {
        console.error("Error fetching commit activity:", error);
        setError("Failed to fetch commit activity. Please try again later.");
      }
    }

    fetchCommits();
  }, []);

  const COLORS = ['#FFFFFF', '#FF9F40', '#FF6384', '#36A2EB', '#9966FF'];

  return (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : heatmapData.length > 0 ? (
        <Heatmap
          series={[{
            data: heatmapData,
            colors: COLORS,
            xKey: 'x',
            yKey: 'y',
            valueKey: 'value',
          }]}
          width={600}
          height={400}
        />
      ) : (
        <Typography>No data available</Typography>
      )}
    </Box>
  );
};

export default GitHubHeatmap;
