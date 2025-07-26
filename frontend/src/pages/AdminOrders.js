import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Alert } from "react-bootstrap";
import { initializeSocket, disconnectSocket } from "../services/socketService";
import { apiConfig } from "../config/api";
import { toast } from "react-hot-toast";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();

    // Initialize socket for admin updates
    initializeSocket("admin");

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please login.");
        return;
      }

      const response = await axios.get(apiConfig.endpoints.orders, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Fetched orders:", response.data);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.response?.data?.message || "Failed to fetch orders");
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication required. Please login.");
        return;
      }

      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";

      // Use PATCH method as defined in the backend routes
      await axios.patch(
        `${apiUrl}/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state immediately for better UX
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, status: newStatus, deliveryStatus: newStatus }
            : order
        )
      );

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update order status";
      toast.error(errorMessage);
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "status-success";
      case "pending":
      case "preparing":
        return "status-warning";
      case "out for delivery":
        return "status-warning";
      default:
        return "status-error";
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="loading-spinner">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Orders</Alert.Heading>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchOrders}>
            Retry
          </button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Admin Orders Management</h2>
      {orders.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>No Orders Found</Alert.Heading>
          <p>There are currently no orders to display.</p>
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Customer Email</th>
              <th>Food Items</th>
              <th>Total Price</th>
              <th>Delivery Address</th>
              <th>Order Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.user?.name || "N/A"}</td>
                <td>{order.user?.email || "N/A"}</td>
                <td>
                  {order.items && order.items.length > 0
                    ? order.items
                        .map((item) => `${item.name} (x${item.quantity})`)
                        .join(", ")
                    : "No items"}
                </td>
                <td>${order.totalPrice?.toFixed(2) || "0.00"}</td>
                <td>{order.deliveryAddress || "N/A"}</td>
                <td>
                  <span
                    className={`status-badge ${getStatusClass(
                      order.status || order.deliveryStatus
                    )}`}
                  >
                    {order.status || order.deliveryStatus || "pending"}
                  </span>
                </td>
                <td>
                  <Form.Select
                    value={order.status || order.deliveryStatus || "pending"}
                    onChange={(e) =>
                      updateOrderStatus(order._id, e.target.value)
                    }
                    className="update-indicator"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="canceled">Canceled</option>
                  </Form.Select>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default AdminOrders;
