import React, { useState, useEffect } from "react";
import {
  FiMapPin, FiPhone, FiMail, FiTwitter, FiInstagram, FiFacebook,
  FiLinkedin, FiHeart, FiGithub, FiYoutube,
  FiSend, FiExternalLink, FiGlobe
} from "react-icons/fi";
import {
  FaHotel, FaUtensils, FaConciergeBell, FaSwimmingPool,
  FaDumbbell, FaWifi, FaWhatsapp
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useHotelInfo, useContactInfo, useSocialMedia } from "../../hooks/useHotelInfo";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Get dynamic hotel information
  const hotelInfo = useHotelInfo();
  const contactInfo = useContactInfo();
  const socialMedia = useSocialMedia();

  // Force re-render when hotel settings change
  useEffect(() => {
    const handleSettingsChange = () => {
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('hotelSettingsChanged', handleSettingsChange);

    return () => {
      window.removeEventListener('hotelSettingsChanged', handleSettingsChange);
    };
  }, []);

  // Also listen for contactInfo changes
  useEffect(() => {
    // Debug logging (remove in production)
    // console.log('Footer - Contact Info Updated:', contactInfo);
    // console.log('Footer - Hotel Info Updated:', hotelInfo);
  }, [contactInfo.phone, contactInfo.email, contactInfo.address, contactInfo.whatsapp, hotelInfo.hotelName]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Our Rooms', href: '/rooms' },
    { name: 'Dining', href: '/order-food' },
    { name: 'Reserve Table', href: '/reserve-table' },
    { name: 'Contact', href: '/contact' }
  ];

  const services = [
    { icon: <FaHotel />, name: 'Luxury Rooms', href: '/rooms' },
    { icon: <FaUtensils />, name: 'Fine Dining', href: '/order-food' },
    { icon: <FaConciergeBell />, name: 'Concierge', href: '/contact' },
    { icon: <FaSwimmingPool />, name: 'Pool & Spa', href: '/about' },
    { icon: <FaDumbbell />, name: 'Fitness Center', href: '/about' },
    { icon: <FaWifi />, name: 'Free WiFi', href: '/about' }
  ];

  const socialLinks = [
    { icon: <FiTwitter />, name: 'Twitter', color: '#1DA1F2', href: socialMedia.twitter },
    { icon: <FiInstagram />, name: 'Instagram', color: '#E4405F', href: socialMedia.instagram },
    { icon: <FiFacebook />, name: 'Facebook', color: '#1877F2', href: socialMedia.facebook },
    { icon: <FiLinkedin />, name: 'LinkedIn', color: '#0A66C2', href: socialMedia.linkedin },
    { icon: <FiYoutube />, name: 'YouTube', color: '#FF0000', href: socialMedia.youtube },
    { icon: <FiGithub />, name: 'GitHub', color: '#333', href: 'https://github.com' }
  ];

  return (
    <>
      <style key={`${contactInfo.phone}-${contactInfo.email}-${forceUpdate}`}>
        {`
          /* Responsive Styles for Footer */
          @media (max-width: 768px) {
            .footer-grid {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
            .footer-brand {
              max-width: 100% !important;
              text-align: center !important;
            }
            .footer-links {
              text-align: center !important;
            }
            .footer-stats {
              gap: 1.5rem !important;
            }
            .footer-social {
              justify-content: center !important;
            }
            .newsletter-form {
              flex-direction: column !important;
              gap: 0.75rem !important;
            }
            .newsletter-input {
              width: 100% !important;
            }
          }

          @media (max-width: 480px) {
            .footer-container {
              padding: 0 1rem !important;
            }
            .footer-brand h3 {
              font-size: 1.25rem !important;
            }
            .footer-stats {
              flex-direction: column !important;
              gap: 1rem !important;
            }
            .footer-social {
              gap: 0.5rem !important;
            }
            .footer-social a {
              width: 2rem !important;
              height: 2rem !important;
              font-size: 0.875rem !important;
            }
          }
        `}
      </style>
      <footer style={{
        width: '100%',
        margin: 0,
        padding: '3rem 0 1.5rem',
        background: '#f9fafb',
        position: 'relative',
        borderTop: '1px solid #e5e7eb'
      }}>

        <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          {/* Main Footer Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '3rem',
            marginBottom: '2rem'
          }}>
            {/* Brand Section */}
            <div style={{ maxWidth: '350px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: '#000000',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaHotel style={{ color: '#ffffff', fontSize: '1rem' }} />
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#000000',
                  margin: 0,
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {hotelInfo.hotelName}
                </h3>
              </div>

              <p style={{
                color: '#6b7280',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                marginBottom: '1.5rem'
              }}>
                {hotelInfo.description}
              </p>

              {/* Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: '#f3f4f6',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FiMapPin style={{ color: '#6b7280', fontSize: '0.875rem' }} />
                  </div>
                  <span style={{ color: '#374151', fontSize: '0.875rem' }}>
                    {contactInfo.address}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: '#f3f4f6',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FiPhone style={{ color: '#6b7280', fontSize: '0.875rem' }} />
                  </div>
                  <span style={{ color: '#374151', fontSize: '0.875rem' }}>
                    {contactInfo.phone}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: '#f3f4f6',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FiMail style={{ color: '#6b7280', fontSize: '0.875rem' }} />
                  </div>
                  <span style={{ color: '#374151', fontSize: '0.875rem' }}>
                    {contactInfo.email}
                  </span>
                </div>

                {/* WhatsApp */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: '#f3f4f6',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaWhatsapp style={{ color: '#6b7280', fontSize: '0.875rem' }} />
                  </div>
                  <span style={{ color: '#374151', fontSize: '0.875rem' }}>
                    {contactInfo.whatsapp}
                  </span>
                </div>

                {/* Website */}
                {contactInfo.website && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '2rem',
                      height: '2rem',
                      background: '#f3f4f6',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FiGlobe style={{ color: '#6b7280', fontSize: '0.875rem' }} />
                    </div>
                    <a
                      href={contactInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#374151',
                        fontSize: '0.875rem',
                        textDecoration: 'none'
                      }}
                    >
                      {contactInfo.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#000000',
                marginBottom: '1rem',
                fontFamily: 'Inter, sans-serif'
              }}>
                Quick Links
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.href}
                    style={{
                      color: '#6b7280',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.25rem 0',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#000000';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#6b7280';
                    }}
                  >
                    <FiExternalLink size={14} />
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#000000',
                marginBottom: '1rem',
                fontFamily: 'Inter, sans-serif'
              }}>
                Our Services
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {services.slice(0, 4).map((service, index) => (
                  <Link
                    key={index}
                    to={service.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      color: '#374151',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f9fafb';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#ffffff';
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{ color: '#6b7280', fontSize: '1rem' }}>
                      {service.icon}
                    </div>
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#000000',
                marginBottom: '1rem',
                fontFamily: 'Inter, sans-serif'
              }}>
                Stay Updated
              </h4>

              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                lineHeight: '1.4'
              }}>
                Subscribe for exclusive offers and updates.
              </p>

              <form onSubmit={handleSubscribe} style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      color: '#000000',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.background = '#f9fafb';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.background = '#ffffff';
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1rem',
                      background: isSubscribed ? '#10b981' : '#000000',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubscribed) {
                        e.target.style.background = '#333333';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubscribed) {
                        e.target.style.background = '#000000';
                      }
                    }}
                  >
                    {isSubscribed ? (
                      <>
                        <FiHeart size={12} />
                        Done!
                      </>
                    ) : (
                      <>
                        <FiSend size={12} />
                        Subscribe
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Social Media */}
              <div>
                <h5 style={{
                  color: '#000000',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Follow Us
                </h5>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  {socialLinks.slice(0, 4).map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        background: '#ffffff',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        border: '1px solid #e5e7eb',
                        fontSize: '1rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f3f4f6';
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.color = '#374151';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#ffffff';
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.color = '#6b7280';
                      }}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* Stats */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2rem',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#000000',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  500+
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Happy Guests
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#000000',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  4.9
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Rating
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#000000',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  24/7
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Support
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div style={{
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              <p style={{ margin: 0 }}>
                © {new Date().getFullYear()} {hotelInfo.hotelName}. All rights reserved. |
                <span style={{ color: '#374151', marginLeft: '0.5rem' }}>
                  Made with <FiHeart style={{ color: '#ef4444', display: 'inline' }} /> for luxury hospitality
                </span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;