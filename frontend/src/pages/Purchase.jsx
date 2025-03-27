import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Profile.css";
import PayPal from "../components/PayPal"

function Purchase() {

  const { listing_id } = useParams();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  const [userId, setUserId] = useState("");
  const [total, setTotal] = useState(0);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [categoryDetails, setCategoryDetails] = useState("");
  const [size, setSize] = useState("");
  const [images, setImages] = useState([]);
  const [profileImage, setProfileImage] = useState("");
  const [shippingRates, setShippingRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLabels, setLoadingLabels] = useState(false);
  const [profile, setProfile] = useState("");
  const [error, setError] = useState(null);
  const [selectedRateIndex, setSelectedRateIndex] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState();
  const [initalTotal, setInitialTotal] = useState()
  const [shippingFromCity, setShippingFromCity] = useState("");
  const [shippingFromState, setShippingFromState] = useState("");
  const [selectedRate, setRate] = useState()

  useEffect(() => {
    axios
      .get(`${API_URL}/api/listing/${listing_id}`)
      .then((response) => {
        const data = response.data;
        setUserId(data.user_id);
        setTitle(data.title);
        setPrice(data.price);
        setTotal(data.price);
        setDescription(data.description);
        setDate(data.date);
        setCategory(data.category);
        setCategoryDetails(data.category_details);
        setSize(data.size);
        setLoading(false);
        setInitialTotal(data.price)

        axios
          .get(`${API_URL}/api/user/details`, {
            params: { user_id: data.user_id },
          })
          .then((resp) => {
            setProfile(resp.data.username);
            setShippingFromCity(resp.data.city)
            setShippingFromState(resp.data.state)
          });

        axios
          .get(`${API_URL}/api/user/address`, {
            params: { user_id: data.user_id },
          })
          .then((resp) => {
            setShippingFromCity(resp.data.city)
            setShippingFromState(resp.data.state)
          });

        axios
          .get(`${API_URL}/api/images/profileImage`, {
            params: { profile_image_id: data.user_id },
          })
          .then((response) => {
            if (response.data && response.data.length > 0) {
              setProfileImage(response.data[0].image_url);
            }
          })
          .catch((err) =>
            console.error("Error fetching Profile Image:", err)
          );
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [listing_id]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/listing/images`, {
        params: { listing_id: listing_id },
      })
      .then((response) => {
        setImages(response.data);
      })
      .catch((err) => {
        console.error("Error displaying image:", err);
      });
  }, [listing_id]);

  useEffect(() => {
    axios
      .post(`${API_URL}/api/shipping`, null, {
        params: { listing_id: listing_id },
      })
      .then((response) => {
        setShippingRates(response.data.rates || []);
        setLoadingLabels(true);
      })
      .catch((err) => {
        console.error("Error fetching shipping rates:", err);
      });
  }, [listing_id]);

  function handleShipRate(index, cost, rate) {
    setSelectedRateIndex(index);
    setTotal(price);
    const costFloat = parseFloat(cost);
    setTotal(price + costFloat);
    setSelectedLabel(cost);
    setRate(rate)
  }

  const final = category
    ? category.charAt(0).toUpperCase() + category.substring(1)
    : "";

  const dateObj = new Date(date);
  const formattedDate = `${(dateObj.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${dateObj.getDate().toString().padStart(2, "0")}/${dateObj.getFullYear()}`;


  if (loading) return <p>Loading listing details...</p>;
  if (error) return <p>Error loading listing: {error.message}</p>;

  return (
    <>
      <div className="purchase-details-container">
        <div className="purchase-details-images">
          <img src={images[images.length - 1]} alt={title} />
        </div>
        <div className="purchase-details-info">
          <h1 className="purchase-details-title">{title}</h1>
          <h3 className="purchase-details-price">${price}</h3>

          <div className="purchase-details-metadata">
            <p>
              {final} • {categoryDetails}
            </p>
            <p>{size}</p>
          </div>

          <div className="description-block">
            <p className="purchase-details-description">{description}</p>
            <p className="date">Listed {formattedDate}</p>
          </div>

          <div className="seller-box">
            <img
              src={profileImage}
              alt="Profile"
              className="seller-profile-image"
            />
            <div className="seller-info">
              <p className="seller-name">{profile}</p>
            </div>
          </div>
          <p>Shipped from: {shippingFromCity}, {shippingFromState}</p>
        </div>
      </div>

      {!loadingLabels ? (
        <p className="loading">Loading shipping labels...</p>
      ) : null}

      {shippingRates && shippingRates.length > 0 && (
        <div className="shipping-rates">
          <h3>Shipping Options</h3>
          <ul className="shipping-rates-grid">
            {shippingRates
              .filter((rate) => rate.provider === "USPS")
              .map((rate, index) => (
                <li
                  key={index}
                  className={`shipping-rate-item ${
                    selectedRateIndex === index ? "selected" : ""
                  }`}
                >
                  <button
                    className="rate-button"
                    onClick={() => handleShipRate(index, rate.amount, rate)}
                  >
                    <img
                      className="shipping-icon"
                      src="https://cdn-icons-png.flaticon.com/512/10858/10858083.png"
                      alt="Shipping Icon"
                    />
                    <div className="shipping-rate-text">
                      <p className="rate-provider">
                        {rate.provider}: ${rate.amount} {rate.currency}
                      </p>
                      <p className="rate-estimated">
                        Estimated Days: {rate.estimated_days}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}


        {selectedRateIndex !== null ? (
        <div className="checkout-section">
            <h3>Complete Your Payment</h3>
            <p>{title}: ${initalTotal}</p>
            <p>Label: ${selectedLabel}</p>
            <p className="total-cost">Total: {total}</p>
            <PayPal
            amount={total}
            onSuccess={(details) => {
                navigate("/confirmation");
            }}
            clientId = "Aecl2_EmaGxMHaUw0ZlJPmgbAjqHuO1RZ5DsX-sOSfbalQvfMBXdFgWizPyR3A7Q9_TGem_uMTPIOMRa"
            />
            <button onClick={() => navigate("/confirmation", { state: { selectedRate, listing_id } })}>Confirm</button>
        </div>
        ) : (
        <div className="checkout-section">
            <p>Please select a shipping option to continue to payment.</p>
        </div>
        )}

    </>
  );
}

export default Purchase;