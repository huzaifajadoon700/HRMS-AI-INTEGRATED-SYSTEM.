import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const SimpleAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalCustomers: 0,
    totalRooms: 0,
    occupancyRate: 0,
    averageStay: 0,
    monthlyRevenue: [],
    topRooms: [],
    recentBookings: []
  });
  const [dateRange, setDateRange] = useState('thisMonth');

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchAnalytics();
  }, [navigate, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      
      // Mock data for demonstration
      setAnalytics({
        totalRevenue: 125000,
        totalBookings: 450,
        totalCustomers: 320,
        totalRooms: 50,
        occupancyRate: 78,
        averageStay: 3.2,
        monthlyRevenue: [
          { month: 'Jan', revenue: 15000 },
          { month: 'Feb', revenue: 18000 },
          { month: 'Mar', revenue: 22000 },
          { month: 'Apr', revenue: 19000 },
          { month: 'May', revenue: 25000 },
          { month: 'Jun', revenue: 26000 }
        ],
        topRooms: [
          { roomNumber: 101, bookings: 25, revenue: 12500 },
          { roomNumber: 205, bookings: 22, revenue: 11000 },
          { roomNumber: 301, bookings: 20, revenue: 15000 },
          { roomNumber: 102, bookings: 18, revenue: 9000 },
          { roomNumber: 203, bookings: 16, revenue: 8000 }
        ],
        recentBookings: [
          { id: 1, customer: 'John Doe', room: 101, checkIn: '2024-01-15', amount: 500 },
          { id: 2, customer: 'Jane Smith', room: 205, checkIn: '2024-01-14', amount: 750 },
          { id: 3, customer: 'Mike Johnson', room: 301, checkIn: '2024-01-13', amount: 1200 },
          { id: 4, customer: 'Sarah Wilson', room: 102, checkIn: '2024-01-12', amount: 600 },
          { id: 5, customer: 'David Brown', room: 203, checkIn: '2024-01-11', amount: 450 }
        ]
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="simple-admin-container"><p>Loading analytics...</p></div>;

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Analytics & Reports</h1>
        <p>Business performance and statistics</p>
      </div>

      <div className="simple-admin-controls">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="simple-search-input"
          style={{ maxWidth: '200px' }}
        >
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="thisYear">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="simple-stats-grid">
        <div className="simple-stat-card">
          <h3>Total Revenue</h3>
          <div className="stat-number">Rs. {analytics.totalRevenue.toLocaleString()}</div>
          <div className="stat-label">This Month</div>
        </div>
        <div className="simple-stat-card">
          <h3>Total Bookings</h3>
          <div className="stat-number">{analytics.totalBookings}</div>
          <div className="stat-label">This Month</div>
        </div>
        <div className="simple-stat-card">
          <h3>Total Customers</h3>
          <div className="stat-number">{analytics.totalCustomers}</div>
          <div className="stat-label">Registered</div>
        </div>
        <div className="simple-stat-card">
          <h3>Occupancy Rate</h3>
          <div className="stat-number">{analytics.occupancyRate}%</div>
          <div className="stat-label">Current</div>
        </div>
      </div>

      {/* Monthly Revenue */}
      <div className="simple-table-container" style={{ marginTop: '30px' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, color: '#111827' }}>Monthly Revenue</h3>
        </div>
        <table className="simple-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Revenue</th>
              <th>Growth</th>
            </tr>
          </thead>
          <tbody>
            {analytics.monthlyRevenue.map((item, index) => {
              const prevRevenue = index > 0 ? analytics.monthlyRevenue[index - 1].revenue : item.revenue;
              const growth = index > 0 ? ((item.revenue - prevRevenue) / prevRevenue * 100).toFixed(1) : 0;
              return (
                <tr key={item.month}>
                  <td>{item.month}</td>
                  <td>Rs. {item.revenue.toLocaleString()}</td>
                  <td style={{ color: growth >= 0 ? '#059669' : '#dc2626' }}>
                    {growth >= 0 ? '+' : ''}{growth}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Top Performing Rooms */}
      <div className="simple-table-container" style={{ marginTop: '30px' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, color: '#111827' }}>Top Performing Rooms</h3>
        </div>
        <table className="simple-table">
          <thead>
            <tr>
              <th>Room Number</th>
              <th>Total Bookings</th>
              <th>Revenue Generated</th>
              <th>Average per Booking</th>
            </tr>
          </thead>
          <tbody>
            {analytics.topRooms.map(room => (
              <tr key={room.roomNumber}>
                <td>Room {room.roomNumber}</td>
                <td>{room.bookings}</td>
                <td>Rs. {room.revenue.toLocaleString()}</td>
                <td>Rs. {Math.round(room.revenue / room.bookings).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Bookings */}
      <div className="simple-table-container" style={{ marginTop: '30px' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, color: '#111827' }}>Recent Bookings</h3>
        </div>
        <table className="simple-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Room</th>
              <th>Check-in Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {analytics.recentBookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.customer}</td>
                <td>Room {booking.room}</td>
                <td>{booking.checkIn}</td>
                <td>Rs. {booking.amount}</td>
                <td>
                  <span className="simple-status simple-status-confirmed">
                    Confirmed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="simple-stat-card">
          <h3>Average Stay Duration</h3>
          <div className="stat-number">{analytics.averageStay} days</div>
          <div className="stat-label">Per Booking</div>
        </div>
        <div className="simple-stat-card">
          <h3>Total Rooms</h3>
          <div className="stat-number">{analytics.totalRooms}</div>
          <div className="stat-label">Available</div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAnalytics;
