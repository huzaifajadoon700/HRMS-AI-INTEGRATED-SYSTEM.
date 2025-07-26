import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiClock, FiStar, FiHeart, FiCalendar } from 'react-icons/fi';
import { tableRecommendationService, tableService, tableUtils } from '../../services/tableRecommendationService';

// Add responsive styles for TableRecommendations
const responsiveStyles = `
  @media (max-width: 768px) {
    .table-recommendations-filters {
      margin: 0 1rem 1.5rem !important;
      padding: 1rem !important;
    }
    .table-recommendations-filters-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 0.75rem !important;
    }
    .table-recommendations-grid {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
      margin: 0 1rem !important;
    }
    .table-recommendation-card {
      margin: 0 !important;
    }
    .table-recommendation-content {
      padding: 1.25rem !important;
    }
    .table-recommendation-title {
      font-size: 1.1rem !important;
    }
    .table-recommendation-description {
      font-size: 0.85rem !important;
    }
    .table-recommendation-badge {
      padding: 0.375rem 0.625rem !important;
      font-size: 0.75rem !important;
    }
    .table-recommendation-button {
      padding: 0.625rem 1rem !important;
      font-size: 0.85rem !important;
    }
  }

  @media (max-width: 480px) {
    .table-recommendations-filters {
      margin: 0 0.75rem 1.25rem !important;
      padding: 0.75rem !important;
    }
    .table-recommendations-filters-grid {
      grid-template-columns: 1fr !important;
      gap: 0.5rem !important;
    }
    .table-recommendations-grid {
      margin: 0 0.75rem !important;
      gap: 0.75rem !important;
    }
    .table-recommendation-content {
      padding: 1rem !important;
    }
    .table-recommendation-title {
      font-size: 1rem !important;
    }
    .table-recommendation-description {
      font-size: 0.8rem !important;
    }
    .table-recommendation-badge {
      padding: 0.25rem 0.5rem !important;
      font-size: 0.7rem !important;
    }
    .table-recommendation-button {
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

const TableRecommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [context, setContext] = useState({
    occasion: '',
    partySize: 2,
    timeSlot: '',
    numRecommendations: 10
  });
  const [recommendationStats, setRecommendationStats] = useState({
    totalRecommendations: 0,
    mlModelActive: false,
    fallbackMode: false,
    cached: false
  });
  const occasions = ['Romantic', 'Business', 'Family', 'Friends', 'Celebration', 'Casual'];
  const timeSlots = ['Lunch', 'Early Dinner', 'Prime Dinner', 'Late Dinner'];

  useEffect(() => {
    loadInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      const token = localStorage.getItem('token');

      if (token) {
        // Try to load personalized recommendations for authenticated users
        try {
          const recsResponse = await tableRecommendationService.getRecommendations({
            ...context,
            numRecommendations: 8,
            useCache: true
          });

          console.log('📊 Initial table recommendations response:', recsResponse);

          if (recsResponse && recsResponse.success && recsResponse.recommendations) {
            // Process recommendations to ensure all required fields
            const processedRecommendations = recsResponse.recommendations.map((rec, index) => ({
              ...rec,
              rank: rec.rank || index + 1,
              score: rec.score || 0.5,
              confidence: rec.confidence || 'medium',
              explanation: rec.explanation || `This table matches your preferences for ${context.occasion || 'dining'}`,
              table: {
                ...rec.table,
                image: rec.table.image || '/images/placeholder-table.jpg'
              }
            }));

            setRecommendations(processedRecommendations);
            setRecommendationStats({
              totalRecommendations: processedRecommendations.length,
              mlModelActive: !recsResponse.fallback,
              fallbackMode: recsResponse.fallback || false,
              cached: recsResponse.cached || false
            });

            console.log('✅ Initial recommendations loaded:', processedRecommendations.length);
            console.log('📊 Initial recommendation stats set:', {
              totalRecommendations: processedRecommendations.length,
              mlModelActive: !recsResponse.fallback,
              fallbackMode: recsResponse.fallback || false,
              cached: recsResponse.cached || false
            });
            return; // Success, exit early
          }
        } catch (authError) {
          console.log('⚠️ Authentication failed, falling back to popular tables:', authError.message);
        }
      } else {
        console.log('⚠️ No authentication token, using popular tables for guest user');
      }

      // Fallback for unauthenticated users or auth failures: Use popular tables
      console.log('⚠️ Loading popular tables as recommendations');
      try {
        const popularResponse = await tableRecommendationService.getPopularTables({ limit: 8 });
        console.log('📊 Popular tables response:', popularResponse);

        if (popularResponse && popularResponse.success && popularResponse.tables && popularResponse.tables.length > 0) {
          // Convert popular tables to recommendation format
          const popularRecommendations = popularResponse.tables.map((table, index) => ({
            tableId: table._id,
            table: {
              ...table,
              image: table.image || '/images/placeholder-table.jpg'
            },
            score: table.score || (8 - index) / 8,
            reason: 'popularity',
            confidence: 'medium',
            rank: index + 1,
            explanation: `Popular table with ${table.avgRating ? table.avgRating.toFixed(1) + '/5 stars' : 'high ratings'}`,
            contextFactors: {
              occasion: context.occasion,
              partySize: context.partySize,
              timePreference: context.timeSlot
            }
          }));

          setRecommendations(popularRecommendations);
          setRecommendationStats({
            totalRecommendations: popularRecommendations.length,
            mlModelActive: false,
            fallbackMode: true,
            cached: false
          });

          console.log('✅ Popular tables loaded as recommendations:', popularRecommendations.length);
          console.log('📊 Popular tables stats set:', {
            totalRecommendations: popularRecommendations.length,
            mlModelActive: false,
            fallbackMode: true,
            cached: false
          });
          return; // Success, exit early
        } else {
          console.log('⚠️ No popular tables found, trying all tables');
          throw new Error('No popular tables available');
        }
      } catch (popularError) {
        console.error('❌ Failed to load popular tables:', popularError);

        // Final fallback: Load all available tables
        try {
          console.log('🔄 Trying final fallback with all tables...');
          const fallbackResponse = await tableService.getAllTables();
          console.log('📊 All tables response:', fallbackResponse?.length || 0, 'tables');

          // Use all tables if no available ones, or filter for available
          let tablesToUse = fallbackResponse || [];
          const availableTables = tablesToUse.filter(table => table.status === 'Available');

          if (availableTables.length > 0) {
            tablesToUse = availableTables;
            console.log('✅ Using', availableTables.length, 'available tables');
          } else {
            console.log('⚠️ No available tables, using all', tablesToUse.length, 'tables');
          }

          if (tablesToUse.length === 0) {
            throw new Error('No tables found in database');
          }

          // Smart fallback based on context
          const smartFallbackRecommendations = tablesToUse
            .map((table, index) => {
              let score = 0.5;
              let explanation = `Table suitable for ${context.occasion || 'dining'}`;

              // Boost score based on context matching
              if (table.capacity >= context.partySize && table.capacity <= context.partySize + 2) {
                score += 0.2;
                explanation += ` (perfect size for ${context.partySize} guests)`;
              }

              if (context.occasion === 'Romantic' && ['Intimate', 'Romantic'].includes(table.ambiance)) {
                score += 0.3;
                explanation += ' (romantic ambiance)';
              }

              if (table.avgRating >= 4.0) {
                score += 0.1;
                explanation += ` (${table.avgRating}/5 stars)`;
              }

              return {
                tableId: table._id,
                table: {
                  ...table,
                  image: table.image || '/images/placeholder-table.jpg'
                },
                score: Math.min(score, 1.0),
                reason: 'smart_fallback',
                confidence: score > 0.7 ? 'high' : 'medium',
                rank: index + 1,
                explanation: explanation,
                contextFactors: {
                  occasion: context.occasion,
                  partySize: context.partySize,
                  timePreference: context.timeSlot
                }
              };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 8);

          setRecommendations(smartFallbackRecommendations);
          setRecommendationStats({
            totalRecommendations: smartFallbackRecommendations.length,
            mlModelActive: false,
            fallbackMode: true,
            cached: false
          });

          console.log('✅ Final fallback recommendations generated:', smartFallbackRecommendations.length);
          console.log('📊 Final fallback stats set:', {
            totalRecommendations: smartFallbackRecommendations.length,
            mlModelActive: false,
            fallbackMode: true,
            cached: false
          });
        } catch (finalError) {
          console.error('❌ All fallback methods failed:', finalError);
          setError('No recommendations available at the moment. Please try again later.');
          setRecommendationStats({
            totalRecommendations: 0,
            mlModelActive: false,
            fallbackMode: false,
            cached: false
          });
        }
      }

    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      setError('Failed to load recommendations. Please try again.');
      setRecommendationStats({
        totalRecommendations: 0,
        mlModelActive: false,
        fallbackMode: false,
        cached: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContextChange = (field, value) => {
    setContext(prev => ({ ...prev, [field]: value }));
  };

  const getRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching table recommendations with context:', context);

      const response = await tableRecommendationService.getRecommendations({
        ...context,
        numRecommendations: 8,
        useCache: false
      });

      console.log('📊 Table recommendations response:', response);

      if (response.success && response.recommendations) {
        // Process recommendations to ensure all required fields
        const processedRecommendations = response.recommendations.map((rec, index) => ({
          ...rec,
          rank: rec.rank || index + 1,
          score: rec.score || 0.5,
          confidence: rec.confidence || 'medium',
          explanation: rec.explanation || `This table matches your preferences for ${context.occasion || 'dining'}`,
          table: {
            ...rec.table,
            image: rec.table.image || '/images/placeholder-table.jpg'
          }
        }));

        setRecommendations(processedRecommendations);
        setRecommendationStats({
          totalRecommendations: processedRecommendations.length,
          mlModelActive: !response.fallback,
          fallbackMode: response.fallback || false,
          cached: response.cached || false
        });

        console.log('✅ Processed recommendations:', processedRecommendations.length);
      } else {
        // Enhanced fallback: Load all available tables as smart recommendations
        console.log('⚠️ Using fallback recommendation system');
        try {
          const fallbackResponse = await tableService.getAllTables();
          const availableTables = fallbackResponse.filter(table => table.status === 'Available');

          // Smart fallback based on context
          const smartFallbackRecommendations = availableTables
            .map((table, index) => {
              let score = 0.5;
              let explanation = `Available table suitable for ${context.occasion || 'dining'}`;

              // Boost score based on context matching
              if (table.capacity >= context.partySize && table.capacity <= context.partySize + 2) {
                score += 0.2;
                explanation += ` (perfect size for ${context.partySize} guests)`;
              }

              if (context.occasion === 'romantic' && ['Intimate', 'Romantic'].includes(table.ambiance)) {
                score += 0.3;
                explanation += ' (romantic ambiance)';
              }

              if (table.avgRating >= 4.0) {
                score += 0.1;
                explanation += ` (${table.avgRating}/5 stars)`;
              }

              return {
                tableId: table._id,
                table: table,
                score: Math.min(score, 1.0),
                reason: 'smart_fallback',
                confidence: score > 0.7 ? 'high' : 'medium',
                rank: index + 1,
                explanation: explanation,
                contextFactors: {
                  occasion: context.occasion,
                  partySize: context.partySize,
                  timePreference: context.timeSlot
                }
              };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 8);

          setRecommendations(smartFallbackRecommendations);
          setRecommendationStats({
            totalRecommendations: smartFallbackRecommendations.length,
            mlModelActive: false,
            fallbackMode: true,
            cached: false
          });

          console.log('✅ Smart fallback recommendations generated:', smartFallbackRecommendations.length);
        } catch (fallbackError) {
          console.error('❌ Fallback failed:', fallbackError);
          setError('No recommendations available at the moment. Please try again later.');
          setRecommendationStats({
            totalRecommendations: 0,
            mlModelActive: false,
            fallbackMode: false,
            cached: false
          });
        }
      }
    } catch (error) {
      console.error('❌ Error getting recommendations:', error);
      setError('Failed to get recommendations. Please check your connection and try again.');
      setRecommendationStats({
        totalRecommendations: 0,
        mlModelActive: false,
        fallbackMode: false,
        cached: false
      });
    } finally {
      setLoading(false);
    }
  };

  const recordInteraction = async (tableId, interactionType, additionalData = {}) => {
    try {
      await tableRecommendationService.recordInteraction({
        tableId,
        interactionType,
        context,
        ...additionalData
      });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const handleTableView = (table) => {
    recordInteraction(table.tableId || table._id, 'view', {
      sessionDuration: Math.floor(Math.random() * 300) + 30 // 30-330 seconds
    });
  };

  const handleTableFavorite = (table) => {
    recordInteraction(table.tableId || table._id, 'favorite');
  };

  const handleTableInquiry = async (table) => {
    // Record booking interaction
    await recordInteraction(table.tableId || table._id, 'booking');

    // Store the selected table and reservation data in localStorage
    const reservationDetails = {
      tableId: table._id,
      tableName: table.tableName,
      tableImage: tableUtils.getImageUrl(table.image),
      tableCapacity: table.capacity,
      tableDescription: table.description,
      date: '', // Will be filled in the reservation form
      time: '', // Will be filled in the reservation form
      guests: context.partySize || 1,
    };

    localStorage.setItem('reservationDetails', JSON.stringify(reservationDetails));
    navigate('/table-reservation');
  };



  return (
    <div style={{
      width: '100%',
      background: 'transparent',
      margin: 0,
      padding: '0'
    }}>

      {/* Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Filters Section - Compact Design */}
        <div className="table-recommendations-filters" style={{
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
          🎯 Customize Your Recommendations
        </h3>

        <div className="table-recommendations-filters-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <div>
            <label style={{ display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
              🎉 Occasion
            </label>
            <select
              value={context.occasion}
              onChange={(e) => handleContextChange('occasion', e.target.value)}
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
              <option value="">Any Occasion</option>
              {occasions.map(occasion => (
                <option key={occasion} value={occasion}>
                  {occasion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
              👥 Party Size
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={context.partySize}
              onChange={(e) => handleContextChange('partySize', parseInt(e.target.value))}
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
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
              🕐 Time Preference
            </label>
            <select
              value={context.timeSlot}
              onChange={(e) => handleContextChange('timeSlot', e.target.value)}
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
              <option value="">Any Time</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button
              onClick={getRecommendations}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: loading ? '#9ca3af' : '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {loading ? 'Loading...' : 'Get Recommendations'}
            </button>
          </div>
        </div>
      </div>



      {/* Error Alert */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: '#dc2626',
          textAlign: 'center',
          fontSize: '0.875rem',
          fontFamily: 'Inter, sans-serif'
        }}>
          {error}
        </div>
      )}

      {/* Recommendations Grid - Exact Same as Rooms Page */}
      <div className="table-recommendations-grid" style={{
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
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '1rem',
                overflow: 'hidden',
                height: '400px',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
          ))
        ) : recommendations.length === 0 ? (
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
              marginBottom: '0.5rem',
              fontFamily: 'Inter, sans-serif'
            }}>
              No recommendations found
            </h3>
            <p style={{ fontSize: '1rem', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
              Try adjusting your preferences or check back later
            </p>
          </div>
        ) : (
          recommendations.map((recommendation, index) => {
            const table = recommendation.table || recommendation;
            return (
              <div
                key={table._id || index}
                className="table-recommendation-card"
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

                  {/* Rank Badge */}
                  <div className="table-recommendation-badge" style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: '#ef4444',
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
                    #{recommendation.rank || index + 1}
                  </div>

                  {/* Capacity Badge */}
                  <div className="table-recommendation-badge" style={{
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
                    <div className="table-recommendation-badge" style={{
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
                <div className="table-recommendation-content" style={{ padding: '1.5rem' }}>
                  {/* Header with Title and Favorite */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 className="table-recommendation-title" style={{
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

                  {/* Recommendation Explanation */}
                  {recommendation.explanation && (
                    <p className="table-recommendation-description" style={{
                      color: '#6b7280',
                      fontSize: '0.9rem',
                      lineHeight: '1.4',
                      marginBottom: '1rem',
                      fontStyle: 'italic',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      💡 {recommendation.explanation}
                    </p>
                  )}

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
                    <div style={{
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
                    <div style={{
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
                    className="table-recommendation-button"
                    onClick={() => handleTableInquiry(table)}
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
            );
          })
        )}
      </div>
      </div>
    </div>
  );
};

export default TableRecommendations;
