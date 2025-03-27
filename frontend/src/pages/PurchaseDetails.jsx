import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import LikeButton from '../components/LikeButton';
import { AuthContext } from '../AuthContext';
import BagItemButton from '../components/BagItemButton';
import '../Purchase.css'

function PurchaseDetails() {
  const { listingId } = useParams(); 
  const navigate = useNavigate(); 
  const { user } = useContext(AuthContext);

  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [categoryDetails, setCategoryDetails] = useState('');
  const [size, setSize] = useState("");
  const [images, setImages] = useState([]);
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState("");
  const [error, setError] = useState(null);
  const [sold, setSold] = useState();

  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/api/listing/${listingId}`)
      .then(response => {
        const data = response.data;
        setUserId(data.user_id);
        setTitle(data.title);
        setPrice(data.price);
        setDescription(data.description);
        setDate(data.date);
        setCategory(data.category);
        setCategoryDetails(data.category_details);
        setSize(data.size);
        setLoading(false);
        setSold(data.sold);

        axios.get("http://127.0.0.1:5000/api/user/details", { params: { user_id: data.user_id } })
          .then(resp => {
            setProfile(resp.data.username);
          });

        axios.get("http://127.0.0.1:5000/api/images/profileImage", { params: { profile_image_id: data.user_id }})
          .then(response => {
            setProfileImage(response.data[0].image_url);
          })
          .catch(err => console.error("Error fetching Profile Image:", err));
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [listingId]);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/listing/images", { params: { listing_id: listingId } })
      .then(response => {
        setImages(response.data);
      })
      .catch(err => {
        console.error("Error displaying image:", err);
      });
  }, [listingId]);


  const string = category.charAt(0).toUpperCase()
  const string2 = category.substring(1)
  const final = string + string2

  const isoDate = date;
  const dateObj = new Date(isoDate);
  const formattedDate = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

  let notSame = false
  if (userId !== user.id){
    notSame = true
  }

  if (loading) return <p>Loading listing details...</p>;
  if (error) return <p>Error loading listing: {error.message}</p>;

  return (
    <div className="purchase-details-container">
      
      <div className="purchase-details-images">
        <ul>
            {images.slice().reverse().map((image, index) => (
                <li key={index}>
                <img src={image} alt={title} />
                </li>
            ))}
        </ul>
      </div>
      
      <div className="purchase-details-info">
        <h1 className="purchase-details-title">{title}</h1>
        <h3 className="purchase-details-price">${price}</h3>

        <div className="purchase-details-metadata">
          <p>{final}•{categoryDetails}</p>
          <p>{size}</p>
        </div>

        <div className="purchase-details-actions">
          {user && notSame && sold == false && <BagItemButton listingID={listingId} />}
          {user && sold == false && <LikeButton listingID={listingId} className="like-button" />}
        </div>
        
        <div className="description-block">
            <p className="purchase-details-description">{description}</p>
            <p className='date'>Listed {formattedDate}</p>
        </div>
        
        <div className="seller-box">
        <img 
        src={profileImage ? profileImage : "/Anchor.png"} 
        alt="Profile" 
        className="seller-profile-image" 
        />
            <div className="seller-info">
                <p className="seller-name">{profile}</p>
            </div>
            <button className="seller-visit" onClick={() => navigate(`/viewProfile/${userId}`)}>
                Visit Profile
            </button>
        </div>

      </div>
    </div>
  );
}

export default PurchaseDetails;