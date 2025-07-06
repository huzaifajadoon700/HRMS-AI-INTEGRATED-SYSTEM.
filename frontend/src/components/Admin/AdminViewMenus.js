import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminViewMenus = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchMenus();
  }, [navigate]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/menus`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenus(response.data);
    } catch (error) {
      console.error("Error fetching menus:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
      toast.error("Failed to fetch menus");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (menuId) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        const token = localStorage.getItem("token");
        const apiUrl =
          process.env.REACT_APP_API_BASE_URL ||
          "https://hrms-bace.vercel.app/api";
        await axios.delete(`${apiUrl}/menus/${menuId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Menu item deleted successfully");
        fetchMenus();
      } catch (error) {
        console.error("Error deleting menu:", error);
        toast.error("Failed to delete menu item");
      }
    }
  };

  const filteredMenus = menus.filter(
    (menu) =>
      menu.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="simple-admin-container">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>View Menu Items</h1>
        <p>All menu items in simple table format</p>
      </div>

      <div className="simple-admin-controls">
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="simple-search-input"
        />
        <button
          onClick={() => navigate("/admin/add-menu")}
          className="simple-btn simple-btn-primary"
        >
          Add New Menu Item
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
          style={{ minWidth: "1000px", width: "100%" }}
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
            {filteredMenus.map((menu) => (
              <tr key={menu._id}>
                <td style={{ minWidth: "100px" }}>
                  {menu.image ? (
                    <img
                      src={menu.image}
                      alt={menu.name}
                      className="simple-room-image"
                      style={{
                        width: "60px",
                        height: "40px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  ) : (
                    <div
                      className="simple-no-image"
                      style={{ fontSize: "12px", color: "#6b7280" }}
                    >
                      No Image
                    </div>
                  )}
                </td>
                <td style={{ minWidth: "150px" }}>{menu.name}</td>
                <td style={{ minWidth: "120px" }}>{menu.category}</td>
                <td style={{ minWidth: "100px" }}>Rs. {menu.price}</td>
                <td style={{ minWidth: "100px" }}>
                  <span
                    className={`simple-status simple-status-${menu.status?.toLowerCase()}`}
                  >
                    {menu.status}
                  </span>
                </td>
                <td
                  style={{
                    minWidth: "200px",
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {menu.description}
                </td>
                <td
                  style={{
                    minWidth: "200px",
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {menu.ingredients}
                </td>
                <td style={{ minWidth: "120px" }}>
                  <button
                    onClick={() => handleDelete(menu._id)}
                    className="simple-btn simple-btn-small simple-btn-danger"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMenus.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p>No menu items found.</p>
          <button
            onClick={() => navigate("/admin/add-menu")}
            className="simple-btn simple-btn-primary"
          >
            Add First Menu Item
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminViewMenus;
