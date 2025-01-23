import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsloggedin] = useState(false);
  const [userData, setUserData] = useState(null); 

  // Get authentication status
  const getAuthState = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
      
      if (data.success) {
        setIsloggedin(true);
        getUserData(); 
      } else {
        setIsloggedin(false);
        toast.error('Not authenticated');
      }
    } catch (error) {
      toast.error(error.message || "Failed to check authentication.");
    }
  };

  // Get user data if logged in
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/user-data`);
      
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message || "Failed to fetch user data.");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while fetching user data.");
    }
  };

  useEffect(() => {
    getAuthState();
  }, []); 

  const value = {
    backendUrl,
    isLoggedin,
    setIsloggedin,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
