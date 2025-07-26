import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { BsCart } from "react-icons/bs";
import { FiUser, FiShoppingBag, FiCalendar, FiHome, FiLogOut, FiLayout, FiX } from "react-icons/fi";
import { BiMessageSquare } from "react-icons/bi";
import { navList } from "../data/Data";
import { useHotelInfo, useLogos } from "../../hooks/useHotelInfo";
import "../../styles/simple-theme.css";
import "./header.css";

export default function Header() {
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [cartItems, setCartItems] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const navigate = useNavigate();

  // Get dynamic hotel information and logos
  const hotelInfo = useHotelInfo();
  const logos = useLogos();

  // Force re-render when hotel settings change
  useEffect(() => {
    const handleSettingsChange = (event) => {
      console.log('Header received hotelSettingsChanged event:', event.detail);
      // Force component re-render by updating state
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('hotelSettingsChanged', handleSettingsChange);

    return () => {
      window.removeEventListener('hotelSettingsChanged', handleSettingsChange);
    };
  }, []);

  // Also listen for hotelInfo and logos changes
  useEffect(() => {
    console.log('Header useEffect triggered - hotelInfo or logos changed');
    // This will trigger a re-render when hotelInfo or logos change
  }, [hotelInfo.hotelName, hotelInfo.loading, logos.primary, logos.secondary, logos.loginLogo]);

  // Debug logging to check if data is loading (remove in production)
  // console.log('Header.jsx - Hotel Info:', hotelInfo);
  // console.log('Header.jsx - Loading state:', hotelInfo.loading);
  // console.log('Header.jsx - Hotel Name:', hotelInfo.hotelName);
  // console.log('Header.jsx - Logos:', logos);
  // console.log('Header.jsx - Primary Logo:', logos.primary);
  // console.log('Header.jsx - Force Update Counter:', forceUpdate);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateUserData = () => {
      const name = localStorage.getItem("name");
      const role = localStorage.getItem("role");
      setUserName(name);
      setUserRole(role);
    };

    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(cart.reduce((sum, item) => sum + item.quantity, 0));
    };

    // Initial load
    updateUserData();
    updateCartCount();

    // Listen for auth state changes
    window.addEventListener("authStateChanged", updateUserData);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("authStateChanged", updateUserData);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUserName(null);
    setUserRole(null);

    // Dispatch custom event to update header
    window.dispatchEvent(new Event('authStateChanged'));

    navigate("/login", { replace: true });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Handle profile dropdown toggle with auto-scroll
  const handleProfileDropdownToggle = (isOpen) => {
    setProfileDropdownOpen(isOpen);

    // Auto-scroll to top on mobile when dropdown opens
    if (isOpen && window.innerWidth <= 991) {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100); // Small delay to ensure dropdown is rendered
    }
  };

  // Handle click on mobile menu overlay close button
  useEffect(() => {
    const handleMobileMenuClick = (e) => {
      if (mobileMenuOpen && e.target.closest('.navbar-collapse::before')) {
        closeMobileMenu();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('click', handleMobileMenuClick);
      return () => document.removeEventListener('click', handleMobileMenuClick);
    }
  }, [mobileMenuOpen]);

  // Handle profile dropdown auto-scroll and body scroll prevention
  useEffect(() => {
    const handleProfileDropdownScroll = () => {
      if (profileDropdownOpen && window.innerWidth <= 991) {
        // Prevent body scroll when dropdown is open on mobile
        document.body.classList.add('dropdown-open');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      } else {
        // Restore body scroll
        document.body.classList.remove('dropdown-open');
        document.body.style.overflow = 'unset';
        document.body.style.position = 'unset';
        document.body.style.width = 'unset';
      }
    };

    handleProfileDropdownScroll();

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('dropdown-open');
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, [profileDropdownOpen]);

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className={`navbar-custom ${scrolled ? "navbar-scrolled" : ""}`}
      variant="dark"
      style={{ marginTop: "0px" }}
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center gap-2 brand-link"
          key={`${hotelInfo.hotelName}-${logos.primary}-${forceUpdate}`}
          style={{ marginLeft: '-15px' }}
        >
          {logos.primary && logos.primary !== '/images/logo-primary.png' && logos.primary.trim() !== '' ? (
            <img
              src={logos.primary}
              alt={`${hotelInfo.hotelName} Logo`}
              className="header-logo-image"
              onError={(e) => {
                console.log('Logo failed to load, hiding image');
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
              onLoad={() => {
                console.log('Logo loaded successfully');
              }}
            />
          ) : null}
          <div className="logo-glow" style={{ display: logos.primary && logos.primary !== '/images/logo-primary.png' && logos.primary.trim() !== '' ? 'none' : 'block' }}>
            <span className="text-accent">{hotelInfo.hotelName?.split(' ')[0]?.toUpperCase() || 'HOTEL'}</span>
            {hotelInfo.hotelName?.split(' ').length > 1 && (
              <span className="text-light">{hotelInfo.hotelName.split(' ').slice(1).join(' ').toUpperCase()}</span>
            )}
          </div>
        </Navbar.Brand>

        {/* Mobile Header Actions */}
        <div className="d-flex align-items-center gap-3 d-lg-none mobile-header-actions">
          <Link
            to="/cart"
            className="mobile-cart-icon position-relative text-decoration-none d-flex align-items-center justify-content-center"
          >
            <BsCart size={20} className="text-light" />
            {cartItems > 0 && (
              <span className="mobile-cart-badge">{cartItems}</span>
            )}
          </Link>

          <Navbar.Toggle
            aria-controls="main-nav"
            className="mobile-menu"
            onClick={toggleMobileMenu}
          >
            <div className="hamburger">
              {mobileMenuOpen ? (
                <FiX size={24} />
              ) : (
                <>
                  <span />
                  <span />
                  <span />
                </>
              )}
            </div>
          </Navbar.Toggle>
        </div>

        <Navbar.Collapse id="main-nav" in={mobileMenuOpen}>
          {/* Mobile menu close button */}
          <div className="mobile-menu-close d-lg-none" onClick={closeMobileMenu}>
            <FiX size={24} />
          </div>
          <Nav className="navbar-nav">
            {navList.map((item) => (
              <Nav.Link
                key={item.id}
                as={Link}
                to={item.path}
                className="nav-link"
                onClick={closeMobileMenu}
              >
                {item.text}
              </Nav.Link>
            ))}
            <Nav.Link
              as={Link}
              to="/help"
              className="nav-link"
              onClick={closeMobileMenu}
            >
              Help
            </Nav.Link>
            {userName && (
              <Nav.Link
                as={Link}
                to="/feedback"
                className="nav-link"
                onClick={closeMobileMenu}
              >
                <BiMessageSquare className="me-1" />
                Feedback
              </Nav.Link>
            )}
          </Nav>

          <div className="d-flex align-items-center gap-4 auth-section">
            {/* Cart icon moved to header on mobile, keep for desktop */}
            <Link
              to="/cart"
              className="cart-icon position-relative text-decoration-none d-flex align-items-center justify-content-center d-none d-lg-flex"
              onClick={closeMobileMenu}
            >
              <BsCart size={22} className="text-light" />
              {cartItems > 0 && (
                <span className="cart-badge">{cartItems}</span>
              )}
            </Link>

            {userName ? (
              <Dropdown onToggle={handleProfileDropdownToggle}>
                <Dropdown.Toggle variant="link" className="user-greeting d-flex align-items-center gap-2">
                  <FiUser size={18} className="text-light" />
                  <span className="text-light">{userName}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-custom">
                  {/* Mobile Close Button */}
                  <div className="d-lg-none mobile-dropdown-close" onClick={() => {
                    setProfileDropdownOpen(false);
                    closeMobileMenu();
                  }}>
                    <FiX size={24} />
                  </div>

                  {/* Enhanced User Header */}
                  <div className="dropdown-header-custom">
                    <div className="user-avatar">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <h6>{userName}</h6>
                      <p>{userRole === "admin" ? "Administrator" : "Guest"}</p>
                    </div>
                  </div>

                  {userRole === "admin" && (
                    <Dropdown.Item as={Link} to="/dashboard" className="admin-item" onClick={closeMobileMenu}>
                      <FiLayout className="dropdown-icon" />
                      Dashboard
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item as={Link} to="/profile" onClick={closeMobileMenu}>
                    <FiUser className="dropdown-icon" />
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/my-orders" onClick={closeMobileMenu}>
                    <FiShoppingBag className="dropdown-icon" />
                    My Orders
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/my-reservations" onClick={closeMobileMenu}>
                    <FiCalendar className="dropdown-icon" />
                    My Reservations
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/my-bookings" onClick={closeMobileMenu}>
                    <FiHome className="dropdown-icon" />
                    My Bookings
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => { handleLogout(); closeMobileMenu(); }} className="logout-item">
                    <FiLogOut className="dropdown-icon" />
                    Log Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button
                onClick={() => { navigate("/login"); closeMobileMenu(); }}
                className="auth-button"
              >
                Sign In
              </Button>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}