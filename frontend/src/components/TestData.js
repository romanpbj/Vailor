import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TestData(){
    const[data, setData] = useState(null)
    const[loading, setLoading] = useState(true)
    const[error, setError] = useState(null)

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/test")
        .then(response => {
            setData(response.data);
            setLoading(false)
        })
        .catch(err => {
            setError(err);
            setLoading(false)
        })
    }, [])

    if (loading) return <p>Loading data...</p>
    if(error) return <p>Error fetching data: {error.message}</p>

    return (
        <div>
          <h2>Test Data from Flask API</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
    }
    
    export default TestData;