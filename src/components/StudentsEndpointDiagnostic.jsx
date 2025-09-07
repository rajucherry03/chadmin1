import React, { useState } from 'react';
import { DJANGO_BASE_URL } from '../config/apiConfig';

const StudentsEndpointDiagnostic = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testStudentsEndpoint = async () => {
    setLoading(true);
    setTestResults({});

    const token = localStorage.getItem('django_token') || localStorage.getItem('access_token');
    
    try {
      // Test the exact endpoint that's failing
      const studentsURL = `${DJANGO_BASE_URL}/v1/students/students/`;
      console.log('Testing students endpoint:', studentsURL);
      
      const response = await fetch(studentsURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = {
        url: studentsURL,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        tokenUsed: token ? `${token.substring(0, 20)}...` : 'No token',
        timestamp: new Date().toISOString()
      };

      if (response.ok) {
        try {
          result.data = await response.json();
          result.studentCount = result.data?.results?.length || result.data?.length || 0;
        } catch (e) {
          result.data = await response.text();
        }
      } else {
        try {
          result.error = await response.json();
        } catch (e) {
          result.error = await response.text();
        }
      }

      setTestResults(prev => ({ ...prev, studentsEndpoint: result }));

      // Test alternative endpoints that might work
      const alternativeEndpoints = [
        `${DJANGO_BASE_URL}/api/v1/students/students/`,
        `${DJANGO_BASE_URL}/students/students/`,
        `${DJANGO_BASE_URL}/v1/students/`,
        `${DJANGO_BASE_URL}/api/students/students/`,
        `${DJANGO_BASE_URL}/students/`,
      ];

      for (const altURL of alternativeEndpoints) {
        try {
          const altResponse = await fetch(altURL, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          const altResult = {
            url: altURL,
            status: altResponse.status,
            statusText: altResponse.statusText,
            ok: altResponse.ok,
          };

          if (altResponse.ok) {
            try {
              altResult.data = await altResponse.json();
              altResult.studentCount = altResult.data?.results?.length || altResult.data?.length || 0;
            } catch (e) {
              altResult.data = await altResponse.text();
            }
          } else {
            try {
              altResult.error = await altResponse.json();
            } catch (e) {
              altResult.error = await altResponse.text();
            }
          }

          setTestResults(prev => ({ 
            ...prev, 
            [`alternative_${altURL.replace(/[^a-zA-Z0-9]/g, '_')}`]: altResult 
          }));
        } catch (error) {
          setTestResults(prev => ({ 
            ...prev, 
            [`alternative_${altURL.replace(/[^a-zA-Z0-9]/g, '_')}`]: { 
              url: altURL,
              error: error.message,
              type: 'Network Error' 
            } 
          }));
        }
      }

    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        networkError: { 
          message: error.message,
          type: 'Network Error',
          url: `${DJANGO_BASE_URL}/v1/students/students/`
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const testWorkingEndpoints = async () => {
    setLoading(true);
    const token = localStorage.getItem('django_token') || localStorage.getItem('access_token');
    
    const workingEndpoints = [
      { name: 'Custom Fields', url: `${DJANGO_BASE_URL}/v1/students/custom-fields/` },
      { name: 'Documents', url: `${DJANGO_BASE_URL}/v1/students/documents/` },
      { name: 'Enrollment History', url: `${DJANGO_BASE_URL}/v1/students/enrollment-history/` },
      { name: 'Import Operations', url: `${DJANGO_BASE_URL}/v1/students/imports/` },
    ];

    for (const endpoint of workingEndpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const result = {
          name: endpoint.name,
          url: endpoint.url,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        };

        if (response.ok) {
          try {
            result.data = await response.json();
          } catch (e) {
            result.data = await response.text();
          }
        } else {
          try {
            result.error = await response.json();
          } catch (e) {
            result.error = await response.text();
          }
        }

        setTestResults(prev => ({ ...prev, [`working_${endpoint.name.replace(/\s+/g, '_')}`]: result }));
      } catch (error) {
        setTestResults(prev => ({ 
          ...prev, 
          [`working_${endpoint.name.replace(/\s+/g, '_')}`]: { 
            name: endpoint.name,
            url: endpoint.url,
            error: error.message,
            type: 'Network Error' 
          } 
        }));
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Students Endpoint Diagnostic</h1>
          <p className="text-red-100">Targeted diagnosis for student fetching failures</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Configuration */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Current Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Base URL:</strong> {DJANGO_BASE_URL}</div>
              <div><strong>Students Endpoint:</strong> {DJANGO_BASE_URL}/v1/students/students/</div>
              <div><strong>Token Status:</strong> {localStorage.getItem('django_token') || localStorage.getItem('access_token') ? 'Present' : 'Missing'}</div>
              <div><strong>Environment:</strong> {DJANGO_BASE_URL.includes('localhost') || DJANGO_BASE_URL.includes('127.0.0.1') ? 'Development' : 'Production'}</div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testStudentsEndpoint}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              Test Students Endpoint
            </button>
            <button
              onClick={testWorkingEndpoints}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Test Working Endpoints
            </button>
          </div>

          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Testing endpoints...</p>
            </div>
          )}

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Test Results</h2>
              
              {/* Students Endpoint Result */}
              {testResults.studentsEndpoint && (
                <div className={`p-4 rounded-lg ${testResults.studentsEndpoint.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className={`font-semibold mb-2 ${testResults.studentsEndpoint.ok ? 'text-green-600' : 'text-red-600'}`}>
                    Students Endpoint {testResults.studentsEndpoint.ok ? '✅ SUCCESS' : '❌ FAILED'}
                  </h3>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(testResults.studentsEndpoint, null, 2)}
                  </pre>
                </div>
              )}

              {/* Alternative Endpoints */}
              {Object.entries(testResults)
                .filter(([key]) => key.startsWith('alternative_'))
                .map(([key, result]) => (
                  <div key={key} className={`p-4 rounded-lg ${result.ok ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <h3 className={`font-semibold mb-2 ${result.ok ? 'text-green-600' : 'text-yellow-600'}`}>
                      Alternative Endpoint {result.ok ? '✅ SUCCESS' : '⚠️ FAILED'}
                    </h3>
                    <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                ))}

              {/* Working Endpoints */}
              {Object.entries(testResults)
                .filter(([key]) => key.startsWith('working_'))
                .map(([key, result]) => (
                  <div key={key} className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-600 mb-2">
                      {result.name} ✅ SUCCESS
                    </h3>
                    <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                ))}

              {/* Network Error */}
              {testResults.networkError && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-600 mb-2">Network Error</h3>
                  <pre className="bg-gray-800 text-red-400 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(testResults.networkError, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Diagnosis & Recommendations</h3>
            <div className="text-blue-700 space-y-2 text-sm">
              <div><strong>If Students Endpoint fails but alternatives work:</strong></div>
              <ul className="ml-4 space-y-1">
                <li>• Update the endpoint URL in your Django configuration</li>
                <li>• Check Django urls.py for the correct students endpoint path</li>
                <li>• Verify the API versioning structure</li>
              </ul>
              
              <div><strong>If all endpoints fail with 404:</strong></div>
              <ul className="ml-4 space-y-1">
                <li>• Check if Django backend is running</li>
                <li>• Verify the base URL configuration</li>
                <li>• Check Django URL patterns configuration</li>
              </ul>
              
              <div><strong>If all endpoints fail with 401:</strong></div>
              <ul className="ml-4 space-y-1">
                <li>• Login to get a valid authentication token</li>
                <li>• Check if token has expired</li>
                <li>• Verify Django authentication settings</li>
              </ul>
              
              <div><strong>If working endpoints succeed but students fails:</strong></div>
              <ul className="ml-4 space-y-1">
                <li>• Check Django students app configuration</li>
                <li>• Verify students model and serializer</li>
                <li>• Check Django permissions for students endpoint</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsEndpointDiagnostic;
