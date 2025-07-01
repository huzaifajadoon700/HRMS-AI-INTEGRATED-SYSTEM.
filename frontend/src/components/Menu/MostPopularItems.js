import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiStar, FiInfo, FiShoppingCart, FiClock, FiThermometer, FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { apiConfig } from "../../config/api";
import { getMenuImageUrl, handleImageError } from "../../utils/imageUtils";

const MostPopularItems = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



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
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }

          /* Responsive Styles for MostPopularItems */
          @media (max-width: 768px) {
            .popular-items-container {
              padding: 0 1rem !important;
            }
            .popular-items-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
              max-width: 100% !important;
            }
            .popular-items-title {
              font-size: 2rem !important;
            }
            .popular-item-card {
              max-width: 100% !important;
              min-width: auto !important;
              margin: 0 !important;
            }
            .popular-item-features {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 0.3rem !important;
            }
          }

          @media (max-width: 480px) {
            .popular-items-container {
              padding: 0 0.75rem !important;
            }
            .popular-items-title {
              font-size: 1.75rem !important;
            }
            .popular-item-features {
              grid-template-columns: 1fr !important;
              gap: 0.25rem !important;
            }
            .popular-item-content {
              padding: 0.75rem !important;
            }
          }
        `}
      </style>
      <section style={{
        width: '100%',
        margin: 0,
        padding: '4rem 0',
        background: 'linear-gradient(180deg, #0A192F 0%, #112240 50%, #0A192F 100%)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(100, 255, 218, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'float 6s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(187, 134, 252, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(30px)',
        animation: 'float 8s ease-in-out infinite reverse',
        zIndex: 0
      }} />

      <div className="popular-items-container" style={{
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="popular-items-title" style={{
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
          <Link
            to="/order-food"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.9), rgba(29, 78, 216, 0.8))',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '0.75rem',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(30, 64, 175, 0.6)',
              boxShadow: '0 4px 15px rgba(30, 64, 175, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(30, 64, 175, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(30, 64, 175, 0.3)';
            }}
          >
            View Full Menu
          </Link>
        </div>

        <div className="popular-items-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0.5rem'
        }}>
          {menuItems.map((item) => (
            <div
              key={item._id}
              className="popular-item-card"
              style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '1rem',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                width: '100%',
                maxWidth: '300px',
                minWidth: '250px',
                margin: '0 auto',
                position: 'relative',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
            >
              {/* Image Section */}
              <div style={{
                position: 'relative',
                height: '160px',
                overflow: 'hidden'
              }}>
                <img
                  src={getMenuImageUrl(item.image)}
                  alt={item.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
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
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(10px)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#fff'
                }}>
                  <FiStar style={{ color: '#ffc107', fill: '#ffc107' }} size={12} />
                  <span style={{ fontWeight: '700' }}>{item.rating?.toFixed(1) || '4.5'}</span>
                </div>

                {/* Price Badge */}
                <div style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
                  backgroundColor: 'rgba(187, 134, 252, 0.9)',
                  backdropFilter: 'blur(10px)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#fff'
                }}>
                  {formatPrice(item.price)}
                </div>
              </div>

              {/* Content Section */}
              <div className="popular-item-content" style={{ padding: '1rem' }}>
                <h3 style={{
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '700',
                  marginBottom: '0.25rem',
                  background: 'linear-gradient(135deg, #ffffff 0%, #bb86fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: '1.2'
                }}>
                  {item.name || 'Menu Item'}
                </h3>

                <div style={{
                  fontSize: '0.7rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'rgba(187, 134, 252, 0.1)',
                  borderRadius: '0.5rem',
                  display: 'inline-block',
                  border: '1px solid rgba(187, 134, 252, 0.2)'
                }}>
                  {item.category || 'Delicious'}
                </div>

                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.8rem',
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
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(100, 255, 218, 0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '0.7rem',
                    color: 'rgba(100, 255, 218, 0.9)',
                    border: '1px solid rgba(100, 255, 218, 0.2)'
                  }}>
                    <FiClock size={10} />
                    <span>15 min</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255, 107, 157, 0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '0.7rem',
                    color: 'rgba(255, 107, 157, 0.9)',
                    border: '1px solid rgba(255, 107, 157, 0.2)'
                  }}>
                    <FiThermometer size={10} />
                    <span>Spicy</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '0.7rem',
                    color: 'rgba(255, 193, 7, 0.9)',
                    border: '1px solid rgba(255, 193, 7, 0.2)'
                  }}>
                    <FiHeart size={10} />
                    <span>Popular</span>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  to="/order-food"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, rgba(187, 134, 252, 0.8) 0%, rgba(255, 107, 157, 0.8) 100%)',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(187, 134, 252, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <FiShoppingCart size={14} />
                  Order Now
                </Link>
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
