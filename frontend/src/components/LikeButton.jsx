import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

function LikeButton({ listingID, className }) {
  const { user } = useContext(AuthContext);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/api/listing/${listingID}`)
        .then(response => {
            setLikes(response.data.likes)
        })
  }, [user.id, listingID])

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/like", { params: { user_id: user.id, listing_id: listingID }})
        .then(response => {
            setLiked(response.data.message)
        })
  }, [user.id, listingID])

  function handleLike(){
    axios.post("http://127.0.0.1:5000/api/like", { listing_id: listingID })
      .then(response => {
        setLikes(response.data.likes)
        setLiked(true)
      })
      .catch(err => {
        console.error("Error liking listing:", err);
      });
  }

  function handleUnlike(){
    axios.delete("http://127.0.0.1:5000/api/like", { params: { listing_id: listingID }})
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