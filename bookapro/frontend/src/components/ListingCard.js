import React from 'react';
import { useNavigate } from 'react-router-dom';

// ListingCard Component - Displays a single service listing in a card format
// Clicking the card navigates to the detailed view of the listing
const ListingCard = ({ listing }) => {
  const navigate = useNavigate();

  // Returns emoji icon based on service category
  const getCategoryIcon = (category) => {
    const icons = {
      plumber: '🔧',
      electrician: '⚡',
      tutor: '📚',
      photographer: '📷',
      carpenter: '🔨',
      painter: '🎨',
      cleaner: '🧹',
      gardener: '🌱',
      other: '📦'
    };
    return icons[category] || '📦';
  };

  return (
    <div className="listing-card" onClick={() => navigate(`/listing/${listing._id}`)}>
      {/* Card header with title and category icon */}
      <div className="card-header">
        <h3>{listing.title}</h3>
        <span className="card-icon">{getCategoryIcon(listing.category)}</span>
      </div>
      
      {/* Provider name (business name if available) */}
      <p className="provider">{listing.provider?.businessName || listing.provider?.name}</p>
      
      {/* Shortened description (first 100 characters) */}
      <p className="description">{listing.description?.substring(0, 100)}...</p>
      
      {/* Price information */}
      <div className="price">💰 ${listing.price}/{listing.priceUnit}</div>
      
      {/* Rating display - shows "New" if no ratings yet */}
      <div className="rating">⭐ {listing.averageRating?.toFixed(1) || 'New'} ({listing.totalReviews || 0} reviews)</div>
    </div>
  );
};

export default ListingCard;