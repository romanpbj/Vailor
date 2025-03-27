import Profile from './pages/Profile';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import EditListing from './pages/EditListing';
import CreateListing from './pages/CreateListing';
import Home from './pages/Home'
import NavBar from './components/NavBar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PurchaseDetails from './pages/PurchaseDetails';
import LikedListings from './pages/LikedListings';
import ViewProfile from './pages/ViewProfile';
import AccountSettings from './pages/AccountSettings';
import Bag from './pages/Bag';
import Purchase from './pages/Purchase';
import React, { useEffect } from "react";
import SoldListings from './pages/soldListings';
import Confirmation from './pages/confirmation';




function App() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.paypal.com/sdk/js?client-id=Aecl2_EmaGxMHaUw0ZlJPmgbAjqHuO1RZ5DsX-sOSfbalQvfMBXdFgWizPyR3A7Q9_TGem_uMTPIOMRa&currency=USD";
    script.async = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return (
    <Router>
        <NavBar />
      <div>
        <Routes>
          <Route path = "/" element = {<Home/>} />
          <Route path = "/profile/*" element = {<ProtectedRoute><Profile/></ProtectedRoute>} />
          <Route path = "/login" element = {<Login/>} />
          <Route path = "/signup" element = {<SignUp/>} />
          <Route path = "/liked" element = {<LikedListings/>} />
          <Route path = "/account" element = {<AccountSettings/>} />
          <Route path = "/bag" element = {<Bag/>} />
          <Route path = '/sold' element = {<SoldListings/>} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path = "/purchase/:listing_id" element = {<Purchase/>} />
          <Route path = "/createListing" element = {<CreateListing/>} />
          <Route path ="/edit/:listingId" element = {<EditListing />} />
          <Route path ="/purchaseDetails/:listingId" element = {<PurchaseDetails />} />
          <Route path ="/viewProfile/:userId" element = {<ViewProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
