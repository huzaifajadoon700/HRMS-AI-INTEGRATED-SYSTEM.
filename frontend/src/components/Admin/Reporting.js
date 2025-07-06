import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const ReportingAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    totalBookings: 156,
    totalRevenue: 45780,
    totalUsers: 89,
    averageOrderValue: 520,
    monthlyGrowth: 12.5,
    popularItems: [
      { name: "Deluxe Room", bookings: 45, revenue: 22500 },
      { name: "Standard Room", bookings: 67, revenue: 16750 },
      { name: "Suite Room", bookings: 23, revenue: 18400 },
      { name: "Family Room", bookings: 21, revenue: 12600 }
    ],
    recentOrders: [
      { id: "ORD001", customer: "John Doe", amount: 750, date: "2024-01-15", status: "Completed" },
      { id: "ORD002", customer: "Jane Smith", amount: 450, date: "2024-01-14", status: "Pending" },
      { id: "ORD003", customer: "Mike Johnson", amount: 890, date: "2024-01-13", status: "Completed" },
      { id: "ORD004", customer: "Sarah Wilson", amount: 320, date: "2024-01-12", status: "Cancelled" }
    ]
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [navigate]);

  if (loading) return <div className="simple-admin-container"><p>Loading...</p></div>;

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Business Analytics & Reports</h1>
        <p>Comprehensive overview of your business performance</p>
      </div>

      <div className="simple-admin-controls">
        <button className="simple-btn simple-btn-primary">Export PDF</button>
        <button className="simple-btn simple-btn-secondary">Export Excel</button>
        <button className="simple-btn simple-btn-secondary">Print Report</button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="simple-table-container" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: '#000000', margin: '0 0 10px 0' }}>{reportData.totalBookings}</h3>
          <p style={{ color: '#000000', margin: 0 }}>Total Bookings</p>
        </div>
        
        <div className="simple-table-container" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: '#000000', margin: '0 0 10px 0' }}>Rs. {reportData.totalRevenue.toLocaleString()}</h3>
          <p style={{ color: '#000000', margin: 0 }}>Total Revenue</p>
        </div>
        
        <div className="simple-table-container" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: '#000000', margin: '0 0 10px 0' }}>{reportData.totalUsers}</h3>
          <p style={{ color: '#000000', margin: 0 }}>Total Users</p>
        </div>
        
        <div className="simple-table-container" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: '#000000', margin: '0 0 10px 0' }}>Rs. {reportData.averageOrderValue}</h3>
          <p style={{ color: '#000000', margin: 0 }}>Average Order Value</p>
        </div>
      </div>

      {/* Popular Items */}
      <div className="simple-table-container">
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, color: '#000000' }}>Popular Items Performance</h3>
        </div>
        <table className="simple-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Bookings</th>
              <th className="hide-mobile">Revenue</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {reportData.popularItems.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.bookings}</td>
                <td className="hide-mobile">Rs. {item.revenue.toLocaleString()}</td>
                <td>
                  <span className="simple-status simple-status-available">
                    {item.bookings > 40 ? 'Excellent' : item.bookings > 25 ? 'Good' : 'Average'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Orders */}
      <div className="simple-table-container" style={{ marginTop: '30px' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, color: '#000000' }}>Recent Orders</h3>
        </div>
        <table className="simple-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th className="hide-mobile">Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reportData.recentOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>Rs. {order.amount}</td>
                <td className="hide-mobile">{order.date}</td>
                <td>
                  <span className={`simple-status simple-status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Insights */}
      <div className="simple-table-container" style={{ marginTop: '30px' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, color: '#000000' }}>Key Business Insights</h3>
        </div>
        <div style={{ padding: '20px' }}>
          <ul style={{ color: '#000000', lineHeight: '1.8' }}>
            <li><strong>Revenue Growth:</strong> Monthly growth rate of {reportData.monthlyGrowth}% indicates strong business performance</li>
            <li><strong>Popular Services:</strong> Deluxe and Standard rooms are the most booked items</li>
            <li><strong>Customer Base:</strong> {reportData.totalUsers} active users with average order value of Rs. {reportData.averageOrderValue}</li>
            <li><strong>Order Status:</strong> Most orders are completed successfully with minimal cancellations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportingAnalytics;
