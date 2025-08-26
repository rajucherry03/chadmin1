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
  faList
} from '@fortawesome/free-solid-svg-icons';

// Import all sub-components
import InternshipListings from './InternshipListings';
import StudentApplications from './StudentApplications';
import FacultyApproval from './FacultyApproval';
import CompanyPortal from './CompanyPortal';
import TrackingEvaluation from './TrackingEvaluation';
import CertificatesCredits from './CertificatesCredits';
import CompanyRegistration from './CompanyRegistration';
import JobPostings from './JobPostings';
import StudentProfiles from './StudentProfiles';
import ApplicationSystem from './ApplicationSystem';
import RecruitmentRounds from './RecruitmentRounds';
import OfferLetterManagement from './OfferLetterManagement';
import AdminDashboard from './AdminDashboard';
import ReportsAnalytics from './ReportsAnalytics';
import NotificationsAlerts from './NotificationsAlerts';
import IntegrationTools from './IntegrationTools';

const InternshipPlacementManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('admin'); // admin, student, faculty, company
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalInternships: 0,
    activeApplications: 0,
    placementsThisYear: 0,
    averagePackage: 0,
    pendingApprovals: 0
  });

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: faChartBar,
      roles: ['admin', 'faculty', 'student', 'company']
    },
    {
      id: 'internships',
      label: 'Internships',
      icon: faBriefcase,
      roles: ['admin', 'faculty', 'student', 'company'],
      subTabs: [
        { id: 'listings', label: 'Internship Listings', icon: faList },
        { id: 'applications', label: 'Student Applications', icon: faUserGraduate },
        { id: 'approval', label: 'Faculty Approval', icon: faUserCheck },
        { id: 'company-portal', label: 'Company Portal', icon: faBuilding },
        { id: 'tracking', label: 'Tracking & Evaluation', icon: faChartLine },
        { id: 'certificates', label: 'Certificates & Credits', icon: faCertificate }
      ]
    },
    {
      id: 'placements',
      label: 'Placements',
      icon: faGraduationCap,
      roles: ['admin', 'faculty', 'student', 'company'],
      subTabs: [
        { id: 'company-registration', label: 'Company Registration', icon: faBuilding },
        { id: 'job-postings', label: 'Job Postings', icon: faBriefcase },
        { id: 'student-profiles', label: 'Student Profiles', icon: faUserTie },
        { id: 'applications', label: 'Application System', icon: faFileAlt },
        { id: 'recruitment', label: 'Recruitment Rounds', icon: faUsers },
        { id: 'offers', label: 'Offer Management', icon: faFileContract }
      ]
    },
    {
      id: 'admin',
      label: 'Admin & Analytics',
      icon: faCog,
      roles: ['admin', 'faculty'],
      subTabs: [
        { id: 'reports', label: 'Reports & Analytics', icon: faChartLine },
        { id: 'notifications', label: 'Notifications & Alerts', icon: faBell },
        { id: 'integration', label: 'Integration Tools', icon: faLink }
      ]
    }
  ];

  const renderComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard userRole={userRole} stats={stats} />;
      
      // Internship Components
      case 'internships-listings':
        return <InternshipListings userRole={userRole} />;
      case 'internships-applications':
        return <StudentApplications userRole={userRole} />;
      case 'internships-approval':
        return <FacultyApproval userRole={userRole} />;
      case 'internships-company-portal':
        return <CompanyPortal userRole={userRole} />;
      case 'internships-tracking':
        return <TrackingEvaluation userRole={userRole} />;
      case 'internships-certificates':
        return <CertificatesCredits userRole={userRole} />;
      
      // Placement Components
      case 'placements-company-registration':
        return <CompanyRegistration userRole={userRole} />;
      case 'placements-job-postings':
        return <JobPostings userRole={userRole} />;
      case 'placements-student-profiles':
        return <StudentProfiles userRole={userRole} />;
      case 'placements-applications':
        return <ApplicationSystem userRole={userRole} />;
      case 'placements-recruitment':
        return <RecruitmentRounds userRole={userRole} />;
      case 'placements-offers':
        return <OfferLetterManagement userRole={userRole} />;
      
      // Admin Components
      case 'admin-reports':
        return <ReportsAnalytics userRole={userRole} />;
      case 'admin-notifications':
        return <NotificationsAlerts userRole={userRole} />;
      case 'admin-integration':
        return <IntegrationTools userRole={userRole} />;
      
      default:
        return <AdminDashboard userRole={userRole} stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faBriefcase} className="text-blue-600 text-2xl" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Internship & Placement Management
                </h1>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <FontAwesomeIcon icon={faUserShield} />
                <span className="capitalize">{userRole}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <FontAwesomeIcon icon={faBell} className="text-xl" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Role Selector */}
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                if (!tab.roles.includes(userRole)) return null;
                
                return (
                  <div key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <FontAwesomeIcon icon={tab.icon} className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                    
                    {/* Sub-tabs */}
                    {tab.subTabs && activeTab === tab.id && (
                      <div className="ml-8 mt-2 space-y-1">
                        {tab.subTabs.map((subTab) => {
                          if (!subTab.roles?.includes(userRole)) return null;
                          
                          return (
                            <button
                              key={subTab.id}
                              onClick={() => setActiveTab(`${tab.id}-${subTab.id}`)}
                              className={`w-full flex items-center space-x-3 px-4 py-2 text-left rounded-lg transition-colors text-sm ${
                                activeTab === `${tab.id}-${subTab.id}`
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <FontAwesomeIcon icon={subTab.icon} className="w-4 h-4" />
                              <span>{subTab.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border">
              {renderComponent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipPlacementManagement;
