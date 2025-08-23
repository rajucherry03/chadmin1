import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, doc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    year: "",
    section: "",
    branch: "",
    status: "",
    gender: "",
    category: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(20);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState({});
  const [exportFormat, setExportFormat] = useState("excel");

  const auth = getAuth();

  // Fetch all students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const studentsCollection = collection(db, "students");
      const querySnapshot = await getDocs(studentsCollection);
      const allStudents = [];
      
      for (const yearDoc of querySnapshot.docs) {
        const yearData = yearDoc.data();
        const sectionsSnapshot = await getDocs(collection(db, `students/${yearDoc.id}`));
        
        for (const sectionDoc of sectionsSnapshot.docs) {
          const studentsSnapshot = await getDocs(collection(db, `students/${yearDoc.id}/${sectionDoc.id}`));
          
          studentsSnapshot.docs.forEach(studentDoc => {
            allStudents.push({
              id: studentDoc.id,
              ...studentDoc.data(),
              year: yearDoc.id,
              section: sectionDoc.id
            });
          });
        }
      }
      
      setStudents(allStudents);
      setFilteredStudents(allStudents);
      calculateAnalytics(allStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const calculateAnalytics = (studentList) => {
    const analytics = {
      total: studentList.length,
      byYear: {},
      bySection: {},
      byBranch: {},
      byGender: {},
      byCategory: {},
      byStatus: {},
      recentAdmissions: 0
    };

    studentList.forEach(student => {
      // Year analytics
      analytics.byYear[student.year] = (analytics.byYear[student.year] || 0) + 1;
      
      // Section analytics
      analytics.bySection[student.section] = (analytics.bySection[student.section] || 0) + 1;
      
      // Branch analytics
      if (student.branch) {
        analytics.byBranch[student.branch] = (analytics.byBranch[student.branch] || 0) + 1;
      }
      
      // Gender analytics
      if (student.gender) {
        analytics.byGender[student.gender] = (analytics.byGender[student.gender] || 0) + 1;
      }
      
      // Category analytics
      if (student.category) {
        analytics.byCategory[student.category] = (analytics.byCategory[student.category] || 0) + 1;
      }
      
      // Status analytics
      analytics.byStatus[student.status || "Active"] = (analytics.byStatus[student.status || "Active"] || 0) + 1;
      
      // Recent admissions (last 30 days)
      if (student.createdAt && student.createdAt.toDate) {
        const admissionDate = student.createdAt.toDate();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (admissionDate > thirtyDaysAgo) {
          analytics.recentAdmissions++;
        }
      }
    });

    setAnalytics(analytics);
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = students;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        filtered = filtered.filter(student => student[key] === filters[key]);
      }
    });

    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [students, searchTerm, filters]);

  // Load students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Handle student selection
  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Handle bulk operations
  const handleBulkOperation = async (operation) => {
    if (selectedStudents.length === 0) {
      alert("Please select students first");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to ${operation} ${selectedStudents.length} students?`);
    if (!confirmed) return;

    try {
      for (const studentId of selectedStudents) {
        const student = students.find(s => s.id === studentId);
        if (student) {
          const studentRef = doc(db, `students/${student.year}/${student.section}/${studentId}`);
          
          switch (operation) {
            case "activate":
              await updateDoc(studentRef, { status: "Active" });
              break;
            case "deactivate":
              await updateDoc(studentRef, { status: "Inactive" });
              break;
            case "delete":
              await deleteDoc(studentRef);
              break;
            default:
              break;
          }
        }
      }
      
      await fetchStudents();
      setSelectedStudents([]);
      alert(`${operation} completed successfully`);
    } catch (error) {
      console.error(`Error in bulk ${operation}:`, error);
      alert(`Error in bulk ${operation}`);
    }
  };

  // Export data
  const exportData = () => {
    const dataToExport = selectedStudents.length > 0 
      ? students.filter(s => selectedStudents.includes(s.id))
      : filteredStudents;

    if (exportFormat === "excel") {
      // Implementation for Excel export
      console.log("Exporting to Excel:", dataToExport);
    } else if (exportFormat === "csv") {
      // Implementation for CSV export
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Roll No,Name,Email,Year,Section,Branch,Status\n" +
        dataToExport.map(s => 
          `${s.rollNo},${s.name},${s.email},${s.year},${s.section},${s.branch},${s.status}`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "students.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // View student details
  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Management</h1>
          <p className="text-gray-600">Comprehensive student administration and analytics</p>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.byStatus.Active || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Admissions</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.recentAdmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Branches</p>
                <p className="text-2xl font-semibold text-gray-900">{Object.keys(analytics.byBranch).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <input
                type="text"
                placeholder="Search by name, roll no, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Years</option>
              {Object.keys(analytics.byYear).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={filters.section}
              onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sections</option>
              {Object.keys(analytics.bySection).map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Bulk Operations */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleBulkOperation("activate")}
                disabled={selectedStudents.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Activate Selected
              </button>
              <button
                onClick={() => handleBulkOperation("deactivate")}
                disabled={selectedStudents.length === 0}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Deactivate Selected
              </button>
              <button
                onClick={() => handleBulkOperation("delete")}
                disabled={selectedStudents.length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Delete Selected
              </button>
            </div>

            <div className="flex items-center space-x-4 ml-auto">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg"
              >
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Export {selectedStudents.length > 0 ? 'Selected' : 'All'}
              </button>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(currentStudents.map(s => s.id));
                        } else {
                          setSelectedStudents([]);
                        }
                      }}
                      checked={selectedStudents.length === currentStudents.length && currentStudents.length > 0}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
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
                {currentStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentSelect(student.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {student.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.rollNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.year} - {student.section}</div>
                      <div className="text-sm text-gray-500">{student.branch}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.email}</div>
                      <div className="text-sm text-gray-500">{student.studentMobile}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'Active' ? 'bg-green-100 text-green-800' :
                        student.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewStudentDetails(student)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {/* Edit functionality */}}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstStudent + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastStudent, filteredStudents.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredStudents.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Details Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Student Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedStudent.name}</p>
                    <p><span className="font-medium">Roll No:</span> {selectedStudent.rollNo}</p>
                    <p><span className="font-medium">Email:</span> {selectedStudent.email}</p>
                    <p><span className="font-medium">Gender:</span> {selectedStudent.gender}</p>
                    <p><span className="font-medium">Date of Birth:</span> {selectedStudent.dateOfBirth}</p>
                    <p><span className="font-medium">Blood Group:</span> {selectedStudent.bloodGroup}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Academic Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Year:</span> {selectedStudent.year}</p>
                    <p><span className="font-medium">Section:</span> {selectedStudent.section}</p>
                    <p><span className="font-medium">Branch:</span> {selectedStudent.branch}</p>
                    <p><span className="font-medium">Semester:</span> {selectedStudent.semester}</p>
                    <p><span className="font-medium">Admission Date:</span> {selectedStudent.admissionDate}</p>
                    <p><span className="font-medium">Status:</span> {selectedStudent.status}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Mobile:</span> {selectedStudent.studentMobile}</p>
                    <p><span className="font-medium">Address:</span> {selectedStudent.address}</p>
                    <p><span className="font-medium">Emergency Contact:</span> {selectedStudent.emergencyContact}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Family Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Father's Name:</span> {selectedStudent.fatherName}</p>
                    <p><span className="font-medium">Father's Mobile:</span> {selectedStudent.fatherMobile}</p>
                    <p><span className="font-medium">Mother's Name:</span> {selectedStudent.motherName}</p>
                    <p><span className="font-medium">Guardian:</span> {selectedStudent.guardianName}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
