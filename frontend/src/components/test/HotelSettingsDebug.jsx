import React, { useEffect, useState } from 'react';
import { useHotelInfo } from '../../hooks/useHotelInfo';
import { useHotelSettings } from '../../contexts/HotelSettingsContext';

const HotelSettingsDebug = () => {
  const hotelInfo = useHotelInfo();
  const { settings, loading, error } = useHotelSettings();
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    const handleSettingsChange = () => {
      setUpdateCount(prev => prev + 1);
      console.log('Hotel settings changed event received!');
    };

    window.addEventListener('hotelSettingsChanged', handleSettingsChange);
    
    return () => {
      window.removeEventListener('hotelSettingsChanged', handleSettingsChange);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Hotel Settings Debug</h4>
      <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      <p><strong>Error:</strong> {error || 'None'}</p>
      <p><strong>Hotel Name:</strong> {hotelInfo.hotelName}</p>
      <p><strong>Description:</strong> {hotelInfo.description?.substring(0, 50)}...</p>
      <p><strong>Update Count:</strong> {updateCount}</p>
      <p><strong>Settings Object:</strong> {settings ? 'Loaded' : 'Not loaded'}</p>
      
      <button 
        onClick={() => {
          console.log('Full Hotel Info:', hotelInfo);
          console.log('Full Settings:', settings);
        }}
        style={{
          background: '#64ffda',
          color: '#0A192F',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '10px'
        }}
      >
        Log to Console
      </button>
    </div>
  );
};

export default HotelSettingsDebug;
