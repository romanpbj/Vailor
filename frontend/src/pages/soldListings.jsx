import axios from "axios"
import { useState, useEffect } from "react"
import ListingCard from "../components/ListingCard"
import '../Profile.css'

function SoldListings(){

    const [listings, setListings] = useState([])

    useEffect(() =>{
        axios.get("http://127.0.0.1:5000/api/sold")
        .then(response => {
            setListings(response.data)
        })
    },[])

    return (
    <div className="profile-container">
        <h1>Sold Listings</h1>
        <div>
        {listings.length !== 0 ? (
            <ul className="listings-grid">
            {listings.map(listing => (
                <li key={listing.id} className="listing-item">
                <div className="listing-wrapper">
                    <ListingCard listingId={listing.id} />
                    <div className="edit-button-wrapper">
                                        <a 
                    href={listing.label} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#003780',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                    }}
                    >
                    Download Label
                    </a>
                    </div>
                </div>
                </li>
            ))}
            </ul>
        ) : (
            <p>You have not sold any listings.</p>
        )}
        </div>
    </div>
    )
}

export default SoldListings