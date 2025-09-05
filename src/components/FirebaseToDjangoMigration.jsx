import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDatabase, faArrowRight, faCheckCircle, faExclamationTriangle,
  faSpinner, faDownload, faUpload, faUsers, faSync, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';

const FirebaseToDjangoMigration = () => {
  const { students } = useDjangoAuth();
  const [firebaseStudents, setFirebaseStudents] = useState([]);
  const [djangoStudents, setDjangoStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState({
    total: 0,
    migrated: 0,
    failed: 0,
    errors: []
  });
  const [showDetails, setShowDetails] = useState(false);

  // Load Firebase students
  const loadFirebaseStudents = async () => {
    setLoading(true);
    try {
      // Get all students from Firebase
      const studentsRef = collection(db, 'students');
      const snapshot = await getDocs(studentsRef);
      
      const allStudents = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        allStudents.push({
          id: doc.id,
          ...data,
          source: 'firebase'
        });
      });

      // Also check nested collections
      const departments = ['CS', 'ECE', 'ME', 'CE', 'EE']; // Add your departments
      for (const dept of departments) {
        try {
          const deptRef = collection(db, `students/${dept}`);
          const deptSnapshot = await getDocs(deptRef);
          
          deptSnapshot.forEach((doc) => {
            const data = doc.data();
            allStudents.push({
              id: doc.id,
              ...data,
              source: 'firebase',
              department: dept
            });
          });
        } catch (error) {
          console.log(`No data in department ${dept}`);
        }
      }

      setFirebaseStudents(allStudents);
      setMigrationStatus(prev => ({ ...prev, total: allStudents.length }));
    } catch (error) {
      console.error('Error loading Firebase students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load Django students
  const loadDjangoStudents = async () => {
    try {
      const result = await students.getStudents();
      if (result.success) {
        setDjangoStudents(result.data || []);
      } else {
        console.log('Django API not available or no students:', result.error);
      }
    } catch (error) {
      console.log('Django API not available:', error);
    }
  };

  // Convert Firebase student to Django format
  const convertFirebaseToDjango = (firebaseStudent) => {
    return {
      // Basic Information
      rollNumber: firebaseStudent.rollNo || firebaseStudent.rollNumber || '',
      firstName: firebaseStudent.studentName?.split(' ')[0] || firebaseStudent.firstName || '',
      lastName: firebaseStudent.studentName?.split(' ').slice(1).join(' ') || firebaseStudent.lastName || '',
      middleName: firebaseStudent.middleName || '',
      dateOfBirth: firebaseStudent.dateOfBirth || '',
      gender: firebaseStudent.gender || '',

      // Academic Information
      section: firebaseStudent.section || '',
      academicYear: firebaseStudent.year || firebaseStudent.academicYear || '',
      gradeLevel: firebaseStudent.gradeLevel || '',
      quota: firebaseStudent.quota || '',
      rank: firebaseStudent.rank || '',

      // Contact Information
      email: firebaseStudent.email || firebaseStudent.authEmail || '',
      studentMobile: firebaseStudent.studentMobile || '',
      addressLine1: firebaseStudent.permanentAddress || firebaseStudent.addressLine1 || '',
      addressLine2: firebaseStudent.addressLine2 || '',
      city: firebaseStudent.city || '',
      state: firebaseStudent.state || '',
      postalCode: firebaseStudent.postalCode || '',
      country: firebaseStudent.country || 'India',
      village: firebaseStudent.village || '',

      // Identity Information
      aadharNumber: firebaseStudent.aadharNumber || firebaseStudent.aadhaar || '',
      religion: firebaseStudent.religion || '',
      caste: firebaseStudent.caste || '',
      subcaste: firebaseStudent.subcaste || '',

      // Parent Information
      fatherName: firebaseStudent.fatherName || '',
      motherName: firebaseStudent.motherName || '',
      fatherMobile: firebaseStudent.fatherMobile || '',
      motherMobile: firebaseStudent.motherMobile || '',

      // Guardian Information
      guardianName: firebaseStudent.guardianName || '',
      guardianPhone: firebaseStudent.guardianPhone || '',
      guardianEmail: firebaseStudent.guardianEmail || '',
      guardianRelationship: firebaseStudent.guardianRelationship || '',

      // Emergency Contact
      emergencyContactName: firebaseStudent.emergencyContactName || '',
      emergencyContactPhone: firebaseStudent.emergencyContactPhone || '',
      emergencyContactRelationship: firebaseStudent.emergencyContactRelationship || '',

      // Academic Status
      enrollmentDate: firebaseStudent.enrollmentDate || firebaseStudent.createdAt?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      expectedGraduationDate: firebaseStudent.expectedGraduationDate || '',
      status: firebaseStudent.status === 'Active' ? 'active' : firebaseStudent.status?.toLowerCase() || 'active',

      // Medical Information
      medicalConditions: firebaseStudent.medicalConditions || '',
      medications: firebaseStudent.medications || '',

      // Additional Information
      notes: firebaseStudent.notes || '',
      profilePicture: null,

      // Migration metadata
      migratedFrom: 'firebase',
      originalFirebaseId: firebaseStudent.id,
      migrationDate: new Date().toISOString()
    };
  };

  // Migrate single student
  const migrateStudent = async (firebaseStudent) => {
    try {
      const djangoStudent = convertFirebaseToDjango(firebaseStudent);
      const result = await students.createStudent(djangoStudent);
      
      if (result.success) {
        setMigrationStatus(prev => ({
          ...prev,
          migrated: prev.migrated + 1
        }));
        return { success: true, data: result.data };
      } else {
        setMigrationStatus(prev => ({
          ...prev,
          failed: prev.failed + 1,
          errors: [...prev.errors, {
            student: firebaseStudent.studentName || firebaseStudent.rollNo,
            error: result.error
          }]
        }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      setMigrationStatus(prev => ({
        ...prev,
        failed: prev.failed + 1,
        errors: [...prev.errors, {
          student: firebaseStudent.studentName || firebaseStudent.rollNo,
          error: error.message
        }]
      }));
      return { success: false, error: error.message };
    }
  };

  // Migrate all students
  const migrateAllStudents = async () => {
    setLoading(true);
    setMigrationStatus({
      total: firebaseStudents.length,
      migrated: 0,
      failed: 0,
      errors: []
    });

    for (const student of firebaseStudents) {
      await migrateStudent(student);
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setLoading(false);
    // Reload Django students after migration
    loadDjangoStudents();
  };

  // Load data on component mount
  useEffect(() => {
    loadFirebaseStudents();
    loadDjangoStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FontAwesomeIcon icon={faDatabase} className="text-blue-600" />
                Firebase to Django Migration
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Migrate your existing Firebase student data to Django API
              </p>
            </div>
            <button
              onClick={() => {
                loadFirebaseStudents();
                loadDjangoStudents();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faSync} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <FontAwesomeIcon icon={faUsers} className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Firebase Students</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {firebaseStudents.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <FontAwesomeIcon icon={faCheckCircle} className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Django Students</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {djangoStudents.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <FontAwesomeIcon icon={faArrowRight} className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Migrated</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {migrationStatus.migrated}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {migrationStatus.failed}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Migration Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Migration Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={migrateAllStudents}
              disabled={loading || firebaseStudents.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faUpload} />
              )}
              Migrate All Students ({firebaseStudents.length})
            </button>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>
        </div>

        {/* Detailed View */}
        {showDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Firebase Students */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Firebase Students ({firebaseStudents.length})
              </h3>
              <div className="max-h-96 overflow-y-auto">
                {firebaseStudents.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No Firebase students found
                  </p>
                ) : (
                  <div className="space-y-2">
                    {firebaseStudents.map((student, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {student.studentName || student.rollNo || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Roll: {student.rollNo || 'N/A'} | Email: {student.email || 'N/A'}
                            </p>
                          </div>
                          <button
                            onClick={() => migrateStudent(student)}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Migrate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Django Students */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Django Students ({djangoStudents.length})
              </h3>
              <div className="max-h-96 overflow-y-auto">
                {djangoStudents.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No Django students found or API not available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {djangoStudents.map((student, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Roll: {student.rollNumber || 'N/A'} | Email: {student.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Migration Errors */}
        {migrationStatus.errors.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Migration Errors ({migrationStatus.errors.length})
            </h3>
            <div className="max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {migrationStatus.errors.map((error, index) => (
                  <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="font-medium text-red-800 dark:text-red-200">
                      {error.student}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error.error}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-3">
            Migration Instructions
          </h3>
          <div className="text-blue-800 dark:text-blue-300 space-y-2">
            <p>1. <strong>Check Firebase Data:</strong> This tool will scan your Firebase database for existing student data.</p>
            <p>2. <strong>Verify Django API:</strong> Make sure your Django backend is running and the students API endpoints are implemented.</p>
            <p>3. <strong>Migrate Data:</strong> Click "Migrate All Students" to transfer all Firebase data to Django.</p>
            <p>4. <strong>Verify Results:</strong> Check the Django Students count to confirm successful migration.</p>
            <p>5. <strong>Test Components:</strong> After migration, your Django-based student components should show the migrated data.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseToDjangoMigration;
