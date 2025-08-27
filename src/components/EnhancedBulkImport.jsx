import React, { useState, useEffect } from 'react';
import { db, auth, workerAuth } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp, 
  writeBatch, 
  getDocs, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail
} from 'firebase/auth';
import * as XLSX from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faCheckCircle, 
  faTimesCircle, 
  faExclamationTriangle,
  faDownload,
  faSpinner,
  faEye,
  faEyeSlash,
  faPhone,
  faEnvelope,
  faUser,
  faIdCard,
  faMapMarkerAlt,
  faGraduationCap,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';

const EnhancedBulkImport = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [validationResults, setValidationResults] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [importStats, setImportStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    authCreated: 0,
    authFailed: 0
  });

  // Excel column mapping based on your format
  const excelMapping = {
    'S. NO': 'serialNo',
    'Roll. No': 'rollNo',
    'Student Name': 'studentName',
    'Quota': 'quota',
    'Gender': 'gender',
    'Aadhaar': 'aadhaar',
    'Student Mobile': 'studentMobile',
    'Father Mobile': 'fatherMobile',
    'Father Name': 'fatherName',
    'Mother Name': 'motherName',
    'Permanent Address': 'permanentAddress'
  };

  // Department options
  const departments = [
    { value: 'CSE', label: 'Computer Science Engineering', short: 'CSE' },
    { value: 'ECE', label: 'Electronics & Communication Engineering', short: 'ECE' },
    { value: 'EEE', label: 'Electrical & Electronics Engineering', short: 'EEE' },
    { value: 'MECH', label: 'Mechanical Engineering', short: 'MECH' },
    { value: 'CIVIL', label: 'Civil Engineering', short: 'CIVIL' },
    { value: 'IT', label: 'Information Technology', short: 'IT' }
  ];

  // Year options
  const years = [
    { value: 'I', label: 'First Year' },
    { value: 'II', label: 'Second Year' },
    { value: 'III', label: 'Third Year' },
    { value: 'IV', label: 'Fourth Year' }
  ];

  // Section options
  const sections = [
    { value: 'A', label: 'Section A' },
    { value: 'B', label: 'Section B' },
    { value: 'C', label: 'Section C' },
    { value: 'D', label: 'Section D' }
  ];

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(uploadedFile.type)) {
      alert('Please upload a valid Excel file (.xlsx, .xls)');
      return;
    }

    if (uploadedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setFile(uploadedFile);
    processFile(uploadedFile);
  };

  const processFile = (uploadedFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { 
          type: 'array', 
          cellDates: true, 
          cellNF: false, 
          cellText: false 
        });
        
        console.log('Available sheets:', workbook.SheetNames);
        
        // Process first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          defval: '',
          header: 1 
        });

        if (jsonData.length < 2) {
          alert('Excel file must have at least a header row and one data row');
          return;
        }

        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        console.log('Headers:', headers);
        console.log('First few rows:', rows.slice(0, 3));

        // Map headers to our field names
        const headerMapping = {};
        headers.forEach((header, index) => {
          if (excelMapping[header]) {
            headerMapping[index] = excelMapping[header];
          }
        });

        console.log('Header mapping:', headerMapping);

        // Process rows
        const processedData = rows
          .filter(row => row.some(cell => cell !== '')) // Remove empty rows
          .map((row, index) => {
            const studentData = {};
            
            // Map data based on header mapping
            Object.entries(headerMapping).forEach(([colIndex, fieldName]) => {
              const value = row[parseInt(colIndex)] || '';
              studentData[fieldName] = value.toString().trim();
            });

            // Add metadata
            studentData.rowIndex = index + 2; // +2 because we skipped header and arrays are 0-indexed
            studentData.originalRow = row;

            return studentData;
          })
          .filter(student => student.rollNo && student.studentName); // Only include students with roll number and name

        console.log('Processed data:', processedData.slice(0, 3));

        if (processedData.length === 0) {
          alert('No valid student data found in the Excel file');
          return;
        }

        setData(processedData);
        setPreviewData(processedData.slice(0, 5));
        setStep(2);
        
        // Auto-validate the data
        validateData(processedData);
        
      } catch (error) {
        console.error('Error processing Excel file:', error);
        alert('Failed to process the Excel file. Please check the file format.');
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const validateData = (studentData) => {
    const validation = {};
    
    studentData.forEach((student, index) => {
      const errors = [];
      
      // Required fields
      if (!student.rollNo) errors.push('Roll number is required');
      if (!student.studentName) errors.push('Student name is required');
      
      // Roll number format validation
      if (student.rollNo && !/^[0-9A-Za-z]+$/.test(student.rollNo)) {
        errors.push('Roll number should contain only letters and numbers');
      }
      
      // Mobile number validation
      if (student.studentMobile && !/^[0-9]{10}$/.test(student.studentMobile.replace(/\D/g, ''))) {
        errors.push('Student mobile should be 10 digits');
      }
      
      if (student.fatherMobile && !/^[0-9]{10}$/.test(student.fatherMobile.replace(/\D/g, ''))) {
        errors.push('Father mobile should be 10 digits');
      }
      
      // Aadhaar validation
      if (student.aadhaar && !/^[0-9]{12}$/.test(student.aadhaar.replace(/\D/g, ''))) {
        errors.push('Aadhaar should be 12 digits');
      }
      
      // Gender validation
      if (student.gender && !['Male', 'Female', 'Other'].includes(student.gender)) {
        errors.push('Gender should be Male, Female, or Other');
      }
      
      // Quota validation
      if (student.quota && !['COV', 'MGMT'].includes(student.quota)) {
        errors.push('Quota should be COV or MGMT');
      }
      
      validation[index] = errors;
    });
    
    setValidationResults(validation);
    
    const totalErrors = Object.values(validation).flat().length;
    if (totalErrors > 0) {
      setErrors([`Found ${totalErrors} validation errors. Please review the data.`]);
    } else {
      setErrors([]);
    }
  };

  const generateEmail = (rollNo) => {
    return `${rollNo.toLowerCase()}@student.ch360.edu.in`;
  };

  const generatePassword = (rollNo) => {
    // Generate a secure password based on roll number
    const timestamp = Date.now().toString().slice(-4);
    return `${rollNo}@${timestamp}`;
  };

  const createFirebaseAuth = async (studentData) => {
    try {
      const email = generateEmail(studentData.rollNo);
      const password = generatePassword(studentData.rollNo);
      
      // Check if user already exists
      const signInMethods = await fetchSignInMethodsForEmail(workerAuth, email);
      if (signInMethods.length > 0) {
        return { success: false, error: 'User already exists', uid: null };
      }
      
      // Create user with worker auth to avoid session switching
      const userCredential = await createUserWithEmailAndPassword(workerAuth, email, password);
      
      return { 
        success: true, 
        uid: userCredential.user.uid, 
        email, 
        password 
      };
    } catch (error) {
      console.error('Auth creation error:', error);
      return { 
        success: false, 
        error: error.message, 
        uid: null 
      };
    }
  };

  const handleImport = async () => {
    if (!selectedDepartment || !selectedYear || !selectedSection) {
      alert('Please select Department, Year, and Section');
      return;
    }

    if (data.length === 0) {
      alert('No data to import');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const stats = {
      total: data.length,
      success: 0,
      failed: 0,
      skipped: 0,
      authCreated: 0,
      authFailed: 0
    };

    try {
      let currentBatch = writeBatch(db);
      let batchCount = 0;

      for (let i = 0; i < data.length; i++) {
        const student = data[i];
        
        try {
          // Create Firebase Auth account
          const authResult = await createFirebaseAuth(student);
          
          if (authResult.success) {
            stats.authCreated++;
          } else {
            stats.authFailed++;
            console.warn(`Auth creation failed for ${student.rollNo}:`, authResult.error);
          }

          // Prepare student document data
          const studentDoc = {
            // Basic Information
            rollNo: student.rollNo,
            studentName: student.studentName,
            quota: student.quota || '',
            gender: student.gender || '',
            aadhaar: student.aadhaar || '',
            
            // Contact Information
            studentMobile: student.studentMobile || '',
            fatherMobile: student.fatherMobile || '',
            fatherName: student.fatherName || '',
            motherName: student.motherName || '',
            permanentAddress: student.permanentAddress || '',
            
            // Academic Information
            department: selectedDepartment,
            year: selectedYear,
            section: selectedSection,
            
            // Authentication Information
            authUid: authResult.uid,
            email: authResult.email,
            password: authResult.password, // Note: This should be removed in production
            
            // Metadata
            status: 'Active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            importedAt: serverTimestamp(),
            importSource: 'bulk_import'
          };

          // Create document path
          const deptShort = departments.find(d => d.value === selectedDepartment)?.short || 'UNK';
          const sanitizedDept = deptShort.replace(/[^A-Z0-9_]/gi, '');
          const sanitizedYear = selectedYear.replace(/[^A-Z0-9]/gi, '');
          const sanitizedSection = selectedSection.replace(/[^A-Z0-9]/gi, '');
          const groupKey = `${sanitizedYear}-${sanitizedSection}`;
          
          // Use auth UID if available, otherwise use roll number
          const documentId = authResult.uid || student.rollNo;
          
          const studentRef = doc(db, `students/${sanitizedDept}/${groupKey}`, documentId);
          currentBatch.set(studentRef, studentDoc);

          // Create reference in studentsByUid collection for easy lookup
          if (authResult.uid) {
            const byUidRef = doc(db, 'studentsByUid', authResult.uid);
            currentBatch.set(byUidRef, {
              authUid: authResult.uid,
              authEmail: authResult.email,
              department: selectedDepartment,
              year: selectedYear,
              section: selectedSection,
              rollNo: student.rollNo,
              studentName: student.studentName,
              primaryDocPath: `students/${sanitizedDept}/${groupKey}/${documentId}`,
              updatedAt: serverTimestamp()
            }, { merge: true });
          }

          stats.success++;
          batchCount++;

          // Commit batch every 50 operations
          if (batchCount >= 50) {
            await currentBatch.commit();
            currentBatch = writeBatch(db);
            batchCount = 0;
          }

        } catch (error) {
          console.error(`Error processing student ${student.rollNo}:`, error);
          stats.failed++;
        }

        // Update progress
        const progress = ((i + 1) / data.length) * 100;
        setUploadProgress(progress);
        setImportStats(stats);
      }

      // Commit final batch
      if (batchCount > 0) {
        await currentBatch.commit();
      }

      setStep(4);
      
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'S. NO': 1,
        'Roll. No': '23691A3201',
        'Student Name': 'MULLA ABDULKALAM',
        'Quota': 'COV',
        'Gender': 'Male',
        'Aadhaar': '427493186901',
        'Student Mobile': '8019397343',
        'Father Mobile': '9705964343',
        'Father Name': 'Mulla Mahaboob Peera',
        'Mother Name': 'Mulla Gousiya Begum',
        'Permanent Address': '2-130-A, Mulla Street, Hyderabad'
      },
      {
        'S. NO': 2,
        'Roll. No': '23691A3202',
        'Student Name': 'SHAIK ABUBAKAR SIDDIQ',
        'Quota': 'MGMT',
        'Gender': 'Male',
        'Aadhaar': '980288669955',
        'Student Mobile': '9963121976',
        'Father Mobile': '9441501881',
        'Father Name': 'Shaik Mujibur Rahiman',
        'Mother Name': 'Shaik Noorjahan',
        'Permanent Address': '38/169-2-6, Old City, Hyderabad'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    
    // Auto-size columns
    const colWidths = [
      { wch: 5 },   // S. NO
      { wch: 12 },  // Roll. No
      { wch: 25 },  // Student Name
      { wch: 8 },   // Quota
      { wch: 8 },   // Gender
      { wch: 15 },  // Aadhaar
      { wch: 12 },  // Student Mobile
      { wch: 12 },  // Father Mobile
      { wch: 25 },  // Father Name
      { wch: 25 },  // Mother Name
      { wch: 40 }   // Permanent Address
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'student_import_template.xlsx');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FontAwesomeIcon icon={faUpload} className="text-4xl text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Import Students</h2>
              <p className="text-gray-600">Upload your Excel file to import multiple students at once</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="space-y-4">
                <FontAwesomeIcon icon={faGraduationCap} className="text-6xl text-gray-400" />
                <div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload Excel File
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      XLSX, XLS files only. Maximum 10MB
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Download Template
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Configure Import Settings</h2>
              <span className="text-sm text-gray-500">{data.length} students found</span>
            </div>

            {/* Department, Year, Section Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section *
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Section</option>
                  {sections.map(section => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Data Preview */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Data Preview (First 5 records)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quota
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((student, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.rollNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.quota}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.studentMobile}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {validationResults[index]?.length > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                              {validationResults[index].length} errors
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                              Valid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Validation Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 mt-1" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedDepartment || !selectedYear || !selectedSection || errors.length > 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Import
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Import</h2>
              <p className="text-gray-600">Review the import settings before proceeding</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Import Settings</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Department</dt>
                      <dd className="text-sm text-gray-900">{departments.find(d => d.value === selectedDepartment)?.label}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Year</dt>
                      <dd className="text-sm text-gray-900">{years.find(y => y.value === selectedYear)?.label}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Section</dt>
                      <dd className="text-sm text-gray-900">{sections.find(s => s.value === selectedSection)?.label}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Students</dt>
                      <dd className="text-sm text-gray-900">{data.length}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">What will be created</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <FontAwesomeIcon icon={faUser} className="text-green-500 mr-2" />
                      Firebase Authentication accounts
                    </li>
                    <li className="flex items-center">
                      <FontAwesomeIcon icon={faEnvelope} className="text-blue-500 mr-2" />
                      Student email addresses
                    </li>
                    <li className="flex items-center">
                      <FontAwesomeIcon icon={faIdCard} className="text-purple-500 mr-2" />
                      Student documents in Firestore
                    </li>
                    <li className="flex items-center">
                      <FontAwesomeIcon icon={faBuilding} className="text-orange-500 mr-2" />
                      Department/Year/Section structure
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400 mt-1" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>This will create Firebase Authentication accounts for all students</li>
                      <li>Student emails will be generated as: rollno@student.ch360.edu.in</li>
                      <li>Initial passwords will be generated automatically</li>
                      <li>Students can reset their passwords using their email</li>
                      <li>This action cannot be undone</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={isUploading}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    Importing...
                  </>
                ) : (
                  'Start Import'
                )}
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Completed</h2>
              <p className="text-gray-600">The bulk import process has finished</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Import Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{importStats.total}</div>
                  <div className="text-sm text-gray-500">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{importStats.success}</div>
                  <div className="text-sm text-gray-500">Successfully Imported</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{importStats.failed}</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{importStats.authCreated}</div>
                  <div className="text-sm text-gray-500">Auth Accounts Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{importStats.authFailed}</div>
                  <div className="text-sm text-gray-500">Auth Creation Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{importStats.skipped}</div>
                  <div className="text-sm text-gray-500">Skipped</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <FontAwesomeIcon icon={faEnvelope} className="text-blue-400 mt-1" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Next Steps</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Students can now log in using their email and generated password</li>
                      <li>Email format: rollno@student.ch360.edu.in</li>
                      <li>Students should change their password on first login</li>
                      <li>You can send password reset emails if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Progress Bar */}
          {isUploading && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Import Progress</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default EnhancedBulkImport;
