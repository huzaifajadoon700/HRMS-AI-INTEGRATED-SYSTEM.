  import React, { useState, useEffect } from "react";
 import "./sidebar.css"
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FiHome, FiUser, FiLayers, FiGrid, FiShoppingCart, FiUsers,
  FiBarChart, FiSettings, FiMenu, FiX, FiChevronDown, FiChevronRight,
  FiLogOut, FiSearch, FiBell, FiMail, FiCalendar, FiTrendingUp,
  FiActivity, FiStar, FiHeart, FiBookOpen, FiCoffee, FiMapPin,
  FiClock, FiDollarSign, FiPieChart, FiTarget, FiGlobe,
  FiPlus, FiEdit, FiTrash
} from "react-icons/fi";
import "./EnhancedDashboardModule.css";
import Dashboardmodule from "./dashboardmodule";
import AdminAddRoom from "./AdminAddRoom";
import AdminViewRooms from "./AdminViewRooms";
import AdminRoomUpdate from "./AdminRoomUpdate";
import AdminAddTable from "./AdminAddTable";
import AdminViewTables from "./AdminViewTables";
import AdminUpdateTable from "./AdminUpdateTable";
import AdminDeleteTable from "./AdminDeleteTable";
import AdminManageBookings from "./AdminManageBookings";
import AdminManageReservations from "./AdminManageReservations";
import AdminCustomerManagement from "./AdminCustomerManagement";
import OnlineOrderPlacement from "./OrderPlacement";
import AdminUserManagement from "./UserManagement";
import StaffManagement from "./StaffManagement";
import ShiftManagement from "./ShiftManagement";
import ReportingAnalytics from "./Reporting";
import UserProfileManagement from "./UserProfileManagement";
import RecommendationSystem from "./RecommendationSystem";
import MenuManagement from "./MenuManagement";
import AdminSettings from "./Setting";
import HotelBrandingSettings from "./HotelBrandingSettings";
import AdminDeleteRoom from "./AdminDeleteRoom";
import AdminOrders from "./AdminOrders";
import AdminViewMenus from "./AdminViewMenus";
import AdminAddMenu from "./AdminAddMenu";
import AdminUpdateMenu from "./AdminUpdateMenu";
import AdminDeleteMenu from "./AdminDeleteMenu";
import SentimentAnalysis from "./SentimentAnalysis";
import TableRecommendationAnalytics from "./TableRecommendationAnalytics";
import RecommendationEvaluation from "./RecommendationEvaluation";
import RoomRecommendationAnalytics from "./RoomRecommendationAnalytics";

const Dashboard = () => {
  const [selectedModule, setSelectedModule] = useState("Dashboard");
  const [userName, setUserName] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("name");
    if (name) {
      setUserName(name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleDropdown = (module) => {
    setOpenDropdown(openDropdown === module ? null : module);
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.enhanced-sidebar') && !event.target.closest('.mobile-menu-toggle')) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const menuItems = [
    {
      name: "Dashboard",
      icon: FiHome,
      component: "Dashboard",
      badge: "Live",
      badgeColor: "success"
    },
    {
      name: "User Profile",
      icon: FiUser,
      component: "User Profile"
    },
    {
      name: "Room Management",
      icon: FiLayers,
      submenu: [
        { name: "View Rooms", component: "AdminViewRooms", icon: FiGrid },
        { name: "Add Room", component: "AdminAddRoom", icon: FiPlus },
        { name: "Update Room", component: "AdminRoomUpdate", icon: FiEdit },
        { name: "Delete Room", component: "AdminDeleteRoom", icon: FiTrash },
        { name: "ML Analytics", component: "RoomRecommendationAnalytics", icon: FiStar }
      ],
    },
    {
      name: "Menu Management",
      icon: FiCoffee,
      submenu: [
        { name: "View Menu", component: "AdminViewMenus", icon: FiBookOpen },
        { name: "Add Menu", component: "AdminAddMenu", icon: FiPlus },
        { name: "Update Menu", component: "AdminUpdateMenu", icon: FiEdit },
        { name: "Delete Menu", component: "AdminDeleteMenu", icon: FiTrash },
        { name: "ML Analytics", component: "RecommendationEvaluation", icon: FiStar }
      ]
    },
    {
      name: "Table Management",
      icon: FiGrid,
      submenu: [
        { name: "View Tables", component: "AdminViewTables", icon: FiGrid },
        { name: "Add Table", component: "AdminAddTable", icon: FiPlus },
        { name: "Update Table", component: "AdminUpdateTable", icon: FiEdit },
        { name: "Delete Table", component: "AdminDeleteTable", icon: FiTrash },
        { name: "Analytics", component: "TableRecommendationAnalytics", icon: FiTrendingUp }
      ],
    },
    {
      name: "Order Management",
      icon: FiShoppingCart,
      badge: notifications > 0 ? notifications.toString() : null,
      badgeColor: "warning",
      submenu: [
        { name: "View Orders", component: "AdminOrders", icon: FiShoppingCart, route: "/admin/orders" },
        { name: "Manage Bookings", component: "AdminManageBookings", icon: FiCalendar },
        { name: "Manage Reservations", component: "AdminManageReservations", icon: FiMapPin }
      ]
    },
    {
      name: "Staff Management",
      icon: FiUsers,
      submenu: [
        { name: "Staff List", component: "StaffManagement", icon: FiUsers },
        { name: "Shift Management", component: "ShiftManagement", icon: FiClock }
      ]
    },
    {
      name: "Customer Management",
      icon: FiHeart,
      component: "AdminCustomerManagement"
    },
    {
      name: "Analytics & Reports",
      icon: FiBarChart,
      submenu: [
        { name: "Business Reports", component: "ReportingAnalytics", icon: FiPieChart },
        { name: "Sentiment Analysis", component: "SentimentAnalysis", icon: FiActivity },

        { name: "ML Evaluation", component: "RecommendationEvaluation", icon: FiStar }
      ]
    },
    {
      name: "Settings",
      icon: FiSettings,
      submenu: [
        { name: "System Settings", component: "AdminSettings", icon: FiSettings },
        { name: "Hotel Branding", component: "HotelBrandingSettings", icon: FiGlobe }
      ]
    }
  ];

  const renderContent = () => {
    switch (selectedModule) {
      case "Dashboard":
        return <Dashboardmodule />;
      case "User Profile":
        return <UserProfileManagement />;
      case "AdminAddRoom":
        return <AdminAddRoom />;
      case "AdminViewRooms":
        return <AdminViewRooms />;
      case "AdminRoomUpdate":
        return <AdminRoomUpdate />;
      case "AdminDeleteRoom":
        return <AdminDeleteRoom />;
      case "AdminAddTable":
        return <AdminAddTable />;
      case "AdminViewTables":
        return <AdminViewTables />;
      case "AdminUpdateTable":
        return <AdminUpdateTable />;
      case "AdminDeleteTable":
        return <AdminDeleteTable />;
      case "AdminManageBookings":
        return <AdminManageBookings />;
      case "AdminManageReservations":
        return <AdminManageReservations />;
      case "AdminCustomerManagement":
        return <AdminCustomerManagement />;
      case "Online Orders":
        return <OnlineOrderPlacement />;
      case "StaffManagement":
        return <StaffManagement />;
      case "ShiftManagement":
        return <ShiftManagement />;
      case "Menu Management":
        return <MenuManagement />;
      case "SentimentAnalysis":
        return <SentimentAnalysis />;
      case "Recommendation System":
        return <RecommendationSystem />;
      case "Reporting":
        return <ReportingAnalytics />;
      case "Settings":
      case "AdminSettings":
        return <AdminSettings />;
      case "HotelBrandingSettings":
        return <HotelBrandingSettings />;
      case "AdminOrders":
        return <AdminOrders />;
      case "AdminViewMenus":
        return <AdminViewMenus />;
      case "AdminAddMenu":
        return <AdminAddMenu />;
      case "AdminUpdateMenu":
        return <AdminUpdateMenu />;
      case "AdminDeleteMenu":
        return <AdminDeleteMenu />;
      case "TableRecommendationAnalytics":
        return <TableRecommendationAnalytics />;
      case "RecommendationEvaluation":
        return <RecommendationEvaluation />;
      case "RoomRecommendationAnalytics":
        return <RoomRecommendationAnalytics />;
      case "MenuRecommendationAnalytics":
        return <RecommendationEvaluation />;
      default:
        return <Dashboardmodule />;
    }
  };

  return (
    <div className="enhanced-dashboard-container">
      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        style={{ display: isMobileMenuOpen ? 'block' : 'none' }}
      />

      {/* Enhanced Sidebar */}
      <aside className={`enhanced-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${isMobileMenuOpen ? "mobile-open" : ""}`}>

        {/* Sidebar Toggle Button */}
        <button
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <FiChevronRight /> : <FiChevronDown />}
        </button>


        {/* Admin Profile Section */}
        {!isSidebarCollapsed && (
          <div className="admin-profile">
            <div className="profile-info">
              <h4 className="profile-name">{userName || "Default Admin"}</h4>
              <p className="profile-role">ADMINISTRATOR</p>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="sidebar-menu">
          <div className="menu-section">
            <h6 className="menu-title">
              <FiActivity className="section-icon" />
              {!isSidebarCollapsed && "Main Modules"}
            </h6>
            <ul className="menu-list">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = selectedModule === item.name || selectedModule === item.component;
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isDropdownOpen = openDropdown === item.name;

                return (
                  <React.Fragment key={item.name}>
                    <li
                      className={`menu-item ${isActive ? "active" : ""} ${hasSubmenu ? "has-submenu" : ""}`}
                      onClick={() => {
                        if (hasSubmenu) {
                          toggleDropdown(item.name);
                        } else {
                          setSelectedModule(item.component || item.name);
                          // Close mobile menu when item is selected
                          if (window.innerWidth <= 768) {
                            setIsMobileMenuOpen(false);
                          }
                        }
                      }}
                    >
                      <div className="menu-item-content">
                        <div className="menu-item-left">
                          <div className="menu-icon">
                            <IconComponent />
                          </div>
                          {!isSidebarCollapsed && (
                            <span className="menu-text">{item.name}</span>
                          )}
                        </div>

                        {!isSidebarCollapsed && (
                          <div className="menu-item-right">
                            {item.badge && (
                              <span className={`menu-badge ${item.badgeColor || 'primary'}`}>
                                {item.badge}
                              </span>
                            )}
                            {hasSubmenu && (
                              <div className="dropdown-arrow">
                                {isDropdownOpen ? <FiChevronDown /> : <FiChevronRight />}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {isSidebarCollapsed && (
                        <div className="menu-tooltip">
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className={`tooltip-badge ${item.badgeColor || 'primary'}`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </li>

                    {hasSubmenu && isDropdownOpen && !isSidebarCollapsed && (
                      <ul className="submenu">
                        {item.submenu.map((subItem) => {
                          const SubIconComponent = subItem.icon || FiGrid;
                          const isSubActive = selectedModule === subItem.component;

                          return (
                            <li
                              key={subItem.name}
                              className={`submenu-item ${isSubActive ? "active" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedModule(subItem.component);
                                // Close mobile menu when submenu item is selected
                                if (window.innerWidth <= 768) {
                                  setIsMobileMenuOpen(false);
                                }
                              }}
                            >
                              <div className="submenu-item-content">
                                <div className="submenu-icon">
                                  <SubIconComponent />
                                </div>
                                <span className="submenu-text">{subItem.name}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </React.Fragment>
                );
              })}
            </ul>
          </div>
        </div>


      </aside>

      {/* Enhanced Main Content */}
      <main className="enhanced-main-content">
        {/* Enhanced Top Navigation */}
        <nav className="enhanced-navbar">
          <div className="navbar-left">
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
            <div className="breadcrumb">
              <FiHome className="breadcrumb-icon" />
              <span className="breadcrumb-text">Dashboard</span>
              {selectedModule !== "Dashboard" && (
                <>
                  <FiChevronRight className="breadcrumb-separator" />
                  <span className="breadcrumb-current">{selectedModule}</span>
                </>
              )}
            </div>
          </div>

          <div className="navbar-center">
            <div className="global-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Global search..."
                className="search-input"
              />
              <div className="search-shortcut">⌘K</div>
            </div>
          </div>

          <div className="navbar-right">
            <div className="navbar-actions">
              <div className="notification-btn">
                <button className="action-btn" onClick={toggleNotification}>
                  <FiBell className="action-icon" />
                  {notifications > 0 && (
                    <span className="notification-badge">{notifications}</span>
                  )}
                </button>
                {isNotificationOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h4>Notifications</h4>
                      <span className="notification-count">{notifications} new</span>
                    </div>
                    <div className="notification-list">
                      <div className="notification-item">
                        <div className="notification-icon">
                          <FiShoppingCart />
                        </div>
                        <div className="notification-content">
                          <p>New order received</p>
                          <span>2 minutes ago</span>
                        </div>
                      </div>
                      <div className="notification-item">
                        <div className="notification-icon">
                          <FiCalendar />
                        </div>
                        <div className="notification-content">
                          <p>Room booking confirmed</p>
                          <span>5 minutes ago</span>
                        </div>
                      </div>
                      <div className="notification-item">
                        <div className="notification-icon">
                          <FiUsers />
                        </div>
                        <div className="notification-content">
                          <p>New staff member added</p>
                          <span>10 minutes ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="notification-footer">
                      <button className="view-all-btn">View All</button>
                    </div>
                  </div>
                )}
              </div>

              <button className="action-btn mail-btn">
                <FiMail className="action-icon" />
              </button>

              <div className="user-menu">
                <div className="user-info">
                  <div className="user-details">
                    <span className="user-name">{userName || "Default Admin"}</span>
                    <span className="user-role">ADMINISTRATOR</span>
                  </div>
                </div>
                <button className="logout-button" onClick={handleLogout}>
                  <FiLogOut className="logout-icon" />
                  <span className="logout-text">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Enhanced Content Wrapper */}
        <div className="enhanced-content-wrapper">
          <div className="content-container">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
