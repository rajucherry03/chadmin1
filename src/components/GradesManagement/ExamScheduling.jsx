import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faUserGraduate,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faSave,
  faTimes,
  faSearch,
  faFilter,
  faDownload,
  faPrint,
  faBell
} from '@fortawesome/free-solid-svg-icons';

const ExamScheduling = () => {
  const [exams, setExams] = useState([
    {
      id: 1,
      courseCode: 'CS301',
      courseName: 'Data Structures',
      examType: 'Mid-Semester',
      date: '2024-03-15',
      startTime: '10:00',
      endTime: '12:00',
      duration: '2 hours',
      venue: 'Room 101',
      capacity: 50,
      enrolledStudents: 45,
      invigilators: ['Dr. Smith', 'Prof. Johnson'],
      status: 'scheduled',
      seatingPlan: 'generated'
    },
    {
      id: 2,
      courseCode: 'EE201',
      courseName: 'Electrical Circuits',
      examType: 'End-Semester',
      date: '2024-03-20',
      startTime: '14:00',
      endTime: '17:00',
      duration: '3 hours',
      venue: 'Room 205',
      capacity: 40,
      enrolledStudents: 38,
      invigilators: ['Dr. Brown', 'Prof. Davis'],
      status: 'scheduled',
      seatingPlan: 'pending'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    examType: 'Mid-Semester',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    capacity: '',
    invigilators: []
  });

  const [venues, setVenues] = useState([
    { id: 1, name: 'Room 101', capacity: 50, type: 'Classroom' },
    { id: 2, name: 'Room 205', capacity: 40, type: 'Classroom' },
    { id: 3, name: 'Lab 1', capacity: 30, type: 'Laboratory' },
    { id: 4, name: 'Auditorium A', capacity: 100, type: 'Auditorium' }
  ]);

  const [invigilators, setInvigilators] = useState([
    { id: 1, name: 'Dr. Smith', department: 'Computer Science' },
    { id: 2, name: 'Prof. Johnson', department: 'Computer Science' },
    { id: 3, name: 'Dr. Brown', department: 'Electrical Engineering' },
    { id: 4, name: 'Prof. Davis', department: 'Electrical Engineering' }
  ]);

  const examTypes = [
    'Mid-Semester',
    'End-Semester',
    'Practical',
    'Viva',
    'Quiz',
    'Assignment',
    'Supplementary'
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeatingPlanColor = (status) => {
    switch (status) {
      case 'generated': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingExam) {
      // Update existing exam
      setExams(exams.map(exam => 
        exam.id === editingExam.id ? { ...formData, id: exam.id, status: 'scheduled', seatingPlan: 'pending' } : exam
      ));
    } else {
      // Add new exam
      const newExam = {
        ...formData,
        id: Date.now(),
        status: 'scheduled',
        seatingPlan: 'pending',
        enrolledStudents: 0
      };
      setExams([...exams, newExam]);
    }
    setShowForm(false);
    setEditingExam(null);
    setFormData({
      courseCode: '',
      courseName: '',
      examType: 'Mid-Semester',
      date: '',
      startTime: '',
      endTime: '',
      venue: '',
      capacity: '',
      invigilators: []
    });
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData(exam);
    setShowForm(true);
  };

  const handleDelete = (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      setExams(exams.filter(exam => exam.id !== examId));
    }
  };

  const generateSeatingPlan = (examId) => {
    setExams(exams.map(exam => 
      exam.id === examId ? { ...exam, seatingPlan: 'generated' } : exam
    ));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exam Scheduling</h2>
          <p className="text-gray-600">Schedule exams, allocate venues, and manage invigilation duties</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Schedule Exam</span>
        </button>
      </div>

      {/* Exam Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingExam ? 'Edit Exam' : 'Schedule New Exam'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingExam(null);
                  setFormData({
                    courseCode: '',
                    courseName: '',
                    examType: 'Mid-Semester',
                    date: '',
                    startTime: '',
                    endTime: '',
                    venue: '',
                    capacity: '',
                    invigilators: []
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={formData.courseName}
                    onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Type
                  </label>
                  <select
                    value={formData.examType}
                    onChange={(e) => setFormData({...formData, examType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {examTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue
                  </label>
                  <select
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Venue</option>
                    {venues.map(venue => (
                      <option key={venue.id} value={venue.name}>
                        {venue.name} (Capacity: {venue.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingExam(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingExam ? 'Update Exam' : 'Schedule Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exams List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Scheduled Exams</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{exam.courseCode}</div>
                      <div className="text-sm text-gray-500">{exam.courseName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{exam.examType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{exam.date}</div>
                      <div className="text-sm text-gray-500">{exam.startTime} - {exam.endTime}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{exam.venue}</div>
                      <div className="text-sm text-gray-500">Capacity: {exam.capacity}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{exam.enrolledStudents}/{exam.capacity}</div>
                      <div className="text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${getSeatingPlanColor(exam.seatingPlan)}`}>
                          {exam.seatingPlan}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(exam)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => generateSeatingPlan(exam.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Generate Seating Plan"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Venue Management</h4>
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-600" />
          </div>
          <p className="text-gray-600 mb-4">Manage exam venues and their capacities</p>
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
            Manage Venues
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Invigilation Duties</h4>
            <FontAwesomeIcon icon={faUserGraduate} className="text-green-600" />
          </div>
          <p className="text-gray-600 mb-4">Assign invigilators to exam sessions</p>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
            Assign Duties
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Seating Plans</h4>
            <FontAwesomeIcon icon={faDownload} className="text-purple-600" />
          </div>
          <p className="text-gray-600 mb-4">Generate and print seating arrangements</p>
          <button className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
            Generate Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamScheduling;
