// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faEdit, faTrash, faSearch, faFilter, faBus,
  faTools, faGasPump, faCalendarAlt, faCheckCircle, faExclamationTriangle, 
  faUsers, faTimes, faDownload, faUpload, faCog
} from '@fortawesome/free-solid-svg-icons';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where,
  orderBy, onSnapshot, serverTimestamp, arrayUnion, arrayRemove, limit
} from 'firebase/firestore';

const VehicleManager = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    registrationNumber: '',
    vehicleType: 'bus',
    model: '',
    manufacturer: '',
    year: new Date().getFullYear(),
    capacity: 0,
    fuelType: 'diesel',
    status: 'active',
    driverId: '',
    routeId: '',
    lastMaintenance: '',
    nextMaintenance: '',
    insuranceExpiry: '',
    permitExpiry: '',
    mileage: 0,
    fuelEfficiency: 0,
    color: '',
    engineNumber: '',
    chassisNumber: ''
  });

  // Fetch vehicles, drivers, and routes
  useEffect(() => {
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
    });

    const unsubscribeRoutes = onSnapshot(collection(db, 'transportRoutes'), (snapshot) => {
      const routesData = [];
      snapshot.forEach((doc) => {
        routesData.push({ id: doc.id, ...doc.data() });
      });
      setRoutes(routesData);
      setLoading(false);
    });

    return () => {
      unsubscribeVehicles();
      unsubscribeDrivers();
      unsubscribeRoutes();
    };
  }, []);

  // Filter vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
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

  // Reset form
  const resetForm = () => {
    setFormData({
      registrationNumber: '',
      vehicleType: 'bus',
      model: '',
      manufacturer: '',
      year: new Date().getFullYear(),
      capacity: 0,
      fuelType: 'diesel',
      status: 'active',
      driverId: '',
      routeId: '',
      lastMaintenance: '',
      nextMaintenance: '',
      insuranceExpiry: '',
      permitExpiry: '',
      mileage: 0,
      fuelEfficiency: 0,
      color: '',
      engineNumber: '',
      chassisNumber: ''
    });
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setEditingVehicle(null);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (vehicle) => {
    setFormData({
      registrationNumber: vehicle.registrationNumber || '',
      vehicleType: vehicle.vehicleType || 'bus',
      model: vehicle.model || '',
      manufacturer: vehicle.manufacturer || '',
      year: vehicle.year || new Date().getFullYear(),
      capacity: vehicle.capacity || 0,
      fuelType: vehicle.fuelType || 'diesel',
      status: vehicle.status || 'active',
      driverId: vehicle.driverId || '',
      routeId: vehicle.routeId || '',
      lastMaintenance: vehicle.lastMaintenance || '',
      nextMaintenance: vehicle.nextMaintenance || '',
      insuranceExpiry: vehicle.insuranceExpiry || '',
      permitExpiry: vehicle.permitExpiry || '',
      mileage: vehicle.mileage || 0,
      fuelEfficiency: vehicle.fuelEfficiency || 0,
      color: vehicle.color || '',
      engineNumber: vehicle.engineNumber || '',
      chassisNumber: vehicle.chassisNumber || ''
    });
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Vehicle form submitted with data:', formData);

    // Validate required fields
    if (!formData.registrationNumber || !formData.model || !formData.manufacturer || 
        !formData.capacity || formData.capacity <= 0) {
      alert('Please fill in all required fields. Registration number, model, manufacturer, and capacity are required.');
      return;
    }

    try {
      // Ensure all numeric fields are properly converted
      const vehicleData = {
        registrationNumber: formData.registrationNumber.trim(),
        vehicleType: formData.vehicleType,
        model: formData.model.trim(),
        manufacturer: formData.manufacturer.trim(),
        year: parseInt(formData.year),
        capacity: parseInt(formData.capacity),
        fuelType: formData.fuelType,
        status: formData.status,
        driverId: formData.driverId,
        routeId: formData.routeId,
        lastMaintenance: formData.lastMaintenance,
        nextMaintenance: formData.nextMaintenance,
        insuranceExpiry: formData.insuranceExpiry,
        permitExpiry: formData.permitExpiry,
        mileage: parseFloat(formData.mileage) || 0,
        fuelEfficiency: parseFloat(formData.fuelEfficiency) || 0,
        color: formData.color.trim(),
        engineNumber: formData.engineNumber.trim(),
        chassisNumber: formData.chassisNumber.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Processed vehicle data:', vehicleData);

      if (editingVehicle) {
        console.log('Updating existing vehicle:', editingVehicle.id);
        await updateDoc(doc(db, 'transportVehicles', editingVehicle.id), vehicleData);
        alert('Vehicle updated successfully!');
      } else {
        console.log('Creating new vehicle');
        const docRef = await addDoc(collection(db, 'transportVehicles'), vehicleData);
        alert('Vehicle created successfully!');
      }

      setShowModal(false);
      setEditingVehicle(null);
      resetForm();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Error saving vehicle: ${error.message}. Please try again.`);
    }
  };

  // Delete vehicle
  const deleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteDoc(doc(db, 'transportVehicles', vehicleId));
        alert('Vehicle deleted successfully!');
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Error deleting vehicle. Please try again.');
      }
    }
  };

  // Test function to create a simple vehicle
  const createTestVehicle = async () => {
    try {
      const testVehicleData = {
        registrationNumber: 'TEST-001',
        vehicleType: 'bus',
        model: 'Test Model',
        manufacturer: 'Test Manufacturer',
        year: new Date().getFullYear(),
        capacity: 30,
        fuelType: 'diesel',
        status: 'active',
        driverId: '',
        routeId: '',
        lastMaintenance: '',
        nextMaintenance: '',
        insuranceExpiry: '',
        permitExpiry: '',
        mileage: 50000,
        fuelEfficiency: 8.5,
        color: 'White',
        engineNumber: 'ENG-001',
        chassisNumber: 'CHS-001',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Creating test vehicle with data:', testVehicleData);
      const docRef = await addDoc(collection(db, 'transportVehicles'), testVehicleData);
      console.log('Test vehicle created successfully with ID:', docRef.id);
      alert('Test vehicle created successfully!');
    } catch (error) {
      console.error('Test vehicle creation failed:', error);
      alert(`Test vehicle creation failed: ${error.message}`);
    }
  };

  // Get driver name by ID
  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Not assigned';
  };

  // Get route name by ID
  const getRouteName = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Not assigned';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceStatus = (nextMaintenance) => {
    if (!nextMaintenance) return 'bg-gray-100 text-gray-800';
    const nextDate = new Date(nextMaintenance);
    const today = new Date();
    const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'bg-red-100 text-red-800';
    if (diffDays <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Management</h2>
          <p className="text-gray-600">Manage transport vehicles and maintenance</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={openCreateModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Vehicle</span>
          </button>
          <button
            onClick={createTestVehicle}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Test Vehicle</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Vehicles</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by registration, model, or manufacturer..."
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
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
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

      {/* Vehicles List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transport Vehicles</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maintenance
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
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{vehicle.registrationNumber}</div>
                      <div className="text-sm text-gray-500">{vehicle.model} - {vehicle.manufacturer}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faUsers} className="text-blue-500 mr-1" />
                        {vehicle.capacity || 0} seats
                      </div>
                      <div className="flex items-center mt-1">
                        <FontAwesomeIcon icon={faGasPump} className="text-orange-500 mr-1" />
                        {vehicle.fuelType} - {vehicle.year}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Driver: {getDriverName(vehicle.driverId)}</div>
                      <div>Route: {getRouteName(vehicle.routeId)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-500 mr-1" />
                        {vehicle.nextMaintenance ? new Date(vehicle.nextMaintenance).toLocaleDateString() : 'Not set'}
                      </div>
                      <div className="flex items-center mt-1">
                        <FontAwesomeIcon icon={faTools} className="text-green-500 mr-1" />
                        {vehicle.mileage?.toLocaleString()} km
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(vehicle)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => deleteVehicle(vehicle.id)}
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

      {/* Add/Edit Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      required
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter registration number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="bus">Bus</option>
                      <option value="minibus">Minibus</option>
                      <option value="van">Van</option>
                      <option value="car">Car</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                    <input
                      type="text"
                      name="model"
                      required
                      value={formData.model}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter model"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer *</label>
                    <input
                      type="text"
                      name="manufacturer"
                      required
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter manufacturer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="number"
                      name="year"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="diesel">Diesel</option>
                      <option value="petrol">Petrol</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter color"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Engine Number</label>
                    <input
                      type="text"
                      name="engineNumber"
                      value={formData.engineNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter engine number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chassis Number</label>
                    <input
                      type="text"
                      name="chassisNumber"
                      value={formData.chassisNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter chassis number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                    <select
                      name="driverId"
                      value={formData.driverId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Driver</option>
                      {drivers.map(driver => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} - {driver.licenseNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                    <select
                      name="routeId"
                      value={formData.routeId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Route</option>
                      {routes.map(route => (
                        <option key={route.id} value={route.id}>
                          {route.name} - {route.startLocation} to {route.endLocation}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mileage (km)</label>
                    <input
                      type="number"
                      name="mileage"
                      min="0"
                      value={formData.mileage}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter mileage"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Efficiency (km/l)</label>
                    <input
                      type="number"
                      name="fuelEfficiency"
                      min="0"
                      step="0.1"
                      value={formData.fuelEfficiency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter fuel efficiency"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance</label>
                    <input
                      type="date"
                      name="nextMaintenance"
                      value={formData.nextMaintenance}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry</label>
                    <input
                      type="date"
                      name="insuranceExpiry"
                      value={formData.insuranceExpiry}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Maintenance</label>
                    <input
                      type="date"
                      name="lastMaintenance"
                      value={formData.lastMaintenance}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Permit Expiry</label>
                    <input
                      type="date"
                      name="permitExpiry"
                      value={formData.permitExpiry}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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
                    {editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
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

export default VehicleManager;
