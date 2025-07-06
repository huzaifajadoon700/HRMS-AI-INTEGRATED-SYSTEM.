import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const Setting = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    // General Settings
    hotelName: "",
    hotelAddress: "",
    hotelPhone: "",
    hotelEmail: "",
    currency: "PKR",
    timezone: "Asia/Karachi",

    // Booking Settings
    checkInTime: "14:00",
    checkOutTime: "12:00",
    maxAdvanceBooking: 365,
    cancellationPolicy: "24 hours",

    // Payment Settings
    taxRate: 16,
    serviceCharge: 10,
    paymentMethods: ["Cash", "Card", "Bank Transfer"],

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    bookingConfirmation: true,
    paymentReminders: true,

    // System Settings
    maintenanceMode: false,
    backupFrequency: "daily",
    sessionTimeout: 30,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchSettings();
  }, [navigate]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings({ ...settings, ...response.data });
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Keep default settings if API fails
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";

      await axios.put(`${apiUrl}/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="simple-form">
      <h3>General Settings</h3>
      <div className="simple-form-row">
        <input
          type="text"
          name="hotelName"
          placeholder="Hotel Name"
          value={settings.hotelName}
          onChange={handleInputChange}
        />
        <input
          type="email"
          name="hotelEmail"
          placeholder="Hotel Email"
          value={settings.hotelEmail}
          onChange={handleInputChange}
        />
      </div>
      <div className="simple-form-row">
        <input
          type="tel"
          name="hotelPhone"
          placeholder="Hotel Phone"
          value={settings.hotelPhone}
          onChange={handleInputChange}
        />
        <select
          name="currency"
          value={settings.currency}
          onChange={handleInputChange}
        >
          <option value="PKR">Pakistani Rupee (PKR)</option>
          <option value="USD">US Dollar (USD)</option>
          <option value="EUR">Euro (EUR)</option>
        </select>
      </div>
      <textarea
        name="hotelAddress"
        placeholder="Hotel Address"
        value={settings.hotelAddress}
        onChange={handleInputChange}
        rows="3"
      />
    </div>
  );

  const renderBookingSettings = () => (
    <div className="simple-form">
      <h3>Booking Settings</h3>
      <div className="simple-form-row">
        <input
          type="time"
          name="checkInTime"
          value={settings.checkInTime}
          onChange={handleInputChange}
        />
        <input
          type="time"
          name="checkOutTime"
          value={settings.checkOutTime}
          onChange={handleInputChange}
        />
      </div>
      <div className="simple-form-row">
        <input
          type="number"
          name="maxAdvanceBooking"
          placeholder="Max Advance Booking (days)"
          value={settings.maxAdvanceBooking}
          onChange={handleInputChange}
        />
        <select
          name="cancellationPolicy"
          value={settings.cancellationPolicy}
          onChange={handleInputChange}
        >
          <option value="24 hours">24 Hours</option>
          <option value="48 hours">48 Hours</option>
          <option value="72 hours">72 Hours</option>
          <option value="No cancellation">No Cancellation</option>
        </select>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="simple-form">
      <h3>Payment Settings</h3>
      <div className="simple-form-row">
        <input
          type="number"
          name="taxRate"
          placeholder="Tax Rate (%)"
          value={settings.taxRate}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="serviceCharge"
          placeholder="Service Charge (%)"
          value={settings.serviceCharge}
          onChange={handleInputChange}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <h4>Payment Methods</h4>
        <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
          {["Cash", "Card", "Bank Transfer", "Online Payment"].map((method) => (
            <label
              key={method}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <input
                type="checkbox"
                checked={settings.paymentMethods.includes(method)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSettings({
                      ...settings,
                      paymentMethods: [...settings.paymentMethods, method],
                    });
                  } else {
                    setSettings({
                      ...settings,
                      paymentMethods: settings.paymentMethods.filter(
                        (m) => m !== method
                      ),
                    });
                  }
                }}
              />
              {method}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="simple-form">
      <h3>Notification Settings</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {[
          { key: "emailNotifications", label: "Email Notifications" },
          { key: "smsNotifications", label: "SMS Notifications" },
          { key: "bookingConfirmation", label: "Booking Confirmation" },
          { key: "paymentReminders", label: "Payment Reminders" },
        ].map((item) => (
          <label
            key={item.key}
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            <input
              type="checkbox"
              name={item.key}
              checked={settings[item.key]}
              onChange={handleInputChange}
            />
            {item.label}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Settings</h1>
        <p>Configure system settings and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: "30px" }}>
        <div
          style={{
            display: "flex",
            gap: window.innerWidth <= 768 ? "5px" : "10px",
            borderBottom: "1px solid #e5e7eb",
            overflowX: "auto",
            paddingBottom: "5px",
          }}
        >
          {[
            { key: "general", label: "General" },
            { key: "booking", label: "Booking" },
            { key: "payment", label: "Payment" },
            { key: "notifications", label: "Notifications" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`simple-btn ${
                activeTab === tab.key
                  ? "simple-btn-primary"
                  : "simple-btn-secondary"
              }`}
              style={{
                borderRadius: "0",
                borderBottom: "none",
                minWidth: window.innerWidth <= 768 ? "80px" : "auto",
                fontSize: window.innerWidth <= 768 ? "12px" : "14px",
                padding: window.innerWidth <= 768 ? "8px 12px" : "10px 16px",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="simple-form-container">
        {activeTab === "general" && renderGeneralSettings()}
        {activeTab === "booking" && renderBookingSettings()}
        {activeTab === "payment" && renderPaymentSettings()}
        {activeTab === "notifications" && renderNotificationSettings()}

        <div className="simple-form-actions" style={{ marginTop: "30px" }}>
          <button
            onClick={handleSave}
            className="simple-btn simple-btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
          <button
            onClick={fetchSettings}
            className="simple-btn simple-btn-secondary"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setting;
