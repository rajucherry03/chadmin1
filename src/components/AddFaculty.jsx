import React, { useState } from "react";
import { db, auth } from "../firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  writeBatch 
} from "firebase/firestore";
import * as XLSX from "xlsx";
import {
  createFacultyAuthAccount,
  sendWelcomeEmail,
  createFacultyProfile,
  validateFacultyData,
  FACULTY_ROLES
} from "../utils/facultyAuthHelpers";

const AddFaculty = () => {
  // Department options (aligned with AddCourse)
  const departmentOptions = [
    "Civil Engineering",
    "Electronics & Communication Engineering",
    "Electrical & Electronics Engineering",
    "Mechanical Engineering",
    "Basic Sciences & Humanities",
    "Management Studies",
    "Computer Applications",
    "Computer Science & Engineering",
    "Computer Science & Engineering (Artificial Intelligence)",
    "Computer Science & Engineering (Cyber Security)",
    "Computer Science & Technology",
    "Computer Science & Engineering (Data Science)",
    "Computer Science and Engineering (Artificial Intelligence and Machine Learning)",
    "Computer Science and Engineering (Networks)",
  ];

  // Short-form keys (aligned with AddCourse)
  const departmentKeyMap = {
    "Civil Engineering": "CE",
    "Electronics & Communication Engineering": "ECE",
    "Electrical & Electronics Engineering": "EEE",
    "Mechanical Engineering": "ME",
    "Basic Sciences & Humanities": "BSH",
    "Management Studies": "MS",
    "Computer Applications": "CA",
    "Computer Science & Engineering": "CSE",
    "Computer Science & Engineering (Artificial Intelligence)": "CSE_AI",
    "Computer Science & Engineering (Cyber Security)": "CSE_CS",
    "Computer Science & Technology": "CST",
    "Computer Science & Engineering (Data Science)": "CSE_DS",
    "Computer Science and Engineering (Artificial Intelligence and Machine Learning)": "CSE_AIML",
    "Computer Science and Engineering (Networks)": "CSE_NW",
  };



  const toKey = (value) => {
    return String(value || "")
      .toUpperCase()
      .replace(/&/g, "AND")
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const getDepartmentKey = (name) => departmentKeyMap[name] || toKey(name);



  const initialFields = {
    sno: "",
    name: "",
    designation: "",
    dateOfJoining: "",
    qualifications: "",
    contactNo: "",
    areaOfSpecialization: "",
    pan: "",
    aadhaar: "",
    emailID: "",
    dob: "",
    empID: "",
    experience: "",
    acadExperience: "",
    industryExperience: "",
    promotionDate: "",
    specialization: "",
    degr: "",
    degrDate: "",
    depRole: "",
    state: "",
    religion: "",
    caste: "",
    subCaste: "",
    bloodGroup: "",
    origin: "",
    localAddress: "",
    permAddress: "",
    bankName: "",
    bankAccountNumber: "",
    branch: "",
    ifsc: "",
    bankAddr: "",
    spouseName: "",
    relationshipWithSpouse: "",
    fatherName: "",
    motherName: "",
  };

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [facultyData, setFacultyData] = useState(initialFields);
  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    authCreated: 0,
    authFailed: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFacultyData((prevData) => ({ ...prevData, [name]: value }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedDepartment) {
      alert("Please select a department first.");
      setLoading(false);
      return;
    }

    // Validate faculty data
    const validation = validateFacultyData(facultyData);
    if (!validation.isValid) {
      alert(`Validation errors:\n${validation.errors.join('\n')}`);
      setLoading(false);
      return;
    }

    try {
      const deptKey = getDepartmentKey(selectedDepartment);
      
      // Check if faculty already exists
      const facultyRef = collection(db, "faculty");
      const q = query(facultyRef, where("emailID", "==", facultyData.emailID));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("Faculty with this Email ID already exists.");
        setLoading(false);
        return;
      }

      // Create Firebase Auth account
      const authResult = await createFacultyAuthAccount(facultyData);
      
      // Prepare enhanced faculty data
      const enhancedFacultyData = createFacultyProfile(
        { ...facultyData, department: selectedDepartment, departmentKey: deptKey },
        authResult.uid,
        authResult.email
      );

      // Store in Firestore with hierarchical collection: /faculty/{departmentKey}/members/{uid}
      const documentId = (authResult.uid && String(authResult.uid).trim()) || (facultyData.empID && String(facultyData.empID).trim()) || `faculty_${Date.now()}`;
      const facultyDocRef = doc(db, "faculty", deptKey, "members", documentId);
      
      await setDoc(facultyDocRef, enhancedFacultyData);

      // Send welcome email if auth was created
      if (authResult.success) {
        await sendWelcomeEmail(authResult.email, facultyData.name);
      }

      alert(`Faculty added successfully!${authResult.success ? ` Auth account created. Email: ${authResult.email}` : ''}`);
      setFacultyData(initialFields);
    } catch (error) {
      console.error("Error adding faculty:", error.message);
      alert("Failed to add faculty. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert('Please upload a valid Excel file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false,
          defval: '',
          header: [
            'sno',
            'name',
            'designation',
            'dateOfJoining',
            'qualifications',
            'contactNo',
            'areaOfSpecialization',
            'pan',
            'aadhaar',
            'emailID',
            'dob',
            'empID',
            'experience',
            'acadExperience',
            'industryExperience',
            'promotionDate',
            'specialization',
            'degr',
            'degrDate',
            'depRole',
            'state',
            'religion',
            'caste',
            'subCaste',
            'bloodGroup',
            'origin',
            'localAddress',
            'permAddress',
            'bankName',
            'bankAccountNumber',
            'branch',
            'ifsc',
            'bankAddr',
            'spouseName',
            'relationshipWithSpouse',
            'fatherName',
            'motherName'
          ]
        });

        // Remove header row if present and filter valid data
        const processedData = jsonData.filter(row => {
          return Object.values(row).some(value => value !== '');
        });

        if (processedData.length === 0) {
          alert('No valid data found in the Excel file.');
          return;
        }

        console.log('Sample row:', processedData[0]);
        setExcelData(processedData);
        alert(`Excel file processed successfully! Found ${processedData.length} valid entries.`);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        alert('Failed to process the Excel file. Please check the format.');
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading Excel file:', error);
      alert('Failed to read the Excel file.');
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (!selectedDepartment) {
      alert('Please select a department first.');
      return;
    }

    if (excelData.length === 0) {
      alert('No data to upload.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setUploadStats({
      total: excelData.length,
      success: 0,
      failed: 0,
      skipped: 0,
      authCreated: 0,
      authFailed: 0
    });

    try {
      const deptKey = getDepartmentKey(selectedDepartment);
      const batch = writeBatch(db);
      let batchCount = 0;
      const maxBatchSize = 500;

      for (let i = 0; i < excelData.length; i++) {
        const faculty = excelData[i];
        
        // Skip rows without required fields
        if (!faculty.name || !faculty.emailID || faculty.name.trim() === '' || faculty.emailID.trim() === '') {
          setUploadStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
          continue;
        }

        try {
          // Create Firebase Auth account
          const authResult = await createFacultyAuthAccount(faculty);
          
          if (authResult.success) {
            setUploadStats(prev => ({ ...prev, authCreated: prev.authCreated + 1 }));
          } else {
            setUploadStats(prev => ({ ...prev, authFailed: prev.authFailed + 1 }));
            console.warn(`Auth creation failed for ${faculty.emailID}:`, authResult.error);
          }

          // Clean and prepare faculty data
          const cleanedFacultyData = {
            empID: faculty.empID?.trim() || '',
            name: faculty.name.trim(),
            designation: faculty.designation?.trim() || 'Lecturer',
            dateOfJoining: faculty.dateOfJoining?.trim() || '',
            qualifications: faculty.qualifications?.trim() || '',
            contactNo: faculty.contactNo?.trim() || '',
            areaOfSpecialization: faculty.areaOfSpecialization?.trim() || '',
            pan: faculty.pan?.trim() || '',
            aadhaar: faculty.aadhaar?.trim() || '',
            emailID: faculty.emailID.trim(),
            dob: faculty.dob?.trim() || '',
            experience: faculty.experience?.trim() || '',
            acadExperience: faculty.acadExperience?.trim() || '',
            industryExperience: faculty.industryExperience?.trim() || '',
            promotionDate: faculty.promotionDate?.trim() || '',
            specialization: faculty.specialization?.trim() || '',
            degr: faculty.degr?.trim() || '',
            degrDate: faculty.degrDate?.trim() || '',
            depRole: faculty.depRole?.trim() || '',
            state: faculty.state?.trim() || '',
            religion: faculty.religion?.trim() || '',
            caste: faculty.caste?.trim() || '',
            subCaste: faculty.subCaste?.trim() || '',
            bloodGroup: faculty.bloodGroup?.trim() || '',
            origin: faculty.origin?.trim() || '',
            localAddress: faculty.localAddress?.trim() || '',
            permAddress: faculty.permAddress?.trim() || '',
            bankName: faculty.bankName?.trim() || '',
            bankAccountNumber: faculty.bankAccountNumber?.trim() || '',
            branch: faculty.branch?.trim() || '',
            ifsc: faculty.ifsc?.trim() || '',
            bankAddr: faculty.bankAddr?.trim() || '',
            spouseName: faculty.spouseName?.trim() || '',
            relationshipWithSpouse: faculty.relationshipWithSpouse?.trim() || '',
            fatherName: faculty.fatherName?.trim() || '',
            motherName: faculty.motherName?.trim() || '',
            department: selectedDepartment,
            departmentKey: deptKey
          };

          // Create enhanced faculty profile
          const enhancedFacultyData = createFacultyProfile(
            cleanedFacultyData,
            authResult.uid,
            authResult.email
          );

          // Use UID as document ID if auth was created, otherwise use empID
          const documentId = (authResult.uid && String(authResult.uid).trim()) || (faculty.empID && String(faculty.empID).trim()) || `faculty_${Date.now()}_${i}`;
          const facultyDocRef = doc(db, "faculty", deptKey, "members", documentId);
          
          batch.set(facultyDocRef, enhancedFacultyData);
          batchCount++;

          // Send welcome email if auth was created
          if (authResult.success) {
            await sendWelcomeEmail(authResult.email, faculty.name);
          }

          setUploadStats(prev => ({ ...prev, success: prev.success + 1 }));

          // Commit batch if it reaches max size
          if (batchCount >= maxBatchSize) {
            await batch.commit();
            batchCount = 0;
          }

        } catch (error) {
          console.error(`Error processing faculty ${faculty.name}:`, error);
          setUploadStats(prev => ({ ...prev, failed: prev.failed + 1 }));
        }

        // Update progress
        setUploadProgress(((i + 1) / excelData.length) * 100);
      }

      // Commit remaining batch
      if (batchCount > 0) {
        await batch.commit();
      }

      alert(`Upload complete!\nSuccessfully added: ${uploadStats.success}\nSkipped entries: ${uploadStats.skipped}\nAuth accounts created: ${uploadStats.authCreated}\nAuth failures: ${uploadStats.authFailed}`);
      setExcelData([]);
    } catch (error) {
      console.error('Error uploading faculty data:', error);
      alert('Failed to upload faculty data. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <h1 className="text-3xl font-bold text-white">Add Faculty</h1>
          <p className="text-blue-100 mt-1">Manage faculty members with automatic authentication</p>
        </div>

        {/* Department selection */}
        <div className="p-6 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Select Department --</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          {!selectedDepartment && (
            <p className="text-sm text-gray-500 mt-2">Please select a department to enable adding or uploading faculty.</p>
          )}
        </div>

        {/* Manual Entry Form */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Manual Faculty Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(initialFields).map((field) => (
                <div key={field}>
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize mb-1">
                    {field.replace(/([A-Z])/g, " $1").toLowerCase()}
                    {(field === "name" || field === "emailID") && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    id={field}
                    name={field}
                    value={facultyData[field]}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    required={field === "name" || field === "emailID"}
                    disabled={!selectedDepartment || loading}
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              disabled={!selectedDepartment || loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                !selectedDepartment || loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              }`}
            >
              {loading ? "Adding Faculty..." : "Add Faculty"}
            </button>
          </form>
        </div>

        {/* Bulk Upload Section */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Bulk Faculty Upload</h2>
          
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Excel File</label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={!selectedDepartment || loading}
            />
            {excelData.length > 0 && (
              <p className="text-sm text-green-600 mt-2">✓ {excelData.length} entries ready for upload</p>
            )}
          </div>

          {/* Upload Progress */}
          {loading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Upload Progress</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Success: {uploadStats.success} | Failed: {uploadStats.failed} | Skipped: {uploadStats.skipped} | Auth Created: {uploadStats.authCreated}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={excelData.length === 0 || !selectedDepartment || loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
              excelData.length === 0 || !selectedDepartment || loading
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
            }`}
          >
            {loading ? "Uploading..." : `Upload ${excelData.length} Faculty Members`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFaculty;