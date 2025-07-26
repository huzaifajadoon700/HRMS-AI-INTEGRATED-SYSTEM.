import React, { useState } from 'react';
import { FiAward, FiUsers, FiCoffee, FiMapPin, FiStar, FiHeart, FiShield } from 'react-icons/fi';
import PageLayout from '../components/layout/PageLayout';
import { useHotelInfo, useHotelStats } from '../hooks/useHotelInfo';

const AboutUs = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  // Get dynamic hotel information
  const hotelInfo = useHotelInfo();
  const stats = useHotelStats();

  const features = [
    {
      icon: <FiAward />,
      title: 'Award Winning',
      description: 'Recognized for excellence in hospitality and service',
      color: '#64ffda',
      bgColor: 'rgba(100, 255, 218, 0.1)'
    },
    {
      icon: <FiUsers />,
      title: 'Expert Team',
      description: 'Professional staff dedicated to your comfort',
      color: '#bb86fc',
      bgColor: 'rgba(187, 134, 252, 0.1)'
    },
    {
      icon: <FiCoffee />,
      title: 'Premium Amenities',
      description: 'World-class facilities and services',
      color: '#ff6b9d',
      bgColor: 'rgba(255, 107, 157, 0.1)'
    },
    {
      icon: <FiMapPin />,
      title: 'Prime Location',
      description: 'Centrally located with easy access to attractions',
      color: '#ffc107',
      bgColor: 'rgba(255, 193, 7, 0.1)'
    },
    {
      icon: <FiStar />,
      title: 'Luxury Experience',
      description: 'Unparalleled comfort and sophistication',
      color: '#64ffda',
      bgColor: 'rgba(100, 255, 218, 0.1)'
    },
    {
      icon: <FiHeart />,
      title: 'Guest Satisfaction',
      description: 'Our top priority is your happiness',
      color: '#ff6b9d',
      bgColor: 'rgba(255, 107, 157, 0.1)'
    }
  ];

  const achievementStats = [
    { number: '500+', label: 'Happy Guests', icon: <FiUsers /> },
    { number: '4.9', label: 'Rating', icon: <FiStar /> },
    { number: '15+', label: 'Years Experience', icon: <FiAward /> },
    { number: '24/7', label: 'Support', icon: <FiShield /> }
  ];

  return (
    <PageLayout>
      <style>
        {`
          /* Responsive Styles for About Us Page */
          @media (max-width: 768px) {
            .about-page-container {
              padding: 2rem 1rem !important;
            }
            .about-page-title {
              font-size: 2rem !important;
            }
            .about-page-subtitle {
              font-size: 1rem !important;
            }
            .about-stats-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 1rem !important;
            }
            .about-features-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
            .about-stat-card {
              padding: 1.5rem 1rem !important;
            }
            .about-feature-card {
              padding: 1.5rem !important;
            }
          }

          @media (max-width: 480px) {
            .about-page-container {
              padding: 1.5rem 0.75rem !important;
            }
            .about-page-title {
              font-size: 2rem !important;
            }
            .about-page-subtitle {
              font-size: 0.9rem !important;
            }
            .about-stats-grid {
              grid-template-columns: 1fr !important;
              gap: 0.75rem !important;
            }
            .about-stat-card {
              padding: 1.25rem 1rem !important;
            }
            .about-feature-card {
              padding: 1.25rem !important;
            }
            .about-stat-number {
              font-size: 2rem !important;
            }
            .about-feature-title {
              font-size: 1.2rem !important;
            }
            .about-feature-description {
              font-size: 0.9rem !important;
            }
          }
        `}
      </style>

      <div style={{
        width: '100%',
        margin: 0,
        padding: '4rem 0',
        background: '#ffffff',
        position: 'relative',
        minHeight: '100vh'
      }}>

        <div className="about-page-container" style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 className="about-page-title" style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '1rem',
              lineHeight: '1.2',
              fontFamily: 'Inter, sans-serif'
            }}>
              About {hotelInfo.hotelName}
            </h1>
            <p className="about-page-subtitle" style={{
              fontSize: '1.125rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Experience luxury and comfort in the heart of the city
            </p>
          </div>

          {/* Stats Section */}
          <div className="about-stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '5rem'
          }}>
            {achievementStats.map((stat, index) => (
              <div
                key={index}
                className="about-stat-card"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '1rem',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: '#f3f4f6',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: '#374151',
                  fontSize: '1.2rem'
                }}>
                  {stat.icon}
                </div>
                <div className="about-stat-number" style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#000000',
                  marginBottom: '0.5rem',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {stat.number}
                </div>
                <div style={{
                  color: '#6b7280',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="about-features-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="about-feature-card"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '1rem',
                  padding: '2rem',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  boxShadow: hoveredFeature === index
                    ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                    : '0 2px 4px rgba(0, 0, 0, 0.05)',
                  transform: hoveredFeature === index ? 'translateY(-4px)' : 'translateY(0)'
                }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  background: '#f3f4f6',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  color: '#374151',
                  fontSize: '1.5rem',
                  transition: 'all 0.2s ease'
                }}>
                  {feature.icon}
                </div>
                <h3 className="about-feature-title" style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '1rem',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {feature.title}
                </h3>
                <p className="about-feature-description" style={{
                  color: '#6b7280',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AboutUs;
