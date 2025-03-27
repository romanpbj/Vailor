import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Confirmation(){
  const location = useLocation();
  const { selectedRate, listing_id } = location.state || {};
  const [url, setUrl] = useState("");

  useEffect(() => {
    if(selectedRate && selectedRate.object_id){
      axios.post("http://127.0.0.1:5000/api/shippo/transaction", { rate_id: selectedRate.object_id })
      .then(response => {
        const label = response.data.label_url
        setUrl(label);

        axios.post("http://127.0.0.1:5000/api/listing/label", null, { params: { label: label, listing_id: listing_id}})
        axios.post("http://127.0.0.1:5000/api/sold" , null, { params: { listing_id: listing_id }})
    
      })
      .catch(err => {
        console.error("Error processing transaction:", err);
      });
    }
  }, [selectedRate]);

  return (
    <div>
      <p>Shipping Label URL: {url}</p>
    </div>
  );
}

export default Confirmation;