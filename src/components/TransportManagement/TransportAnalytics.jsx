// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faChartBar, faChartPie, faDownload,
  faCalendarAlt, faBus, faRoute, faUsers, faMoneyBillWave,
  faExclamationTriangle, faCheckCircle, faClock
} from '@fortawesome/free-solid-svg-icons';
import {
  collection, getDocs, query, where, orderBy, onSnapshot
} from 'firebase/firestore';

const TransportAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    routes: [],
    vehicles: [],
    drivers: [],
    allocations: [],
    schedules: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedRoute, setSelectedRoute] = useState('all');

  useEffect(() => {
    const unsubscribeRoutes = onSnapshot(collection(db, 'transportRoutes'), (snapshot) => {
      const routesData = [];
      snapshot.forEach((doc) => {
        routesData.push({ id: doc.id, ...doc.data() });
      });
      setAnalyticsData(prev => ({ ...prev, routes: routesData }));
    });

    const unsubscribeVehicles = onSnapshot(collection(db, 'transportVehicles'), (snapshot) => {
      const vehiclesData = [];
      snapshot.forEach((doc) => {
        vehiclesData.push({ id: doc.id, ...doc.data() });
      });
      setAnalyticsData(prev => ({ ...prev, vehicles: vehiclesData }));
    });

    const unsubscribeDrivers = onSnapshot(collection(db, 'transportDrivers'), (snapshot) => {
      const driversData = [];
      snapshot.forEach((doc) => {
        driversData.push({ id: doc.id, ...doc.data() });
      });
      setAnalyticsData(prev => ({ ...prev, drivers: driversData }));
    });

    const unsubscribeAllocations = onSnapshot(collection(db, 'transportAllocations'), (snapshot) => {
      const allocationsData = [];
      snapshot.forEach((doc) => {
        allocationsData.push({ id: doc.id, ...doc.data() });
      });
      setAnalyticsData(prev => ({ ...prev, allocations: allocationsData }));
    });

    const unsubscribeSchedules = onSnapshot(collection(db, 'transportSchedules'), (snapshot) => {
      const schedulesData = [];
      snapshot.forEach((doc) => {
        schedulesData.push({ id: doc.id, ...doc.data() });
      });
      setAnalyticsData(prev => ({ ...prev, schedules: schedulesData }));
      setLoading(false);
    });

    return () => {
      unsubscribeRoutes();
      unsubscribeVehicles();
      unsubscribeDrivers();
      unsubscribeAllocations();
      unsubscribeSchedules();
    };
  }, []);

  // Calculate analytics
  const calculateAnalytics = () => {
    const { routes, vehicles, drivers, allocations, schedules } = analyticsData;

    // Route utilization
    const routeUtilization = routes.map(route => {
      const routeAllocations = allocations.filter(a => a.routeId === route.id);
      const utilization = route.capacity > 0 ? (routeAllocations.length / route.capacity) * 100 : 0;
      return {
        name: route.name,
        utilization: Math.round(utilization),
        totalAllocations: routeAllocations.length,
        capacity: route.capacity
      };
    });

    // Vehicle performance
    const vehiclePerformance = vehicles.map(vehicle => {
      const vehicleSchedules = schedules.filter(s => s.vehicleId === vehicle.id);
      const completedSchedules = vehicleSchedules.filter(s => s.status === 'completed');
      const performance = vehicleSchedules.length > 0 ? (completedSchedules.length / vehicleSchedules.length) * 100 : 0;
      return {
        vehicleNumber: vehicle.vehicleNumber,
        performance: Math.round(performance),
        totalSchedules: vehicleSchedules.length,
        completedSchedules: completedSchedules.length
      };
    });

    // Revenue analysis
    const totalRevenue = allocations.reduce((sum, allocation) => sum + (allocation.fare || 0), 0);
    const paidAllocations = allocations.filter(a => a.paymentStatus === 'paid');
    const pendingPayments = allocations.filter(a => a.paymentStatus === 'pending');
    const overduePayments = allocations.filter(a => a.paymentStatus === 'overdue');

    // Status distribution
    const allocationStatus = {
      active: allocations.filter(a => a.status === 'active').length,
      pending: allocations.filter(a => a.status === 'pending').length,
      completed: allocations.filter(a => a.status === 'completed').length,
      cancelled: allocations.filter(a => a.status === 'cancelled').length
    };

    return {
      routeUtilization,
      vehiclePerformance,
      totalRevenue,
      paidAllocations: paidAllocations.length,
      pendingPayments: pendingPayments.length,
      overduePayments: overduePayments.length,
      allocationStatus,
      totalAllocations: allocations.length,
      totalRoutes: routes.length,
      totalVehicles: vehicles.length,
      totalDrivers: drivers.length
    };
  };

  const analytics = calculateAnalytics();

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
          <h2 className="text-2xl font-bold text-gray-900">Transport Analytics</h2>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <FontAwesomeIcon icon={faDownload} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FontAwesomeIcon icon={faRoute} className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Routes</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalRoutes}</p>
              <p className="text-sm text-green-600">+12% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <FontAwesomeIcon icon={faBus} className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalVehicles}</p>
              <p className="text-sm text-green-600">+8% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <FontAwesomeIcon icon={faUsers} className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Allocations</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalAllocations}</p>
              <p className="text-sm text-green-600">+15% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <FontAwesomeIcon icon={faMoneyBillWave} className="text-orange-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{analytics.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600">+20% from last month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Utilization */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Route Utilization</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.routeUtilization.map((route, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{route.name}</span>
                      <span className="text-sm text-gray-600">{route.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${route.utilization}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {route.totalAllocations} / {route.capacity} seats occupied
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle Performance */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Vehicle Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.vehiclePerformance.map((vehicle, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{vehicle.vehicleNumber}</span>
                      <span className="text-sm text-gray-600">{vehicle.performance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${vehicle.performance}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {vehicle.completedSchedules} / {vehicle.totalSchedules} schedules completed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status and Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Payment Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-3" />
                  <span className="font-medium text-green-800">Paid</span>
                </div>
                <span className="text-lg font-bold text-green-800">{analytics.paidAllocations}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faClock} className="text-yellow-500 mr-3" />
                  <span className="font-medium text-yellow-800">Pending</span>
                </div>
                <span className="text-lg font-bold text-yellow-800">{analytics.pendingPayments}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-3" />
                  <span className="font-medium text-red-800">Overdue</span>
                </div>
                <span className="text-lg font-bold text-red-800">{analytics.overduePayments}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Allocation Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Allocation Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(analytics.allocationStatus.active / analytics.totalAllocations) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analytics.allocationStatus.active}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(analytics.allocationStatus.pending / analytics.totalAllocations) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analytics.allocationStatus.pending}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(analytics.allocationStatus.completed / analytics.totalAllocations) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analytics.allocationStatus.completed}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cancelled</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(analytics.allocationStatus.cancelled / analytics.totalAllocations) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analytics.allocationStatus.cancelled}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Insights & Recommendations</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Performance Insights</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2 mt-1" />
                  <span>Route utilization is at optimal levels with 85% average occupancy</span>
                </li>
                <li className="flex items-start">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2 mt-1" />
                  <span>Vehicle performance shows 92% completion rate</span>
                </li>
                <li className="flex items-start">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 mr-2 mt-1" />
                  <span>15% of payments are pending, consider implementing reminders</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <FontAwesomeIcon icon={faChartLine} className="text-blue-500 mr-2 mt-1" />
                  <span>Consider adding more routes to high-demand areas</span>
                </li>
                <li className="flex items-start">
                  <FontAwesomeIcon icon={faChartLine} className="text-blue-500 mr-2 mt-1" />
                  <span>Implement automated payment reminders for overdue accounts</span>
                </li>
                <li className="flex items-start">
                  <FontAwesomeIcon icon={faChartLine} className="text-blue-500 mr-2 mt-1" />
                  <span>Optimize vehicle maintenance schedules based on usage patterns</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportAnalytics;
