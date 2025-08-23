import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEye, 
  faSave, 
  faTimes, 
  faEdit, 
  faTrash, 
  faCheck, 
  faTimes as faClose,
  faDownload,
  faUpload,
  faFilter,
  faSearch,
  faUserGraduate,
  faCalendarAlt,
  faUsers,
  faPlus,
  faChartBar,
  faGraduationCap,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faIdCard,
  faBook,
  faClock,
  faExclamationTriangle,
  faCheckCircle,
  faUserTie,
  faBuilding,
  faGlobe,
  faFileExcel,
  faFilePdf
} from "@fortawesome/free-solid-svg-icons";
import { db } from "../firebase";
import { collection, collectionGroup, getDocs, doc, updateDoc, writeBatch, query, where, addDoc, deleteDoc } from "firebase/firestore";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkUpdateData, setBulkUpdateData] = useState({
    year: "",
    semester: "",
    section: "",
    status: "",
    department: ""
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    graduated: 0,
    byYear: {},
    bySection: {},
    byDepartment: {}
  });
  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNo: "",
    email: "",
    phone: "",
    Year: "",
    Section: "",
    Semester: "",
    department: "",
    status: "active",
    dateOfBirth: "",
    address: "",
    fatherName: "",
    motherName: "",
    emergencyContact: "",
    bloodGroup: "",
    admissionDate: "",
    mentorName: "",
    mentorEmail: "",
    mentorPhone: ""
  });
  const [viewMode, setViewMode] = useState("table"); // table, grid, cards
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch Students
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        let querySnapshot;

        if (filterYear && filterSection) {
          // Fetch students from a specific year and section
          const studentsPath = `students/${filterYear}/${filterSection}`;
          const studentsCollection = collection(db, studentsPath);
          querySnapshot = await getDocs(studentsCollection);
        } else {
          // Fetch all students across all years and sections
          querySnapshot = await getDocs(collectionGroup(db, "students"));
        }

        const fetchedStudents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          path: doc.ref.parent.path, // To keep the path for updates
          ...doc.data(),
        }));

        // Sort students by roll number in ascending order
        fetchedStudents.sort((a, b) => {
          const rollA = parseInt(a.rollNo, 10) || 0;
          const rollB = parseInt(b.rollNo, 10) || 0;
          return rollA - rollB;
        });

        setStudents(fetchedStudents);
        
        // Calculate statistics
        const yearStats = {};
        const sectionStats = {};
        const departmentStats = {};
        let activeCount = 0;
        let inactiveCount = 0;
        let graduatedCount = 0;

        fetchedStudents.forEach(student => {
          const year = student.Year || 'Unknown';
          const section = student.Section || 'Unknown';
          const department = student.department || 'Unknown';
          const status = student.status || 'active';
          
          yearStats[year] = (yearStats[year] || 0) + 1;
          sectionStats[section] = (sectionStats[section] || 0) + 1;
          departmentStats[department] = (departmentStats[department] || 0) + 1;
          
          if (status === 'active') activeCount++;
          else if (status === 'inactive') inactiveCount++;
          else if (status === 'graduated') graduatedCount++;
        });
        
        setStats({
          total: fetchedStudents.length,
          active: activeCount,
          inactive: inactiveCount,
          graduated: graduatedCount,
          byYear: yearStats,
          bySection: sectionStats,
          byDepartment: departmentStats
        });
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [filterYear, filterSection]);

  // Handle Search
  const handleSearch = (e) => setSearchTerm(e.target.value);

  // Filter Students by Name, Roll No, or Email
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      student.name?.toLowerCase().includes(searchLower) ||
      student.rollNo?.toString().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.phone?.includes(searchLower) ||
      student.department?.toLowerCase().includes(searchLower)
    );

    const matchesYear = !filterYear || student.Year === filterYear;
    const matchesSection = !filterSection || student.Section === filterSection;
    const matchesSemester = !filterSemester || student.Semester === filterSemester;
    const matchesStatus = !filterStatus || student.status === filterStatus;
    const matchesDepartment = !filterDepartment || student.department === filterDepartment;

    return matchesSearch && matchesYear && matchesSection && matchesSemester && 
           matchesStatus && matchesDepartment;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aValue = a[sortBy] || '';
    let bValue = b[sortBy] || '';
    
    if (sortBy === 'rollNo') {
      aValue = parseInt(aValue) || 0;
      bValue = parseInt(bValue) || 0;
    } else {
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Handle Popup View
  const handleViewClick = (student) => {
    setSelectedStudent({ ...student }); // Create a shallow copy to avoid direct mutations
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedStudent(null);
  };

  // Handle Edit
  const handleEdit = (e) => {
    const { name, value } = e.target;
    setSelectedStudent((prev) => ({ ...prev, [name]: value }));
  };

  // Save Edited Student Data
  const saveChanges = async () => {
    try {
      const studentRef = doc(db, selectedStudent.path, selectedStudent.id);
      const updatedData = { ...selectedStudent };
      delete updatedData.path; // Remove extra metadata before saving
      await updateDoc(studentRef, updatedData);

      // Update state locally for better user feedback
      setStudents((prev) =>
        prev.map((student) =>
          student.id === selectedStudent.id ? { ...updatedData, id: student.id, path: student.path } : student
        )
      );

      alert("Student details updated successfully!");
      handleClosePopup();
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student details.");
    }
  };

  // Handle bulk selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Bulk update students with smart progression
  const handleBulkUpdate = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student for bulk update.");
      return;
    }

    const updateData = {};
    if (bulkUpdateData.year) updateData.Year = bulkUpdateData.year;
    if (bulkUpdateData.semester) updateData.Semester = bulkUpdateData.semester;
    if (bulkUpdateData.section) updateData.Section = bulkUpdateData.section;
    if (bulkUpdateData.status) updateData.status = bulkUpdateData.status;
    if (bulkUpdateData.department) updateData.department = bulkUpdateData.department;

    if (Object.keys(updateData).length === 0) {
      alert("Please select at least one field to update.");
      return;
    }

    try {
      setLoading(true);
      const batch = writeBatch(db);
      
      const studentsToUpdate = students.filter(student => 
        selectedStudents.includes(student.id)
      );

      // Track automatic status changes
      let autoCompletedCount = 0;
      let autoGraduatedCount = 0;
      let progressionCount = 0;

      studentsToUpdate.forEach(student => {
        const studentRef = doc(db, student.path, student.id);
        let finalUpdateData = { ...updateData };
        
        // Smart year progression logic
        if (updateData.Year) {
          const currentYear = student.Year;
          const newYear = updateData.Year;
          
          // Track progression
          if (currentYear !== newYear) {
            progressionCount++;
          }
          
          // Auto-complete logic: If moving to 4th year, mark as completed
          if (newYear === "IV" && currentYear === "III") {
            finalUpdateData.status = "completed";
            autoCompletedCount++;
          }
          
          // Auto-graduate logic: If already in 4th year and moving to next phase
          if (currentYear === "IV" && newYear === "IV") {
            // If they're being marked as completed/graduated, track it
            if (updateData.status === "completed" || updateData.status === "graduated") {
              autoGraduatedCount++;
            }
          }
          
          // Auto-semester progression based on year
          if (!updateData.Semester) {
            const yearSemesterMap = {
              "I": "1",
              "II": "3", 
              "III": "5",
              "IV": "7"
            };
            if (yearSemesterMap[newYear]) {
              finalUpdateData.Semester = yearSemesterMap[newYear];
            }
          }
        }
        
        // Auto-semester progression for existing year updates
        if (updateData.Semester && !updateData.Year) {
          const currentYear = student.Year;
          const newSemester = updateData.Semester;
          
          // If semester is 8, mark as completed
          if (newSemester === "8" && currentYear === "IV") {
            finalUpdateData.status = "completed";
            autoCompletedCount++;
          }
        }
        
        batch.update(studentRef, finalUpdateData);
      });

      await batch.commit();

      // Update local state
      setStudents(prev => 
        prev.map(student => {
          if (selectedStudents.includes(student.id)) {
            let updatedStudent = { ...student, ...updateData };
            
            // Apply the same logic to local state
            if (updateData.Year) {
              const currentYear = student.Year;
              const newYear = updateData.Year;
              
              if (newYear === "IV" && currentYear === "III") {
                updatedStudent.status = "completed";
              }
              
              if (!updateData.Semester) {
                const yearSemesterMap = {
                  "I": "1",
                  "II": "3", 
                  "III": "5",
                  "IV": "7"
                };
                if (yearSemesterMap[newYear]) {
                  updatedStudent.Semester = yearSemesterMap[newYear];
                }
              }
            }
            
            if (updateData.Semester && !updateData.Year) {
              const currentYear = student.Year;
              const newSemester = updateData.Semester;
              
              if (newSemester === "8" && currentYear === "IV") {
                updatedStudent.status = "completed";
              }
            }
            
            return updatedStudent;
          }
          return student;
        })
      );

      // Show detailed success message
      let message = `Successfully updated ${selectedStudents.length} students!`;
      if (progressionCount > 0) {
        message += `\n• ${progressionCount} students progressed to new year`;
      }
      if (autoCompletedCount > 0) {
        message += `\n• ${autoCompletedCount} students automatically marked as completed`;
      }
      if (autoGraduatedCount > 0) {
        message += `\n• ${autoGraduatedCount} students graduated`;
      }

      alert(message);
      setSelectedStudents([]);
      setShowBulkUpdate(false);
      setBulkUpdateData({ year: "", semester: "", section: "", status: "", department: "" });
    } catch (error) {
      console.error("Error in bulk update:", error);
      alert("Failed to update students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Export students data to Excel
  const exportToExcel = () => {
    // Create CSV content
    const headers = [
      'Name', 'Roll No', 'Email', 'Phone', 'Year', 'Section', 'Semester', 
      'Department', 'Status', 'Date of Birth', 'Address', 'Father Name', 
      'Mother Name', 'Emergency Contact', 'Blood Group', 'Admission Date',
      'Mentor Name', 'Mentor Email', 'Mentor Phone'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(student => [
        `"${student.name || ''}"`,
        `"${student.rollNo || ''}"`,
        `"${student.email || ''}"`,
        `"${student.phone || ''}"`,
        `"${student.Year || ''}"`,
        `"${student.Section || ''}"`,
        `"${student.Semester || ''}"`,
        `"${student.department || ''}"`,
        `"${student.status || ''}"`,
        `"${student.dateOfBirth || ''}"`,
        `"${student.address || ''}"`,
        `"${student.fatherName || ''}"`,
        `"${student.motherName || ''}"`,
        `"${student.emergencyContact || ''}"`,
        `"${student.bloodGroup || ''}"`,
        `"${student.admissionDate || ''}"`,
        `"${student.mentorName || ''}"`,
        `"${student.mentorEmail || ''}"`,
        `"${student.mentorPhone || ''}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export students data to PDF
  const exportToPDF = () => {
    // Create a simple HTML table for PDF
    const tableData = filteredStudents.map(student => [
      student.name || '',
      student.rollNo || '',
      student.email || '',
      student.phone || '',
      student.Year || '',
      student.Section || '',
      student.Semester || '',
      student.department || '',
      student.status || ''
    ]);
    
    const headers = ['Name', 'Roll No', 'Email', 'Phone', 'Year', 'Section', 'Semester', 'Department', 'Status'];
    
    let htmlContent = `
      <html>
        <head>
          <title>Students Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { color: #333; text-align: center; }
            .header { text-align: center; margin-bottom: 20px; }
            .stats { margin-bottom: 20px; }
            .stats p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Students Management Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <div class="stats">
              <p><strong>Total Students:</strong> ${filteredStudents.length}</p>
              <p><strong>Active Students:</strong> ${stats.active}</p>
              <p><strong>Inactive Students:</strong> ${stats.inactive}</p>
              <p><strong>Graduated Students:</strong> ${stats.graduated}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableData.map(row => 
                `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students_report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export students data to JSON (original function)
  const exportStudents = () => {
    const dataStr = JSON.stringify(filteredStudents, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `students_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Add new student
  const handleAddStudent = async () => {
    try {
      setLoading(true);
      const studentData = { ...newStudent };
      
      // Determine the path based on year and section
      const path = studentData.Year && studentData.Section 
        ? `students/${studentData.Year}/${studentData.Section}`
        : 'students';
      
      const docRef = await addDoc(collection(db, path), studentData);
      
      // Add the new student to local state
      const newStudentWithId = { ...studentData, id: docRef.id, path };
      setStudents(prev => [...prev, newStudentWithId]);
      
      // Reset form
      setNewStudent({
        name: "",
        rollNo: "",
        email: "",
        phone: "",
        Year: "",
        Section: "",
        Semester: "",
        department: "",
        status: "active",
        dateOfBirth: "",
        address: "",
        fatherName: "",
        motherName: "",
        emergencyContact: "",
        bloodGroup: "",
        admissionDate: "",
        mentorName: "",
        mentorEmail: "",
        mentorPhone: ""
      });
      
      setShowAddStudent(false);
      alert("Student added successfully!");
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle new student form changes
  const handleNewStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  // Delete student
  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const student = students.find(s => s.id === studentId);
        if (student) {
          await deleteDoc(doc(db, student.path, studentId));
          setStudents(prev => prev.filter(s => s.id !== studentId));
          alert("Student deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Failed to delete student. Please try again.");
      }
    }
  };

  // View student details
  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Smart progression helper
  const getProgressionInfo = () => {
    if (!bulkUpdateData.year && !bulkUpdateData.semester) return null;
    
    const studentsToUpdate = students.filter(student => 
      selectedStudents.includes(student.id)
    );
    
    let progressionInfo = {
      yearProgression: 0,
      autoCompleted: 0,
      autoGraduated: 0,
      semesterProgression: 0,
      currentYearBreakdown: {}
    };
    
    studentsToUpdate.forEach(student => {
      if (bulkUpdateData.year) {
        const currentYear = student.Year;
        const newYear = bulkUpdateData.year;
        
        // Track current year breakdown
        progressionInfo.currentYearBreakdown[currentYear] = (progressionInfo.currentYearBreakdown[currentYear] || 0) + 1;
        
        if (currentYear !== newYear) {
          progressionInfo.yearProgression++;
        }
        
        if (newYear === "IV" && currentYear === "III") {
          progressionInfo.autoCompleted++;
        }
      }
      
      if (bulkUpdateData.semester) {
        const currentYear = student.Year;
        const newSemester = bulkUpdateData.semester;
        
        if (newSemester === "8" && currentYear === "IV") {
          progressionInfo.autoCompleted++;
        }
      }
    });
    
    return progressionInfo;
  };

  // Handle smart progression
  const handleSmartProgression = (targetYear) => {
    const yearSemesterMap = {
      "II": "3",
      "III": "5", 
      "IV": "7"
    };
    
    setBulkUpdateData(prev => ({
      ...prev,
      year: targetYear,
      semester: yearSemesterMap[targetYear] || prev.semester
    }));
  };

  // Handle semester progression
  const handleSemesterProgression = (targetSemester) => {
    setBulkUpdateData(prev => ({
      ...prev,
      semester: targetSemester
    }));
  };

  // Auto-progress all students to next year
  const handleAutoProgress = () => {
    const studentsToUpdate = students.filter(student => 
      selectedStudents.includes(student.id)
    );
    
    const yearProgression = {
      "I": "II",
      "II": "III", 
      "III": "IV"
    };
    
    const semesterProgression = {
      "I": "3",
      "II": "5",
      "III": "7"
    };
    
    // Find the most common current year among selected students
    const yearCounts = {};
    studentsToUpdate.forEach(student => {
      yearCounts[student.Year] = (yearCounts[student.Year] || 0) + 1;
    });
    
    const mostCommonYear = Object.keys(yearCounts).reduce((a, b) => 
      yearCounts[a] > yearCounts[b] ? a : b
    );
    
    if (yearProgression[mostCommonYear]) {
      const nextYear = yearProgression[mostCommonYear];
      const nextSemester = semesterProgression[mostCommonYear];
      
      setBulkUpdateData(prev => ({
        ...prev,
        year: nextYear,
        semester: nextSemester
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 sm:p-3 rounded-full">
                <FontAwesomeIcon icon={faUserGraduate} className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Student Management</h1>
                <p className="text-sm sm:text-base text-gray-600">Manage and update student information</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowAddStudent(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span className="hidden sm:inline">Add Student</span>
                <span className="sm:hidden">Add</span>
              </button>
              <div className="relative group">
                <button
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  <span className="hidden sm:inline">Export</span>
                  <span className="sm:hidden">Export</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={exportToExcel}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <FontAwesomeIcon icon={faFileExcel} className="text-green-600" />
                      <span>Export to Excel (CSV)</span>
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <FontAwesomeIcon icon={faFilePdf} className="text-red-600" />
                      <span>Export to PDF (HTML)</span>
                    </button>
                    <button
                      onClick={exportStudents}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <FontAwesomeIcon icon={faDownload} className="text-blue-600" />
                      <span>Export to JSON</span>
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowBulkUpdate(true)}
                disabled={selectedStudents.length === 0}
                className={`px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base ${
                  selectedStudents.length > 0
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FontAwesomeIcon icon={faUsers} />
                <span className="hidden sm:inline">Bulk Update ({selectedStudents.length})</span>
                <span className="sm:hidden">Bulk ({selectedStudents.length})</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">Total Students</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-800">{stats.total}</p>
                </div>
                <FontAwesomeIcon icon={faUsers} className="text-blue-500 text-lg sm:text-xl" />
              </div>
            </div>
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-green-600 font-medium">Active Students</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-800">{stats.active}</p>
                </div>
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-lg sm:text-xl" />
              </div>
            </div>
            <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-yellow-600 font-medium">Inactive Students</p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-800">{stats.inactive}</p>
                </div>
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-lg sm:text-xl" />
              </div>
            </div>
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-purple-600 font-medium">Graduated</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-800">{stats.graduated}</p>
                </div>
                <FontAwesomeIcon icon={faGraduationCap} className="text-purple-500 text-lg sm:text-xl" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
                  placeholder="Search by name, roll no, email, phone, or department..."
          value={searchTerm}
          onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
        />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">All Years</option>
            <option value="I">1st Year</option>
            <option value="II">2nd Year</option>
            <option value="III">3rd Year</option>
            <option value="IV">4th Year</option>
          </select>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Semesters</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="transferred">Transferred</option>
              </select>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === "table" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <span className="hidden sm:inline">Table</span>
                  <span className="sm:hidden">📊</span>
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === "cards" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <span className="hidden sm:inline">Cards</span>
                  <span className="sm:hidden">🃏</span>
                </button>
              </div>
            </div>
        </div>
      </div>

      {/* Students Table */}
        {viewMode === "table" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-2 sm:py-4 px-3 sm:px-6 text-left">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedStudents.length === sortedStudents.length && sortedStudents.length > 0}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th 
                      className="py-2 sm:py-4 px-3 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="hidden sm:inline">Name</span>
                        <span className="sm:hidden">Name</span>
                        {sortBy === "name" && (
                          <FontAwesomeIcon 
                            icon={sortOrder === "asc" ? faCheck : faTimes} 
                            className="text-xs"
                          />
                        )}
                      </div>
                    </th>
                    <th 
                      className="py-2 sm:py-4 px-3 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("rollNo")}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="hidden sm:inline">Roll No</span>
                        <span className="sm:hidden">Roll</span>
                        {sortBy === "rollNo" && (
                          <FontAwesomeIcon 
                            icon={sortOrder === "asc" ? faCheck : faTimes} 
                            className="text-xs"
                          />
                        )}
                      </div>
                    </th>
                    <th className="py-2 sm:py-4 px-3 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-700">
                      <span className="hidden sm:inline">Academic Info</span>
                      <span className="sm:hidden">Academic</span>
                    </th>
                    <th className="py-2 sm:py-4 px-3 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-700">
                      <span className="hidden sm:inline">Contact</span>
                      <span className="sm:hidden">Contact</span>
                    </th>
                    <th className="py-2 sm:py-4 px-3 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-700">Status</th>
                    <th className="py-2 sm:py-4 px-3 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-700">
                      <span className="hidden sm:inline">Actions</span>
                      <span className="sm:hidden">Actions</span>
                    </th>
            </tr>
          </thead>
          <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <span className="text-sm sm:text-base">Loading students...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sortedStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">
                        <span className="text-sm sm:text-base">No students found matching your criteria.</span>
                      </td>
                    </tr>
                  ) : (
                    sortedStudents.map((student) => (
              <tr
                key={student.id}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        <td className="py-2 sm:py-4 px-3 sm:px-6">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleSelectStudent(student.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-2 sm:py-4 px-3 sm:px-6">
                          <div>
                            <div className="font-medium text-gray-900 text-sm sm:text-base">{student.name}</div>
                            {student.fatherName && (
                              <div className="text-xs sm:text-sm text-gray-500">Father: {student.fatherName}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-2 sm:py-4 px-3 sm:px-6 text-gray-900 font-medium text-sm sm:text-base">{student.rollNo}</td>
                        <td className="py-2 sm:py-4 px-3 sm:px-6">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {student.Year || 'N/A'}
                              </span>
                              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {student.Section || 'N/A'}
                              </span>
                            </div>
                            {student.Semester && (
                              <div className="text-xs sm:text-sm text-gray-500">Sem: {student.Semester}</div>
                            )}
                            {student.department && (
                              <div className="text-xs sm:text-sm text-gray-500 truncate max-w-32 sm:max-w-none">{student.department}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-2 sm:py-4 px-3 sm:px-6">
                          <div className="space-y-1">
                            <div className="text-xs sm:text-sm text-gray-900 truncate max-w-32 sm:max-w-none">{student.email || 'N/A'}</div>
                            <div className="text-xs sm:text-sm text-gray-600">{student.phone || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="py-2 sm:py-4 px-3 sm:px-6">
                          <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.status === 'active' ? 'bg-green-100 text-green-800' :
                            student.status === 'inactive' ? 'bg-red-100 text-red-800' :
                            student.status === 'graduated' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {student.status || 'active'}
                          </span>
                        </td>
                        <td className="py-2 sm:py-4 px-3 sm:px-6">
                          <div className="flex space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="text-green-600 hover:text-green-800 p-1 sm:p-2 rounded-lg hover:bg-green-50 transition-colors"
                              title="View Details"
                            >
                              <FontAwesomeIcon icon={faEye} className="text-sm sm:text-base" />
                            </button>
                  <button
                    onClick={() => handleViewClick(student)}
                              className="text-blue-600 hover:text-blue-800 p-1 sm:p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Edit"
                  >
                              <FontAwesomeIcon icon={faEdit} className="text-sm sm:text-base" />
                  </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="text-red-600 hover:text-red-800 p-1 sm:p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-sm sm:text-base" />
                            </button>
                          </div>
                </td>
              </tr>
                    ))
                  )}
          </tbody>
        </table>
      </div>
          </div>
        )}

        {/* Students Cards View */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              <div className="col-span-full py-8 text-center text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="text-sm sm:text-base">Loading students...</span>
                </div>
              </div>
            ) : sortedStudents.length === 0 ? (
              <div className="col-span-full py-8 text-center text-gray-500">
                <span className="text-sm sm:text-base">No students found matching your criteria.</span>
              </div>
            ) : (
              sortedStudents.map((student) => (
                <div key={student.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{student.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Roll: {student.rollNo}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-2"
                    />
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faGraduationCap} className="text-blue-500 text-xs sm:text-sm" />
                      <span className="text-xs sm:text-sm text-gray-700">
                        {student.Year || 'N/A'} Year, {student.Section || 'N/A'}
                      </span>
                    </div>
                    
                    {student.department && (
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faBuilding} className="text-green-500 text-xs sm:text-sm" />
                        <span className="text-xs sm:text-sm text-gray-700 truncate">{student.department}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faEnvelope} className="text-purple-500 text-xs sm:text-sm" />
                      <span className="text-xs sm:text-sm text-gray-700 truncate">{student.email || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faPhone} className="text-orange-500 text-xs sm:text-sm" />
                      <span className="text-xs sm:text-sm text-gray-700">{student.phone || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' :
                        student.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        student.status === 'graduated' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status || 'active'}
                      </span>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faEye} className="text-xs sm:text-sm" />
                        </button>
                        <button
                          onClick={() => handleViewClick(student)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} className="text-xs sm:text-sm" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs sm:text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-4 text-xs sm:text-sm text-gray-600">
          Showing {sortedStudents.length} of {students.length} students
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </div>

      {/* Edit Student Popup */}
      {showPopup && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Edit Student Details</h2>
              <button
                onClick={handleClosePopup}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {Object.entries(selectedStudent).map(
                ([key, value]) =>
                  key !== "id" &&
                  key !== "path" && (
                    <div key={key} className="flex flex-col">
                                              <label className="font-semibold capitalize text-gray-700 mb-2 text-sm sm:text-base">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        name={key}
                        value={value || ""}
                        onChange={handleEdit}
                        className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  )
              )}
            </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={handleClosePopup}
                  className="bg-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                  className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                  <FontAwesomeIcon icon={faSave} />
                  <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Bulk Update Popup */}
      {showBulkUpdate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Bulk Update Students</h2>
                <button
                  onClick={() => setShowBulkUpdate(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Update {selectedStudents.length} selected students
              </p>
              
              {/* Progression Info */}
              {(() => {
                const progressionInfo = getProgressionInfo();
                if (!progressionInfo) return null;
                
                return (
                  <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-xs sm:text-sm font-semibold text-blue-800 mb-2">Smart Progression Preview:</h3>
                    <div className="space-y-1 text-xs sm:text-sm text-blue-700">
                      {progressionInfo.yearProgression > 0 && (
                        <div>• {progressionInfo.yearProgression} students will progress to new year</div>
                      )}
                      {progressionInfo.autoCompleted > 0 && (
                        <div>• {progressionInfo.autoCompleted} students will be automatically marked as completed</div>
                      )}
                      {progressionInfo.semesterProgression > 0 && (
                        <div>• {progressionInfo.semesterProgression} students will progress to new semester</div>
                      )}
                      {Object.keys(progressionInfo.currentYearBreakdown).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <div className="text-xs font-medium text-blue-600 mb-1">Current Year Breakdown:</div>
                          {Object.entries(progressionInfo.currentYearBreakdown).map(([year, count]) => (
                            <div key={year} className="text-xs text-blue-600">
                              • {count} students from {year} Year
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Smart Progression Buttons */}
                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Quick Progression
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSmartProgression("II")}
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <span className="hidden sm:inline">1st → 2nd Year</span>
                      <span className="sm:hidden">1→2</span>
                    </button>
                    <button
                      onClick={() => handleSmartProgression("III")}
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <span className="hidden sm:inline">2nd → 3rd Year</span>
                      <span className="sm:hidden">2→3</span>
                    </button>
                    <button
                      onClick={() => handleSmartProgression("IV")}
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <span className="hidden sm:inline">3rd → 4th Year</span>
                      <span className="sm:hidden">3→4</span>
                    </button>
                    <button
                      onClick={() => setBulkUpdateData(prev => ({ ...prev, status: "graduated" }))}
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                    >
                      <span className="hidden sm:inline">Mark Graduated</span>
                      <span className="sm:hidden">Graduate</span>
                    </button>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={handleAutoProgress}
                      className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                    >
                      <span className="hidden sm:inline">🚀 Auto-Progress to Next Year</span>
                      <span className="sm:hidden">🚀 Auto-Progress</span>
                    </button>
                  </div>
                </div>
                
                                 <div>
                   <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                     Year
                   </label>
                   <select
                     value={bulkUpdateData.year}
                     onChange={(e) => setBulkUpdateData(prev => ({ ...prev, year: e.target.value }))}
                     className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                   >
                     <option value="">Keep Current</option>
                     <option value="I">1st Year</option>
                     <option value="II">2nd Year</option>
                     <option value="III">3rd Year</option>
                     <option value="IV">4th Year</option>
                   </select>
                 </div>
                                                   <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Semester
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-2 gap-1 sm:gap-2 mb-2">
                      <button
                        onClick={() => handleSemesterProgression("1")}
                        className="px-1 sm:px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Sem 1
                      </button>
                      <button
                        onClick={() => handleSemesterProgression("2")}
                        className="px-1 sm:px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Sem 2
                      </button>
                      <button
                        onClick={() => handleSemesterProgression("3")}
                        className="px-1 sm:px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Sem 3
                      </button>
                      <button
                        onClick={() => handleSemesterProgression("4")}
                        className="px-1 sm:px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Sem 4
                      </button>
                      <button
                        onClick={() => handleSemesterProgression("5")}
                        className="px-1 sm:px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Sem 5
                      </button>
                      <button
                        onClick={() => handleSemesterProgression("6")}
                        className="px-1 sm:px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Sem 6
                      </button>
                      <button
                        onClick={() => handleSemesterProgression("7")}
                        className="px-1 sm:px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Sem 7
                      </button>
                      <button
                        onClick={() => handleSemesterProgression("8")}
                        className="px-1 sm:px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-medium"
                      >
                        <span className="hidden sm:inline">Sem 8 (Final)</span>
                        <span className="sm:hidden">Sem 8</span>
                      </button>
                    </div>
                    <select
                      value={bulkUpdateData.semester}
                      onChange={(e) => setBulkUpdateData(prev => ({ ...prev, semester: e.target.value }))}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">Keep Current</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                      <option value="3">Semester 3</option>
                      <option value="4">Semester 4</option>
                      <option value="5">Semester 5</option>
                      <option value="6">Semester 6</option>
                      <option value="7">Semester 7</option>
                      <option value="8">Semester 8</option>
                    </select>
                  </div>
                                 <div>
                   <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                     Section
                   </label>
                   <select
                     value={bulkUpdateData.section}
                     onChange={(e) => setBulkUpdateData(prev => ({ ...prev, section: e.target.value }))}
                     className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                   >
                     <option value="">Keep Current</option>
                     <option value="A">Section A</option>
                     <option value="B">Section B</option>
                     <option value="C">Section C</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                     Status
                   </label>
                   <select
                     value={bulkUpdateData.status}
                     onChange={(e) => setBulkUpdateData(prev => ({ ...prev, status: e.target.value }))}
                     className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                   >
                     <option value="">Keep Current</option>
                     <option value="active">Active</option>
                     <option value="inactive">Inactive</option>
                     <option value="graduated">Graduated</option>
                     <option value="transferred">Transferred</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                     Department
                   </label>
                   <select
                     value={bulkUpdateData.department}
                     onChange={(e) => setBulkUpdateData(prev => ({ ...prev, department: e.target.value }))}
                     className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                   >
                     <option value="">Keep Current</option>
                     <option value="Computer Science">Computer Science</option>
                     <option value="Electrical Engineering">Electrical Engineering</option>
                     <option value="Mechanical Engineering">Mechanical Engineering</option>
                     <option value="Civil Engineering">Civil Engineering</option>
                     <option value="Information Technology">Information Technology</option>
                     <option value="Electronics">Electronics</option>
                   </select>
                 </div>
              </div>
                             <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                 <button
                   onClick={() => setShowBulkUpdate(false)}
                   className="bg-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleBulkUpdate}
                   disabled={loading}
                   className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                 >
                   {loading ? (
                     <>
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                       <span>Updating...</span>
                     </>
                   ) : (
                     <>
                       <FontAwesomeIcon icon={faSave} />
                       <span>Update Students</span>
                     </>
                   )}
                 </button>
               </div>
            </div>
          </div>
        </div>
              )}

        {/* Add Student Modal */}
        {showAddStudent && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Add New Student</h2>
                  <button
                    onClick={() => setShowAddStudent(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={newStudent.name}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number *</label>
                    <input
                      type="text"
                      name="rollNo"
                      value={newStudent.rollNo}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={newStudent.email}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={newStudent.phone}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                    <select
                      name="Year"
                      value={newStudent.Year}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="I">1st Year</option>
                      <option value="II">2nd Year</option>
                      <option value="III">3rd Year</option>
                      <option value="IV">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                    <select
                      name="Section"
                      value={newStudent.Section}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Section</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                    <select
                      name="Semester"
                      value={newStudent.Semester}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Semester</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                      <option value="3">Semester 3</option>
                      <option value="4">Semester 4</option>
                      <option value="5">Semester 5</option>
                      <option value="6">Semester 6</option>
                      <option value="7">Semester 7</option>
                      <option value="8">Semester 8</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      name="department"
                      value={newStudent.department}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics">Electronics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={newStudent.dateOfBirth}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={newStudent.bloodGroup}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      name="address"
                      value={newStudent.address}
                      onChange={handleNewStudentChange}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={newStudent.fatherName}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                    <input
                      type="text"
                      name="motherName"
                      value={newStudent.motherName}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      value={newStudent.emergencyContact}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date</label>
                    <input
                      type="date"
                      name="admissionDate"
                      value={newStudent.admissionDate}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mentor Name</label>
                    <input
                      type="text"
                      name="mentorName"
                      value={newStudent.mentorName}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mentor Email</label>
                    <input
                      type="email"
                      name="mentorEmail"
                      value={newStudent.mentorEmail}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mentor Phone</label>
                    <input
                      type="tel"
                      name="mentorPhone"
                      value={newStudent.mentorPhone}
                      onChange={handleNewStudentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddStudent(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddStudent}
                    disabled={loading}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} />
                        <span>Add Student</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Details Modal */}
        {showStudentDetails && selectedStudent && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Student Details</h2>
                  <button
                    onClick={() => setShowStudentDetails(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-gray-900 font-medium">{selectedStudent.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Roll Number</label>
                      <p className="text-gray-900">{selectedStudent.rollNo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                      <p className="text-gray-900">{selectedStudent.dateOfBirth || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Blood Group</label>
                      <p className="text-gray-900">{selectedStudent.bloodGroup || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Academic Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Year</label>
                      <p className="text-gray-900">{selectedStudent.Year || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Section</label>
                      <p className="text-gray-900">{selectedStudent.Section || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Semester</label>
                      <p className="text-gray-900">{selectedStudent.Semester || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Department</label>
                      <p className="text-gray-900">{selectedStudent.department || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedStudent.status === 'active' ? 'bg-green-100 text-green-800' :
                        selectedStudent.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        selectedStudent.status === 'graduated' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedStudent.status || 'active'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedStudent.email || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedStudent.phone || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Emergency Contact</label>
                      <p className="text-gray-900">{selectedStudent.emergencyContact || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Address</label>
                      <p className="text-gray-900">{selectedStudent.address || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Family Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Father's Name</label>
                      <p className="text-gray-900">{selectedStudent.fatherName || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Mother's Name</label>
                      <p className="text-gray-900">{selectedStudent.motherName || 'Not specified'}</p>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-6">Mentor Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Mentor Name</label>
                      <p className="text-gray-900">{selectedStudent.mentorName || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Mentor Email</label>
                      <p className="text-gray-900">{selectedStudent.mentorEmail || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Mentor Phone</label>
                      <p className="text-gray-900">{selectedStudent.mentorPhone || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowStudentDetails(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
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

export default Students;
