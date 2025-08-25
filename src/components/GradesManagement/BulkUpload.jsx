import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload,
  faDownload,
  faTimes,
  faCheckCircle,
  faExclamationTriangle,
  faEye,
  faTrash,
  faFileAlt,
  faSearch,
  faFilter,
  faClock,
  faUserGraduate,
  faCalculator,
  faSave
} from '@fortawesome/free-solid-svg-icons';

const BulkUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([
    {
      id: 1,
      fileName: 'CS301_MidSem_Marks.csv',
      course: 'CS301',
      exam: 'Mid-Semester',
      uploadDate: '2024-03-10T10:30:00',
      status: 'completed',
      totalRecords: 45,
      successCount: 43,
      errorCount: 2,
      errors: [
        { row: 12, field: 'marks', message: 'Invalid marks value' },
        { row: 23, field: 'rollNo', message: 'Student not found' }
      ]
    },
    {
      id: 2,
      fileName: 'EE201_EndSem_Marks.csv',
      course: 'EE201',
      exam: 'End-Semester',
      uploadDate: '2024-03-08T14:20:00',
      status: 'completed',
      totalRecords: 38,
      successCount: 38,
      errorCount: 0,
      errors: []
    }
  ]);

  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Standard Marks Template',
      description: 'Template for uploading standard exam marks',
      fields: ['Roll No', 'Name', 'Marks', 'Max Marks', 'Remarks'],
      downloadUrl: '/templates/standard_marks.csv'
    },
    {
      id: 2,
      name: 'Practical Marks Template',
      description: 'Template for uploading practical exam marks',
      fields: ['Roll No', 'Name', 'Theory Marks', 'Practical Marks', 'Viva Marks', 'Total Marks'],
      downloadUrl: '/templates/practical_marks.csv'
    }
  ]);

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      parseCSVFile(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const parseCSVFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        row.rowNumber = index + 2; // +2 because we start from line 2 and want 1-based indexing
        return row;
      }).filter(row => Object.values(row).some(val => val !== ''));
      
      setPreviewData(data);
      validateData(data);
    };
    reader.readAsText(file);
  };

  const validateData = (data) => {
    const errors = [];
    
    data.forEach((row, index) => {
      // Validate Roll No
      if (!row['Roll No'] || row['Roll No'].length < 3) {
        errors.push({
          row: row.rowNumber,
          field: 'Roll No',
          message: 'Roll number is required and must be at least 3 characters'
        });
      }

      // Validate Name
      if (!row['Name'] || row['Name'].length < 2) {
        errors.push({
          row: row.rowNumber,
          field: 'Name',
          message: 'Name is required and must be at least 2 characters'
        });
      }

      // Validate Marks
      const marks = parseFloat(row['Marks']);
      const maxMarks = parseFloat(row['Max Marks']) || 100;
      
      if (isNaN(marks) || marks < 0 || marks > maxMarks) {
        errors.push({
          row: row.rowNumber,
          field: 'Marks',
          message: `Marks must be a number between 0 and ${maxMarks}`
        });
      }
    });

    setValidationErrors(errors);
  };

  const handleUpload = () => {
    if (validationErrors.length > 0) {
      alert(`Please fix ${validationErrors.length} validation errors before uploading`);
      return;
    }

    // Simulate upload process
    const uploadRecord = {
      id: Date.now(),
      fileName: selectedFile.name,
      course: 'CS301', // This would be selected from dropdown
      exam: 'Mid-Semester', // This would be selected from dropdown
      uploadDate: new Date().toISOString(),
      status: 'completed',
      totalRecords: previewData.length,
      successCount: previewData.length - validationErrors.length,
      errorCount: validationErrors.length,
      errors: validationErrors
    };

    setUploadHistory([uploadRecord, ...uploadHistory]);
    setSelectedFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setShowPreview(false);
  };

  const downloadTemplate = (template) => {
    // Simulate template download
    const csvContent = template.fields.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = template.name.toLowerCase().replace(/\s+/g, '_') + '.csv';
    a.click();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return faCheckCircle;
      case 'processing': return faClock;
      case 'failed': return faExclamationTriangle;
      default: return faClock;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bulk Upload</h2>
        <p className="text-gray-600">Upload student marks in bulk using CSV files</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upload Marks</h3>
          </div>
          <div className="p-6">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FontAwesomeIcon icon={faUpload} className="text-4xl text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</p>
              <p className="text-gray-600 mb-4">Drag and drop your CSV file here, or click to browse</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Choose File
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewData([]);
                      setValidationErrors([]);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>
            )}

            {/* Validation Summary */}
            {validationErrors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-2" />
                  <h4 className="font-medium text-red-900">
                    {validationErrors.length} validation errors found
                  </h4>
                </div>
                <div className="text-sm text-red-700">
                  Please fix these errors before uploading
                </div>
              </div>
            )}

            {/* Upload Button */}
            {selectedFile && (
              <div className="mt-4">
                <button
                  onClick={handleUpload}
                  disabled={validationErrors.length > 0}
                  className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                    validationErrors.length > 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  <FontAwesomeIcon icon={faUpload} className="mr-2" />
                  Upload Marks
                </button>
              </div>
            )}

            {/* Preview Button */}
            {previewData.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faEye} className="mr-2" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Templates Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Download Templates</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    <button
                      onClick={() => downloadTemplate(template)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      <FontAwesomeIcon icon={faDownload} className="mr-1" />
                      Download
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Required fields:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.fields.map((field, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload History */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upload History</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {uploadHistory.map((upload) => (
              <div key={upload.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{upload.fileName}</h4>
                    <p className="text-sm text-gray-600">
                      {upload.course} - {upload.exam}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(upload.uploadDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(upload.status)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(upload.status)} className="mr-1" />
                      {upload.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Records</p>
                    <p className="font-medium text-gray-900">{upload.totalRecords}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Success</p>
                    <p className="font-medium text-green-600">{upload.successCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Errors</p>
                    <p className="font-medium text-red-600">{upload.errorCount}</p>
                  </div>
                </div>

                {upload.errors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">Errors:</p>
                    <div className="space-y-1">
                      {upload.errors.slice(0, 3).map((error, index) => (
                        <p key={index} className="text-xs text-red-600">
                          Row {error.row}: {error.message}
                        </p>
                      ))}
                      {upload.errors.length > 3 && (
                        <p className="text-xs text-gray-500">
                          ... and {upload.errors.length - 3} more errors
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Data Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {previewData.length > 0 && Object.keys(previewData[0]).filter(key => key !== 'rowNumber').map((header) => (
                      <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.slice(0, 10).map((row, index) => (
                    <tr key={index} className={validationErrors.some(e => e.row === row.rowNumber) ? 'bg-red-50' : ''}>
                      {Object.entries(row).filter(([key]) => key !== 'rowNumber').map(([key, value]) => (
                        <td key={key} className="px-4 py-2 text-sm text-gray-900">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {previewData.length > 10 && (
              <p className="text-sm text-gray-500 mt-2">
                Showing first 10 rows of {previewData.length} total rows
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
