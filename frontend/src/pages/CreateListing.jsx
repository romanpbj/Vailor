import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const categories = {
    tops: ["T-Shirt", "Longsleeve", "Sweatshirt", "Sweater", "Tanktop", "Vest", "Jacket"],
    bottoms: ["Jeans", "Sweatpants", "Shorts", "Skirt"],
    shoes: ["Sneakers", "Boots", "Sandals"],
    hats: ["Baseball Hat", "Beanie"],
    accessories: ["Bag", "Jewelry", "Belt", "Watch"]
  };

const sizes = ["X-Large", "Large", "Medium", "Small", "X-Small"]

function CreateListing({ onListingCreated }) {
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

  // Handle file input changes
  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

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
    <div>
      <h2>New Listing Form:</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input 
            type="text" 
            value={title} 
            placeholder="Enter title" 
            onChange={e => setTitle(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Price:</label>
          <input 
            type="number" 
            step="0.01" 
            value={price} 
            placeholder="Enter price" 
            onChange={e => setPrice(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label>Category:</label>
          <select 
            value={category} 
            onChange={e => { 
              setCategory(e.target.value); 
              setCategoryDetails(""); // reset subcategory when main changes
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
          <div>
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
        <div>
        <label>Size:</label>
        <select
        value={size}
        onChange={e => setSize(e.target.value)} required>
            <option value="">Select Subcategory</option>
            {sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
        </select>
      </div>
        <div>
          <label>Upload Images:</label>
          <input 
            type="file" 
            multiple 
            onChange={handleFileChange}
          />
        </div>
        <br></br>
        <div>
            <label>Set shipping dimensions:</label><br></br>
            <label>Length:</label>
            <input type='text' value = {length} onChange={(e) => setLength(e.target.value)} required ></input> <label>in</label><br></br>
            <label>Width:</label>
            <input type='text' value = {width} onChange={(e) => setWidth(e.target.value)} required ></input> <label>in</label><br></br>
            <label>Height:</label>
            <input type='text' value = {height} onChange={(e) => setHeight(e.target.value)} required ></input> <label>in</label><br></br>
            <label>Weight:</label>
            <input type='text' value = {weight} onChange={(e) => setWeight(e.target.value)} required ></input> <label>lb</label><br></br>
        </div>
        <button type="submit">Create Listing</button>
      </form>
      <button onClick={() => navigate('/profile')}>Cancel</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateListing;