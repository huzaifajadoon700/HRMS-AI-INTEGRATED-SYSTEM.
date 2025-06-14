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
  FiBookmark
} from "react-icons/fi";
import UserFoodPreferences from "../recommendations/UserFoodPreferences";
import "./Profile.css";

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
  const [recentActivity, setRecentActivity] = useState({
    bookings: [],
    orders: [],
    reservations: []
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user profile data and stats
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);

        // Fetch stats and activity data
        await fetchUserStats(token);
      } catch (error) {
        setError("Error fetching profile data");
      }
    };

    fetchProfile();
  }, [navigate]);

  // Fetch user statistics and recent activity
  const fetchUserStats = async (token) => {
    try {
      setStatsLoading(true);

      // Fetch reservations
      const reservationsResponse = await axios.get("http://localhost:8080/api/reservations/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const reservations = reservationsResponse.data || [];

      // Fetch orders
      const ordersResponse = await axios.get("http://localhost:8080/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 } // Get more orders for accurate count
      });
      const orders = ordersResponse.data?.orders || [];

      // Fetch bookings
      const bookingsResponse = await axios.get("http://localhost:8080/api/bookings/user", {
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
        loyaltyPoints: Math.floor(totalSpent / 10), // 1 point per $10 spent
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

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.put(
        "http://localhost:8080/api/user/profile",
        { name: user.name, email: user.email, phone: user.phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Profile updated successfully");
      setEditMode(false);
    } catch (error) {
      setError("Error updating profile");
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
      return;
    }
    
    try {
      await axios.put(
        "http://localhost:8080/api/user/password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Password updated successfully");
      setUser({ ...user, currentPassword: "", newPassword: "" });
    } catch (error) {
      setError("Error updating password: " + (error.response?.data?.message || "Unknown error"));
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
          <p className="hero-subtitle">Manage your profile and preferences</p>
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
              Profile
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
            <button
              className={`nav-tab ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <FiActivity className="tab-icon" />
              Activity
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

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                {/* Stats Cards */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiCalendar />
                    </div>
                    <div className="stat-content">
                      <h3>{statsLoading ? '...' : stats.totalReservations}</h3>
                      <p>Table Reservations</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiHeart />
                    </div>
                    <div className="stat-content">
                      <h3>{statsLoading ? '...' : stats.totalOrders}</h3>
                      <p>Food Orders</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiHome />
                    </div>
                    <div className="stat-content">
                      <h3>{statsLoading ? '...' : stats.totalBookings}</h3>
                      <p>Room Bookings</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiStar />
                    </div>
                    <div className="stat-content">
                      <h3>{statsLoading ? '...' : stats.loyaltyPoints}</h3>
                      <p>Loyalty Points</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiTrendingUp />
                    </div>
                    <div className="stat-content">
                      <h3>{statsLoading ? '...' : `$${stats.totalSpent.toFixed(2)}`}</h3>
                      <p>Total Spent</p>
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
                    Food Preferences
                  </h3>
                </div>
                <UserFoodPreferences
                  userId={user._id}
                  onPreferencesUpdate={(preferences) => {
                    setMessage("Food preferences updated successfully!");
                  }}
                />
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="activity-section">
                <div className="activity-cards">
                  <div className="activity-card">
                    <div className="activity-header">
                      <FiCalendar className="activity-icon" />
                      <h4>Recent Table Reservations</h4>
                    </div>
                    {statsLoading ? (
                      <p>Loading...</p>
                    ) : recentActivity.reservations.length > 0 ? (
                      <div className="activity-list">
                        {recentActivity.reservations.map((reservation, index) => (
                          <div key={index} className="activity-item">
                            <span className="activity-name">{reservation.tableName || 'Table Reservation'}</span>
                            <span className="activity-date">{new Date(reservation.date).toLocaleDateString()}</span>
                            <span className={`activity-status status-${reservation.status?.toLowerCase()}`}>
                              {reservation.status || 'Confirmed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No recent table reservations found.</p>
                    )}
                  </div>

                  <div className="activity-card">
                    <div className="activity-header">
                      <FiHeart className="activity-icon" />
                      <h4>Recent Food Orders</h4>
                    </div>
                    {statsLoading ? (
                      <p>Loading...</p>
                    ) : recentActivity.orders.length > 0 ? (
                      <div className="activity-list">
                        {recentActivity.orders.map((order, index) => (
                          <div key={index} className="activity-item">
                            <span className="activity-name">Order #{order._id?.slice(-6) || index + 1}</span>
                            <span className="activity-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span className={`activity-status status-${order.status?.toLowerCase()}`}>
                              {order.status || 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No recent food orders found.</p>
                    )}
                  </div>

                  <div className="activity-card">
                    <div className="activity-header">
                      <FiHome className="activity-icon" />
                      <h4>Recent Room Bookings</h4>
                    </div>
                    {statsLoading ? (
                      <p>Loading...</p>
                    ) : recentActivity.bookings.length > 0 ? (
                      <div className="activity-list">
                        {recentActivity.bookings.map((booking, index) => (
                          <div key={index} className="activity-item">
                            <span className="activity-name">{booking.roomName || 'Room Booking'}</span>
                            <span className="activity-date">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                            <span className={`activity-status status-${booking.status?.toLowerCase()}`}>
                              {booking.status || 'Confirmed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No recent room bookings found.</p>
                    )}
                  </div>

                  <div className="activity-card">
                    <div className="activity-header">
                      <FiStar className="activity-icon" />
                      <h4>Loyalty Status</h4>
                    </div>
                    <div className="loyalty-info">
                      <p>You have <strong>{statsLoading ? '...' : stats.loyaltyPoints}</strong> loyalty points.</p>
                      <p>Total spent: <strong>Rs. {statsLoading ? '...' : stats.totalSpent.toLocaleString()}</strong></p>
                      <div className="loyalty-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${Math.min((stats.loyaltyPoints % 100), 100)}%` }}
                          ></div>
                        </div>
                        <small>{100 - (stats.loyaltyPoints % 100)} points to next reward</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;