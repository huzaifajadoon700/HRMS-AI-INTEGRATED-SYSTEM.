import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiStar, FiWifi, FiCoffee, FiTv, FiHeart, FiTrendingUp, FiShoppingCart, FiEye } from "react-icons/fi";
import { Link } from "react-router-dom";
import { getRoomImageUrl, handleImageError } from "../../utils/imageUtils";
import "bootstrap/dist/css/bootstrap.min.css";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [popularRooms, setPopularRooms] = useState([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [, setActiveTab] = useState('popular');
  const [user, setUser] = useState(null);
  const [hoveredRoom, setHoveredRoom] = useState(null);



  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('name');

    if (token && userId && userName) {
      setUser({ id: userId, token, name: userName });
      setActiveTab('recommended'); // Show recommendations for logged-in users
    } else {
      setActiveTab('popular'); // Default to popular for non-logged-in users
    }
  }, []);

  // Fetch all rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
        const response = await axios.get(`${apiUrl}/rooms`);

        setRooms(response.data);
      } catch (error) {
        setError("Failed to load rooms. Please try again.");
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Fetch popular rooms
  useEffect(() => {
    const fetchPopularRooms = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
        const response = await axios.get(`${apiUrl}/rooms/popular?count=6`);
        if (response.data.success) {
          console.log('Fetched popular rooms:', response.data.popularRooms.length, response.data.popularRooms);
          setPopularRooms(response.data.popularRooms);
        }
      } catch (error) {
        console.error('Error fetching popular rooms:', error);
      }
    };

    fetchPopularRooms();
  }, []);

  // Fetch personalized recommendations for logged-in users
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.id || !user?.token) return;

      try {
        const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
        const response = await axios.get(
          `${apiUrl}/rooms/recommendations/${user.id}?count=6`,
          {
            headers: { Authorization: `Bearer ${user.token}` }
          }
        );

        if (response.data.success) {
          const recommendations = response.data.recommendations || response.data.rooms || [];
          console.log('Fetched recommendations:', recommendations.length, recommendations);
          setRecommendedRooms(recommendations);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Fallback to popular rooms for new users or on error
        setRecommendedRooms(popularRooms.slice(0, 6));
      }
    };

    fetchRecommendations();
  }, [user, popularRooms]);

  // Get current rooms to display - always show only 3 recommended rooms
  const getCurrentRooms = () => {
    console.log('Home Rooms Debug:', {
      recommendedRooms: recommendedRooms.length,
      popularRooms: popularRooms.length,
      allRooms: rooms.length,
      user: !!user
    });

    let selectedRooms = [];

    // Always prioritize recommended rooms, limit to 3
    if (recommendedRooms.length > 0) {
      selectedRooms = recommendedRooms.slice(0, 3);
      console.log('Using recommended rooms:', selectedRooms.length);
    } else if (popularRooms.length > 0) {
      selectedRooms = popularRooms.slice(0, 3);
      console.log('Using popular rooms:', selectedRooms.length);
    } else {
      selectedRooms = rooms.slice(0, 3);
      console.log('Using all rooms:', selectedRooms.length);
    }

    // Fallback: if we still don't have 3 rooms, try to get more from other sources
    if (selectedRooms.length < 3) {
      console.log('Not enough rooms, trying fallback...');
      const allAvailableRooms = [...recommendedRooms, ...popularRooms, ...rooms];
      const uniqueRooms = allAvailableRooms.filter((room, index, self) =>
        index === self.findIndex(r => (r._id || r.roomId) === (room._id || room.roomId))
      );
      selectedRooms = uniqueRooms.slice(0, 3);
      console.log('Fallback result:', selectedRooms.length);
    }

    return selectedRooms;
  };

  // Removed slider functions since we're showing only 3 rooms

  // Format price in Pakistani Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Get recommendation badge
  const getRecommendationBadge = (reason) => {
    const badges = {
      collaborative_filtering: { text: 'Similar Users', color: 'success', icon: <FiHeart size={12} /> },
      content_based: { text: 'Your Taste', color: 'info', icon: <FiHeart size={12} /> },
      popularity: { text: 'Trending', color: 'warning', icon: <FiTrendingUp size={12} /> }
    };

    const badge = badges[reason] || badges.popularity;
    return (
      <span className={`badge bg-${badge.color} d-flex align-items-center gap-1`} style={{fontSize: '10px'}}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };



  const currentRooms = getCurrentRooms();
  const visibleRooms = currentRooms; // Show all 3 without sliding



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
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px rgba(100, 255, 218, 0.3); }
            50% { box-shadow: 0 0 20px rgba(100, 255, 218, 0.6), 0 0 30px rgba(187, 134, 252, 0.4); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* Responsive Styles */
          @media (max-width: 768px) {
            .rooms-grid {
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
              gap: 1rem !important;
              padding: 0 0.5rem !important;
            }
            .room-card {
              max-width: 100% !important;
              min-width: 250px !important;
            }
            .room-image {
              height: 160px !important;
            }
            .room-title {
              font-size: 1rem !important;
            }
            .room-description {
              font-size: 0.8rem !important;
            }
            .facility-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 0.5rem !important;
            }
          }

          @media (max-width: 480px) {
            .rooms-grid {
              grid-template-columns: 1fr !important;
              gap: 0.75rem !important;
              padding: 0 !important;
            }
            .room-card {
              margin: 0 0.5rem !important;
              min-width: auto !important;
            }
            .room-image {
              height: 140px !important;
            }
            .room-content {
              padding: 1rem !important;
            }
            .facility-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
      <section style={{
        width: '100%',
        margin: 0,
        padding: '4rem 0',
        background: 'linear-gradient(180deg, #112240 0%, #0A192F 50%, #112240 100%)',
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
            Featured Rooms
          </h2>
          <Link
            to="/rooms"
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
            View All Rooms
          </Link>
        </div>

        <div className="rooms-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0.5rem'
        }}>
          {visibleRooms.map((roomItem) => {
            const room = roomItem.roomDetails || roomItem;

            return (
            <div
              key={room._id || roomItem.roomId}
              className="room-card"
              style={{
                background: hoveredRoom === room._id
                  ? 'linear-gradient(145deg, rgba(100, 255, 218, 0.12) 0%, rgba(187, 134, 252, 0.08) 50%, rgba(255, 107, 157, 0.06) 100%)'
                  : 'linear-gradient(145deg, rgba(17, 34, 64, 0.8) 0%, rgba(26, 35, 50, 0.6) 100%)',
                backdropFilter: 'blur(25px)',
                border: hoveredRoom === room._id
                  ? '1px solid rgba(100, 255, 218, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1.25rem',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                width: '100%',
                maxWidth: '320px',
                minWidth: '280px',
                margin: '0 auto',
                position: 'relative',
                boxShadow: hoveredRoom === room._id
                  ? '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(100, 255, 218, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 8px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                transform: hoveredRoom === room._id ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                zIndex: hoveredRoom === room._id ? 10 : 1
              }}
              onMouseEnter={() => setHoveredRoom(room._id)}
              onMouseLeave={() => setHoveredRoom(null)}
            >
              <div style={{
                position: 'relative',
                width: '100%',
                height: '180px',
                overflow: 'hidden',
                borderRadius: '1.25rem 1.25rem 0 0',
                background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundImage: `url(${getRoomImageUrl(room.image)})`,
                transform: hoveredRoom === room._id ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                {/* Enhanced Gradient Overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: hoveredRoom === room._id
                    ? 'linear-gradient(180deg, rgba(100, 255, 218, 0.1) 0%, rgba(0,0,0,0.3) 50%, rgba(187, 134, 252, 0.2) 100%)'
                    : 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)',
                  opacity: 0.8,
                  transition: 'all 0.4s ease'
                }} />

                {/* Shimmer Effect */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: hoveredRoom === room._id
                    ? 'linear-gradient(45deg, transparent 30%, rgba(100, 255, 218, 0.1) 50%, transparent 70%)'
                    : 'transparent',
                  animation: hoveredRoom === room._id ? 'shimmer 2s ease-in-out infinite' : 'none',
                  transition: 'all 0.4s ease'
                }} />

                {/* Recommendation Badge */}
                {room.recommendationReason && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8a80 100%)',
                    color: '#fff',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '1.5rem',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 6px 20px rgba(255, 107, 157, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    animation: hoveredRoom === room._id ? 'glow 2s ease-in-out infinite' : 'none',
                    transform: hoveredRoom === room._id ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}>
                    {getRecommendationBadge(room.recommendationReason)}
                  </div>
                )}

                {/* Price Badge */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'linear-gradient(135deg, #64ffda 0%, #bb86fc 100%)',
                  color: '#0a0a0a',
                  padding: '0.5rem 1rem',
                  borderRadius: '1.5rem',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  boxShadow: '0 6px 20px rgba(100, 255, 218, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transform: hoveredRoom === room._id ? 'scale(1.05) rotate(-2deg)' : 'scale(1) rotate(0deg)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: hoveredRoom === room._id ? 'pulse 2s ease-in-out infinite' : 'none'
                }}>
                  {formatPrice(room.price)}
                </div>

                {/* Rating Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '1rem',
                  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(26, 35, 50, 0.9) 100%)',
                  color: '#fff',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '1.5rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  transform: hoveredRoom === room._id ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}>
                  <FiStar style={{
                    color: '#ffc107',
                    fill: '#ffc107',
                    filter: 'drop-shadow(0 0 4px rgba(255, 193, 7, 0.6))'
                  }} size={14} />
                  <span style={{ fontWeight: '800' }}>{room.averageRating?.toFixed(1) || '4.5'}</span>
                </div>
              </div>

              <div style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                background: hoveredRoom === room._id
                  ? 'linear-gradient(180deg, rgba(100, 255, 218, 0.03) 0%, rgba(187, 134, 252, 0.02) 100%)'
                  : 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
                height: 'calc(100% - 180px)',
                transition: 'all 0.4s ease',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      color: '#fff',
                      fontSize: '1.1rem',
                      fontWeight: '800',
                      marginBottom: '0.5rem',
                      background: hoveredRoom === room._id
                        ? 'linear-gradient(135deg, #64ffda 0%, #bb86fc 50%, #ff6b9d 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #bb86fc 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      lineHeight: '1.2',
                      transition: 'all 0.3s ease',
                      textShadow: hoveredRoom === room._id ? '0 0 10px rgba(100, 255, 218, 0.3)' : 'none'
                    }}>
                      {room.roomNumber || 'Luxury Room'}
                    </h3>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: hoveredRoom === room._id
                        ? 'rgba(100, 255, 218, 0.15)'
                        : 'rgba(187, 134, 252, 0.1)',
                      color: hoveredRoom === room._id ? '#64ffda' : '#bb86fc',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      border: hoveredRoom === room._id
                        ? '1px solid rgba(100, 255, 218, 0.3)'
                        : '1px solid rgba(187, 134, 252, 0.2)',
                      transition: 'all 0.3s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {room.roomType || 'Deluxe'}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem 0.5rem',
                    backgroundColor: hoveredRoom === room._id
                      ? 'rgba(187, 134, 252, 0.15)'
                      : 'rgba(187, 134, 252, 0.08)',
                    borderRadius: '1rem',
                    border: hoveredRoom === room._id
                      ? '1px solid rgba(187, 134, 252, 0.3)'
                      : '1px solid rgba(187, 134, 252, 0.15)',
                    transition: 'all 0.3s ease',
                    transform: hoveredRoom === room._id ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: hoveredRoom === room._id ? '0 4px 15px rgba(187, 134, 252, 0.2)' : 'none'
                  }}>
                    <FiWifi size={16} style={{
                      color: '#bb86fc',
                      filter: hoveredRoom === room._id ? 'drop-shadow(0 0 6px rgba(187, 134, 252, 0.6))' : 'none',
                      transition: 'all 0.3s ease'
                    }} />
                    <span style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: '700',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}>
                      Free WiFi
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem 0.5rem',
                    backgroundColor: hoveredRoom === room._id
                      ? 'rgba(100, 255, 218, 0.15)'
                      : 'rgba(100, 255, 218, 0.08)',
                    borderRadius: '1rem',
                    border: hoveredRoom === room._id
                      ? '1px solid rgba(100, 255, 218, 0.3)'
                      : '1px solid rgba(100, 255, 218, 0.15)',
                    transition: 'all 0.3s ease',
                    transform: hoveredRoom === room._id ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: hoveredRoom === room._id ? '0 4px 15px rgba(100, 255, 218, 0.2)' : 'none'
                  }}>
                    <FiCoffee size={16} style={{
                      color: '#64ffda',
                      filter: hoveredRoom === room._id ? 'drop-shadow(0 0 6px rgba(100, 255, 218, 0.6))' : 'none',
                      transition: 'all 0.3s ease'
                    }} />
                    <span style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: '700',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}>
                      Coffee
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem 0.5rem',
                    backgroundColor: hoveredRoom === room._id
                      ? 'rgba(255, 107, 157, 0.15)'
                      : 'rgba(255, 107, 157, 0.08)',
                    borderRadius: '1rem',
                    border: hoveredRoom === room._id
                      ? '1px solid rgba(255, 107, 157, 0.3)'
                      : '1px solid rgba(255, 107, 157, 0.15)',
                    transition: 'all 0.3s ease',
                    transform: hoveredRoom === room._id ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: hoveredRoom === room._id ? '0 4px 15px rgba(255, 107, 157, 0.2)' : 'none'
                  }}>
                    <FiTv size={16} style={{
                      color: '#ff6b9d',
                      filter: hoveredRoom === room._id ? 'drop-shadow(0 0 6px rgba(255, 107, 157, 0.6))' : 'none',
                      transition: 'all 0.3s ease'
                    }} />
                    <span style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: '700',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}>
                      Smart TV
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '0.5rem'
                }}>
                  <Link
                    to="/rooms"
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
                    Book Now
                  </Link>

                  <Link
                    to={`/room-details/${room._id}`}
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
      </div>
    </section>
    </>
  );
};

export default Rooms;
