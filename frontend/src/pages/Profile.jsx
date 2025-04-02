import { useState, useEffect, useContext } from 'react';
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import ListingCard from '../components/ListingCard';
import "../Profile.css"


function Profile() {
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    axios.get(`${API_URL}/api/user`)
      .then(response => {
        const data = response.data;
        setUsername(data.username);
      })
      .catch(err => console.error("Error fetching username:", err));
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      axios.get(`${API_URL}/api/listing`, { params: { user_id: user.id } })
        .then(response => {
          setListings(response.data);
        })
        .catch(err => console.error("Error fetching listings:", err));
    } else {
      setListings([]);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      axios.get(`${API_URL}/api/images/profileImage`, { params: { profile_image_id: user.id }})
        .then(response => {
          if (response.data && response.data.length > 0) {
            setProfileImage(response.data[0].image_url);
          }
        })
        .catch(err => console.error("Error fetching Profile Image:", err));
    }
  }, [user]);

  function handleExport() {
    axios
      .get(`${API_URL}/api/export`, { responseType: 'blob' })
      .then(response => {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sold_listings.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error("Error exporting CSV:", error);
      });
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
      <img 
        src={profileImage ? profileImage : "./Anchor.png"} 
        alt="Profile" 
        className="profile-image" 
        />
        <h1 className="profile-username">{username}</h1>
        <img className='account' src='/gear.png' alt='account settings' onClick={() => navigate("/account")}/>
      </div>

      <div>
        <h2>Your Listings</h2>
        <div className='listing-buttons'>
            <button className='create-listing' onClick={() => navigate("/createListing")}>+ New Listing</button>
            {user.is_admin ? <button className='export-listings' onClick={handleExport}>Export CSV</button> : <></>}
            <button className='liked-listings' onClick={() => navigate("/liked")}>Liked</button>
            <button className='bagged-listings' onClick={() => navigate("/bag")}>Bag</button>
            <button className='sold-listings' onClick={() => navigate("/sold")}>Sold</button>
            <button className='bought-listings' onClick={() => navigate("/bought")}>Purchased</button>
        </div>
        {listings.length === 0 ? (
          <p>No listings found.</p>
        ) : (
          <ul className="listings-grid">
            {listings.map(listing => (
              <li key={listing.id} className="listing-item">
                <div className="listing-wrapper">
                  <ListingCard listingId={listing.id} />
                  <div className="edit-button-wrapper">
                    <button onClick={() => navigate(`/edit/${listing.id}`)}>Edit</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Profile;