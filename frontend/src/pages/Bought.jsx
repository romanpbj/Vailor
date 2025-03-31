import { useEffect, useState } from "react"
import axios from "axios"
import ListingCard from "../components/ListingCard"
import '../Profile.css'

function Bought(){

    const [listings, setListings] = useState([])
    const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

    useEffect(() => {
        axios.get(`${API_URL}/api/bought`)
        .then(response => {
            setListings(response.data)
        })
    },[])

    return (
        <div className="profile-container">
            <h1>Purchased</h1>
            <div>
            {listings.length !== 0 ? (
                <ul className="listings-grid">
                {listings.map(listing => (
                    <li key={listing.id} className="listing-item">
                    <div className="listing-wrapper">
                        <ListingCard listingId={listing.id} />
                        <p>T#: {listing.tracking_number}</p>
                    </div>
                    </li>
                ))}
                </ul>
            ) : (
                <p>You have not bought any listings.</p>
            )}
            </div>
        </div>
        )
}

export default Bought