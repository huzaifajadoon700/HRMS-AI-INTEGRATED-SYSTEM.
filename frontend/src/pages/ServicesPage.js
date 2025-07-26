import React, { useState } from 'react';
import { FiHome, FiCoffee, FiCalendar, FiShoppingBag, FiWifi, FiUmbrella, FiTruck, FiStar, FiArrowRight } from 'react-icons/fi';
import PageLayout from '../components/layout/PageLayout';

const ServicesPage = () => {
  const [hoveredService, setHoveredService] = useState(null);

  const services = [
    {
      icon: <FiHome />,
      title: 'Luxury Accommodation',
      description: 'Experience comfort in our well-appointed rooms and suites with modern amenities and premium facilities',
      color: '#64ffda',
      bgColor: 'rgba(100, 255, 218, 0.1)',
      rating: '4.9'
    },
    {
      icon: <FiCoffee />,
      title: 'Fine Dining',
      description: 'Savor exquisite cuisine at our award-winning restaurants and bars with world-class chefs',
      color: '#bb86fc',
      bgColor: 'rgba(187, 134, 252, 0.1)',
      rating: '4.8'
    },
    {
      icon: <FiCalendar />,
      title: 'Event Planning',
      description: 'Host memorable events in our versatile meeting and banquet spaces with professional coordination',
      color: '#ff6b9d',
      bgColor: 'rgba(255, 107, 157, 0.1)',
      rating: '4.9'
    },
    {
      icon: <FiShoppingBag />,
      title: 'Room Service',
      description: '24/7 in-room dining with a diverse menu of local and international dishes delivered fresh',
      color: '#ffc107',
      bgColor: 'rgba(255, 193, 7, 0.1)',
      rating: '4.7'
    },
    {
      icon: <FiWifi />,
      title: 'High-Speed Internet',
      description: 'Complimentary high-speed WiFi throughout the hotel for seamless connectivity',
      color: '#64ffda',
      bgColor: 'rgba(100, 255, 218, 0.1)',
      rating: '4.8'
    },
    {
      icon: <FiUmbrella />,
      title: 'Concierge Service',
      description: 'Personalized assistance for tours, transportation, and exclusive local experiences',
      color: '#bb86fc',
      bgColor: 'rgba(187, 134, 252, 0.1)',
      rating: '4.9'
    },
    {
      icon: <FiTruck />,
      title: 'Airport Transfer',
      description: 'Comfortable and reliable luxury transportation to and from the airport with professional drivers',
      color: '#ff6b9d',
      bgColor: 'rgba(255, 107, 157, 0.1)',
      rating: '4.6'
    }
  ];

  return (
    <PageLayout>
      <style>
        {`
          /* Responsive Styles for Services Page */
          @media (max-width: 768px) {
            .services-page-container {
              padding: 2rem 1rem !important;
            }
            .services-page-title {
              font-size: 2.5rem !important;
            }
            .services-page-subtitle {
              font-size: 1rem !important;
            }
            .services-grid-responsive {
              grid-template-columns: 1fr !important;
              gap: 1.5rem !important;
            }
            .service-card-responsive {
              padding: 1.5rem !important;
              min-height: 250px !important;
            }
            .service-card-title {
              font-size: 1.25rem !important;
            }
            .service-card-description {
              font-size: 0.9rem !important;
            }
          }

          @media (max-width: 480px) {
            .services-page-container {
              padding: 1.5rem 0.75rem !important;
            }
            .services-page-title {
              font-size: 2rem !important;
            }
            .services-page-subtitle {
              font-size: 0.9rem !important;
            }
            .service-card-responsive {
              padding: 1.25rem !important;
              min-height: 220px !important;
            }
            .service-card-title {
              font-size: 1.1rem !important;
            }
            .service-card-description {
              font-size: 0.85rem !important;
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

        <div className="services-page-container" style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 className="services-page-title" style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '1rem',
              lineHeight: '1.2',
              fontFamily: 'Inter, sans-serif'
            }}>
              Premium Services
            </h1>
            <p className="services-page-subtitle" style={{
              fontSize: '1.125rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Discover the exceptional services that make your stay unforgettable
            </p>
          </div>

          {/* Services Grid */}
          <div className="services-grid-responsive" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            {services.map((service, index) => (
              <div
                key={index}
                className="service-card-responsive"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '1rem',
                  padding: '2rem',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  boxShadow: hoveredService === index
                    ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                    : '0 2px 4px rgba(0, 0, 0, 0.05)',
                  transform: hoveredService === index ? 'translateY(-4px)' : 'translateY(0)',
                  position: 'relative',
                  minHeight: '280px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={() => setHoveredService(index)}
                onMouseLeave={() => setHoveredService(null)}
              >
                {/* Header with Icon and Rating */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    background: '#f3f4f6',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#374151',
                    fontSize: '1.5rem',
                    transition: 'all 0.2s ease'
                  }}>
                    {service.icon}
                  </div>

                  {/* Rating Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    background: '#ffffff',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <FiStar style={{ color: '#fbbf24' }} size={12} />
                    <span style={{
                      color: '#000000',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {service.rating}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <h3 className="service-card-title" style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#000000',
                    marginBottom: '1rem',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {service.title}
                  </h3>

                  <p className="service-card-description" style={{
                    color: '#6b7280',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem',
                    flex: 1
                  }}>
                    {service.description}
                  </p>

                  {/* Action Button */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto'
                  }}>
                    <button style={{
                      padding: '0.75rem 1.5rem',
                      background: '#000000',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#333333';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#000000';
                    }}>
                      Learn More
                    </button>

                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      background: '#f3f4f6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}>
                      <FiArrowRight style={{ color: '#374151' }} size={14} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ServicesPage;
