// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRoute, faPlus, faEdit, faTrash, faSearch, faFilter,
  faDownload, faUpload, faCog, faBus, faMapMarkerAlt,
  faClock, faUsers, faTimes, faCheckCircle, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where,
  orderBy, onSnapshot, serverTimestamp, arrayUnion, arrayRemove, limit
} from 'firebase/firestore';

const RouteManager = () => {
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startLocation: '',
    endLocation: '',
    stops: [''],
    vehicleId: '',
    driverId: '',
    capacity: 0,
    departureTime: '',
    arrivalTime: '',
    status: 'active',
    fare: 0,
    distance: 0
  });

  // Fetch routes, vehicles, and drivers
  useEffect(() => {
    const unsubscribeRoutes = onSnapshot(collection(db, 'transportRoutes'), (snapshot) => {
      const routesData = [];
      snapshot.forEach((doc) => {
        routesData.push({ id: doc.id, ...doc.data() });
      });
      setRoutes(routesData);
    });

    const unsubscribeVehicles = onSnapshot(collection(db, 'transportVehicles'), (snapshot) => {
      const vehiclesData = [];
      snapshot.forEach((doc) => {
        vehiclesData.push({ id: doc.id, ...doc.data() });
      });
      setVehicles(vehiclesData);
    });

    const unsubscribeDrivers = onSnapshot(collection(db, 'transportDrivers'), (snapshot) => {
      const driversData = [];
      snapshot.forEach((doc) => {
        driversData.push({ id: doc.id, ...doc.data() });
      });
      setDrivers(driversData);
      setLoading(false);
    });

    return () => {
      unsubscribeRoutes();
      unsubscribeVehicles();
      unsubscribeDrivers();
    };
  }, []);

  // Filter routes
  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.startLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.endLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || route.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle stops array changes
  const handleStopChange = (index, value) => {
    const newStops = [...formData.stops];
    newStops[index] = value;
    setFormData(prev => ({
      ...prev,
      stops: newStops
    }));
  };

  // Add new stop
  const addStop = () => {
    setFormData(prev => ({
      ...prev,
      stops: [...prev.stops, '']
    }));
  };

  // Remove stop
  const removeStop = (index) => {
    const newStops = formData.stops.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      stops: newStops
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startLocation: '',
      endLocation: '',
      stops: [''],
      vehicleId: '',
      driverId: '',
      capacity: 0,
      departureTime: '',
      arrivalTime: '',
      status: 'active',
      fare: 0,
      distance: 0
    });
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setEditingRoute(null);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (route) => {
    setFormData({
      name: route.name || '',
      description: route.description || '',
      startLocation: route.startLocation || '',
      endLocation: route.endLocation || '',
      stops: route.stops || [''],
      vehicleId: route.vehicleId || '',
      driverId: route.driverId || '',
      capacity: route.capacity || 0,
      departureTime: route.departureTime || '',
      arrivalTime: route.arrivalTime || '',
      status: route.status || 'active',
      fare: route.fare || 0,
      distance: route.distance || 0
    });
    setEditingRoute(route);
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    // Validate required fields
    if (!formData.name || !formData.startLocation || !formData.endLocation || 
        !formData.departureTime || !formData.arrivalTime || !formData.capacity || 
        formData.capacity <= 0) {
      alert('Please fill in all required fields. Name, start location, end location, times, and capacity are required.');
      return;
    }
    
    try {
      // Ensure all numeric fields are properly converted
      const routeData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startLocation: formData.startLocation.trim(),
        endLocation: formData.endLocation.trim(),
        stops: formData.stops.filter(stop => stop.trim() !== ''),
        vehicleId: formData.vehicleId,
        driverId: formData.driverId,
        capacity: parseInt(formData.capacity),
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,
        status: formData.status,
        fare: parseFloat(formData.fare) || 0,
        distance: parseFloat(formData.distance) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Processed route data:', routeData);

      if (editingRoute) {
        console.log('Updating existing route:', editingRoute.id);
        await updateDoc(doc(db, 'transportRoutes', editingRoute.id), routeData);
        console.log('Route updated successfully');
        alert('Route updated successfully!');
      } else {
        console.log('Creating new route');
        const docRef = await addDoc(collection(db, 'transportRoutes'), routeData);
        console.log('Route created successfully with ID:', docRef.id);
        alert('Route created successfully!');
      }
      
      setShowModal(false);
      setEditingRoute(null);
      resetForm();
    } catch (error) {
      console.error('Error saving route:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Error saving route: ${error.message}. Please try again.`);
    }
  };

  // Delete route
  const deleteRoute = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await deleteDoc(doc(db, 'transportRoutes', routeId));
        alert('Route deleted successfully!');
      } catch (error) {
        console.error('Error deleting route:', error);
        alert('Error deleting route. Please try again.');
      }
    }
  };

  // Test function to create a simple route
  const createTestRoute = async () => {
    try {
      const testRouteData = {
        name: 'Test Route',
        description: 'Test route for debugging',
        startLocation: 'Test Start',
        endLocation: 'Test End',
        stops: ['Test Stop 1', 'Test Stop 2'],
        vehicleId: '',
        driverId: '',
        capacity: 30,
        departureTime: '08:00',
        arrivalTime: '09:00',
        status: 'active',
        fare: 100,
        distance: 10,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Creating test route with data:', testRouteData);
      const docRef = await addDoc(collection(db, 'transportRoutes'), testRouteData);
      console.log('Test route created successfully with ID:', docRef.id);
      alert('Test route created successfully!');
    } catch (error) {
      console.error('Test route creation failed:', error);
      alert(`Test route creation failed: ${error.message}`);
    }
  };

  // Test Firebase connectivity
  const testFirebaseConnection = async () => {
    try {
      console.log('Testing Firebase connection...');
      
      // Test read
      const testQuery = query(collection(db, 'transportRoutes'), limit(1));
      const testSnapshot = await getDocs(testQuery);
      console.log('Read test successful');
      
      // Test write
      const testDoc = {
        test: true,
        timestamp: serverTimestamp()
      };
      const testRef = await addDoc(collection(db, 'testCollection'), testDoc);
      console.log('Write test successful, doc ID:', testRef.id);
      
      // Test delete
      await deleteDoc(doc(db, 'testCollection', testRef.id));
      console.log('Delete test successful');
      
      alert('Firebase connection test successful! All operations working.');
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      alert(`Firebase connection test failed: ${error.message}`);
    }
  };

  // Simple test function to verify Firebase connection
  const testSimpleRoute = async () => {
    try {
      const simpleRoute = {
        name: 'Simple Test Route',
        startLocation: 'Point A',
        endLocation: 'Point B',
        capacity: 20,
        status: 'active',
        createdAt: serverTimestamp()
      };
      
      console.log('Creating simple test route...');
      const docRef = await addDoc(collection(db, 'transportRoutes'), simpleRoute);
      console.log('Simple route created with ID:', docRef.id);
      alert('Simple test route created successfully!');
    } catch (error) {
      console.error('Simple test failed:', error);
      alert(`Simple test failed: ${error.message}`);
    }
  };

  // Debug function to log current form state
  const debugFormState = () => {
    console.log('Current form data:', formData);
    console.log('Total routes:', routes.length);
    console.log('Show modal:', showModal);
    console.log('Editing route:', editingRoute);
    alert('Check console for debug information');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Diagnostic Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Information</h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>Total Routes: {routes.length}</p>
          <p>Form Data: {JSON.stringify(formData, null, 2)}</p>
          <p>Show Modal: {showModal.toString()}</p>
          <p>Editing Route: {editingRoute ? editingRoute.id : 'None'}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Route Management</h2>
          <p className="text-gray-600">Manage transport routes and configurations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={openCreateModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Route</span>
          </button>
          <button
            onClick={createTestRoute}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Test Route</span>
          </button>
          <button
            onClick={testFirebaseConnection}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Test Firebase</span>
          </button>
          <button
            onClick={debugFormState}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Debug Form</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Routes</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, start, or end location..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Routes List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transport Routes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start - End
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{route.name}</div>
                      <div className="text-sm text-gray-500">{route.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-500 mr-1" />
                        {route.startLocation}
                      </div>
                      <div className="flex items-center mt-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-500 mr-1" />
                        {route.endLocation}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faUsers} className="text-blue-500 mr-1" />
                        {route.capacity || 0} seats
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faClock} className="text-purple-500 mr-1" />
                        {route.departureTime} - {route.arrivalTime}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      route.status === 'active' ? 'bg-green-100 text-green-800' :
                      route.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {route.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(route)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => deleteRoute(route.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Route Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingRoute ? 'Edit Route' : 'Add New Route'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Route Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter route name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter route description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Location *</label>
                    <input
                      type="text"
                      name="startLocation"
                      required
                      value={formData.startLocation}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter start location"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Location *</label>
                    <input
                      type="text"
                      name="endLocation"
                      required
                      value={formData.endLocation}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter end location"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stops</label>
                  {formData.stops.map((stop, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={stop}
                        onChange={(e) => handleStopChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Stop ${index + 1}`}
                      />
                      {formData.stops.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStop(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addStop}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Stop
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                    <input
                      type="number"
                      name="capacity"
                      required
                      min="1"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter capacity"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time *</label>
                    <input
                      type="time"
                      name="departureTime"
                      required
                      value={formData.departureTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time *</label>
                    <input
                      type="time"
                      name="arrivalTime"
                      required
                      value={formData.arrivalTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fare (₹)</label>
                    <input
                      type="number"
                      name="fare"
                      min="0"
                      step="0.01"
                      value={formData.fare}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter fare"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                    <input
                      type="number"
                      name="distance"
                      min="0"
                      step="0.1"
                      value={formData.distance}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter distance"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                    <select
                      name="vehicleId"
                      value={formData.vehicleId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.registrationNumber} - {vehicle.model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {editingRoute ? 'Update Route' : 'Create Route'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteManager;
