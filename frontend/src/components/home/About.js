import React, { useEffect, useState } from "react";
import { about } from "../data/Data";
import { FiArrowUpRight, FiStar, FiTrendingUp, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useHotelInfo, useHotelStats } from "../../hooks/useHotelInfo";
import "./About-responsive.css";

export default function About() {
  // Get dynamic hotel information
  const hotelInfo = useHotelInfo();
  const stats = useHotelStats();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force re-render when hotel settings change
  useEffect(() => {
    const handleSettingsChange = () => {
      // Force component re-render by updating state
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('hotelSettingsChanged', handleSettingsChange);

    return () => {
      window.removeEventListener('hotelSettingsChanged', handleSettingsChange);
    };
  }, []);

  // Also listen for hotelInfo changes
  useEffect(() => {
    // This will trigger a re-render when hotelInfo changes
  }, [hotelInfo.hotelName, hotelInfo.description, hotelInfo.loading]);

  // Show loading state while data is being fetched
  if (hotelInfo.loading) {
    return (
      <div className="about-section-mobile" style={{
        width: '100vw',
        background: '#ffffff',
        position: 'relative',
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
        padding: '4rem 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#000000'
      }}>
        <div>Loading hotel information...</div>
      </div>
    );
  }

  return (
    <div key={hotelInfo.hotelName} className="about-section-mobile" style={{
      width: '100vw',
      background: '#ffffff',
      position: 'relative',
      marginLeft: 'calc(50% - 50vw)',
      marginRight: 'calc(50% - 50vw)',
      padding: '4rem 0',
      boxSizing: 'border-box'
    }}>
      <div className="about-section-mobile" style={{
        width: '100%',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '4rem',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Text Content */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Section Header */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#f8fafc',
                padding: '0.5rem 1rem',
                borderRadius: '24px',
                border: '1px solid #e5e7eb',
                marginBottom: '1rem',
                color: '#374151',
                fontSize: '0.875rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500'
              }}>
                <FiStar size={16} />
                <span>About {hotelInfo.hotelName}</span>
              </div>

              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                lineHeight: '1.2',
                marginBottom: '1rem',
                color: '#000000',
                fontFamily: 'Inter, sans-serif'
              }}>
                {hotelInfo.hotelName} Management System
              </h2>

              <p style={{
                fontSize: '1.125rem',
                lineHeight: '1.6',
                color: '#374151',
                marginBottom: '2rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '400'
              }}>
                {hotelInfo.description}
              </p>
            </div>

            {/* Features Grid */}
            <div className="features-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {[
                { icon: '⚡', title: 'Lightning Fast', desc: 'Instant Operations' },
                { icon: '🔒', title: 'Secure Platform', desc: 'Enterprise Grade' },
                { icon: '💝', title: 'Guest-Centric', desc: 'Exceptional Experience' }
              ].map((feature, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ fontSize: '1.5rem' }}>{feature.icon}</div>
                  <div>
                    <h4 style={{ color: '#000000', margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>{feature.title}</h4>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {[
                { icon: <i className="fa fa-hotel" style={{fontSize: '1.5rem', color: '#374151'}}></i>, text: "Rooms", count: stats.loading ? "..." : stats.totalRooms },
                { icon: <i className="fa fa-utensils" style={{fontSize: '1.5rem', color: '#374151'}}></i>, text: "Menu Items", count: stats.loading ? "..." : stats.totalMenuItems },
                { icon: <i className="fa fa-users-cog" style={{fontSize: '1.5rem', color: '#374151'}}></i>, text: "Happy Clients", count: stats.loading ? "..." : stats.totalClients }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '1.5rem 1rem',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ marginBottom: '0.75rem' }}>{item.icon}</div>
                  <div style={{ color: '#000000', fontWeight: '700', fontSize: '1.5rem', marginBottom: '0.25rem', fontFamily: 'Inter, sans-serif' }}>{item.count}+</div>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>{item.text}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/about" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#000000',
                color: '#ffffff !important',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                fontSize: '0.875rem',
                fontFamily: 'Inter, sans-serif',
                border: '1px solid #000000',
                transition: 'all 0.3s ease'
              }}>
                <span style={{ color: '#ffffff !important' }}>Learn More</span>
                <FiArrowUpRight size={16} style={{ color: '#ffffff !important' }} />
              </Link>

            </div>
          </div>

          {/* Simple Image Section */}
          <div className="gallery-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1rem',
            height: '400px',
            width: '100%'
          }}>
            <div className="gallery-main" style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Luxury Hotel Lobby"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#000000',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                fontFamily: 'Inter, sans-serif',
                border: '1px solid #e5e7eb'
              }}>
                Hotel Management System
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}