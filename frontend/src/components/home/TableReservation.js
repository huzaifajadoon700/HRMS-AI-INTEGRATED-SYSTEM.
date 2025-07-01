import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiUsers, FiMapPin, FiClock, FiInfo, FiStar, FiTarget, FiShoppingCart, FiEye } from "react-icons/fi";
import { tableRecommendationService, tableUtils } from "../../services/tableRecommendationService";

const TableReservation = () => {
  const [tables, setTables] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredTable, setHoveredTable] = useState(null);
  // Removed unused state variables
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    fetchTables();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  const fetchTables = async () => {
    try {
      // Always fetch regular tables first as fallback
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      const tablesResponse = await axios.get(`${apiUrl}/tables`);
      console.log('Fetched tables:', tablesResponse.data);

      if (tablesResponse.data && tablesResponse.data.length > 0) {
        const regularTables = tablesResponse.data.slice(0, 3);
        setTables(regularTables);

        // Simply use regular tables for everyone - no recommendations
        console.log('Using regular tables for featured tables');
        const featuredTables = regularTables.map(table => ({
          ...table,
          isRecommendation: false
        }));
        setRecommendations(featuredTables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError("Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  const recordInteraction = async (tableId, interactionType) => {
    if (!isLoggedIn) return;

    try {
      await tableRecommendationService.recordInteraction({
        tableId,
        interactionType,
        source: 'home_page'
      });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const getCurrentTables = () => {
    // Always prioritize recommendations if available, otherwise use regular tables
    if (recommendations.length > 0) {
      console.log('Using recommendations:', recommendations.length);
      return recommendations.slice(0, 3);
    }
    console.log('Using regular tables:', tables.length);
    return tables.slice(0, 3);
  };

  // Removed unused slider functions since we're showing only 3 tables

  // Using tableUtils.getImageUrl instead

  const currentTables = getCurrentTables();
  const visibleTables = currentTables; // Show all 3 without sliding

  if (loading) {
    return (
      <section className="tables-section">
        <div className="container">
          <div className="section-header">
            <h6 className="section-subtitle">Our Tables</h6>
            <h2 className="section-title">Featured Dining Spaces</h2>
          </div>
          <div className="tables-slider">
            <div className="tables-container">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="table-card">
                  <div className="skeleton-loader">
                    <div className="skeleton-image" />
                    <div className="skeleton-content">
                      <div className="skeleton-title" />
                      <div className="skeleton-text" />
                      <div className="skeleton-text" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="tables-section">
        <div className="container">
          <div className="alert alert-warning d-flex align-items-center">
            <FiInfo className="me-2" />
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

          /* Responsive Styles for TableReservation */
          @media (max-width: 768px) {
            .table-reservation-container {
              padding: 0 1rem !important;
            }
            .table-reservation-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
              max-width: 100% !important;
            }
            .table-reservation-title {
              font-size: 2rem !important;
            }
            .table-card-mobile {
              max-width: 100% !important;
              min-width: auto !important;
              margin: 0 !important;
            }
            .table-features-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 0.3rem !important;
            }
          }

          @media (max-width: 480px) {
            .table-reservation-container {
              padding: 0 0.75rem !important;
            }
            .table-reservation-title {
              font-size: 1.75rem !important;
            }
            .table-features-grid {
              grid-template-columns: 1fr !important;
              gap: 0.25rem !important;
            }
            .table-card-content {
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
          top: '15%',
          right: '8%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(187, 134, 252, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(35px)',
          animation: 'float 7s ease-in-out infinite',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: '65%',
          left: '5%',
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(255, 107, 157, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(25px)',
          animation: 'float 9s ease-in-out infinite reverse',
          zIndex: 0
        }} />

        <div className="table-reservation-container" style={{
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 className="table-reservation-title" style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #ffffff 0%, #bb86fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1rem',
              lineHeight: '1.1'
            }}>
              Featured Tables
            </h2>
            <Link
              to="/reserve-table"
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
              View All Tables
            </Link>
          </div>

          <div className="table-reservation-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            width: '100%',
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0.5rem'
          }}>
            {visibleTables.map((item, index) => {
              // Since we've already processed recommendations, item should be the table directly
              const table = item;
              const isRecommendation = item.isRecommendation || false;

              console.log(`Table ${index}:`, {
                table: table,
                tableName: table.tableName,
                image: table.image,
                capacity: table.capacity,
                isRecommendation: isRecommendation,
                _id: table._id
              });

              // Skip if no valid table data
              if (!table || !table._id) {
                console.warn(`Skipping invalid table at index ${index}:`, table);
                return null;
              }

              return (
                <div
                  key={table._id || index}
                  className="table-card-mobile"
                  style={{
                    background: hoveredTable === table._id 
                      ? 'linear-gradient(145deg, rgba(187, 134, 252, 0.08) 0%, rgba(255, 107, 157, 0.04) 100%)'
                      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: hoveredTable === table._id 
                      ? '1px solid rgba(187, 134, 252, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    width: '100%',
                    maxWidth: '300px',
                    minWidth: '250px',
                    margin: '0 auto',
                    position: 'relative',
                    boxShadow: hoveredTable === table._id 
                      ? '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(100, 255, 218, 0.3)'
                      : '0 4px 15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                    transform: hoveredTable === table._id ? 'translateY(-5px)' : 'translateZ(0)',
                    zIndex: hoveredTable === table._id ? 2 : 1
                  }}
                  onMouseEnter={() => {
                    recordInteraction(table._id, 'view');
                    setHoveredTable(table._id);
                  }}
                  onMouseLeave={() => {
                    setHoveredTable(null);
                  }}
                >
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '160px',
                    overflow: 'hidden',
                    borderRadius: '1rem 1rem 0 0',
                    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%)'
                  }}>
                    {/* Table Image */}
                    <img
                      src={tableUtils.getImageUrl(table.image)}
                      alt={table.tableName || 'Table'}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onError={(e) => {
                        e.target.src = "/images/placeholder-table.jpg";
                        e.target.onerror = null;
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)',
                      opacity: 0.6
                    }} />

                    {/* Recommendation Badge */}
                    {isRecommendation && (
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8a80 100%)',
                        color: '#fff',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <FiTarget size={10} />
                        AI Pick
                      </div>
                    )}

                    {/* Status Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      background: 'linear-gradient(135deg, #64ffda 0%, #bb86fc 100%)',
                      color: '#0a0a0a',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '1rem',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      boxShadow: '0 4px 15px rgba(100, 255, 218, 0.3)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {table.status || 'Available'}
                    </div>

                    {/* Rating Badge */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      left: '0.75rem',
                      background: 'rgba(0, 0, 0, 0.8)',
                      color: '#fff',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
                    }}>
                      <FiStar style={{ color: '#ffc107', fill: '#ffc107' }} size={12} />
                      <span style={{ fontWeight: '700' }}>{table.avgRating ? table.avgRating.toFixed(1) : '4.5'}</span>
                    </div>
                  </div>

                  <div className="table-card-content" style={{
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    height: 'calc(100% - 160px)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
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
                          {table.tableName || `Table ${index + 1}`}
                        </h3>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: 'rgba(187, 134, 252, 0.1)',
                          color: '#bb86fc',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.75rem',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          border: '1px solid rgba(187, 134, 252, 0.2)'
                        }}>
                          {table.tableType || 'Premium'}
                        </div>
                      </div>
                    </div>

                    <div className="table-features-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(187, 134, 252, 0.08)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(187, 134, 252, 0.15)'
                      }}>
                        <FiUsers size={14} style={{ color: '#bb86fc' }} />
                        <span style={{
                          fontSize: '0.65rem',
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: '600',
                          textAlign: 'center'
                        }}>
                          {table.capacity || 4} Seats
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(100, 255, 218, 0.08)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(100, 255, 218, 0.15)'
                      }}>
                        <FiMapPin size={14} style={{ color: '#64ffda' }} />
                        <span style={{
                          fontSize: '0.65rem',
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: '600',
                          textAlign: 'center'
                        }}>
                          {table.location || 'Premium'}
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255, 107, 157, 0.08)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(255, 107, 157, 0.15)'
                      }}>
                        <FiClock size={14} style={{ color: '#ff6b9d' }} />
                        <span style={{
                          fontSize: '0.65rem',
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: '600',
                          textAlign: 'center'
                        }}>
                          {table.ambiance || 'Cozy'}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '0.5rem'
                    }}>
                      <Link
                        to="/reserve-table"
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem',
                          background: 'linear-gradient(135deg, #bb86fc 0%, #64ffda 100%)',
                          color: '#0a0a0a',
                          textDecoration: 'none',
                          borderRadius: '0.75rem',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          transition: 'all 0.3s ease',
                          border: 'none',
                          boxShadow: '0 4px 15px rgba(187, 134, 252, 0.3)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                        onClick={() => recordInteraction(table._id, 'inquiry')}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(187, 134, 252, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(187, 134, 252, 0.3)';
                        }}
                      >
                        <FiShoppingCart size={14} />
                        Reserve
                      </Link>

                      <Link
                        to={`/table-details/${table._id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.75rem',
                          border: '1px solid rgba(187, 134, 252, 0.4)',
                          color: '#bb86fc',
                          textDecoration: 'none',
                          borderRadius: '0.75rem',
                          transition: 'all 0.3s ease',
                          backgroundColor: 'rgba(187, 134, 252, 0.08)',
                          backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(187, 134, 252, 0.15)';
                          e.currentTarget.style.borderColor = '#bb86fc';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(187, 134, 252, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(187, 134, 252, 0.4)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <FiEye size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        {currentTables.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 0',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            <FiInfo size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fff' }}>
              No tables available
            </h3>
            <p>Please check back later or try different filters.</p>
          </div>
        )}
      </div>
    </section>
    </>
  );
};

export default TableReservation;