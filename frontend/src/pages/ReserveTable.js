import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FiCalendar, FiUsers, FiClock, FiX, FiStar, FiHeart } from "react-icons/fi";
import Header from "../components/common/Header";
import EditReservation from "../components/User/EditReservation";
import TableRecommendations from "../components/tables/TableRecommendations";
import { tableRecommendationService, tableUtils } from "../services/tableRecommendationService";
import "./ReserveTable.css";

// Add responsive styles
const responsiveStyles = `
  @media (max-width: 768px) {
    .reserve-table-hero {
      padding: 1.5rem 1rem 1rem !important;
    }
    .reserve-table-title {
      font-size: 2rem !important;
    }
    .reserve-table-subtitle {
      font-size: 0.9rem !important;
    }
    .reserve-table-tabs {
      flex-direction: column !important;
      gap: 0.5rem !important;
    }
    .reserve-table-tab-button {
      padding: 0.625rem 1rem !important;
      font-size: 0.8rem !important;
    }
    .reserve-table-filters {
      margin: 0 1rem 1.5rem !important;
      padding: 1rem !important;
    }
    .reserve-table-filters-grid {
      grid-template-columns: 1fr !important;
      gap: 0.75rem !important;
    }
    .reserve-table-filters-grid-secondary {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 0.75rem !important;
    }
    .reserve-table-grid {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
      margin: 0 1rem !important;
    }
    .reserve-table-card {
      margin: 0 !important;
    }
    .reserve-table-card-content {
      padding: 1.25rem !important;
    }
    .reserve-table-card-title {
      font-size: 1.1rem !important;
    }
    .reserve-table-card-description {
      font-size: 0.85rem !important;
    }
    .reserve-table-badge {
      padding: 0.375rem 0.625rem !important;
      font-size: 0.75rem !important;
    }
    .reserve-table-feature {
      font-size: 0.8rem !important;
      padding: 0.375rem !important;
    }
    .reserve-table-button {
      padding: 0.625rem 1rem !important;
      font-size: 0.85rem !important;
    }
  }

  @media (max-width: 480px) {
    .reserve-table-hero {
      padding: 1rem 0.75rem 0.75rem !important;
    }
    .reserve-table-title {
      font-size: 1.75rem !important;
    }
    .reserve-table-subtitle {
      font-size: 0.85rem !important;
    }
    .reserve-table-filters {
      margin: 0 0.75rem 1.25rem !important;
      padding: 0.75rem !important;
    }
    .reserve-table-filters-grid-secondary {
      grid-template-columns: 1fr !important;
    }
    .reserve-table-grid {
      margin: 0 0.75rem !important;
      gap: 0.75rem !important;
    }
    .reserve-table-card-content {
      padding: 1rem !important;
    }
    .reserve-table-card-title {
      font-size: 1rem !important;
    }
    .reserve-table-card-description {
      font-size: 0.8rem !important;
    }
    .reserve-table-badge {
      padding: 0.25rem 0.5rem !important;
      font-size: 0.7rem !important;
    }
    .reserve-table-feature {
      font-size: 0.75rem !important;
      padding: 0.25rem !important;
    }
    .reserve-table-button {
      padding: 0.5rem 0.75rem !important;
      font-size: 0.8rem !important;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = responsiveStyles;
  document.head.appendChild(styleElement);
}

const ReserveTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("recommendations");
  const [reservationData, setReservationData] = useState({
    date: "",
    time: "",
    guests: 1,
  });
  const [filters, setFilters] = useState({
    capacity: "",
    location: "",
    tableType: "",
    priceRange: "",
    availability: true
  });
  
  // Extract the edit reservation ID from URL query parameters (if it exists)
  const queryParams = new URLSearchParams(location.search);
  const editReservationId = queryParams.get('edit');



  useEffect(() => {
    fetchTables();
  }, []);

  // Filter tables based on criteria
  useEffect(() => {
    filterTables();
  }, [tables, reservationData, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const filterTables = async () => {
    let filtered = [...tables];

    // Filter by capacity
    if (reservationData.guests) {
      filtered = filtered.filter(table => table.capacity >= parseInt(reservationData.guests));
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(table =>
        table.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by table type
    if (filters.tableType) {
      filtered = filtered.filter(table =>
        table.tableType?.toLowerCase() === filters.tableType.toLowerCase()
      );
    }

    // Check availability for specific date/time
    if (reservationData.date && reservationData.time && filters.availability) {
      try {
        const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
        const response = await axios.get(`${apiUrl}/tables/availability`, {
          params: {
            reservationDate: reservationData.date,
            time: reservationData.time,
            endTime: calculateEndTime(reservationData.time)
          }
        });

        const availableTables = response.data
          .filter(item => item.isAvailable)
          .map(item => item.table._id);

        filtered = filtered.filter(table => availableTables.includes(table._id));
      } catch (error) {
        console.error("Error checking availability:", error);
      }
    }

    setFilteredTables(filtered);
  };

  const calculateEndTime = (startTime) => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(':').map(Number);
    let newHours = hours + 2;
    if (newHours >= 24) newHours -= 24;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const fetchTables = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      const response = await axios.get(`${apiUrl}/tables`);
      setTables(response.data);
    } catch (error) {
      setError("Failed to load tables. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const recordInteraction = async (tableId, interactionType, additionalData = {}) => {
    try {
      await tableRecommendationService.recordInteraction({
        tableId,
        interactionType,
        context: {
          occasion: reservationData.occasion,
          partySize: reservationData.guests,
          timeSlot: reservationData.timeSlot
        },
        ...additionalData
      });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const validateReservation = () => {
    const errors = [];

    // Date validation
    if (!reservationData.date) {
      errors.push("Please select a reservation date");
    } else {
      const selectedDate = new Date(reservationData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.push("Cannot book tables for past dates");
      }

      // Check if date is too far in future (6 months)
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 6);
      if (selectedDate > maxDate) {
        errors.push("Cannot book tables more than 6 months in advance");
      }
    }

    // Time validation
    if (!reservationData.time) {
      errors.push("Please select a reservation time");
    } else {
      const [hours] = reservationData.time.split(':').map(Number);
      if (hours < 10 || hours > 22) {
        errors.push("Reservations are only available between 10:00 AM and 10:00 PM");
      }
    }

    // Guest validation
    if (!reservationData.guests || reservationData.guests < 1) {
      errors.push("Please specify number of guests (minimum 1)");
    } else if (reservationData.guests > 20) {
      errors.push("For parties larger than 20, please call us directly");
    }

    return errors;
  };

  const handleReserveClick = async (table) => {
    // Record booking interaction
    await recordInteraction(table._id, 'booking');

    // Store the selected table and reservation data in localStorage
    // Use simple approach like recommendations tab - let user fill details on reservation page
    const reservationDetails = {
      tableId: table._id,
      tableName: table.tableName,
      tableImage: tableUtils.getImageUrl(table.image),
      tableCapacity: table.capacity,
      tableDescription: table.description,
      date: reservationData.date || '', // Pass current values but allow empty
      time: reservationData.time || '', // Pass current values but allow empty
      guests: reservationData.guests || 1,
    };

    localStorage.setItem('reservationDetails', JSON.stringify(reservationDetails));
    setError(null); // Clear any previous errors
    navigate('/table-reservation');
  };

  const handleTableView = async (table) => {
    await recordInteraction(table._id, 'view', {
      sessionDuration: Math.floor(Math.random() * 300) + 30
    });
  };

  const handleTableFavorite = async (table) => {
    await recordInteraction(table._id, 'favorite');
  };
  
  const handleEditSuccess = () => {
    // After successful edit, go back to My Reservations
    navigate('/my-reservations');
  };

  // If in edit mode, show the EditReservation component instead
  if (editReservationId) {
    return (
      <>
        <Header />
        <div style={{
          background: '#0A192F',
          minHeight: '100vh',
          paddingTop: '80px'
        }}>
          <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <EditReservation
              reservationId={editReservationId}
              onClose={() => navigate('/my-reservations')}
              onSuccess={handleEditSuccess}
            />
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div style={{
          background: '#ffffff',
          minHeight: '100vh',
          position: 'relative',
          width: '100%',
          margin: 0,
          padding: 0,
          paddingTop: '80px'
        }}>
          {/* Main Content */}
          <div style={{
            position: 'relative',
            width: '100%',
            margin: '0',
            padding: '2rem 1.5rem 1.5rem'
          }}>
            {/* Hero Section */}
            <div style={{
              textAlign: 'center',
              marginBottom: '3rem',
              padding: '1rem 0'
            }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#000000',
                marginBottom: '1rem',
                lineHeight: '1.2',
                fontFamily: 'Inter, sans-serif'
              }}>
                Reserve a Table
              </h1>
              <p style={{
                fontSize: '1.125rem',
                color: '#6b7280',
                margin: '0',
                lineHeight: '1.5',
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                Loading available tables...
              </p>
            </div>

            {/* Loading Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              {Array(8).fill().map((_, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    height: '400px',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{
        background: '#ffffff',
        minHeight: '100vh',
        position: 'relative',
        width: '100%',
        margin: 0,
        padding: 0,
        paddingTop: '80px'
      }}>
        {/* Main Content */}
        <div style={{
          position: 'relative',
          width: '100%',
          margin: '0',
          padding: '2rem 1.5rem 1.5rem'
        }}>
          {/* Hero Section */}
          <div className="reserve-table-hero" style={{
            textAlign: 'center',
            marginBottom: '3rem',
            padding: '1rem 0'
          }}>
            <h1 className="reserve-table-title" style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '1rem',
              lineHeight: '1.2',
              fontFamily: 'Inter, sans-serif'
            }}>
              Reserve a Table
            </h1>
            <p className="reserve-table-subtitle" style={{
              fontSize: '1.125rem',
              color: '#6b7280',
              margin: '0',
              lineHeight: '1.5',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Book your perfect dining experience
            </p>
          </div>

          {/* Tabs Section */}
          <div style={{
            background: 'transparent',
            padding: '0',
            marginBottom: '2rem'
          }}>
            {/* Tab Navigation */}
            <div className="reserve-table-tabs" style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '2rem',
              justifyContent: 'center'
            }}>
              <button
                className="reserve-table-tab-button"
                onClick={() => setActiveTab('recommendations')}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: activeTab === 'recommendations' ? '#000000' : '#f3f4f6',
                  color: activeTab === 'recommendations' ? '#ffffff' : '#374151',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                💝 RECOMMENDED FOR YOU
              </button>
              <button
                className="reserve-table-tab-button"
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: activeTab === 'all' ? '#000000' : '#f3f4f6',
                  color: activeTab === 'all' ? '#ffffff' : '#374151',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                🍽️ ALL TABLES
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'recommendations' ? (
              <div style={{
                background: 'transparent',
                padding: '0',
                textAlign: 'center'
              }}>
                <TableRecommendations />
              </div>
            ) : (
              <div>
                {/* Booking Form Container - Same style as Recommendations */}
                <div className="reserve-table-filters" style={{
                  background: 'rgba(100, 255, 218, 0.05)',
                  borderRadius: '1rem',
                  padding: '1.2rem',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(100, 255, 218, 0.1)'
                }}>
                  <h3 style={{
                    color: '#000000',
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    🍽️ Find Your Perfect Table
                  </h3>

                  <div className="reserve-table-filters-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', marginBottom: '0.8rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
                        📅 Date *
                      </label>
                      <input
                        type="date"
                        value={reservationData.date}
                        min={new Date().toISOString().split('T')[0]}
                        max={new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        onChange={(e) => {
                          setReservationData({ ...reservationData, date: e.target.value });
                          setError(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: '#ffffff',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          color: '#000000',
                          fontSize: '0.875rem',
                          fontFamily: 'Inter, sans-serif'
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
                        🕐 Time *
                      </label>
                      <input
                        type="time"
                        value={reservationData.time}
                        min="10:00"
                        max="22:00"
                        onChange={(e) => {
                          setReservationData({ ...reservationData, time: e.target.value });
                          setError(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: '#ffffff',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          color: '#000000',
                          fontSize: '0.875rem',
                          fontFamily: 'Inter, sans-serif'
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
                        👥 Guests *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={reservationData.guests}
                        onChange={(e) => {
                          setReservationData({ ...reservationData, guests: e.target.value });
                          setError(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: '#ffffff',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          color: '#000000',
                          fontSize: '0.875rem',
                          fontFamily: 'Inter, sans-serif'
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="reserve-table-filters-grid-secondary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.8rem', marginBottom: '0.8rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
                        📍 Location
                      </label>
                      <select
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: '#ffffff',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          color: '#000000',
                          fontSize: '0.875rem',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      >
                  <option value="">Any Location</option>
                  <option value="window">Window View</option>
                  <option value="garden">Garden View</option>
                  <option value="private">Private Area</option>
                  <option value="main">Main Dining</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
                        🍽️ Table Type
                      </label>
                      <select
                        value={filters.tableType}
                        onChange={(e) => setFilters({ ...filters, tableType: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: '#ffffff',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          color: '#000000',
                          fontSize: '0.875rem',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      >
                        <option value="">Any Type</option>
                        <option value="romantic">Romantic</option>
                        <option value="family">Family</option>
                        <option value="business">Business</option>
                        <option value="casual">Casual</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
                        📊 Capacity
                      </label>
                      <select
                        value={filters.capacity}
                        onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: '#ffffff',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          color: '#000000',
                          fontSize: '0.875rem',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      >
                        <option value="">Any Size</option>
                        <option value="2">2 People</option>
                        <option value="4">4 People</option>
                        <option value="6">6 People</option>
                        <option value="8">8+ People</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'end' }}>
                      <label style={{ display: 'flex', alignItems: 'center', color: '#374151', fontSize: '0.875rem', marginTop: '0.75rem', fontFamily: 'Inter, sans-serif' }}>
                        <input
                          type="checkbox"
                          checked={filters.availability}
                          onChange={(e) => setFilters({ ...filters, availability: e.target.checked })}
                          style={{ marginRight: '0.5rem', accentColor: '#000000' }}
                        />
                        Show only available
                      </label>
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '0.9rem',
                    padding: '1rem',
                    background: 'transparent',
                    borderRadius: '0.75rem',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Showing {filteredTables.length} of {tables.length} tables
                    {reservationData.date && reservationData.time && (
                      <span style={{ marginLeft: '0.5rem' }}>
                        for {new Date(reservationData.date).toLocaleDateString()} at {reservationData.time}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#dc2626',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontFamily: 'Inter, sans-serif'
            }}>
              <FiX />
              {error}
            </div>
          )}

          {/* Tables Grid - Only show when not on recommendations tab */}
          {activeTab !== 'recommendations' && (
            <div className="reserve-table-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
            {loading ? (
              Array(8).fill().map((_, index) => (
                <div
                  key={index}
                  style={{
                    background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    height: '500px',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                />
              ))
            ) : filteredTables.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '4rem 2rem',
                color: '#6b7280'
              }}>
                <FiCalendar size={64} style={{ color: '#9ca3af', marginBottom: '1.5rem' }} />
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>
                  No tables available
                </h3>
                <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                  Try adjusting your filters or selecting a different date/time
                </p>
              </div>
            ) : (
              filteredTables.map((table) => (
                <div
                  key={table._id}
                  className="reserve-table-card"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    handleTableView(table);
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Table Image */}
                  <div style={{ position: 'relative', paddingTop: '60%', overflow: 'hidden' }}>
                    <img
                      src={tableUtils.getImageUrl(table.image)}
                      alt={table.tableName}
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

                    {/* Capacity Badge */}
                    <div className="reserve-table-badge" style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: '#000000',
                      color: '#ffffff',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      <FiUsers size={14} />
                      {table.capacity} seats
                    </div>

                    {/* Rating Badge */}
                    {table.avgRating && (
                      <div className="reserve-table-badge" style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        background: '#fbbf24',
                        color: '#ffffff',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        <FiStar size={14} />
                        {table.avgRating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="reserve-table-card-content" style={{ padding: '1.5rem' }}>
                    {/* Header with Title and Favorite */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h3 className="reserve-table-card-title" style={{
                        color: '#000000',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        margin: 0,
                        lineHeight: '1.2',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {table.tableName}
                      </h3>
                      <button
                        onClick={() => handleTableFavorite(table)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(255, 107, 157, 0.8)',
                          padding: '0.5rem',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FiHeart size={16} />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="reserve-table-card-description" style={{
                      color: '#6b7280',
                      fontSize: '0.9rem',
                      lineHeight: '1.4',
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {table.description}
                    </p>

                    {/* Location */}
                    {table.location && (
                      <div style={{
                        color: '#9ca3af',
                        fontSize: '0.8rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        📍 {table.location}
                      </div>
                    )}

                    {/* Features */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <div className="reserve-table-feature" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#374151',
                        fontSize: '0.85rem',
                        padding: '0.5rem',
                        background: '#f9fafb',
                        borderRadius: '0.5rem'
                      }}>
                        <FiClock size={16} style={{ color: '#374151' }} />
                        <span>Available for booking</span>
                      </div>
                      <div className="reserve-table-feature" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        padding: '0.5rem',
                        background: '#f3f4f6',
                        borderRadius: '0.5rem'
                      }}>
                        <FiUsers size={16} style={{ color: '#374151' }} />
                        <span>Max {table.capacity} guests</span>
                      </div>
                    </div>

                    {/* Reserve Button */}
                    <button
                      className="reserve-table-button"
                      onClick={() => handleReserveClick(table)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: '#000000',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      Reserve Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReserveTable;