import React, { useState, useEffect } from 'react';
import { Container, Spinner, Badge } from 'react-bootstrap';
import { FiRefreshCw, FiUser, FiStar, FiZap } from 'react-icons/fi';
import RecommendationCard from './RecommendationCard';
import { recommendationAPI, recommendationHelpers } from '../../api/recommendations';
import { apiConfig } from '../../config/api';
import './PersonalizedRecommendations.css';

const PersonalizedRecommendations = ({
  userId = null,
  showHeader = true,
  className = '',
  onAddToCart,
  onRate,
  filteredItems = null,
  searchTerm = '',
  selectedCategory = ''
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [originalRecommendations, setOriginalRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personalized');
  const [refreshing, setRefreshing] = useState(false);
  const [algorithmInfo, setAlgorithmInfo] = useState(null);
  const [userStats, setUserStats] = useState(null);

  const currentUserId = userId || recommendationHelpers.getCurrentUserId();
  const isLoggedIn = recommendationHelpers.isUserLoggedIn();

  useEffect(() => {
    loadRecommendations();
  }, [currentUserId, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply external filtering when search/category filters are provided
  useEffect(() => {
    if (originalRecommendations.length > 0) {
      // Apply search and category filtering to the original recommendations for both tabs
      let filtered = originalRecommendations;

      if (searchTerm) {
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      if (selectedCategory && selectedCategory !== 'all' && selectedCategory !== '') {
        filtered = filtered.filter(item => item.category === selectedCategory);
      }

      // Update recommendations with filtered results
      setRecommendations(filtered);
    }
  }, [searchTerm, selectedCategory, activeTab, originalRecommendations]); // eslint-disable-line react-hooks/exhaustive-deps

  // Custom function to get limited popular items for recommendations
  const getPopularItemsForRecommendations = async (count) => {
    try {
      // Try the popular items endpoint first
      const response = await recommendationAPI.getPopularItems(count);
      if (response && response.success && response.recommendations && response.recommendations.length > 0) {
        return response;
      }
      throw new Error('No popular items returned from API');
    } catch (error) {
      console.log('Popular items endpoint failed, creating limited popular items from menu:', error);

      // Fallback: Get menu items and create a limited popular selection
      try {
        console.log('🔄 Fetching all menu items as fallback...');
        const menuResponse = await fetch(apiConfig.endpoints.menus);
        const menuData = await menuResponse.json();

        console.log('📊 Fetched menu data:', menuData?.length || 0, 'items');

        if (!menuData || menuData.length === 0) {
          console.log('⚠️ No menu items found in database');
          // Create some dummy items for testing
          const dummyItems = [
            {
              _id: 'dummy1',
              name: 'Chicken Biryani',
              description: 'Delicious aromatic rice with chicken',
              price: 450,
              category: 'Main Course',
              image: '/images/biryani.jpg',
              availability: true,
              averageRating: 4.5,
              score: 4.5,
              reason: 'dummy_data',
              confidence: 'medium'
            },
            {
              _id: 'dummy2',
              name: 'Beef Karahi',
              description: 'Spicy beef curry with traditional spices',
              price: 550,
              category: 'Main Course',
              image: '/images/karahi.jpg',
              availability: true,
              averageRating: 4.3,
              score: 4.3,
              reason: 'dummy_data',
              confidence: 'medium'
            },
            {
              _id: 'dummy3',
              name: 'Chicken Tikka',
              description: 'Grilled chicken with special marinade',
              price: 350,
              category: 'Appetizer',
              image: '/images/tikka.jpg',
              availability: true,
              averageRating: 4.7,
              score: 4.7,
              reason: 'dummy_data',
              confidence: 'medium'
            }
          ].slice(0, count);

          console.log('🎭 Using dummy data:', dummyItems.length, 'items');
          return {
            success: true,
            recommendations: dummyItems,
            popularItems: dummyItems,
            message: `Showing ${dummyItems.length} sample menu items (database empty)`
          };
        }

        const popularItems = menuData
          .filter(item => item.availability !== false)
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, count) // Limit to requested count
          .map(item => ({
            ...item,
            score: item.averageRating || 4.5,
            reason: 'popularity',
            confidence: 'medium'
          }));



        return {
          success: true,
          recommendations: popularItems,
          popularItems: popularItems,
          message: `Showing ${popularItems.length} popular menu items`
        };
      } catch (fallbackError) {
        console.error('❌ All fallbacks failed:', fallbackError);

        // Last resort: return dummy data
        const emergencyItems = [
          {
            _id: 'emergency1',
            name: 'Special Dish',
            description: 'Our chef special recommendation',
            price: 400,
            category: 'Special',
            image: '/images/special.jpg',
            availability: true,
            averageRating: 4.5,
            score: 4.5,
            reason: 'emergency_fallback',
            confidence: 'medium'
          }
        ];

        return {
          success: true,
          recommendations: emergencyItems,
          popularItems: emergencyItems,
          message: 'Emergency fallback items'
        };
      }
    }
  };

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;

      switch (activeTab) {
        case 'personalized':
          // For "Recommended" tab, load actual personalized recommendations
          const recommendationCount = 12;
          if (isLoggedIn && currentUserId) {
            try {
              response = await recommendationAPI.getRecommendations(currentUserId, recommendationCount);

              // Check if we got valid recommendations with sufficient count
              if (!response || !response.success || !response.recommendations || response.recommendations.length < 6) {
                console.log(`⚠️ Got only ${response?.recommendations?.length || 0} personalized recommendations, supplementing with popular items`);

                // Get popular items to supplement
                const popularResponse = await getPopularItemsForRecommendations(recommendationCount);

                if (response && response.recommendations && response.recommendations.length > 0) {
                  // Combine personalized + popular items
                  const personalizedItems = response.recommendations;
                  const popularItems = popularResponse.recommendations || [];

                  // Remove duplicates and combine
                  const seenIds = new Set(personalizedItems.map(item => item._id));
                  const additionalItems = popularItems.filter(item => !seenIds.has(item._id));

                  const combinedItems = [...personalizedItems, ...additionalItems].slice(0, recommendationCount);

                  response = {
                    success: true,
                    recommendations: combinedItems,
                    message: `Showing ${personalizedItems.length} personalized + ${combinedItems.length - personalizedItems.length} popular items`
                  };
                } else {
                  // No personalized items, use popular items
                  response = popularResponse;
                }
              }
            } catch (recommendationError) {
              console.log('❌ Personalized recommendations failed, using popular items:', recommendationError);
              response = await getPopularItemsForRecommendations(recommendationCount);
            }
          } else {
            // For non-logged in users, show popular items as recommendations
            console.log('👤 User not logged in, showing popular items as recommendations');
            response = await getPopularItemsForRecommendations(recommendationCount);
          }
          break;

        case 'allmenu':
          // For "All Menu" tab, load ALL menu items
          try {
            console.log('Loading all menu items...');
            const menuResponse = await fetch(apiConfig.endpoints.menus);
            const menuData = await menuResponse.json();
            console.log('Menu items loaded:', menuData.length);
            response = {
              success: true,
              recommendations: menuData.map(item => ({
                ...item,
                score: item.rating || item.averageRating || 4.5,
                reason: 'menu_item',
                confidence: 'high'
              }))
            };
          } catch (menuError) {
            console.log('Failed to load menu items, using popular items:', menuError);
            response = await recommendationAPI.getPopularItems(50); // Show more items for "All Menu"
          }
          break;

        default:
          response = await getPopularItemsForRecommendations(12);
      }

      if (response && response.success) {
        const items = response.recommendations || response.popularItems || [];
        console.log('Setting recommendations:', items.length, 'items');
        setOriginalRecommendations(items);
        setRecommendations(items);

        // Store algorithm info for display
        if (response.algorithmBreakdown) {
          setAlgorithmInfo(response.algorithmBreakdown);
        }

        // Store user stats if available
        if (response.userStats) {
          setUserStats(response.userStats);
        }

        // Clear any previous errors
        setError(null);
      } else {
        throw new Error(response?.message || 'Failed to load recommendations');
      }
    } catch (err) {
      console.error('❌ Error loading recommendations:', err);
      setError(err.message || 'Failed to load recommendations');

      // Fallback to popular items
      try {
        console.log('🔄 Attempting fallback to popular items...');
        const fallbackResponse = await getPopularItemsForRecommendations(12);
        if (fallbackResponse.success && fallbackResponse.recommendations && fallbackResponse.recommendations.length > 0) {
          const fallbackItems = fallbackResponse.recommendations || fallbackResponse.popularItems || [];
          console.log('✅ Fallback successful:', fallbackItems.length, 'items');
          setOriginalRecommendations(fallbackItems);
          setRecommendations(fallbackItems);
          setError('Showing popular items instead');
        } else {
          console.log('⚠️ Fallback returned no items, using emergency data');
          // Emergency fallback with dummy data
          const emergencyItems = [
            {
              _id: 'emergency1',
              name: 'Chicken Biryani',
              description: 'Traditional aromatic rice dish',
              price: 450,
              category: 'Main Course',
              image: '/images/biryani.jpg',
              availability: true,
              averageRating: 4.5,
              score: 4.5,
              reason: 'emergency_data',
              confidence: 'medium'
            },
            {
              _id: 'emergency2',
              name: 'Beef Karahi',
              description: 'Spicy traditional curry',
              price: 550,
              category: 'Main Course',
              image: '/images/karahi.jpg',
              availability: true,
              averageRating: 4.3,
              score: 4.3,
              reason: 'emergency_data',
              confidence: 'medium'
            }
          ];
          setOriginalRecommendations(emergencyItems);
          setRecommendations(emergencyItems);
          setError('Showing sample items (connection issue)');
        }
      } catch (fallbackErr) {
        console.error('❌ Fallback also failed:', fallbackErr);
        // Set empty but don't leave user with nothing
        setError('Unable to load menu items. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  const handleAddToCart = (menuItem) => {
    // Record view interaction
    if (isLoggedIn && currentUserId) {
      recommendationAPI.recordInteraction(
        currentUserId, 
        menuItem._id, 
        'view'
      ).catch(console.error);
    }
    
    if (onAddToCart) {
      onAddToCart(menuItem);
    }
  };

  const handleRate = (menuItemId, rating) => {
    if (isLoggedIn && currentUserId) {
      recommendationAPI.rateMenuItem(currentUserId, menuItemId, rating)
        .then(() => {
          // Refresh recommendations after rating
          loadRecommendations();
        })
        .catch(console.error);
    }
    
    if (onRate) {
      onRate(menuItemId, rating);
    }
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'personalized': return <FiZap />;
      case 'allmenu': return <FiStar />;
      default: return <FiStar />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'personalized':
        return 'Recommended';
      case 'allmenu':
        return 'All Menu';
      default:
        return 'Recommendations';
    }
  };

  const getTabSubtitle = () => {
    switch (activeTab) {
      case 'personalized':
        return 'Personalized recommendations based on your preferences';
      case 'allmenu':
        return 'Browse our complete menu collection';
      default:
        return 'Discover delicious food recommendations';
    }
  };

  if (loading && recommendations.length === 0) {
    return (
      <Container className={`personalized-recommendations loading ${className}`}>
        <div className="loading-container">
          <Spinner animation="border" variant="primary" />
          <p>Loading delicious recommendations...</p>
        </div>
      </Container>
    );
  }

  return (
    <div style={{
      background: 'rgba(100, 255, 218, 0.05)',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '1px solid rgba(100, 255, 218, 0.1)',
      margin: '0'
    }}>
      {showHeader && (
        <div style={{
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          {/* Title Section */}
          <h3 style={{
            color: '#64ffda',
            fontSize: '1.3rem',
            fontWeight: '700',
            margin: '0 0 0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            {getTabIcon(activeTab)}
            {getTabTitle()}
          </h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.9rem',
            margin: '0 0 1.5rem 0',
            lineHeight: '1.4'
          }}>
            {getTabSubtitle()}
          </p>

          {/* Beautiful Tab Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => setActiveTab('personalized')}
              style={{
                padding: '0.6rem 1.2rem',
                background: activeTab === 'personalized'
                  ? 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: activeTab === 'personalized' ? '#0a192f' : '#64ffda',
                border: activeTab === 'personalized' ? 'none' : '1px solid rgba(100, 255, 218, 0.3)',
                borderRadius: '1.5rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: activeTab === 'personalized' ? '0 4px 12px rgba(100, 255, 218, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'personalized') {
                  e.target.style.background = 'rgba(100, 255, 218, 0.2)';
                  e.target.style.borderColor = 'rgba(100, 255, 218, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'personalized') {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(100, 255, 218, 0.3)';
                }
              }}
            >
              <FiZap size={16} />
              Recommended
            </button>

            <button
              onClick={() => setActiveTab('allmenu')}
              style={{
                padding: '0.6rem 1.2rem',
                background: activeTab === 'allmenu'
                  ? 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: activeTab === 'allmenu' ? '#0a192f' : '#64ffda',
                border: activeTab === 'allmenu' ? 'none' : '1px solid rgba(100, 255, 218, 0.3)',
                borderRadius: '1.5rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: activeTab === 'allmenu' ? '0 4px 12px rgba(100, 255, 218, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'allmenu') {
                  e.target.style.background = 'rgba(100, 255, 218, 0.2)';
                  e.target.style.borderColor = 'rgba(100, 255, 218, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'allmenu') {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(100, 255, 218, 0.3)';
                }
              }}
            >
              <FiStar size={16} />
              All Menu
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                padding: '0.6rem 1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#64ffda',
                border: '1px solid rgba(100, 255, 218, 0.3)',
                borderRadius: '1.5rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: refreshing ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!refreshing) {
                  e.target.style.background = 'rgba(100, 255, 218, 0.2)';
                  e.target.style.borderColor = 'rgba(100, 255, 218, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!refreshing) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(100, 255, 218, 0.3)';
                }
              }}
            >
              <FiRefreshCw
                size={14}
                style={{
                  animation: refreshing ? 'spin 1s linear infinite' : 'none'
                }}
              />
              Refresh
            </button>
          </div>

         

          {/* User Stats Display */}
          
        </div>
      )}



      {error && (
        <div style={{
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#ffc107'
        }}>
          <FiStar size={18} />
          <span style={{ fontSize: '0.9rem' }}>{error}</span>
        </div>
      )}

      {recommendations.length === 0 && !loading ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          <FiStar size={48} style={{ color: '#64ffda', marginBottom: '1rem' }} />
          <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
            No recommendations available
          </h4>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {isLoggedIn
              ? "Start ordering to get personalized recommendations!"
              : "Sign in to get personalized food recommendations"}
          </p>
          <button
            onClick={handleRefresh}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)',
              color: '#0a192f',
              border: 'none',
              borderRadius: '1.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(100, 255, 218, 0.3)'
            }}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          maxWidth: '100%',
          justifyContent: 'start',
          alignItems: 'start'
        }}>
          {recommendations.map((recommendation, index) => {
            // Extract menu item data - handle both flat and nested structures
            const menuItemData = recommendation.menuItemId && typeof recommendation.menuItemId === 'object'
              ? recommendation.menuItemId  // Nested structure (new users)
              : recommendation;            // Flat structure (existing users)

            // Ensure the recommendation has the required structure
            const normalizedRecommendation = {
              // Copy all properties from the menu item data
              ...menuItemData,
              // Ensure we have the basic required properties
              _id: menuItemData._id || recommendation._id || recommendation.menuItemId,
              name: menuItemData.name || recommendation.name || 'Unknown Item',
              description: menuItemData.description || recommendation.description || 'Delicious food item',
              price: menuItemData.price || recommendation.price || 0,
              category: menuItemData.category || recommendation.category || 'Food',
              image: menuItemData.image || recommendation.image || '/placeholder-food.jpg',
              availability: menuItemData.availability !== false,
              averageRating: menuItemData.averageRating || recommendation.averageRating || recommendation.score || 4.5,
              totalRatings: menuItemData.totalRatings || recommendation.totalRatings || 0,
              cuisine: menuItemData.cuisine || recommendation.cuisine || 'Pakistani',
              spiceLevel: menuItemData.spiceLevel || recommendation.spiceLevel,
              dietaryTags: menuItemData.dietaryTags || recommendation.dietaryTags || [],
              preparationTime: menuItemData.preparationTime || recommendation.preparationTime,

              // Recommendation-specific properties
              reason: recommendation.reason || 'recommended',
              confidence: recommendation.confidence || 'medium',
              score: recommendation.score || menuItemData.averageRating || 4.5
            };

            return (
              <div key={normalizedRecommendation._id || index}>
                <RecommendationCard
                  recommendation={normalizedRecommendation}
                  onAddToCart={handleAddToCart}
                  onRate={handleRate}
                  showReason={true}
                  showConfidence={true}
                  className="new"
                />
              </div>
            );
          })}
        </div>
      )}


    </div>
  );
};

export default PersonalizedRecommendations;
