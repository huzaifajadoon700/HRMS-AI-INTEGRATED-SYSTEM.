import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiStar,
  FiWifi,
  FiCoffee,
  FiTv,
  FiShoppingCart,
  FiEye,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { getRoomImageUrl, handleImageError } from "../../utils/imageUtils";
import RoomDetailsModal from "../RoomDetailsModal";
import "bootstrap/dist/css/bootstrap.min.css";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [popularRooms, setPopularRooms] = useState([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [, setActiveTab] = useState("popular");
  const [user, setUser] = useState(null);
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("name");

    if (token && userId && userName) {
      setUser({ id: userId, token, name: userName });
      setActiveTab("recommended"); // Show recommendations for logged-in users
    } else {
      setActiveTab("popular"); // Default to popular for non-logged-in users
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
          console.log(
            "Fetched popular rooms:",
            response.data.popularRooms.length,
            response.data.popularRooms
          );
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

      try {
        const apiUrl =
          process.env.REACT_APP_API_BASE_URL ||
          "https://hrms-bace.vercel.app/api";
        const response = await axios.get(
          `${apiUrl}/rooms/recommendations/${user.id}?count=6`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        if (response.data.success) {
          const recommendations =
            response.data.recommendations || response.data.rooms || [];
          console.log(
            "Fetched recommendations:",
            recommendations.length,
            recommendations
          );
          setRecommendedRooms(recommendations);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        // Fallback to popular rooms for new users or on error
        setRecommendedRooms(popularRooms.slice(0, 6));
      }
    };

    fetchRecommendations();
  }, [user, popularRooms]);

  // Get current rooms to display - always show only 3 recommended rooms
  const getCurrentRooms = () => {
    console.log("Home Rooms Debug:", {
      recommendedRooms: recommendedRooms.length,
      popularRooms: popularRooms.length,
      allRooms: rooms.length,
      user: !!user,
    });

    let selectedRooms = [];

    // Always prioritize recommended rooms, limit to 3
    if (recommendedRooms.length > 0) {
      selectedRooms = recommendedRooms.slice(0, 3);
      console.log("Using recommended rooms:", selectedRooms.length);
    } else if (popularRooms.length > 0) {
      selectedRooms = popularRooms.slice(0, 3);
      console.log("Using popular rooms:", selectedRooms.length);
    } else {
      selectedRooms = rooms.slice(0, 3);
      console.log("Using all rooms:", selectedRooms.length);
    }

    // Fallback: if we still don't have 3 rooms, try to get more from other sources
    if (selectedRooms.length < 3) {
      console.log("Not enough rooms, trying fallback...");
      const allAvailableRooms = [
        ...recommendedRooms,
        ...popularRooms,
        ...rooms,
      ];
      const uniqueRooms = allAvailableRooms.filter(
        (room, index, self) =>
          index ===
          self.findIndex(
            (r) => (r._id || r.roomId) === (room._id || room.roomId)
          )
      );
      selectedRooms = uniqueRooms.slice(0, 3);
      console.log("Fallback result:", selectedRooms.length);
    }

    return selectedRooms;
  };

  // Removed slider functions since we're showing only 3 rooms

  // Format price in Pakistani Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Modal handlers
  const handleViewDetails = (room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
  };

  const currentRooms = getCurrentRooms();
  const visibleRooms = currentRooms; // Show all 3 without sliding

  return (
    <>
      <style>
        {`
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
          }

          @media (max-width: 480px) {
            .rooms-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
              padding: 0 0.5rem !important;
            }
            .room-card {
              margin: 0 !important;
              min-width: auto !important;
            }
          }
        `}
      </style>
      <section
        style={{
          width: "100%",
          margin: 0,
          padding: "4rem 0",
          background: "#ffffff",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "0 2rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "600",
                color: "#000000",
                marginBottom: "1rem",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Featured Rooms
            </h2>
            <Link
              to="/rooms"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                background: "#000000",
                color: "#ffffff",
                textDecoration: "none",
                borderRadius: "0.5rem",
                fontWeight: "500",
                fontSize: "0.9rem",
                transition: "all 0.2s ease",
                border: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#333333";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#000000";
              }}
            >
              View All Rooms
            </Link>
          </div>

          <div
            className="rooms-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
              width: "100%",
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 1rem",
            }}
          >
            {visibleRooms.map((roomItem) => {
              const room = roomItem.roomDetails || roomItem;

              // Enhanced room ID extraction with better debugging
              let roomId = null;

              // Try multiple ways to get the room ID
              if (room._id && typeof room._id === 'string') {
                roomId = room._id;
              } else if (room._id && typeof room._id === 'object' && room._id.$oid) {
                roomId = room._id.$oid;
              } else if (roomItem.roomId && typeof roomItem.roomId === 'string') {
                roomId = roomItem.roomId;
              } else if (roomItem.roomId && typeof roomItem.roomId === 'object') {
                if (roomItem.roomId._id) {
                  roomId = roomItem.roomId._id;
                } else if (roomItem.roomId.$oid) {
                  roomId = roomItem.roomId.$oid;
                }
              } else if (room.roomId && typeof room.roomId === 'string') {
                roomId = room.roomId;
              } else if (room.id) {
                roomId = room.id;
              }

              // Comprehensive debug log
              console.log('🔍 Room data debug:', {
                roomItem: roomItem,
                room: room,
                'room._id': room._id,
                'room._id type': typeof room._id,
                'roomItem.roomId': roomItem.roomId,
                'roomItem.roomId type': typeof roomItem.roomId,
                'room.roomId': room.roomId,
                'room.id': room.id,
                'final roomId': roomId,
                'roomId type': typeof roomId,
                'roomId valid': !!roomId && typeof roomId === 'string'
              });

              // Skip rendering if we don't have a valid room ID
              if (!roomId || typeof roomId !== 'string') {
                console.error('❌ Skipping room - no valid ID found:', roomItem);
                return null;
              }

              return (
                <div
                  key={roomId}
                  className="room-card"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    width: "100%",
                    maxWidth: "350px",
                    margin: "0 auto",
                    position: "relative",
                    boxShadow:
                      hoveredRoom === room._id
                        ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                        : "0 1px 3px rgba(0, 0, 0, 0.1)",
                    transform:
                      hoveredRoom === room._id
                        ? "translateY(-2px)"
                        : "translateY(0)",
                  }}
                  onMouseEnter={() => setHoveredRoom(room._id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "200px",
                      overflow: "hidden",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundImage: `url(${getRoomImageUrl(room.image)})`,
                    }}
                  >
                    {/* Recommendation Badge */}
                    {room.recommendationReason && (
                      <div
                        style={{
                          position: "absolute",
                          top: "0.75rem",
                          left: "0.75rem",
                          background: "#000000",
                          color: "#ffffff",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                        }}
                      >
                        Recommended
                      </div>
                    )}

                    {/* Price Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        background: "#ffffff",
                        color: "#000000",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontWeight: "600",
                        fontSize: "0.875rem",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      {formatPrice(room.price)}
                    </div>

                    {/* Rating Badge */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0.75rem",
                        left: "0.75rem",
                        background: "#ffffff",
                        color: "#000000",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <FiStar style={{ color: "#fbbf24" }} size={12} />
                      <span>{room.averageRating?.toFixed(1) || "4.5"}</span>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                      background: "#ffffff",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          color: "#000000",
                          fontSize: "1.125rem",
                          fontWeight: "600",
                          marginBottom: "0.5rem",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {room.roomNumber || "Luxury Room"}
                      </h3>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          backgroundColor: "#f3f4f6",
                          color: "#374151",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                        }}
                      >
                        {room.roomType || "Deluxe"}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem",
                          backgroundColor: "#f9fafb",
                          borderRadius: "0.5rem",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <FiWifi size={16} style={{ color: "#6b7280" }} />
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#374151",
                            fontWeight: "500",
                            textAlign: "center",
                          }}
                        >
                          Free WiFi
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem",
                          backgroundColor: "#f9fafb",
                          borderRadius: "0.5rem",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <FiCoffee size={16} style={{ color: "#6b7280" }} />
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#374151",
                            fontWeight: "500",
                            textAlign: "center",
                          }}
                        >
                          Coffee
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem",
                          backgroundColor: "#f9fafb",
                          borderRadius: "0.5rem",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <FiTv size={16} style={{ color: "#6b7280" }} />
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#374151",
                            fontWeight: "500",
                            textAlign: "center",
                          }}
                        >
                          Smart TV
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        marginTop: "1rem",
                      }}
                    >
                      {roomId && typeof roomId === 'string' ? (
                        <Link
                          to={`/booking-page/${roomId}`}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            padding: "0.75rem",
                            background: "#000000",
                            color: "#ffffff",
                            textDecoration: "none",
                            borderRadius: "0.5rem",
                            fontWeight: "500",
                            fontSize: "0.875rem",
                            transition: "all 0.2s ease",
                            border: "none",
                          }}
                          onClick={() => {
                            console.log('📝 Storing room booking data:', {
                              roomId: roomId,
                              roomNumber: room.roomNumber,
                              roomType: room.roomType,
                              price: room.price
                            });

                            // Store room details for the booking page
                            const roomBookingData = {
                              roomId: roomId,
                              roomNumber: room.roomNumber,
                              roomType: room.roomType,
                              price: room.price,
                              description: room.description,
                              image: room.image,
                              capacity: room.capacity,
                              amenities: room.amenities,
                              averageRating: room.averageRating,
                              totalRatings: room.totalRatings,
                            };
                            localStorage.setItem(
                              "roomBookingData",
                              JSON.stringify(roomBookingData)
                            );
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#333333";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#000000";
                          }}
                        >
                          <FiShoppingCart size={14} />
                          Book Now
                        </Link>
                      ) : (
                        <button
                          disabled
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            padding: "0.75rem",
                            background: "#cccccc",
                            color: "#666666",
                            borderRadius: "0.5rem",
                            fontWeight: "500",
                            fontSize: "0.875rem",
                            border: "none",
                            cursor: "not-allowed",
                          }}
                        >
                          <FiShoppingCart size={14} />
                          Room ID Missing
                        </button>
                      )}

                      <button
                        onClick={() => {
                          // Add the extracted roomId to the room object before passing to modal
                          const roomWithId = { ...room, _id: roomId };
                          handleViewDetails(roomWithId);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0.75rem",
                          border: "1px solid #e5e7eb",
                          color: "#374151",
                          borderRadius: "0.5rem",
                          transition: "all 0.2s ease",
                          backgroundColor: "#ffffff",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f9fafb";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#ffffff";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        <FiEye size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Room Details Modal */}
      {showModal && selectedRoom && (
        <RoomDetailsModal room={selectedRoom} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default Rooms;
