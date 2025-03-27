import { useState, useEffect, useContext } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ListingCard from '../components/ListingCard';
import "../Profile.css"

function ViewProfile() {
  const { userId } = useParams(); 
  const[username, setUsername] = useState("");
  const [listings, setListings] = useState([]);
  const [profileImage, setProfileImage] = useState("")
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    axios.get(`${API_URL}/api/user/details`, { params: { user_id: userId } })
      .then(response => {
        const data = response.data
        setUsername(data.username);
      })
      .catch(err => console.error("Error fetching username:", err));
}, [userId]);

useEffect(() => {
    axios.get(`${API_URL}/api/images/profileImage`, { params: { profile_image_id: userId }})
      .then(response => {
        setProfileImage(response.data[0].image_url);
      })
      .catch(err => console.error("Error fetching Profile Image:", err));
  } , [userId]);


  useEffect(() => {
      axios.get(`${API_URL}/api/listing`, { params: { user_id: userId } })
        .then(response => {
          setListings(response.data);
        })
        .catch(err => console.error("Error fetching listings:", err));
  }, [userId]);


  return (
    <div className="profile-container">

      <div className="profile-header">
      <img 
        src={profileImage ? profileImage : "/Anchor.png"} 
        alt="Profile" 
        className="profile-image" 
        />
        <h1 className="profile-username">{username}</h1>
      </div>
  
      <div>
        <h2>All Listings</h2>
        {listings.length === 0 ? (
          <p>No listings found.</p>
        ) : (
          <ul className="listings-grid">
            {listings.map(listing => (
              <li key={listing.id} className="listing-item">
                <ListingCard listingId={listing.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ViewProfile;