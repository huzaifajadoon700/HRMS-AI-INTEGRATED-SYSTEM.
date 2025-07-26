import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiCreditCard,
  FiStar,
  FiMapPin,
  FiWifi,
  FiTv,
  FiCoffee,
  FiCheck,
  FiArrowLeft,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(
  "pk_test_51RQDO0QHBrXA72xgYssbECOe9bubZ2bWHA4m0T6EY6AvvmAfCzIDmKUCkRjpwVVIJ4IMaOiQBUawECn5GD8ADHbn00GRVmjExI"
);

// Payment Form Component
const PaymentForm = ({ onPaymentSuccess, totalPrice, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    try {
      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement),
        });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      await onPaymentSuccess(paymentMethod.id);
    } catch (err) {
      setError("An unexpected error occurred.");
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        background: "#000000",
        borderRadius: "1rem",
        padding: "2rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
        border: "1px solid #374151",
      }}
    >
      <h3
        style={{
          fontSize: "1.5rem",
          fontWeight: "600",
          color: "#ffffff",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        Payment Details
      </h3>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.5rem" }}>
        <div
          style={{
            padding: "1rem",
            border: "1px solid #374151",
            borderRadius: "0.5rem",
            background: "#ffffff",
          }}
        >
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#000000",
                  fontFamily: "Inter, sans-serif",
                  "::placeholder": {
                    color: "#6b7280",
                  },
                },
                invalid: {
                  color: "#ef4444",
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
        {error && (
          <div
            style={{
              color: "#ffffff",
              background: "#dc2626",
              border: "1px solid #ef4444",
              borderRadius: "0.5rem",
              padding: "0.75rem",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "#374151",
              border: "1px solid #6b7280",
              borderRadius: "0.5rem",
              padding: "0.75rem 1.5rem",
              color: "#ffffff",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!stripe || processing}
            style={{
              background: processing
                ? "#9ca3af"
                : "linear-gradient(135deg, #64ffda 0%, #4fd1c7 50%, #38bdf8 100%)",
              border: "none",
              borderRadius: "0.75rem",
              padding: "1rem 1.5rem",
              color: processing ? "#ffffff" : "#0a192f",
              fontSize: "1rem",
              fontWeight: "700",
              cursor: processing ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: processing
                ? "none"
                : "0 4px 15px rgba(100, 255, 218, 0.3)",
              transform: processing ? "none" : "translateY(0)",
            }}
            onMouseEnter={(e) => {
              if (!processing) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  "0 8px 25px rgba(100, 255, 218, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!processing) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow =
                  "0 4px 15px rgba(100, 255, 218, 0.3)";
              }
            }}
          >
            {processing ? "Processing..." : `Pay Rs. ${totalPrice}`}
          </button>
        </div>
      </form>
    </div>
  );
};

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
    payment: "card",
  });
  const [bookingSummary, setBookingSummary] = useState({
    nights: 0,
    basePrice: 0,
    taxAmount: 0,
    totalPrice: 0,
  });
  const [showPayment, setShowPayment] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll to top utility function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Scroll to top when payment form is shown and manage body scroll
  useEffect(() => {
    if (showPayment) {
      scrollToTop();
      document.body.classList.add("payment-open");
    } else {
      document.body.classList.remove("payment-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("payment-open");
    };
  }, [showPayment]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder-room.jpg";
    try {
      if (imagePath.startsWith("http")) return imagePath;
      const cleanPath = imagePath.replace(/^\/+/, "");
      const serverURL =
        process.env.REACT_APP_API_URL || "https://hrms-bace.vercel.app";
      return cleanPath.includes("uploads")
        ? `${serverURL}/${cleanPath}`
        : `${serverURL}/uploads/${cleanPath}`;
    } catch (error) {
      console.error("Error formatting image URL:", error);
      return "/images/placeholder-room.jpg";
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: `/booking-page/${id}` } });
      return;
    }

    // Get booking data from localStorage (set from RoomPage)
    const bookingData = localStorage.getItem("roomBookingData");
    let prefilledData = {};
    if (bookingData) {
      try {
        prefilledData = JSON.parse(bookingData);
      } catch (error) {
        console.warn("Error parsing booking data:", error);
      }
    }

    const fetchUserAndRoomDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch room details
        const apiUrl =
          process.env.REACT_APP_API_BASE_URL ||
          "https://hrms-bace.vercel.app/api";
        const roomResponse = await axios.get(`${apiUrl}/rooms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch user profile data to pre-fill the form
        const userResponse = await axios
          .get(`${apiUrl}/user/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .catch((error) => {
            console.warn("Could not fetch user profile:", error);
            return { data: {} }; // Return empty data if profile fetch fails
          });

        // Update form with user data and booking data if available
        const userData = userResponse.data || {};
        setFormData((prev) => ({
          ...prev,
          fullName: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          checkInDate: prefilledData.checkInDate || "",
          checkOutDate: prefilledData.checkOutDate || "",
          guests: prefilledData.guests || 1,
        }));

        if (roomResponse.data) {
          let roomData = null;

          // First try to find room by ID from URL
          if (id && id !== "undefined") {
            roomData = roomResponse.data.find((room) => room._id === id);
          }

          // If not found by ID, try to use room data from localStorage
          if (!roomData && prefilledData.roomId) {
            roomData = roomResponse.data.find(
              (room) => room._id === prefilledData.roomId
            );
          }

          // If still not found, try to match by room number or type from localStorage
          if (!roomData && prefilledData.roomNumber) {
            roomData = roomResponse.data.find(
              (room) => room.roomNumber === prefilledData.roomNumber
            );
          }

          if (roomData) {
            setRoom(roomData);
            // Update booking summary with prefilled dates if available
            updateBookingSummary(
              roomData.price,
              prefilledData.checkInDate || "",
              prefilledData.checkOutDate || ""
            );
          } else {
            // If we have room data in localStorage but can't find it in API, use localStorage data directly
            if (prefilledData.roomId) {
              const localRoomData = {
                _id: prefilledData.roomId,
                roomNumber: prefilledData.roomNumber,
                roomType: prefilledData.roomType,
                price: prefilledData.price,
                description: prefilledData.description,
                image: prefilledData.image,
                capacity: prefilledData.capacity,
                amenities: prefilledData.amenities || [],
                averageRating: prefilledData.averageRating || 0,
                totalRatings: prefilledData.totalRatings || 0,
              };
              setRoom(localRoomData);
              updateBookingSummary(
                localRoomData.price,
                prefilledData.checkInDate || "",
                prefilledData.checkOutDate || ""
              );
            } else {
              throw new Error("Room not found");
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login", { state: { from: `/booking-page/${id}` } });
          return;
        }
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load room details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRoomDetails();
  }, [id, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateBookingSummary = (roomPrice, checkIn, checkOut) => {
    if (!roomPrice || !checkIn || !checkOut) {
      setBookingSummary({
        nights: 0,
        basePrice: 0,
        taxAmount: 0,
        totalPrice: 0,
      });
      return;
    }

    const nights = calculateNights(checkIn, checkOut);
    const basePrice = roomPrice * nights;
    const taxRate = 0.1; // 10% tax
    const taxAmount = basePrice * taxRate;
    const totalPrice = basePrice + taxAmount;

    setBookingSummary({
      nights,
      basePrice,
      taxAmount,
      totalPrice,
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update booking summary when dates change
    if (name === "checkInDate" || name === "checkOutDate") {
      updateBookingSummary(
        room?.price,
        name === "checkInDate" ? value : formData.checkInDate,
        name === "checkOutDate" ? value : formData.checkOutDate
      );
    }
  };

  const validateBooking = () => {
    const errors = [];

    // Check dates
    if (!formData.checkInDate || !formData.checkOutDate) {
      errors.push("Please select both check-in and check-out dates");
    } else {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        errors.push("Check-in date cannot be in the past");
      }

      if (checkOut <= checkIn) {
        errors.push("Check-out date must be after check-in date");
      }

      // Check if booking is within reasonable range (e.g., max 30 days)
      const daysDiff = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      if (daysDiff > 30) {
        errors.push("Booking duration cannot exceed 30 days");
      }
    }

    // Validate guests
    if (!formData.guests || formData.guests < 1) {
      errors.push("Number of guests must be at least 1");
    } else if (room && formData.guests > room.maxGuests) {
      errors.push(`Maximum ${room.maxGuests} guests allowed for this room`);
    }

    // Validate personal information
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errors.push("Please enter a valid full name (minimum 2 characters)");
    }

    if (!formData.email) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        errors.push("Please enter a valid email address");
      }
    }

    if (!formData.phone) {
      errors.push("Phone number is required");
    } else {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        errors.push("Please enter a valid phone number (minimum 10 digits)");
      }
    }

    // Validate payment method
    if (!formData.payment || !["card", "paypal"].includes(formData.payment)) {
      errors.push("Please select a valid payment method");
    }

    // Special requests length check (optional field)
    if (formData.specialRequests && formData.specialRequests.length > 500) {
      errors.push("Special requests cannot exceed 500 characters");
    }

    // Display all errors if any
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return false;
    }

    return true;
  };

  const handlePaymentSuccess = async (paymentMethodId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to continue with your booking");
        navigate("/login", { state: { from: `/rooms/${id}` } });
        return;
      }

      const bookingData = {
        roomId: id,
        roomType: room.roomType,
        roomNumber: room.roomNumber,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guests: parseInt(formData.guests),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        specialRequests: formData.specialRequests.trim(),
        payment: "card",
        paymentMethodId: paymentMethodId,
        totalPrice: bookingSummary.totalPrice,
        basePrice: bookingSummary.basePrice,
        taxAmount: bookingSummary.taxAmount,
        numberOfNights: bookingSummary.nights,
      };

      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.post(`${apiUrl}/bookings`, bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        toast.success("Booking created successfully!");
        navigate("/booking-confirmation", {
          state: {
            booking: {
              ...response.data,
              roomType: room.roomType,
              roomNumber: room.roomNumber,
              checkInDate: formData.checkInDate,
              checkOutDate: formData.checkOutDate,
              totalPrice: bookingSummary.totalPrice.toFixed(2),
              basePrice: bookingSummary.basePrice.toFixed(2),
              taxAmount: bookingSummary.taxAmount.toFixed(2),
              numberOfNights: bookingSummary.nights,
              fullName: formData.fullName.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              guests: formData.guests,
              payment: "card",
              specialRequests: formData.specialRequests.trim(),
            },
          },
        });
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error(error.response?.data?.message || "Failed to create booking");
    }
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading room details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-page">
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div
        style={{
          background: "rgba(0, 0, 0, 0.8)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "100px",
          paddingBottom: "50px",
        }}
      >
        <div
          style={{
            background: "#000000",
            backdropFilter: "none",
            border: "1px solid #374151",
            borderRadius: "1rem",
            padding: "2rem",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <Elements stripe={stripePromise}>
            <PaymentForm
              onPaymentSuccess={handlePaymentSuccess}
              totalPrice={bookingSummary.totalPrice.toFixed(2)}
              onCancel={() => setShowPayment(false)}
            />
          </Elements>
        </div>
      </div>
    );
  }

  // Format price in Pakistani Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div
        style={{
          background: "#0A192F",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "80px",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(145deg, rgba(17, 34, 64, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(100, 255, 218, 0.1)",
            borderRadius: "1rem",
            padding: "3rem",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "4px solid rgba(100, 255, 218, 0.1)",
              borderTop: "4px solid #64ffda",
              borderRadius: "50%",
              margin: "0 auto 1.5rem",
              animation: "spin 1s linear infinite",
            }}
          />
          <h3
            style={{
              color: "#fff",
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            Loading Room Details
          </h3>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            Please wait while we prepare your booking page...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "#0A192F",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "80px",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(145deg, rgba(17, 34, 64, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 107, 157, 0.3)",
            borderRadius: "1rem",
            padding: "3rem",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <h3
            style={{
              color: "#ff6b9d",
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "1rem",
            }}
          >
            Error Loading Room
          </h3>
          <p
            style={{
              color: "#ffffff",
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
              fontWeight: "500",
            }}
          >
            {error}
          </p>
          <button
            onClick={() => navigate("/rooms")}
            style={{
              background: "linear-gradient(135deg, #64ffda 0%, #bb86fc 100%)",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.75rem 1.5rem",
              color: "#0a0a0a",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "80px",
          paddingBottom: "50px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: "#000000",
            backdropFilter: "none",
            border: "1px solid #374151",
            borderRadius: "1rem",
            padding: "2rem",
            maxWidth: "500px",
            width: "100%",
            margin: "2rem 1rem",
            position: "relative",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
          }}
        >
          <Elements stripe={stripePromise}>
            <PaymentForm
              onPaymentSuccess={handlePaymentSuccess}
              totalPrice={bookingSummary.totalPrice.toFixed(2)}
              onCancel={() => setShowPayment(false)}
            />
          </Elements>
        </div>
      </div>
    );
  }

  // Helper function to check if screen is mobile
  const isMobile = () => windowWidth <= 768;
  const isTablet = () => windowWidth <= 1024 && windowWidth > 768;

  return (
    <>
      {/* CSS Overrides for Booking Summary Text Visibility */}
      <style>
        {`
          /* Target booking summary container specifically */
          #booking-summary-container * {
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          #booking-summary-container h3 {
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          #booking-summary-container div {
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          #booking-summary-container span {
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          /* Force day numbers and night text */
          #booking-summary-container div[style*="fontSize: '2rem'"] {
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          #booking-summary-container div[style*="fontSize: '0.9rem'"] {
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          /* Fix the Proceed to Payment button */
          #booking-summary-container button {
            background: #000000 !important;
            color: #ffffff !important;
            border: 1px solid #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          #booking-summary-container button:hover {
            background: #333333 !important;
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          #booking-summary-container button:disabled {
            background: #666666 !important;
            color: #cccccc !important;
            -webkit-text-fill-color: #cccccc !important;
          }
        `}
      </style>

      <div
        className="booking-page-container"
        style={{
          background: "#ffffff",
          minHeight: "100vh",
          width: "100%",
          margin: 0,
          padding: 0,
          paddingTop: "80px",
        }}
      >
        {/* Header with Back Button */}
        <div
          style={{
            position: "sticky",
            top: "80px",
            zIndex: 10,
            background: "#ffffff",
            backdropFilter: "none",
            borderBottom: "1px solid #e5e7eb",
            padding: isMobile() ? "0.75rem 1rem" : "1rem 2rem",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              maxWidth: "1600px",
              margin: "0 auto",
            }}
          >
            <button
              onClick={() => navigate("/rooms")}
              style={{
                background: "#ffffff",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                padding: isMobile() ? "0.4rem 0.6rem" : "0.5rem",
                color: "#374151",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: isMobile() ? "0.8rem" : "0.9rem",
                transition: "all 0.3s ease",
              }}
            >
              <FiArrowLeft size={isMobile() ? 14 : 16} />
              {isMobile() ? "Back" : "Back to Rooms"}
            </button>
            <h1
              style={{
                fontSize: isMobile() ? "1.2rem" : "1.5rem",
                fontWeight: "600",
                color: "#000000",
                margin: 0,
              }}
            >
              {isMobile() ? "Book Room" : "Complete Your Booking"}
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            maxWidth: "1600px",
            margin: "0 auto",
            padding: isMobile() ? "1rem" : isTablet() ? "1.5rem" : "2rem",
            display: "grid",
            gridTemplateColumns: isMobile()
              ? "1fr"
              : isTablet()
              ? "1fr"
              : "1fr 400px",
            gap: isMobile() ? "1.5rem" : "2rem",
            alignItems: "start",
          }}
        >
          {/* Left Side - Booking Form */}
          <div
            style={{
              background: "#ffffff",
              backdropFilter: "none",
              border: "1px solid #e5e7eb",
              borderRadius: "1rem",
              padding: isMobile() ? "1.25rem" : "2rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Room Header */}
            <div
              style={{
                display: isMobile() ? "flex" : "grid",
                gridTemplateColumns: isMobile() ? "none" : "150px 1fr",
                flexDirection: isMobile() ? "column" : "row",
                gap: isMobile() ? "0.75rem" : "1rem",
                marginBottom: "1.5rem",
                padding: isMobile() ? "1rem" : "0.75rem",
                background: "#f8fafc",
                borderRadius: "0.75rem",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: isMobile() ? "100%" : "auto",
                }}
              >
                <img
                  src={getImageUrl(room?.image)}
                  alt={room?.roomType}
                  style={{
                    width: "100%",
                    height: isMobile() ? "200px" : "80px",
                    objectFit: "cover",
                    borderRadius: "0.5rem",
                  }}
                  onError={(e) => {
                    e.target.src = "/images/placeholder-room.jpg";
                    e.target.onerror = null;
                  }}
                />
              </div>
              <div
                style={{
                  textAlign: isMobile() ? "center" : "left",
                }}
              >
                <h2
                  style={{
                    fontSize: isMobile() ? "1.4rem" : "1.25rem",
                    fontWeight: "600",
                    color: "#000000",
                    marginBottom: "0.5rem",
                  }}
                >
                  {room?.roomType}
                </h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isMobile() ? "center" : "flex-start",
                    gap: "0.25rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      style={{
                        color: "#fbbf24",
                        fontSize: isMobile() ? "1rem" : "0.8rem",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    fontSize: isMobile() ? "1.3rem" : "1.1rem",
                    fontWeight: "600",
                    color: "#000000",
                  }}
                >
                  {formatPrice(room?.price)}
                  <span
                    style={{
                      fontSize: isMobile() ? "0.9rem" : "0.7rem",
                      opacity: 0.8,
                      color: "#6b7280",
                    }}
                  >
                    /night
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <form
              style={{
                display: "grid",
                gap: isMobile() ? "1.25rem" : "1.5rem",
              }}
            >
              {/* Date and Guest Selection */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile()
                    ? "1fr"
                    : isTablet()
                    ? "repeat(2, 1fr)"
                    : "repeat(3, 1fr)",
                  gap: isMobile() ? "1rem" : "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#374151",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FiCalendar
                      style={{ color: "#6b7280", marginRight: "0.5rem" }}
                    />
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    name="checkInDate"
                    value={formData.checkInDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    style={{
                      width: "100%",
                      padding: isMobile() ? "1rem" : "0.75rem",
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      color: "#000000",
                      fontSize: isMobile() ? "1rem" : "0.9rem",
                      minHeight: isMobile() ? "48px" : "auto",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "flex",
                      marginBottom: "0.5rem",
                      color: "#374151",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FiCalendar style={{ color: "#6b7280" }} />
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    name="checkOutDate"
                    value={formData.checkOutDate}
                    onChange={handleChange}
                    min={
                      formData.checkInDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    required
                    style={{
                      width: "100%",
                      padding: isMobile() ? "1rem" : "0.75rem",
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      color: "#000000",
                      fontSize: isMobile() ? "1rem" : "0.9rem",
                      minHeight: isMobile() ? "48px" : "auto",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "flex",
                      marginBottom: "0.5rem",
                      color: "#374151",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FiUser style={{ color: "#6b7280" }} />
                    Guests *
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    min="1"
                    max={room?.capacity || 4}
                    required
                    style={{
                      width: "100%",
                      padding: isMobile() ? "1rem" : "0.75rem",
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      color: "#000000",
                      fontSize: isMobile() ? "1rem" : "0.9rem",
                      minHeight: isMobile() ? "48px" : "auto",
                    }}
                  />
                </div>
              </div>

              {/* Personal Information */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile() ? "1fr" : "repeat(2, 1fr)",
                  gap: isMobile() ? "1rem" : "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "flex",
                      marginBottom: "0.5rem",
                      color: "#374151",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FiUser style={{ color: "#6b7280" }} />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    style={{
                      width: "100%",
                      padding: isMobile() ? "1rem" : "0.75rem",
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      color: "#000000",
                      fontSize: isMobile() ? "1rem" : "0.9rem",
                      minHeight: isMobile() ? "48px" : "auto",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "flex",
                      marginBottom: "0.5rem",
                      color: "#374151",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FiMail style={{ color: "#6b7280" }} />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    style={{
                      width: "100%",
                      padding: isMobile() ? "1rem" : "0.75rem",
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      color: "#000000",
                      fontSize: isMobile() ? "1rem" : "0.9rem",
                      minHeight: isMobile() ? "48px" : "auto",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "flex",
                      marginBottom: "0.5rem",
                      color: "#374151",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FiPhone style={{ color: "#6b7280" }} />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                    style={{
                      width: "100%",
                      padding: isMobile() ? "1rem" : "0.75rem",
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      color: "#000000",
                      fontSize: isMobile() ? "1rem" : "0.9rem",
                      minHeight: isMobile() ? "48px" : "auto",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#374151",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                    }}
                  >
                    Payment Method *
                  </label>
                  <select
                    name="payment"
                    value={formData.payment}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: isMobile() ? "1rem" : "0.75rem",
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      color: "#000000",
                      fontSize: isMobile() ? "1rem" : "0.9rem",
                      minHeight: isMobile() ? "48px" : "auto",
                    }}
                  >
                    <option value="card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "#374151",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  Special Requests
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  placeholder="Any special requests or requirements?"
                  rows={isMobile() ? "4" : "3"}
                  style={{
                    width: "100%",
                    padding: isMobile() ? "1rem" : "0.75rem",
                    background: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    color: "#000000",
                    fontSize: isMobile() ? "1rem" : "0.9rem",
                    resize: "vertical",
                    minHeight: isMobile() ? "100px" : "auto",
                  }}
                />
              </div>
            </form>
          </div>

          {/* Right Side - Booking Summary */}
          <div
            id="booking-summary-container"
            style={{
              background: "#000000",
              backdropFilter: "none",
              border: "1px solid #374151",
              borderRadius: "1rem",
              padding: isMobile() ? "1.25rem" : "1.5rem",
              height: "fit-content",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              position: isMobile() ? "static" : "sticky",
              top: isMobile() ? "auto" : "180px",
              order: isMobile() ? 1 : 0,
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              Booking Summary
            </h3>

            {/* Stay Duration */}
            {bookingSummary.nights > 0 && (
              <div
                style={{
                  background: "#374151",
                  border: "1px solid #6b7280",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "700",
                    color: "#ffffff",
                    marginBottom: "0.25rem",
                  }}
                >
                  {bookingSummary.nights}
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#ffffff",
                  }}
                >
                  {bookingSummary.nights === 1 ? "Night" : "Nights"}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 0",
                  borderBottom: "1px solid #374151",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                }}
              >
                <span>Room Type:</span>
                <span style={{ color: "#ffffff", fontWeight: "500" }}>
                  {room?.roomType}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 0",
                  borderBottom: "1px solid #374151",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                }}
              >
                <span>Price per Night:</span>
                <span style={{ color: "#ffffff", fontWeight: "500" }}>
                  {formatPrice(room?.price || 0)}
                </span>
              </div>

              {bookingSummary.nights > 0 && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem 0",
                      borderBottom: "1px solid #374151",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>Number of Nights:</span>
                    <span style={{ color: "#ffffff", fontWeight: "500" }}>
                      {bookingSummary.nights}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem 0",
                      borderBottom: "1px solid #374151",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>Subtotal:</span>
                    <span style={{ color: "#ffffff", fontWeight: "500" }}>
                      {formatPrice(bookingSummary.basePrice)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem 0",
                      borderBottom: "2px solid #374151",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>Tax (10%):</span>
                    <span style={{ color: "#ffffff", fontWeight: "500" }}>
                      {formatPrice(bookingSummary.taxAmount)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem 0 0.5rem",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#ffffff",
                    }}
                  >
                    <span>Total Amount:</span>
                    <span>{formatPrice(bookingSummary.totalPrice)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Amenities */}
            {room?.amenities && room.amenities.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h4
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#ffffff",
                    marginBottom: "0.75rem",
                  }}
                >
                  Included Amenities
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile() ? "1fr" : "repeat(2, 1fr)",
                    gap: isMobile() ? "0.75rem" : "0.5rem",
                  }}
                >
                  {room.amenities.slice(0, 6).map((amenity, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#ffffff",
                        fontSize: "0.8rem",
                      }}
                    >
                      <FiCheck
                        style={{ color: "#ffffff", fontSize: "0.7rem" }}
                      />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Book Button */}
            <button
              type="button"
              onClick={() => {
                if (validateBooking()) {
                  setShowPayment(true);
                  if (isMobile()) {
                    scrollToTop();
                  }
                }
              }}
              disabled={loading || bookingSummary.nights === 0}
              style={{
                width: "100%",
                padding: isMobile() ? "1.25rem" : "1rem",
                background: bookingSummary.nights === 0 ? "#374151" : "#ffffff",
                border: "1px solid #ffffff",
                borderRadius: "0.75rem",
                color: bookingSummary.nights === 0 ? "#9ca3af" : "#000000",
                fontSize: isMobile() ? "1.1rem" : "1rem",
                fontWeight: "600",
                cursor: bookingSummary.nights === 0 ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                minHeight: isMobile() ? "56px" : "auto",
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      borderTop: "2px solid #fff",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Processing...
                </>
              ) : (
                <>
                  <FiCreditCard />
                  {bookingSummary.nights === 0
                    ? "Select Dates to Continue"
                    : "Proceed to Payment"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingPage;
