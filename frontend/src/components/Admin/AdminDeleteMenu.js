import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container,  Button, Spinner, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminManageRooms.css";
import "./AdminDeleteMenu.css";

const AdminDeleteMenu = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/admin/login");
      return;
    }
    fetchMenuItems();
  }, [navigate]);

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
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      const response = await axios.get(`${apiUrl}/menus`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
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

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem("token");

      // Check if user is authenticated
      if (!token) {
        toast.error("Please login to delete menu items");
        navigate("/admin/login");
        return;
      }

      console.log("Deleting menu item:", selectedItem._id);

      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      const response = await axios.delete(`${apiUrl}/menus/${selectedItem._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Delete response:", response);
      toast.success("Menu item deleted successfully");

      // Refresh the menu items list
      await fetchMenuItems();
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting menu item:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/admin/login");
        return;
      }

      toast.error(error.response?.data?.message || "Error deleting menu item");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="enhanced-delete-menu-module-container">
    <Container fluid className="delete-menu-container">
      <div className="delete-menu-header">
        <h2>Delete Menu Items</h2>
      </div>

      {menuItems.length === 0 ? (
        <div className="no-items-message">
          <h4>No menu items found</h4>
          <p>There are no menu items available to delete.</p>
        </div>
      ) : (
        <div className="menu-items-grid">
          {menuItems.map((item) => (
            <div key={item._id} className="menu-item-card">
              <div className="menu-item-image">
                <img
                  src={
                    item.image
                      ? (item.image.startsWith('http://') || item.image.startsWith('https://'))
                        ? item.image
                        : `${process.env.REACT_APP_API_URL || 'https://hrms-bace.vercel.app'}${item.image}`
                      : "/placeholder-food.jpg"
                  }
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = "/placeholder-food.jpg";
                    e.target.onerror = null;
                  }}
                />
              </div>
              <div className="menu-item-info">
                <h4>{item.name}</h4>
                <p className="item-category">{item.category}</p>
                <p className="item-price">Rs. {item.price?.toFixed(0) || '0'}</p>
                <p className="item-availability">
                  Status: <span className={item.availability ? 'available' : 'unavailable'}>
                    {item.availability ? 'Available' : 'Unavailable'}
                  </span>
                </p>
                <Button
                  variant="danger"
                  className="delete-button"
                  size="lg"
                  onClick={() => {
                    console.log("Delete button clicked for item:", item);
                    setSelectedItem(item);
                    setShowDeleteModal(true);
                  }}
                >
                  🗑️ DELETE THIS ITEM
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        className="delete-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: 'linear-gradient(135deg, #dc3545 0%, #ff4757 100%)',
              border: '2px solid #dc3545',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '0.75rem 2rem'
            }}
          >
            {deleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                DELETING...
              </>
            ) : (
              "🗑️ YES, DELETE IT!"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </div>
  );
};

export default AdminDeleteMenu;