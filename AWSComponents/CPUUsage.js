import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { GaugeContainer, GaugeValueArc, GaugeReferenceArc, useGaugeState } from '@mui/x-charts/Gauge';
import { FaAws } from "react-icons/fa6"; // Import AWS icon from react-icons

// AWS configuration


const cloudwatch = new AWS.CloudWatch();

// Gauge pointer component
function GaugePointer() {
  const { valueAngle, outerRadius, cx, cy } = useGaugeState();

  if (valueAngle === null) {
    // No value to display
    return null;
  }

  const target = {
    x: cx + outerRadius * Math.sin(valueAngle),
    y: cy - outerRadius * Math.cos(valueAngle),
  };

  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="red" />
      <path
        d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
        stroke="red"
        strokeWidth={3}
      />
    </g>
  );
}

const CpuWidget = ({ instanceId }) => {
  const [cpuUtilization, setCpuUtilization] = useState(0);

  useEffect(() => {
    const fetchCpuData = async () => {
      const params = {
        StartTime: new Date(Date.now() - 3600 * 1000), // 1 hour ago
        EndTime: new Date(),
        MetricName: 'CPUUtilization',
        Namespace: 'AWS/EC2',
        Period: 60, // Every 60 seconds
        Dimensions: [
          {
            Name: 'InstanceId',
            Value: instanceId, // Ensure the correct instanceId is passed
          },
        ],
        Statistics: ['Average'],
      };

      try {
        const data = await cloudwatch.getMetricStatistics(params).promise();
        const cpuValues = data.Datapoints.map((point) => point.Average);
        const avgCpu = cpuValues.length ? cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length : 0;
        setCpuUtilization(avgCpu);
      } catch (error) {
        console.error('Error fetching CPU data:', error);
      }
    };

    fetchCpuData();
  }, [instanceId]);

  return (
    <div>
      {/* Add AWS icon from react-icons before the header */}
      <h3 className="grey-text">
        <FaAws style={{fontSize: '30px', verticalAlign: 'middle', marginRight: '10px' }} /> 
        CPU Usage
      </h3>

      <GaugeContainer
        width={300}
        height={280}
        startAngle={-110}
        endAngle={110}
        value={cpuUtilization}
      >
        <GaugeReferenceArc />
        <GaugeValueArc />
        <GaugePointer />
      </GaugeContainer>

      {/* Display percentage value below the gauge */}
      <div style={{ textAlign: 'center', marginTop: '0px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
        {cpuUtilization.toFixed(2)}%
      </div>
    </div>
  );
};

export default CpuWidget;
