// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { 
  FaBook, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSave, 
  FaTimes, 
  FaCalendarAlt,
  FaUsers,
  FaGraduationCap,
  FaSearch,
  FaFilter,
  FaFileAlt,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    short_desc: '',
    long_desc: '',
    credits: '',
    ltp: '',
    level: 'core',
    status: 'active',
    program_id: '',
    semester_id: '',
    prerequisites: '',
    co_requisites: '',
    learning_outcomes: '',
    assessment_methods: '',
    textbooks: '',
    references: ''
  });

  const courseLevels = ['core', 'elective', 'soft'];
  const statusOptions = ['active', 'inactive', 'retired'];

  useEffect(() => {
    fetchCourses();
    fetchPrograms();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const coursesSnapshot = await getDocs(
        query(collection(db, 'courses'), orderBy('code'))
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

  const fetchPrograms = async () => {
    try {
      const programsSnapshot = await getDocs(collection(db, 'programs'));
      const programsData = programsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrograms(programsData);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchSemesters = async (programId) => {
    if (!programId) return;
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courseData = {
        ...formData,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'current_user_id',
        total_enrollments: 0,
        syllabus_versions: 0
      };

      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), {
          ...courseData,
          updated_at: new Date()
        });
      } else {
        await addDoc(collection(db, 'courses'), courseData);
      }

      setShowForm(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
      alert(editingCourse ? 'Course updated successfully!' : 'Course created successfully!');
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error saving course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      title: course.title,
      short_desc: course.short_desc || '',
      long_desc: course.long_desc || '',
      credits: course.credits,
      ltp: course.ltp || '',
      level: course.level,
      status: course.status,
      program_id: course.program_id || '',
      semester_id: course.semester_id || '',
      prerequisites: course.prerequisites || '',
      co_requisites: course.co_requisites || '',
      learning_outcomes: course.learning_outcomes || '',
      assessment_methods: course.assessment_methods || '',
      textbooks: course.textbooks || '',
      references: course.references || ''
    });
    if (course.program_id) {
      fetchSemesters(course.program_id);
    }
    setShowForm(true);
  };

  const handleDelete = async (course) => {
    if (window.confirm(`Are you sure you want to delete the course "${course.title}"?`)) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'courses', course.id));
        fetchCourses();
        alert('Course deleted successfully!');
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Error deleting course. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      short_desc: '',
      long_desc: '',
      credits: '',
      ltp: '',
      level: 'core',
      status: 'active',
      program_id: '',
      semester_id: '',
      prerequisites: '',
      co_requisites: '',
      learning_outcomes: '',
      assessment_methods: '',
      textbooks: '',
      references: ''
    });
    setSemesters([]);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'retired': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level) => {
    const colors = {
      'core': 'bg-blue-100 text-blue-800',
      'elective': 'bg-purple-100 text-purple-800',
      'soft': 'bg-orange-100 text-orange-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
              <FaBook className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
              <p className="text-gray-600">Manage course catalog, curriculum structure, and course details</p>
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
                  placeholder="Search courses by code or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                {courseLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button 
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2"
              >
                <FaPlus />
                Add Course
              </button>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaBook className="text-green-600 text-2xl" />
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                    {course.status}
                  </span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{course.code}</h3>
              <p className="text-gray-600 mb-3">{course.title}</p>
              <p className="text-gray-500 text-sm mb-4">{course.short_desc}</p>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <FaGraduationCap className="text-blue-500" />
                  <span><strong>Credits:</strong> {course.credits}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-green-500" />
                  <span><strong>L:T:P:</strong> {course.ltp || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers className="text-purple-500" />
                  <span><strong>Enrollments:</strong> {course.total_enrollments || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaFileAlt className="text-orange-500" />
                  <span><strong>Syllabi:</strong> {course.syllabus_versions || 0}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center justify-center gap-1">
                  <FaEye />
                  Details
                </button>
                <button
                  onClick={() => handleEdit(course)}
                  className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 text-sm"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(course)}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-20">
            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Courses Found</h3>
            <p className="text-gray-500">Create your first course to get started</p>
          </div>
        )}

        {/* Add/Edit Course Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingCourse(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Course Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Credits *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.credits}
                      onChange={(e) => setFormData({...formData, credits: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">L:T:P Ratio</label>
                    <input
                      type="text"
                      placeholder="e.g., 3:1:2"
                      value={formData.ltp}
                      onChange={(e) => setFormData({...formData, ltp: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Course Level *</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      {courseLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Program</label>
                    <select
                      value={formData.program_id}
                      onChange={(e) => {
                        setFormData({...formData, program_id: e.target.value, semester_id: ''});
                        if (e.target.value) {
                          fetchSemesters(e.target.value);
                        } else {
                          setSemesters([]);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Program</option>
                      {programs.map(program => (
                        <option key={program.id} value={program.id}>{program.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
                    <select
                      value={formData.semester_id}
                      onChange={(e) => setFormData({...formData, semester_id: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={!formData.program_id}
                    >
                      <option value="">Select Semester</option>
                      {semesters.map(semester => (
                        <option key={semester.id} value={semester.id}>Semester {semester.sem_no}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                  <input
                    type="text"
                    value={formData.short_desc}
                    onChange={(e) => setFormData({...formData, short_desc: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Brief course description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Long Description</label>
                  <textarea
                    value={formData.long_desc}
                    onChange={(e) => setFormData({...formData, long_desc: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Detailed course description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prerequisites</label>
                    <textarea
                      value={formData.prerequisites}
                      onChange={(e) => setFormData({...formData, prerequisites: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Course prerequisites..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Co-requisites</label>
                    <textarea
                      value={formData.co_requisites}
                      onChange={(e) => setFormData({...formData, co_requisites: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Course co-requisites..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Outcomes</label>
                  <textarea
                    value={formData.learning_outcomes}
                    onChange={(e) => setFormData({...formData, learning_outcomes: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Course learning outcomes..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment Methods</label>
                    <textarea
                      value={formData.assessment_methods}
                      onChange={(e) => setFormData({...formData, assessment_methods: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Assessment methods..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Textbooks</label>
                    <textarea
                      value={formData.textbooks}
                      onChange={(e) => setFormData({...formData, textbooks: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Required textbooks..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">References</label>
                  <textarea
                    value={formData.references}
                    onChange={(e) => setFormData({...formData, references: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Additional references..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCourse(null);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 flex items-center gap-2"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        {editingCourse ? 'Update Course' : 'Create Course'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
