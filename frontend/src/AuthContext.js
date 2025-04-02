import axios from 'axios';
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(() => {
    const storedData = localStorage.getItem("authData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedData.access_token}`;
      return parsedData;
    }
    return null;
  });

  const loginUser = (data) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
    const user = data.user || data;
    if (!('is_admin' in user)) {
      user.is_admin = false;
    }
    const authData = { access_token: data.access_token || '', user };
    setAuthData(authData);
    localStorage.setItem("authData", JSON.stringify(authData));
  };

  const logoutUser = () => {
    setAuthData(null);
    localStorage.removeItem("authData");
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ 
      authData, 
      user: authData ? authData.user : null, 
      loginUser, 
      logoutUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};