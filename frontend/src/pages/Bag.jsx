import { useState, useEffect, useContext } from "react";
import axios from "axios";
import ListingCard from "../components/ListingCard";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import "../Bag.css"

function Bag() {
  const [bagItems, setBagItems] = useState([]);
  const [total, setTotal] = useState()
  const [message, setMessage] = useState("")
  const [addressSet, setAddress] = useState()
  const { user } = useContext(AuthContext);
  const navigate = useNavigate()
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    axios.get(`${API_URL}/api/bag`)
      .then(response => {
        setBagItems(response.data);
      })
      .catch(err => console.error("Error fetching bag items:", err));
  }, [total]);

  useEffect(() => {
    axios.get(`${API_URL}/api/user/address`, {params : { user_id : user.id}})
    .then(response => {
      setAddress(response.data.validAddress)
    })
  },[])

  useEffect(() => {
    axios.get(`${API_URL}/api/user`)
      .then(response => {
        setTotal(response.data.total_bag_price);
      })
      .catch(err => console.error("Error fetching bag items:", err));
  }, [user]);

  function handleDelete(listing){
    axios.delete(`${API_URL}/api/bag`, { params: { listing_id: listing }})
    .then(response => {
        setMessage("Removed from Bag")
        setTotal(response.data.total_bag_price)
    })
    .catch(err => {
        console.error("Error removing listing from bag", err)
    })
  }

  return (
    <div className="profile-container">
      <div className="bag-header">
        <h1>Your Bag:</h1>
        <h2 className="bag-total">Total: ${total}</h2>
    </div>
    {addressSet ? <></>: <p> A valid shipping address must be provided before purchase.</p>}
      <div>
        {bagItems.length !== 0 ? (
          <ul className="listings-grid">
            {bagItems.map(item => (
              <li key={item.id} className="listing-item">
                <div className="listing-wrapper">
                  <ListingCard listingId={item.listing_id} />
                  <div className="bag-edit-button-wrapper">
                    {addressSet ? <button className="bag-purchase" onClick={() => navigate(`/purchase/${item.listing_id}`)} >Purchase</button> : <></>}
                    <button className="bag-remove" onClick={() => handleDelete(item.listing_id)}>Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no items in your bag.</p>
        )}
      </div>
    </div>
  );
}

export default Bag;