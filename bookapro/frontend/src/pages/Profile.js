import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Profile Page - User profile dashboard showing account info, bookings, and listings
// Different views for customers (bookings) and providers (listings)
const Profile = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);      // Customer's bookings
  const [myListings, setMyListings] = useState([]);  // Provider's listings
  const [activeTab, setActiveTab] = useState('profile'); // Current tab
  const [message, setMessage] = useState('');        // Success/error message

  // Load user-specific data based on role
  const loadUserData = useCallback(async () => {
    try {
      // Load bookings for customers
      if (user?.role === 'customer') {
        const response = await api.get('/availability/my-bookings');
        setBookings(response.data);
      }
      
      // Load listings for providers
      if (user?.role === 'provider') {
        const response = await api.get('/listings/my/listings');
        setMyListings(response.data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [user?.role]);

  // Load data when component mounts or role changes
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Cancel a booking (customer only)
  const cancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.delete(`/availability/booking/${bookingId}`);
        setMessage('Booking cancelled successfully!');
        loadUserData(); // Refresh the list
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Failed to cancel booking');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  // Delete a listing (provider only)
  const deleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await api.delete(`/listings/${listingId}`);
        setMessage('Listing deleted successfully!');
        loadUserData(); // Refresh the list
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Failed to delete listing');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  // Inline styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    },
    header: {
      background: 'white',
      borderRadius: '10px',
      padding: '2rem',
      marginBottom: '2rem',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    avatar: {
      width: '100px',
      height: '100px',
      background: '#007bff',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem',
      fontSize: '3rem',
      color: 'white'
    },
    tabs: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      borderBottom: '1px solid #ddd',
      paddingBottom: '0.5rem',
      flexWrap: 'wrap'
    },
    tab: {
      padding: '0.5rem 1rem',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    activeTab: {
      color: '#007bff',
      borderBottom: '2px solid #007bff'
    },
    card: {
      background: 'white',
      borderRadius: '10px',
      padding: '1.5rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    button: {
      padding: '0.5rem 1rem',
      background: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginRight: '0.5rem'
    },
    success: {
      background: '#d4edda',
      color: '#155724',
      padding: '1rem',
      borderRadius: '5px',
      marginBottom: '1rem'
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      borderRadius: '3px',
      fontSize: '0.8rem',
      marginTop: '0.5rem'
    },
    badgeBooked: {
      background: '#28a745',
      color: 'white'
    }
  };

  return (
    <div style={styles.container}>
      {/* Profile Header with Avatar */}
      <div style={styles.header}>
        <div style={styles.avatar}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h1>{user?.name}</h1>
        <p>{user?.email}</p>
        <p><strong>Role:</strong> {user?.role === 'provider' ? 'Service Provider' : 'Customer'}</p>
        {user?.role === 'provider' && user?.businessName && (
          <p><strong>Business:</strong> {user.businessName}</p>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabs}>
        <button 
          style={{...styles.tab, ...(activeTab === 'profile' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('profile')}
        >
          Profile Info
        </button>
        {/* Show Bookings tab only for customers */}
        {user?.role === 'customer' && (
          <button 
            style={{...styles.tab, ...(activeTab === 'bookings' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings ({bookings.length})
          </button>
        )}
        {/* Show Listings tab only for providers */}
        {user?.role === 'provider' && (
          <button 
            style={{...styles.tab, ...(activeTab === 'listings' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('listings')}
          >
            My Listings ({myListings.length})
          </button>
        )}
      </div>

      {/* Success/Error Message */}
      {message && <div style={styles.success}>{message}</div>}

      {/* Profile Info Tab */}
      {activeTab === 'profile' && (
        <div style={styles.card}>
          <h3>Account Information</h3>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Phone:</strong> {user?.phone || 'Not provided'}</p>
          <p><strong>Role:</strong> {user?.role === 'provider' ? 'Service Provider' : 'Customer'}</p>
        </div>
      )}

      {/* Bookings Tab (Customer View) */}
      {activeTab === 'bookings' && (
        <div>
          <h3>My Bookings</h3>
          {bookings.length === 0 ? (
            <div style={styles.card}>No bookings yet. Browse services to book!</div>
          ) : (
            bookings.map(booking => (
              <div key={booking._id} style={styles.card}>
                <h4>{booking.listing?.title}</h4>
                <p><strong>Provider:</strong> {booking.provider?.businessName || booking.provider?.name}</p>
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {booking.timeSlot}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span style={{...styles.badge, ...styles.badgeBooked}}>Booked</span>
                </p>
                <button style={styles.button} onClick={() => cancelBooking(booking._id)}>
                  Cancel Booking
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Listings Tab (Provider View) */}
      {activeTab === 'listings' && (
        <div>
          <h3>My Listings</h3>
          {myListings.length === 0 ? (
            <div style={styles.card}>No listings yet. Create your first listing!</div>
          ) : (
            myListings.map(listing => (
              <div key={listing._id} style={styles.card}>
                <h4>{listing.title}</h4>
                <p><strong>Category:</strong> {listing.category}</p>
                <p><strong>Price:</strong> ${listing.price}/{listing.priceUnit}</p>
                <p><strong>Rating:</strong> ⭐ {listing.averageRating?.toFixed(1) || 'No ratings'}</p>
                <button style={styles.button} onClick={() => deleteListing(listing._id)}>
                  Delete Listing
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;