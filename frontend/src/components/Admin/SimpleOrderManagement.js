import React, { useState, useEffect } from 'react';
import './simple-admin.css';

const SimpleOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showOrderDetails, setShowOrderDetails] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Mock data for demonstration
      setOrders([
        {
          id: 1,
          orderNumber: 'ORD-001',
          customerName: 'John Doe',
          customerPhone: '+1234567890',
          roomNumber: '101',
          items: [
            { name: 'Chicken Burger', quantity: 2, price: 15.99 },
            { name: 'French Fries', quantity: 1, price: 5.99 }
          ],
          total: 37.97,
          status: 'Pending',
          orderTime: '2024-01-15 14:30',
          notes: 'Extra sauce please'
        },
        {
          id: 2,
          orderNumber: 'ORD-002',
          customerName: 'Jane Smith',
          customerPhone: '+1234567891',
          roomNumber: '205',
          items: [
            { name: 'Caesar Salad', quantity: 1, price: 12.99 },
            { name: 'Grilled Salmon', quantity: 1, price: 24.99 }
          ],
          total: 37.98,
          status: 'Preparing',
          orderTime: '2024-01-15 15:15',
          notes: 'No croutons'
        }
      ]);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      // Update local state for demo
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.roomNumber?.includes(searchTerm);
    const matchesStatus = statusFilter === 'All Status' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    preparing: orders.filter(o => o.status === 'Preparing').length,
    ready: orders.filter(o => o.status === 'Ready').length,
    delivered: orders.filter(o => o.status === 'Delivered').length
  };

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Order Management</h1>
        <p>Manage customer orders and track status</p>
      </div>

      <div className="simple-stats-grid">
        <div className="simple-stat-card">
          <h3>Total Orders</h3>
          <div className="stat-number">{orderStats.total}</div>
          <div className="stat-label">All Orders</div>
        </div>
        <div className="simple-stat-card">
          <h3>Pending</h3>
          <div className="stat-number">{orderStats.pending}</div>
          <div className="stat-label">Awaiting Confirmation</div>
        </div>
        <div className="simple-stat-card">
          <h3>Preparing</h3>
          <div className="stat-number">{orderStats.preparing}</div>
          <div className="stat-label">In Kitchen</div>
        </div>
        <div className="simple-stat-card">
          <h3>Ready</h3>
          <div className="stat-number">{orderStats.ready}</div>
          <div className="stat-label">Ready for Delivery</div>
        </div>
      </div>

      <div className="simple-admin-controls">
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="simple-search-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="simple-search-input"
            style={{ maxWidth: '200px' }}
          >
            <option value="All Status">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="simple-table-container">
        <table className="simple-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Room</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Order Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>
                  <div>
                    <div>{order.customerName}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{order.customerPhone}</div>
                  </div>
                </td>
                <td>{order.roomNumber}</td>
                <td>
                  <div style={{ fontSize: '12px' }}>
                    {order.items?.slice(0, 2).map((item, index) => (
                      <div key={index}>{item.quantity}x {item.name}</div>
                    ))}
                    {order.items?.length > 2 && <div>+{order.items.length - 2} more...</div>}
                  </div>
                </td>
                <td>${order.total?.toFixed(2)}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className={`simple-status simple-status-${order.status?.toLowerCase()}`}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td>{order.orderTime}</td>
                <td>
                  <div className="simple-actions">
                    <button 
                      onClick={() => setShowOrderDetails(order)}
                      className="simple-btn simple-btn-small"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Order Details - {showOrderDetails.orderNumber}</h3>
              <button 
                onClick={() => setShowOrderDetails(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Customer:</strong> {showOrderDetails.customerName}</p>
              <p><strong>Phone:</strong> {showOrderDetails.customerPhone}</p>
              <p><strong>Room:</strong> {showOrderDetails.roomNumber}</p>
              <p><strong>Order Time:</strong> {showOrderDetails.orderTime}</p>
              <p><strong>Status:</strong> 
                <span className={`simple-status simple-status-${showOrderDetails.status?.toLowerCase()}`} style={{ marginLeft: '8px' }}>
                  {showOrderDetails.status}
                </span>
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4>Order Items:</h4>
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {showOrderDetails.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price}</td>
                      <td>${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '18px', fontWeight: '600' }}>
                Total: ${showOrderDetails.total?.toFixed(2)}
              </div>
            </div>

            {showOrderDetails.notes && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Notes:</h4>
                <p style={{ background: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
                  {showOrderDetails.notes}
                </p>
              </div>
            )}

            <div className="simple-form-actions">
              <button 
                onClick={() => setShowOrderDetails(null)}
                className="simple-btn simple-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleOrderManagement;
