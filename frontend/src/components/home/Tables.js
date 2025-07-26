import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiUsers, FiZap, FiAlertCircle } from "react-icons/fi";
import { getTableImageUrl, handleImageError } from "../../utils/imageUtils";
import "./Tables.css";

const TablesSection = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
        const response = await axios.get(`${apiUrl}/tables`);
        setTables(response.data.filter(table => table.status === "Available"));
      } catch (error) {
        setError("Failed to load tables. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, []);

  const SkeletonLoader = () => (
    <div className="table-card skeleton">
      <div className="image-placeholder"></div>
      <div className="content-placeholder">
        <div className="title-placeholder"></div>
        <div className="text-placeholder"></div>
        <div className="button-placeholder"></div>
      </div>
    </div>
  );

  return (
    <section className="tables-section">
      <div className="container">
        <h2 className="section-title">
          Premium <span className="text-accent">Tables</span>
        </h2>

        {error ? (
          <div className="error-alert">
            <FiAlertCircle className="alert-icon" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="tables-grid">
            {loading ? (
              [...Array(3)].map((_, index) => <SkeletonLoader key={index} />)
            ) : tables.length > 0 ? (
              tables.map((table) => (
                <article 
                  key={table._id}
                  className="table-card"
                >
                  <div className="card-image">
                    {table.image && (
                      <img
                        src={getTableImageUrl(table.image)}
                        alt={table.tableName}
                        loading="lazy"
                        onError={(e) => handleImageError(e, "/images/placeholder-table.jpg")}
                      />
                    )}
                    <div className="status-badge">
                      <FiCheckCircle className="status-icon" />
                      {table.status}
                    </div>
                  </div>

                  <div className="card-content">
                    <h3 className="table-title">
                      {table.tableName}
                    </h3>
                    <div className="table-info">
                      <div className="info-item">
                        <FiUsers className="info-icon" />
                        <span>{table.capacity} Guests</span>
                      </div>
                      <div className="info-item">
                        <FiZap className="info-icon" />
                        <span>{table.tableType}</span>
                      </div>
                    </div>
                    <Link
                      to="/table-reservation"
                      className="reserve-button"
                      onClick={() => {
                        // Store table details for the reservation page
                        const reservationDetails = {
                          tableId: table._id,
                          tableName: table.tableName,
                          tableCapacity: table.capacity,
                          tableDescription: table.description,
                        };
                        localStorage.setItem('reservationDetails', JSON.stringify(reservationDetails));
                      }}
                    >
                      Reserve Table
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="no-tables">
                <p>No available tables at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TablesSection;