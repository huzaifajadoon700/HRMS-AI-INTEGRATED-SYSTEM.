import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminDeleteMenu = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [deletingItemId, setDeletingItemId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchMenuItems();
  }, [navigate, fetchMenuItems]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login to view menu items");
        navigate("/admin/login");
        return;
      }

      console.log("Fetching menu items...");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/menus`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Menu items response:", response.data);

      if (response.data && Array.isArray(response.data)) {
        setMenuItems(response.data);
      } else {
        console.error("Invalid response format:", response.data);
        toast.error("Failed to load menu items - invalid response format");
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/admin/login");
        return;
      }

      toast.error(error.response?.data?.message || "Error fetching menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this menu item? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingItemId(itemId);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      await axios.delete(`${apiUrl}/menus/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Menu item deleted successfully!");
      fetchMenuItems();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error(
        error.response?.data?.message || "Failed to delete menu item"
      );
    } finally {
      setDeletingItemId(null);
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
        <h1>Delete Menu Items</h1>
        <p>Select a menu item to remove it from the system</p>
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
          style={{ minWidth: "1100px", width: "100%" }}
        >
          <thead>
            <tr>
              <th style={{ minWidth: "100px" }}>Image</th>
              <th style={{ minWidth: "150px" }}>Name</th>
              <th style={{ minWidth: "120px" }}>Category</th>
              <th style={{ minWidth: "100px" }}>Price</th>
              <th style={{ minWidth: "100px" }}>Status</th>
              <th style={{ minWidth: "200px" }}>Description</th>
              <th style={{ minWidth: "200px" }}>Ingredients</th>
              <th style={{ minWidth: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item._id}>
                <td>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="simple-room-image"
                    />
                  ) : (
                    <div className="simple-no-image">No Image</div>
                  )}
                </td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>Rs. {item.price}</td>
                <td>
                  <span
                    className={`simple-status simple-status-${item.status?.toLowerCase()}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="simple-description">{item.description}</td>
                <td className="simple-description">{item.ingredients}</td>
                <td>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="simple-btn simple-btn-small simple-btn-danger"
                    disabled={deletingItemId === item._id}
                  >
                    {deletingItemId === item._id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {menuItems.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p>No menu items found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDeleteMenu;
