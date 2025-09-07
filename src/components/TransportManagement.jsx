// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBus, faRoute, faUsers, faMapMarkerAlt, faClock, faCheckCircle,
  faExclamationTriangle, faPlus, faEdit, faTrash, faSearch, faFilter,
  faDownload, faUpload, faCog, faBell, faChartLine, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where,
  orderBy, onSnapshot, serverTimestamp, arrayUnion, arrayRemove
} from 'firebase/firestore';
import RouteManager from './TransportManagement/RouteManager';
import VehicleManager from './TransportManagement/VehicleManager';
import DriverManager from './TransportManagement/DriverManager';
import AllocationManager from './TransportManagement/AllocationManager';
import TransportAnalytics from './TransportManagement/TransportAnalytics';
import TransportSchedule from './TransportManagement/TransportSchedule';
import TransportOverview from './StudentManagement/TransportOverview';

const TransportManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [transportStats, setTransportStats] = useState({
    totalRoutes: 0,
    totalVehicles: 0,
    totalDrivers: 0,
    totalAllocations: 0,
    activeRoutes: 0,
    utilizationRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Calculate stats from actual collections
  useEffect(() => {
    const unsubscribeRoutes = onSnapshot(collection(db, 'transportRoutes'), (snapshot) => {
      const routes = [];
      snapshot.forEach((doc) => {
        routes.push({ id: doc.id, ...doc.data() });
      });
      
      const unsubscribeAllocations = onSnapshot(collection(db, 'transportAllocations'), (allocSnapshot) => {
        const allocations = [];
        allocSnapshot.forEach((doc) => {
          allocations.push({ id: doc.id, ...doc.data() });
        });
        
        const unsubscribeVehicles = onSnapshot(collection(db, 'transportVehicles'), (vehicleSnapshot) => {
          const vehicles = [];
          vehicleSnapshot.forEach((doc) => {
            vehicles.push({ id: doc.id, ...doc.data() });
          });
          
          const unsubscribeDrivers = onSnapshot(collection(db, 'transportDrivers'), (driverSnapshot) => {
            const drivers = [];
            driverSnapshot.forEach((doc) => {
              drivers.push({ id: doc.id, ...doc.data() });
            });
            
            // Calculate stats
            const activeRoutes = routes.filter(route => route.status === 'active').length;
            const totalAllocations = allocations.length;
            const utilizationRate = routes.length > 0 ? ((activeRoutes / routes.length) * 100) : 0;
            
            setTransportStats({
              totalRoutes: routes.length,
              totalVehicles: vehicles.length,
              totalDrivers: drivers.length,
              totalAllocations: totalAllocations,
              activeRoutes: activeRoutes,
              utilizationRate: utilizationRate
            });
            setLoading(false);
          });
          
          return () => unsubscribeDrivers();
        });
        
        return () => unsubscribeVehicles();
      });
      
      return () => unsubscribeAllocations();
    });

    return () => unsubscribeRoutes();
  }, []);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: faChartLine },
    { id: 'routes', name: 'Routes', icon: faRoute },
    { id: 'vehicles', name: 'Vehicles', icon: faBus },
    { id: 'drivers', name: 'Drivers', icon: faUsers },
    { id: 'allocations', name: 'Allocations', icon: faMapMarkerAlt },
    { id: 'schedule', name: 'Schedule', icon: faCalendarAlt },
    { id: 'analytics', name: 'Analytics', icon: faCog }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TransportOverview stats={transportStats} onTabChange={setActiveTab} />;
      case 'routes':
        return <RouteManager />;
      case 'vehicles':
        return <VehicleManager />;
      case 'drivers':
        return <DriverManager />;
      case 'allocations':
        return <AllocationManager />;
      case 'schedule':
        return <TransportSchedule />;
      case 'analytics':
        return <TransportAnalytics />;
      default:
        return <TransportOverview stats={transportStats} onTabChange={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transport Management</h1>
              <p className="text-gray-600">Comprehensive transport system with automation</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveTab('allocations')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Quick Allocation</span>
              </button>
              <button 
                onClick={() => setActiveTab('routes')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faCog} />
                <span>Manage Routes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TransportManagement;
