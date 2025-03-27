import { useState, useEffect, useContext } from 'react';
import axios from "axios";
import { AuthContext } from "../AuthContext"; 
import ListingCard from '../components/ListingCard';
import "../Profile.css"

function LikedListings() {
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const user_id = user.id
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    axios.get(`${API_URL}/api/like/all`, { params: { user_id: user_id }})
    .then(response => {
        setListings(response.data)
    })
    .catch(err => {
        console.error("Error loading liked listings:", err);
      });
  }, [user_id])

  function handleDelete(listingID){
    axios.delete(`${API_URL}/api/like`, { params: { user_id: user.id, listing_id: listingID }})
    .then(response => {
        
        axios.get(`${API_URL}/api/like/all`, { params: { user_id: user_id }})
        .then(response => {
        setListings(response.data)
    })
    })
    .catch(err => {
        console.error("Error unliking listing:", err);
      });
  }

  return (
    <div className="profile-container">
      <h1>Liked Listings</h1>
      <div>
        {listings.length !== 0 ? (
          <ul className="listings-grid">
            {listings.map(listing => (
              <li key={listing.id} className="listing-item">
                <div className="listing-wrapper">
                  <ListingCard listingId={listing.id} />
                  <div className="edit-button-wrapper">
                    <button onClick={() => handleDelete(listing.id)}>Unlike</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have not liked any listings.</p>
        )}
      </div>
    </div>
  )
}

export default LikedListings