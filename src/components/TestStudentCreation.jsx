import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGraduate, faSpinner, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';

const TestStudentCreation = () => {
  const { students } = useDjangoAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // The exact student data you provided
  const testStudentData = {
    // Basic Information
    rollNumber: "22695a3208",
    firstName: "Raju",
    lastName: "S",
    middleName: "",
    dateOfBirth: "2003-10-14",
    gender: "Male",

    // Academic Information
    section: "Section B",
    academicYear: "2024-2025",
    gradeLevel: "Grade 12",
    quota: "General",
    rank: 1,

    // Contact Information
    email: "rajusampath.b@gmail.com",
    studentMobile: "6301201156",
    addressLine1: "2-16 sirigiripalle gudupalle",
    addressLine2: "",
    city: "Kuppam",
    state: "Andhra Pradesh",
    postalCode: "517426",
    country: "India",
    village: "sirigiripalle",

    // Identity Information
    aadharNumber: "408222886718",
    religion: "Hindu",
    caste: "BC-A",
    subcaste: "",

    // Parent Information
    fatherName: "M Sampath",
    motherName: "S Bhavani",
    fatherMobile: "8143630426",
    motherMobile: "9676630426",

    // Guardian Information
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianRelationship: "",

    // Emergency Contact
    emergencyContactName: "6301201156",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",

    // Academic Status
    enrollmentDate: "2025-09-05",
    expectedGraduationDate: "2025-09-05",
    status: "Graduated",

    // Medical Information
    medicalConditions: "",
    medications: "",

    // Additional Information
    notes: "",
    profilePicture: null
  };

  const createTestStudent = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('Creating test student with data:', testStudentData);
      const response = await students.createStudent(testStudentData);
      
      setResult({
        success: response.success,
        data: response.data,
        error: response.error,
        status: response.status
      });

      console.log('Student creation result:', response);
    } catch (error) {
      console.error('Error creating student:', error);
      setResult({
        success: false,
        error: error.message,
        data: null
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetStudents = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('Testing get students...');
      const response = await students.getStudents();
      
      setResult({
        success: response.success,
        data: response.data,
        error: response.error,
        status: response.status,
        count: response.count
      });

      console.log('Get students result:', response);
    } catch (error) {
      console.error('Error getting students:', error);
      setResult({
        success: false,
        error: error.message,
        data: null
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FontAwesomeIcon icon={faUserGraduate} className="text-blue-600" />
            Test Student Creation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Test creating and fetching the student data you provided
          </p>
        </div>

        {/* Test Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Test Actions</h3>
          <div className="flex gap-4">
            <button
              onClick={createTestStudent}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faUserGraduate} />
              )}
              Create Test Student (Raju S)
            </button>

            <button
              onClick={testGetStudents}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faUserGraduate} />
              )}
              Test Get Students
            </button>
          </div>
        </div>

        {/* Student Data Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Student Data to Create</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
              {JSON.stringify(testStudentData, null, 2)}
            </pre>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              {result.success ? (
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
              ) : (
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600" />
              )}
              Test Result
            </h3>
            
            <div className={`p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="space-y-2">
                <p className={`font-medium ${
                  result.success 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  Status: {result.success ? 'SUCCESS' : 'FAILED'}
                </p>
                
                {result.status && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    HTTP Status: {result.status}
                  </p>
                )}
                
                {result.count !== undefined && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Students Count: {result.count}
                  </p>
                )}
                
                {result.error && (
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Error:</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
                  </div>
                )}
                
                {result.data && (
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Response Data:</p>
                    <pre className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Debug Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-3">
            Debug Information
          </h3>
          <div className="text-blue-800 dark:text-blue-300 space-y-2 text-sm">
            <p><strong>API Base URL:</strong> {import.meta.env.VITE_DJANGO_BASE_URL || 'http://127.0.0.1:8000'}</p>
            <p><strong>Students Endpoint:</strong> /api/v1/students/students/</p>
            <p><strong>Authentication:</strong> JWT Token required</p>
            <p><strong>Expected Response:</strong> JSON with success/error status</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestStudentCreation;
