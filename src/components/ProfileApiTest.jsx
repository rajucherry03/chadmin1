import React, { useState } from 'react';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';
import { getMyProfile, updateMyProfile } from '../utils/djangoAuthHelpers';

const ProfileApiTest = () => {
  const { isAuthenticated, user } = useDjangoAuth();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    first_name: 'Test',
    last_name: 'User',
    bio: 'This is a test bio update'
  });

  const addResult = (test, success, message, data = null) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testGetProfile = async () => {
    setLoading(true);
    try {
      addResult('GET /api/accounts/me/', 'info', 'Testing GET request...');
      
      const result = await getMyProfile();
      
      if (result.success) {
        addResult('GET /api/accounts/me/', 'success', 'Profile fetched successfully', result.data);
      } else {
        addResult('GET /api/accounts/me/', 'error', `Failed: ${result.error}`, result);
      }
    } catch (error) {
      addResult('GET /api/accounts/me/', 'error', `Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testUpdateProfile = async () => {
    setLoading(true);
    try {
      addResult('PATCH /api/accounts/me/', 'info', 'Testing PATCH request...');
      
      const result = await updateMyProfile(testData);
      
      if (result.success) {
        addResult('PATCH /api/accounts/me/', 'success', 'Profile updated successfully', result.data);
      } else {
        addResult('PATCH /api/accounts/me/', 'error', `Failed: ${result.error}`, result);
      }
    } catch (error) {
      addResult('PATCH /api/accounts/me/', 'error', `Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBothEndpoints = async () => {
    setLoading(true);
    clearResults();
    
    try {
      // Test GET first
      addResult('GET /api/accounts/me/', 'info', 'Testing GET request...');
      const getResult = await getMyProfile();
      
      if (getResult.success) {
        addResult('GET /api/accounts/me/', 'success', 'Profile fetched successfully', getResult.data);
        
        // Test PATCH with current data
        addResult('PATCH /api/accounts/me/', 'info', 'Testing PATCH request...');
        const patchResult = await updateMyProfile({
          ...getResult.data,
          bio: `Updated at ${new Date().toLocaleTimeString()}`
        });
        
        if (patchResult.success) {
          addResult('PATCH /api/accounts/me/', 'success', 'Profile updated successfully', patchResult.data);
        } else {
          addResult('PATCH /api/accounts/me/', 'error', `PATCH failed: ${patchResult.error}`, patchResult);
        }
      } else {
        addResult('GET /api/accounts/me/', 'error', `GET failed: ${getResult.error}`, getResult);
      }
    } catch (error) {
      addResult('API Test', 'error', `Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Please log in to test the API endpoints.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Profile API Test</h1>
          <p className="text-blue-100 mt-1">Test /api/accounts/me/ endpoint functionality</p>
        </div>

        {/* Current User Info */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Current User</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
            <p><strong>Username:</strong> {user?.username || 'Not available'}</p>
            <p><strong>Staff:</strong> {user?.is_staff ? 'Yes' : 'No'}</p>
            <p><strong>Superuser:</strong> {user?.is_superuser ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Test Controls */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <button
              onClick={testGetProfile}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white transition ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Test GET /me/
            </button>
            <button
              onClick={testUpdateProfile}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white transition ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              Test PATCH /me/
            </button>
            <button
              onClick={testBothEndpoints}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white transition ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              Test Both
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={clearResults}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Clear Results
            </button>
            {loading && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Testing...
              </div>
            )}
          </div>
        </div>

        {/* Test Data Input */}
        <div className="p-6 border-b">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Test Data for PATCH</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={testData.first_name}
                onChange={(e) => setTestData(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={testData.last_name}
                onChange={(e) => setTestData(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={testData.bio}
                onChange={(e) => setTestData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
          {testResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No test results yet. Run a test to see results here.</p>
          ) : (
            <div className="space-y-3">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.success === 'success'
                      ? 'bg-green-50 border-green-400'
                      : result.success === 'error'
                      ? 'bg-red-50 border-red-400'
                      : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{result.test}</h4>
                      <p className={`text-sm ${
                        result.success === 'success'
                          ? 'text-green-700'
                          : result.success === 'error'
                          ? 'text-red-700'
                          : 'text-blue-700'
                      }`}>
                        {result.message}
                      </p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                            View Response Data
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 ml-4">{result.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileApiTest;
