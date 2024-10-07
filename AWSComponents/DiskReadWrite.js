import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import { LineChart } from '@mui/x-charts/LineChart';
import { Card, CardContent, Typography } from '@mui/material';
import { FaAws } from "react-icons/fa";


// AWS configuration


const cloudwatch = new AWS.CloudWatch();

const DiskReadWrite = ({ instanceId, size, filter }) => {
  const [networkData, setNetworkData] = useState({
    networkIn: [],
    networkOut: [],
    timestamps: [],
  });

  useEffect(() => {
    const fetchNetworkData = async () => {
      const params = {
        StartTime: new Date(Date.now() - 3600 * 1000), // 1 hour ago
        EndTime: new Date(),
        MetricName: 'DiskReadOps',
        Namespace: 'AWS/EC2',
        Period: 60, // Every 60 seconds
        Dimensions: [
            {
              Name: 'InstanceId',
              Value: 'i-0a728282deb5ffd97', // Make sure the instanceId is correct
            },
          ],
        Statistics: ['Sum'], // Sum of network bytes over each period
      };

      const paramsOut = { ...params, MetricName: 'NetworkOut' };

      try {
        const [networkInData, networkOutData] = await Promise.all([
          cloudwatch.getMetricStatistics(params).promise(),
          cloudwatch.getMetricStatistics(paramsOut).promise(),
        ]);

        const networkIn = networkInData.Datapoints.map((point) => point.Sum);
        const networkOut = networkOutData.Datapoints.map((point) => point.Sum);
        const timestamps = networkInData.Datapoints.map((point) =>
          new Date(point.Timestamp).toLocaleTimeString()
        );

        setNetworkData({ networkIn, networkOut, timestamps });
      } catch (error) {
        console.error('Error fetching network data:', error);
      }
    };

    fetchNetworkData();
  }, [instanceId]);

  const data = networkData.networkIn.map((inValue, index) => ({
    in: inValue,
    out: networkData.networkOut[index] || 0,
  }));
  const labelsData = networkData.timestamps;

  return (
    <Card sx={{ maxWidth: 600, margin: '0 auto', backgroundColor: '#333', color: 'white' }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom className="grey-text">
        <FaAws style={{fontSize: '30px', verticalAlign: 'middle', marginRight: '10px' }} /> 

          Network In/Out
        </Typography>
        <Typography variant="subtitle1" component="div" gutterBottom className="small-grey-text">
          Duration - {filter}
        </Typography>
        <div className={`chart-stats-container ${size === 'large' ? 'vertical-layout' : 'horizontal-layout'}`}>
          <LineChart
            series={[
              { name: 'Network In (Bytes)', data: networkData.networkIn },
              { name: 'Network Out (Bytes)', data: networkData.networkOut },
            ]}
            xAxis={[
              {
                data: labelsData,
                scaleType: 'band',
                tickSize: 10,
                sx: {
                  '& .MuiChartsAxis-tickLabel': {
                    fill: '#B0B0B0', // Light grey for tick labels
                    fontSize: '12px', // Adjust font size for readability
                  },
                  '& .MuiChartsAxis-label': {
                    fill: '#B0B0B0', // Light grey for axis labels
                    fontSize: '14px', // Slightly larger for emphasis
                    fontWeight: 'bold', // Bold labels for better visibility
                  },
                },
              },
            ]}
            yAxis={[
              {
                sx: {
                  '& .MuiChartsAxis-tickLabel': {
                    fill: '#B0B0B0', // Light grey for y-axis tick labels
                    fontSize: '12px', // Adjust font size for readability
                  },
                  '& .MuiChartsAxis-label': {
                    fill: '#B0B0B0', // Light grey for y-axis label
                    fontSize: '14px', // Slightly larger for emphasis
                    fontWeight: 'bold', // Bold labels for better visibility
                  },
                },
              },
            ]}
            colors={['green', 'blue']}
            height={200}
            width={300}
            grid={{ horizontal: false, vertical: false }}
            layout="vertical"
          />
          {(size === 'medium' || size === 'large') && (
            <div className="stats">
              <div className="chart-stats-container">
                <Typography variant="h6" component="div">
                  {networkData.networkIn.reduce((a, b) => a + b, 0)} Bytes
                </Typography>
                <Typography variant="body2" component="div">
                  Total Network In
                </Typography>
              </div>
              <div className="chart-stats-container">
                <Typography variant="h6" component="div">
                  {networkData.networkOut.reduce((a, b) => a + b, 0)} Bytes
                </Typography>
                <Typography variant="body2" component="div">
                  Total Network Out
                </Typography>
              </div>
              <div className="chart-stats-container">
                <Typography variant="h6" component="div">
                  {(networkData.networkOut.reduce((a, b) => a + b, 0) / networkData.networkIn.reduce((a, b) => a + b, 0) * 100).toFixed(2)}%
                </Typography>
                <Typography variant="body2" component="div">
                  Network Trend
                </Typography>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiskReadWrite;
