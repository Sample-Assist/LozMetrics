import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import { BarChart } from '@mui/x-charts/BarChart';
import { FaAws } from "react-icons/fa";


// AWS configuration

const costExplorer = new AWS.CostExplorer({ apiVersion: '2017-10-25' });
const services = ['AWS WAF', 'Tax'];

const BlendedCostWidget = ({ size }) => {
  const [blendedCostData, setBlendedCostData] = useState({
    totalCost: 0,
    labels: [],
    values: [],
  });

  const getCurrentYearDates = () => {
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1); // January 1st of the current year
    const today = now.toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
    return { startDate: firstDayOfYear.toISOString().split('T')[0], endDate: today };
  };

  useEffect(() => {
    const fetchBlendedCostData = async () => {
      const { startDate, endDate } = getCurrentYearDates();

      const params = {
        TimePeriod: {
          Start: startDate,
          End: endDate,
        },
        Granularity: 'MONTHLY', // Monthly granularity for the whole year
        Metrics: ['BlendedCost'],
        Filter: {
          Dimensions: {
            Key: 'SERVICE',
            Values: services, // Filter specifically for AWS WAF
          },
        },
      
      };

      try {
        const data = await costExplorer.getCostAndUsage(params).promise();
        const labels = data.ResultsByTime.map(item => {
          const month = new Date(item.TimePeriod.Start).toLocaleString('default', { month: 'long' });
          return month;
        });
        const values = data.ResultsByTime.map(item => parseFloat(item.Total.BlendedCost.Amount));
        const totalCost = values.reduce((acc, cost) => acc + cost, 0);

        setBlendedCostData({
          totalCost: totalCost,
          labels: labels,
          values: values,
        });
      } catch (error) {
        console.error('Error fetching blended cost data:', error);
      }
    };

    fetchBlendedCostData();
  }, []);

  // Adjust chart size based on the 'size' prop
  let chartWidth, chartHeight;
  if (size === 'small') {
    chartWidth = 340;
    chartHeight = 250;
  } else if (size === 'medium') {
    chartWidth = 420;
    chartHeight = 300;
  } else if (size === 'large') {
    chartWidth = 600;
    chartHeight = 400;
  }

  return (
    <div>
      <h3 className="grey-text">
      <FaAws style={{fontSize: '30px', verticalAlign: 'middle', marginRight: '10px' }} /> 

        Blended Cost</h3>
      <div style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 'bold', marginTop: '10px' }}>
        Total Cost: ${blendedCostData.totalCost.toFixed(2)} {/* Format to 2 decimal places */}
      </div>
     
      <div className={`chart-stats-container ${size === 'large' ? 'vertical-layout' : 'horizontal-layout'}`}>
        <BarChart
          series={[{ data: blendedCostData.values }]}
          xAxis={[
            {
              data: blendedCostData.labels,
              scaleType: 'band',
              sx: {
                '& .MuiChartsAxis-tickLabel': {
                  fill: '#FFFFFF', // White tick labels
                  fontSize: '12px', // Adjust font size for readability
                },
                '& .MuiChartsAxis-label': {
                  fill: '#FFFFFF', // White axis label
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
                  fill: '#FFFFFF', // White tick labels on y-axis
                  fontSize: '12px',
                },
                '& .MuiChartsAxis-label': {
                  fill: '#FFFFFF', // White y-axis label
                  fontSize: '14px',
                  fontWeight: 'bold',
                },
              },
            },
          ]}
          height={chartHeight}
          width={chartWidth}
          grid={{ horizontal: false, vertical: false }}
          margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
        />
      </div>
      {/* Display total cost below the chart */}
     
    </div>
  );
};

export default BlendedCostWidget;
