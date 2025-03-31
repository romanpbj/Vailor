import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import "../CreateListing.css"

const categories = {
    tops: ["T-Shirt", "Longsleeve", "Sweatshirt", "Sweater", "Tanktop", "Vest", "Jacket"],
    bottoms: ["Jeans", "Sweatpants", "Shorts", "Skirt"],
    shoes: ["Sneakers", "Boots", "Sandals"],
    hats: ["Baseball Hat", "Beanie"],
    accessories: ["Bag", "Jewelry", "Belt", "Watch"]
  };

const sizes = ["X-Large", "Large", "Medium", "Small", "X-Small"]

function CreateListing() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categoryDetails, setCategoryDetails] = useState('');
  const [message, setMessage] = useState('');
  const [size, setSize] = useState('')
  const [files, setFiles] = useState([]);
  const[length, setLength] = useState("")
  const[width, setWidth] = useState("")
  const[height, setHeight] = useState("")
  const[weight, setWeight] = useState("")
  const [address, setAddress] = useState()

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  useEffect(() => {
    axios.get(`${API_URL}/api/user/address`, {params : { user_id : user.id}})
    .then(response => {
      setAddress(response.data.validAddress)
    })
  },[])

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      setMessage("You must be logged in to create listings.");
      return;
    }

    const listingData = {
      title,
      price: parseFloat(price),
      description,
      user_id: user.id,
      category,
      category_details: categoryDetails,
      size,
      length,
      width,
      height,
      weight
    };

    try {
      const listingResponse = await axios.post(`${API_URL}/api/listing`, listingData);
      const newListing = listingResponse.data;
      if (files.length > 0 && files.length <= 5) {
        for (let i = 0; i < files.length; i++) {
          const formData = new FormData();
          formData.append("image", files[i]);
          formData.append("listing_id", newListing.id);

          await axios.post(`${API_URL}/api/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
        }
      }
      
      setMessage("Listing Created!");
      navigate('/profile');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="epurchase-details-container">
      <div className="epurchase-details-images create-images-placeholder">
        <div className="eimage-upload-box">
          <label>Upload Images:</label>
          <input 
            type="file" 
            multiple 
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="epurchase-details-info create-listing-info">
        <form onSubmit={handleSubmit}>
          <div>
            <label className="epurchase-details-title">Title:</label>
            <input 
              type="text" 
              value={title} 
              placeholder="Enter title" 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="epurchase-details-price">Price:</label>
            <input 
              type="number" 
              step="0.01" 
              value={price} 
              placeholder="Enter price" 
              onChange={e => setPrice(e.target.value)} 
              required 
            />
          </div>

          <div className="edescription-block">
            <label className="epurchase-details-description">Description:</label>
            <textarea 
              value={description} 
              placeholder="Enter description"
              onChange={e => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="epurchase-details-metadata">
            <label>Category:</label>
            <select 
              value={category} 
              onChange={e => { 
                setCategory(e.target.value); 
                setCategoryDetails('');
              }}
              required
            >
              <option value="">Select Category</option>
              {Object.keys(categories).map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {category && (
            <div className="epurchase-details-metadata">
              <label>Subcategory:</label>
              <select 
                value={categoryDetails} 
                onChange={e => setCategoryDetails(e.target.value)}
                required
              >
                <option value="">Select Subcategory</option>
                {categories[category].map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}

          <div className="epurchase-details-metadata">
            <label>Size:</label>
            <select
              value={size}
              onChange={e => setSize(e.target.value)}
              required
            >
              <option value="">Select Size</option>
              {sizes.map(sz => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
          </div>

          <div className="eshipping-dimensions">
            <p>Set shipping dimensions:</p>

            <div className="edimension-field">
              <label>Length:</label>
              <input 
                type="text" 
                value={length} 
                onChange={e => setLength(e.target.value)} 
                required 
              /> 
              <span>in</span>
            </div>

            <div className="edimension-field">
              <label>Width:</label>
              <input 
                type="text" 
                value={width} 
                onChange={e => setWidth(e.target.value)} 
                required 
              /> 
              <span>in</span>
            </div>

            <div className="edimension-field">
              <label>Height:</label>
              <input 
                type="text" 
                value={height} 
                onChange={e => setHeight(e.target.value)} 
                required 
              /> 
              <span>in</span>
            </div>

            <div className="edimension-field">
              <label>Weight:</label>
              <input 
                type="text" 
                value={weight} 
                onChange={e => setWeight(e.target.value)} 
                required 
              /> 
              <span>lb</span>
            </div>
          </div>

          {address ? (
            <button type="submit">Create Listing</button>
          ) : (
            <p>A valid shipping address must be set before creating listings.</p>
          )}
        </form>

        <button className="ecancel-button" onClick={() => navigate('/profile')}>
          Cancel
        </button>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default CreateListing;

