import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck, faSave, faUndo, faUserPlus, faTimes, faSpinner, faSearch } from "@fortawesome/free-solid-svg-icons";
import { db } from "../../firebase";
import { doc, updateDoc, writeBatch, addDoc, collection, serverTimestamp, onSnapshot } from "firebase/firestore";

const StudentPortal = ({ students = [], filters }) => {
  // Live fetch when Department/Year/Section are provided to ensure data shows from nested path
  const [classStudents, setClassStudents] = useState(students);
  const [loading, setLoading] = useState(false);
  const [dept, setDept] = useState(filters?.department || "");
  const [year, setYear] = useState(filters?.year || "");
  const [section, setSection] = useState(filters?.section || "");
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkAction, setBulkAction] = useState("enable");

  // Minimal defaults used when enabling access
  const defaultAccessLevel = "standard";
  const defaultEnabledFeatures = ["profile", "notifications"];

  // Sample portal access data
  const samplePortalAccess = [
    {
      id: 1,
      studentId: students[0]?.id,
      studentName: students[0]?.name || `${students[0]?.firstName || ''} ${students[0]?.lastName || ''}`.trim(),
      accessLevel: "standard",
      status: "active",
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      loginCount: 15,
      enabledFeatures: ["profile", "academics", "attendance", "notifications"],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    },
    {
      id: 2,
      studentId: students[1]?.id,
      studentName: students[1]?.name || `${students[1]?.firstName || ''} ${students[1]?.lastName || ''}`.trim(),
      accessLevel: "basic",
      status: "inactive",
      lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      loginCount: 3,
      enabledFeatures: ["profile", "notifications"],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
    }
  ];

  // (Optional) could preload portal access here if needed

  // If filters specify a nested class path, stream from Firestore: students/{dept}/{year-section}
  // keep local selectors in sync when parent filters change
  useEffect(() => {
    if (filters?.department !== undefined) setDept(filters.department || "");
    if (filters?.year !== undefined) setYear(filters.year || "");
    if (filters?.section !== undefined) setSection(filters.section || "");
  }, [filters?.department, filters?.year, filters?.section]);

  // derive department dropdown options from available data
  useEffect(() => {
    const fromStudents = (students || []).map(s => s.department).filter(Boolean);
    const fromClass = (classStudents || []).map(s => s.department).filter(Boolean);
    const unique = Array.from(new Set([...fromStudents, ...fromClass]));
    setDepartmentOptions(unique.length ? unique : ["CSEDS", "CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"]);
  }, [students, classStudents]);

  useEffect(() => {
    if (!dept || !year || !section) {
      setClassStudents(students);
      return;
    }
    setLoading(true);
    let unsub = null;
    try {
      const yearSection = `${year}-${section}`;
      unsub = onSnapshot(collection(db, 'students', dept, yearSection), (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data(), _dept: dept, _year: year, _section: section }));
        setClassStudents(list);
        setLoading(false);
      }, (err) => {
        console.error('StudentPortal fetch error', err);
        setClassStudents([]);
        setLoading(false);
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
    return () => { if (unsub) unsub(); };
  }, [dept, year, section, students]);

  // Select all students
  const selectAllStudents = () => {
    setSelectedStudents((classStudents || []).map(s => s.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStudents([]);
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Update portal access
  const updatePortalAccess = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    setIsUpdating(true);

    try {
      for (const studentId of selectedStudents) {
        const student = students.find(s => s.id === studentId);
        const accessRecord = {
          studentId,
          studentName: student?.name || `${student?.firstName || ''} ${student?.lastName || ''}`.trim(),
          accessLevel: defaultAccessLevel,
          status: bulkAction === "enable" ? "active" : "inactive",
          lastLogin: null,
          loginCount: 0,
          enabledFeatures: defaultEnabledFeatures,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Create or update via collection; for simplicity, just add a new record
        await addDoc(collection(db, "studentPortalAccess"), {
          ...accessRecord,
          createdAt: serverTimestamp()
        });
      }

      alert("Portal access updated successfully!");
      setSelectedStudents([]);
      setIsUpdating(false);
    } catch (error) {
      console.error("Error updating portal access:", error);
      alert("Error updating portal access. Please try again.");
      setIsUpdating(false);
    }
  };

  // Export portal access data
  const exportPortalData = () => {
    const csvContent = [
      "Student Name,Roll Number,Access Level,Status,Last Login,Login Count,Enabled Features",
      ...portalAccess.map(access => 
        `"${access.studentName}","${students.find(s => s.id === access.studentId)?.rollNo || ''}","${access.accessLevel}","${access.status}","${access.lastLogin ? access.lastLogin.toLocaleDateString() : 'Never'}","${access.loginCount}","${access.enabledFeatures.join(', ')}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portal_access_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Delete portal access
  const deletePortalAccess = async (accessId) => {
    if (window.confirm("Are you sure you want to delete this portal access?")) {
      try {
        setPortalAccess(prev => prev.filter(access => access.id !== accessId));
        alert("Portal access deleted successfully!");
      } catch (error) {
        console.error("Error deleting portal access:", error);
        alert("Error deleting portal access. Please try again.");
      }
    }
  };

  // Simple filtered view of loaded students
  const visibleStudents = classStudents.filter(s => {
    const name = (s.name || `${s.firstName || ''} ${s.lastName || ''}`).toLowerCase();
    const roll = (s.rollNo || '').toString().toLowerCase();
    const email = (s.email || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return name.includes(q) || roll.includes(q) || email.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <FontAwesomeIcon icon={faUserCheck} className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Student Portal</h2>
            <p className="text-gray-600">Enable or disable portal access for class students</p>
          </div>
        </div>
      </div>

      {/* Student Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Select Students ({selectedStudents.length} selected)
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={selectAllStudents}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
            >
              <FontAwesomeIcon icon={faUserPlus} />
              <span>Select All</span>
            </button>
            <button
              onClick={clearSelection}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
            >
              <FontAwesomeIcon icon={faUndo} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, roll no, or email..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {visibleStudents.map(student => (
            <div
              key={student.id}
              onClick={() => toggleStudentSelection(student.id)}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedStudents.includes(student.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => toggleStudentSelection(student.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {student.rollNo} • {student.department || dept}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Class Selectors (fully dynamic) */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Selection</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={dept}
              onChange={(e)=>setDept(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select</option>
              {departmentOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={year}
              onChange={(e)=>setYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select</option>
              <option value="I">I</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <select
              value={section}
              onChange={(e)=>setSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select</option>
              {['A','B','C','D','E','F'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {!dept || !year || !section ? (
          <p className="mt-3 text-sm text-gray-500">Tip: Choose Department, Year and Section to load students from nested class path.</p>
        ) : (
          <p className="mt-3 text-sm text-gray-600">Streaming from <span className="font-mono">students/{dept}/{`${year}-${section}`}</span> — {loading ? 'loading…' : `${classStudents.length} students`}</p>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
          
          <div className="flex items-center space-x-4">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="enable">Enable Portal Access</option>
              <option value="disable">Disable Portal Access</option>
            </select>

            <button
              onClick={updatePortalAccess}
              disabled={isUpdating}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={isUpdating ? faSpinner : faSave} className={isUpdating ? 'animate-spin' : ''} />
              <span>{isUpdating ? 'Updating...' : 'Apply Changes'}</span>
            </button>
          </div>
        </div>
      )}
      {/* End simplified portal */}
    </div>
  );
};

export default StudentPortal;
