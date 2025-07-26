import React, { useState } from 'react';
import './Services.css';
import { FaUtensils, FaConciergeBell, FaWineGlass, FaSwimmingPool, FaDumbbell } from 'react-icons/fa';
import { MdRoomService, MdSpa, MdBusinessCenter } from 'react-icons/md';
import { BsArrowUpRight } from 'react-icons/bs';
import { FiStar } from 'react-icons/fi';

const Services = () => {
  const [hoveredCard, setHoveredCard] = useState(null);


  const services = [
    {
      icon: <FaUtensils />,
      title: "Fine Dining",
      description: "Experience exquisite cuisine prepared by our world-class chefs using the finest ingredients sourced globally.",
      features: ["Michelin-starred chefs", "Farm-to-table ingredients", "Wine pairing"],
      color: "rgba(255, 107, 157, 0.8)",
      gradient: "linear-gradient(135deg, rgba(255, 107, 157, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%)",
      stats: { rating: "4.9", reviews: "2.1k" }
    },
    {
      icon: <MdRoomService />,
      title: "24/7 Room Service",
      description: "Enjoy our premium room service available round the clock with gourmet meals delivered to your door.",
      features: ["24/7 availability", "Gourmet menu", "15-min delivery"],
      color: "rgba(100, 255, 218, 0.8)",
      gradient: "linear-gradient(135deg, rgba(100, 255, 218, 0.2) 0%, rgba(187, 134, 252, 0.1) 100%)",
      stats: { rating: "4.8", reviews: "1.8k" }
    },
    {
      icon: <FaConciergeBell />,
      title: "Concierge Services",
      description: "Let our experienced concierge team assist you with reservations, tours, and exclusive experiences.",
      features: ["Personal assistant", "Local expertise", "VIP access"],
      color: "rgba(187, 134, 252, 0.8)",
      gradient: "linear-gradient(135deg, rgba(187, 134, 252, 0.2) 0%, rgba(100, 255, 218, 0.1) 100%)",
      stats: { rating: "4.9", reviews: "1.5k" }
    },
    {
      icon: <FaWineGlass />,
      title: "Premium Bar",
      description: "Unwind at our sophisticated rooftop bar featuring an extensive selection of fine wines and craft cocktails.",
      features: ["Craft cocktails", "Premium spirits", "Rooftop views"],
      color: "rgba(255, 193, 7, 0.8)",
      gradient: "linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 107, 157, 0.1) 100%)",
      stats: { rating: "4.7", reviews: "2.3k" }
    },
    {
      icon: <FaSwimmingPool />,
      title: "Infinity Pool",
      description: "Relax and rejuvenate in our stunning infinity pool with panoramic city views and poolside service.",
      features: ["Infinity design", "City views", "Poolside service"],
      color: "rgba(100, 255, 218, 0.8)",
      gradient: "linear-gradient(135deg, rgba(100, 255, 218, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%)",
      stats: { rating: "4.8", reviews: "1.9k" }
    },
    {
      icon: <MdSpa />,
      title: "Luxury Spa",
      description: "Indulge in our award-winning spa treatments designed to refresh your body, mind, and soul.",
      features: ["Award-winning spa", "Holistic treatments", "Expert therapists"],
      color: "rgba(255, 107, 157, 0.8)",
      gradient: "linear-gradient(135deg, rgba(255, 107, 157, 0.2) 0%, rgba(187, 134, 252, 0.1) 100%)",
      stats: { rating: "4.9", reviews: "1.7k" }
    },
    {
      icon: <FaDumbbell />,
      title: "Elite Fitness",
      description: "Stay active with our state-of-the-art fitness center featuring premium equipment and personal trainers.",
      features: ["Premium equipment", "Personal trainers", "Group classes"],
      color: "rgba(187, 134, 252, 0.8)",
      gradient: "linear-gradient(135deg, rgba(187, 134, 252, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%)",
      stats: { rating: "4.6", reviews: "1.2k" }
    },
    {
      icon: <MdBusinessCenter />,
      title: "Business Center",
      description: "Conduct business seamlessly with our fully equipped business center and meeting facilities.",
      features: ["Meeting rooms", "High-speed internet", "Business support"],
      color: "rgba(255, 193, 7, 0.8)",
      gradient: "linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(100, 255, 218, 0.1) 100%)",
      stats: { rating: "4.7", reviews: "980" }
    }
  ];

  return (
    <>
      <style>
        {`
          /* Responsive Styles */
          @media (max-width: 768px) {
            .services-grid {
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
              gap: 1.5rem !important;
              padding: 0 0.5rem !important;
            }
            .service-card {
              padding: 1.5rem !important;
            }
            .service-title {
              font-size: 1.125rem !important;
            }
            .service-description {
              font-size: 0.875rem !important;
            }
          }

          @media (max-width: 480px) {
            .services-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
              padding: 0 0.5rem !important;
            }
            .service-card {
              padding: 1.25rem !important;
              margin: 0 !important;
            }
            .service-title {
              font-size: 1rem !important;
            }
            .service-description {
              font-size: 0.8rem !important;
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

        <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: '#000000',
              marginBottom: '1rem',
              fontFamily: 'Inter, sans-serif'
            }}>
              Premium Services
            </h2>

            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.5'
            }}>
              Experience world-class hospitality with our exceptional services and amenities.
            </p>
          </div>

          {/* Services Grid */}
          <div className="services-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            padding: '0 1rem'
          }}>
            {services.map((service, index) => (
              <div
                key={index}
                className="service-card"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  padding: '2rem',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: hoveredCard === index ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: hoveredCard === index
                    ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                    : '0 2px 4px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden'
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Icon Section */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    background: '#f3f4f6',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: '#374151',
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
                    <span style={{ color: '#000000', fontSize: '0.75rem', fontWeight: '500' }}>
                      {service.stats.rating}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="service-title" style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#000000',
                    marginBottom: '0.75rem',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {service.title}
                  </h3>

                  <p className="service-description" style={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    marginBottom: '1.5rem'
                  }}>
                    {service.description}
                  </p>

                  {/* Features */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    {service.features.slice(0, 3).map((feature, featureIndex) => (
                      <span
                        key={featureIndex}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#f3f4f6',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          color: '#374151',
                          fontWeight: '500'
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
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
                      <BsArrowUpRight style={{ color: '#374151' }} size={14} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;