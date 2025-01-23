import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ProtectedRoute from './components/ProtectedRoute'; 

const App = () => {
  const routes = [
    { path: '/', element: <Home /> },
    { path: '/login', element: <Login /> },
    { path: '/email-verify', element: <EmailVerify /> },
    { path: '/reset-password', element: <ResetPassword /> },
  ];

  return (
    <>
      <ToastContainer />
      <Routes>
        {routes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              route.path === '/' || route.path === '/reset-password' ? (
                <ProtectedRoute>{route.element}</ProtectedRoute> 
              ) : (
                route.element
              )
            }
          />
        ))}
      </Routes>
    </>
  );
};

export default App;


