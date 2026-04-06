import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState('');

  // Wrap loadUserData with useCallback to fix dependency warning
  const loadUserData = useCallback(async () => {
    try {
      if (user?.role === 'customer') {
        const response = await api.get('/availability/my-bookings');
        setBookings(response.data);
      }
      
      if (user?.role === 'provider') {
        const response = await api.get('/listings/my/listings');
        setMyListings(response.data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [user?.role]);

  // Add loadUserData to dependency array
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const cancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.delete(`/availability/booking/${bookingId}`);
        setMessage('Booking cancelled successfully!');
        loadUserData();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Failed to cancel booking');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const deleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await api.delete(`/listings/${listingId}`);
        setMessage('Listing deleted successfully!');
        loadUserData();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Failed to delete listing');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

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

      <div style={styles.tabs}>
        <button 
          style={{...styles.tab, ...(activeTab === 'profile' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('profile')}
        >
          Profile Info
        </button>
        {user?.role === 'customer' && (
          <button 
            style={{...styles.tab, ...(activeTab === 'bookings' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings ({bookings.length})
          </button>
        )}
        {user?.role === 'provider' && (
          <button 
            style={{...styles.tab, ...(activeTab === 'listings' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('listings')}
          >
            My Listings ({myListings.length})
          </button>
        )}
      </div>

      {message && <div style={styles.success}>{message}</div>}

      {activeTab === 'profile' && (
        <div style={styles.card}>
          <h3>Account Information</h3>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Phone:</strong> {user?.phone || 'Not provided'}</p>
          <p><strong>Role:</strong> {user?.role === 'provider' ? 'Service Provider' : 'Customer'}</p>
        </div>
      )}

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