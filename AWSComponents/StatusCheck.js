import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import { LineChart } from '@mui/x-charts/LineChart';
import { Card, CardContent, Typography } from '@mui/material';
import { FaAws } from "react-icons/fa";


// AWS configuration


const cloudwatch = new AWS.CloudWatch();

const StatusCheck = ({ instanceId, size, filter }) => {
  const [statusData, setStatusData] = useState({
    statusCheckFailed: [],
    instanceCheckFailed: [],
    systemCheckFailed: [],
    timestamps: [],
  });

  useEffect(() => {
    const fetchStatusData = async () => {
      const params = {
        StartTime: new Date(Date.now() - 3600 * 1000), // 1 hour ago
        EndTime: new Date(),
        MetricName: 'StatusCheckFailed',
        Namespace: 'AWS/EC2',
        Period: 60, // Every 60 seconds
        Dimensions: [
            {
              Name: 'InstanceId',
              Value: 'i-0a728282deb5ffd97', // Make sure the instanceId is correct
            },
          ],
        Statistics: ['Sum'], // Sum of status checks failed over each period
      };

      const paramsInstance = { ...params, MetricName: 'StatusCheckFailed_Instance' };
      const paramsSystem = { ...params, MetricName: 'StatusCheckFailed_System' };

      try {
        const [statusCheckData, instanceCheckData, systemCheckData] = await Promise.all([
          cloudwatch.getMetricStatistics(params).promise(),
          cloudwatch.getMetricStatistics(paramsInstance).promise(),
          cloudwatch.getMetricStatistics(paramsSystem).promise(),
        ]);

        const statusCheckFailed = statusCheckData.Datapoints.map((point) => point.Sum);
        const instanceCheckFailed = instanceCheckData.Datapoints.map((point) => point.Sum);
        const systemCheckFailed = systemCheckData.Datapoints.map((point) => point.Sum);
        const timestamps = statusCheckData.Datapoints.map((point) =>
          new Date(point.Timestamp).toLocaleTimeString()
        );

        setStatusData({ statusCheckFailed, instanceCheckFailed, systemCheckFailed, timestamps });
      } catch (error) {
        console.error('Error fetching status data:', error);
      }
    };

    fetchStatusData();
  }, [instanceId]);

  const data = {
    labels: statusData.timestamps,
    datasets: [
      {
        label: 'Total Status Check Failed',
        data: statusData.statusCheckFailed,
        borderColor: 'red',
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Instance Check Failed',
        data: statusData.instanceCheckFailed,
        borderColor: 'orange',
        fill: false,
        tension: 0.1,
      },
      {
        label: 'System Check Failed',
        data: statusData.systemCheckFailed,
        borderColor: 'yellow',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  return (
    <Card sx={{ maxWidth: 600, margin: '0 auto', backgroundColor: '#333', color: 'white' }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom className="grey-text">
        <FaAws style={{fontSize: '30px', verticalAlign: 'middle', marginRight: '10px' }} /> 
        Status Check Failed
        </Typography>
        <Typography variant="subtitle1" component="div" gutterBottom className="small-grey-text">
          Duration - {filter}
        </Typography>
        <div className={`chart-stats-container ${size === 'large' ? 'vertical-layout' : 'horizontal-layout'}`}>
          <LineChart
            series={data.datasets}
            xAxis={[{
              data: statusData.timestamps,
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
            }]}
            yAxis={[{
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
            }]}
            colors={['red', 'orange', 'yellow']}
            height={400}
            width={600}
            grid={{ horizontal: false, vertical: false }}
            layout="vertical"
          />
          {(size === 'medium' || size === 'large') && (
            <div className="stats">
              <div className="chart-stats-container">
                <Typography variant="h6" component="div">
                  {statusData.statusCheckFailed.reduce((a, b) => a + b, 0)} Checks Failed
                </Typography>
                <Typography variant="body2" component="div">
                  Total Status Check Failed
                </Typography>
              </div>
              <div className="chart-stats-container">
                <Typography variant="h6" component="div">
                  {statusData.instanceCheckFailed.reduce((a, b) => a + b, 0)} Checks Failed
                </Typography>
                <Typography variant="body2" component="div">
                  Total Instance Check Failed
                </Typography>
              </div>
              <div className="chart-stats-container">
                <Typography variant="h6" component="div">
                  {statusData.systemCheckFailed.reduce((a, b) => a + b, 0)} Checks Failed
                </Typography>
                <Typography variant="body2" component="div">
                  Total System Check Failed
                </Typography>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCheck;
