import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./simple-admin.css";

const AdminOrders = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
      } else if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error("Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      await axios.put(
        `${apiUrl}/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "simple-status-pending";
      case "processing":
        return "simple-status-processing";
      case "completed":
        return "simple-status-available";
      case "cancelled":
        return "simple-status-unavailable";
      default:
        return "simple-status-pending";
    }
  };

  if (loading)
    return (
      <div className="simple-admin-container">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>View Orders</h1>
        <p>Manage customer orders and update their status</p>
      </div>

      <div className="simple-admin-controls">
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="simple-btn simple-btn-primary"
        >
          {loading ? "Loading..." : "Refresh Orders"}
        </button>
      </div>

      {/* Table scroll hint for mobile */}
      <div
        style={{
          marginBottom: "10px",
          fontSize: "14px",
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        {window.innerWidth <= 768 && (
          <span>← Swipe left/right to see all columns →</span>
        )}
      </div>

      <div
        className="simple-table-container"
        style={{ overflowX: "auto", width: "100%" }}
      >
        <table
          className="simple-table"
          style={{ minWidth: "900px", width: "100%" }}
        >
          <thead>
            <tr>
              <th style={{ minWidth: "120px" }}>Order ID</th>
              <th style={{ minWidth: "180px" }}>Customer</th>
              <th style={{ minWidth: "200px" }}>Items</th>
              <th style={{ minWidth: "120px" }}>Total Amount</th>
              <th style={{ minWidth: "100px" }}>Status</th>
              <th style={{ minWidth: "120px" }}>Date</th>
              <th style={{ minWidth: "160px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td style={{ minWidth: "120px" }}>
                  #{order.orderNumber || order._id.slice(-8)}
                </td>
                <td style={{ minWidth: "180px" }}>
                  <div>
                    <div style={{ fontWeight: "bold" }}>
                      {order.customerName || order.customer?.name || "N/A"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {order.customerEmail || order.customer?.email || ""}
                    </div>
                  </div>
                </td>
                <td
                  style={{
                    minWidth: "200px",
                    maxWidth: "200px",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ maxWidth: "200px" }}>
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          fontSize: "12px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name} x{item.quantity}
                      </div>
                    )) || "No items"}
                  </div>
                </td>
                <td style={{ minWidth: "120px" }}>
                  Rs. {order.totalAmount || order.totalPrice || 0}
                </td>
                <td style={{ minWidth: "100px" }}>
                  <span
                    className={`simple-status ${getStatusColor(order.status)}`}
                  >
                    {order.status || "Pending"}
                  </span>
                </td>
                <td style={{ minWidth: "120px" }}>
                  {formatDate(order.createdAt)}
                </td>
                <td>
                  <div className="simple-actions">
                    {order.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(order._id, "processing")
                          }
                          className="simple-btn simple-btn-small"
                          disabled={updatingOrderId === order._id}
                        >
                          {updatingOrderId === order._id
                            ? "Updating..."
                            : "Process"}
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(order._id, "completed")
                          }
                          className="simple-btn simple-btn-small simple-btn-success"
                          disabled={updatingOrderId === order._id}
                        >
                          Complete
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(order._id, "cancelled")
                          }
                          className="simple-btn simple-btn-small simple-btn-danger"
                          disabled={updatingOrderId === order._id}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {order.status === "processing" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(order._id, "completed")
                        }
                        className="simple-btn simple-btn-small simple-btn-success"
                        disabled={updatingOrderId === order._id}
                      >
                        {updatingOrderId === order._id
                          ? "Updating..."
                          : "Complete"}
                      </button>
                    )}
                    {(order.status === "completed" ||
                      order.status === "cancelled") && (
                      <span style={{ color: "#666", fontSize: "12px" }}>
                        No actions
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p>No orders found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
