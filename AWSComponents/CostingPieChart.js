import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import { PieChart } from '@mui/x-charts/PieChart';
import { FaAws } from "react-icons/fa6";

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
            };

            try {
                const data = await costExplorer.getCostAndUsage(params).promise();
                const labels = data.ResultsByTime.map(item => new Date(item.TimePeriod.Start).toLocaleString('default', { month: 'long' }));
                const values = data.ResultsByTime.map(item => parseFloat(item.Total.BlendedCost.Amount));
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
            <h3 className="grey-text"><FaAws style={{ fontSize: '30px', verticalAlign: 'middle', marginRight: '10px' }} /> Blended Cost</h3>
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {!loading && !error && (
                <>
                    <div style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 'bold', marginTop: '10px' }}>
                        Total Cost: ${blendedCostData.totalCost.toFixed(2)}
                    </div>
                    <div className={`chart-stats-container ${size === 'large' ? 'vertical-layout' : 'horizontal-layout'}`}>
                        <PieChart
                            series={[{ data: blendedCostData.values.map((value, index) => ({ value, label: blendedCostData.labels[index] })) }]} // Format data for the pie chart
                            sx={{
                                '& .MuiChartsSlice-label': {
                                    fill: '#FFFFFF', // White label color
                                    fontSize: '12px',
                                },
                            }}
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
