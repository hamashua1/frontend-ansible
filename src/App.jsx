// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [backendData, setBackendData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // API URL with fallback
  const API_URL = process.env.REACT_APP_API_URL || 'http://13.62.57.193:9001/api/message';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching from:', API_URL);
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
  
          'Content-Type': 'application/json',
        },
        
                        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      console.log ("response" , response) 

      
      console.log('Response status:', response);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
        console.log(response)
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.log('Non-JSON response received:', textResponse);
        throw new Error(`Expected JSON but received: ${contentType}. Response: ${textResponse.substring(0, 100)}...`);
      }
      
      const data = await response.json();
      console.log('Parsed data:', data);
      
      setBackendData(data);
      setError(null);
      
    } catch (error) {
      console.error('Error fetching data from backend:', error);
      
      if (error.name === 'AbortError') {
        setError('Request timed out');
      } else if (error.message.includes('fetch')) {
        setError('Failed to connect to backend - check if server is running');
      } else {
        setError(error.message);
      }
      
      setBackendData({ 
        greeting: 'Failed to connect to backend.',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Frontend Displaying Backend Data</h1>
        
        {loading && <p>Loading...</p>}
        
        {error && (
          <div style={{ color: 'red', margin: '10px 0' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div style={{ margin: '20px 0' }}>
          <p><strong>API URL:</strong> {API_URL}</p>
          <p><strong>Message:</strong> {backendData.greeting}</p>
          {backendData.version && <p><strong>Backend Version:</strong> {backendData.version}</p>}
          {backendData.timestamp && (
            <p>
              <strong>Last updated:</strong> 
              <small> {new Date(backendData.timestamp).toLocaleString()}</small>
            </p>
          )}
        </div>
        
        <button 
          onClick={fetchData} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
        
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <p>Debug Info:</p>
          <pre style={{ textAlign: 'left', fontSize: '10px' }}>
            {JSON.stringify(backendData, null, 2)}
          </pre>
        </div>
      </header>
    </div>
  );
}

export default App;
