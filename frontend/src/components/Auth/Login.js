import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiShield, FiCheckCircle, FiHome, FiUsers, FiStar, FiArrowRight } from "react-icons/fi";
import { apiConfig } from "../../config/api";
import { useHotelInfo, useLogos } from "../../hooks/useHotelInfo";
import "./Login.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [toastMessage, setToastMessage] = useState({ message: "", type: "" });
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', checks: {} });
  const [forceUpdate, setForceUpdate] = useState(0);
  const navigate = useNavigate();

  // Get dynamic hotel information and logos
  const hotelInfo = useHotelInfo();
  const logos = useLogos();

  // Force re-render when hotel settings change
  useEffect(() => {
    const handleSettingsChange = () => {
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
    // This will trigger a re-render when hotelInfo or logos change
  }, [hotelInfo.hotelName, hotelInfo.hotelSubtitle, logos.loginLogo]);

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setFormData({ name: "", email: "", password: "" });
  };

  const calculatePasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    let text = '';

    if (score === 0) text = '';
    else if (score === 1) text = 'Weak';
    else if (score === 2) text = 'Fair';
    else if (score === 3) text = 'Good';
    else if (score === 4) text = 'Strong';

    return { score, text: text.toLowerCase(), checks };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password' && !isLogin) {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validateInputs = () => {
    const { name, email, password } = formData;

    if (!isLogin && !/^[a-zA-Z\s]+$/.test(name)) {
      showToastMessage("Name can only contain alphabets and spaces.", "danger");
      return false;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z]+[a-zA-Z.-]*\.[a-zA-Z]{2,}$/.test(email)) {
      showToastMessage("Invalid email format.", "danger");
      return false;
    }

    if (password.length < 6) {
      showToastMessage("Password must be at least 6 characters.", "danger");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsLoading(true);
    const endpoint = isLogin ? "/login" : "/signup";

    try {
      // Clear previous user data before logging in
      localStorage.clear();

      // Prepare request body based on operation
      const requestBody = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(`${apiConfig.serverURL}/auth${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.jwtToken);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);
        localStorage.setItem("email", data.email);
        localStorage.setItem("phone", data.phone || "");
        localStorage.setItem("userId", data.userId);

        // Dispatch custom event to update header
        window.dispatchEvent(new Event('authStateChanged'));

        navigate(data.role === "admin" ? "/dashboard" : "/", { replace: true });
      } else {
        showToastMessage(data.message || "Error occurred", "danger");
      }
    } catch (error) {
      showToastMessage("Internal Server Error", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    setIsLoading(true);
    const googleToken = response.credential;
    try {
      // Clear previous user data before logging in
      localStorage.clear();
      
      const res = await fetch(`${apiConfig.serverURL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.jwtToken);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);
        localStorage.setItem("email", data.email);
        localStorage.setItem("phone", data.phone || "");
        localStorage.setItem("userId", data.userId);

        // Dispatch custom event to update header
        window.dispatchEvent(new Event('authStateChanged'));

        navigate(data.role === "admin" ? "/dashboard" : "/", { replace: true });
      } else {
        showToastMessage(data.message || "Error occurred", "danger");
      }
    } catch (error) {
      showToastMessage("Internal Server Error", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const showToastMessage = (message, type) => {
    setToastMessage({ message, type });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  return (
    <div key={`${hotelInfo.hotelName}-${logos.loginLogo}-${forceUpdate}`} className="modern-login-page">
      {/* Left Side - Branding */}
      <div className="login-branding">
        <div className="branding-content">
          <div className="brand-logo" key={`login-logo-${logos.loginLogo}-${logos.primary}-${forceUpdate}`}>
            {(logos.loginLogo && logos.loginLogo !== '/images/logo-login.png' && logos.loginLogo.trim() !== '') ||
             (logos.primary && logos.primary !== '/images/logo-primary.png' && logos.primary.trim() !== '') ? (
              <img
                src={logos.loginLogo && logos.loginLogo !== '/images/logo-login.png' && logos.loginLogo.trim() !== ''
                     ? logos.loginLogo
                     : logos.primary}
                alt={`${hotelInfo.hotelName} Logo`}
                className="login-logo-image"
                onError={(e) => {
                  console.log('Login logo failed to load, showing fallback');
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
                onLoad={() => {
                  console.log('Login logo loaded successfully');
                }}
              />
            ) : null}
            <div className="professional-logo" style={{
              display: ((logos.loginLogo && logos.loginLogo !== '/images/logo-login.png' && logos.loginLogo.trim() !== '') ||
                       (logos.primary && logos.primary !== '/images/logo-primary.png' && logos.primary.trim() !== ''))
                       ? 'none' : 'flex'
            }}>
              <span className="logo-text">{hotelInfo.hotelName.substring(0, 2).toUpperCase()}</span>
              <span className="logo-accent">MS</span>
            </div>
          </div>
          <h1 className="brand-title">{hotelInfo.hotelName} Portal</h1>
          <p className="brand-subtitle">
            {hotelInfo.hotelSubtitle || 'Hotel & Restaurant Management System'}
          </p>

          <div className="features-list">
            <div className="feature-item">
              <FiUsers className="feature-icon" />
              <span>Easy Account Management</span>
            </div>
            <div className="feature-item">
              <FiStar className="feature-icon" />
              <span>Quick Room Booking</span>
            </div>
            <div className="feature-item">
              <FiShield className="feature-icon" />
              <span>Secure Payments</span>
            </div>
            <div className="feature-item">
              <FiCheckCircle className="feature-icon" />
              <span>Restaurant Ordering</span>
            </div>
          </div>

          <div className="testimonial">
            <p>"Amazing experience! Easy booking and excellent service."</p>
            <span>- Satisfied Guest</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-section">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="form-subtitle">
              {isLogin
                ? "Sign in to access your account and enjoy our hotel & restaurant services"
                : "Create your account to book rooms, make reservations, and enjoy our services"
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">
                  <FiUser className="label-icon" />
                  Full Name
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="form-input"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <FiMail className="label-icon" />
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email address"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiLock className="label-icon" />
                Password
              </label>
              <div className="input-wrapper password-wrapper">
                <div className="password-strength-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className={`form-input ${!isLogin && formData.password ? 'password-input-enhanced' : ''}`}
                  />

                  {!isLogin && formData.password && (
                    <>
                      <div className="password-security-indicators">
                        <div className={`security-icon length-check ${passwordStrength.checks.length ? 'active' : ''}`}>
                          8
                        </div>
                        <div className={`security-icon uppercase-check ${passwordStrength.checks.uppercase ? 'active' : ''}`}>
                          A
                        </div>
                        <div className={`security-icon number-check ${passwordStrength.checks.number ? 'active' : ''}`}>
                          #
                        </div>
                        <div className={`security-icon special-check ${passwordStrength.checks.special ? 'active' : ''}`}>
                          !
                        </div>
                      </div>

                      <div className="password-strength-bar">
                        <div className={`password-strength-fill password-strength-${passwordStrength.text}`}></div>
                      </div>

                      <div className={`password-strength-text ${passwordStrength.text} ${passwordStrength.text ? 'show' : ''}`}>
                        {passwordStrength.text && `Password strength: ${passwordStrength.text.charAt(0).toUpperCase() + passwordStrength.text.slice(1)}`}
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  {isLogin ? "Signing In..." : "Creating Account..."}
                </>
              ) : (
                <>
                  <FiShield className="btn-icon" />
                  {isLogin ? "Sign In to HRMS" : "Create HRMS Account"}
                  <FiArrowRight className="btn-arrow" />
                </>
              )}
            </button>
          </form>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => showToastMessage("Google login failed", "danger")}
              theme="filled_blue"
              shape="pill"
              size="large"
              text={isLogin ? "continue_with" : "signup_with"}
              logo_alignment="left"
              disabled={isLoading}
            />
          </div>

          <div className="auth-toggle">
            <p>
              {isLogin ? "New to our organization?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="toggle-btn"
                onClick={handleToggle}
                disabled={isLoading}
              >
                {isLogin ? "Create Account" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {showToast && (
        <div className={`toast-notification ${toastMessage.type}`}>
          <div className="toast-content">
            <FiCheckCircle className="toast-icon" />
            <span>{toastMessage.message}</span>
          </div>
          <button
            className="toast-close"
            onClick={() => setShowToast(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthPage;