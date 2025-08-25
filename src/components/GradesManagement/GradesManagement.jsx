import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGraduationCap,
  faChartLine,
  faFileAlt,
  faCalculator,
  faExclamationTriangle,
  faCheckCircle,
  faClock,
  faUserGraduate,
  faChartBar,
  faCalendarAlt,
  faDownload,
  faPlus,
  faEye,
  faEdit,
  faTrash,
  faArrowRight,
  faCog,
  faBell,
  faSearch,
  faFilter,
  faShieldAlt,
  faUserShield,
  faHistory,
  faLock,
  faUnlock,
  faTimes,
  faUpload,
  faHome,
  faTrophy,
  faBookOpen,
  faUsers,
  faClipboardList,
  faFileSignature,
  faChartPie,
  faCalendarCheck,
  faCloudUploadAlt
} from '@fortawesome/free-solid-svg-icons';
import { Link, Routes, Route } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { handleFirestoreError } from '../../utils/errorHandler';

// Import sub-components
import ExamDashboard from './ExamDashboard';
import MarksEntry from './MarksEntry';
import GradeCalculation from './GradeCalculation';
import ResultPublication from './ResultPublication';
import RevaluationPortal from './RevaluationPortal';
import TranscriptGenerator from './TranscriptGenerator';
import GradeAnalytics from './GradeAnalytics';
import ExamScheduling from './ExamScheduling';
import ModerationQueue from './ModerationQueue';
import BulkUpload from './BulkUpload';

const GradesManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Enhanced state management for comprehensive workflow
  const [userRole, setUserRole] = useState('faculty'); // faculty, hod, controller, registrar, admin, student
  const [currentSemester, setCurrentSemester] = useState('2024-1');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [auditLog, setAuditLog] = useState([]);
  const [workflowStates, setWorkflowStates] = useState({
    marksEntry: 'draft', // draft, submitted, under_moderation, approved, published
    moderation: 'pending', // pending, in_review, approved, rejected
    publication: 'draft', // draft, scheduled, published, archived
    revaluation: 'open' // open, closed, under_review, completed
  });

  // Enhanced statistics with real-time data
  const [gradesStats, setGradesStats] = useState({
    totalStudents: 0,
    examsScheduled: 0,
    resultsPublished: 0,
    pendingModeration: 0,
    revaluationRequests: 0,
    averageCGPA: 0,
    passRate: 0,
    pendingMarksEntry: 0,
    underModeration: 0,
    scheduledForPublication: 0,
    supplementaryExams: 0,
    auditEntries: 0
  });

  // Core entities data structure with Firebase integration
  const [coreEntities, setCoreEntities] = useState({
    students: [],
    programs: [],
    courses: [],
    exams: [],
    examInstances: [],
    enrollments: [],
    marks: [],
    grades: [],
    gradeSchemes: [],
    sgpaRecords: [],
    revaluationRequests: [],
    supplementaryExams: [],
    transcripts: [],
    resultPublications: [],
    auditLogs: []
  });

  // Business rules and validation state
  const [businessRules, setBusinessRules] = useState({
    gradeWeights: {
      internal: 30,
      midSemester: 20,
      endSemester: 50
    },
    passingCriteria: {
      perCourse: 40,
      aggregate: 50,
      minimumAttendance: 75
    },
    gradingScheme: {
      type: '10-point',
      boundaries: {
        'A+': { min: 90, max: 100, points: 10 },
        'A': { min: 80, max: 89, points: 9 },
        'B+': { min: 70, max: 79, points: 8 },
        'B': { min: 60, max: 69, points: 7 },
        'C+': { min: 50, max: 59, points: 6 },
        'C': { min: 40, max: 49, points: 5 },
        'D': { min: 35, max: 39, points: 4 },
        'F': { min: 0, max: 34, points: 0 }
      }
    },
    specialFlags: {
      'AB': 'Absent',
      'MALP': 'Malpractice',
      'INC': 'Incomplete',
      'W': 'Withdrawn'
    }
  });

  // Role-based permissions
  const [permissions, setPermissions] = useState({
    faculty: {
      canEnterMarks: true,
      canViewOwnCourses: true,
      canSubmitForModeration: true,
      canRequestGradeChange: true,
      canViewAnalytics: false,
      canPublishResults: false,
      canManageRevaluation: false,
      canGenerateTranscripts: false
    },
    hod: {
      canEnterMarks: true,
      canViewDepartmentCourses: true,
      canModerateResults: true,
      canApproveGradeChanges: true,
      canViewAnalytics: true,
      canPublishResults: false,
      canManageRevaluation: true,
      canGenerateTranscripts: false
    },
    controller: {
      canEnterMarks: true,
      canViewAllCourses: true,
      canModerateResults: true,
      canApproveGradeChanges: true,
      canViewAnalytics: true,
      canPublishResults: true,
      canManageRevaluation: true,
      canGenerateTranscripts: true
    },
    registrar: {
      canEnterMarks: false,
      canViewAllCourses: true,
      canModerateResults: false,
      canApproveGradeChanges: true,
      canViewAnalytics: true,
      canPublishResults: true,
      canManageRevaluation: false,
      canGenerateTranscripts: true
    },
    admin: {
      canEnterMarks: true,
      canViewAllCourses: true,
      canModerateResults: true,
      canApproveGradeChanges: true,
      canViewAnalytics: true,
      canPublishResults: true,
      canManageRevaluation: true,
      canGenerateTranscripts: true
    },
    student: {
      canEnterMarks: false,
      canViewOwnResults: true,
      canApplyRevaluation: true,
      canDownloadTranscripts: true,
      canViewAnalytics: false,
      canPublishResults: false,
      canManageRevaluation: false,
      canGenerateTranscripts: false
    }
  });

  // Firebase data fetching functions
  const fetchStudents = async () => {
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const rollNoA = a.rollNo || '';
        const rollNoB = b.rollNo || '';
        return rollNoA.localeCompare(rollNoB, undefined, { numeric: true, sensitivity: 'base' });
      });
      setCoreEntities(prev => ({ ...prev, students: studentsData }));
    } catch (error) {
      handleFirestoreError(error, 'fetchStudents');
      toast.error('Failed to fetch students data');
    }
  };

  const fetchPrograms = async () => {
    try {
      const programsRef = collection(db, 'programs');
      const q = query(programsRef, where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);
      const programsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoreEntities(prev => ({ ...prev, programs: programsData }));
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to fetch programs data');
    }
  };

  const fetchCourses = async () => {
    try {
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);
      const coursesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoreEntities(prev => ({ ...prev, courses: coursesData }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses data');
    }
  };

  const fetchExams = async () => {
    try {
      const examsRef = collection(db, 'exams');
      const q = query(examsRef, orderBy('startDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const examsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoreEntities(prev => ({ ...prev, exams: examsData }));
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to fetch exams data');
    }
  };

  const fetchMarks = async () => {
    try {
      const marksRef = collection(db, 'marks');
      const q = query(marksRef, orderBy('enteredAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const marksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoreEntities(prev => ({ ...prev, marks: marksData }));
    } catch (error) {
      console.error('Error fetching marks:', error);
      toast.error('Failed to fetch marks data');
    }
  };

  const fetchGrades = async () => {
    try {
      const gradesRef = collection(db, 'grades');
      const q = query(gradesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const gradesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoreEntities(prev => ({ ...prev, grades: gradesData }));
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to fetch grades data');
    }
  };

  const fetchRevaluationRequests = async () => {
    try {
      const revalRef = collection(db, 'revaluationRequests');
      const q = query(revalRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const revalData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoreEntities(prev => ({ ...prev, revaluationRequests: revalData }));
    } catch (error) {
      console.error('Error fetching revaluation requests:', error);
      toast.error('Failed to fetch revaluation requests');
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const auditRef = collection(db, 'auditLogs');
      const q = query(auditRef, orderBy('timestamp', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      const auditData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoreEntities(prev => ({ ...prev, auditLogs: auditData }));
      setAuditLog(auditData);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to fetch audit logs');
    }
  };

  // Calculate statistics from fetched data
  const calculateStats = () => {
    const { students, exams, marks, grades, revaluationRequests, auditLogs } = coreEntities;
    
    const totalStudents = students.length;
    const examsScheduled = exams.filter(exam => exam.status === 'scheduled').length;
    const resultsPublished = grades.filter(grade => grade.status === 'published').length;
    const pendingModeration = marks.filter(mark => mark.status === 'under_moderation').length;
    const revaluationRequestsCount = revaluationRequests.filter(req => req.status === 'pending').length;
    
    // Calculate average CGPA
    const validGrades = grades.filter(grade => grade.gradePoint && grade.gradePoint > 0);
    const averageCGPA = validGrades.length > 0 
      ? validGrades.reduce((sum, grade) => sum + grade.gradePoint, 0) / validGrades.length 
      : 0;
    
    // Calculate pass rate
    const passedStudents = grades.filter(grade => grade.grade !== 'F' && grade.grade !== 'AB').length;
    const passRate = grades.length > 0 ? (passedStudents / grades.length) * 100 : 0;
    
    const pendingMarksEntry = marks.filter(mark => mark.status === 'draft').length;
    const underModeration = marks.filter(mark => mark.status === 'under_moderation').length;
    const scheduledForPublication = grades.filter(grade => grade.status === 'scheduled').length;
    const supplementaryExams = exams.filter(exam => exam.type === 'supplementary').length;
    const auditEntries = auditLogs.length;

    setGradesStats({
      totalStudents,
      examsScheduled,
      resultsPublished,
      pendingModeration,
      revaluationRequests: revaluationRequestsCount,
      averageCGPA: parseFloat(averageCGPA.toFixed(2)),
      passRate: parseFloat(passRate.toFixed(2)),
      pendingMarksEntry,
      underModeration,
      scheduledForPublication,
      supplementaryExams,
      auditEntries
    });
  };

  // Audit logging function
  const logAuditEvent = async (entity, entityId, action, details = {}) => {
    try {
      const user = auth.currentUser;
      const auditData = {
        entity,
        entityId,
        action,
        userId: user?.uid || 'system',
        userEmail: user?.email || 'system',
        timestamp: serverTimestamp(),
        details,
        ipAddress: 'client-side',
        userAgent: navigator.userAgent
      };

      await addDoc(collection(db, 'auditLogs'), auditData);
      
      // Update local audit log
      const newAuditEntry = {
        id: Date.now().toString(),
        ...auditData,
        timestamp: new Date()
      };
      setAuditLog(prev => [newAuditEntry, ...prev.slice(0, 99)]);
      
      toast.success(`Audit log created for ${action}`);
    } catch (error) {
      console.error('Error logging audit event:', error);
      toast.error('Failed to log audit event');
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchStudents(),
          fetchPrograms(),
          fetchCourses(),
          fetchExams(),
          fetchMarks(),
          fetchGrades(),
          fetchRevaluationRequests(),
          fetchAuditLogs()
        ]);
        
        // Set up real-time listeners for critical data
        const unsubscribeStudents = onSnapshot(
          query(collection(db, 'students'), where('status', '==', 'active')),
          (snapshot) => {
            const studentsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setCoreEntities(prev => ({ ...prev, students: studentsData }));
          }
        );

        const unsubscribeMarks = onSnapshot(
          query(collection(db, 'marks'), orderBy('enteredAt', 'desc')),
          (snapshot) => {
            const marksData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setCoreEntities(prev => ({ ...prev, marks: marksData }));
          }
        );

        setLoading(false);
        
        // Cleanup listeners on unmount
        return () => {
          unsubscribeStudents();
          unsubscribeMarks();
        };
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to initialize grades management system');
        setLoading(false);
        toast.error('Failed to load grades management data');
      }
    };

    initializeData();
  }, []);

  // Recalculate stats when core entities change
  useEffect(() => {
    calculateStats();
  }, [coreEntities]);

  // Get user role from Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role || 'faculty');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('faculty'); // Default role
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'exam_scheduled',
      title: 'Mid-Semester Exam Scheduled',
      description: 'CS301 - Data Structures scheduled for 15th March',
      timestamp: '2024-03-10T10:30:00',
      status: 'scheduled',
      user: 'Dr. Smith',
      department: 'Computer Science'
    },
    {
      id: 2,
      type: 'marks_entered',
      title: 'Marks Entry Completed',
      description: 'CS302 - Computer Networks marks entered for 45 students',
      timestamp: '2024-03-10T09:15:00',
      status: 'completed',
      user: 'Dr. Johnson',
      department: 'Computer Science'
    },
    {
      id: 3,
      type: 'results_published',
      title: 'Semester Results Published',
      description: '3rd Semester results published for all departments',
      timestamp: '2024-03-09T16:45:00',
      status: 'published',
      user: 'Controller of Examinations',
      department: 'All Departments'
    }
  ]);

  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    logAuditEvent('grades_management', 'tab_navigation', 'tab_changed', { 
      from: activeTab, 
      to: tab 
    });
  };

  // Navigation items with icons and descriptions
  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: faHome, 
      description: 'Overview and quick actions',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    { 
      id: 'marks-entry', 
      label: 'Marks Entry', 
      icon: faEdit, 
      description: 'Enter and manage student marks',
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    { 
      id: 'grade-calculation', 
      label: 'Grade Calculation', 
      icon: faCalculator, 
      description: 'Calculate grades and GPAs',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    { 
      id: 'moderation', 
      label: 'Moderation', 
      icon: faShieldAlt, 
      description: 'Review and approve grades',
      color: 'bg-gradient-to-r from-orange-500 to-orange-600'
    },
    { 
      id: 'publication', 
      label: 'Result Publication', 
      icon: faFileAlt, 
      description: 'Publish and manage results',
      color: 'bg-gradient-to-r from-red-500 to-red-600'
    },
    { 
      id: 'revaluation', 
      label: 'Revaluation', 
      icon: faHistory, 
      description: 'Handle revaluation requests',
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600'
    },
    { 
      id: 'transcripts', 
      label: 'Transcripts', 
      icon: faDownload, 
      description: 'Generate and manage transcripts',
      color: 'bg-gradient-to-r from-teal-500 to-teal-600'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: faChartPie, 
      description: 'View detailed analytics and reports',
      color: 'bg-gradient-to-r from-pink-500 to-pink-600'
    },
    { 
      id: 'scheduling', 
      label: 'Exam Scheduling', 
      icon: faCalendarCheck, 
      description: 'Schedule and manage exams',
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600'
    },
    { 
      id: 'bulk-upload', 
      label: 'Bulk Upload', 
      icon: faCloudUploadAlt, 
      description: 'Upload marks in bulk',
      color: 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600 text-3xl" />
            </div>
          </div>
          <p className="mt-6 text-xl font-semibold text-gray-700">Loading Grades Management System...</p>
          <p className="mt-2 text-gray-500">Please wait while we initialize your dashboard</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-6xl mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">System Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Modern Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <FontAwesomeIcon icon={faGraduationCap} className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Grades Management System
                </h1>
                <p className="text-sm text-gray-500 mt-1">Comprehensive Academic Performance Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-xl">
                <FontAwesomeIcon icon={faUserShield} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700 capitalize">{userRole}</span>
              </div>
              <div className="flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-xl">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">{currentSemester}</span>
              </div>
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                <FontAwesomeIcon icon={faBell} className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{gradesStats.totalStudents.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                <FontAwesomeIcon icon={faUserGraduate} className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Average CGPA</p>
                <p className="text-3xl font-bold text-gray-900">{gradesStats.averageCGPA}</p>
                <p className="text-xs text-green-600 mt-1">+0.2 from last semester</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
                <FontAwesomeIcon icon={faTrophy} className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pass Rate</p>
                <p className="text-3xl font-bold text-gray-900">{gradesStats.passRate}%</p>
                <p className="text-xs text-green-600 mt-1">+5% from last semester</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-3 rounded-xl">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Moderation</p>
                <p className="text-3xl font-bold text-gray-900">{gradesStats.pendingModeration}</p>
                <p className="text-xs text-red-600 mt-1">Requires attention</p>
              </div>
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-xl">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`group relative bg-white rounded-2xl shadow-lg p-6 border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                activeTab === item.id
                  ? 'border-blue-500 shadow-blue-100'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="text-center">
                <div className={`${item.color} p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <FontAwesomeIcon icon={item.icon} className="text-white text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.label}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                {activeTab === item.id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            {activeTab === 'dashboard' && (
              <ExamDashboard 
                gradesStats={gradesStats}
                coreEntities={coreEntities}
                userRole={userRole}
                permissions={permissions}
                recentActivities={recentActivities}
                logAuditEvent={logAuditEvent}
              />
            )}
            {activeTab === 'marks-entry' && (
              <MarksEntry 
                userRole={userRole}
                currentSemester={currentSemester}
                selectedDepartment={selectedDepartment}
                businessRules={businessRules}
                permissions={permissions}
                logAuditEvent={logAuditEvent}
                workflowStates={workflowStates}
                setWorkflowStates={setWorkflowStates}
                coreEntities={coreEntities}
              />
            )}
            {activeTab === 'grade-calculation' && (
              <GradeCalculation 
                coreEntities={coreEntities}
                businessRules={businessRules}
                logAuditEvent={logAuditEvent}
              />
            )}
            {activeTab === 'moderation' && (
              <ModerationQueue 
                coreEntities={coreEntities}
                userRole={userRole}
                permissions={permissions}
                logAuditEvent={logAuditEvent}
                workflowStates={workflowStates}
                setWorkflowStates={setWorkflowStates}
              />
            )}
            {activeTab === 'publication' && (
              <ResultPublication 
                coreEntities={coreEntities}
                userRole={userRole}
                permissions={permissions}
                logAuditEvent={logAuditEvent}
                workflowStates={workflowStates}
                setWorkflowStates={setWorkflowStates}
              />
            )}
            {activeTab === 'revaluation' && (
              <RevaluationPortal 
                coreEntities={coreEntities}
                userRole={userRole}
                permissions={permissions}
                logAuditEvent={logAuditEvent}
              />
            )}
            {activeTab === 'transcripts' && (
              <TranscriptGenerator 
                coreEntities={coreEntities}
                userRole={userRole}
                permissions={permissions}
                logAuditEvent={logAuditEvent}
              />
            )}
            {activeTab === 'analytics' && (
              <GradeAnalytics 
                coreEntities={coreEntities}
                gradesStats={gradesStats}
                userRole={userRole}
                permissions={permissions}
                logAuditEvent={logAuditEvent}
              />
            )}
            {activeTab === 'scheduling' && (
              <ExamScheduling 
                coreEntities={coreEntities}
                userRole={userRole}
                permissions={permissions}
                logAuditEvent={logAuditEvent}
              />
            )}
            {activeTab === 'bulk-upload' && (
              <BulkUpload 
                coreEntities={coreEntities}
                userRole={userRole}
                permissions={permissions}
                logAuditEvent={logAuditEvent}
                businessRules={businessRules}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradesManagement;
