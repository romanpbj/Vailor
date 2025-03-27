import axios from "axios"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";

function Listings({ listings, onDeleteListing, onUpdateListing }){

    const navigate = useNavigate();
    
    if(!listings) return <p>No listings available</p>;

    return (
        <div>
            <h2>All Listings</h2>
            <ul>
                {listings.map(listing =>(
                    <li key = {listing.id}>
                    <strong>{listing.title}</strong> - ${listing.price}<br />
                    {listing.description}
                    <button onClick={() => navigate(`/edit/${listing.id}`)}>Edit</button>
                    <button onClick={() => navigate(`/viewListing/${listing.id}`)}>View</button>
                </li>
                ))}
            </ul>
        </div>
    )
}

export default Listings