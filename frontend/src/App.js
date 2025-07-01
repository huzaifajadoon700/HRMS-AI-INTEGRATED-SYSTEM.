import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Home, Booking, AboutUs, Contact, PageNotFound, Room, Services, Team, Testimonial, Help } from "./pages/index";
import Header from "./components/common/Header";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
import LoginPage from "./components/Auth/Login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HotelSettingsProvider } from "./contexts/HotelSettingsContext";
import "./utils/clearCache"; // Make clearHotelCache available globally
import Dashboard from "./components/Admin/Sidebar";
import BookRoom from "./pages/BookRoom";
import OrderFood from "./pages/OrderFood";
import Cart from "./components/orders/Cart";
import MyOrders from "./components/User/MyOrders.jsx";
import Invoice from "./components/orders/Invoice";
import MyBookings from "./pages/MyBookings";
import MyReservations from "./components/User/MyReservations";
import AdminOrders from "./pages/AdminOrders";
import DeliveryTrackingPage from "./components/DeliveryTracking";
import ReserveTable from "./pages/ReserveTable";
import TableReservationPage from "./pages/TableReservationPage";
import TableConfirmationPage from "./pages/TableConfirmationPage";
import TableRecommendations from "./components/tables/TableRecommendations";
import OrderConfirmation from "./pages/OrderConfirmation.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Profile from "./pages/Profile";
import Feedback from "./components/User/Feedback";
import "./styles/simple-theme.css";
import "./styles/global.css";
import BookingPage from './pages/BookingPage';
import BookingConfirmation from "./pages/BookingConfirmation";
import OrderTracking from "./pages/OrderTracking";
import { Toaster, toast } from 'react-hot-toast';
import PersonalizedRecommendations from "./components/recommendations/PersonalizedRecommendations";

/**
 * ADMIN ROUTE PROTECTION IMPLEMENTATION
 * =====================================
 *
 * This App.js implements comprehensive admin route protection:
 *
 * 1. AdminRestrictedRoute: Prevents admins from accessing user pages
 *    - Redirects admins to /dashboard with error notification
 *    - Allows regular users to access these pages normally
 *
 * 2. AdminOnlyRoute: Ensures only admins can access dashboard
 *    - Redirects non-authenticated users to /login
 *    - Redirects regular users to / with error notification
 *    - Only allows users with role="admin" to access dashboard
 *
 * 3. All user-facing routes are wrapped with AdminRestrictedRoute
 * 4. Dashboard route is wrapped with AdminOnlyRoute
 * 5. Login page remains accessible to all users
 *
 * Result: Admins can ONLY access /dashboard and /login pages
 */

// Layout Component for Header and Footer
const Layout = ({ children }) => {
  const location = useLocation();
  const excludeHeaderFooter = location.pathname === "/dashboard";
  return (
    <>
      {!excludeHeaderFooter && <Header />}
      <main className="main-content">
        {children}
      </main>
      {!excludeHeaderFooter && <Footer />}
    </>
  );
};

// Authenticated Route Wrapper
const AuthenticatedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// Admin Route Protection - Restricts admins to dashboard only
const AdminRestrictedRoute = ({ children }) => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // If user is admin, show notification and redirect to dashboard
  if (token && role === "admin") {
    // Show notification to admin
    setTimeout(() => {
      toast.error("🚫 Access Restricted: Admins can only access the Dashboard", {
        duration: 4000,
        style: {
          background: '#dc3545',
          color: 'white',
          fontWeight: 'bold',
        },
      });
    }, 100);

    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Admin Only Route - Only allows admins
const AdminOnlyRoute = ({ children }) => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // If not authenticated, redirect to login
  if (!token) {
    setTimeout(() => {
      toast.error("🔐 Please login to access the Dashboard", {
        duration: 3000,
        style: {
          background: '#ffc107',
          color: '#000',
          fontWeight: 'bold',
        },
      });
    }, 100);
    return <Navigate to="/login" replace />;
  }

  // If not admin, redirect to home with notification
  if (role !== "admin") {
    setTimeout(() => {
      toast.error("⚠️ Access Denied: Admin privileges required", {
        duration: 4000,
        style: {
          background: '#dc3545',
          color: 'white',
          fontWeight: 'bold',
        },
      });
    }, 100);
    return <Navigate to="/" replace />;
  }

  return children;
};



function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "940737064009-sf2stfd9kf6dq9e6s188l2pe1hh6q75o.apps.googleusercontent.com"}>
      <HotelSettingsProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(17, 34, 64, 0.9)',
              color: '#f0f4fc',
              border: '1px solid rgba(100, 255, 218, 0.1)',
            },
          }}
        />
        <Router>
        <ScrollToTop />
        <Routes>
          {/* Public routes - Admins are redirected to dashboard */}
          <Route path="/" element={
            <AdminRestrictedRoute>
              <Layout><Home /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/booking" element={
            <AdminRestrictedRoute>
              <Layout><Booking /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/about" element={
            <AdminRestrictedRoute>
              <Layout><AboutUs /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/contact" element={
            <AdminRestrictedRoute>
              <Layout><Contact /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/rooms" element={
            <AdminRestrictedRoute>
              <Layout><Room /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/services" element={
            <AdminRestrictedRoute>
              <Layout><Services /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/team" element={
            <AdminRestrictedRoute>
              <Layout><Team /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/testimonial" element={
            <AdminRestrictedRoute>
              <Layout><Testimonial /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/help" element={
            <AdminRestrictedRoute>
              <Layout><Help /></Layout>
            </AdminRestrictedRoute>
          } />

          {/* Login page - accessible to all */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin-only dashboard */}
          <Route path="/dashboard" element={
            <AdminOnlyRoute>
              <Layout><Dashboard /></Layout>
            </AdminOnlyRoute>
          } />

          {/* User routes - Admins are redirected to dashboard */}
          <Route path="/book-room" element={
            <AdminRestrictedRoute>
              <Layout><BookRoom /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/order-food" element={
            <AdminRestrictedRoute>
              <Layout><OrderFood /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/cart" element={
            <AdminRestrictedRoute>
              <Layout><Cart /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/my-orders" element={
            <AdminRestrictedRoute>
              <Layout><MyOrders /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/invoice/:orderId" element={
            <AdminRestrictedRoute>
              <Layout><Invoice /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/my-bookings" element={
            <AdminRestrictedRoute>
              <Layout><MyBookings /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/my-reservations" element={
            <AdminRestrictedRoute>
              <Layout><MyReservations /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/admin-orders" element={
            <AdminRestrictedRoute>
              <Layout><AdminOrders /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/delivery-tracking" element={
            <AdminRestrictedRoute>
              <Layout><DeliveryTrackingPage /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/reserve-table" element={
            <AdminRestrictedRoute>
              <Layout><ReserveTable /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/table-recommendations" element={
            <AdminRestrictedRoute>
              <Layout><TableRecommendations /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/table-reservation" element={
            <AdminRestrictedRoute>
              <Layout><TableReservationPage /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/table-confirmation" element={
            <AdminRestrictedRoute>
              <Layout><TableConfirmationPage /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/profile" element={
            <AdminRestrictedRoute>
              <Layout><Profile /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/feedback" element={
            <AdminRestrictedRoute>
              <Layout><Feedback /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/booking-page/:id" element={
            <AdminRestrictedRoute>
              <Layout><BookingPage /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/booking-confirmation" element={
            <AdminRestrictedRoute>
              <Layout><BookingConfirmation /></Layout>
            </AdminRestrictedRoute>
          } />
          <Route path="/order-confirmation" element={
            <AdminRestrictedRoute>
              <AuthenticatedRoute>
                <Layout><OrderConfirmation /></Layout>
              </AuthenticatedRoute>
            </AdminRestrictedRoute>
          } />
          <Route path="/track-order/:orderId" element={
            <AdminRestrictedRoute>
              <AuthenticatedRoute>
                <Layout><OrderTracking /></Layout>
              </AuthenticatedRoute>
            </AdminRestrictedRoute>
          } />
          <Route path="/recommendations" element={
            <AdminRestrictedRoute>
              <Layout><PersonalizedRecommendations /></Layout>
            </AdminRestrictedRoute>
          } />

          {/* 404 page - Admins are redirected to dashboard */}
          <Route path="*" element={
            <AdminRestrictedRoute>
              <Layout><PageNotFound /></Layout>
            </AdminRestrictedRoute>
          } />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        </Router>
      </HotelSettingsProvider>
    </GoogleOAuthProvider>
  );
}

export default App;