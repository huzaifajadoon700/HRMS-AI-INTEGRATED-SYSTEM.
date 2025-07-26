import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiSave,
  FiX,
  FiEdit2,
  FiPhone,
  FiSettings,
  FiShield,
  FiHeart,
  FiCalendar,
  FiHome,
  FiStar,
  FiActivity,
  FiTrendingUp,
  FiAward,
  FiClock,
  FiDollarSign,
  FiBarChart2,
  FiTarget,
  FiPieChart
} from "react-icons/fi";
import UserFoodPreferences from "../components/recommendations/UserFoodPreferences";
import "../components/User/Profile.css";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    joinDate: "",
    lastLogin: "",
    totalBookings: 0,
    totalOrders: 0,
    favoriteItems: [],
    loyaltyPoints: 0
  });
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalOrders: 0,
    totalReservations: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    favoriteItems: []
  });
  const [monthlyHistory, setMonthlyHistory] = useState({
    foodHistory: {
      orders: [],
      interactions: [],
      preferences: {},
      totalSpent: 0,
      favoriteItems: [],
      avgRating: 0
    },
    roomHistory: {
      bookings: [],
      interactions: [],
      preferences: {},
      totalSpent: 0,
      favoriteRoomTypes: [],
      avgStayDuration: 0
    },
    tableHistory: {
      reservations: [],
      interactions: [],
      preferences: {},
      totalSpent: 0,
      favoriteTableTypes: [],
      avgPartySize: 0
    }
  });
  const [, setRecentActivity] = useState({
    bookings: [],
    orders: [],
    reservations: []
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const navigate = useNavigate();

  // Force white background and black text for all elements
  useEffect(() => {
    const forceWhiteTheme = () => {
      const profilePage = document.querySelector('.modern-profile-page');
      if (profilePage) {
        // Force white background on all elements EXCEPT icons
        const allElements = profilePage.querySelectorAll('*');
        allElements.forEach(element => {
          // Skip icons and SVG elements
          const tagName = element.tagName ? element.tagName.toLowerCase() : '';
          const className = element.className ? element.className.toString() : '';

          if (tagName === 'svg' ||
              tagName === 'i' ||
              element.classList.contains('tab-icon') ||
              element.classList.contains('section-icon') ||
              element.classList.contains('hero-stat-icon') ||
              element.classList.contains('stat-icon') ||
              element.classList.contains('form-icon') ||
              element.classList.contains('activity-icon') ||
              className.includes('icon') ||
              className.includes('fi-')) {
            // Only set background for icons, not color
            element.style.setProperty('background', 'transparent', 'important');
            element.style.setProperty('background-color', 'transparent', 'important');
            element.style.setProperty('background-image', 'none', 'important');
            return; // Skip color override for icons
          }

          // Apply theme to non-icon elements
          element.style.setProperty('background', '#ffffff', 'important');
          element.style.setProperty('background-color', '#ffffff', 'important');
          element.style.setProperty('background-image', 'none', 'important');
          element.style.setProperty('color', '#000000', 'important');
          element.style.setProperty('border-color', '#e5e7eb', 'important');
          element.style.setProperty('backdrop-filter', 'none', 'important');
          element.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
        });

        // Special handling for buttons
        const buttons = profilePage.querySelectorAll('.save-btn, .tab-button.active, .btn-primary');
        buttons.forEach(button => {
          button.style.setProperty('background', '#000000', 'important');
          button.style.setProperty('background-color', '#000000', 'important');
          button.style.setProperty('color', '#ffffff', 'important');
        });
      }
    };

    // Apply immediately
    forceWhiteTheme();

    // Apply after a short delay to catch dynamically loaded content
    const timer = setTimeout(forceWhiteTheme, 100);

    // Apply when tab changes
    const observer = new MutationObserver(forceWhiteTheme);
    const profilePage = document.querySelector('.modern-profile-page');
    if (profilePage) {
      observer.observe(profilePage, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [activeTab]);

  // Fetch user profile data and comprehensive stats
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
        const response = await axios.get(`${apiUrl}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);

        // Fetch comprehensive stats and 1-month history
        await fetchUserStats(token);
        await fetchMonthlyHistory(token, response.data._id);
      } catch (error) {
        setError("Error fetching profile data");
      }
    };

    fetchProfile();
  }, [navigate]);

  // Fetch comprehensive user statistics
  const fetchUserStats = async (token) => {
    try {
      setStatsLoading(true);

      // Fetch reservations
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      const reservationsResponse = await axios.get(`${apiUrl}/reservations/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const reservations = reservationsResponse.data || [];

      // Fetch orders
      const ordersResponse = await axios.get(`${apiUrl}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 }
      });
      const orders = ordersResponse.data?.orders || [];

      // Fetch bookings
      const bookingsResponse = await axios.get(`${apiUrl}/bookings/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookings = bookingsResponse.data || [];

      // Calculate total spent from orders and bookings
      const totalSpentFromOrders = orders.reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || 0), 0);
      const totalSpentFromBookings = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      const totalSpentFromReservations = reservations.reduce((sum, reservation) => sum + (reservation.totalPrice || 0), 0);

      const totalSpent = totalSpentFromOrders + totalSpentFromBookings + totalSpentFromReservations;

      console.log("💰 Profile Revenue Calculation:", {
        orders: totalSpentFromOrders,
        bookings: totalSpentFromBookings,
        reservations: totalSpentFromReservations,
        total: totalSpent
      });

      // Update stats
      setStats({
        totalReservations: reservations.length,
        totalOrders: orders.length,
        totalBookings: bookings.length,
        totalSpent: totalSpent,
        loyaltyPoints: Math.floor(totalSpent / 10), // 1 point per Rs. 10 spent
        favoriteItems: []
      });

      // Update recent activity (last 5 items)
      setRecentActivity({
        reservations: reservations.slice(0, 5),
        orders: orders.slice(0, 5),
        bookings: bookings.slice(0, 5)
      });

    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch comprehensive 1-month history across all modules
  const fetchMonthlyHistory = async (token, userId) => {
    try {
      setHistoryLoading(true);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Fetch food history and interactions
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      const [foodHistoryResponse, foodInteractionsResponse] = await Promise.allSettled([
        axios.get(`${apiUrl}/food-recommendations/history/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { days: 30 }
        }),
        axios.get(`${apiUrl}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 100 }
        })
      ]);

      // Fetch room history and interactions
      const [roomHistoryResponse, roomBookingsResponse] = await Promise.allSettled([
        axios.get(`${apiUrl}/rooms/history/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { days: 30 }
        }),
        axios.get(`${apiUrl}/bookings/user`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Fetch table history and interactions
      const [tableHistoryResponse, tableReservationsResponse] = await Promise.allSettled([
        axios.get(`${apiUrl}/tables/history/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { days: 30 }
        }),
        axios.get(`${apiUrl}/reservations/user`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Process food history
      const foodOrders = foodInteractionsResponse.status === 'fulfilled' ?
        (foodInteractionsResponse.value.data?.orders || []).filter(order =>
          new Date(order.createdAt) >= thirtyDaysAgo
        ) : [];

      const foodInteractions = foodHistoryResponse.status === 'fulfilled' ?
        foodHistoryResponse.value.data?.history || [] : [];

      const foodTotalSpent = foodOrders.reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || 0), 0);
      const foodAvgRating = foodInteractions.length > 0 ?
        foodInteractions.filter(i => i.rating).reduce((sum, i) => sum + i.rating, 0) / foodInteractions.filter(i => i.rating).length : 0;

      // Process room history
      const roomBookings = roomBookingsResponse.status === 'fulfilled' ?
        (roomBookingsResponse.value.data || []).filter(booking =>
          new Date(booking.createdAt || booking.checkInDate) >= thirtyDaysAgo
        ) : [];

      const roomInteractions = roomHistoryResponse.status === 'fulfilled' ?
        roomHistoryResponse.value.data?.history || [] : [];

      const roomTotalSpent = roomBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      const avgStayDuration = roomBookings.length > 0 ?
        roomBookings.reduce((sum, booking) => {
          const checkIn = new Date(booking.checkInDate);
          const checkOut = new Date(booking.checkOutDate);
          return sum + Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        }, 0) / roomBookings.length : 0;

      // Process table history
      const tableReservations = tableReservationsResponse.status === 'fulfilled' ?
        (tableReservationsResponse.value.data || []).filter(reservation =>
          new Date(reservation.createdAt || reservation.reservationDate) >= thirtyDaysAgo
        ) : [];

      const tableInteractions = tableHistoryResponse.status === 'fulfilled' ?
        tableHistoryResponse.value.data?.history || [] : [];

      const tableTotalSpent = tableReservations.reduce((sum, reservation) => sum + (reservation.totalPrice || 0), 0);
      const avgPartySize = tableReservations.length > 0 ?
        tableReservations.reduce((sum, reservation) => sum + (reservation.guests || 0), 0) / tableReservations.length : 0;

      // Update monthly history state
      setMonthlyHistory({
        foodHistory: {
          orders: foodOrders,
          interactions: foodInteractions,
          preferences: foodHistoryResponse.status === 'fulfilled' ? foodHistoryResponse.value.data?.preferences || {} : {},
          totalSpent: foodTotalSpent,
          favoriteItems: foodInteractions.filter(i => i.interactionType === 'favorite').map(i => i.menuItemId),
          avgRating: foodAvgRating
        },
        roomHistory: {
          bookings: roomBookings,
          interactions: roomInteractions,
          preferences: roomHistoryResponse.status === 'fulfilled' ? roomHistoryResponse.value.data?.preferences || {} : {},
          totalSpent: roomTotalSpent,
          favoriteRoomTypes: roomBookings.map(b => b.roomType).filter((type, index, arr) => arr.indexOf(type) === index),
          avgStayDuration: avgStayDuration
        },
        tableHistory: {
          reservations: tableReservations,
          interactions: tableInteractions,
          preferences: tableHistoryResponse.status === 'fulfilled' ? tableHistoryResponse.value.data?.preferences || {} : {},
          totalSpent: tableTotalSpent,
          favoriteTableTypes: tableReservations.map(r => r.tableType).filter((type, index, arr) => arr.indexOf(type) === index),
          avgPartySize: avgPartySize
        }
      });

      console.log("📊 1-Month History Summary:", {
        food: { orders: foodOrders.length, spent: foodTotalSpent, avgRating: foodAvgRating },
        rooms: { bookings: roomBookings.length, spent: roomTotalSpent, avgStay: avgStayDuration },
        tables: { reservations: tableReservations.length, spent: tableTotalSpent, avgParty: avgPartySize }
      });

    } catch (error) {
      console.error("Error fetching monthly history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      await axios.put(
        `${apiUrl}/user/profile`,
        { name: user.name, email: user.email, phone: user.phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Profile updated successfully");
      setEditMode(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError("Error updating profile");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const { currentPassword, newPassword } = user;
    if (!currentPassword || !newPassword) {
      setError("Please fill in all fields");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      await axios.put(
        `${apiUrl}/user/password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Password updated successfully");
      setUser({ ...user, currentPassword: "", newPassword: "" });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError("Error updating password: " + (error.response?.data?.message || "Unknown error"));
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="modern-profile-page">
      {/* Hero Section */}
      <section className="profile-hero">
        <div className="hero-content">
          <div className="user-avatar">
            <FiUser size={48} />
          </div>
          <h1 className="hero-title">Welcome back, {user.name || 'User'}!</h1>
          <p className="hero-subtitle">Complete 1-Month Activity Dashboard</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <FiActivity className="hero-stat-icon" />
              <span className="hero-stat-value">{statsLoading ? '...' : (stats.totalOrders + stats.totalBookings + stats.totalReservations)}</span>
              <span className="hero-stat-label">Total Activities</span>
            </div>
            <div className="hero-stat">
              <FiDollarSign className="hero-stat-icon" />
              <span className="hero-stat-value">Rs. {statsLoading ? '...' : stats.totalSpent.toLocaleString()}</span>
              <span className="hero-stat-label">Total Spent</span>
            </div>
            <div className="hero-stat">
              <FiStar className="hero-stat-icon" />
              <span className="hero-stat-value">{statsLoading ? '...' : stats.loyaltyPoints}</span>
              <span className="hero-stat-label">Loyalty Points</span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="profile-nav">
        <div className="container-fluid">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FiUser className="tab-icon" />
              Profile & Stats
            </button>
            <button
              className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FiClock className="tab-icon" />
              1-Month History
            </button>
            <button
              className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <FiBarChart2 className="tab-icon" />
              Analytics
            </button>
            <button
              className={`nav-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <FiShield className="tab-icon" />
              Security
            </button>
            <button
              className={`nav-tab ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <FiSettings className="tab-icon" />
              Preferences
            </button>
          </div>
        </div>
      </section>

      {/* Messages */}
      {error && (
        <div className="container-fluid">
          <div className="alert alert-error">{error}</div>
        </div>
      )}
      {message && (
        <div className="container-fluid">
          <div className="alert alert-success">{message}</div>
        </div>
      )}

      {/* Main Content */}
      <section className="profile-content">
        <div className="container-fluid">
          <div className="content-grid">

            {/* Profile & Stats Tab */}
            {activeTab === 'profile' && (
              <>
                {/* Enhanced Stats Cards */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiHeart />
                    </div>
                    <div className="stat-content">
                      <h3>{statsLoading ? '...' : stats.totalOrders}</h3>
                      <p>Food Orders</p>
                      <small>Rs. {historyLoading ? '...' : monthlyHistory.foodHistory.totalSpent.toLocaleString()} spent</small>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiHome />
                    </div>
                    <div className="stat-content">
                      <h3>{statsLoading ? '...' : stats.totalBookings}</h3>
                      <p>Room Bookings</p>
                      <small>Rs. {historyLoading ? '...' : monthlyHistory.roomHistory.totalSpent.toLocaleString()} spent</small>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiCalendar />
                    </div>
                    <div className="stat-content">
                      <h3>{statsLoading ? '...' : stats.totalReservations}</h3>
                      <p>Table Reservations</p>
                      <small>Rs. {historyLoading ? '...' : monthlyHistory.tableHistory.totalSpent.toLocaleString()} spent</small>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiStar />
                    </div>
                    <div className="stat-content">
                      <h3>{statsLoading ? '...' : stats.loyaltyPoints}</h3>
                      <p>Loyalty Points</p>
                      <small>{100 - (stats.loyaltyPoints % 100)} to next reward</small>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiTrendingUp />
                    </div>
                    <div className="stat-content">
                      <h3>Rs. {statsLoading ? '...' : stats.totalSpent.toLocaleString()}</h3>
                      <p>Total Spent</p>
                      <small>Last 30 days</small>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiTarget />
                    </div>
                    <div className="stat-content">
                      <h3>{historyLoading ? '...' : monthlyHistory.foodHistory.avgRating.toFixed(1)}</h3>
                      <p>Avg Food Rating</p>
                      <small>Your rating average</small>
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="profile-section">
                  <div className="section-header">
                    <h3>
                      <FiUser className="section-icon" />
                      Personal Information
                    </h3>
                    {!editMode ? (
                      <button className="edit-button" onClick={() => setEditMode(true)}>
                        <FiEdit2 className="btn-icon" /> Edit Profile
                      </button>
                    ) : (
                      <div className="button-group">
                        <button className="save-button" onClick={handleUpdateProfile}>
                          <FiSave className="btn-icon" /> Save
                        </button>
                        <button className="cancel-button" onClick={() => setEditMode(false)}>
                          <FiX className="btn-icon" /> Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="profile-info">
                    {editMode ? (
                      <form onSubmit={handleUpdateProfile} className="profile-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>
                              <FiUser className="form-icon" /> Name
                            </label>
                            <input
                              type="text"
                              value={user.name}
                              onChange={(e) => setUser({ ...user, name: e.target.value })}
                              className="form-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>
                              <FiMail className="form-icon" /> Email
                            </label>
                            <input
                              type="email"
                              value={user.email}
                              onChange={(e) => setUser({ ...user, email: e.target.value })}
                              className="form-input"
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>
                              <FiPhone className="form-icon" /> Phone Number
                            </label>
                            <input
                              type="tel"
                              value={user.phone || ""}
                              onChange={(e) => setUser({ ...user, phone: e.target.value })}
                              className="form-input"
                              placeholder="Enter your phone number"
                            />
                          </div>
                          <div className="form-group">
                            <label>
                              <FiAward className="form-icon" /> Role
                            </label>
                            <input
                              type="text"
                              value={user.role}
                              disabled
                              className="form-input disabled"
                            />
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div className="info-display">
                        <div className="info-item">
                          <FiUser className="info-icon" />
                          <div className="info-content">
                            <label>Name</label>
                            <span>{user.name}</span>
                          </div>
                        </div>
                        <div className="info-item">
                          <FiMail className="info-icon" />
                          <div className="info-content">
                            <label>Email</label>
                            <span>{user.email}</span>
                          </div>
                        </div>
                        <div className="info-item">
                          <FiPhone className="info-icon" />
                          <div className="info-content">
                            <label>Phone</label>
                            <span>{user.phone || "Not provided"}</span>
                          </div>
                        </div>
                        <div className="info-item">
                          <FiAward className="info-icon" />
                          <div className="info-content">
                            <label>Role</label>
                            <span>{user.role}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 1-Month History Tab */}
            {activeTab === 'history' && (
              <div className="history-section">
                <div className="section-header">
                  <h3>
                    <FiClock className="section-icon" />
                    Complete 1-Month Activity History
                  </h3>
                  <p className="section-subtitle">Comprehensive overview of your last 30 days activity</p>
                </div>

                {/* History Summary Cards */}
                <div className="history-summary-grid">
                  <div className="history-summary-card">
                    <div className="summary-header">
                      <FiHeart className="summary-icon food" />
                      <h4>Food Orders & Interactions</h4>
                    </div>
                    <div className="summary-stats">
                      <div className="summary-stat">
                        <span className="stat-value">{historyLoading ? '...' : monthlyHistory.foodHistory.orders.length}</span>
                        <span className="stat-label">Orders Placed</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-value">Rs. {historyLoading ? '...' : monthlyHistory.foodHistory.totalSpent.toLocaleString()}</span>
                        <span className="stat-label">Total Spent</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-value">{historyLoading ? '...' : monthlyHistory.foodHistory.avgRating.toFixed(1)}</span>
                        <span className="stat-label">Avg Rating</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-value">{historyLoading ? '...' : monthlyHistory.foodHistory.interactions.length}</span>
                        <span className="stat-label">Interactions</span>
                      </div>
                    </div>
                    <div className="summary-details">
                      <p><strong>Favorite Items:</strong> {historyLoading ? 'Loading...' : monthlyHistory.foodHistory.favoriteItems.length} items</p>
                      <p><strong>Most Active:</strong> Food ordering and rating</p>
                    </div>
                  </div>

                  <div className="history-summary-card">
                    <div className="summary-header">
                      <FiHome className="summary-icon room" />
                      <h4>Room Bookings & Stays</h4>
                    </div>
                    <div className="summary-stats">
                      <div className="summary-stat">
                        <span className="stat-value">{historyLoading ? '...' : monthlyHistory.roomHistory.bookings.length}</span>
                        <span className="stat-label">Bookings Made</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-value">Rs. {historyLoading ? '...' : monthlyHistory.roomHistory.totalSpent.toLocaleString()}</span>
                        <span className="stat-label">Total Spent</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-value">{historyLoading ? '...' : monthlyHistory.roomHistory.avgStayDuration.toFixed(1)}</span>
                        <span className="stat-label">Avg Stay (days)</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-value">{historyLoading ? '...' : monthlyHistory.roomHistory.interactions.length}</span>
                        <span className="stat-label">Interactions</span>
                      </div>
                    </div>
                    <div className="summary-details">
                      <p><strong>Preferred Types:</strong> {historyLoading ? 'Loading...' : monthlyHistory.roomHistory.favoriteRoomTypes.join(', ') || 'None yet'}</p>
                      <p><strong>Booking Pattern:</strong> {historyLoading ? 'Loading...' : monthlyHistory.roomHistory.bookings.length > 0 ? 'Regular guest' : 'New to rooms'}</p>
                    </div>
                  </div>

                  <div className="history-summary-card">
                    <div className="summary-header">
                      <FiCalendar className="summary-icon table" />
                      <h4>Table Reservations & Dining</h4>
                    </div>
                    <div className="summary-stats">
                      <div className="summary-stat">
                        <span className="stat-value">{historyLoading ? '...' : monthlyHistory.tableHistory.reservations.length}</span>
                        <span className="stat-label">Reservations</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-value">Rs. {historyLoading ? '...' : monthlyHistory.tableHistory.totalSpent.toLocaleString()}</span>
                        <span className="stat-label">Total Spent</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-value">{historyLoading ? '...' : monthlyHistory.tableHistory.avgPartySize.toFixed(1)}</span>
                        <span className="stat-label">Avg Party Size</span>
                      </div>
                      <div className="summary-stat">
                        <span className="stat-value">{historyLoading ? '...' : monthlyHistory.tableHistory.interactions.length}</span>
                        <span className="stat-label">Interactions</span>
                      </div>
                    </div>
                    <div className="summary-details">
                      <p><strong>Dining Style:</strong> {historyLoading ? 'Loading...' : monthlyHistory.tableHistory.avgPartySize > 3 ? 'Group dining' : 'Intimate dining'}</p>
                      <p><strong>Frequency:</strong> {historyLoading ? 'Loading...' : monthlyHistory.tableHistory.reservations.length > 5 ? 'Regular diner' : 'Occasional diner'}</p>
                    </div>
                  </div>
                </div>

                {/* Detailed History Timeline */}
                <div className="history-timeline">
                  <h4>Recent Activity Timeline</h4>
                  <div className="timeline-container">
                    {historyLoading ? (
                      <p>Loading timeline...</p>
                    ) : (
                      <>
                        {monthlyHistory.foodHistory.orders.slice(0, 3).map((order, index) => (
                          <div key={`food-${index}`} className="timeline-item food">
                            <div className="timeline-icon"><FiHeart /></div>
                            <div className="timeline-content">
                              <h5>Food Order #{order._id?.slice(-6) || index + 1}</h5>
                              <p>Rs. {order.totalAmount || order.totalPrice || 0} • {new Date(order.createdAt).toLocaleDateString()}</p>
                              <span className="timeline-type">Food Order</span>
                            </div>
                          </div>
                        ))}
                        {monthlyHistory.roomHistory.bookings.slice(0, 3).map((booking, index) => (
                          <div key={`room-${index}`} className="timeline-item room">
                            <div className="timeline-icon"><FiHome /></div>
                            <div className="timeline-content">
                              <h5>{booking.roomType} Room</h5>
                              <p>Rs. {booking.totalPrice || 0} • {new Date(booking.checkInDate).toLocaleDateString()}</p>
                              <span className="timeline-type">Room Booking</span>
                            </div>
                          </div>
                        ))}
                        {monthlyHistory.tableHistory.reservations.slice(0, 3).map((reservation, index) => (
                          <div key={`table-${index}`} className="timeline-item table">
                            <div className="timeline-icon"><FiCalendar /></div>
                            <div className="timeline-content">
                              <h5>Table Reservation</h5>
                              <p>Rs. {reservation.totalPrice || 0} • {new Date(reservation.reservationDate).toLocaleDateString()}</p>
                              <span className="timeline-type">Table Reservation</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="analytics-section">
                <div className="section-header">
                  <h3>
                    <FiBarChart2 className="section-icon" />
                    User Behavior Analytics
                  </h3>
                  <p className="section-subtitle">Insights into your preferences and patterns</p>
                </div>

                <div className="analytics-grid">
                  <div className="analytics-card">
                    <div className="analytics-header">
                      <FiPieChart className="analytics-icon" />
                      <h4>Spending Distribution</h4>
                    </div>
                    <div className="spending-breakdown">
                      <div className="spending-item">
                        <span className="spending-label">Food Orders</span>
                        <div className="spending-bar">
                          <div
                            className="spending-fill food"
                            style={{
                              width: `${stats.totalSpent > 0 ? (monthlyHistory.foodHistory.totalSpent / stats.totalSpent) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="spending-value">Rs. {monthlyHistory.foodHistory.totalSpent.toLocaleString()}</span>
                      </div>
                      <div className="spending-item">
                        <span className="spending-label">Room Bookings</span>
                        <div className="spending-bar">
                          <div
                            className="spending-fill room"
                            style={{
                              width: `${stats.totalSpent > 0 ? (monthlyHistory.roomHistory.totalSpent / stats.totalSpent) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="spending-value">Rs. {monthlyHistory.roomHistory.totalSpent.toLocaleString()}</span>
                      </div>
                      <div className="spending-item">
                        <span className="spending-label">Table Reservations</span>
                        <div className="spending-bar">
                          <div
                            className="spending-fill table"
                            style={{
                              width: `${stats.totalSpent > 0 ? (monthlyHistory.tableHistory.totalSpent / stats.totalSpent) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="spending-value">Rs. {monthlyHistory.tableHistory.totalSpent.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <div className="analytics-header">
                      <FiTarget className="analytics-icon" />
                      <h4>User Preferences</h4>
                    </div>
                    <div className="preferences-list">
                      <div className="preference-item">
                        <span className="preference-label">Most Active Module</span>
                        <span className="preference-value">
                          {stats.totalOrders >= stats.totalBookings && stats.totalOrders >= stats.totalReservations ? 'Food Ordering' :
                           stats.totalBookings >= stats.totalReservations ? 'Room Booking' : 'Table Reservations'}
                        </span>
                      </div>
                      <div className="preference-item">
                        <span className="preference-label">Average Order Value</span>
                        <span className="preference-value">
                          Rs. {monthlyHistory.foodHistory.orders.length > 0 ?
                            (monthlyHistory.foodHistory.totalSpent / monthlyHistory.foodHistory.orders.length).toFixed(0) : '0'}
                        </span>
                      </div>
                      <div className="preference-item">
                        <span className="preference-label">Loyalty Status</span>
                        <span className="preference-value">
                          {stats.loyaltyPoints >= 500 ? 'Gold Member' :
                           stats.loyaltyPoints >= 200 ? 'Silver Member' : 'Bronze Member'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="profile-section">
                <div className="section-header">
                  <h3>
                    <FiShield className="section-icon" />
                    Security Settings
                  </h3>
                </div>
                <form onSubmit={handleUpdatePassword} className="password-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <FiLock className="form-icon" /> Current Password
                      </label>
                      <input
                        type="password"
                        value={user.currentPassword || ""}
                        onChange={(e) => setUser({ ...user, currentPassword: e.target.value })}
                        className="form-input"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <FiLock className="form-icon" /> New Password
                      </label>
                      <input
                        type="password"
                        value={user.newPassword || ""}
                        onChange={(e) => setUser({ ...user, newPassword: e.target.value })}
                        className="form-input"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>
                  <button type="submit" className="update-password-button">
                    <FiLock className="btn-icon" /> Update Password
                  </button>
                </form>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="profile-section">
                <div className="section-header">
                  <h3>
                    <FiSettings className="section-icon" />
                    Food Preferences & Recommendations
                  </h3>
                </div>
                {user._id && (
                  <UserFoodPreferences
                    userId={user._id}
                    onPreferencesUpdate={(preferences) => {
                      setMessage("Food preferences updated successfully!");
                      setTimeout(() => setMessage(""), 3000);
                    }}
                  />
                )}
              </div>
            )}

          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;