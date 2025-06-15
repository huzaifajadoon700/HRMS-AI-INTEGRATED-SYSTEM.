import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiClock, FiStar, FiHeart, FiCalendar } from 'react-icons/fi';
import { tableRecommendationService, tableService, tableUtils } from '../../services/tableRecommendationService';

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

        if (popularResponse && popularResponse.success && popularResponse.tables) {
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
        } else {
          throw new Error('No popular tables available');
        }
      } catch (popularError) {
        console.error('❌ Failed to load popular tables:', popularError);

        // Final fallback: Load all available tables
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
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '1rem',
          padding: '1.2rem',
          marginBottom: '1.5rem'
        }}>
        <h3 style={{
          color: '#fff',
          fontSize: '1rem',
          fontWeight: '600',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          🎯 Customize Your Recommendations
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <div>
            <label style={{ display: 'block', color: '#fff', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.4rem' }}>
              🎉 Occasion
            </label>
            <select
              value={context.occasion}
              onChange={(e) => handleContextChange('occasion', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: '#0A192F',
                border: '1px solid rgba(100, 255, 218, 0.3)',
                borderRadius: '0.5rem',
                color: '#fff',
                fontSize: '0.75rem'
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
            <label style={{ display: 'block', color: '#fff', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.4rem' }}>
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
                padding: '0.5rem',
                background: '#0A192F',
                border: '1px solid rgba(100, 255, 218, 0.3)',
                borderRadius: '0.5rem',
                color: '#fff',
                fontSize: '0.75rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#fff', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.4rem' }}>
              🕐 Time Preference
            </label>
            <select
              value={context.timeSlot}
              onChange={(e) => handleContextChange('timeSlot', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: '#0A192F',
                border: '1px solid rgba(100, 255, 218, 0.3)',
                borderRadius: '0.5rem',
                color: '#fff',
                fontSize: '0.75rem'
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
                padding: '0.5rem 0.8rem',
                background: loading ? 'rgba(100, 255, 218, 0.5)' : 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)',
                color: '#0a192f',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Loading...' : 'Get Recommendations'}
            </button>
          </div>
        </div>
      </div>

      {/* Recommendation Status Indicator */}
      {!loading && recommendations.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
          padding: '0.8rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '0.8rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.8rem',
            background: recommendationStats.mlModelActive ?
              'rgba(100, 255, 218, 0.2)' : 'rgba(255, 193, 7, 0.2)',
            border: `1px solid ${recommendationStats.mlModelActive ?
              'rgba(100, 255, 218, 0.3)' : 'rgba(255, 193, 7, 0.3)'}`,
            borderRadius: '1.5rem',
            fontSize: '0.75rem',
            color: '#fff'
          }}>
            <span>{recommendationStats.mlModelActive ? '🤖' : '⚡'}</span>
            <span>{recommendationStats.mlModelActive ? 'ML Model Active' : 'Smart Fallback'}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.8rem',
            background: 'rgba(187, 134, 252, 0.2)',
            border: '1px solid rgba(187, 134, 252, 0.3)',
            borderRadius: '1.5rem',
            fontSize: '0.75rem',
            color: '#fff'
          }}>
            <span>📊</span>
            <span>{recommendationStats.totalRecommendations} Recommendations</span>
          </div>

          {recommendationStats.cached && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.8rem',
              background: 'rgba(255, 107, 107, 0.2)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '1.5rem',
              fontSize: '0.75rem',
              color: '#fff'
            }}>
              <span>⚡</span>
              <span>Cached Results</span>
            </div>
          )}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div style={{
          background: 'rgba(255, 87, 87, 0.1)',
          border: '1px solid rgba(255, 87, 87, 0.3)',
          borderRadius: '0.5rem',
          padding: '0.8rem',
          marginBottom: '1rem',
          color: '#fff',
          textAlign: 'center',
          fontSize: '0.8rem'
        }}>
          {error}
        </div>
      )}

      {/* Recommendations Grid - Exact Same as Rooms Page */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {loading ? (
          Array(6).fill().map((_, index) => (
            <div
              key={index}
              style={{
                background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                height: '500px',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
          ))
        ) : recommendations.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3rem 2rem',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            <FiCalendar size={48} style={{ color: 'rgba(255, 255, 255, 0.4)', marginBottom: '1rem' }} />
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '0.5rem'
            }}>
              No recommendations found
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Try adjusting your preferences or check back later
            </p>
          </div>
        ) : (
          recommendations.map((recommendation, index) => {
            const table = recommendation.table || recommendation;
            return (
              <div
                key={table._id || index}
                style={{
                  background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '1.5rem',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={() => handleTableView(table)}
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
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
                    color: '#fff',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '1.5rem',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}>
                    #{recommendation.rank || index + 1}
                  </div>

                  {/* Capacity Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)',
                    color: '#0a192f',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '1.5rem',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}>
                    <FiUsers size={12} />
                    {table.capacity} seats
                  </div>

                  {/* Rating Badge */}
                  {table.avgRating && (
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: '1rem',
                      background: 'rgba(255, 193, 7, 0.9)',
                      color: '#fff',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '1.5rem',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}>
                      <FiStar size={12} />
                      {table.avgRating.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div style={{ padding: '1.2rem' }}>
                  {/* Header with Title and Favorite */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <h3 style={{
                      color: '#64ffda',
                      fontSize: '1rem',
                      fontWeight: '600',
                      margin: 0,
                      lineHeight: '1.2'
                    }}>
                      {table.tableName}
                    </h3>
                    <button
                      onClick={() => handleTableFavorite(table)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 107, 157, 0.5)',
                        color: 'rgba(255, 107, 157, 0.8)',
                        padding: '0.3rem',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FiHeart size={12} />
                    </button>
                  </div>

                  {/* Recommendation Explanation */}
                  {recommendation.explanation && (
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.75rem',
                      lineHeight: '1.3',
                      marginBottom: '0.8rem',
                      fontStyle: 'italic',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      💡 {recommendation.explanation}
                    </p>
                  )}

                  {/* Location */}
                  {table.location && (
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.7rem',
                      marginBottom: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}>
                      📍 {table.location}
                    </div>
                  )}

                  {/* Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.7rem',
                      padding: '0.3rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '0.3rem'
                    }}>
                      <FiClock size={12} style={{ color: '#64ffda' }} />
                      <span>Available for booking</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.7rem',
                      padding: '0.3rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '0.3rem'
                    }}>
                      <FiUsers size={12} style={{ color: '#64ffda' }} />
                      <span>Max {table.capacity} guests</span>
                    </div>
                  </div>

                  {/* Reserve Button */}
                  <button
                    onClick={() => handleTableInquiry(table)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      background: 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)',
                      color: '#0a192f',
                      border: 'none',
                      borderRadius: '0.6rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(100, 255, 218, 0.3)'
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
