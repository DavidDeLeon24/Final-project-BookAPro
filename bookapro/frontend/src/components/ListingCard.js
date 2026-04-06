import React from 'react';
import { useNavigate } from 'react-router-dom';

const ListingCard = ({ listing }) => {
  const navigate = useNavigate();

  const getCategoryIcon = (category) => {
    const icons = {
      plumber: '🔧', electrician: '⚡', tutor: '📚', photographer: '📷',
      carpenter: '🔨', painter: '🎨', cleaner: '🧹', gardener: '🌱', other: '📦'
    };
    return icons[category] || '📦';
  };

  return (
    <div className="listing-card" onClick={() => navigate(`/listing/${listing._id}`)}>
      <div className="card-header">
        <h3>{listing.title}</h3>
        <span className="card-icon">{getCategoryIcon(listing.category)}</span>
      </div>
      <p className="provider">{listing.provider?.businessName || listing.provider?.name}</p>
      <p className="description">{listing.description?.substring(0, 100)}...</p>
      <div className="price">💰 ${listing.price}/{listing.priceUnit}</div>
      <div className="rating">⭐ {listing.averageRating?.toFixed(1) || 'New'} ({listing.totalReviews || 0} reviews)</div>
    </div>
  );
};

export default ListingCard;