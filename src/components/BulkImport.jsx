import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, doc, setDoc, serverTimestamp, writeBatch, getDocs, query } from "firebase/firestore";
import * as XLSX from "xlsx";

const BulkImport = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [mapping, setMapping] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState(1);
  
  const availableFields = [
    { name: "admissionNumber", label: "Admission Number", type: "text", required: true },
    { name: "name", label: "Full Name", type: "text", required: true },
    { name: "gender", label: "Gender", type: "select", required: true, options: ["Male", "Female", "Other"] },
    { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "studentMobile", label: "Mobile Number", type: "tel", required: true },
    { name: "program", label: "Program", type: "select", required: true, options: ["B.Tech", "M.Tech", "MBA", "MCA", "BBA", "B.Sc", "M.Sc", "Ph.D"] },
    { name: "department", label: "Department", type: "select", required: true, options: ["Computer Science & Engineering", "Electrical & Electronics Engineering", "Mechanical Engineering", "Civil Engineering", "Management Studies"] },
    { name: "year", label: "Year", type: "select", required: true, options: ["I", "II", "III", "IV"] },
    { name: "section", label: "Section", type: "select", required: true, options: ["A", "B", "C"] },
    { name: "fatherName", label: "Father's Name", type: "text", required: true },
    { name: "fatherMobile", label: "Father's Mobile", type: "tel", required: true },
    { name: "motherName", label: "Mother's Name", type: "text", required: true },
    { name: "address", label: "Address", type: "textarea", required: true },
    { name: "stateOfOrigin", label: "State", type: "text", required: true },
    { name: "district", label: "District", type: "text", required: true },
    { name: "pincode", label: "Pincode", type: "text", required: true },
    { name: "feeStructure", label: "Fee Structure", type: "select", required: true, options: ["Regular", "Scholarship", "Merit", "Management"] },
    { name: "totalFee", label: "Total Fee", type: "number", required: true },
    { name: "paymentStatus", label: "Payment Status", type: "select", required: false, options: ["Pending", "Partial", "Paid"] }
  ];

  // Convert Excel serial number to date
  const excelSerialToDate = (serial) => {
    if (!serial || isNaN(serial)) return null;
    
    // Excel dates are number of days since 1900-01-01
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);
    
    // Format as YYYY-MM-DD
    const year = dateInfo.getUTCFullYear();
    const month = String(dateInfo.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateInfo.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Convert any date format to YYYY-MM-DD
  const normalizeDate = (dateValue) => {
    if (!dateValue) return null;
    
    // If it's already a string in YYYY-MM-DD format
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    
    // If it's a number (Excel serial date)
    if (typeof dateValue === 'number' && !isNaN(dateValue)) {
      return excelSerialToDate(dateValue);
    }
    
    // If it's a Date object
    if (dateValue instanceof Date) {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Try to parse as date string
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      // Ignore parsing errors
    }
    
    return null;
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(uploadedFile.type)) {
      alert('Please upload a valid Excel file (.xlsx, .xls) or CSV file');
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
        const workbook = XLSX.read(data, { type: 'array', cellDates: true, cellNF: false, cellText: false });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with proper date handling
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          raw: false,
          dateNF: 'yyyy-mm-dd'
        });

        if (jsonData.length < 2) {
          alert('File must contain at least a header row and one data row');
          return;
        }

        const headers = jsonData[0];
        const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));

        if (rows.length === 0) {
          alert('No data rows found in the file');
          return;
        }

        if (rows.length > 1000) {
          alert('Maximum 1000 rows allowed per import');
          return;
        }

        // Process dates in the data
        const processedRows = rows.map(row => {
          return row.map((cell, index) => {
            // Check if this column might be a date (based on header)
            const header = headers[index];
            if (header && (header.toLowerCase().includes('date') || header.toLowerCase().includes('dob'))) {
              return normalizeDate(cell);
            }
            return cell;
          });
        });

        setData(processedRows);

        // Improved auto-mapping with better matching logic
        const autoMapping = {};
        headers.forEach((header, index) => {
          if (!header) return;
          
          const cleanHeader = header.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
          
          // Common variations mapping
          const variations = {
            'admissionnumber': 'admissionNumber',
            'admissionno': 'admissionNumber',
            'rollno': 'admissionNumber',
            'rollnumber': 'admissionNumber',
            'fullname': 'name',
            'studentname': 'name',
            'student_name': 'name',
            'dob': 'dateOfBirth',
            'birthdate': 'dateOfBirth',
            'dateofbirth': 'dateOfBirth',
            'mobilenumber': 'studentMobile',
            'mobile': 'studentMobile',
            'phone': 'studentMobile',
            'phonenumber': 'studentMobile',
            'fathername': 'fatherName',
            'father_name': 'fatherName',
            'mothername': 'motherName',
            'mother_name': 'motherName',
            'state': 'stateOfOrigin',
            'stateoforigin': 'stateOfOrigin',
            'totalamount': 'totalFee',
            'fee': 'totalFee',
            'amount': 'totalFee',
            'paymentstatus': 'paymentStatus',
            'status': 'paymentStatus'
          };

          // Try exact matches first
          let matchedField = availableFields.find(field => 
            field.name.toLowerCase() === cleanHeader ||
            field.label.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanHeader
          );

          // If no exact match, try variations
          if (!matchedField && variations[cleanHeader]) {
            matchedField = availableFields.find(field => field.name === variations[cleanHeader]);
          }

          // If still no match, try partial matches
          if (!matchedField) {
            matchedField = availableFields.find(field => {
              const fieldName = field.name.toLowerCase();
              const fieldLabel = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
              return cleanHeader.includes(fieldName) || 
                     fieldName.includes(cleanHeader) ||
                     cleanHeader.includes(fieldLabel) || 
                     fieldLabel.includes(cleanHeader);
            });
          }

          if (matchedField) {
            autoMapping[matchedField.name] = index;
          }
        });

        setMapping(autoMapping);
        setStep(2);
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file. Please check the file format and try again.');
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const validateData = () => {
    const newErrors = [];

    // First, check for unmapped required fields
    availableFields.forEach(field => {
      if (field.required && mapping[field.name] === undefined) {
        newErrors.push({
          type: 'mapping',
          field: field.label,
          message: `${field.label} is required but not mapped`,
          value: 'Not mapped'
        });
      }
    });

    // Then validate mapped fields
    data.forEach((row, rowIndex) => {
      const rowNumber = rowIndex + 2;

      availableFields.forEach(field => {
        if (mapping[field.name] !== undefined) {
          const value = row[mapping[field.name]];
          
          // Required field validation
          if (field.required && (!value || value.toString().trim() === '')) {
            newErrors.push({
              type: 'validation',
              row: rowNumber,
              field: field.label,
              message: `${field.label} is required`,
              value: value
            });
            return;
          }

          if (!value || value.toString().trim() === '') {
            return; // Skip validation for empty optional fields
          }

          const stringValue = value.toString().trim();

          // Email validation
          if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(stringValue)) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
                field: field.label,
                message: `${field.label} must be a valid email address`,
                value: value
              });
            }
          }

          // Phone validation
          if (field.type === 'tel') {
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(stringValue.replace(/\D/g, ''))) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
                field: field.label,
                message: `${field.label} must be a valid 10-digit mobile number`,
                value: value
              });
            }
          }

          // Select validation
          if (field.type === 'select' && field.options) {
            if (!field.options.includes(stringValue)) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
                field: field.label,
                message: `${field.label} must be one of: ${field.options.join(', ')}`,
                value: value
              });
            }
          }

          // Number validation
          if (field.type === 'number') {
            if (isNaN(parseFloat(stringValue)) || parseFloat(stringValue) < 0) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
                field: field.label,
                message: `${field.label} must be a valid positive number`,
                value: value
              });
            }
          }

          // Date validation
          if (field.type === 'date') {
            const normalizedDate = normalizeDate(value);
            if (!normalizedDate) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
                field: field.label,
                message: `${field.label} must be a valid date`,
                value: value
              });
            }
          }
        }
      });
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleImport = async () => {
    if (!validateData()) {
      alert(`Please fix ${errors.length} validation errors before importing`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const batch = writeBatch(db);
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < data.length; i++) {
        const row = data[i];

        try {
          const studentData = {};
          Object.keys(mapping).forEach(fieldName => {
            const columnIndex = mapping[fieldName];
            if (columnIndex !== undefined && row[columnIndex] !== undefined) {
              let value = row[columnIndex];
              
              const field = availableFields.find(f => f.name === fieldName);
              if (field) {
                switch (field.type) {
                  case 'number':
                    value = parseFloat(value) || 0;
                    break;
                  case 'date':
                    value = normalizeDate(value);
                    break;
                  default:
                    value = value.toString().trim();
                }
              }
              
              studentData[fieldName] = value;
            }
          });

          const studentId = `${studentData.year || 'Unknown'}_${studentData.section || 'Unknown'}_${studentData.admissionNumber || `temp_${Date.now()}_${i}`}`;
          
          const finalStudentData = {
            ...studentData,
            studentId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: "Active",
            paymentStatus: studentData.paymentStatus || "Pending",
            importSource: "bulk_import",
            importDate: serverTimestamp(),
            importBatch: new Date().toISOString()
          };

          if (finalStudentData.totalFee && finalStudentData.paidAmount) {
            finalStudentData.remainingAmount = parseFloat(finalStudentData.totalFee) - parseFloat(finalStudentData.paidAmount);
          } else if (finalStudentData.totalFee) {
            finalStudentData.remainingAmount = parseFloat(finalStudentData.totalFee);
          }

          const sectionRef = collection(db, `students/${studentData.year || 'Unknown'}/${studentData.section || 'Unknown'}`);
          const studentDoc = doc(sectionRef, studentId);
          batch.set(studentDoc, finalStudentData);

          const generalStudentsRef = collection(db, "students");
          const generalStudentDoc = doc(generalStudentsRef, studentId);
          batch.set(generalStudentDoc, finalStudentData);

          successCount++;
        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
          errorCount++;
        }

        const progress = ((i + 1) / data.length) * 100;
        setUploadProgress(progress);

        if ((i + 1) % 50 === 0) {
          await batch.commit();
        }
      }

      await batch.commit();

      const message = `Import completed!\n\n✅ Successfully imported: ${successCount} students\n❌ Failed: ${errorCount} students`;
      alert(message);
      
      if (onSuccess) {
        onSuccess(successCount);
      }

      setStep(3);
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    const templateData = availableFields.map(field => ({
      [field.label]: field.required ? `Required: ${field.type}` : `Optional: ${field.type}`
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    XLSX.writeFile(wb, "student_import_template.xlsx");
  };

  const testBulkImport = () => {
    const testData = [
      ['Admission Number', 'Full Name', 'Gender', 'Date of Birth', 'Email', 'Mobile Number', 'Program', 'Department', 'Year', 'Section', 'Father\'s Name', 'Father\'s Mobile', 'Mother\'s Name', 'Address', 'State', 'District', 'Pincode', 'Fee Structure', 'Total Fee', 'Payment Status'],
      ['TEST001', 'Test Student', 'Male', '2000-01-01', 'test@example.com', '9876543210', 'B.Tech', 'Computer Science & Engineering', 'I', 'A', 'Test Father', '9876543211', 'Test Mother', 'Test Address', 'Test State', 'Test District', '123456', 'Regular', '100000', 'Pending']
    ];
    
    setData(testData.slice(1));
    setMapping({
      admissionNumber: 0, name: 1, gender: 2, dateOfBirth: 3, email: 4, studentMobile: 5,
      program: 6, department: 7, year: 8, section: 9, fatherName: 10, fatherMobile: 11,
      motherName: 12, address: 13, stateOfOrigin: 14, district: 15, pincode: 16,
      feeStructure: 17, totalFee: 18, paymentStatus: 19
    });
    setStep(2);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Excel File</h3>
        <p className="text-gray-600">Select an Excel file (.xlsx, .xls) or CSV file containing student data</p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <svg className="mx-auto w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-500">Excel files (.xlsx, .xls) or CSV files only (Max 10MB)</p>
        </label>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={downloadTemplate}
          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download Template</span>
        </button>
        <button
          onClick={testBulkImport}
          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>Test Import</span>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Map Columns & Validate Data</h3>
        <p className="text-gray-600">Match your Excel columns to the student data fields and review validation</p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-red-800 font-semibold">{errors.length} Validation Errors Found</h4>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {errors.slice(0, 10).map((error, index) => (
              <div key={index} className="text-sm text-red-700">
                {error.type === 'mapping' ? (
                  <span><span className="font-medium">Mapping Error:</span> {error.message}</span>
                ) : (
                  <span><span className="font-medium">Row {error.row}:</span> {error.message}</span>
                )}
                {error.value && <span className="text-red-600"> (Value: {error.value})</span>}
              </div>
            ))}
            {errors.length > 10 && (
              <div className="text-sm text-red-600 font-medium">
                ... and {errors.length - 10} more errors
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Available Fields</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableFields.map((field) => (
              <div key={field.name} className={`p-3 border rounded-lg ${
                field.required && mapping[field.name] === undefined 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{field.label}</p>
                    <p className="text-sm text-gray-500">{field.type} {field.required && '(Required)'}</p>
                  </div>
                  <select
                    value={mapping[field.name] || ''}
                    onChange={(e) => setMapping(prev => ({
                      ...prev,
                      [field.name]: e.target.value ? parseInt(e.target.value) : undefined
                    }))}
                    className={`px-3 py-1 border rounded text-sm ${
                      field.required && mapping[field.name] === undefined 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Not mapped</option>
                    {data[0]?.map((header, index) => (
                      <option key={index} value={index}>
                        {header || `Column ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Preview Data</h4>
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  {data[0]?.map((header, index) => (
                    <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      {header || `Column ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900 border-b">
                        {cell || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 5 && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Showing first 5 rows of {data.length} total rows
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(1)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleImport}
          disabled={errors.length > 0}
          className={`px-4 py-2 rounded-lg transition-colors ${
            errors.length > 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {errors.length > 0 ? `Fix ${errors.length} Errors First` : 'Start Import'}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900">Import Complete!</h3>
      <p className="text-gray-600">The bulk import has been completed successfully.</p>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => {
            setStep(1);
            setFile(null);
            setData([]);
            setMapping({});
            setErrors([]);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Import Another File
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Importing Students</h3>
        <p className="text-gray-600">Please wait while we import your data...</p>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${uploadProgress}%` }}
        ></div>
      </div>
      
      <p className="text-center text-sm text-gray-600">
        {Math.round(uploadProgress)}% complete
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bulk Import Students</h2>
              <p className="text-gray-600 mt-1">Import multiple students from Excel file</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-center mt-6">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {isUploading ? renderProgress() : (
            <>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImport;
