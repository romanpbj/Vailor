import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Confirmation(){
  const location = useLocation();
  const { selectedRate, listing_id } = location.state || {};
  const [url, setUrl] = useState("");
  const [tracking , setTracking] = useState("")
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    if(selectedRate && selectedRate.object_id){
      axios.post(`${API_URL}/api/shippo/transaction`, { rate_id: selectedRate.object_id })
      .then(response => {
        const label = response.data.label_url
        const trackingNumber = response.data.tracking_number
        setUrl(label);
        setTracking(trackingNumber)

        axios.post(`${API_URL}/api/listing/label`, null, { params: { label: label, listing_id: listing_id}})
        axios.post(`${API_URL}/api/sold` , null, { params: { listing_id: listing_id, tracking_number: response.data.tracking_number }})
    
      })
      .catch(err => {
        console.error("Error processing transaction:", err);
      });
    }
  }, [selectedRate]);

  return (
    <div>
      <p>Tracking Number: {tracking}</p>
    </div>
  );
}

export default Confirmation;