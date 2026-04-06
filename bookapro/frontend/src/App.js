import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import ListingDetail from './pages/ListingDetail';
import MyListings from './pages/MyListings';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import Profile from './pages/Profile';
import './App.css'; 
import './styles/global.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/my-listings" element={
          <PrivateRoute requiredRole="provider">
            <MyListings />
          </PrivateRoute>
        } />
        <Route path="/create-listing" element={
          <PrivateRoute requiredRole="provider">
            <CreateListing />
          </PrivateRoute>
        } />
        <Route path="/edit-listing/:id" element={
          <PrivateRoute requiredRole="provider">
            <EditListing />
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;