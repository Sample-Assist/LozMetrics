import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import { Bar } from 'react-chartjs-2'; // Import the Bar component from react-chartjs-2
import { FaAws } from "react-icons/fa6";
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

// AWS configuration

const costExplorer = new AWS.CostExplorer({ apiVersion: '2017-10-25' });

const BlendedCostWidget = ({ size }) => {
    const [blendedCostData, setBlendedCostData] = useState({ totalCost: 0, labels: [], values: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getCurrentYearDates = () => {
        const now = new Date();
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
        const today = now.toISOString().split('T')[0];
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
                Granularity: 'MONTHLY',
                Metrics: ['BlendedCost'],
                GroupBy: [
                    {
                        Key: 'SERVICE', // Group by service
                        Type: 'DIMENSION',
                    },
                ],
            };

            try {
                const data = await costExplorer.getCostAndUsage(params).promise();
                const serviceCostMap = {};

                data.ResultsByTime.forEach(monthData => {
                    monthData.Groups.forEach(group => {
                        const serviceName = group.Keys[0];
                        const costAmount = parseFloat(group.Metrics.BlendedCost.Amount);

                        if (!serviceCostMap[serviceName]) {
                            serviceCostMap[serviceName] = 0;
                        }
                        serviceCostMap[serviceName] += costAmount;
                    });
                });

                const labels = Object.keys(serviceCostMap);
                const values = Object.values(serviceCostMap);
                const totalCost = values.reduce((acc, cost) => acc + cost, 0);

                setBlendedCostData({ totalCost, labels, values });
            } catch (error) {
                console.error('Error fetching blended cost data:', error);
                setError('Failed to fetch data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchBlendedCostData();
    }, []);

    // Prepare data for Chart.js
    const chartData = {
        labels: blendedCostData.labels,
        datasets: [
            {
                label: 'Blended Cost',
                data: blendedCostData.values,
                backgroundColor: 'rgba(75, 192, 192, 0.6)', // Example color
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Define chart options
    const options = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    // Define chart dimensions based on the size prop
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
                <FaAws style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '10px' }} /> Blended Cost
            </h3>
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {!loading && !error && (
                <>
                    <div style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 'bold', marginTop: '10px' }}>
                        Total Cost: ${blendedCostData.totalCost.toFixed(2)}
                    </div>
                    <div className={`chart-stats-container ${size === 'large' ? 'vertical-layout' : 'horizontal-layout'}`}>
                        <Bar 
                            data={chartData} 
                            options={options} 
                            height={chartHeight}
                            width={chartWidth} 
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default BlendedCostWidget;
