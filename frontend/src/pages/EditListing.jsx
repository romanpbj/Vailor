import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../Edit.css'

function EditListing() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categoryDetails, setCategoryDetails] = useState('');
  const [images, setImages] = useState([])
  const [files, setFiles] = useState([])
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
  
  useEffect(() => {
    axios.get(`${API_URL}/api/listing/${listingId}`)
      .then(response => {
        const data = response.data;
        setTitle(data.title);
        setPrice(data.price);
        setDescription(data.description);
        setCategory(data.category);
        setCategoryDetails(data.category_details);
      })
      .catch(err => console.error("Error fetching listing data:", err));
  }, [listingId]);

  useEffect(() => {
    axios.get(`${API_URL}/api/listing/images`, {params : {listing_id : listingId}})
    .then(response => {
      setImages(response.data)
    })
  },[])

  const handleFileChange = (e) => {
    setFiles(e.target.files)
  }

  function handleImages(){

    axios.delete(`${API_URL}/api/listing/deleteImage`, { params: { listing_id: listingId }})
    .then(response => {
      if (files.length > 0 && files.length <= 5) {
        for (let i = 0; i < files.length; i++) {
          const formData = new FormData();
          formData.append("image", files[i]);
          formData.append("listing_id", listingId);
  
          axios.put(`${API_URL}/api/listing/editImages`, formData, { headers: { "Content-Type": "multipart/form-data" }})
        }
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      title,
      price: parseFloat(price),
      description,
      category,
      category_details: categoryDetails
    };

    axios.put(`${API_URL}/api/listing/${listingId}`, updatedData, {
      headers: { "Content-Type": "application/json" }
    })
    .then(response => {
      navigate('/profile');
    })
    .catch(err => {
      console.error("Error updating listing:", err);
    });
  };

  function handleDelete(){
    
    axios.delete(`${API_URL}/api/listing/${listingId}`)
    .then(response => {
        navigate('/profile');
    })
    .catch(err => {
        console.error("Error deleting listing:", err);
    });

  }

  function handleSold() {

    axios.post(`${API_URL}/api/sold` , null, { params: { listing_id: listingId }})
    .then(response => {
        navigate('/profile')
    })

  }

  return (
    <div>
      <h1>Edit Listing</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input 
            type="text" 
            value={title} 
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
            onChange={e => setPrice(e.target.value)}
            required 
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)}
            required 
          />
        </div>
        <div>
          <label>Category:</label>
          <input 
            type="text" 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            required 
          />
        </div>
        <div>
          <label>Category Details:</label>
          <input 
            type="text" 
            value={categoryDetails} 
            onChange={e => setCategoryDetails(e.target.value)}
            required 
          />
        </div>
        <div className="edit-details-images">
          <label>Images:</label>
          <ul>
            {images.slice().reverse().map((image, index) => (
                <li key={index}>
                <img src={image} alt={title} />
                </li>
            ))}
        </ul>
        </div>
        <div>
          <label>Upload Images:</label>
          <input 
            type="file" 
            multiple 
            onChange={handleFileChange}
          />
        </div>
        <button type='button' onClick={handleImages}>Update Images</button>
        <br></br>
        <button type="submit">Update Listing</button>
      </form>
      <button onClick = {handleSold}>Mark Sold</button><br></br>
      <button onClick={handleDelete}>Delete Listing</button>
    </div>
  );
}

export default EditListing;