import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCalendar, FiUsers, FiCreditCard, FiArrowLeft, FiDownload, FiCheck, FiHome, FiDollarSign, FiPrinter, FiHash } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const invoiceRef = useRef(null);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const bookingData = location.state?.booking;
    if (bookingData) {
      setBooking(bookingData);
      localStorage.setItem('lastBooking', JSON.stringify(bookingData));
    } else {
      const storedBooking = localStorage.getItem('lastBooking');
      if (storedBooking) {
        setBooking(JSON.parse(storedBooking));
      } else {
        toast.error('No booking details found');
        navigate('/rooms');
      }
    }
  }, [location.state, navigate]);

  // Helper functions for responsive design
  const isMobile = () => windowWidth <= 768;
  const isTablet = () => windowWidth <= 1024 && windowWidth > 768;

  const handleViewInvoice = () => {
    setShowInvoice(true);
    // Scroll to top on mobile for better UX
    if (isMobile()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const generateInvoiceNumber = () => {
    const bookingId = booking._id || booking.id || booking.bookingId || Date.now().toString();
    return `INV-${bookingId.toString().substring(0, 8)}-${Math.floor(Math.random() * 1000)}`;
  };

  const getBookingId = () => {
    return booking._id || booking.id || booking.bookingId || `BK${Date.now().toString().substring(-8)}`;
  };

  const handleGeneratePDF = async () => {
    if (!invoiceRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // Clone the invoice element to modify it for PDF
      const invoiceElement = invoiceRef.current;
      const clone = invoiceElement.cloneNode(true);
      
      // Style the clone for PDF output
      clone.style.backgroundColor = '#ffffff';
      clone.style.color = '#000000';
      clone.style.padding = '20px';
      clone.style.boxShadow = 'none';
      
      // Temporarily add to document for rendering
      document.body.appendChild(clone);
      
      // Render to canvas with improved settings
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Remove clone
      document.body.removeChild(clone);
      
      // Create PDF with appropriate dimensions
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210 - 20; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`room-booking-invoice-${getBookingId()}.pdf`);
      
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!booking) {
    return (
      <div className="confirmation-page">
        <div className="error-container">
          <h2>No booking details found</h2>
          <p>Please make a booking first</p>
          <button onClick={() => navigate('/rooms')} className="action-button">
            View Rooms
          </button>
        </div>
      </div>
    );
  }

  if (showInvoice) {
    // Display invoice view
    return (
      <>
        {/* CSS Overrides for Invoice Mobile Responsiveness */}
        <style>
          {`
            /* AGGRESSIVE BLUE BACKGROUND REMOVAL */
            .invoice-page,
            .invoice-page *,
            .invoice-container,
            .invoice-container *,
            .invoice-header,
            .invoice-header *,
            .invoice-details,
            .invoice-details *,
            .invoice-to,
            .invoice-to *,
            .invoice-items,
            .invoice-items *,
            .invoice-summary,
            .invoice-summary *,
            .invoice-footer,
            .invoice-footer *,
            .hotel-info,
            .hotel-info *,
            .summary-item,
            .summary-item * {
              background: #ffffff !important;
              background-color: #ffffff !important;
              background-image: none !important;
              background-gradient: none !important;
            }

            /* Specific overrides for light gray sections */
            .invoice-to,
            .invoice-summary {
              background: #f9fafb !important;
              background-color: #f9fafb !important;
            }

            /* Table header override */
            .invoice-items th {
              background: #f3f4f6 !important;
              background-color: #f3f4f6 !important;
            }

            /* Invoice page mobile responsiveness */
            .invoice-page {
              padding: 1rem !important;
              padding-top: 100px !important;
              background: #ffffff !important;
              min-height: 100vh !important;
              width: 100% !important;
              margin: 0 !important;
              position: relative !important;
              z-index: 1000 !important;
            }

            /* Invoice actions buttons */
            .invoice-actions {
              display: flex !important;
              gap: 1rem !important;
              margin-top: 0 !important;
              margin-bottom: 1.5rem !important;
              padding: 1rem !important;
              background: #ffffff !important;
              border-radius: 0.5rem !important;
              border: 1px solid #e5e7eb !important;
            }

            .action-button {
              flex: 1 !important;
              padding: 0.75rem 1rem !important;
              background: #000000 !important;
              color: #ffffff !important;
              border: 1px solid #000000 !important;
              border-radius: 0.5rem !important;
              font-size: 0.9rem !important;
              font-weight: 600 !important;
              cursor: pointer !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              gap: 0.5rem !important;
              min-height: 48px !important;
              -webkit-text-fill-color: #ffffff !important;
            }

            .action-button.back {
              background: #ffffff !important;
              color: #000000 !important;
              border: 1px solid #000000 !important;
              -webkit-text-fill-color: #000000 !important;
            }

            .action-button:hover {
              transform: translateY(-1px) !important;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
            }

            .action-button.back:hover {
              background: #f3f4f6 !important;
            }

            /* Remove all blue backgrounds from invoice elements */
            .invoice-page,
            .invoice-page *,
            .invoice-container,
            .invoice-container *,
            .invoice-header,
            .invoice-header *,
            .invoice-details,
            .invoice-details *,
            .invoice-to,
            .invoice-to *,
            .invoice-items,
            .invoice-items *,
            .invoice-summary,
            .invoice-summary *,
            .invoice-footer,
            .invoice-footer *,
            .hotel-info,
            .hotel-info * {
              background: #ffffff !important;
              background-color: #ffffff !important;
              background-image: none !important;
            }

            /* Force all text to be black/gray */
            .invoice-page *,
            .invoice-container *,
            .invoice-header *,
            .invoice-details *,
            .invoice-to *,
            .invoice-items *,
            .invoice-summary *,
            .invoice-footer *,
            .hotel-info * {
              color: #000000 !important;
              -webkit-text-fill-color: #000000 !important;
            }

            /* Secondary text should be gray */
            .invoice-page p,
            .invoice-page small,
            .invoice-container p,
            .invoice-container small {
              color: #374151 !important;
              -webkit-text-fill-color: #374151 !important;
            }

            /* Table styling */
            .invoice-items table {
              background: #ffffff !important;
              border-collapse: collapse !important;
            }

            .invoice-items th {
              background: #f3f4f6 !important;
              color: #000000 !important;
            }

            .invoice-items td {
              background: #ffffff !important;
              color: #374151 !important;
            }

            /* Mobile specific overrides */
            @media (max-width: 768px) {
              .invoice-page {
                padding: 1rem !important;
                padding-top: 100px !important;
                margin: 0 !important;
                box-sizing: border-box !important;
                background: #ffffff !important;
              }

              .invoice-actions {
                margin-top: 0 !important;
                margin-bottom: 1.5rem !important;
                padding: 1rem !important;
                background: #ffffff !important;
              }

              .action-button {
                font-size: 0.85rem !important;
                padding: 0.75rem 1rem !important;
                min-height: 48px !important;
              }

              /* Force all mobile elements to white background */
              .invoice-page,
              .invoice-page *,
              .invoice-container,
              .invoice-container *,
              body,
              html {
                background: #ffffff !important;
                background-color: #ffffff !important;
                background-image: none !important;
              }
            }
          `}
        </style>

        <div className="invoice-page" style={{
          background: '#ffffff',
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
          padding: '1rem',
          paddingTop: '100px',
          minHeight: '100vh',
          width: '100%',
          margin: '0',
          position: 'relative',
          zIndex: '1000'
        }}>
        <div className="invoice-actions" style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '0',
          marginBottom: '1.5rem',
          padding: '1rem',
          background: '#ffffff',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => setShowInvoice(false)}
            style={{
              flex: '1',
              padding: '0.75rem 1.5rem',
              background: '#ffffff',
              color: '#000000',
              border: '1px solid #000000',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              minHeight: '48px',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f3f4f6';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#ffffff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <FiArrowLeft /> Back
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={isDownloading}
            style={{
              flex: '1',
              padding: '0.75rem 1.5rem',
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              minHeight: '48px',
              opacity: isDownloading ? '0.7' : '1',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#333333';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#000000';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {isDownloading ? (
              'Loading...'
            ) : (
              <>
                <FiDownload /> Download PDF
              </>
            )}
          </button>
        </div>
        
        <div className="invoice-container" ref={invoiceRef} style={{
          background: '#ffffff !important',
          backgroundColor: '#ffffff !important',
          backgroundImage: 'none !important',
          padding: '2rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          maxWidth: '800px',
          margin: '0 auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="invoice-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid #e5e7eb',
            background: '#ffffff'
          }}>
            <div className="hotel-info" style={{ background: '#ffffff' }}>
              <h1 style={{ color: '#000000', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Night Elegance</h1>
              <p style={{ color: '#374151', margin: '0.25rem 0' }}>123 Luxury Avenue</p>
              <p style={{ color: '#374151', margin: '0.25rem 0' }}>City, State 12345</p>
              <p style={{ color: '#374151', margin: '0.25rem 0' }}>Tel: (555) 123-4567</p>
            </div>
            <div className="invoice-details" style={{ textAlign: 'right', background: '#ffffff' }}>
              <h2 style={{ color: '#000000', fontSize: '1.25rem', marginBottom: '0.5rem' }}>INVOICE</h2>
              <p style={{ color: '#374151', margin: '0.25rem 0' }}><strong style={{ color: '#000000' }}>Invoice No:</strong> {generateInvoiceNumber()}</p>
              <p style={{ color: '#374151', margin: '0.25rem 0' }}><strong style={{ color: '#000000' }}>Date:</strong> {new Date().toLocaleDateString()}</p>
              <p style={{ color: '#374151', margin: '0.25rem 0' }}><strong style={{ color: '#000000' }}>Booking ID:</strong> {getBookingId()}</p>
            </div>
          </div>

          <div className="invoice-to" style={{
            background: '#f9fafb',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ color: '#000000', fontSize: '1rem', marginBottom: '0.5rem' }}>INVOICE TO:</h3>
            <p style={{ color: '#374151', margin: '0.25rem 0' }}><strong style={{ color: '#000000' }}>{booking.fullName || 'Guest'}</strong></p>
            <p style={{ color: '#374151', margin: '0.25rem 0' }}>{booking.email || 'N/A'}</p>
            <p style={{ color: '#374151', margin: '0.25rem 0' }}>{booking.phone || 'N/A'}</p>
          </div>

          <div className="invoice-items" style={{
            marginBottom: '1.5rem',
            background: '#ffffff'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#ffffff'
            }}>
              <thead>
                <tr>
                  <th style={{
                    background: '#f3f4f6',
                    color: '#000000',
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid #e5e7eb'
                  }}>Description</th>
                  <th style={{
                    background: '#f3f4f6',
                    color: '#000000',
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid #e5e7eb'
                  }}>Details</th>
                  <th style={{
                    background: '#f3f4f6',
                    color: '#000000',
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid #e5e7eb'
                  }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #e5e7eb',
                    background: '#ffffff',
                    verticalAlign: 'top'
                  }}>
                    <p style={{ color: '#000000', margin: '0.25rem 0', fontWeight: '600' }}>Room Booking</p>
                    <small style={{ color: '#6b7280' }}>Check In: {formatDate(booking.checkInDate)}</small>
                    <br />
                    <small style={{ color: '#6b7280' }}>Check Out: {formatDate(booking.checkOutDate)}</small>
                  </td>
                  <td style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #e5e7eb',
                    background: '#ffffff',
                    verticalAlign: 'top'
                  }}>
                    <p style={{ color: '#374151', margin: '0.25rem 0' }}>Room: {booking.roomNumber}</p>
                    <p style={{ color: '#374151', margin: '0.25rem 0' }}>Type: {booking.roomType}</p>
                    <p style={{ color: '#374151', margin: '0.25rem 0' }}>Guests: {booking.guests}</p>
                    <p style={{ color: '#374151', margin: '0.25rem 0' }}>Duration: {booking.numberOfNights} night(s)</p>
                  </td>
                  <td style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #e5e7eb',
                    background: '#ffffff',
                    verticalAlign: 'top',
                    color: '#000000',
                    fontWeight: '600'
                  }}>Rs. {booking.basePrice}</td>
                </tr>
                {booking.specialRequests && (
                  <tr>
                    <td colSpan="3" style={{
                      padding: '0.75rem',
                      background: '#ffffff',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      <strong style={{ color: '#000000' }}>Special Requests:</strong>
                      <p style={{ color: '#374151', margin: '0.5rem 0' }}>{booking.specialRequests}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="invoice-summary" style={{
            background: '#f9fafb',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <div className="summary-item" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#374151' }}>Subtotal:</span>
              <span style={{ color: '#000000', fontWeight: '600' }}>Rs. {booking.basePrice}</span>
            </div>
            <div className="summary-item" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#374151' }}>Tax (10%):</span>
              <span style={{ color: '#000000', fontWeight: '600' }}>Rs. {booking.taxAmount}</span>
            </div>
            <div className="summary-item total" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 0',
              borderTop: '2px solid #e5e7eb',
              marginTop: '0.5rem',
              fontWeight: '700',
              fontSize: '1.1rem'
            }}>
              <span style={{ color: '#000000' }}>Total:</span>
              <span style={{ color: '#000000' }}>Rs. {booking.totalPrice}</span>
            </div>
            <div className="summary-item payment" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0',
              borderTop: '1px solid #e5e7eb',
              marginTop: '0.5rem'
            }}>
              <span style={{ color: '#374151' }}>Payment Method:</span>
              <span style={{ color: '#000000', fontWeight: '600' }}>{booking.payment === 'card' ? 'Credit Card' : 'PayPal'}</span>
            </div>
          </div>

          <div className="invoice-footer" style={{
            textAlign: 'center',
            padding: '1rem',
            borderTop: '1px solid #e5e7eb',
            background: '#ffffff'
          }}>
            <p style={{ color: '#000000', fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Thank you for choosing Night Elegance</p>
            <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>This is a computer-generated invoice and requires no signature</small>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      {/* CSS Overrides for Black and White Theme */}
      <style>
        {`
          /* ULTRA AGGRESSIVE OVERRIDES FOR BOOKING CONFIRMATION */

          /* Force section title to be black */
          .section-title,
          h2.section-title,
          .booking-confirmation-page .section-title,
          .booking-confirmation-page h2 {
            color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }

          /* Force ALL buttons to be visible */
          button,
          .action-btn,
          .action-btn.primary,
          .action-btn.secondary {
            background: #000000 !important;
            color: #ffffff !important;
            border: 1px solid #000000 !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          /* Secondary button specific styling */
          .action-btn.secondary {
            background: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }

          /* Button hover states */
          .action-btn:hover,
          .action-btn.primary:hover {
            background: #374151 !important;
            color: #ffffff !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          .action-btn.secondary:hover {
            background: #f3f4f6 !important;
            color: #000000 !important;
            transform: translateY(-2px) !important;
            border-color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }

          /* Force button text and icons to be visible */
          .action-btn span,
          .action-btn svg,
          button span,
          button svg {
            color: inherit !important;
            -webkit-text-fill-color: inherit !important;
          }

          /* Universal button override */
          .booking-confirmation-page button {
            background: #000000 !important;
            color: #ffffff !important;
            border: 1px solid #000000 !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          .booking-confirmation-page .action-btn.secondary {
            background: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }

          /* Mobile responsiveness for buttons */
          @media (max-width: 768px) {
            .action-btn {
              width: 100% !important;
              min-width: auto !important;
              padding: 1.25rem 2rem !important;
              font-size: 1.05rem !important;
            }

            .action-section {
              flex-direction: column !important;
              gap: 1rem !important;
              padding: 2rem 0 1rem !important;
            }
          }

          /* ========== INVOICE MOBILE RESPONSIVENESS ========== */

          /* Invoice page container */
          .invoice-page {
            padding: 1rem !important;
            padding-top: 120px !important;
            background: #ffffff !important;
            min-height: 100vh !important;
            width: 100% !important;
            margin: 0 !important;
            position: relative !important;
            z-index: 1000 !important;
          }

          /* Force invoice page to override any blue backgrounds */
          .invoice-page,
          .invoice-page *,
          .invoice-page::before,
          .invoice-page::after {
            background: #ffffff !important;
            background-color: #ffffff !important;
          }

          /* Invoice container */
          .invoice-container {
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 1rem !important;
            background: #ffffff !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
          }

          /* Invoice actions */
          .invoice-actions {
            display: flex !important;
            gap: 1rem !important;
            margin-top: 2rem !important;
            margin-bottom: 1.5rem !important;
            padding: 1rem !important;
            background: #ffffff !important;
            border-radius: 0.5rem !important;
            border: 1px solid #e5e7eb !important;
          }

          .action-button {
            flex: 1 !important;
            padding: 0.75rem 1rem !important;
            background: #000000 !important;
            color: #ffffff !important;
            border: 1px solid #000000 !important;
            border-radius: 0.5rem !important;
            font-size: 0.9rem !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0.5rem !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          .action-button.back {
            background: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }

          .action-button:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          }

          .action-button.back:hover {
            background: #f3f4f6 !important;
          }

          /* Invoice header mobile */
          .invoice-header {
            display: flex !important;
            flex-direction: column !important;
            gap: 1rem !important;
            margin-bottom: 1.5rem !important;
            padding-bottom: 1rem !important;
            border-bottom: 2px solid #e5e7eb !important;
          }

          .hotel-info h1 {
            font-size: 1.5rem !important;
            color: #000000 !important;
            margin-bottom: 0.5rem !important;
          }

          .hotel-info p {
            font-size: 0.9rem !important;
            color: #6b7280 !important;
            margin: 0.25rem 0 !important;
          }

          .invoice-details h2 {
            font-size: 1.25rem !important;
            color: #000000 !important;
            margin-bottom: 0.5rem !important;
          }

          .invoice-details p {
            font-size: 0.9rem !important;
            color: #374151 !important;
            margin: 0.25rem 0 !important;
          }

          /* Invoice to section */
          .invoice-to {
            margin-bottom: 1.5rem !important;
            padding: 1rem !important;
            background: #f9fafb !important;
            border-radius: 0.5rem !important;
          }

          .invoice-to h3 {
            font-size: 1rem !important;
            color: #000000 !important;
            margin-bottom: 0.5rem !important;
          }

          .invoice-to p {
            font-size: 0.9rem !important;
            color: #374151 !important;
            margin: 0.25rem 0 !important;
          }

          /* Invoice table mobile */
          .invoice-items {
            margin-bottom: 1.5rem !important;
            overflow-x: auto !important;
          }

          .invoice-items table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 0.85rem !important;
          }

          .invoice-items th {
            background: #f3f4f6 !important;
            color: #000000 !important;
            padding: 0.75rem 0.5rem !important;
            text-align: left !important;
            font-weight: 600 !important;
            border-bottom: 2px solid #e5e7eb !important;
          }

          .invoice-items td {
            padding: 0.75rem 0.5rem !important;
            border-bottom: 1px solid #e5e7eb !important;
            color: #374151 !important;
            vertical-align: top !important;
          }

          .invoice-items td p {
            margin: 0.25rem 0 !important;
            font-size: 0.85rem !important;
          }

          .invoice-items td small {
            font-size: 0.75rem !important;
            color: #6b7280 !important;
          }

          /* Invoice summary mobile */
          .invoice-summary {
            background: #f9fafb !important;
            padding: 1rem !important;
            border-radius: 0.5rem !important;
            margin-bottom: 1.5rem !important;
          }

          .summary-item {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 0.5rem 0 !important;
            border-bottom: 1px solid #e5e7eb !important;
            font-size: 0.9rem !important;
          }

          .summary-item:last-child {
            border-bottom: none !important;
          }

          .summary-item.total {
            font-weight: 700 !important;
            font-size: 1rem !important;
            color: #000000 !important;
            border-top: 2px solid #e5e7eb !important;
            padding-top: 0.75rem !important;
            margin-top: 0.5rem !important;
          }

          .summary-item span {
            color: #374151 !important;
          }

          .summary-item.total span {
            color: #000000 !important;
          }

          /* Invoice footer mobile */
          .invoice-footer {
            text-align: center !important;
            padding: 1rem !important;
            border-top: 1px solid #e5e7eb !important;
          }

          .invoice-footer p {
            font-size: 1rem !important;
            color: #000000 !important;
            font-weight: 600 !important;
            margin-bottom: 0.5rem !important;
          }

          .invoice-footer small {
            font-size: 0.8rem !important;
            color: #6b7280 !important;
          }

          /* Mobile specific adjustments */
          @media (max-width: 768px) {
            .invoice-page {
              padding: 1rem !important;
              padding-top: 100px !important;
              margin-top: 0 !important;
            }

            .invoice-actions {
              margin-top: 0 !important;
              margin-bottom: 1.5rem !important;
              padding: 1rem !important;
              position: relative !important;
              top: 0 !important;
            }

            .invoice-container {
              padding: 0.75rem !important;
              margin-top: 0 !important;
            }

            .invoice-header {
              text-align: center !important;
            }

            .invoice-items table {
              font-size: 0.8rem !important;
            }

            .invoice-items th,
            .invoice-items td {
              padding: 0.5rem 0.25rem !important;
            }

            .action-button {
              font-size: 0.85rem !important;
              padding: 0.75rem 1rem !important;
              min-height: 48px !important;
            }
          }

          /* ========== REMOVE ALL BLUE COLORS FROM INVOICE ========== */

          /* Force all text to be black or gray - no blue */
          .invoice-page *,
          .invoice-container *,
          .invoice-header *,
          .invoice-details *,
          .invoice-to *,
          .invoice-items *,
          .invoice-summary *,
          .invoice-footer * {
            color: #000000 !important;
          }

          /* Specific overrides for different text types */
          .invoice-page h1,
          .invoice-page h2,
          .invoice-page h3,
          .invoice-container h1,
          .invoice-container h2,
          .invoice-container h3 {
            color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }

          .invoice-page p,
          .invoice-page span,
          .invoice-page td,
          .invoice-page th,
          .invoice-page small {
            color: #374151 !important;
            -webkit-text-fill-color: #374151 !important;
          }

          /* Strong/bold text should be black */
          .invoice-page strong,
          .invoice-page b,
          .summary-item.total,
          .summary-item.total * {
            color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }

          /* Remove any blue backgrounds */
          .invoice-page,
          .invoice-container,
          .invoice-header,
          .invoice-details,
          .invoice-to,
          .invoice-items,
          .invoice-summary,
          .invoice-footer {
            background: #ffffff !important;
          }

          /* Table headers should have gray background */
          .invoice-items th {
            background: #f3f4f6 !important;
            color: #000000 !important;
          }

          /* Summary section background */
          .invoice-summary,
          .invoice-to {
            background: #f9fafb !important;
          }

          /* Remove any blue borders */
          .invoice-page *,
          .invoice-container *,
          .invoice-items table,
          .invoice-items th,
          .invoice-items td,
          .summary-item {
            border-color: #e5e7eb !important;
          }

          /* Ensure no blue links or interactive elements */
          .invoice-page a,
          .invoice-page button:not(.action-button) {
            color: #000000 !important;
            text-decoration: none !important;
          }

          /* Mobile specific blue removal */
          @media (max-width: 768px) {
            /* Force all mobile elements to white background */
            body,
            html,
            #root,
            .invoice-page,
            .invoice-page *,
            .invoice-container,
            .invoice-container *,
            .invoice-actions,
            .invoice-header,
            .invoice-details,
            .invoice-to,
            .invoice-items,
            .invoice-summary,
            .invoice-footer {
              background: #ffffff !important;
              background-color: #ffffff !important;
            }

            /* Specific mobile overrides for action buttons */
            .invoice-actions {
              background: #ffffff !important;
              margin-top: 1.5rem !important;
              padding: 1rem !important;
              border: 1px solid #e5e7eb !important;
            }

            .action-button {
              background: #000000 !important;
              color: #ffffff !important;
              border: 1px solid #000000 !important;
              -webkit-text-fill-color: #ffffff !important;
            }

            .action-button.back {
              background: #ffffff !important;
              color: #000000 !important;
              border: 1px solid #000000 !important;
              -webkit-text-fill-color: #000000 !important;
            }

            /* Force text colors on mobile */
            .invoice-page *,
            .invoice-container * {
              color: #000000 !important;
            }

            .invoice-page p,
            .invoice-page span,
            .invoice-page small,
            .invoice-page td {
              color: #374151 !important;
            }

            /* Remove any blue gradients or backgrounds */
            .invoice-page,
            .invoice-page *,
            .invoice-container,
            .invoice-container * {
              background-image: none !important;
              background-gradient: none !important;
            }

            /* Ensure proper spacing on mobile */
            .invoice-page {
              padding: 1rem !important;
              padding-top: 100px !important;
              margin: 0 !important;
              box-sizing: border-box !important;
            }

            .invoice-actions {
              margin-top: 0 !important;
              margin-bottom: 1.5rem !important;
              position: static !important;
            }

            .invoice-container {
              margin: 0 !important;
              padding: 0.75rem !important;
              margin-top: 0 !important;
            }
          }
        `}
      </style>

      <div className="booking-confirmation-page">
      {/* Hero Section */}
      <div className="confirmation-hero">
        <div className="hero-content">
          <div className="success-animation">
            <FiCheck className="success-icon" />
          </div>
          <h1 className="hero-title">🎉 Booking Confirmed!</h1>
          <p className="hero-subtitle">Your luxury room has been successfully reserved</p>
          <div className="booking-id-badge">
            <FiHash className="badge-icon" />
            <span>Booking ID: {getBookingId().toString().substring(0, 8).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="confirmation-content">
        <div className="content-container">

          {/* Quick Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card primary">
              <div className="card-icon">
                <FiCalendar />
              </div>
              <div className="card-content">
                <h3>Check-in</h3>
                <p>{formatDate(booking.checkInDate)}</p>
              </div>
            </div>

            <div className="summary-card primary">
              <div className="card-icon">
                <FiCalendar />
              </div>
              <div className="card-content">
                <h3>Check-out</h3>
                <p>{formatDate(booking.checkOutDate)}</p>
              </div>
            </div>

            <div className="summary-card accent">
              <div className="card-icon">
                <FiHome />
              </div>
              <div className="card-content">
                <h3>Room {booking.roomNumber}</h3>
                <p>{booking.roomType}</p>
              </div>
            </div>

            <div className="summary-card success">
              <div className="card-icon">
                <FiDollarSign />
              </div>
              <div className="card-content">
                <h3>Total Paid</h3>
                <p>Rs. {booking.totalPrice}</p>
              </div>
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="details-section">
            <h2 className="section-title" style={{
              color: '#000000',
              fontSize: '1.8rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>Booking Details</h2>
            <div className="details-grid">
              <div className="detail-card">
                <div className="detail-header">
                  <FiUsers className="detail-icon" />
                  <span>Guest Information</span>
                </div>
                <div className="detail-body">
                  <div className="detail-row">
                    <span className="label">Guests:</span>
                    <span className="value">{booking.guests} person(s)</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Duration:</span>
                    <span className="value">{booking.numberOfNights} night(s)</span>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-header">
                  <FiCreditCard className="detail-icon" />
                  <span>Payment Information</span>
                </div>
                <div className="detail-body">
                  <div className="detail-row">
                    <span className="label">Method:</span>
                    <span className="value">{booking.payment === 'card' ? 'Credit Card' : 'PayPal'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span className="value success">✓ Confirmed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-section">
            <button
              onClick={handleViewInvoice}
              className="action-btn primary"
              style={{
                background: '#000000',
                color: '#ffffff',
                border: '1px solid #000000',
                borderRadius: '0.75rem',
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                minWidth: '200px',
                justifyContent: 'center'
              }}
            >
              <FiPrinter />
              <span>View & Download Invoice</span>
            </button>
            <button
              onClick={() => navigate('/my-bookings')}
              className="action-btn secondary"
              style={{
                background: '#ffffff',
                color: '#000000',
                border: '1px solid #000000',
                borderRadius: '0.75rem',
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                minWidth: '200px',
                justifyContent: 'center'
              }}
            >
              <FiArrowLeft />
              <span>View All Bookings</span>
            </button>
          </div>

        </div>
      </div>
    </div>
    </>
  );
};

export default BookingConfirmation; 