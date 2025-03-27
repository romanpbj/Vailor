import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../ListingCard.css'; 

function ListingCard({ listingId }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/listing/${listingId}`)
      .then(response => {
        const data = response.data;
        setTitle(data.title);
        setPrice(data.price);
        setSize(data.size);
      })
      .catch(err => {
        console.error("Error getting listing data:", err);
      });
  }, [listingId]);

  useEffect(() => {
    axios.get(`${API_URL}/api/listing/images`, { params: { listing_id: listingId }})
      .then(response => {
        const data = response.data;

        setImage(data[data.length - 1]);
      })
      .catch(err => {
        console.error("Error displaying image:", err);
      });
  }, [listingId]);

  return (
    <div className="listing-card">
      <button 
        className="listing-image-button"
        onClick={() => navigate(`/purchaseDetails/${listingId}`)}
      >
        <img 
          src={image} 
          alt={title} 
          className="listing-image"
        />
      </button>

      <div className="listing-details">
        <strong className="listing-price">${price}</strong>
        <br />
        <span className="listing-size">{size}</span>
      </div>
    </div>
  );
}

export default ListingCard;