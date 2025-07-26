import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiStar,
  FiInfo,
  FiShoppingCart,
  FiEye,
  FiHeart,
  FiTrendingUp,
  FiUser,
  FiFilter,
  FiCalendar,
  FiUsers,
  FiSearch,
  FiSliders,
  FiCpu,
  FiTarget,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import RoomDetailsModal from "../components/RoomDetailsModal";
import { getRoomImageUrl, handleImageError } from "../utils/imageUtils";
// import RoomRecommendationExplainer from '../components/RoomRecommendationExplainer';

// Add responsive styles for RoomPage
const responsiveStyles = `
  /* Price badge color override - only for price badges */
  .room-price-badge,
  .room-price-badge *,
  .room-price-badge span,
  .room-price-badge small {
    color: #ffffff !important;
  }

  /* Check availability button styling */
  .check-availability-btn {
    background: #000000 !important;
    color: #ffffff !important;
  }

  .check-availability-btn:disabled {
    background: #cccccc !important;
    color: #666666 !important;
  }

  @media (max-width: 768px) {
    .room-page-hero {
      padding: 1.5rem 1rem 1rem !important;
    }
    .room-page-title {
      font-size: 2rem !important;
    }
    .room-page-subtitle {
      font-size: 0.9rem !important;
    }
    .room-page-tabs {
      flex-direction: column !important;
      gap: 0.5rem !important;
    }
    .room-page-tab-button {
      padding: 0.625rem 1rem !important;
      font-size: 0.8rem !important;
    }
    .room-page-filters {
      margin: 0 1rem 1.5rem !important;
      padding: 1rem !important;
    }
    .room-page-filters-grid {
      grid-template-columns: 1fr !important;
      gap: 0.75rem !important;
    }
    .room-page-grid {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
      margin: 0 1rem 2rem 1rem !important;
    }
    .room-page-card {
      margin: 0 !important;
    }
    .room-page-card-content {
      padding: 1.25rem !important;
    }
    .room-page-card-title {
      font-size: 1.1rem !important;
    }
    .room-page-card-description {
      font-size: 0.85rem !important;
    }
    .room-page-badge {
      padding: 0.375rem 0.625rem !important;
      font-size: 0.75rem !important;
    }
    .room-page-button {
      padding: 0.625rem 1rem !important;
      font-size: 0.85rem !important;
    }
    .room-page-amenity {
      font-size: 0.7rem !important;
      padding: 0.25rem 0.5rem !important;
    }
  }

  @media (max-width: 1024px) and (min-width: 769px) {
    .room-page-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 1.25rem !important;
    }
  }

  /* Ensure mobile always shows 1 column */
  @media (max-width: 768px) {
    .room-page-grid {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
      margin: 0 1rem 2rem 1rem !important;
    }
  }

  @media (max-width: 480px) {
    .room-page-hero {
      padding: 1rem 0.75rem 0.75rem !important;
    }
    .room-page-title {
      font-size: 1.75rem !important;
    }
    .room-page-subtitle {
      font-size: 0.85rem !important;
    }
    .room-page-filters {
      margin: 0 0.75rem 1.25rem !important;
      padding: 0.75rem !important;
    }
    .room-page-grid {
      margin: 0 0.75rem !important;
      gap: 0.75rem !important;
    }
    .room-page-card-content {
      padding: 1rem !important;
    }
    .room-page-card-title {
      font-size: 1rem !important;
    }
    .room-page-card-description {
      font-size: 0.8rem !important;
    }
    .room-page-badge {
      padding: 0.25rem 0.5rem !important;
      font-size: 0.7rem !important;
    }
    .room-page-button {
      padding: 0.5rem 0.75rem !important;
      font-size: 0.8rem !important;
    }
    .room-page-amenity {
      font-size: 0.65rem !important;
      padding: 0.2rem 0.4rem !important;
    }
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = responsiveStyles;
  document.head.appendChild(styleElement);
}

const RoomPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [popularRooms, setPopularRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    priceRange: "",
    roomType: "",
    capacity: "",
    amenities: [],
    bedType: "",
    floor: "",
    petFriendly: false,
    smokingAllowed: false,
    availability: false,
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [user, setUser] = useState(null);
  const [bookingValidation, setBookingValidation] = useState({
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
    errors: [],
  });

  const [availabilityStatus, setAvailabilityStatus] = useState({
    isChecking: false,
    hasChecked: false,
    availableRooms: [],
    message: "",
  });

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      setUser({ id: userId, token });
    }
  }, []);

  // Fetch all rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const apiUrl =
          process.env.REACT_APP_API_BASE_URL ||
          "https://hrms-bace.vercel.app/api";
        const response = await axios.get(`${apiUrl}/rooms`);
        console.log("Fetched rooms data:", response.data);
        console.log("First room structure:", response.data[0]);
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
        const apiUrl =
          process.env.REACT_APP_API_BASE_URL ||
          "https://hrms-bace.vercel.app/api";
        const response = await axios.get(`${apiUrl}/rooms/popular?count=6`);
        if (response.data.success) {
          setPopularRooms(response.data.popularRooms);
        }
      } catch (error) {
        console.error("Error fetching popular rooms:", error);
      }
    };

    fetchPopularRooms();
  }, []);

  // Fetch personalized recommendations for logged-in users
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.id || !user?.token) return;

      setRecommendationsLoading(true);
      try {
        const apiUrl =
          process.env.REACT_APP_API_BASE_URL ||
          "https://hrms-bace.vercel.app/api";
        const response = await axios.get(
          `${apiUrl}/rooms/recommendations/${user.id}?count=8`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        if (response.data.success) {
          console.log(
            "RoomPage - Fetched recommendations:",
            response.data.recommendations.length,
            response.data.recommendations
          );
          setRecommendedRooms(response.data.recommendations);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  // Record room interaction when user views details
  const recordInteraction = async (
    roomId,
    interactionType,
    additionalData = {}
  ) => {
    if (!user?.id || !user?.token) return;

    try {
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      await axios.post(
        `${apiUrl}/rooms/interactions`,
        {
          userId: user.id,
          roomId,
          interactionType,
          ...additionalData,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
    } catch (error) {
      console.error("Error recording interaction:", error);
    }
  };

  const handleViewDetails = (room, roomItem = null) => {
    setSelectedRoom(room);
    const roomId = room._id || (roomItem && roomItem.roomId);
    if (roomId) {
      recordInteraction(roomId, "view");
    }
  };

  const handleCloseModal = () => {
    setSelectedRoom(null);
  };

  // Filter rooms based on active filters
  const getFilteredRooms = (roomList) => {
    console.log("getFilteredRooms called with:", roomList.length, "rooms");
    console.log("Current filters:", filters);

    return roomList.filter((room) => {
      const roomData = room.roomDetails || room;
      console.log(
        "Processing room:",
        roomData.roomNumber || roomData._id,
        "with capacity:",
        roomData.capacity
      );

      // Price range filter
      if (filters.priceRange) {
        const price = roomData.price;
        switch (filters.priceRange) {
          case "budget":
            if (price > 5000) return false;
            break;
          case "standard":
            if (price < 5001 || price > 10000) return false;
            break;
          case "premium":
            if (price < 10001 || price > 20000) return false;
            break;
          case "luxury":
            if (price < 20001) return false;
            break;
          default:
            // No price filter applied
            break;
        }
      }

      // Room type filter
      if (filters.roomType && roomData.roomType !== filters.roomType) {
        return false;
      }

      // Capacity filter - show rooms with EXACT capacity match
      if (filters.capacity) {
        // Try different possible capacity field names
        const capacity =
          roomData.capacity ||
          roomData.maxGuests ||
          roomData.maxOccupancy ||
          roomData.guestCapacity ||
          2;
        const selectedGuests = parseInt(filters.capacity);

        console.log(
          `Filtering room ${
            roomData.roomNumber || roomData._id
          }: capacity=${capacity}, selectedGuests=${selectedGuests}`
        );
        console.log("Full room data:", roomData);

        // For "8+ Guests", show rooms with capacity >= 8
        if (selectedGuests === 8) {
          if (capacity < 8) {
            console.log(
              `Room ${
                roomData.roomNumber || roomData._id
              } filtered out: capacity ${capacity} < 8`
            );
            return false;
          }
        } else {
          // For specific guest counts, show ONLY rooms with exact capacity match
          if (capacity !== selectedGuests) {
            console.log(
              `Room ${
                roomData.roomNumber || roomData._id
              } filtered out: capacity ${capacity} !== selectedGuests ${selectedGuests}`
            );
            return false;
          }
        }

        console.log(
          `Room ${roomData.roomNumber || roomData._id} passed capacity filter`
        );
      }

      // Bed type filter
      if (filters.bedType && roomData.bedType !== filters.bedType) {
        return false;
      }

      // Floor filter
      if (filters.floor && roomData.floor !== parseInt(filters.floor)) {
        return false;
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const roomAmenities = roomData.amenities || [];
        const hasAllAmenities = filters.amenities.every((amenity) =>
          roomAmenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      // Pet friendly filter
      if (filters.petFriendly && !roomData.petFriendly) {
        return false;
      }

      // Smoking allowed filter
      if (filters.smokingAllowed && !roomData.smokingAllowed) {
        return false;
      }

      // Availability filter - only show available rooms when availability check was performed
      if (filters.availability && availabilityStatus.hasChecked) {
        const roomId = roomData._id;
        const isAvailable = availabilityStatus.availableRooms.includes(roomId);

        console.log(
          `Availability filter for room ${roomData.roomNumber || roomId}: ${
            isAvailable ? "Available" : "Not Available"
          }`
        );

        if (!isAvailable) {
          return false;
        }
      }

      return true;
    });
  };

  // Handle amenity filter changes
  const handleAmenityFilter = (amenity) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      priceRange: "",
      roomType: "",
      capacity: "",
      amenities: [],
      bedType: "",
      floor: "",
      petFriendly: false,
      smokingAllowed: false,
      availability: false,
    });
    // Reset availability status when clearing filters
    setAvailabilityStatus({
      isChecking: false,
      hasChecked: false,
      availableRooms: [],
      message: "",
    });
  };

  // Validate booking dates
  const validateBookingDates = () => {
    const errors = [];
    const checkIn = new Date(bookingValidation.checkInDate);
    const checkOut = new Date(bookingValidation.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!bookingValidation.checkInDate) {
      errors.push("Please select a check-in date");
    } else if (checkIn < today) {
      errors.push("Check-in date cannot be in the past");
    }

    if (!bookingValidation.checkOutDate) {
      errors.push("Please select a check-out date");
    } else if (checkOut <= checkIn) {
      errors.push("Check-out date must be after check-in date");
    }

    if (bookingValidation.guests < 1 || bookingValidation.guests > 10) {
      errors.push("Number of guests must be between 1 and 10");
    }

    setBookingValidation((prev) => ({ ...prev, errors }));
    return errors.length === 0;
  };

  // Handle availability check
  const handleCheckAvailability = async () => {
    if (!validateBookingDates()) {
      return;
    }

    setAvailabilityStatus({
      isChecking: true,
      hasChecked: false,
      availableRooms: [],
      message: "",
    });

    try {
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/rooms/availability`, {
        params: {
          checkInDate: bookingValidation.checkInDate,
          checkOutDate: bookingValidation.checkOutDate,
        },
      });

      const availableRooms = response.data
        .filter((item) => item.isAvailable)
        .map((item) => item.room._id);

      // If guests are specified, filter available rooms by capacity
      let finalAvailableRooms = availableRooms;
      if (bookingValidation.guests) {
        const availableRoomDetails = response.data
          .filter((item) => item.isAvailable)
          .map((item) => item.room);

        console.log(
          "Available room details before capacity filtering:",
          availableRoomDetails
        );
        console.log(
          "Looking for rooms with capacity:",
          bookingValidation.guests
        );

        finalAvailableRooms = availableRoomDetails
          .filter((room) => {
            const capacity =
              room.capacity ||
              room.maxGuests ||
              room.maxOccupancy ||
              room.guestCapacity ||
              2;

            console.log(
              `Room ${
                room.roomNumber || room._id
              }: capacity=${capacity}, matches=${
                capacity === bookingValidation.guests
              }`
            );
            return capacity === bookingValidation.guests;
          })
          .map((room) => room._id);

        console.log(
          "Final available rooms after capacity filtering:",
          finalAvailableRooms
        );
      }

      const guestText = bookingValidation.guests
        ? ` for ${bookingValidation.guests} guest${
            bookingValidation.guests > 1 ? "s" : ""
          }`
        : "";

      setAvailabilityStatus({
        isChecking: false,
        hasChecked: true,
        availableRooms: finalAvailableRooms,
        message:
          finalAvailableRooms.length > 0
            ? `${finalAvailableRooms.length} room${
                finalAvailableRooms.length > 1 ? "s" : ""
              } available${guestText} for your selected dates!`
            : `No rooms available${guestText} for the selected dates. Please try different dates or guest count.`,
      });

      // Update filters to show availability and apply capacity filter if guests are selected
      const newCapacityFilter = bookingValidation.guests
        ? bookingValidation.guests.toString()
        : "";

      setFilters((prev) => ({
        ...prev,
        availability: true,
        capacity: newCapacityFilter,
      }));

      console.log("Availability check completed:", {
        allAvailableRooms: availableRooms,
        finalAvailableRooms: finalAvailableRooms,
        totalAvailable: finalAvailableRooms.length,
        guestsSelected: bookingValidation.guests,
        capacityFilter: newCapacityFilter,
        filtersApplied: { availability: true, capacity: newCapacityFilter },
      });
    } catch (error) {
      console.error("Error checking availability:", error);
      setAvailabilityStatus({
        isChecking: false,
        hasChecked: true,
        availableRooms: [],
        message: "Unable to check availability. Please try again.",
      });
    }
  };

  // Enhanced room booking handler - Always allow booking, let user fill details manually
  const handleBookRoom = async (room, roomItem = null) => {
    const { checkInDate, checkOutDate, guests } = bookingValidation;

    try {
      // Handle different room object structures (recommended vs regular rooms)
      let roomId, roomDetails;

      if (roomItem) {
        // For recommended rooms, try multiple ways to get the room ID
        roomId = room._id || roomItem.roomId || roomItem._id;
        roomDetails = room.roomDetails || room;

        // Special handling for recommended rooms where roomId might be in different places
        if (!roomId && roomItem.roomDetails && roomItem.roomDetails._id) {
          roomId = roomItem.roomDetails._id;
        }
      } else {
        // For regular rooms
        roomId = room._id || room.roomId;
        roomDetails = room;
      }

      // Ensure roomId is a string, not an object
      if (typeof roomId === "object" && roomId !== null) {
        if (roomId._id) {
          roomId = roomId._id;
        } else if (roomId.toString && roomId.toString() !== "[object Object]") {
          roomId = roomId.toString();
        } else {
          console.error("Room ID is an object without _id property:", roomId);
          roomId = null;
        }
      }

      console.log("Booking attempt:", {
        room,
        roomItem,
        roomId,
        roomIdType: typeof roomId,
        roomDetails,
        activeTab,
      });

      if (!roomId) {
        console.error("Room ID is undefined:", {
          room,
          roomItem,
          activeTab,
          roomKeys: Object.keys(room),
          roomItemKeys: roomItem ? Object.keys(roomItem) : null,
        });
        alert("Unable to book this room. Room ID not found. Please try again.");
        return;
      }

      if (!roomDetails || !roomDetails.roomType) {
        console.error("Room details are incomplete:", {
          roomDetails,
          room,
          roomItem,
        });
        alert(
          "Unable to book this room. Room details are incomplete. Please try again."
        );
        return;
      }

      // Record booking interaction
      await recordInteraction(roomId, "booking", {
        checkInDate: checkInDate || null,
        checkOutDate: checkOutDate || null,
        guests: guests || 1,
        roomType: roomDetails.roomType,
        price: roomDetails.price,
      });

      // Clear any previous validation errors
      setBookingValidation((prev) => ({ ...prev, errors: [] }));

      // Navigate to booking page with room details (dates optional)
      const bookingData = {
        roomId: roomId,
        roomName: roomDetails.roomName || `Room ${roomDetails.roomNumber}`,
        roomType: roomDetails.roomType,
        roomImage: getRoomImageUrl(roomDetails.image),
        price: roomDetails.price,
        capacity: roomDetails.capacity,
        amenities: roomDetails.amenities,
        checkInDate: checkInDate || "", // Pass empty string if no date selected
        checkOutDate: checkOutDate || "", // Pass empty string if no date selected
        guests: guests || 1,
      };

      // Final validation before navigation
      const finalRoomId = String(roomId);
      if (
        finalRoomId === "undefined" ||
        finalRoomId === "null" ||
        finalRoomId === "[object Object]"
      ) {
        console.error("Invalid room ID for navigation:", roomId);
        alert("Unable to book this room. Invalid room ID. Please try again.");
        return;
      }

      console.log("Booking room with ID:", finalRoomId);
      console.log("Navigating to:", `/booking-page/${finalRoomId}`);
      console.log("Booking data:", bookingData);

      localStorage.setItem("roomBookingData", JSON.stringify(bookingData));
      navigate(`/booking-page/${finalRoomId}`);
    } catch (error) {
      console.error("Error during booking process:", error);
      setBookingValidation((prev) => ({
        ...prev,
        errors: [
          error.message ||
            "An error occurred while processing your booking. Please try again.",
        ],
      }));
    }
  };

  // Get current rooms to display based on active tab
  const getCurrentRooms = () => {
    let result;
    switch (activeTab) {
      case "recommended":
        result = getFilteredRooms(recommendedRooms);
        console.log(
          "RoomPage - Recommended rooms after filtering:",
          result.length,
          "from",
          recommendedRooms.length
        );
        break;
      case "popular":
        result = getFilteredRooms(popularRooms);
        console.log(
          "RoomPage - Popular rooms after filtering:",
          result.length,
          "from",
          popularRooms.length
        );
        break;
      default:
        result = getFilteredRooms(rooms);
        console.log(
          "RoomPage - All rooms after filtering:",
          result.length,
          "from",
          rooms.length
        );
        break;
    }
    return result;
  };

  // Get price in Pakistani Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get recommendation reason badge
  const getRecommendationBadge = (reason, confidence, score) => {
    const badges = {
      svd_collaborative_filtering: {
        text: "🤖 AI Model",
        color: "primary",
        icon: <FiCpu size={12} />,
        description: "Real SVD Machine Learning",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      real_svd_collaborative_filtering: {
        text: "🤖 AI Model",
        color: "primary",
        icon: <FiCpu size={12} />,
        description: "Real SVD Algorithm",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      collaborative_filtering: {
        text: "👥 Similar Users",
        color: "success",
        icon: <FiUser size={12} />,
        description: "Users like you loved this",
        gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      },
      content_based: {
        text: "❤️ Your Taste",
        color: "info",
        icon: <FiHeart size={12} />,
        description: "Matches your preferences",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      popularity: {
        text: "🔥 Trending",
        color: "warning",
        icon: <FiTrendingUp size={12} />,
        description: "Popular choice",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      },
      hybrid: {
        text: "⭐ Perfect Match",
        color: "primary",
        icon: <FiStar size={12} />,
        description: "Multi-algorithm recommendation",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
    };

    const badge = badges[reason] || badges.popularity;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(10px)",
          borderRadius: "0.75rem",
          padding: "0.75rem",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            background: badge.gradient,
            color: "white",
            padding: "0.4rem 0.8rem",
            borderRadius: "0.5rem",
            fontSize: "0.75rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          {badge.icon}
          {badge.text}
        </div>
        {score && (
          <div
            style={{
              background: "#f3f4f6",
              color: "#374151",
              padding: "0.3rem 0.6rem",
              borderRadius: "0.4rem",
              fontSize: "0.7rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              border: "1px solid #d1d5db",
            }}
          >
            <FiTarget size={10} />
            {score.toFixed(1)} rating
          </div>
        )}
        {confidence && (
          <div
            style={{
              color: "#6b7280",
              fontSize: "0.65rem",
              fontWeight: "500",
              textAlign: "center",
              opacity: 0.9,
            }}
          >
            {confidence} confidence
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Header />
      <div
        style={{
          background: "#ffffff",
          minHeight: "100vh",
          position: "relative",
          width: "100%",
          margin: 0,
          padding: 0,
          paddingTop: "80px",
        }}
      >
        {/* Main Content */}
        <div
          style={{
            position: "relative",
            width: "100%",
            margin: "0",
            padding: "2rem 1.5rem 1.5rem",
          }}
        >
          {/* Hero Section */}
          <div
            className="room-page-hero"
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              padding: "1rem 0",
            }}
          >
            <h1
              className="room-page-title"
              style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#000000",
                marginBottom: "1rem",
                lineHeight: "1.2",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Premium Rooms
            </h1>
            <p
              className="room-page-subtitle"
              style={{
                fontSize: "1.125rem",
                color: "#6b7280",
                margin: "0",
                lineHeight: "1.5",
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Experience unparalleled comfort and elegance in our premium rooms
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div
              style={{
                background: "rgba(255, 107, 157, 0.1)",
                border: "1px solid rgba(255, 107, 157, 0.3)",
                borderRadius: "1rem",
                padding: "1rem",
                marginBottom: "2rem",
                color: "#ff6b9d",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FiInfo />
              {error}
            </div>
          )}

          {/* Modern Filters and Tabs */}
          <div
            className="room-page-filters"
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "1rem",
              padding: "1.5rem",
              marginBottom: "2rem",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Tabs */}
            <div
              className="room-page-tabs"
              style={{
                display: "flex",
                gap: "0.75rem",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              <button
                className="room-page-tab-button"
                onClick={() => setActiveTab("all")}
                style={{
                  padding: "0.75rem 1rem",
                  background: activeTab === "all" ? "#000000" : "#f3f4f6",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: activeTab === "all" ? "#ffffff" : "#374151",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <FiFilter size={14} />
                All Rooms ({rooms.length})
              </button>

              {user && (
                <button
                  className="room-page-tab-button"
                  onClick={() => setActiveTab("recommended")}
                  style={{
                    padding: "0.75rem 1rem",
                    background:
                      activeTab === "recommended" ? "#000000" : "#f3f4f6",
                    border: "none",
                    borderRadius: "0.5rem",
                    color: activeTab === "recommended" ? "#ffffff" : "#374151",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <FiHeart size={14} />
                  For You ({recommendedRooms.length})
                  {recommendationsLoading && (
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        borderTop: "2px solid #fff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  )}
                </button>
              )}

              <button
                className="room-page-tab-button"
                onClick={() => setActiveTab("popular")}
                style={{
                  padding: "0.75rem 1rem",
                  background: activeTab === "popular" ? "#000000" : "#f3f4f6",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: activeTab === "popular" ? "#ffffff" : "#374151",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <FiTrendingUp size={14} />
                Popular ({popularRooms.length})
              </button>
            </div>

            {/* Quick Filters */}
            <div
              className="room-page-filters-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "0.75rem",
                alignItems: "end",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "#374151",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) =>
                    setFilters({ ...filters, priceRange: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    color: "#000000",
                    fontSize: "0.875rem",
                    fontFamily: "Inter, sans-serif",
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem",
                  }}
                >
                  <option
                    value=""
                    style={{ background: "#ffffff", color: "#000000" }}
                  >
                    All Prices
                  </option>
                  <option
                    value="budget"
                    style={{ background: "#ffffff", color: "#000000" }}
                  >
                    Budget (≤ Rs. 5,000)
                  </option>
                  <option
                    value="standard"
                    style={{ background: "#ffffff", color: "#000000" }}
                  >
                    Standard (Rs. 5,001-10,000)
                  </option>
                  <option
                    value="premium"
                    style={{ background: "#ffffff", color: "#000000" }}
                  >
                    Premium (Rs. 10,001-20,000)
                  </option>
                  <option
                    value="luxury"
                    style={{ background: "#ffffff", color: "#000000" }}
                  >
                    Luxury (Rs. 20,001+)
                  </option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "#374151",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Room Type
                </label>
                <select
                  value={filters.roomType}
                  onChange={(e) =>
                    setFilters({ ...filters, roomType: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    color: "#000000",
                    fontSize: "0.875rem",
                    fontFamily: "Inter, sans-serif",
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem",
                  }}
                >
                  <option
                    value=""
                    style={{ background: "#ffffff", color: "#000000" }}
                  >
                    All Types
                  </option>
                  <option
                    value="Single"
                    style={{ background: "#ffffff", color: "#000000" }}
                  >
                    Single
                  </option>
                  <option
                    value="Double"
                    style={{ background: "#ffffff", color: "#000000" }}
                  >
                    Double
                  </option>
                  <option
                    value="Twin"
                    style={{ background: "#ffffff", color: "#000000" }}
                  >
                    Twin
                  </option>
                  <option
                    value="Suite"
                    style={{ background: "#ffffff", color: "#000000" }}
                  >
                    Suite
                  </option>
                  <option
                    value="Family"
                    style={{ background: "#ffffff", color: "#000000" }}
                  >
                    Family
                  </option>
                  <option
                    value="Deluxe"
                    style={{ background: "#ffffff", color: "#000000" }}
                  >
                    Deluxe
                  </option>
                  <option
                    value="Presidential"
                    style={{ background: "#ffffff", color: "#000000" }}
                  >
                    Presidential
                  </option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  style={{
                    padding: "0.75rem 1rem",
                    background: "#f3f4f6",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    color: "#374151",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <FiSliders size={14} />
                  {showAdvancedFilters ? "Less" : "More"}
                </button>

                {Object.values(filters).some(
                  (v) => v && (Array.isArray(v) ? v.length > 0 : true)
                ) && (
                  <button
                    onClick={clearFilters}
                    style={{
                      padding: "0.75rem 1rem",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "0.5rem",
                      color: "#dc2626",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {!user && activeTab === "recommended" && (
            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #fbbf24",
                borderRadius: "1rem",
                padding: "1rem",
                marginBottom: "2rem",
                color: "#92400e",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FiInfo />
              <div>
                <strong>Login Required:</strong> Please{" "}
                <Link
                  to="/login"
                  style={{ color: "#92400e", textDecoration: "underline" }}
                >
                  login
                </Link>{" "}
                to see personalized room recommendations.
              </div>
            </div>
          )}

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "1.5rem",
                padding: "2rem",
                marginBottom: "3rem",
                animation: "slideInUp 0.8s ease-out 0.6s both",
              }}
            >
              <h3
                style={{
                  color: "#000000",
                  marginBottom: "1.5rem",
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Advanced Filters
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "2rem",
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
                    }}
                  >
                    Capacity
                  </label>
                  <select
                    value={filters.capacity}
                    onChange={(e) => {
                      console.log(
                        "Capacity filter changed to:",
                        e.target.value
                      );
                      setFilters({ ...filters, capacity: e.target.value });
                    }}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      color: "#000000",
                      fontSize: "0.875rem",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <option value="">Any Capacity</option>
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5 Guests</option>
                    <option value="6">6 Guests</option>
                    <option value="8">8+ Guests</option>
                  </select>
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
                    Bed Type
                  </label>
                  <select
                    value={filters.bedType}
                    onChange={(e) =>
                      setFilters({ ...filters, bedType: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.75rem",
                      color: "#000000",
                      fontSize: "0.9rem",
                    }}
                  >
                    <option value="">Any Bed Type</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Queen">Queen</option>
                    <option value="King">King</option>
                    <option value="Twin">Twin</option>
                  </select>
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
                    Floor
                  </label>
                  <select
                    value={filters.floor}
                    onChange={(e) =>
                      setFilters({ ...filters, floor: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.75rem",
                      color: "#000000",
                      fontSize: "0.9rem",
                    }}
                  >
                    <option value="">Any Floor</option>
                    <option value="1">1st Floor</option>
                    <option value="2">2nd Floor</option>
                    <option value="3">3rd Floor</option>
                    <option value="4">4th Floor</option>
                  </select>
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
                    Special Requirements
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#374151",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.petFriendly}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            petFriendly: e.target.checked,
                          })
                        }
                        style={{ accentColor: "#000000" }}
                      />
                      Pet Friendly
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#374151",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.smokingAllowed}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            smokingAllowed: e.target.checked,
                          })
                        }
                        style={{ accentColor: "#000000" }}
                      />
                      Smoking Allowed
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "1rem",
                    color: "#374151",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  Amenities
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  {[
                    "WiFi",
                    "AC",
                    "TV",
                    "Minibar",
                    "Balcony",
                    "Sea View",
                    "City View",
                    "Room Service",
                    "Jacuzzi",
                    "Kitchen",
                    "Workspace",
                    "Parking",
                  ].map((amenity) => (
                    <label
                      key={amenity}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#374151",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        padding: "0.5rem",
                        background: filters.amenities.includes(amenity)
                          ? "#f0f9ff"
                          : "#ffffff",
                        borderRadius: "0.5rem",
                        border: filters.amenities.includes(amenity)
                          ? "1px solid #0ea5e9"
                          : "1px solid #e2e8f0",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity)}
                        onChange={() => handleAmenityFilter(amenity)}
                        style={{ accentColor: "#000000" }}
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Booking Validation Form */}
          <div
            className="booking-form"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "1rem",
              padding: "1.5rem",
              marginBottom: "2rem",
              animation: "slideInUp 0.8s ease-out 0.8s both",
            }}
          >
            <h3
              style={{
                color: "#000000",
                marginBottom: "1rem",
                fontSize: "1.1rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <FiCalendar size={16} />
              Check Availability & Book
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "0.75rem",
                alignItems: "end",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.4rem",
                    color: "#374151",
                    fontSize: "0.8rem",
                    fontWeight: "500",
                  }}
                >
                  Check-in Date *
                </label>
                <input
                  type="date"
                  value={bookingValidation.checkInDate}
                  min={new Date().toISOString().split("T")[0]}
                  max={
                    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(e) =>
                    setBookingValidation((prev) => ({
                      ...prev,
                      checkInDate: e.target.value,
                      errors: [],
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    background: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    color: "#000000",
                    fontSize: "0.8rem",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.4rem",
                    color: "#374151",
                    fontSize: "0.8rem",
                    fontWeight: "500",
                  }}
                >
                  Check-out Date *
                </label>
                <input
                  type="date"
                  value={bookingValidation.checkOutDate}
                  min={
                    bookingValidation.checkInDate ||
                    new Date().toISOString().split("T")[0]
                  }
                  max={
                    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(e) =>
                    setBookingValidation((prev) => ({
                      ...prev,
                      checkOutDate: e.target.value,
                      errors: [],
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    background: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    color: "#000000",
                    fontSize: "0.8rem",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.4rem",
                    color: "#374151",
                    fontSize: "0.8rem",
                    fontWeight: "500",
                  }}
                >
                  Number of Guests *
                </label>
                <input
                  type="number"
                  value={bookingValidation.guests}
                  min="1"
                  max="10"
                  onChange={(e) =>
                    setBookingValidation((prev) => ({
                      ...prev,
                      guests: parseInt(e.target.value) || 1,
                      errors: [],
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    background: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    color: "#000000",
                    fontSize: "0.8rem",
                  }}
                />
                <small style={{ color: "#6b7280", fontSize: "0.7rem" }}>
                  Max 10 guests
                </small>
              </div>

              <button
                className="check-availability-btn"
                onClick={handleCheckAvailability}
                disabled={
                  !bookingValidation.checkInDate ||
                  !bookingValidation.checkOutDate
                }
                style={{
                  padding: "0.75rem 1rem",
                  background:
                    !bookingValidation.checkInDate ||
                    !bookingValidation.checkOutDate
                      ? "#cccccc"
                      : "#000000",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor:
                    !bookingValidation.checkInDate ||
                    !bookingValidation.checkOutDate
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <FiSearch size={14} />
                {availabilityStatus.isChecking
                  ? "Checking..."
                  : "Check Availability"}
              </button>
            </div>

            {/* Validation Errors */}
            {bookingValidation.errors.length > 0 && (
              <div
                style={{
                  background: "rgba(255, 107, 157, 0.1)",
                  border: "1px solid rgba(255, 107, 157, 0.3)",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  marginBottom: "1rem",
                  color: "#ff6b9d",
                }}
              >
                <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                  {bookingValidation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Availability Status */}
            {availabilityStatus.hasChecked && availabilityStatus.message && (
              <div
                style={{
                  background:
                    availabilityStatus.availableRooms.length > 0
                      ? "rgba(34, 197, 94, 0.1)"
                      : "rgba(239, 68, 68, 0.1)",
                  border:
                    availabilityStatus.availableRooms.length > 0
                      ? "1px solid rgba(34, 197, 94, 0.3)"
                      : "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  marginBottom: "1rem",
                  color:
                    availabilityStatus.availableRooms.length > 0
                      ? "#059669"
                      : "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {availabilityStatus.availableRooms.length > 0 ? (
                  <FiCheck size={16} />
                ) : (
                  <FiX size={16} />
                )}
                {availabilityStatus.message}
              </div>
            )}

            {/* Booking Summary */}
            {bookingValidation.checkInDate &&
              bookingValidation.checkOutDate &&
              bookingValidation.errors.length === 0 && (
                <div
                  style={{
                    background: "#f0f9ff",
                    border: "1px solid #0ea5e9",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    color: "#0c4a6e",
                  }}
                >
                  <strong>Booking Details:</strong> {bookingValidation.guests}{" "}
                  guest(s) from{" "}
                  {new Date(bookingValidation.checkInDate).toLocaleDateString()}{" "}
                  to{" "}
                  {new Date(
                    bookingValidation.checkOutDate
                  ).toLocaleDateString()}{" "}
                  (
                  {Math.ceil(
                    (new Date(bookingValidation.checkOutDate) -
                      new Date(bookingValidation.checkInDate)) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  night(s))
                </div>
              )}
          </div>

          {/* Mobile-specific CSS override */}
          <style>
            {`
              @media (max-width: 768px) {
                .room-page-grid {
                  grid-template-columns: 1fr !important;
                  gap: 1rem !important;
                  padding: 0 1rem !important;
                  max-width: 100% !important;
                }

                .room-page-grid > div {
                  max-width: 100% !important;
                  margin: 0 auto !important;
                }
              }

              @media (max-width: 480px) {
                .room-page-grid {
                  grid-template-columns: 1fr !important;
                  gap: 1rem !important;
                  padding: 0 0.5rem !important;
                  max-width: 100% !important;
                }

                .room-page-grid > div {
                  max-width: 100% !important;
                  margin: 0 auto !important;
                }
              }
            `}
          </style>

          {/* Rooms Grid */}
          <div
            className="room-page-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
              maxWidth: "1400px",
              margin: "0 auto 2rem auto",
            }}
          >
            {loading
              ? Array(6)
                  .fill()
                  .map((_, index) => (
                    <div
                      key={index}
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(17, 34, 64, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "1.5rem",
                        overflow: "hidden",
                        height: "500px",
                        animation: "pulse 2s ease-in-out infinite",
                      }}
                    >
                      <div
                        style={{
                          height: "250px",
                          background:
                            "linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                          animation: "shimmer 2s ease-in-out infinite",
                        }}
                      />
                      <div style={{ padding: "1.5rem" }}>
                        <div
                          style={{
                            height: "1.5rem",
                            background: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "0.5rem",
                            marginBottom: "1rem",
                            animation: "shimmer 2s ease-in-out infinite",
                          }}
                        />
                        <div
                          style={{
                            height: "1rem",
                            background: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "0.5rem",
                            marginBottom: "0.5rem",
                            width: "80%",
                            animation: "shimmer 2s ease-in-out infinite",
                          }}
                        />
                        <div
                          style={{
                            height: "1rem",
                            background: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "0.5rem",
                            width: "60%",
                            animation: "shimmer 2s ease-in-out infinite",
                          }}
                        />
                      </div>
                    </div>
                  ))
              : getCurrentRooms().map((roomItem, index) => {
                  // Handle different room structures based on tab
                  let room;
                  if (activeTab === "recommended") {
                    // For recommended rooms, use the room properties directly or from roomDetails
                    room = roomItem.roomDetails || roomItem;
                    // Ensure we have the roomId available as a string
                    if (!room._id && roomItem.roomId) {
                      // Make sure roomId is a string, not an object
                      const roomId =
                        typeof roomItem.roomId === "object"
                          ? roomItem.roomId._id || roomItem.roomId.toString()
                          : roomItem.roomId;
                      room._id = roomId;
                    }
                  } else {
                    // For regular and popular rooms
                    room = roomItem.roomDetails || roomItem;
                  }

                  const isRecommended = activeTab === "recommended";
                  const isPopular = activeTab === "popular";

                  // Debug logging for room structure
                  console.log("Room item structure:", {
                    roomItem,
                    room,
                    roomId: room._id || roomItem.roomId,
                    activeTab,
                    hasRoomDetails: !!roomItem.roomDetails,
                  });

                  return (
                    <div
                      key={room._id || roomItem.roomId}
                      className="room-page-card"
                      style={{
                        background: "#ffffff",
                        border: isRecommended
                          ? "2px solid #0ea5e9"
                          : "1px solid #e5e7eb",
                        borderRadius: "12px",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        animation: `slideInUp 0.8s ease-out ${
                          1 + index * 0.1
                        }s both`,
                        position: "relative",
                        boxShadow: isRecommended
                          ? "0 4px 20px rgba(14, 165, 233, 0.15)"
                          : "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 25px rgba(0, 0, 0, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        const isRecommended = activeTab === "recommended";
                        e.currentTarget.style.boxShadow = isRecommended
                          ? "0 4px 20px rgba(14, 165, 233, 0.15)"
                          : "0 2px 8px rgba(0, 0, 0, 0.1)";
                      }}
                    >
                      {/* Image Section */}
                      <div
                        style={{
                          position: "relative",
                          height: "250px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={getRoomImageUrl(room.image)}
                          alt={room.roomNumber || room.roomName}
                          onError={(e) =>
                            handleImageError(e, "/images/placeholder-room.jpg")
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.4s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "scale(1)";
                          }}
                        />

                        {/* Price Badge */}
                        <div
                          className="room-page-badge room-price-badge"
                          style={{
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                            background: "#000000",
                            color: "#ffffff !important",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          <span style={{ color: "#ffffff !important" }}>
                            {formatPrice(room.price)}
                          </span>
                          <small style={{ fontSize: "0.75rem", color: "#ffffff !important" }}>/night</small>
                        </div>

                        {/* Recommendation Badge */}
                        {isRecommended && roomItem.reason && (
                          <div
                            style={{
                              position: "absolute",
                              top: "1rem",
                              left: "1rem",
                            }}
                          >
                            {getRecommendationBadge(
                              roomItem.reason,
                              roomItem.confidence,
                              roomItem.score ||
                                roomItem.predicted_rating ||
                                roomItem.predictedRating
                            )}
                          </div>
                        )}

                        {/* Score Badge */}
                        {(isRecommended || isPopular) && roomItem.score && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "1rem",
                              left: "1rem",
                              background: "rgba(0, 0, 0, 0.7)",
                              color: "#fff",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "1rem",
                              fontSize: "0.8rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              backdropFilter: "blur(10px)",
                            }}
                          >
                            <FiStar
                              size={12}
                              style={{ fill: "#ffc107", color: "#ffc107" }}
                            />
                            {roomItem.score.toFixed(1)}
                          </div>
                        )}
                      </div>
                      {/* Card Content */}
                      <div
                        className="room-page-card-content"
                        style={{
                          padding: "1.5rem",
                          display: "flex",
                          flexDirection: "column",
                          height: "250px",
                        }}
                      >
                        {/* Header */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "1rem",
                          }}
                        >
                          <div>
                            <h3
                              className="room-page-card-title"
                              style={{
                                fontSize: "1.25rem",
                                fontWeight: "700",
                                color: "#111827",
                                marginBottom: "0.25rem",
                              }}
                            >
                              Room {room.roomNumber || room.roomName}
                            </h3>
                            <span
                              style={{
                                fontSize: "0.85rem",
                                color: "#6b7280",
                                fontWeight: "500",
                              }}
                            >
                              {room.roomType}
                            </span>
                          </div>

                          {/* Rating */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                size={14}
                                style={{
                                  fill:
                                    i < (room.averageRating || 4)
                                      ? "#ffc107"
                                      : "none",
                                  color:
                                    i < (room.averageRating || 4)
                                      ? "#ffc107"
                                      : "rgba(255, 255, 255, 0.3)",
                                }}
                              />
                            ))}
                            {room.totalRatings > 0 && (
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  color: "rgba(255, 255, 255, 0.7)",
                                  marginLeft: "0.25rem",
                                }}
                              >
                                ({room.totalRatings})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p
                          className="room-page-card-description"
                          style={{
                            color: "#6b7280",
                            fontSize: "0.9rem",
                            lineHeight: "1.5",
                            marginBottom: "1rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            flex: 1,
                          }}
                        >
                          {room.description}
                        </p>

                        {/* Amenities */}
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                            marginBottom: "1.5rem",
                          }}
                        >
                          {room.amenities &&
                            room.amenities.slice(0, 3).map((amenity, index) => (
                              <span
                                key={index}
                                className="room-page-amenity"
                                style={{
                                  padding: "0.25rem 0.75rem",
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "1rem",
                                  fontSize: "0.75rem",
                                  color: "#374151",
                                  fontWeight: "500",
                                }}
                              >
                                {amenity}
                              </span>
                            ))}
                          {room.capacity && (
                            <span
                              style={{
                                padding: "0.25rem 0.75rem",
                                background: "rgba(187, 134, 252, 0.1)",
                                border: "1px solid rgba(187, 134, 252, 0.3)",
                                borderRadius: "1rem",
                                fontSize: "0.75rem",
                                color: "#374151",
                                fontWeight: "500",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <FiUsers size={10} />
                              {room.capacity} guests
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            marginTop: "auto",
                          }}
                        >
                          <button
                            className="room-page-button"
                            onClick={() => handleBookRoom(room, roomItem)}
                            disabled={false}
                            style={{
                              flex: 1,
                              padding: "0.75rem 1rem",
                              background: "#000000",
                              border: "none",
                              borderRadius: "0.5rem",
                              color: "#ffffff",
                              fontSize: "0.875rem",
                              fontWeight: "500",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.5rem",
                              fontFamily: "Inter, sans-serif",
                            }}
                          >
                            <FiShoppingCart size={14} />
                            Book Now
                          </button>

                          <button
                            className="room-page-button"
                            onClick={() => handleViewDetails(room, roomItem)}
                            style={{
                              padding: "0.75rem 1rem",
                              background: "transparent",
                              border: "1px solid #e5e7eb",
                              borderRadius: "0.5rem",
                              color: "#374151",
                              fontSize: "0.875rem",
                              fontWeight: "500",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.5rem",
                              fontFamily: "Inter, sans-serif",
                            }}
                          >
                            <FiEye size={14} />
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>

          {/* No Rooms Found */}
          {!loading && rooms.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 2rem",
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              <FiInfo
                size={64}
                style={{ color: "#9ca3af", marginBottom: "1.5rem" }}
              />
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "0.5rem",
                }}
              >
                No rooms found
              </h3>
              <p style={{ fontSize: "1rem", color: "#6b7280" }}>
                Please try adjusting your filters or try again later
              </p>
            </div>
          )}

          {/* Room Details Modal */}
          {selectedRoom && (
            <RoomDetailsModal room={selectedRoom} onClose={handleCloseModal} />
          )}
        </div>
      </div>
    </>
  );
};

export default RoomPage;
