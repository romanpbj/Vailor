import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

function LikeButton({ listingID, className }) {
  const { user } = useContext(AuthContext);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    axios.get(`${API_URL}/api/listing/${listingID}`)
        .then(response => {
            setLikes(response.data.likes)
        })
  }, [user.id, listingID])

  useEffect(() => {
    axios.get(`${API_URL}/api/like`, { params: { user_id: user.id, listing_id: listingID }})
        .then(response => {
            setLiked(response.data.message)
        })
  }, [user.id, listingID])

  function handleLike(){
    axios.post(`${API_URL}/api/like`, { listing_id: listingID })
      .then(response => {
        setLikes(response.data.likes)
        setLiked(true)
      })
      .catch(err => {
        console.error("Error liking listing:", err);
      });
  }

  function handleUnlike(){
    axios.delete(`${API_URL}/api/like`, { params: { listing_id: listingID }})
    .then(response => {
        setLikes(response.data.likes)
        setLiked(false)
    })
    .catch(err => {
        console.error("Error Unliking listing:", err);
      });
  }

  return (
    <div>
       {liked? < button className={className} onClick={handleUnlike}>♥️{likes}</button> :  <button className={className} onClick={handleLike}>♡{likes}</button>}
    </div>
  );
}

export default LikeButton;