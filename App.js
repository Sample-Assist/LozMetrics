import './App.css';
import React, { useState } from 'react';

import { FrequencyOfDeployment } from './GithubComponents/FrequencyOfDeployment.js'; 
import { LeadTime } from './GithubComponents/leadTime.js';
import Churnrate from './GithubComponents/ChurnRate.js';
import { Fork } from './GithubComponents/fork.js';
import Stars from './GithubComponents/Stars.js';


import { Watchers } from './GithubComponents/watchers.js'; // Import the new Watchers component
import { OpenIssues } from './GithubComponents/openIssues.js'; // Import the new OpenIssues component
import { ClosedIssues } from './GithubComponents/closedIssues.js';
import Contributors from './GithubComponents/Contributors.js';
import { LanguageChart } from './GithubComponents/programmingLanguages.js';
import { ChangeFailureRate } from './GithubComponents/FailureRate.js';
import {Commits} from './GithubComponents/numberOfCommits.js';
import {PullRequests} from './GithubComponents/numberOfPullRequests.js';
import {TopActivePullRequests} from './GithubComponents/activePullRequests.js';
import ContributorsBarChart from './GithubComponents/contributorsBarchart.js';
import {CommitsBarGraph} from './GithubComponents/commitsbarGraph.js';
import {PullRequestsBarChart} from './GithubComponents/pullRequestBarChart.js';
import {CodeMetrics} from './GithubComponents/ContributorPieChart.js';
import GitHubHeatmap from './GithubComponents/heatMap';



import CpuWidget  from './AWSComponents/CPUUsage.js';
import NetworkWidget from './AWSComponents/networkIn.js';
import DiskReadWrite from './AWSComponents/DiskReadWrite.js';
import StatusCheck from './AWSComponents/StatusCheck.js';  
import CostWidget from './AWSComponents/costing.js'; // Import the new CostWidget component
import CostBreakdownWidget from './AWSComponents/costingBreakdown.js'; // Import the new CostBreakdownWidget component
import Traffic from './GithubComponents/Traffic.js'; // Import the new Traffic component
import TrafficGraph from './GithubComponents/TrafficGraph.js'; // Import the new Traffic component
import AWSCostPieChart from './AWSComponents/CostingPieChart.js'; // Import the new CostingPieChart component
import CostingServicesPieChart from './AWSComponents/CostingServicesPieChart.js'; // Import the new CostingServicesPieChart component
import CostingStackBarChart from './AWSComponents/CostingStackBarChart.js'; // Import the new CostingStackBarChart component

import logo from './Images/logo.jpg';
import { FaCog, FaPlus, FaAngleRight } from 'react-icons/fa';
import { FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';

// Main App Component
function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [filterBy, setFilter] = useState('week');
  const [repo, setRepo] = useState('jdaunt0.github.io');
  const [doraType, setDoraType] = useState('FreqDeploy');
  const [githubType, setGithubType] = useState('Stars');
  const [awsType, setAwsType] = useState('EC2Instances'); // New state for AWS type
  const [widgetSize, setSize] = useState('small');
  const [widgets, setWidgets] = useState([]);
  const [bgColor, setBgColor] = useState('#0366d6'); // Initial background color

  


  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const addDoraWidget = () => {
    // Add the Dora widget with its settings
    if (!filterBy || !repo || !doraType) return;
    setWidgets([...widgets, { id: widgets.length, filter: filterBy, repo, type: doraType, size: widgetSize }]);
  };

  const addGithubWidget = () => {
    // Only add the widget if the filterBy, repo, and githubType values are valid.
    if (!filterBy || !repo || !githubType) return;
  
    // Allow adding any size for Stars and Fork.
    setWidgets([...widgets, { id: widgets.length, filter: filterBy, repo, type: githubType, size: widgetSize }]);
  };

  const addAwsWidget = () => {
    if (!filterBy || !repo || !awsType) return;
    setWidgets([...widgets, { id: widgets.length, filter: filterBy, repo, type: awsType, size: widgetSize }]);
  };

  const clearWidgets = () => {
    setWidgets([]);
  };

  const updateWidgetSize = (id, newSize) => {
    // Prevent size change for Stars and Fork widgets
    
    
    setWidgets(widgets.map(widget => (widget.id === id ? { ...widget, size: newSize } : widget)));
  };

  return (
    <div className="App">
       <Sidebar
        isSidebarOpen={isSidebarOpen}
        filterBy={filterBy}
        setFilter={setFilter}
        repo={repo}
        setRepo={setRepo}
        doraType={doraType}
        setDoraType={setDoraType}
        githubType={githubType}
        setGithubType={setGithubType}
        awsType={awsType} // Pass AWS type to sidebar
        setAwsType={setAwsType} // Pass function to set AWS type
        widgetSize={widgetSize}
        setSize={setSize}
        addDoraWidget={addDoraWidget}
        addGithubWidget={addGithubWidget}
        addAwsWidget={addAwsWidget} // Pass function to add AWS widget
        clearWidgets={clearWidgets}
        toggleSidebar={toggleSidebar}
      />


      <header className="App-header">
        <div>
          <button className="menu" onClick={toggleSidebar}>☰</button>
          <h1>Digiwise</h1>
        </div>
        <img className="logo" src={logo} alt="Logo" width="188" height="49" />
      </header>

      <div className="dashboard">
        <div className="widgets-container">
          {widgets.filter(widget => widget.type !== 'Stars' && widget.type !== 'Fork').map(widget => (
            <Widget
              key={widget.id}
              size={widget.size}
              repo={widget.repo}
              type={widget.type}
              filter={widget.filter}
              onSizeChange={(newSize) => updateWidgetSize(widget.id, newSize)}
            />
          ))}
        </div>

        <div className="widgets-container">
          {widgets.filter(widget => widget.type === 'Stars' || widget.type === 'Fork').map(widget => (
            <Widget
              key={widget.id}
              size="small" // Forcing size to small for these widgets
              repo={widget.repo}
              type={widget.type}
              filter={widget.filter}
              onSizeChange={() => updateWidgetSize(widget.id, 'small')} // Prevent size change
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Widget Component
function Widget({ filter, repo, type, size }) {
  return (
    <div className={`widget widget-${size}`}>
      {type === 'FreqDeploy' && <FrequencyOfDeployment size={size} filter={filter} />}
      {type === 'Stars' && <Stars size={size} filter={filter} />} {/* No longer enforcing size */}
      {type === 'Fork' && <Fork size={size} filter={filter} />} {/* No longer enforcing size */}
      {type === 'LeadTime' && <LeadTime size={size} filter={filter} />}
      {type === 'ChurnRate' && <Churnrate size={size} filter={filter} />}
      {type === 'Watchers' && <Watchers size={size} filter={filter} repo={repo} />}
      {type === 'OpenIssues' && <OpenIssues size={size} filter={filter} repo={repo} />}
      {type === 'ClosedIssues' && <ClosedIssues size={size} filter={filter} repo={repo} />}
      {type === 'Contributors' && <Contributors size={size} filter={filter} repo={repo} />}
      {type === 'ProgrammingLanguages' && <LanguageChart size={size} filter={filter} repo={repo} />}
      {type === 'ChangeFailureRate' && <ChangeFailureRate size={size} filter={filter} repo={repo} />}
      {type === 'CpuWidget' && <CpuWidget size={size} filter={filter} repo={repo} />}
      {type === 'NetworkWidget' && <NetworkWidget size={size} filter={filter} repo={repo} />}
      {type === 'DiskReadWrite' && <DiskReadWrite size={size} filter={filter} repo={repo} />}
      {type === 'StatusCheck' && <StatusCheck size={size} filter={filter} repo={repo} />}
      {type === 'CostWidget' && <CostWidget size={size} filter={filter} repo={repo} />}
      {type === 'CostBreakdownWidget' && <CostBreakdownWidget size={size} filter={filter} repo={repo} />}
      {type === 'Traffic' && <Traffic size={size} filter={filter} repo={repo} />}
      {type === 'TrafficGraph' && <TrafficGraph size={size} filter={filter} repo={repo} />}
      {type === 'Commits' && <Commits size={size} filter={filter} repo={repo} />}
      {type === 'PullRequests' && <PullRequests size={size} filter={filter} repo={repo} />}
      {type === 'TopActivePullRequests' && <TopActivePullRequests size={size} filter={filter} repo={repo} />}
      {type === 'ContributorsBarChart' && <ContributorsBarChart size={size} filter={filter} repo={repo} />}
      {type === 'CommitsBarGraph' && <CommitsBarGraph size={size} filter={filter} repo={repo} />}
      {type === 'PullRequestsBarChart' && <PullRequestsBarChart size={size} filter={filter} repo={repo} />}
      {type === 'CodeMetrics' && <CodeMetrics size={size} filter={filter} repo={repo} />}
      {type === 'GitHubHeatmap' && <GitHubHeatmap size={size} filter={filter} repo={repo} />}
      {type === 'AWSCostPieChart' && <AWSCostPieChart size={size} filter={filter} repo={repo} />}
      {type === 'CostingServicesPieChart' && <CostingServicesPieChart size={size} filter={filter} repo={repo} />}
      {type === 'CostingStackBarChart' && <CostingStackBarChart size={size} filter={filter} repo={repo} />}
    </div>
  );
}


// Sidebar Component
const Sidebar = ({
  isSidebarOpen,
  filterBy,
  setFilter,
  repo,
  setRepo,
  doraType,
  setDoraType,
  githubType,
  setGithubType,
  awsType,
  setAwsType, // New prop for setting AWS type
  widgetSize,
  setSize,
  addDoraWidget,
  addGithubWidget,
  addAwsWidget, // New prop for adding AWS widget
  clearWidgets,

}) => {
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [doraExpanded, setDoraExpanded] = useState(false);
  const [githubExpanded, setGithubExpanded] = useState(false);
  const [awsExpanded, setAwsExpanded] = useState(false); // New state for AWS section
  const [modifyExpanded, setModifyExpanded] = useState(false);
  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <h2 className="centered-header">Dashboard Options</h2>
      
      <h2 onClick={() => setSettingsExpanded(!settingsExpanded)} style={{ cursor: 'pointer' }}>
        <FaCog /> Settings 
        {settingsExpanded ? <FaAngleRight style={{ transform: 'rotate(90deg)' }} /> : <FaAngleRight />}
      </h2>
      {settingsExpanded && (
        <div style={{ paddingLeft: "35px" }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Filter By</InputLabel>
            <Select value={filterBy} onChange={(e) => setFilter(e.target.value)}>
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="year">Year</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>GitHub Repo</InputLabel>
            <Select value={repo} onChange={(e) => setRepo(e.target.value)}>
              <MenuItem value="repo1">Not finished</MenuItem>
              <MenuItem value="repo2">Dashboard</MenuItem>
              <MenuItem value="repo3">Check again</MenuItem>
              <MenuItem value="repo4">jdaunt0.github.io</MenuItem>
            </Select>
          </FormControl>
        </div>
      )}

      <h2 onClick={() => setDoraExpanded(!doraExpanded)} style={{ cursor: 'pointer' }}>
        DORA Metrics 
        {doraExpanded ? <FaAngleRight style={{ transform: 'rotate(90deg)' }} /> : <FaAngleRight />}
      </h2>
      {doraExpanded && (
        <div style={{ paddingLeft: "35px" }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>DORA Type</InputLabel>
            <Select value={doraType} onChange={(e) => setDoraType(e.target.value)}>
              <MenuItem value="FreqDeploy">Frequency of Deployment</MenuItem>
              <MenuItem value="LeadTime">Lead Time for Changes</MenuItem>
              <MenuItem value="ChangeFailureRate">Change Failure Rate</MenuItem>
              <MenuItem value="ChurnRate">Churn Rate</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Widget Size</InputLabel>
            <Select value={widgetSize} onChange={(e) => setSize(e.target.value)}>
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="large">Large</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={addDoraWidget} variant="contained" color="primary">Add DORA Widget</Button>
        </div>
      )}

      <h2 onClick={() => setGithubExpanded(!githubExpanded)} style={{ cursor: 'pointer' }}>
        GitHub Metrics 
        {githubExpanded ? <FaAngleRight style={{ transform: 'rotate(90deg)' }} /> : <FaAngleRight />}
      </h2>
      {githubExpanded && (
        <div style={{ paddingLeft: "35px" }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>GitHub Type</InputLabel>
            <Select value={githubType} onChange={(e) => setGithubType(e.target.value)}>
              <MenuItem value="Stars">Stars</MenuItem>
              <MenuItem value="Fork">Fork</MenuItem>
              <MenuItem value="Watchers">Watchers</MenuItem>
              <MenuItem value="OpenIssues">Open Issues</MenuItem>
              <MenuItem value="ClosedIssues">Closed Issues</MenuItem>
              <MenuItem value="Contributors">Contributors List</MenuItem>
              <MenuItem value="ContributorsBarChart">Contributors Bar Chart</MenuItem>

              <MenuItem value="ProgrammingLanguages">Programming Languages</MenuItem>
              <MenuItem value="Traffic">Traffic</MenuItem>  
              <MenuItem value="TrafficGraph">Traffic Line Graph</MenuItem>
              <MenuItem value="Commits">Commits</MenuItem>
              <MenuItem value="CommitsBarGraph">Commits Bar Graph</MenuItem>
              <MenuItem value="PullRequests">Pull Requests</MenuItem>
              <MenuItem value="PullRequestsBarChart">Pull Requests Bar Chart</MenuItem>
              <MenuItem value="TopActivePullRequests">Pull Requests Details</MenuItem>
              <MenuItem value="CodeMetrics">Code Metrics</MenuItem>
              <MenuItem value="GitHubHeatmap">Heatmap</MenuItem>

            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Widget Size</InputLabel>
            <Select value={widgetSize} onChange={(e) => setSize(e.target.value)}>
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="large">Large</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={addGithubWidget} variant="contained" color="primary">Add GitHub Widget</Button>
        </div>
      )}

      <h2 onClick={() => setAwsExpanded(!awsExpanded)} style={{ cursor: 'pointer' }}>
        AWS Metrics 
        {awsExpanded ? <FaAngleRight style={{ transform: 'rotate(90deg)' }} /> : <FaAngleRight />}
      </h2>
      {awsExpanded && (
        <div style={{ paddingLeft: "35px" }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>AWS Type</InputLabel>
            <Select value={awsType} onChange={(e) => setAwsType(e.target.value)}>
              <MenuItem value="CpuWidget">CPU Usage</MenuItem>
              <MenuItem value="S3Buckets">S3 Buckets</MenuItem>
              <MenuItem value="NetworkWidget">Network In</MenuItem>
              <MenuItem value="DiskReadWrite">Disk Read/Write</MenuItem>
              <MenuItem value="StatusCheck">Status Check</MenuItem>
              <MenuItem value="CostWidget">Costing</MenuItem>
              <MenuItem value="CostBreakdownWidget">Costing Breakdown</MenuItem>
              <MenuItem value="AWSCostPieChart">Costing Pie Chart</MenuItem>
              <MenuItem value="CostingServicesPieChart">Costing Services Pie Chart</MenuItem>
              <MenuItem value="CostingStackBarChart">Costing Stack Bar Chart</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Widget Size</InputLabel>
            <Select value={widgetSize} onChange={(e) => setSize(e.target.value)}>
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="large">Large</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={addAwsWidget} variant="contained" color="primary">
            <FaPlus /> Add AWS Widget
          </Button>
        </div>
      )}

      <h2 onClick={() => setModifyExpanded(!modifyExpanded)} style={{ cursor: 'pointer' }}>
        Modify Widgets 
        {modifyExpanded ? <FaAngleRight style={{ transform: 'rotate(90deg)' }} /> : <FaAngleRight />}
      </h2>
      {modifyExpanded && (
        <div style={{ paddingLeft: "35px" }}>
          <Button onClick={clearWidgets} variant="contained" color="secondary">Clear All Widgets</Button>
          
        </div>
      )}
    </div>
       
    
  );
}

export default App;
