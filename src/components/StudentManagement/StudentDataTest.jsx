import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faSpinner, faDatabase } from '@fortawesome/free-solid-svg-icons';
import studentApiService from '../../services/studentApiService';

const StudentDataTest = () => {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results = {};

    // Test 1: Get Students
    try {
      console.log('Testing getStudents...');
      const studentsData = await studentApiService.getStudents();
      results.getStudents = { 
        success: true, 
        data: studentsData,
        count: Array.isArray(studentsData) ? studentsData.length : 0
      };
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      results.getStudents = { success: false, error: error.message };
      console.error('getStudents test failed:', error);
    }

    // Test 2: Get Student Stats
    try {
      console.log('Testing getStudentStats...');
      const statsData = await studentApiService.getStudentStats();
      results.getStats = { success: true, data: statsData };
      setStats(statsData);
    } catch (error) {
      results.getStats = { success: false, error: error.message };
      console.error('getStats test failed:', error);
    }

    setTestResults(results);
    setTesting(false);
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const studentsData = await studentApiService.getStudents();
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (success) => {
    if (success === undefined) return null;
    return success ? (
      <FontAwesomeIcon icon={faCheck} className="text-green-500" />
    ) : (
      <FontAwesomeIcon icon={faTimes} className="text-red-500" />
    );
  };

  const getStatusColor = (success) => {
    if (success === undefined) return 'bg-gray-100 text-gray-800';
    return success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Student Data Test</h2>
        <div className="space-x-2">
          <button
            onClick={runTests}
            disabled={testing}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Testing...
              </>
            ) : (
              'Run Tests'
            )}
          </button>
          <button
            onClick={loadStudents}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load Students'
            )}
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Test Results</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(testResults.getStudents?.success)}
                <div>
                  <h4 className="font-medium">Get Students</h4>
                  <p className="text-sm text-gray-600">
                    {testResults.getStudents?.success 
                      ? `Found ${testResults.getStudents?.count || 0} students`
                      : 'Failed to fetch students'
                    }
                  </p>
                  {testResults.getStudents?.error && (
                    <p className="text-sm text-red-600 mt-1">{testResults.getStudents.error}</p>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(testResults.getStudents?.success)}`}>
                {testResults.getStudents?.success === undefined ? 'Not Tested' : testResults.getStudents.success ? 'Success' : 'Failed'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(testResults.getStats?.success)}
                <div>
                  <h4 className="font-medium">Get Student Stats</h4>
                  <p className="text-sm text-gray-600">
                    {testResults.getStats?.success ? 'Statistics loaded successfully' : 'Failed to load statistics'}
                  </p>
                  {testResults.getStats?.error && (
                    <p className="text-sm text-red-600 mt-1">{testResults.getStats.error}</p>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(testResults.getStats?.success)}`}>
                {testResults.getStats?.success === undefined ? 'Not Tested' : testResults.getStats.success ? 'Success' : 'Failed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Display */}
      {stats && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Student Statistics</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-600">Total Students</h4>
                <p className="text-2xl font-bold text-blue-900">{stats.total_students || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-600">Active Students</h4>
                <p className="text-2xl font-bold text-green-900">{stats.active_students || 0}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-600">New Admissions</h4>
                <p className="text-2xl font-bold text-purple-900">{stats.new_admissions || 0}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-orange-600">Pending Documents</h4>
                <p className="text-2xl font-bold text-orange-900">{stats.pending_documents || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Students List ({students.length})</h3>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-blue-500" />
              <p className="mt-2 text-gray-600">Loading students...</p>
            </div>
          ) : students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.roll_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faDatabase} className="text-4xl text-gray-400 mb-4" />
              <p className="text-gray-600">No students found</p>
              <p className="text-sm text-gray-500 mt-2">
                The system uses Django API endpoints for all student data operations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDataTest;
