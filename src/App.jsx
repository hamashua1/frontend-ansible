// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css'; // Will be a simple CSS file

function App() {
  const [backendData, setBackendData] = useState({});
  // REACT_APP_API_URL will be set by the Ansible .env template
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/message';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setBackendData(data);
    } catch (error) {
      console.error('Error fetching data from backend:', error);
      setBackendData({ greeting: 'Failed to connect to backend.' });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Frontend Displaying Backend Data</h1>
        <p>{backendData.greeting}</p>
        {backendData.version && <p>Backend Version: {backendData.version}</p>}
        {backendData.timestamp && <small>Last updated: {backendData.timestamp}</small>}
      </header>
      <button onClick={fetchData}>Refresh Data</button>
    </div>
  );
}

export default App;