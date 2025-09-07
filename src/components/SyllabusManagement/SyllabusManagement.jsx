// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { 
  FaBook, 
  FaGraduationCap, 
  FaCalendarAlt, 
  FaUsers, 
  FaChartLine, 
  FaFileAlt, 
  FaCheckCircle, 
  FaClock, 
  FaPlus,
  FaEdit,
  FaEye,
  FaTrash,
  FaDownload,
  FaUpload,
  FaHistory,
  FaComments,
  FaShieldAlt,
  FaCog,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const SyllabusManagement = () => {
  const [activeTab, setActiveTab] = useState('programs');
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch initial data
  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const programsSnapshot = await getDocs(collection(db, 'programs'));
      const programsData = programsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrograms(programsData);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async (programId) => {
    if (!programId) return;
    setLoading(true);
    try {
      const semestersSnapshot = await getDocs(
        query(
          collection(db, 'semesters'),
          where('program_id', '==', programId),
          orderBy('sem_no')
        )
      );
      const semestersData = semestersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSemesters(semestersData);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (semesterId) => {
    if (!semesterId) return;
    setLoading(true);
    try {
      const coursesSnapshot = await getDocs(
        query(
          collection(db, 'courses'),
          where('semester_id', '==', semesterId),
          orderBy('code')
        )
      );
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyllabi = async (courseId) => {
    if (!courseId) return;
    setLoading(true);
    try {
      const syllabiSnapshot = await getDocs(
        query(
          collection(db, 'syllabi'),
          where('course_id', '==', courseId),
          orderBy('version_no', 'desc')
        )
      );
      const syllabiData = syllabiSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSyllabi(syllabiData);
    } catch (error) {
      console.error('Error fetching syllabi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'under_review': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'published': 'bg-blue-100 text-blue-800',
      'retired': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'draft': '📝',
      'under_review': '⏳',
      'approved': '✅',
      'published': '📢',
      'retired': '🗑️'
    };
    return icons[status] || '📄';
  };

  const renderProgramsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Academic Programs</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <FaPlus />
          Add Program
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map(program => (
          <div key={program.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaGraduationCap className="text-blue-600 text-2xl" />
              </div>
              <span className="text-sm text-gray-500">{program.degree_type}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{program.name}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Duration:</strong> {program.duration_years} years</p>
              <p><strong>Intake Code:</strong> {program.intake_code}</p>
              <p><strong>Effective:</strong> {program.effective_from} - {program.effective_to}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm">
                View Details
              </button>
              <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm">
                <FaEdit />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSemestersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Semester Management</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <FaPlus />
          Add Semester
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {semesters.map(semester => (
          <div key={semester.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaCalendarAlt className="text-purple-600 text-2xl" />
              </div>
              <span className="text-sm text-gray-500">Semester {semester.sem_no}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Semester {semester.sem_no}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Academic Year:</strong> {semester.academic_year}</p>
              <p><strong>Start Date:</strong> {semester.start_date}</p>
              <p><strong>End Date:</strong> {semester.end_date}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 text-sm">
                View Courses
              </button>
              <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm">
                <FaEdit />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCoursesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Course Catalog</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <FaPlus />
          Add Course
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaBook className="text-green-600 text-2xl" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                {getStatusIcon(course.status)} {course.status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{course.code}</h3>
            <p className="text-gray-600 mb-3">{course.title}</p>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Credits:</strong> {course.credits}</p>
              <p><strong>L:T:P:</strong> {course.ltp}</p>
              <p><strong>Level:</strong> {course.level}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm">
                View Syllabus
              </button>
              <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm">
                <FaEdit />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSyllabiTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Syllabus Management</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <FaPlus />
          Create Syllabus
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {syllabi.map(syllabus => (
          <div key={syllabus.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaFileAlt className="text-orange-600 text-2xl" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(syllabus.status)}`}>
                {getStatusIcon(syllabus.status)} {syllabus.status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Version {syllabus.version_no}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Created:</strong> {syllabus.created_at}</p>
              <p><strong>Effective From:</strong> {syllabus.effective_from}</p>
              <p><strong>Created By:</strong> {syllabus.created_by}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 text-sm">
                View Details
              </button>
              <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm">
                <FaHistory />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Analytics & Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Programs</p>
              <p className="text-3xl font-bold text-gray-800">{programs.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaGraduationCap className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Courses</p>
              <p className="text-3xl font-bold text-gray-800">{courses.filter(c => c.status === 'active').length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FaBook className="text-green-600 text-2xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published Syllabi</p>
              <p className="text-3xl font-bold text-gray-800">{syllabi.filter(s => s.status === 'published').length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FaFileAlt className="text-orange-600 text-2xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Under Review</p>
              <p className="text-3xl font-bold text-gray-800">{syllabi.filter(s => s.status === 'under_review').length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FaClock className="text-yellow-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'programs', label: 'Programs', icon: FaGraduationCap },
    { id: 'semesters', label: 'Semesters', icon: FaCalendarAlt },
    { id: 'courses', label: 'Courses', icon: FaBook },
    { id: 'syllabi', label: 'Syllabi', icon: FaFileAlt },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-green-600 rounded-xl">
              <FaBook className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Syllabus & Courses Management</h1>
              <p className="text-gray-600">Comprehensive academic program and curriculum management system</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search programs, courses, or syllabi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
              </select>
              <button className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2">
                <FaFilter />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="text-lg" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'programs' && renderProgramsTab()}
              {activeTab === 'semesters' && renderSemestersTab()}
              {activeTab === 'courses' && renderCoursesTab()}
              {activeTab === 'syllabi' && renderSyllabiTab()}
              {activeTab === 'analytics' && renderAnalyticsTab()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusManagement;
