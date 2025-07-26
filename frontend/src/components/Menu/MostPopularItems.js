import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiStar, FiInfo, FiShoppingCart, FiClock, FiThermometer, FiHeart } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import { apiConfig } from "../../config/api";
import { getMenuImageUrl, handleImageError } from "../../utils/imageUtils";

const MostPopularItems = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Add to cart function
  const handleAddToCart = (item) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

    const itemIndex = existingCart.findIndex(cartItem => cartItem._id === item._id);

    if (itemIndex !== -1) {
      existingCart[itemIndex].quantity += 1;
      toast.success(`${item.name} quantity updated! Click to go to cart.`, {
        onClick: () => navigate('/cart'),
        style: { cursor: 'pointer' }
      });
    } else {
      existingCart.push({ ...item, quantity: 1 });
      toast.success(`${item.name} added to cart! Click to go to cart.`, {
        onClick: () => navigate('/cart'),
        style: { cursor: 'pointer' }
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };



  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(apiConfig.endpoints.menus);
        // Get top 3 items with highest ratings/popularity
        const topItems = response.data
          .sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5))
          .slice(0, 3);
        setMenuItems(topItems);
      } catch (error) {
        setError("Failed to load menu items. Please try again.");
        console.error("Error fetching menu items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Format price in Pakistani Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <section style={{
        width: '100%',
        margin: 0,
        padding: '4rem 0',
        background: 'linear-gradient(180deg, #0A192F 0%, #112240 50%, #0A192F 100%)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #ffffff 0%, #bb86fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1rem',
              lineHeight: '1.1'
            }}>
              Most Popular Items
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            width: '100%',
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0.5rem'
          }}>
            {Array(3).fill().map((_, index) => (
              <div key={index} style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '1rem',
                overflow: 'hidden',
                height: '400px',
                animation: 'pulse 1.5s infinite'
              }}>
                <div style={{
                  height: '160px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }} />
                <div style={{ padding: '1rem' }}>
                  <div style={{
                    height: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    marginBottom: '0.75rem'
                  }} />
                  <div style={{
                    height: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                    width: '80%'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{
        width: '100%',
        margin: 0,
        padding: '4rem 0',
        background: 'linear-gradient(180deg, #0A192F 0%, #112240 50%, #0A192F 100%)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            color: '#fff',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FiInfo />
            {error}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <style>
        {`
          /* Responsive Styles for MostPopularItems */
          @media (max-width: 768px) {
            .popular-items-container {
              padding: 0 1rem !important;
            }
            .popular-items-grid {
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
              gap: 1rem !important;
              max-width: 100% !important;
            }
            .popular-items-title {
              font-size: 1.75rem !important;
            }
            .popular-item-card {
              max-width: 100% !important;
              min-width: 250px !important;
              margin: 0 !important;
            }
          }

          @media (max-width: 480px) {
            .popular-items-container {
              padding: 0 0.75rem !important;
            }
            .popular-items-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
            .popular-items-title {
              font-size: 1.5rem !important;
            }
            .popular-item-card {
              min-width: auto !important;
            }
            .popular-item-content {
              padding: 1rem !important;
            }
          }
        `}
      </style>
      <section style={{
        width: '100%',
        margin: 0,
        padding: '4rem 0',
        background: '#ffffff',
        position: 'relative'
      }}>

      <div className="popular-items-container" style={{
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="popular-items-title" style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: '#000000',
            marginBottom: '1rem',
            fontFamily: 'Inter, sans-serif'
          }}>
            Most Popular Items
          </h2>
          <Link
            to="/order-food"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: '#000000',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: '500',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#333333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#000000';
            }}
          >
            View Full Menu
          </Link>
        </div>

        <div className="popular-items-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          {menuItems.map((item) => (
            <div
              key={item._id}
              className="popular-item-card"
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                width: '100%',
                maxWidth: '350px',
                margin: '0 auto',
                position: 'relative',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Image Section */}
              <div style={{
                position: 'relative',
                height: '200px',
                overflow: 'hidden'
              }}>
                <img
                  src={getMenuImageUrl(item.image)}
                  alt={item.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => handleImageError(e, "/images/placeholder-food.jpg")}
                />

                {/* Rating Badge */}
                <div style={{
                  position: 'absolute',
                  top: '0.75rem',
                  left: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  backgroundColor: '#ffffff',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#000000',
                  border: '1px solid #e5e7eb'
                }}>
                  <FiStar style={{ color: '#fbbf24' }} size={12} />
                  <span>{item.rating?.toFixed(1) || '4.5'}</span>
                </div>

                {/* Price Badge */}
                <div style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
                  backgroundColor: '#ffffff',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#000000',
                  border: '1px solid #e5e7eb'
                }}>
                  {formatPrice(item.price)}
                </div>
              </div>

              {/* Content Section */}
              <div className="popular-item-content" style={{ padding: '1.5rem' }}>
                <h3 style={{
                  color: '#000000',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {item.name || 'Menu Item'}
                </h3>

                <div style={{
                  fontSize: '0.75rem',
                  color: '#374151',
                  marginBottom: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.25rem',
                  display: 'inline-block'
                }}>
                  {item.category || 'Delicious'}
                </div>

                <p style={{
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  lineHeight: '1.4',
                  marginBottom: '1rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {item.description || 'A delicious menu item that will satisfy your taste buds.'}
                </p>

                {/* Feature Badges */}
                <div className="popular-item-features" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    padding: '0.5rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    border: '1px solid #e5e7eb'
                  }}>
                    <FiClock size={12} />
                    <span>{item.cookingTime || item.prepTime || '15 min'}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    padding: '0.5rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    border: '1px solid #e5e7eb'
                  }}>
                    <FiThermometer size={12} />
                    <span>{item.spiceLevel || item.taste || 'Mild'}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    padding: '0.5rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    border: '1px solid #e5e7eb'
                  }}>
                    <FiHeart size={12} />
                    <span>{item.dietaryInfo || item.type || 'Popular'}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleAddToCart(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.75rem',
                    background: '#000000',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#333333';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#000000';
                  }}
                >
                  <FiShoppingCart size={14} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
};

export default MostPopularItems;
