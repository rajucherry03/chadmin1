import React, { useState } from 'react';
import { DJANGO_BASE_URL } from '../config/apiConfig';

const DjangoBackendTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setTestResults({});

    try {
      // Test 1: Basic connectivity
      console.log('Testing basic connectivity to:', DJANGO_BASE_URL);
      const response = await fetch(`${DJANGO_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const basicTest = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: `${DJANGO_BASE_URL}/`,
        headers: Object.fromEntries(response.headers.entries()),
      };

      if (response.ok) {
        try {
          basicTest.data = await response.json();
        } catch (e) {
          basicTest.data = await response.text();
        }
      } else {
        try {
          basicTest.error = await response.json();
        } catch (e) {
          basicTest.error = await response.text();
        }
      }

      setTestResults(prev => ({ ...prev, basicConnectivity: basicTest }));

      // Test 2: Students endpoint without auth
      console.log('Testing students endpoint without auth...');
      const studentsResponse = await fetch(`${DJANGO_BASE_URL}/v1/students/students/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const studentsTest = {
        status: studentsResponse.status,
        statusText: studentsResponse.statusText,
        ok: studentsResponse.ok,
        url: `${DJANGO_BASE_URL}/v1/students/students/`,
        headers: Object.fromEntries(studentsResponse.headers.entries()),
      };

      if (studentsResponse.ok) {
        try {
          studentsTest.data = await studentsResponse.json();
        } catch (e) {
          studentsTest.data = await studentsResponse.text();
        }
      } else {
        try {
          studentsTest.error = await studentsResponse.json();
        } catch (e) {
          studentsTest.error = await studentsResponse.text();
        }
      }

      setTestResults(prev => ({ ...prev, studentsEndpoint: studentsTest }));

      // Test 3: Students endpoint with auth (if token exists)
      const token = localStorage.getItem('django_token') || localStorage.getItem('access_token');
      if (token) {
        console.log('Testing students endpoint with auth...');
        const authStudentsResponse = await fetch(`${DJANGO_BASE_URL}/v1/students/students/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const authStudentsTest = {
          status: authStudentsResponse.status,
          statusText: authStudentsResponse.statusText,
          ok: authStudentsResponse.ok,
          url: `${DJANGO_BASE_URL}/v1/students/students/`,
          headers: Object.fromEntries(authStudentsResponse.headers.entries()),
          tokenUsed: `${token.substring(0, 20)}...`,
        };

        if (authStudentsResponse.ok) {
          try {
            authStudentsTest.data = await authStudentsResponse.json();
          } catch (e) {
            authStudentsTest.data = await authStudentsResponse.text();
          }
        } else {
          try {
            authStudentsTest.error = await authStudentsResponse.json();
          } catch (e) {
            authStudentsTest.error = await authStudentsResponse.text();
          }
        }

        setTestResults(prev => ({ ...prev, studentsEndpointWithAuth: authStudentsTest }));
      } else {
        setTestResults(prev => ({ 
          ...prev, 
          studentsEndpointWithAuth: { 
            error: 'No authentication token found in localStorage',
            tokenCheck: {
              django_token: localStorage.getItem('django_token') ? 'Present' : 'Missing',
              access_token: localStorage.getItem('access_token') ? 'Present' : 'Missing',
            }
          } 
        }));
      }

    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        networkError: { 
          message: error.message,
          type: 'Network Error',
          baseURL: DJANGO_BASE_URL
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Django Backend Connection Test</h1>
          <p className="text-blue-100">Test connectivity to Django backend and identify issues</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Configuration Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Base URL:</strong> {DJANGO_BASE_URL}
              </div>
              <div>
                <strong>Environment:</strong> {DJANGO_BASE_URL.includes('localhost') || DJANGO_BASE_URL.includes('127.0.0.1') ? 'Development' : 'Production'}
              </div>
              <div>
                <strong>Django Token:</strong> {localStorage.getItem('django_token') ? 'Present' : 'Missing'}
              </div>
              <div>
                <strong>Access Token:</strong> {localStorage.getItem('access_token') ? 'Present' : 'Missing'}
              </div>
            </div>
          </div>

          {/* Test Button */}
          <div className="text-center">
            <button
              onClick={testBackendConnection}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Testing...' : 'Test Backend Connection'}
            </button>
          </div>

          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Testing backend connection...</p>
            </div>
          )}

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Test Results</h2>
              
              {testResults.basicConnectivity && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-600 mb-2">Basic Connectivity Test</h3>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(testResults.basicConnectivity, null, 2)}
                  </pre>
                </div>
              )}

              {testResults.studentsEndpoint && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-600 mb-2">Students Endpoint (No Auth)</h3>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(testResults.studentsEndpoint, null, 2)}
                  </pre>
                </div>
              )}

              {testResults.studentsEndpointWithAuth && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-600 mb-2">Students Endpoint (With Auth)</h3>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(testResults.studentsEndpointWithAuth, null, 2)}
                  </pre>
                </div>
              )}

              {testResults.networkError && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-600 mb-2">Network Error</h3>
                  <pre className="bg-gray-800 text-red-400 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(testResults.networkError, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Troubleshooting Guide */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting Guide</h3>
            <div className="text-yellow-700 space-y-2 text-sm">
              <div><strong>If you see "Network Error":</strong></div>
              <ul className="ml-4 space-y-1">
                <li>• Check if Django backend is running on the correct port</li>
                <li>• Verify the base URL in apiConfig.js matches your Django server</li>
                <li>• Check firewall settings</li>
              </ul>
              
              <div><strong>If you see "401 Unauthorized":</strong></div>
              <ul className="ml-4 space-y-1">
                <li>• Login to get a valid authentication token</li>
                <li>• Check if token has expired</li>
                <li>• Verify Django authentication is properly configured</li>
              </ul>
              
              <div><strong>If you see "404 Not Found":</strong></div>
              <ul className="ml-4 space-y-1">
                <li>• Check if Django URL patterns include the students endpoint</li>
                <li>• Verify the endpoint path is correct</li>
                <li>• Check Django urls.py configuration</li>
              </ul>
              
              <div><strong>If you see "CORS Error":</strong></div>
              <ul className="ml-4 space-y-1">
                <li>• Add your frontend domain to Django CORS settings</li>
                <li>• Install and configure django-cors-headers</li>
                <li>• Check CORS_ALLOWED_ORIGINS in Django settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DjangoBackendTest;
