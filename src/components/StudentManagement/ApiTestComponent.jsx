import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import studentApiService from '../../services/studentApiService';

const ApiTestComponent = () => {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);

  const runApiTests = async () => {
    setTesting(true);
    const results = {};

    // Test 1: Get Students
    try {
      const students = await studentApiService.getStudents();
      results.getStudents = { success: true, data: students };
    } catch (error) {
      results.getStudents = { success: false, error: error.message };
    }

    // Test 2: Get Student Stats
    try {
      const stats = await studentApiService.getStudentStats();
      results.getStats = { success: true, data: stats };
    } catch (error) {
      results.getStats = { success: false, error: error.message };
    }

    // Test 3: Get Custom Fields
    try {
      const fields = await studentApiService.getCustomFields();
      results.getCustomFields = { success: true, data: fields };
    } catch (error) {
      results.getCustomFields = { success: false, error: error.message };
    }

    // Test 4: Get Documents
    try {
      const documents = await studentApiService.getDocuments();
      results.getDocuments = { success: true, data: documents };
    } catch (error) {
      results.getDocuments = { success: false, error: error.message };
    }

    // Test 5: Get Enrollment History
    try {
      const enrollments = await studentApiService.getEnrollmentHistory();
      results.getEnrollments = { success: true, data: enrollments };
    } catch (error) {
      results.getEnrollments = { success: false, error: error.message };
    }

    // Test 6: Get Imports
    try {
      const imports = await studentApiService.getImports();
      results.getImports = { success: true, data: imports };
    } catch (error) {
      results.getImports = { success: false, error: error.message };
    }

    // Test 7: Search Students
    try {
      const searchResults = await studentApiService.searchStudents('test');
      results.searchStudents = { success: true, data: searchResults };
    } catch (error) {
      results.searchStudents = { success: false, error: error.message };
    }

    setTestResults(results);
    setTesting(false);
  };

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

  const tests = [
    { key: 'getStudents', name: 'Get Students', description: 'Fetch all students' },
    { key: 'getStats', name: 'Get Student Stats', description: 'Fetch student statistics' },
    { key: 'getCustomFields', name: 'Get Custom Fields', description: 'Fetch custom fields' },
    { key: 'getDocuments', name: 'Get Documents', description: 'Fetch student documents' },
    { key: 'getEnrollments', name: 'Get Enrollment History', description: 'Fetch enrollment records' },
    { key: 'getImports', name: 'Get Import Operations', description: 'Fetch import operations' },
    { key: 'searchStudents', name: 'Search Students', description: 'Search students functionality' }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">API Integration Test</h2>
        <button
          onClick={runApiTests}
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
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Test Results</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {tests.map((test) => {
              const result = testResults[test.key];
              return (
                <div key={test.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result?.success)}
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      <p className="text-sm text-gray-600">{test.description}</p>
                      {result?.error && (
                        <p className="text-sm text-red-600 mt-1">{result.error}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result?.success)}`}>
                    {result?.success === undefined ? 'Not Tested' : result.success ? 'Success' : 'Failed'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* API Configuration Info */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">API Configuration</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Base URL:</strong> {studentApiService.baseURL}</p>
          <p><strong>Authentication:</strong> {studentApiService.isAuthenticated() ? 'Authenticated' : 'Not Authenticated'}</p>
          <p><strong>Token Available:</strong> {studentApiService.token ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default ApiTestComponent;
