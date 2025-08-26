import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase, faGraduationCap, faBuilding, faUsers, faChartLine,
  faCalendarAlt, faFileAlt, faEnvelope, faBell, faCog, faSearch,
  faFilter, faDownload, faUpload, faCheckCircle, faTimesCircle,
  faExclamationTriangle, faUserTie, faHandshake, faCertificate,
  faMoneyBillWave, faMapMarkerAlt, faClock, faLaptop, faUserGraduate,
  faIndustry, faChartBar, faTrophy, faStar, faEye, faEdit, faTrash,
  faPlus, faArrowRight, faArrowLeft, faRefresh, faPrint, faShare,
  faLink, faArrowUpRightFromSquare, faClipboardList, faTasks, faComments,
  faPhone, faVideo, faCalendarCheck, faFileContract, faSignature,
  faQrcode, faBarcode, faIdCard, faUserCheck, faUserTimes, faThumbsUp,
  faThumbsDown, faHourglassHalf, faCheckDouble, faBan, faLock,
  faUnlock, faShieldAlt, faUserShield, faDatabase, faCloudUpload,
  faCloudDownload, faSync, faHistory, faArchive, faInbox, faSignOutAlt,
  faArrowUp, faArrowDown, faEquals, faPercent, faRupeeSign
} from '@fortawesome/free-solid-svg-icons';
import internshipPlacementService from './services/internshipPlacementService';

const AdminDashboard = ({ userRole, stats }) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalInternships: 0,
    activeApplications: 0,
    placementsThisYear: 0,
    averagePackage: 0,
    pendingApprovals: 0,
    totalCompanies: 0,
    totalStudents: 0,
    placementPercentage: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const statsData = await loadStatistics();
      setDashboardStats(statsData);
      
      // Load recent activities
      const activities = await loadRecentActivities();
      setRecentActivities(activities);
      
      // Load top companies
      const companies = await loadTopCompanies();
      setTopCompanies(companies);
      
      // Load department statistics
      const deptStats = await loadDepartmentStats();
      setDepartmentStats(deptStats);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    // This would fetch real data from Firebase
    // For now, returning mock data
    return {
      totalInternships: 45,
      activeApplications: 128,
      placementsThisYear: 89,
      averagePackage: 650000,
      pendingApprovals: 23,
      totalCompanies: 67,
      totalStudents: 1250,
      placementPercentage: 71.2
    };
  };

  const loadRecentActivities = async () => {
    // This would fetch real data from Firebase
    return [
      {
        id: 1,
        type: 'internship_application',
        title: 'New internship application submitted',
        description: 'John Doe applied for Software Developer Intern at Google',
        timestamp: new Date(),
        status: 'pending'
      },
      {
        id: 2,
        type: 'placement_offer',
        title: 'New placement offer received',
        description: 'Microsoft offered ₹12 LPA to Sarah Smith',
        timestamp: new Date(Date.now() - 3600000),
        status: 'accepted'
      },
      {
        id: 3,
        type: 'company_registration',
        title: 'New company registered',
        description: 'Amazon registered for campus recruitment',
        timestamp: new Date(Date.now() - 7200000),
        status: 'verified'
      },
      {
        id: 4,
        type: 'certificate_uploaded',
        title: 'Internship certificate uploaded',
        description: 'Certificate uploaded for CSE_DS_IV_A_001',
        timestamp: new Date(Date.now() - 10800000),
        status: 'completed'
      }
    ];
  };

  const loadTopCompanies = async () => {
    // This would fetch real data from Firebase
    return [
      {
        id: 1,
        name: 'Google',
        logo: 'https://via.placeholder.com/50',
        placements: 15,
        averagePackage: 1800000,
        internships: 8
      },
      {
        id: 2,
        name: 'Microsoft',
        logo: 'https://via.placeholder.com/50',
        placements: 12,
        averagePackage: 1600000,
        internships: 6
      },
      {
        id: 3,
        name: 'Amazon',
        logo: 'https://via.placeholder.com/50',
        placements: 10,
        averagePackage: 1400000,
        internships: 5
      },
      {
        id: 4,
        name: 'TCS',
        logo: 'https://via.placeholder.com/50',
        placements: 8,
        averagePackage: 800000,
        internships: 12
      }
    ];
  };

  const loadDepartmentStats = async () => {
    // This would fetch real data from Firebase
    return [
      {
        department: 'Computer Science',
        totalStudents: 180,
        placed: 145,
        percentage: 80.6,
        averagePackage: 850000
      },
      {
        department: 'Electronics',
        totalStudents: 150,
        placed: 108,
        percentage: 72.0,
        averagePackage: 720000
      },
      {
        department: 'Mechanical',
        totalStudents: 120,
        placed: 78,
        percentage: 65.0,
        averagePackage: 680000
      },
      {
        department: 'Civil',
        totalStudents: 100,
        placed: 62,
        percentage: 62.0,
        averagePackage: 650000
      }
    ];
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'internship_application':
        return faBriefcase;
      case 'placement_offer':
        return faGraduationCap;
      case 'company_registration':
        return faBuilding;
      case 'certificate_uploaded':
        return faCertificate;
      default:
        return faBell;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'internship_application':
        return 'text-blue-600';
      case 'placement_offer':
        return 'text-green-600';
      case 'company_registration':
        return 'text-purple-600';
      case 'certificate_uploaded':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'verified':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Internship & Placement Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with internships and placements.
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FontAwesomeIcon icon={faRefresh} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Internships */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Internships</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalInternships}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <FontAwesomeIcon icon={faArrowUp} className="mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FontAwesomeIcon icon={faBriefcase} className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Active Applications */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Applications</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeApplications}</p>
              <p className="text-xs text-blue-600 flex items-center mt-1">
                <FontAwesomeIcon icon={faClock} className="mr-1" />
                {dashboardStats.pendingApprovals} pending approval
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FontAwesomeIcon icon={faFileAlt} className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Placements This Year */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Placements This Year</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.placementsThisYear}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <FontAwesomeIcon icon={faPercent} className="mr-1" />
                {dashboardStats.placementPercentage}% placement rate
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FontAwesomeIcon icon={faGraduationCap} className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Average Package */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Package</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardStats.averagePackage)}
              </p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <FontAwesomeIcon icon={faArrowUp} className="mr-1" />
                +8% from last year
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FontAwesomeIcon icon={faMoneyBillWave} className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)} bg-opacity-10`}>
                    <FontAwesomeIcon icon={getActivityIcon(activity.type)} className="text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {activity.timestamp.toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View all activities →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <FontAwesomeIcon icon={faPlus} className="text-blue-600" />
                <span className="text-sm font-medium">Add Internship</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <FontAwesomeIcon icon={faBuilding} className="text-green-600" />
                <span className="text-sm font-medium">Register Company</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <FontAwesomeIcon icon={faUserCheck} className="text-purple-600" />
                <span className="text-sm font-medium">Review Applications</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <FontAwesomeIcon icon={faChartBar} className="text-orange-600" />
                <span className="text-sm font-medium">Generate Reports</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <FontAwesomeIcon icon={faBell} className="text-red-600" />
                <span className="text-sm font-medium">Send Notifications</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Top Companies */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Top Recruiting Companies</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topCompanies.map((company) => (
                <div key={company.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{company.name}</p>
                      <p className="text-xs text-gray-600">
                        {company.placements} placements • {company.internships} internships
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(company.averagePackage)}
                    </p>
                    <p className="text-xs text-gray-600">avg package</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Statistics */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Department-wise Statistics</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {departmentStats.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{dept.department}</span>
                    <span className="text-sm text-gray-600">
                      {dept.placed}/{dept.totalStudents} ({dept.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${dept.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Avg: {formatCurrency(dept.averagePackage)}</span>
                    <span>{dept.percentage}% placed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
