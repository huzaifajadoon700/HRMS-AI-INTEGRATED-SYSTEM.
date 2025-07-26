import React from "react";
import { useHotelInfo } from "../hooks/useHotelInfo";
import "./Footer.css";

// Footer component for displaying copyright information

const Footer = () => {
  const hotelInfo = useHotelInfo();

  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <p className="text-center">
              © {new Date().getFullYear()} {hotelInfo.hotelName}. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
