// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faPlus, faEdit, faTrash, faSearch, faFilter,
  faDownload, faUpload, faCog, faBus, faMapMarkerAlt,
  faClock, faUser, faRoute, faTimes, faCheckCircle, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where,
  orderBy, onSnapshot, serverTimestamp, arrayUnion, arrayRemove, limit
} from 'firebase/firestore';

const AllocationManager = () => {
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    studentId: '',
    routeId: '',
    vehicleId: '',
    driverId: '',
    pickupLocation: '',
    dropLocation: '',
    pickupTime: '',
    dropTime: '',
    status: 'allocated',
    fare: 0,
    startDate: '',
    endDate: '',
    notes: ''
  });

  // Fetch all data
  useEffect(() => {
    const unsubscribeAllocations = onSnapshot(collection(db, 'transportAllocations'), (snapshot) => {
      const allocationsData = [];
      snapshot.forEach((doc) => {
        allocationsData.push({ id: doc.id, ...doc.data() });
      });
      setAllocations(allocationsData);
    });

    const unsubscribeStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      const studentsData = [];
      snapshot.forEach((doc) => {
        studentsData.push({ id: doc.id, ...doc.data() });
      });
      setStudents(studentsData);
    });

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
      unsubscribeAllocations();
      unsubscribeStudents();
      unsubscribeRoutes();
      unsubscribeVehicles();
      unsubscribeDrivers();
    };
  }, []);

  // Filter allocations
  const filteredAllocations = allocations.filter(allocation => {
    const student = students.find(s => s.id === allocation.studentId);
    const route = routes.find(r => r.id === allocation.routeId);
    
    const matchesSearch = student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student?.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || allocation.status === filterStatus;
    
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
      studentId: '',
      routeId: '',
      vehicleId: '',
      driverId: '',
      pickupLocation: '',
      dropLocation: '',
      pickupTime: '',
      dropTime: '',
      status: 'allocated',
      fare: 0,
      startDate: '',
      endDate: '',
      notes: ''
    });
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setEditingAllocation(null);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (allocation) => {
    setFormData({
      studentId: allocation.studentId || '',
      routeId: allocation.routeId || '',
      vehicleId: allocation.vehicleId || '',
      driverId: allocation.driverId || '',
      pickupLocation: allocation.pickupLocation || '',
      dropLocation: allocation.dropLocation || '',
      pickupTime: allocation.pickupTime || '',
      dropTime: allocation.dropTime || '',
      status: allocation.status || 'allocated',
      fare: allocation.fare || 0,
      startDate: allocation.startDate || '',
      endDate: allocation.endDate || '',
      notes: allocation.notes || ''
    });
    setEditingAllocation(allocation);
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Allocation form submitted with data:', formData);
    
    // Validate required fields
    if (!formData.studentId || !formData.routeId) {
      alert('Please select both a student and a route.');
      return;
    }
    
    try {
      // Ensure all fields are properly formatted
      const allocationData = {
        studentId: formData.studentId,
        routeId: formData.routeId,
        vehicleId: formData.vehicleId || '',
        driverId: formData.driverId || '',
        pickupLocation: formData.pickupLocation.trim(),
        dropLocation: formData.dropLocation.trim(),
        pickupTime: formData.pickupTime,
        dropTime: formData.dropTime,
        status: formData.status,
        fare: parseFloat(formData.fare) || 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Processed allocation data:', allocationData);

      if (editingAllocation) {
        console.log('Updating existing allocation:', editingAllocation.id);
        await updateDoc(doc(db, 'transportAllocations', editingAllocation.id), allocationData);
        console.log('Allocation updated successfully');
        alert('Allocation updated successfully!');
      } else {
        console.log('Creating new allocation');
        const docRef = await addDoc(collection(db, 'transportAllocations'), allocationData);
        console.log('Allocation created successfully with ID:', docRef.id);
        alert('Allocation created successfully!');
      }
      
      setShowModal(false);
      setEditingAllocation(null);
      resetForm();
    } catch (error) {
      console.error('Error saving allocation:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Error saving allocation: ${error.message}. Please try again.`);
    }
  };

  // Delete allocation
  const deleteAllocation = async (allocationId) => {
    if (window.confirm('Are you sure you want to delete this allocation?')) {
      try {
        await deleteDoc(doc(db, 'transportAllocations', allocationId));
        alert('Allocation deleted successfully!');
      } catch (error) {
        console.error('Error deleting allocation:', error);
        alert('Error deleting allocation. Please try again.');
      }
    }
  };

  // Test function to create a simple allocation
  const createTestAllocation = async () => {
    try {
      // Ensure we have at least one student and route
      if (students.length === 0) {
        alert('No students available. Please add students first.');
        return;
      }
      if (routes.length === 0) {
        alert('No routes available. Please add routes first.');
        return;
      }

      const testAllocationData = {
        studentId: students[0].id,
        routeId: routes[0].id,
        vehicleId: '',
        driverId: '',
        pickupLocation: 'Test Pickup Location',
        dropLocation: 'Test Drop Location',
        pickupTime: '08:00',
        dropTime: '09:00',
        status: 'allocated',
        fare: 100,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        notes: 'Test allocation for debugging',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Creating test allocation with data:', testAllocationData);
      const docRef = await addDoc(collection(db, 'transportAllocations'), testAllocationData);
      console.log('Test allocation created successfully with ID:', docRef.id);
      alert('Test allocation created successfully!');
    } catch (error) {
      console.error('Test allocation creation failed:', error);
      alert(`Test allocation creation failed: ${error.message}`);
    }
  };

  // Get student name by ID
  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? (student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()) : 'Unknown';
  };

  // Get route name by ID
  const getRouteName = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown';
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
          <p>Total Allocations: {allocations.length}</p>
          <p>Total Students: {students.length}</p>
          <p>Total Routes: {routes.length}</p>
          <p>Total Vehicles: {vehicles.length}</p>
          <p>Total Drivers: {drivers.length}</p>
          <p>Form Data: {JSON.stringify(formData, null, 2)}</p>
          <p>Show Modal: {showModal.toString()}</p>
          <p>Editing Allocation: {editingAllocation ? editingAllocation.id : 'None'}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Allocation Management</h2>
          <p className="text-gray-600">Manage student transport allocations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={openCreateModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Allocation</span>
          </button>
          <button
            onClick={createTestAllocation}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Test Allocation</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Allocations</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, roll no, or route..."
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
              <option value="allocated">Allocated</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
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

      {/* Allocations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transport Allocations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pickup/Drop
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
              {filteredAllocations.map((allocation) => (
                <tr key={allocation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {getStudentName(allocation.studentId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {students.find(s => s.id === allocation.studentId)?.rollNo || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faRoute} className="text-blue-500 mr-1" />
                        {getRouteName(allocation.routeId)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-500 mr-1" />
                        {allocation.pickupLocation || 'Not set'}
                      </div>
                      <div className="flex items-center mt-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-500 mr-1" />
                        {allocation.dropLocation || 'Not set'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faClock} className="text-purple-500 mr-1" />
                        {allocation.pickupTime || 'Not set'} - {allocation.dropTime || 'Not set'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      allocation.status === 'allocated' ? 'bg-green-100 text-green-800' :
                      allocation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {allocation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(allocation)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => deleteAllocation(allocation.id)}
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

      {/* Add/Edit Allocation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingAllocation ? 'Edit Allocation' : 'Add New Allocation'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                    <select
                      name="studentId"
                      required
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()} - {student.rollNo}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Route *</label>
                    <select
                      name="routeId"
                      required
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                    <input
                      type="text"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter pickup location"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Drop Location</label>
                    <input
                      type="text"
                      name="dropLocation"
                      value={formData.dropLocation}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter drop location"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Time</label>
                    <input
                      type="time"
                      name="pickupTime"
                      value={formData.pickupTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Drop Time</label>
                    <input
                      type="time"
                      name="dropTime"
                      value={formData.dropTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="allocated">Allocated</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter any additional notes"
                  />
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
                    {editingAllocation ? 'Update Allocation' : 'Create Allocation'}
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

export default AllocationManager;
