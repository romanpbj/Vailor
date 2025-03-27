import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import ListingCard from '../components/ListingCard';
import '../App.css';

function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('q') || "";
  const initialCategory = queryParams.get('cat') || "";
  const initialCatDetails = queryParams.get('catDetails') || "";
  const initialSize = queryParams.get('size') || "";
  const initialPrice = queryParams.get('price') || "";

  const categories = {
    tops: ["T-Shirt", "Longsleeve", "Sweatshirt", "Sweater", "Tanktop", "Vest", "Jacket"],
    bottoms: ["Jeans", "Sweatpants", "Shorts", "Skirt"],
    shoes: ["Sneakers", "Boots", "Sandals"],
    hats: ["Baseball Hat", "Beanie"],
    accessories: ["Bag", "Jewelry", "Belt", "Watch"]
  };

  const sizes = ["X-Large", "Large", "Medium", "Small", "X-Small"];

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [categoryDetails, setCategoryDetails] = useState(initialCatDetails);
  const [size, setSize] = useState(initialSize);
  const [price, setPrice] = useState(initialPrice);
  const [foundListings, setFoundListings] = useState([]);

  const performSearch = () => {
    const combinedSearch = [search, category, categoryDetails, size]
      .filter(Boolean)
      .join(" ");
    axios.get("http://127.0.0.1:5000/api/listing", { params: { search: combinedSearch, price: price } })
      .then(response => {
        setFoundListings(response.data);
      })
      .catch(err => {
        console.error("Error searching listings:", err);
      });
  };

  useEffect(() => {
    if (initialSearch || initialCategory || initialCatDetails || initialSize || initialPrice) {
      performSearch();
    } else {
      axios.get("http://127.0.0.1:5000/api/listing")
        .then(response => {
          setFoundListings(response.data);
        })
        .catch(err => {
          console.error("Error displaying listings:", err);
        });
    }
  }, []);

  const handleSearch = () => {
    const newParams = new URLSearchParams();
    if (search) newParams.set('q', search);
    if (category) newParams.set('cat', category);
    if (categoryDetails) newParams.set('catDetails', categoryDetails);
    if (size) newParams.set('size', size);
    if (price) newParams.set('price', price);

    navigate(`?${newParams.toString()}`);
    performSearch();
  };

  return (
    <div className="home-container">
        <br></br>
      <div className="search-section">
        <div className="search-bar-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={category}
              onChange={e => {
                setCategory(e.target.value);
                setCategoryDetails("");
              }}
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
            <div className="filter-group">
              <label>Subcategory:</label>
              <select
                value={categoryDetails}
                onChange={e => setCategoryDetails(e.target.value)}
              >
                <option value="">Select Subcategory</option>
                {categories[category].map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-group">
            <label>Sort By:</label>
            <select
              value={price}
              onChange={e => setPrice(e.target.value)}
            >
              <option value="">Select Option</option>
              <option value="-1">Low to High</option>
              <option value="1">High to Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Size:</label>
            <select
              value={size}
              onChange={e => setSize(e.target.value)}
            >
              <option value="">Select Size</option>
              {sizes.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h2>All Listings</h2>
        {foundListings.length === 0 ? (
          <p>No listings found.</p>
        ) : (
          <ul className="listings-grid">
            {foundListings.map(listing => (
              <li key={listing.id} className="listing-item">
                <ListingCard listingId={listing.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Home;