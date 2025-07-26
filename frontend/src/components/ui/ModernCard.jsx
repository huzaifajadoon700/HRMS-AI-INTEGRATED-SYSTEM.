import React from 'react';
import { Card } from 'react-bootstrap';
import { FiStar, FiMapPin, FiClock, FiUsers, FiWifi, FiCoffee, FiTv, FiCar } from 'react-icons/fi';
import { getMenuImageUrl, getRoomImageUrl, getTableImageUrl, handleImageError } from '../../utils/imageUtils';
import './ModernCard.css';

const ModernCard = ({ 
  item, 
  type = 'food', 
  onAction, 
  actionText = 'Select',
  showRating = true,
  showPrice = true,
  className = '',
  size = 'medium' // small, medium, large
}) => {
  const getImageUrl = (imagePath) => {
    switch (type) {
      case 'room':
        return getRoomImageUrl(imagePath);
      case 'table':
        return getTableImageUrl(imagePath);
      case 'food':
      case 'menu':
      default:
        return getMenuImageUrl(imagePath);
    }
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      'wifi': <FiWifi />,
      'coffee': <FiCoffee />,
      'tv': <FiTv />,
      'parking': <FiCar />,
      'ac': '❄️',
      'balcony': '🏞️',
      'minibar': '🍷'
    };
    return icons[amenity.toLowerCase()] || '✨';
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FiStar key={i} className="star filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FiStar key={i} className="star half" />);
      } else {
        stars.push(<FiStar key={i} className="star empty" />);
      }
    }
    return stars;
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <Card className={`modern-card ${type}-card ${size} ${className}`}>
      {/* Image Container */}
      <div className="modern-card-image-container">
        <img
          src={getImageUrl(item.image)}
          alt={item.name || item.roomType || item.tableName}
          className="modern-card-image"
          onError={(e) => {
            const fallbacks = {
              room: '/images/placeholder-room.jpg',
              table: '/images/placeholder-table.jpg',
              food: '/images/placeholder-menu.jpg',
              menu: '/images/placeholder-menu.jpg'
            };
            handleImageError(e, fallbacks[type] || fallbacks.food);
          }}
        />
        
        {/* Overlay Elements */}
        <div className="modern-card-overlay">
          {/* Status Badge */}
          {item.status && (
            <div className={`status-badge ${item.status.toLowerCase()}`}>
              {item.status}
            </div>
          )}
          
          {/* Price Badge */}
          {showPrice && item.price && (
            <div className="price-badge">
              {formatPrice(item.price)}
              {type === 'room' && <span className="price-period">/night</span>}
              {type === 'table' && <span className="price-period">/person</span>}
            </div>
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="gradient-overlay"></div>
      </div>

      {/* Content */}
      <Card.Body className="modern-card-body">
        {/* Header */}
        <div className="modern-card-header">
          <h3 className="modern-card-title">
            {item.name || item.roomType || item.tableName}
          </h3>
          
          {/* Rating */}
          {showRating && (
            <div className="rating-container">
              <div className="stars">
                {renderStars(item.averageRating || item.rating)}
              </div>
              <span className="rating-text">
                {(item.averageRating || item.rating || 0).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="modern-card-description">
            {item.description.length > 100 
              ? `${item.description.substring(0, 100)}...` 
              : item.description
            }
          </p>
        )}

        {/* Type-specific content */}
        {type === 'food' && (
          <div className="food-details">
            {item.cuisine && (
              <div className="detail-item">
                <span className="detail-label">🍛 Cuisine:</span>
                <span className="detail-value">{item.cuisine}</span>
              </div>
            )}
            {item.spiceLevel && (
              <div className="detail-item">
                <span className="detail-label">🌶️ Spice:</span>
                <span className="detail-value">{item.spiceLevel}</span>
              </div>
            )}
            {item.preparationTime && (
              <div className="detail-item">
                <FiClock className="detail-icon" />
                <span className="detail-value">{item.preparationTime} min</span>
              </div>
            )}
          </div>
        )}

        {type === 'room' && (
          <div className="room-details">
            {item.capacity && (
              <div className="detail-item">
                <FiUsers className="detail-icon" />
                <span className="detail-value">{item.capacity} guests</span>
              </div>
            )}
            {item.amenities && item.amenities.length > 0 && (
              <div className="amenities-container">
                <span className="detail-label">Amenities:</span>
                <div className="amenities-list">
                  {item.amenities.slice(0, 4).map((amenity, index) => (
                    <span key={index} className="amenity-item">
                      {getAmenityIcon(amenity)}
                      {amenity}
                    </span>
                  ))}
                  {item.amenities.length > 4 && (
                    <span className="amenity-more">+{item.amenities.length - 4} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {type === 'table' && (
          <div className="table-details">
            {item.capacity && (
              <div className="detail-item">
                <FiUsers className="detail-icon" />
                <span className="detail-value">{item.capacity} seats</span>
              </div>
            )}
            {item.location && (
              <div className="detail-item">
                <FiMapPin className="detail-icon" />
                <span className="detail-value">{item.location}</span>
              </div>
            )}
            {item.ambiance && (
              <div className="detail-item">
                <span className="detail-label">✨ Ambiance:</span>
                <span className="detail-value">{item.ambiance}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {onAction && (
          <button 
            className="modern-card-action-btn"
            onClick={() => onAction(item)}
            disabled={item.status === 'unavailable' || item.availability === false}
          >
            {item.status === 'unavailable' || item.availability === false 
              ? 'Unavailable' 
              : actionText
            }
          </button>
        )}
      </Card.Body>
    </Card>
  );
};

export default ModernCard;
