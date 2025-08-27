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
  faList, faChevronDown, faChevronUp, faTimes, faBolt, faPalette
} from '@fortawesome/free-solid-svg-icons';
import { db } from '../../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  collectionGroup
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Import sub-components
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
  const auth = getAuth();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('ipm.activeTab') || 'dashboard');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('ipm.userRole') || 'admin');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('ipm.searchTerm') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(() => localStorage.getItem('ipm.searchTerm') || '');

  // Data states
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalInternships: 0,
    activeApplications: 0,
    placementsThisYear: 0,
    averagePackage: 0,
    pendingApprovals: 0,
    totalCompanies: 0,
    totalStudents: 0,
    successRate: 0
  });

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('ipm.activeTab', activeTab);
    localStorage.setItem('ipm.userRole', userRole);
    localStorage.setItem('ipm.searchTerm', searchTerm);
  }, [activeTab, userRole, searchTerm]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data from Firebase
  useEffect(() => {
    const unsubscribeInternships = onSnapshot(
      collection(db, 'internships'),
      (snapshot) => {
        const internshipsData = [];
        snapshot.forEach((doc) => {
          internshipsData.push({ id: doc.id, ...doc.data() });
        });
        setInternships(internshipsData);
      },
      (err) => {
        console.error('Error fetching internships:', err);
        setError('Failed to load internships');
      }
    );

    const unsubscribeApplications = onSnapshot(
      collection(db, 'applications'),
      (snapshot) => {
        const applicationsData = [];
        snapshot.forEach((doc) => {
          applicationsData.push({ id: doc.id, ...doc.data() });
        });
        setApplications(applicationsData);
      },
      (err) => {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications');
      }
    );

    const unsubscribeCompanies = onSnapshot(
      collection(db, 'companies'),
      (snapshot) => {
        const companiesData = [];
        snapshot.forEach((doc) => {
          companiesData.push({ id: doc.id, ...doc.data() });
        });
        setCompanies(companiesData);
      },
      (err) => {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies');
      }
    );

    const unsubscribeStudents = onSnapshot(
      collectionGroup(db, 'students'),
      (snapshot) => {
        const studentsData = [];
        snapshot.forEach((doc) => {
          studentsData.push({ id: doc.id, ...doc.data() });
        });
        setStudents(studentsData);
      },
      (err) => {
        console.error('Error fetching students:', err);
        setError('Failed to load students');
      }
    );

    const unsubscribeFaculty = onSnapshot(
      collection(db, 'faculty'),
      (snapshot) => {
        const facultyData = [];
        snapshot.forEach((doc) => {
          facultyData.push({ id: doc.id, ...doc.data() });
        });
        setFaculty(facultyData);
      },
      (err) => {
        console.error('Error fetching faculty:', err);
        setError('Failed to load faculty');
      }
    );

    const unsubscribeNotifications = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        const notificationsData = [];
        snapshot.forEach((doc) => {
          notificationsData.push({ id: doc.id, ...doc.data() });
        });
        setNotifications(notificationsData);
      },
      (err) => {
        console.error('Error fetching notifications:', err);
      }
    );

    setLoading(false);

    return () => {
      unsubscribeInternships();
      unsubscribeApplications();
      unsubscribeCompanies();
      unsubscribeStudents();
      unsubscribeFaculty();
      unsubscribeNotifications();
    };
  }, []);

  // Calculate statistics
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const activeInternships = internships.filter(internship => 
      internship.status === 'active' && 
      new Date(internship.deadline) > new Date()
    );
    
    const activeApplications = applications.filter(app => 
      app.status === 'pending' || app.status === 'under_review'
    );
    
    const placementsThisYear = applications.filter(app => 
      app.status === 'placed' && 
      app.placementDate && 
      new Date(app.placementDate).getFullYear() === currentYear
    );
    
    const placedApplications = applications.filter(app => app.status === 'placed');
    const averagePackage = placedApplications.length > 0 
      ? placedApplications.reduce((sum, app) => sum + (app.package || 0), 0) / placedApplications.length 
      : 0;
    
    const pendingApprovals = applications.filter(app => 
      app.status === 'pending_approval'
    ).length;

    const successRate = applications.length > 0 
      ? (placedApplications.length / applications.length) * 100 
      : 0;

    setStats({
      totalInternships: internships.length,
      activeApplications: activeApplications.length,
      placementsThisYear: placementsThisYear.length,
      averagePackage: Math.round(averagePackage),
      pendingApprovals,
      totalCompanies: companies.length,
      totalStudents: students.length,
      successRate: Math.round(successRate)
    });
  }, [internships, applications, companies, students]);

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: faChartBar,
      roles: ['admin', 'faculty', 'student', 'company'],
      description: 'Overview and key metrics'
    },
    {
      id: 'internships',
      label: 'Internships',
      icon: faBriefcase,
      roles: ['admin', 'faculty', 'student', 'company'],
      description: 'Manage internship opportunities',
      subTabs: [
        { id: 'listings', label: 'Internship Listings', icon: faList, description: 'Browse and manage internship postings' },
        { id: 'applications', label: 'Student Applications', icon: faUserGraduate, description: 'Track student applications' },
        { id: 'approval', label: 'Faculty Approval', icon: faUserCheck, description: 'Approve internship applications' },
        { id: 'company-portal', label: 'Company Portal', icon: faBuilding, description: 'Company management interface' },
        { id: 'tracking', label: 'Tracking & Evaluation', icon: faChartLine, description: 'Monitor internship progress' },
        { id: 'certificates', label: 'Certificates & Credits', icon: faCertificate, description: 'Manage certificates and credits' }
      ]
    },
    {
      id: 'placements',
      label: 'Placements',
      icon: faGraduationCap,
      roles: ['admin', 'faculty', 'student', 'company'],
      description: 'Manage placement opportunities',
      subTabs: [
        { id: 'company-registration', label: 'Company Registration', icon: faBuilding, description: 'Register new companies' },
        { id: 'job-postings', label: 'Job Postings', icon: faBriefcase, description: 'Manage job opportunities' },
        { id: 'student-profiles', label: 'Student Profiles', icon: faUserTie, description: 'Student profile management' },
        { id: 'applications', label: 'Application System', icon: faFileAlt, description: 'Job application management' },
        { id: 'recruitment', label: 'Recruitment Rounds', icon: faUsers, description: 'Manage recruitment process' },
        { id: 'offers', label: 'Offer Management', icon: faFileContract, description: 'Manage offer letters' }
      ]
    },
    {
      id: 'admin',
      label: 'Admin & Analytics',
      icon: faCog,
      roles: ['admin', 'faculty'],
      description: 'Administrative tools and analytics',
      subTabs: [
        { id: 'reports', label: 'Reports & Analytics', icon: faChartLine, description: 'Generate reports and analytics' },
        { id: 'notifications', label: 'Notifications & Alerts', icon: faBell, description: 'Manage notifications' },
        { id: 'integration', label: 'Integration Tools', icon: faLink, description: 'External integrations' }
      ]
    }
  ];

  const renderComponent = () => {
    const commonProps = {
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
      searchTerm: debouncedSearch,
      onRefresh: () => window.location.reload()
    };

    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard {...commonProps} />;
      
      // Internship Components
      case 'internships-listings':
        return <InternshipListings {...commonProps} />;
      case 'internships-applications':
        return <StudentApplications {...commonProps} />;
      case 'internships-approval':
        return <FacultyApproval {...commonProps} />;
      case 'internships-company-portal':
        return <CompanyPortal {...commonProps} />;
      case 'internships-tracking':
        return <TrackingEvaluation {...commonProps} />;
      case 'internships-certificates':
        return <CertificatesCredits {...commonProps} />;
      
      // Placement Components
      case 'placements-company-registration':
        return <CompanyRegistration {...commonProps} />;
      case 'placements-job-postings':
        return <JobPostings {...commonProps} />;
      case 'placements-student-profiles':
        return <StudentProfiles {...commonProps} />;
      case 'placements-applications':
        return <ApplicationSystem {...commonProps} />;
      case 'placements-recruitment':
        return <RecruitmentRounds {...commonProps} />;
      case 'placements-offers':
        return <OfferLetterManagement {...commonProps} />;
      
      // Admin Components
      case 'admin-reports':
        return <ReportsAnalytics {...commonProps} />;
      case 'admin-notifications':
        return <NotificationsAlerts {...commonProps} />;
      case 'admin-integration':
        return <IntegrationTools {...commonProps} />;
      
      default:
        return <AdminDashboard {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Internship & Placement Management...</p>
        </div>
      </div>
    );
  }

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
              {/* Search */}
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <FontAwesomeIcon icon={faBell} className="text-xl" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
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

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faList} className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-6">
          {/* Sidebar Navigation */}
          <div className={`${showMobileMenu ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                if (!tab.roles.includes(userRole)) return null;
                
                return (
                  <div key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={tab.icon} className="w-5 h-5" />
                        <div>
                          <span className="font-medium">{tab.label}</span>
                          <p className="text-xs text-gray-500">{tab.description}</p>
                        </div>
                      </div>
                      {tab.subTabs && (
                        <FontAwesomeIcon 
                          icon={activeTab === tab.id ? faChevronUp : faChevronDown} 
                          className="w-4 h-4" 
                        />
                      )}
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
                              <div>
                                <span>{subTab.label}</span>
                                <p className="text-xs text-gray-400">{subTab.description}</p>
                              </div>
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
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}
              {renderComponent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipPlacementManagement;
