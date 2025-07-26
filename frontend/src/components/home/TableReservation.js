import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiUsers, FiMapPin, FiClock, FiInfo, FiStar, FiShoppingCart, FiEye } from "react-icons/fi";
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
          /* Responsive Styles for TableReservation */
          @media (max-width: 768px) {
            .table-reservation-container {
              padding: 0 1rem !important;
            }
            .table-reservation-grid {
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
              gap: 1rem !important;
              max-width: 100% !important;
            }
            .table-reservation-title {
              font-size: 1.75rem !important;
            }
            .table-card-mobile {
              max-width: 100% !important;
              min-width: 250px !important;
              margin: 0 !important;
            }
          }

          @media (max-width: 480px) {
            .table-reservation-container {
              padding: 0 0.75rem !important;
            }
            .table-reservation-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
            .table-reservation-title {
              font-size: 1.5rem !important;
            }
            .table-card-mobile {
              min-width: auto !important;
            }
            .table-card-content {
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

        <div className="table-reservation-container" style={{
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="table-reservation-title" style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: '#000000',
              marginBottom: '1rem',
              fontFamily: 'Inter, sans-serif'
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
              View All Tables
            </Link>
          </div>

          <div className="table-reservation-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem'
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
                    boxShadow: hoveredTable === table._id
                      ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                      : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transform: hoveredTable === table._id ? 'translateY(-2px)' : 'translateY(0)'
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
                    height: '200px',
                    overflow: 'hidden'
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

                    {/* Recommendation Badge */}
                    {isRecommendation && (
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        background: '#000000',
                        color: '#ffffff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        Recommended
                      </div>
                    )}

                    {/* Status Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      background: '#ffffff',
                      color: '#000000',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      border: '1px solid #e5e7eb'
                    }}>
                      {table.status || 'Available'}
                    </div>

                    {/* Rating Badge */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      left: '0.75rem',
                      background: '#ffffff',
                      color: '#000000',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      border: '1px solid #e5e7eb'
                    }}>
                      <FiStar style={{ color: '#fbbf24' }} size={12} />
                      <span>{table.avgRating ? table.avgRating.toFixed(1) : '4.5'}</span>
                    </div>
                  </div>

                  <div className="table-card-content" style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    background: '#ffffff'
                  }}>
                    <div>
                      <h3 style={{
                        color: '#000000',
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {table.tableName || `Table ${index + 1}`}
                      </h3>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {table.tableType || 'Premium'}
                      </div>
                    </div>

                    <div className="table-features-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        <FiUsers size={16} style={{ color: '#6b7280' }} />
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#374151',
                          fontWeight: '500',
                          textAlign: 'center'
                        }}>
                          {table.capacity || 4} Seats
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        <FiMapPin size={16} style={{ color: '#6b7280' }} />
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#374151',
                          fontWeight: '500',
                          textAlign: 'center'
                        }}>
                          {table.location || 'Premium'}
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        <FiClock size={16} style={{ color: '#6b7280' }} />
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#374151',
                          fontWeight: '500',
                          textAlign: 'center'
                        }}>
                          {table.ambiance || 'Cozy'}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '0.75rem',
                      marginTop: '1rem'
                    }}>
                      <Link
                        to="/table-reservation"
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem',
                          background: '#000000',
                          color: '#ffffff',
                          textDecoration: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: '500',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s ease',
                          border: 'none'
                        }}
                        onClick={() => {
                          recordInteraction(table._id, 'inquiry');
                          // Store table details for the reservation page
                          const reservationDetails = {
                            tableId: table._id,
                            tableName: table.tableName,
                            tableImage: table.image,
                            tableCapacity: table.capacity,
                            tableDescription: table.description,
                            tableType: table.tableType,
                            location: table.location
                          };
                          localStorage.setItem('reservationDetails', JSON.stringify(reservationDetails));
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#333333';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#000000';
                        }}
                      >
                        <FiShoppingCart size={14} />
                        Reserve
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