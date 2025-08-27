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
  const [expandedSection, setExpandedSection] = useState(() => localStorage.getItem('ipm.expandedSection') || 'dashboard');

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
    localStorage.setItem('ipm.expandedSection', expandedSection);
  }, [activeTab, userRole, searchTerm, expandedSection]);

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
      collection(db, 'internship_applications'),
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

  // UI helpers
  const getTabById = (id) => tabs.find(t => t.id === id);
  const getLabelFor = (idOrComposite) => {
    if (!idOrComposite) return '';
    const [rootId, subId] = idOrComposite.split('-');
    const root = getTabById(rootId);
    if (!root) return '';
    if (!subId) return root.label;
    const sub = root.subTabs?.find(s => s.id === subId);
    return sub ? sub.label : root.label;
  };
  const getSubTabsForActive = () => {
    const [rootId] = activeTab.split('-');
    const root = getTabById(rootId);
    return root?.subTabs || [];
  };
  const isInSubSection = () => activeTab.includes('-');

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
      <div className="sticky top-0 z-30 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-3">
            <div className="flex items-center justify-between md:justify-start">
              <div className="flex items-center space-x-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 border border-blue-100">
                  <FontAwesomeIcon icon={faBriefcase} className="text-blue-600 text-lg" />
                </span>
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight">Internship & Placement Management</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Manage internships, placements, companies and applications</p>
                </div>
              </div>
              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden ml-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white/60"
                aria-label="Toggle menu"
              >
                <FontAwesomeIcon icon={faList} className="text-lg" />
              </button>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Search */}
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search internships, companies, students"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 rounded-full border border-blue-100 bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                />
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                />
              </div>

              {/* Refresh */}
              <button
                onClick={() => window.location.reload()}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                title="Refresh data"
              >
                <FontAwesomeIcon icon={faRefresh} className="text-xs" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top navigation (replaces sidebar) */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 md:gap-3">
            {tabs.filter(t => t.roles.includes(userRole)).map((tab) => {
              const isActiveRoot = activeTab.startsWith(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border text-sm ${
                    isActiveRoot ? 'bg-white border-blue-300 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                  title={tab.description}
                >
                  <FontAwesomeIcon icon={tab.icon} className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
          {/* Sub-tabs for the active section */}
          {getSubTabsForActive().length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {getSubTabsForActive().map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(`${activeTab.split('-')[0]}-${s.id}`)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    activeTab === `${activeTab.split('-')[0]}-${s.id}`
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                  }`}
                  title={s.description}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 md:p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}
          {/* Helpful empty-state guidance */}
          {activeTab === 'internships-listings' && internships.length === 0 && (
            <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-blue-800">
              <div className="font-medium mb-1">No internships yet</div>
              <p className="text-sm">Use the Add Internship button to create your first listing. You can link a company, set deadline and required skills.</p>
            </div>
          )}
          {activeTab === 'internships-applications' && applications.length === 0 && (
            <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 p-4 text-amber-800">
              <div className="font-medium mb-1">No applications found</div>
              <p className="text-sm">Once students apply to internships, they will appear here for review and status updates.</p>
            </div>
          )}
          {activeTab === 'placements-company-registration' && companies.length === 0 && (
            <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-emerald-800">
              <div className="font-medium mb-1">No companies registered</div>
              <p className="text-sm">Add a company to start posting internships and jobs. Include a contact person and basic details.</p>
            </div>
          )}
          {renderComponent()}
        </div>
      </div>
    </div>
  );
};

export default InternshipPlacementManagement;
