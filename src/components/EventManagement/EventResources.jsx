import React, { useState, useEffect } from 'react';
import { FaBuilding, FaCog, FaCalendarAlt, FaCheckCircle, FaTimes, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const EventResources = () => {
  const [venues, setVenues] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [venueForm, setVenueForm] = useState({
    name: '',
    type: '',
    capacity: '',
    location: '',
    facilities: [],
    hourlyRate: '',
    description: ''
  });

  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    type: '',
    quantity: '',
    condition: '',
    location: '',
    hourlyRate: '',
    description: ''
  });

  const [bookingForm, setBookingForm] = useState({
    venueId: '',
    equipmentIds: [],
    eventTitle: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    requesterName: '',
    requesterEmail: '',
    requesterPhone: ''
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      
      // Fetch venues
      const venuesRef = collection(db, 'venues');
      const venuesSnapshot = await getDocs(venuesRef);
      const venuesData = venuesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVenues(venuesData);

      // Fetch equipment
      const equipmentRef = collection(db, 'equipment');
      const equipmentSnapshot = await getDocs(equipmentRef);
      const equipmentData = equipmentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEquipment(equipmentData);

      // Fetch bookings
      const bookingsRef = collection(db, 'bookings');
      const bookingsSnapshot = await getDocs(bookingsRef);
      const bookingsData = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setMessage({ type: 'error', text: 'Failed to fetch resources' });
    } finally {
      setLoading(false);
    }
  };

  const handleVenueSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (selectedVenue) {
        // Update existing venue
        await updateDoc(doc(db, 'venues', selectedVenue.id), {
          ...venueForm,
          updatedAt: serverTimestamp()
        });
        setMessage({ type: 'success', text: 'Venue updated successfully' });
      } else {
        // Add new venue
        await addDoc(collection(db, 'venues'), {
          ...venueForm,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'available'
        });
        setMessage({ type: 'success', text: 'Venue added successfully' });
      }

      setShowVenueModal(false);
      setSelectedVenue(null);
      setVenueForm({
        name: '',
        type: '',
        capacity: '',
        location: '',
        facilities: [],
        hourlyRate: '',
        description: ''
      });
      fetchResources();
    } catch (error) {
      console.error('Error saving venue:', error);
      setMessage({ type: 'error', text: 'Failed to save venue' });
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (selectedEquipment) {
        // Update existing equipment
        await updateDoc(doc(db, 'equipment', selectedEquipment.id), {
          ...equipmentForm,
          updatedAt: serverTimestamp()
        });
        setMessage({ type: 'success', text: 'Equipment updated successfully' });
      } else {
        // Add new equipment
        await addDoc(collection(db, 'equipment'), {
          ...equipmentForm,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'available'
        });
        setMessage({ type: 'success', text: 'Equipment added successfully' });
      }

      setShowEquipmentModal(false);
      setSelectedEquipment(null);
      setEquipmentForm({
        name: '',
        type: '',
        quantity: '',
        condition: '',
        location: '',
        hourlyRate: '',
        description: ''
      });
      fetchResources();
    } catch (error) {
      console.error('Error saving equipment:', error);
      setMessage({ type: 'error', text: 'Failed to save equipment' });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Check for conflicts
      const conflicts = bookings.filter(booking => {
        if (booking.venueId === bookingForm.venueId) {
          const bookingStart = new Date(`${booking.startDate} ${booking.startTime}`);
          const bookingEnd = new Date(`${booking.endDate} ${booking.endTime}`);
          const newStart = new Date(`${bookingForm.startDate} ${bookingForm.startTime}`);
          const newEnd = new Date(`${bookingForm.endDate} ${bookingForm.endTime}`);
          
          return bookingStart < newEnd && newStart < bookingEnd;
        }
        return false;
      });

      if (conflicts.length > 0) {
        setMessage({ type: 'error', text: 'Venue is already booked for this time period' });
        return;
      }

      if (selectedBooking) {
        // Update existing booking
        await updateDoc(doc(db, 'bookings', selectedBooking.id), {
          ...bookingForm,
          updatedAt: serverTimestamp()
        });
        setMessage({ type: 'success', text: 'Booking updated successfully' });
      } else {
        // Add new booking
        await addDoc(collection(db, 'bookings'), {
          ...bookingForm,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'pending'
        });
        setMessage({ type: 'success', text: 'Booking request submitted successfully' });
      }

      setShowBookingModal(false);
      setSelectedBooking(null);
      setBookingForm({
        venueId: '',
        equipmentIds: [],
        eventTitle: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        purpose: '',
        requesterName: '',
        requesterEmail: '',
        requesterPhone: ''
      });
      fetchResources();
    } catch (error) {
      console.error('Error saving booking:', error);
      setMessage({ type: 'error', text: 'Failed to save booking' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVenue = async (venueId) => {
    if (window.confirm('Are you sure you want to delete this venue?')) {
      try {
        await deleteDoc(doc(db, 'venues', venueId));
        setMessage({ type: 'success', text: 'Venue deleted successfully' });
        fetchResources();
      } catch (error) {
        console.error('Error deleting venue:', error);
        setMessage({ type: 'error', text: 'Failed to delete venue' });
      }
    }
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await deleteDoc(doc(db, 'equipment', equipmentId));
        setMessage({ type: 'success', text: 'Equipment deleted successfully' });
        fetchResources();
      } catch (error) {
        console.error('Error deleting equipment:', error);
        setMessage({ type: 'error', text: 'Failed to delete equipment' });
      }
    }
  };

  const handleBookingApproval = async (bookingId, status) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status,
        updatedAt: serverTimestamp()
      });
      setMessage({ type: 'success', text: `Booking ${status} successfully` });
      fetchResources();
    } catch (error) {
      console.error('Error updating booking:', error);
      setMessage({ type: 'error', text: 'Failed to update booking' });
    }
  };

  const venueTypes = ['Classroom', 'Seminar Hall', 'Auditorium', 'Laboratory', 'Conference Room', 'Open Area', 'Sports Ground'];
  const equipmentTypes = ['Projector', 'Sound System', 'Microphone', 'Stage', 'Chairs', 'Tables', 'Whiteboard', 'Computer', 'Other'];
  const facilityOptions = ['Projector', 'Sound System', 'Air Conditioning', 'WiFi', 'Catering', 'Security', 'Parking', 'Accessibility'];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Resource Management</h2>
        <p className="text-gray-600">Manage venues, equipment, and booking requests</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <FaCheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <FaTimes className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Venues */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Venues</h3>
            <button
              onClick={() => setShowVenueModal(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
            >
              <FaPlus className="h-3 w-3" />
              <span>Add</span>
            </button>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {venues.map(venue => (
              <div key={venue.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{venue.name}</h4>
                    <p className="text-sm text-gray-500">{venue.type} • {venue.capacity} capacity</p>
                    <p className="text-sm text-gray-500">{venue.location}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedVenue(venue);
                        setVenueForm(venue);
                        setShowVenueModal(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteVenue(venue.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Equipment</h3>
            <button
              onClick={() => setShowEquipmentModal(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
            >
              <FaPlus className="h-3 w-3" />
              <span>Add</span>
            </button>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {equipment.map(item => (
              <div key={item.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.type} • Qty: {item.quantity}</p>
                    <p className="text-sm text-gray-500">{item.location}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedEquipment(item);
                        setEquipmentForm(item);
                        setShowEquipmentModal(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteEquipment(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Bookings</h3>
            <button
              onClick={() => setShowBookingModal(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
            >
              <FaPlus className="h-3 w-3" />
              <span>Book</span>
            </button>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {bookings.map(booking => (
              <div key={booking.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{booking.eventTitle}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.startDate).toLocaleDateString()} • {booking.startTime}
                    </p>
                    <p className="text-sm text-gray-500">{booking.requesterName}</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleBookingApproval(booking.id, 'approved')}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Approve"
                      >
                        <FaCheckCircle />
                      </button>
                      <button
                        onClick={() => handleBookingApproval(booking.id, 'rejected')}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Reject"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Venue Modal */}
      {showVenueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedVenue ? 'Edit Venue' : 'Add New Venue'}
              </h3>
              <button
                onClick={() => {
                  setShowVenueModal(false);
                  setSelectedVenue(null);
                  setVenueForm({
                    name: '',
                    type: '',
                    capacity: '',
                    location: '',
                    facilities: [],
                    hourlyRate: '',
                    description: ''
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleVenueSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={venueForm.name}
                    onChange={(e) => setVenueForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={venueForm.type}
                    onChange={(e) => setVenueForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select type</option>
                    {venueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={venueForm.capacity}
                    onChange={(e) => setVenueForm(prev => ({ ...prev, capacity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={venueForm.location}
                    onChange={(e) => setVenueForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={venueForm.hourlyRate}
                    onChange={(e) => setVenueForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facilities</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {facilityOptions.map(facility => (
                    <label key={facility} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={venueForm.facilities.includes(facility)}
                        onChange={(e) => {
                          const newFacilities = e.target.checked
                            ? [...venueForm.facilities, facility]
                            : venueForm.facilities.filter(f => f !== facility);
                          setVenueForm(prev => ({ ...prev, facilities: newFacilities }));
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{facility}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={venueForm.description}
                  onChange={(e) => setVenueForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowVenueModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (selectedVenue ? 'Update' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedEquipment ? 'Edit Equipment' : 'Add New Equipment'}
              </h3>
              <button
                onClick={() => {
                  setShowEquipmentModal(false);
                  setSelectedEquipment(null);
                  setEquipmentForm({
                    name: '',
                    type: '',
                    quantity: '',
                    condition: '',
                    location: '',
                    hourlyRate: '',
                    description: ''
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEquipmentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={equipmentForm.name}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={equipmentForm.type}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select type</option>
                    {equipmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={equipmentForm.quantity}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    value={equipmentForm.condition}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select condition</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={equipmentForm.location}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={equipmentForm.hourlyRate}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={equipmentForm.description}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEquipmentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (selectedEquipment ? 'Update' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedBooking ? 'Edit Booking' : 'New Booking Request'}
              </h3>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedBooking(null);
                  setBookingForm({
                    venueId: '',
                    equipmentIds: [],
                    eventTitle: '',
                    startDate: '',
                    endDate: '',
                    startTime: '',
                    endTime: '',
                    purpose: '',
                    requesterName: '',
                    requesterEmail: '',
                    requesterPhone: ''
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                  <input
                    type="text"
                    value={bookingForm.eventTitle}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, eventTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
                  <select
                    value={bookingForm.venueId}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, venueId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select venue</option>
                    {venues.map(venue => (
                      <option key={venue.id} value={venue.id}>{venue.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={bookingForm.startDate}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={bookingForm.endDate}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requester Name *</label>
                  <input
                    type="text"
                    value={bookingForm.requesterName}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, requesterName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requester Email</label>
                  <input
                    type="email"
                    value={bookingForm.requesterEmail}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, requesterEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requester Phone</label>
                  <input
                    type="tel"
                    value={bookingForm.requesterPhone}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, requesterPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <textarea
                  value={bookingForm.purpose}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, purpose: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : (selectedBooking ? 'Update' : 'Submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventResources;
