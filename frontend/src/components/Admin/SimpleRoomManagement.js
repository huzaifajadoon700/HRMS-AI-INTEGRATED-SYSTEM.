import React, { useState, useEffect } from 'react';
import './simple-admin.css';

const SimpleRoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: '',
    price: '',
    status: 'Available',
    description: '',
    image: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms';
      const method = editingRoom ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      fetchRooms();
      resetForm();
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData(room);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
        fetchRooms();
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      capacity: '',
      price: '',
      status: 'Available',
      description: '',
      image: ''
    });
    setEditingRoom(null);
    setShowAddForm(false);
  };

  const filteredRooms = rooms.filter(room =>
    room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Room Management</h1>
        <p>Manage rooms and view details</p>
      </div>

      <div className="simple-admin-controls">
        <input
          type="text"
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="simple-search-input"
        />
        <button 
          onClick={() => setShowAddForm(true)}
          className="simple-btn simple-btn-primary"
        >
          Add Room
        </button>
      </div>

      {showAddForm && (
        <div className="simple-form-container">
          <h3>{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
          <form onSubmit={handleSubmit} className="simple-form">
            <div className="simple-form-row">
              <input
                type="text"
                name="name"
                placeholder="Room Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="type"
                placeholder="Room Type"
                value={formData.type}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="simple-form-row">
              <input
                type="number"
                name="capacity"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price per night"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="simple-form-row">
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              <input
                type="url"
                name="image"
                placeholder="Image URL"
                value={formData.image}
                onChange={handleInputChange}
              />
            </div>
            <textarea
              name="description"
              placeholder="Room Description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
            <div className="simple-form-actions">
              <button type="submit" className="simple-btn simple-btn-primary">
                {editingRoom ? 'Update Room' : 'Add Room'}
              </button>
              <button type="button" onClick={resetForm} className="simple-btn simple-btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="simple-table-container">
        <table className="simple-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Price</th>
              <th>Status</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map(room => (
              <tr key={room.id}>
                <td>
                  {room.image ? (
                    <img src={room.image} alt={room.name} className="simple-room-image" />
                  ) : (
                    <div className="simple-no-image">No Image</div>
                  )}
                </td>
                <td>{room.name}</td>
                <td>{room.type}</td>
                <td>{room.capacity}</td>
                <td>${room.price}</td>
                <td>
                  <span className={`simple-status simple-status-${room.status?.toLowerCase()}`}>
                    {room.status}
                  </span>
                </td>
                <td className="simple-description">{room.description}</td>
                <td>
                  <div className="simple-actions">
                    <button 
                      onClick={() => handleEdit(room)}
                      className="simple-btn simple-btn-small"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(room.id)}
                      className="simple-btn simple-btn-small simple-btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimpleRoomManagement;
