import React, { useState, useEffect } from 'react';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';
import { DJANGO_BASE_URL } from '../config/apiConfig';

const StudentFetchTest = () => {
  const { isAuthenticated, user, token, students } = useDjangoAuth();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, result) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Check authentication
      addResult('Authentication Check', {
        isAuthenticated,
        hasUser: !!user,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
        baseURL: DJANGO_BASE_URL
      });

      // Test 2: Direct fetch test
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/v1/students/students/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = response.ok ? await response.json() : await response.text();
        
        addResult('Direct Fetch Test', {
          status: response.status,
          ok: response.ok,
          data: response.ok ? data : null,
          error: !response.ok ? data : null,
          studentCount: response.ok ? (data.results?.length || data.length || 0) : 0
        });
      } catch (error) {
        addResult('Direct Fetch Test', {
          error: error.message,
          success: false
        });
      }

      // Test 3: Context students.getStudents test
      try {
        const result = await students.getStudents({});
        addResult('Context getStudents Test', {
          success: result.success,
          data: result.data,
          error: result.error,
          count: result.count || 0
        });
      } catch (error) {
        addResult('Context getStudents Test', {
          error: error.message,
          success: false
        });
      }

      // Test 4: Test with different parameters
      try {
        const result = await students.getStudents({ page: 1, page_size: 5 });
        addResult('Context getStudents with Params Test', {
          success: result.success,
          data: result.data,
          error: result.error,
          count: result.count || 0
        });
      } catch (error) {
        addResult('Context getStudents with Params Test', {
          error: error.message,
          success: false
        });
      }

    } catch (error) {
      addResult('Test Suite Error', {
        error: error.message,
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Student Fetch Test</h1>
          <p className="text-green-100 mt-1">Quick test of student fetching functionality</p>
        </div>

        <div className="p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={runTests}
              disabled={loading}
              className={`px-6 py-2 rounded-md text-white font-medium transition ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Running Tests...' : 'Run Tests'}
            </button>
            
            <button
              onClick={clearResults}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Clear Results
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              {testResults.map((test, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">{test.test}</h3>
                  
                  {test.result.success !== undefined && (
                    <div className={`inline-block px-2 py-1 rounded text-sm font-medium mb-2 ${
                      test.result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {test.result.success ? 'SUCCESS' : 'FAILED'}
                    </div>
                  )}
                  
                  {test.result.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                      <p className="text-red-800 font-medium">Error:</p>
                      <p className="text-red-700 text-sm">{test.result.error}</p>
                    </div>
                  )}
                  
                  {test.result.data && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 mb-2">
                      <p className="text-green-800 font-medium">Data:</p>
                      <pre className="text-green-700 text-xs overflow-auto max-h-32">
                        {JSON.stringify(test.result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {test.result.studentCount !== undefined && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                      <p className="text-blue-800 font-medium">Student Count: {test.result.studentCount}</p>
                    </div>
                  )}
                  
                  {test.result.status && (
                    <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
                      <p className="text-gray-800 font-medium">Status: {test.result.status}</p>
                    </div>
                  )}
                  
                  <p className="text-gray-500 text-xs">Tested at: {new Date(test.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          {testResults.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <p>No test results yet. Click "Run Tests" to start testing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFetchTest;
