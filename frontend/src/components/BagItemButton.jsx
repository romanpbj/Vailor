import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BagItemButton({ listingID }) {
  const [bagged, setBagged] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    axios
      .get(`${API_URL}/api/bag/in`, { params: { listing_id: listingID } })
      .then(response => {

        setBagged(response.data.message);
      })
      .catch(err => {
        console.error("Error fetching bag data", err);
      });
  }, [listingID]);

  function handleBag() {
    axios
      .post(`${API_URL}/api/bag`, { listing_id: listingID })
      .then(response => {
        setBagged(true);
      })
      .catch(err => {
        console.error("Error adding listing to bag:", err);
      });
  }

  function handleDelete() {
    axios
      .delete(`${API_URL}/api/bag`, { params: { listing_id: listingID } })
      .then(response => {
        setBagged(false);
      })
      .catch(err => {
        console.error("Error removing listing from bag", err);
      });
  }

  return (
    <div>
      {bagged ? (
        <button onClick={handleDelete}>Unadd from bag</button>
      ) : (
        <button onClick={handleBag}>Add to bag</button>
      )}
    </div>
  );
}

export default BagItemButton;