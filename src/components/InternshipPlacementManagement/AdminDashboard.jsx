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
  faList, faTrendingUp, faTrendingDown, faPercent, faDollarSign,
  faCalendar, faUserFriends, faIndustryAlt, faGraduationCapAlt, faQuestion
} from '@fortawesome/free-solid-svg-icons';
import internshipPlacementService from './services/internshipPlacementService';

const AdminDashboard = ({ 
  userRole, 
  internships, 
  applications, 
  companies, 
  students, 
  faculty, 
  notifications, 
  stats, 
  loading, 
  error,
  searchTerm,
  onRefresh 
}) => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [departmentStats, setDepartmentStats] = useState({});
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  // Calculate recent activity
  useEffect(() => {
    const activities = [];
    
    // Recent applications
    const recentApplications = applications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    recentApplications.forEach(app => {
      activities.push({
        type: 'application',
        title: `New application from ${app.studentName || 'Student'}`,
        description: `Applied for ${app.internshipTitle || 'internship'}`,
        timestamp: app.createdAt,
        status: app.status,
        icon: faFileAlt
      });
    });

    // Recent internships
    const recentInternships = internships
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
    
    recentInternships.forEach(internship => {
      activities.push({
        type: 'internship',
        title: `New internship posted`,
        description: `${internship.title} at ${internship.companyName}`,
        timestamp: internship.createdAt,
        status: internship.status,
        icon: faBriefcase
      });
    });

    setRecentActivity(activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8));
  }, [applications, internships]);

  // Calculate top companies
  useEffect(() => {
    const companyStats = {};
    
    applications.forEach(app => {
      if (app.companyName) {
        if (!companyStats[app.companyName]) {
          companyStats[app.companyName] = {
            name: app.companyName,
            applications: 0,
            placements: 0,
            avgPackage: 0,
            packages: []
          };
        }
        companyStats[app.companyName].applications++;
        if (app.status === 'placed') {
          companyStats[app.companyName].placements++;
          if (app.package) {
            companyStats[app.companyName].packages.push(app.package);
          }
        }
      }
    });

    // Calculate average packages
    Object.values(companyStats).forEach(company => {
      if (company.packages.length > 0) {
        company.avgPackage = Math.round(
          company.packages.reduce((sum, pkg) => sum + pkg, 0) / company.packages.length
        );
      }
    });

    setTopCompanies(
      Object.values(companyStats)
        .sort((a, b) => b.placements - a.placements)
        .slice(0, 5)
    );
  }, [applications]);

  // Calculate department statistics
  useEffect(() => {
    const deptStats = {};
    
    students.forEach(student => {
      if (student.department) {
        if (!deptStats[student.department]) {
          deptStats[student.department] = {
            totalStudents: 0,
            placedStudents: 0,
            applications: 0
          };
        }
        deptStats[student.department].totalStudents++;
      }
    });

    applications.forEach(app => {
      if (app.department) {
        if (!deptStats[app.department]) {
          deptStats[app.department] = {
            totalStudents: 0,
            placedStudents: 0,
            applications: 0
          };
        }
        deptStats[app.department].applications++;
        if (app.status === 'placed') {
          deptStats[app.department].placedStudents++;
        }
      }
    });

    setDepartmentStats(deptStats);
  }, [students, applications]);

  // Calculate monthly trends
  useEffect(() => {
    const trends = [];
    const currentYear = new Date().getFullYear();
    
    for (let month = 0; month < 12; month++) {
      const monthApplications = applications.filter(app => {
        const appDate = new Date(app.createdAt);
        return appDate.getFullYear() === currentYear && appDate.getMonth() === month;
      });
      
      const monthPlacements = applications.filter(app => {
        const placementDate = new Date(app.placementDate);
        return app.status === 'placed' && 
               placementDate.getFullYear() === currentYear && 
               placementDate.getMonth() === month;
      });

      trends.push({
        month: new Date(currentYear, month).toLocaleDateString('en-US', { month: 'short' }),
        applications: monthApplications.length,
        placements: monthPlacements.length
      });
    }

    setMonthlyTrends(trends);
  }, [applications]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed':
      case 'active':
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'under_review':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
      case 'inactive':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'placed':
      case 'active':
      case 'approved':
        return faCheckCircle;
      case 'pending':
      case 'under_review':
        return faClock;
      case 'rejected':
      case 'inactive':
        return faTimesCircle;
      default:
        return faQuestion;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with internships and placements.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FontAwesomeIcon icon={faRefresh} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Internships</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInternships}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FontAwesomeIcon icon={faBriefcase} className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <FontAwesomeIcon icon={faTrendingUp} className="text-green-500 mr-1" />
            <span className="text-green-600">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeApplications}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FontAwesomeIcon icon={faFileAlt} className="text-yellow-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <FontAwesomeIcon icon={faTrendingUp} className="text-green-500 mr-1" />
            <span className="text-green-600">+8% from last week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Placements This Year</p>
              <p className="text-2xl font-bold text-gray-900">{stats.placementsThisYear}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FontAwesomeIcon icon={faGraduationCap} className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <FontAwesomeIcon icon={faTrendingUp} className="text-green-500 mr-1" />
            <span className="text-green-600">+15% from last year</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FontAwesomeIcon icon={faPercent} className="text-purple-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <FontAwesomeIcon icon={faTrendingUp} className="text-green-500 mr-1" />
            <span className="text-green-600">+5% improvement</span>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Average Package</h3>
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{stats.averagePackage.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-2">Per annum</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Companies</h3>
            <FontAwesomeIcon icon={faBuilding} className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCompanies}</p>
          <p className="text-sm text-gray-600 mt-2">Registered companies</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
            <FontAwesomeIcon icon={faClock} className="text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}</p>
          <p className="text-sm text-gray-600 mt-2">Require attention</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-600">Latest updates and activities</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={activity.icon} className="text-blue-600 text-sm" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(activity.status)} className="mr-1" />
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faInbox} className="text-gray-400 text-3xl mb-2" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Top Companies</h3>
            <p className="text-sm text-gray-600">By placement success</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topCompanies.length > 0 ? (
                topCompanies.map((company, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{company.name}</p>
                        <p className="text-xs text-gray-600">{company.placements} placements</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{company.avgPackage.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">avg package</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faBuilding} className="text-gray-400 text-3xl mb-2" />
                  <p className="text-gray-500">No company data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Department Statistics */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Department Statistics</h3>
          <p className="text-sm text-gray-600">Placement performance by department</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(departmentStats).map(([dept, stats]) => (
              <div key={dept} className="text-center">
                <h4 className="text-sm font-medium text-gray-900 mb-2">{dept}</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
                    <p className="text-xs text-gray-600">Total Students</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-600">{stats.placedStudents}</p>
                    <p className="text-xs text-gray-600">Placed</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {stats.totalStudents > 0 ? Math.round((stats.placedStudents / stats.totalStudents) * 100) : 0}%
                    </p>
                    <p className="text-xs text-gray-600">Success Rate</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
          <p className="text-sm text-gray-600">Applications and placements over time</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-12 gap-4 items-end h-64">
            {monthlyTrends.map((trend, index) => (
              <div key={index} className="col-span-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center space-y-2">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${Math.max((trend.applications / Math.max(...monthlyTrends.map(t => t.applications))) * 100, 5)}%` }}
                  ></div>
                  <div 
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${Math.max((trend.placements / Math.max(...monthlyTrends.map(t => t.placements))) * 100, 5)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">{trend.month}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Applications</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Placements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
