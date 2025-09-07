import React, { useState, useEffect } from 'react';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';
import { DJANGO_BASE_URL } from '../config/apiConfig';
import studentApiService from '../services/studentApiService';
import { getStudents } from '../utils/djangoAuthHelpers';

const StudentFetchDebugger = () => {
  const { isAuthenticated, user, token } = useDjangoAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Gather debug information
    const info = {
      isAuthenticated,
      user: user ? { id: user.id, username: user.username, email: user.email } : null,
      token: token ? `${token.substring(0, 20)}...` : null,
      baseURL: DJANGO_BASE_URL,
      localStorage: {
        django_token: localStorage.getItem('django_token') ? 'Present' : 'Missing',
        access_token: localStorage.getItem('access_token') ? 'Present' : 'Missing',
        refresh_token: localStorage.getItem('refresh_token') ? 'Present' : 'Missing',
      },
      timestamp: new Date().toISOString()
    };
    setDebugInfo(info);
  }, [isAuthenticated, user, token]);

  const testDirectAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${DJANGO_BASE_URL}/v1/students/students/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('django_token')}`,
        },
      });
      
      const result = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data: null,
        error: null
      };

      if (response.ok) {
        result.data = await response.json();
      } else {
        try {
          result.error = await response.json();
        } catch (e) {
          result.error = await response.text();
        }
      }

      setTestResults(prev => ({ ...prev, directAPI: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        directAPI: { 
          error: error.message, 
          type: 'Network Error' 
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const testDjangoAuthService = async () => {
    setLoading(true);
    try {
      const result = await getStudents({});
      setTestResults(prev => ({ ...prev, djangoAuthService: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        djangoAuthService: { 
          success: false, 
          error: error.message 
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const testStudentApiService = async () => {
    setLoading(true);
    try {
      const result = await studentApiService.getStudents({});
      setTestResults(prev => ({ ...prev, studentApiService: { success: true, data: result } }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        studentApiService: { 
          success: false, 
          error: error.message 
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults({});
    await testDirectAPI();
    await testDjangoAuthService();
    await testStudentApiService();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Student Fetch Debugger</h1>
          <p className="text-red-100">Debug tool for troubleshooting student fetching issues</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Debug Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Debug Information</h2>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {/* Test Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testDirectAPI}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Test Direct API
            </button>
            <button
              onClick={testDjangoAuthService}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Test Django Auth Service
            </button>
            <button
              onClick={testStudentApiService}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Test Student API Service
            </button>
            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              Run All Tests
            </button>
          </div>

          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Running tests...</p>
            </div>
          )}

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Test Results</h2>
              
              {testResults.directAPI && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-600 mb-2">Direct API Test</h3>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(testResults.directAPI, null, 2)}
                  </pre>
                </div>
              )}

              {testResults.djangoAuthService && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-600 mb-2">Django Auth Service Test</h3>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(testResults.djangoAuthService, null, 2)}
                  </pre>
                </div>
              )}

              {testResults.studentApiService && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-600 mb-2">Student API Service Test</h3>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(testResults.studentApiService, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Common Issues & Solutions</h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>• <strong>401 Unauthorized:</strong> Check if authentication token is valid and not expired</li>
              <li>• <strong>404 Not Found:</strong> Verify Django backend is running and endpoint exists</li>
              <li>• <strong>CORS Error:</strong> Check Django CORS settings allow your frontend domain</li>
              <li>• <strong>Network Error:</strong> Verify Django backend URL is correct and accessible</li>
              <li>• <strong>500 Internal Server Error:</strong> Check Django backend logs for server-side issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFetchDebugger;
