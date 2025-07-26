// src/services/socketService.js
import axios from 'axios';
import { apiConfig } from '../config/api';

const API_BASE_URL = apiConfig.baseURL;

let pollingInterval = null;
let activeCallbacks = new Set();
let activeOrderId = null;

// Polling-based order tracking (works with Vercel serverless)
export const initializeSocket = (orderId) => {
  if (!orderId) {
    console.error('[Polling] No order ID provided');
    return null;
  }

  // If already tracking this order, return existing setup
  if (activeOrderId === orderId && pollingInterval) {
    console.log('[Polling] Already tracking order:', orderId);
    return { connected: true, orderId };
  }

  // Clean up any existing polling
  if (pollingInterval) {
    console.log('[Polling] Cleaning up existing polling');
    cleanupSocket();
  }

  // Store order ID and start polling
  activeOrderId = orderId;
  console.log('[Polling] Starting order tracking for:', orderId);

  // Wait 2 seconds before starting polling to ensure order is saved
  setTimeout(() => {
    // Start polling for order updates every 3 seconds using existing endpoint
    pollingInterval = setInterval(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/${orderId}/tracking`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data && response.data.order) {
        const order = response.data.order;
        const statusUpdate = {
          orderId: order._id,
          status: mapStatusToDisplay(order.status),
          timestamp: new Date(order.updatedAt || order.createdAt),
          completed: order.status === 'delivered'
        };

        console.log('[Polling] Order update:', statusUpdate);

        // Notify all callbacks
        activeCallbacks.forEach(callback => {
          try {
            callback(statusUpdate);
          } catch (error) {
            console.error('[Polling] Error in callback:', error);
          }
        });
      }
    } catch (error) {
      console.error('[Polling] Error fetching order status:', error);
      // If order not found or other error, stop polling after some attempts
      if (error.response?.status === 404) {
        console.log('[Polling] Order not found, stopping polling');
        cleanupSocket();
      }
    }
  }, 3000); // Poll every 3 seconds
  }, 2000); // Wait 2 seconds before starting polling

  // Simulate socket connection for compatibility
  return {
    connected: true,
    orderId,
    emit: (event, data) => {
      console.log('[Polling] Simulated emit:', event, data);
    }
  };
};

// Map database status to display status
const mapStatusToDisplay = (dbStatus) => {
  const statusMap = {
    'pending': 'Order Received',
    'confirmed': 'Order Confirmed',
    'preparing': 'Preparing',
    'ready_for_pickup': 'Ready for Pickup',
    'out_for_delivery': 'On the Way',
    'arriving_soon': 'Arriving Soon',
    'delivered': 'Delivered'
  };

  return statusMap[dbStatus] || dbStatus.charAt(0).toUpperCase() + dbStatus.slice(1);
};

const cleanupSocket = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

export const disconnectSocket = () => {
  console.log('[Polling] Stopping order tracking');
  cleanupSocket();
  activeCallbacks.clear();
  activeOrderId = null;
};

export const subscribeToOrderUpdates = (callback) => {
  if (!callback || typeof callback !== 'function') {
    console.error('[Socket] Invalid callback');
    return () => {};
  }

  activeCallbacks.add(callback);
  console.log('[Socket] Added update subscription');
  
  return () => {
    activeCallbacks.delete(callback);
    console.log('[Socket] Removed update subscription');
  };
};

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return '';
  }
};

export const formatEstimatedDelivery = (timestamp) => {
  if (!timestamp) return '30 minutes';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return '30 minutes';
  }
};