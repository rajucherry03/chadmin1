import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCheck, faSave, faDownload, faUndo, faCheckCircle,
  faExclamationTriangle, faEye, faEdit, faTrash, faPlus,
  faCog, faHistory, faQrcode, faPrint, faShare, faLock,
  faUserPlus, faCopy, faRefresh, faUnlock, faUserShield,
  faTimes, faSpinner, faDesktop, faMobile, faTablet
} from "@fortawesome/free-solid-svg-icons";
import { db } from "../../firebase";
import { doc, updateDoc, writeBatch, addDoc, collection, serverTimestamp } from "firebase/firestore";

const StudentPortal = ({ students }) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [portalSettings, setPortalSettings] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [portalAccess, setPortalAccess] = useState([]);
  const [showAccessHistory, setShowAccessHistory] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [bulkAction, setBulkAction] = useState("enable");

  // Portal features
  const portalFeatures = [
    { id: "profile", name: "Profile Management", description: "Update personal information" },
    { id: "academics", name: "Academic Records", description: "View grades and transcripts" },
    { id: "attendance", name: "Attendance", description: "Check attendance records" },
    { id: "documents", name: "Documents", description: "Access and download documents" },
    { id: "notifications", name: "Notifications", description: "Receive announcements" },
    { id: "calendar", name: "Calendar", description: "View academic calendar" },
    { id: "library", name: "Library", description: "Access library resources" },
    { id: "support", name: "Support", description: "Contact support team" }
  ];

  // Portal access levels
  const accessLevels = [
    { id: "basic", name: "Basic", description: "Essential features only" },
    { id: "standard", name: "Standard", description: "Most features available" },
    { id: "premium", name: "Premium", description: "All features available" },
    { id: "custom", name: "Custom", description: "Select specific features" }
  ];

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

  useEffect(() => {
    setPortalAccess(samplePortalAccess);
  }, [students]);

  // Select all students
  const selectAllStudents = () => {
    setSelectedStudents(students);
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
      const updatedAccess = [];

      for (const studentId of selectedStudents) {
        const student = students.find(s => s.id === studentId);
        const existingAccess = portalAccess.find(access => access.studentId === studentId);

        const accessRecord = {
          id: existingAccess?.id || Date.now() + Math.random(),
          studentId,
          studentName: student?.name || `${student?.firstName || ''} ${student?.lastName || ''}`.trim(),
          accessLevel: portalSettings.accessLevel || "standard",
          status: bulkAction === "enable" ? "active" : "inactive",
          lastLogin: existingAccess?.lastLogin || null,
          loginCount: existingAccess?.loginCount || 0,
          enabledFeatures: portalSettings.enabledFeatures || ["profile", "notifications"],
          createdAt: existingAccess?.createdAt || new Date(),
          updatedAt: new Date()
        };

        updatedAccess.push(accessRecord);

        // Save to database
        try {
          if (existingAccess) {
            // Update existing record
            // await updateDoc(doc(db, "studentPortalAccess", existingAccess.id), accessRecord);
          } else {
            // Create new record
            await addDoc(collection(db, "studentPortalAccess"), {
              ...accessRecord,
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.error("Error saving portal access:", error);
        }
      }

      // Update local state
      const newAccess = [...portalAccess];
      updatedAccess.forEach(access => {
        const index = newAccess.findIndex(a => a.studentId === access.studentId);
        if (index !== -1) {
          newAccess[index] = access;
        } else {
          newAccess.push(access);
        }
      });
      setPortalAccess(newAccess);

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

  // Filter portal access
  const filteredPortalAccess = portalAccess.filter(access => {
    const matchesStatus = filterStatus === "all" || access.status === filterStatus;
    const matchesSearch = access.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         students.find(s => s.id === access.studentId)?.rollNo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const calculateStats = () => {
    const total = portalAccess.length;
    const active = portalAccess.filter(access => access.status === "active").length;
    const inactive = portalAccess.filter(access => access.status === "inactive").length;
    const byLevel = {};

    portalAccess.forEach(access => {
      byLevel[access.accessLevel] = (byLevel[access.accessLevel] || 0) + 1;
    });

    return {
      total,
      active,
      inactive,
      byLevel,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
    };
  };

  const stats = calculateStats();

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
            <p className="text-gray-600">Manage student portal access and settings</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FontAwesomeIcon icon={faCog} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Portal Settings</p>
                <p className="text-sm text-gray-600">Configure portal features</p>
              </div>
            </div>
          </button>

          <button
            onClick={selectAllStudents}
            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <FontAwesomeIcon icon={faUserPlus} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Select All Students</p>
                <p className="text-sm text-gray-600">Choose all students</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowAccessHistory(!showAccessHistory)}
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FontAwesomeIcon icon={faHistory} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Access History</p>
                <p className="text-sm text-gray-600">View login history</p>
              </div>
            </div>
          </button>

          <button
            onClick={exportPortalData}
            className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <FontAwesomeIcon icon={faDownload} className="text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Export Data</p>
                <p className="text-sm text-gray-600">Download access data</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portal Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Access</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-gray-600">Active Users</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            <p className="text-sm text-gray-600">Inactive Users</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{stats.activePercentage}%</p>
            <p className="text-sm text-gray-600">Active Rate</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {students.map(student => (
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
                    {student.rollNo} • {student.department}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
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
              <option value="upgrade">Upgrade Access Level</option>
              <option value="downgrade">Downgrade Access Level</option>
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

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faCog} />
              <span>Portal Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Portal Access List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Portal Access ({filteredPortalAccess.length})
          </h3>
        </div>

        {filteredPortalAccess.length === 0 ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faUserCheck} className="text-gray-400 text-4xl mb-4" />
            <p className="text-gray-500">No portal access records found.</p>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Create First Access</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Access Level</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Login Count</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPortalAccess.map((access) => (
                  <tr key={access.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{access.studentName}</div>
                      <div className="text-xs text-gray-500">
                        {students.find(s => s.id === access.studentId)?.rollNo}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        access.accessLevel === 'premium' ? 'bg-purple-100 text-purple-800' :
                        access.accessLevel === 'standard' ? 'bg-blue-100 text-blue-800' :
                        access.accessLevel === 'basic' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {access.accessLevel}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        access.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <FontAwesomeIcon icon={access.status === 'active' ? faCheckCircle : faTimes} className="mr-1" />
                        {access.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {access.lastLogin ? access.lastLogin.toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {access.loginCount}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => deletePortalAccess(access.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Access"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Portal Settings</h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                  <select
                    value={portalSettings.accessLevel || "standard"}
                    onChange={(e) => setPortalSettings(prev => ({ ...prev, accessLevel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {accessLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.name} - {level.description}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enabled Features</label>
                  <div className="grid grid-cols-2 gap-2">
                    {portalFeatures.map(feature => (
                      <label key={feature.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={portalSettings.enabledFeatures?.includes(feature.id) || false}
                          onChange={(e) => {
                            const currentFeatures = portalSettings.enabledFeatures || [];
                            if (e.target.checked) {
                              setPortalSettings(prev => ({
                                ...prev,
                                enabledFeatures: [...currentFeatures, feature.id]
                              }));
                            } else {
                              setPortalSettings(prev => ({
                                ...prev,
                                enabledFeatures: currentFeatures.filter(f => f !== feature.id)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{feature.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
