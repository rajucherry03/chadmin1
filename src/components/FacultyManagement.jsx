import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faGraduationCap,
  faChalkboardTeacher,
  faChartLine,
  faCalendarAlt,
  faMoneyBillWave,
  faFlask,
  faShieldAlt,
  faComments,
  faChartBar,
  faPlus,
  faSearch,
  faFilter,
  faDownload,
  faUpload,
  faEdit,
  faTrash,
  faEye,
  faCheckCircle,
  faExclamationTriangle,
  faClock,
  faUsers,
  faBook,
  faAward,
  faFileAlt,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faIdCard,
  faUniversity,
  faCalculator,
  faFileInvoice,
  faBell,
  faCog,
  faHandshake,
  faUserShield,
  faHistory,
  faSync,
  faPrint,
  faShare,
  faLink,
  faUnlink,
  faUserPlus,
  faUserEdit,
  faUserMinus,
  faUserCheck,
  faUserTimes,
  faUserClock,
  faUserGraduate,
  faUserCog,
  faUserSecret,
  faUserTag,
  faUserLock,
  faUnlock,
  faUserSlash,
  faBars,
  faTimes,
  faHome,
  faDashboard,
  faCalendar,
  faTasks,
  faFileText,
  faCog as faSettings,
  faSignOutAlt,
  faBell as faNotification,
  faUser,
  faChevronDown,
  faChevronRight,
  faStar,
  faMedal,
  faTrophy,
  faCertificate,
  faBookOpen,
  faLaptop,
  faMicroscope,
  faLightbulb,
  faRocket,
  faBullseye,
  faArrowUp,
  faChartPie,
  faTable,
  faListUl,
  faThLarge,
  faSort,
  faSortUp,
  faSortDown,
  faEllipsis,
  faCheck,
  faTimes as faClose,
  faSave,
  faUndo,
  faRedo,
  faCopy,
  faPaste,
  faCut,
  faBold,
  faItalic,
  faUnderline,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faList,
  faListOl,
  faQuoteLeft,
  faCode,
  faLink as faChain,
  faImage,
  faVideo,
  faMusic,
  faFile,
  faFolder,
  faFolderOpen,
  faCloud,
  faCloudUpload,
  faCloudDownload,
  faRotate,
  faSpinner,
  faCircle,
  faSquare,
  faHeart,
  faThumbsUp,
  faThumbsDown,
  faSmile,
  faFrown,
  faMeh,
  faGrin,
  faLaugh,
  faAngry,
  faSurprise,
  faTired,
  faDizzy,
  faDizzy as faDizzy2,
  faGrinBeam,
  faGrinHearts,
  faGrinStars,
  faGrinTears,
  faGrinTongue,
  faGrinTongueWink,
  faGrinWink,
  faKiss,
  faKissWinkHeart,
  faLaughSquint,
  faLaughWink,
  faSadCry,
  faSadTear,
  faSmileBeam,
  faSmileWink,
  faTired as faTired2,
  faAngry as faAngry2,
  faSurprise as faSurprise2,
  faDizzy as faDizzy3,
  faGrinBeam as faGrinBeam2,
  faGrinHearts as faGrinHearts2,
  faGrinStars as faGrinStars2,
  faGrinTears as faGrinTears2,
  faGrinTongue as faGrinTongue2,
  faGrinTongueWink as faGrinTongueWink2,
  faGrinWink as faGrinWink2,
  faKiss as faKiss2,
  faKissWinkHeart as faKissWinkHeart2,
  faLaughSquint as faLaughSquint2,
  faLaughWink as faLaughWink2,
  faSadCry as faSadCry2,
  faSadTear as faSadTear2,
  faSmileBeam as faSmileBeam2,
  faSmileWink as faSmileWink2
} from "@fortawesome/free-solid-svg-icons";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";

// Import sub-components
import FacultyProfileManagement from "./FacultyManagement/FacultyProfileManagement";
import FacultyRecruitment from "./FacultyManagement/FacultyRecruitment";
import TeachingManagement from "./FacultyManagement/TeachingManagement";
import PerformanceAppraisal from "./FacultyManagement/PerformanceAppraisal";
import LeaveAttendance from "./FacultyManagement/LeaveAttendance";
import PayrollFinance from "./FacultyManagement/PayrollFinance";
import ResearchDevelopment from "./FacultyManagement/ResearchDevelopment";
import ComplianceAccreditation from "./FacultyManagement/ComplianceAccreditation";
import CommunicationCollaboration from "./FacultyManagement/CommunicationCollaboration";
import ReportsAnalytics from "./FacultyManagement/ReportsAnalytics";

const FacultyManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [facultyStats, setFacultyStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    probation: 0,
    departments: {},
    designations: {},
    recentHires: 0,
    upcomingRetirements: 0,
    averageExperience: 0,
    researchPublications: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Enhanced tabs with better organization
  const tabs = [
    { 
      id: "dashboard", 
      name: "Dashboard", 
      icon: faDashboard, 
      color: "blue",
      description: "Overview and key metrics",
      badge: null
    },
    { 
      id: "profile", 
      name: "Profile Management", 
      icon: faUserTie, 
      color: "indigo",
      description: "Manage faculty profiles and personal information",
      badge: null
    },
    { 
      id: "recruitment", 
      name: "Recruitment", 
      icon: faUserPlus, 
      color: "green",
      description: "Hire and onboard new faculty members",
      badge: "New"
    },
    { 
      id: "teaching", 
      name: "Teaching & Academic", 
      icon: faChalkboardTeacher, 
      color: "purple",
      description: "Manage courses, schedules, and academic activities",
      badge: null
    },
    { 
      id: "performance", 
      name: "Performance", 
      icon: faChartLine, 
      color: "orange",
      description: "Track and evaluate faculty performance",
      badge: null
    },
    { 
      id: "leave", 
      name: "Leave & Attendance", 
      icon: faCalendarAlt, 
      color: "red",
      description: "Manage leave requests and attendance tracking",
      badge: "5"
    },
    { 
      id: "payroll", 
      name: "Payroll & Finance", 
      icon: faMoneyBillWave, 
      color: "emerald",
      description: "Handle salary, benefits, and financial records",
      badge: null
    },
    { 
      id: "research", 
      name: "Research & Development", 
      icon: faFlask, 
      color: "cyan",
      description: "Track research activities and publications",
      badge: "12"
    },
    { 
      id: "compliance", 
      name: "Compliance", 
      icon: faShieldAlt, 
      color: "yellow",
      description: "Ensure regulatory compliance and accreditation",
      badge: null
    },
    { 
      id: "communication", 
      name: "Communication", 
      icon: faComments, 
      color: "pink",
      description: "Facilitate communication and collaboration",
      badge: "3"
    },
    { 
      id: "reports", 
      name: "Reports & Analytics", 
      icon: faChartBar, 
      color: "teal",
      description: "Generate reports and analyze data",
      badge: null
    }
  ];

  // Fetch faculty statistics with enhanced data
  useEffect(() => {
    const unsubscribeFaculty = onSnapshot(
      collection(db, "faculty"),
      (snapshot) => {
        const facultyData = [];
        const departments = {};
        const designations = {};
        let active = 0;
        let onLeave = 0;
        let probation = 0;
        let totalExperience = 0;
        let researchCount = 0;
        let recentHires = 0;
        let upcomingRetirements = 0;

        const currentDate = new Date();
        const sixMonthsAgo = new Date(currentDate.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));

        snapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          facultyData.push(data);
          
          // Count by status
          if (data.employmentDetails?.status === "Active") active++;
          else if (data.employmentDetails?.status === "On Leave") onLeave++;
          else if (data.employmentDetails?.status === "Probation") probation++;

          // Count by department
          if (data.employmentDetails?.department) {
            departments[data.employmentDetails.department] = (departments[data.employmentDetails.department] || 0) + 1;
          }

          // Count by designation
          if (data.employmentDetails?.designation) {
            designations[data.employmentDetails.designation] = (designations[data.employmentDetails.designation] || 0) + 1;
          }

          // Calculate experience
          if (data.experienceRecord?.totalExperience) {
            totalExperience += data.experienceRecord.totalExperience;
          }

          // Count research publications
          if (data.researchPublications) {
            researchCount += data.researchPublications.length || 0;
          }

          // Recent hires (last 6 months)
          if (data.employmentDetails?.joiningDate) {
            const joiningDate = new Date(data.employmentDetails.joiningDate);
            if (joiningDate > sixMonthsAgo) {
              recentHires++;
            }
          }

          // Upcoming retirements (next 2 years)
          if (data.personalDetails?.dateOfBirth) {
            const birthDate = new Date(data.personalDetails.dateOfBirth);
            const age = currentDate.getFullYear() - birthDate.getFullYear();
            if (age >= 58 && age <= 60) {
              upcomingRetirements++;
            }
          }
        });

        setFacultyStats({
          total: facultyData.length,
          active,
          onLeave,
          probation,
          departments,
          designations,
          recentHires,
          upcomingRetirements,
          averageExperience: facultyData.length > 0 ? Math.round(totalExperience / facultyData.length) : 0,
          researchPublications: researchCount
        });
        setLoading(false);
      }
    );

    return () => unsubscribeFaculty();
  }, []);

  // Fetch recent activities
  useEffect(() => {
    const unsubscribeActivities = onSnapshot(
      query(collection(db, "facultyActivities"), orderBy("timestamp", "desc"), limit(10)),
      (snapshot) => {
        const activities = [];
        snapshot.forEach((doc) => {
          activities.push({ id: doc.id, ...doc.data() });
        });
        setRecentActivities(activities);
      }
    );

    return () => unsubscribeActivities();
  }, []);

  // Mock notifications - in real app, fetch from Firebase
  useEffect(() => {
    setNotifications([
      { id: 1, type: 'info', message: 'New faculty application received', time: '2 hours ago' },
      { id: 2, type: 'warning', message: '3 faculty members on leave today', time: '4 hours ago' },
      { id: 3, type: 'success', message: 'Performance review completed', time: '1 day ago' },
      { id: 4, type: 'info', message: 'Monthly payroll processed', time: '2 days ago' }
    ]);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <FacultyDashboard stats={facultyStats} activities={recentActivities} notifications={notifications} />;
      case "profile":
        return <FacultyProfileManagement />;
      case "recruitment":
        return <FacultyRecruitment />;
      case "teaching":
        return <TeachingManagement />;
      case "performance":
        return <PerformanceAppraisal />;
      case "leave":
        return <LeaveAttendance />;
      case "payroll":
        return <PayrollFinance />;
      case "research":
        return <ResearchDevelopment />;
      case "compliance":
        return <ComplianceAccreditation />;
      case "communication":
        return <CommunicationCollaboration />;
      case "reports":
        return <ReportsAnalytics />;
      default:
        return <FacultyDashboard stats={facultyStats} activities={recentActivities} notifications={notifications} />;
    }
  };

  const getActiveTab = () => tabs.find(tab => tab.id === activeTab);

  // Dashboard Component
  const FacultyDashboard = ({ stats, activities, notifications }) => {
    const quickActions = [
      { id: 1, name: 'Add Faculty', icon: faUserPlus, color: 'blue', action: () => setActiveTab('recruitment') },
      { id: 2, name: 'Process Payroll', icon: faMoneyBillWave, color: 'green', action: () => setActiveTab('payroll') },
      { id: 3, name: 'View Reports', icon: faChartBar, color: 'purple', action: () => setActiveTab('reports') },
      { id: 4, name: 'Leave Requests', icon: faCalendarAlt, color: 'orange', action: () => setActiveTab('leave') }
    ];

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome to Faculty Management</h1>
              <p className="text-blue-100">Manage your academic workforce efficiently</p>
            </div>
            <div className="hidden md:block">
              <FontAwesomeIcon icon={faUsers} className="text-6xl text-blue-200" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
            >
              <div className={`w-12 h-12 rounded-lg bg-${action.color}-100 text-${action.color}-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <FontAwesomeIcon icon={action.icon} className="text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{action.name}</h3>
            </button>
          ))}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <FontAwesomeIcon icon={faUsers} className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Faculty</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                <FontAwesomeIcon icon={faCheckCircle} className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                <FontAwesomeIcon icon={faClock} className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-gray-900">{stats.onLeave}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <FontAwesomeIcon icon={faUserClock} className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Probation</p>
                <p className="text-2xl font-bold text-gray-900">{stats.probation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <FontAwesomeIcon icon={faUserPlus} className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Hires</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentHires}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Retirements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingRetirements}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                <FontAwesomeIcon icon={faFlask} className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Research Publications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.researchPublications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                <FontAwesomeIcon icon={faAward} className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Experience</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageExperience}y</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Distribution and Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faUniversity} className="mr-2 text-blue-600" />
              Department Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.departments).map(([dept, count]) => (
                <div key={dept} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">{dept}</span>
                  <span className="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faUserTie} className="mr-2 text-green-600" />
              Designation Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.designations).map(([designation, count]) => (
                <div key={designation} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">{designation}</span>
                  <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faHistory} className="mr-2 text-purple-600" />
              Recent Activities
            </h3>
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.timestamp?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faBell} className="mr-2 text-orange-600" />
            Recent Notifications
          </h3>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  notification.type === 'info' ? 'bg-blue-500' :
                  notification.type === 'warning' ? 'bg-yellow-500' :
                  notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Faculty Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-6 space-y-4 lg:space-y-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Faculty Management System
                </h1>
                <p className="text-gray-600 mt-1 text-sm lg:text-base">
                  Complete faculty lifecycle management for university administration
                </p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} className="text-gray-600" />
              </button>
            </div>
            
            <div className={`flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 ${mobileMenuOpen ? 'block' : 'hidden lg:flex'}`}>
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
                <FontAwesomeIcon icon={faPlus} className="text-sm" />
                <span className="font-medium">Add Faculty</span>
              </button>
              <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
                <FontAwesomeIcon icon={faDownload} className="text-sm" />
                <span className="font-medium">Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap lg:flex-nowrap overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-6 py-4 text-sm font-medium transition-all duration-200 flex items-center space-x-2 whitespace-nowrap relative ${
                    activeTab === tab.id
                      ? `bg-white text-${tab.color}-600 border-b-2 border-${tab.color}-500 shadow-sm`
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="text-lg" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                  {tab.badge && (
                    <span className={`absolute -top-1 -right-1 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center ${
                      tab.badge === 'New' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab Info */}
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-${getActiveTab()?.color}-100 text-${getActiveTab()?.color}-600`}>
                <FontAwesomeIcon icon={getActiveTab()?.icon} className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{getActiveTab()?.name}</h2>
                <p className="text-gray-600 text-sm">{getActiveTab()?.description}</p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="animate-fadeIn">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FacultyManagement;
