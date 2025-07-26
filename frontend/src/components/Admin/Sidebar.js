import React, { useState, useEffect } from "react";
import "./sidebar.css";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FiHome,
  FiUser,
  FiLayers,
  FiGrid,
  FiShoppingCart,
  FiUsers,
  FiBarChart,
  FiSettings,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
  FiSearch,
  FiBell,
  FiMail,
  FiCalendar,
  FiTrendingUp,
  FiActivity,
  FiStar,
  FiHeart,
  FiBookOpen,
  FiCoffee,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiPieChart,
  FiTarget,
  FiGlobe,
  FiPlus,
  FiEdit,
  FiTrash,
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

const Sidebar = () => {
  const [selectedModule, setSelectedModule] = useState("Dashboard");
  const [userName, setUserName] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [forceUpdate, setForceUpdate] = useState(0);
  const navigate = useNavigate();

  // Simple function to change module
  const handleModuleChange = (newModule) => {
    console.log("=== MODULE CHANGE ===");
    console.log("From:", selectedModule);
    console.log("To:", newModule);
    console.log("Is Mobile:", isMobile);
    console.log("Mobile Menu Open:", isMobileMenuOpen);

    // Force immediate state update
    setSelectedModule(newModule);
    setForceUpdate(prev => prev + 1);

    // Close mobile menu and dropdown immediately
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);

    // Additional mobile-specific handling
    if (isMobile) {
      // Ensure body scroll is restored
      document.body.style.overflow = "unset";
      console.log("Mobile menu closed after navigation");

      // Force a re-render to ensure the component updates
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
      }, 50);
    }
  };

  useEffect(() => {
    const name = localStorage.getItem("name");
    if (name) {
      setUserName(name);
    }

    // Handle window resize for mobile responsiveness
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        // Close mobile menu when switching to desktop
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Monitor selectedModule changes
  useEffect(() => {
    console.log("selectedModule state changed to:", selectedModule);
    console.log("Force update counter:", forceUpdate);
    console.log("Is mobile:", isMobile);
    console.log("Mobile menu open:", isMobileMenuOpen);
  }, [selectedModule, forceUpdate, isMobile, isMobileMenuOpen]);

  // Monitor openDropdown changes
  useEffect(() => {
    console.log("openDropdown state changed to:", openDropdown);
  }, [openDropdown]);

  // Listen for admin module change events from child components
  useEffect(() => {
    const handleAdminModuleChange = (event) => {
      console.log("=== ADMIN MODULE CHANGE EVENT RECEIVED ===");
      console.log("Event detail:", event.detail);
      console.log("Target module:", event.detail.module);

      if (event.detail && event.detail.module) {
        handleModuleChange(event.detail.module);
      }
    };

    window.addEventListener('adminModuleChange', handleAdminModuleChange);

    return () => {
      window.removeEventListener('adminModuleChange', handleAdminModuleChange);
    };
  }, []);

  const handleLogout = () => {
    console.log("=== LOGOUT TRIGGERED ===");
    console.log("Clearing localStorage and navigating to home");
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      // On mobile, toggle mobile menu instead of collapsing
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      // On desktop, collapse/expand sidebar
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const toggleDropdown = (module) => {
    console.log("=== TOGGLE DROPDOWN ===");
    console.log("Module:", module);
    console.log("Current openDropdown:", openDropdown);
    console.log("Is Mobile:", isMobile);

    const newState = openDropdown === module ? null : module;
    console.log("Setting openDropdown to:", newState);
    setOpenDropdown(newState);
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        !event.target.closest(".enhanced-sidebar") &&
        !event.target.closest(".mobile-menu-toggle")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const menuItems = [
    {
      name: "Dashboard",
      icon: FiHome,
      component: "Dashboard",
      badge: "Live",
      badgeColor: "success",
    },
    {
      name: "User Profile",
      icon: FiUser,
      component: "User Profile",
    },
    {
      name: "Room Management",
      icon: FiLayers,
      submenu: [
        { name: "View Rooms", component: "AdminViewRooms", icon: FiGrid },
        { name: "Add Room", component: "AdminAddRoom", icon: FiPlus },
        { name: "Update Room", component: "AdminRoomUpdate", icon: FiEdit },
        { name: "Delete Room", component: "AdminDeleteRoom", icon: FiTrash },
        {
          name: "ML Analytics",
          component: "RoomRecommendationAnalytics",
          icon: FiStar,
        },
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
        {
          name: "ML Analytics",
          component: "RecommendationEvaluation",
          icon: FiStar,
        },
      ],
    },
    {
      name: "Table Management",
      icon: FiGrid,
      submenu: [
        { name: "View Tables", component: "AdminViewTables", icon: FiGrid },
        { name: "Add Table", component: "AdminAddTable", icon: FiPlus },
        { name: "Update Table", component: "AdminUpdateTable", icon: FiEdit },
        { name: "Delete Table", component: "AdminDeleteTable", icon: FiTrash },
        {
          name: "Analytics",
          component: "TableRecommendationAnalytics",
          icon: FiTrendingUp,
        },
      ],
    },
    {
      name: "Order Management",
      icon: FiShoppingCart,
      badge: notifications > 0 ? notifications.toString() : null,
      badgeColor: "warning",
      submenu: [
        {
          name: "View Orders",
          component: "AdminOrders",
          icon: FiShoppingCart,
          route: "/admin/orders",
        },
        {
          name: "Manage Bookings",
          component: "AdminManageBookings",
          icon: FiCalendar,
        },
        {
          name: "Manage Reservations",
          component: "AdminManageReservations",
          icon: FiMapPin,
        },
      ],
    },
    {
      name: "Staff Management",
      icon: FiUsers,
      submenu: [
        { name: "Staff List", component: "StaffManagement", icon: FiUsers },
        {
          name: "Shift Management",
          component: "ShiftManagement",
          icon: FiClock,
        },
      ],
    },
    {
      name: "Customer Management",
      icon: FiHeart,
      component: "AdminCustomerManagement",
    },
    {
      name: "Analytics & Reports",
      icon: FiBarChart,
      submenu: [
        {
          name: "Business Reports",
          component: "ReportingAnalytics",
          icon: FiPieChart,
        },
        {
          name: "Sentiment Analysis",
          component: "SentimentAnalysis",
          icon: FiActivity,
        },

        {
          name: "ML Evaluation",
          component: "RecommendationEvaluation",
          icon: FiStar,
        },
      ],
    },
    {
      name: "Settings",
      icon: FiSettings,
      submenu: [
        {
          name: "System Settings",
          component: "AdminSettings",
          icon: FiSettings,
        },
        {
          name: "Hotel Branding",
          component: "HotelBrandingSettings",
          icon: FiGlobe,
        },
      ],
    },
  ];

  const renderContent = () => {
    console.log("=== RENDER CONTENT ===");
    console.log("selectedModule:", selectedModule);
    console.log("Type:", typeof selectedModule);

    switch (selectedModule) {
      case "Dashboard":
        return <Dashboardmodule key="dashboard" />;
      case "User Profile":
        return <UserProfileManagement key="user-profile" />;
      case "AdminAddRoom":
        return <AdminAddRoom key="add-room" />;
      case "AdminViewRooms":
        return <AdminViewRooms key="view-rooms" />;
      case "AdminRoomUpdate":
        return <AdminRoomUpdate key="update-room" />;
      case "AdminDeleteRoom":
        return <AdminDeleteRoom key="delete-room" />;
      case "AdminAddTable":
        return <AdminAddTable key="add-table" />;
      case "AdminViewTables":
        return <AdminViewTables key="view-tables" />;
      case "AdminUpdateTable":
        return <AdminUpdateTable key="update-table" />;
      case "AdminDeleteTable":
        return <AdminDeleteTable key="delete-table" />;
      case "AdminManageBookings":
        return <AdminManageBookings key="manage-bookings" />;
      case "AdminManageReservations":
        return <AdminManageReservations key="manage-reservations" />;
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
      case "ReportingAnalytics":
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
        console.warn("=== DEFAULT CASE TRIGGERED ===");
        console.warn("No component matched for selectedModule:", selectedModule);
        console.warn("Type of selectedModule:", typeof selectedModule);
        console.warn("Available cases: Dashboard, User Profile, AdminAddRoom, AdminViewRooms, AdminRoomUpdate, AdminDeleteRoom, AdminAddTable, AdminViewTables, AdminUpdateTable, AdminDeleteTable, AdminManageBookings, AdminManageReservations, AdminCustomerManagement, StaffManagement, ShiftManagement, SentimentAnalysis, ReportingAnalytics, AdminSettings, HotelBrandingSettings, AdminOrders, AdminViewMenus, AdminAddMenu, AdminUpdateMenu, AdminDeleteMenu, TableRecommendationAnalytics, RecommendationEvaluation, RoomRecommendationAnalytics");
        console.warn("Falling back to Dashboard");
        return <Dashboardmodule />;
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={(e) => {
          // Only close if clicking the overlay itself, not child elements
          if (e.target === e.currentTarget) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Mobile overlay clicked - closing menu");
            setIsMobileMenuOpen(false);
            document.body.style.overflow = "unset";
          }
        }}
        style={{
          display: isMobileMenuOpen ? "block" : "none",
          position: "fixed",
          top: 0,
          left: 280, // Start after the sidebar width
          width: "calc(100% - 280px)",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 999,
          pointerEvents: isMobileMenuOpen ? "auto" : "none"
        }}
      />

      {/* Clean Sidebar */}
      <aside
        className={`admin-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${
          isMobileMenuOpen ? "mobile-open" : ""
        }`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">H</div>
          {!isSidebarCollapsed && (
            <div>
              <h3 className="sidebar-title">HRMS</h3>
              <p className="sidebar-subtitle">Dashboard</p>
            </div>
          )}
          {/* Mobile Close Button */}
          {isMobile && isMobileMenuOpen && (
            <button
              className="mobile-close-btn"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: "absolute",
                right: "15px",
                top: "15px",
                background: "transparent",
                border: "none",
                fontSize: "20px",
                color: "#000000",
                cursor: "pointer",
                padding: "5px",
                borderRadius: "4px",
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            {!isSidebarCollapsed && (
              <h6 className="nav-section-title" style={{ color: "#000000" }}>
                Main Modules
              </h6>
            )}
            <ul className="nav-list">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive =
                  selectedModule === item.name ||
                  selectedModule === item.component;
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isDropdownOpen = openDropdown === item.name;

                return (
                  <React.Fragment key={item.name}>
                    <li className="nav-item">
                      <div
                        className={`nav-link ${isActive ? "active" : ""}`}
                        style={{
                          color: "#000000 !important",
                          textDecoration: "none",
                          cursor: "pointer",
                          userSelect: "none"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = "#000000";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = "#000000";
                        }}
                        onTouchStart={(e) => {
                          console.log("=== TOUCH START EVENT ===");
                          console.log("Touch start detected on:", item.name);
                        }}
                        onTouchEnd={(e) => {
                          console.log("=== TOUCH END EVENT ===");
                          console.log("Touch end detected on:", item.name);

                          // Prevent click event from firing after touch
                          e.preventDefault();
                          e.stopPropagation();

                          // Trigger appropriate action for mobile
                          if (isMobile) {
                            const hasSubmenu = item.submenu && item.submenu.length > 0;
                            console.log("Has submenu:", hasSubmenu);

                            if (hasSubmenu) {
                              console.log("Mobile touch - opening dropdown for:", item.name);
                              toggleDropdown(item.name);
                            } else {
                              console.log("Mobile touch - triggering navigation");
                              const newModule = item.component || item.name;
                              console.log("Calling handleModuleChange with:", newModule);
                              console.log("Current selectedModule before change:", selectedModule);
                              handleModuleChange(newModule);
                              console.log("handleModuleChange called successfully");
                            }
                          }
                        }}

                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          // Skip click handling on mobile (use touch events instead)
                          if (isMobile) {
                            console.log("=== CLICK EVENT SKIPPED ON MOBILE ===");
                            return;
                          }

                          console.log("=== MENU ITEM CLICKED ===");
                          console.log("Item:", item.name);
                          console.log("Component:", item.component);
                          console.log("Has submenu:", hasSubmenu);
                          console.log("Is Mobile:", isMobile);
                          console.log("Mobile Menu Open:", isMobileMenuOpen);
                          console.log("Event target:", e.target);
                          console.log("Current target:", e.currentTarget);

                          if (hasSubmenu) {
                            console.log("Opening dropdown for:", item.name);
                            toggleDropdown(item.name);
                          } else {
                            const newModule = item.component || item.name;
                            console.log("Calling handleModuleChange with:", newModule);
                            console.log("Current selectedModule before change:", selectedModule);
                            handleModuleChange(newModule);
                            console.log("handleModuleChange called successfully");
                          }
                        }}
                      >
                        <IconComponent
                          className="nav-icon"
                          style={{ color: "#000000 !important" }}
                          onMouseEnter={(e) => {
                            e.target.style.color = "#000000";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = "#000000";
                          }}
                        />
                        {!isSidebarCollapsed && (
                          <>
                            <span style={{ color: "#000000 !important" }}>
                              {item.name}
                            </span>
                            {item.badge && (
                              <span className="nav-badge">{item.badge}</span>
                            )}
                            {hasSubmenu && (
                              <FiChevronDown
                                className={`nav-chevron ${
                                  isDropdownOpen ? "open" : ""
                                }`}
                                style={{ color: "#000000 !important" }}
                                onMouseEnter={(e) => {
                                  e.target.style.color = "#000000";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.color = "#000000";
                                }}
                              />
                            )}
                          </>
                        )}
                      </div>

                      {isSidebarCollapsed && (
                        <div className="menu-tooltip">
                          <span>{item.name}</span>
                          {item.badge && (
                            <span
                              className={`tooltip-badge ${
                                item.badgeColor || "primary"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </li>

                    {hasSubmenu && isDropdownOpen && (!isSidebarCollapsed || isMobile) && (
                      <ul className="nav-submenu">
                        {item.submenu.map((subItem) => {
                          const SubIconComponent = subItem.icon || FiGrid;
                          const isSubActive =
                            selectedModule === subItem.component;

                          return (
                            <li key={subItem.name} className="nav-item">
                              <div
                                className={`nav-link submenu-link ${
                                  isSubActive ? "active" : ""
                                }`}
                                style={{
                                  color: "#000000 !important",
                                  textDecoration: "none",
                                  cursor: "pointer",
                                  userSelect: "none"
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.color = "#000000";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.color = "#000000";
                                }}
                                onTouchStart={(e) => {
                                  console.log("=== SUBMENU TOUCH START ===");
                                  console.log("Touch start on submenu:", subItem.name);
                                }}
                                onTouchEnd={(e) => {
                                  console.log("=== SUBMENU TOUCH END ===");
                                  console.log("Touch end on submenu:", subItem.name);

                                  // Prevent click event from firing after touch
                                  e.preventDefault();
                                  e.stopPropagation();

                                  // Trigger navigation for mobile
                                  if (isMobile) {
                                    console.log("Mobile submenu touch - triggering navigation");
                                    const newModule = subItem.component;
                                    console.log("Calling handleModuleChange with:", newModule);
                                    console.log("Current selectedModule before change:", selectedModule);
                                    handleModuleChange(newModule);
                                    console.log("handleModuleChange called successfully");
                                  }
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  // Skip click handling on mobile (use touch events instead)
                                  if (isMobile) {
                                    console.log("=== SUBMENU CLICK EVENT SKIPPED ON MOBILE ===");
                                    return;
                                  }

                                  console.log("=== SUBMENU ITEM CLICKED ===");
                                  console.log("Submenu item:", subItem.name);
                                  console.log("Component:", subItem.component);
                                  console.log("Is Mobile:", isMobile);
                                  console.log("Mobile Menu Open:", isMobileMenuOpen);
                                  console.log("Event target:", e.target);
                                  console.log("Current target:", e.currentTarget);

                                  const newModule = subItem.component;
                                  console.log("Calling handleModuleChange with:", newModule);
                                  console.log("Current selectedModule before change:", selectedModule);
                                  handleModuleChange(newModule);
                                  console.log("handleModuleChange called successfully");
                                }}
                              >
                                <SubIconComponent
                                  className="nav-icon"
                                  style={{ color: "#000000 !important" }}
                                  onMouseEnter={(e) => {
                                    e.target.style.color = "#000000";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.color = "#000000";
                                  }}
                                />
                                <span style={{ color: "#000000 !important" }}>
                                  {subItem.name}
                                </span>
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

          {/* User Menu at Bottom */}
          <div className="nav-section">
            <div className="nav-item">
              <div className="user-menu">
                <div className="user-avatar">
                  {(userName || "Admin").charAt(0).toUpperCase()}
                </div>
                {!isSidebarCollapsed && (
                  <div className="user-info">
                    <p className="user-name">{userName || "Admin"}</p>
                    <p className="user-role">ADMINISTRATOR</p>
                  </div>
                )}
              </div>
            </div>
            <div className="nav-item">
              <a
                href="#"
                className="nav-link"
                style={{
                  color: "#000000 !important",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#000000";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#000000";
                }}
                onTouchStart={(e) => {
                  console.log("=== LOGOUT TOUCH START ===");
                }}
                onTouchEnd={(e) => {
                  console.log("=== LOGOUT TOUCH END ===");
                  if (isMobile) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Mobile logout touch - triggering logout");
                    handleLogout();
                  }
                }}
                onClick={(e) => {
                  e.preventDefault();

                  // Skip click handling on mobile (use touch events instead)
                  if (isMobile) {
                    console.log("=== LOGOUT CLICK EVENT SKIPPED ON MOBILE ===");
                    return;
                  }

                  console.log("=== LOGOUT CLICKED ===");
                  handleLogout();
                }}
              >
                <FiLogOut
                  className="nav-icon"
                  style={{ color: "#000000 !important" }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#000000";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "#000000";
                  }}
                />
                {!isSidebarCollapsed && (
                  <span style={{ color: "#000000 !important" }}>Logout</span>
                )}
              </a>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main
        className={`admin-main ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <button
              className="header-btn"
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <FiMenu />
            </button>
            <div>
              <h1 className="header-title">Hi, Admin!</h1>
              <p className="header-subtitle">Welcome to your dashboard</p>
             
            </div>
          </div>

          <div className="header-right">
            {/* Hide search and notifications on mobile for cleaner look */}
            {!isMobile && (
              <>
                <div className="header-search" >
                  <FiSearch className="search-icon"  />
                  <input
                    type="text"
                      placeholder="Global search..."
                    className="search-input"
                  />
                </div>

                <div className="header-actions">
                  <button className="header-btn">
                    <FiBell />
                  </button>
                  <button className="header-btn">
                    <FiMail />
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <div
          className="admin-content"
          key={`${selectedModule}-${forceUpdate}`}

        >
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
