import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, doc, setDoc, serverTimestamp, writeBatch, getDocs, query } from "firebase/firestore";
import * as XLSX from "xlsx";
import { FirebaseErrorHandler } from "../utils/errorHandler";

const BulkImport = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [mapping, setMapping] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [skipDuplicateCheck, setSkipDuplicateCheck] = useState(false);
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState(1);
  const [sheetInfo, setSheetInfo] = useState([]);
  
  // New state for year, section, department selection
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  
  const availableFields = [
    { name: "admissionNumber", label: "Admission Number", type: "text", required: true },
    { name: "name", label: "Full Name", type: "text", required: true },
    { name: "gender", label: "Gender", type: "select", required: false, options: ["Male", "Female", "Other"] },
    { name: "dateOfBirth", label: "Date of Birth", type: "date", required: false },
    { name: "email", label: "Email", type: "email", required: false },
    { name: "studentMobile", label: "Mobile Number", type: "tel", required: false },
    { name: "program", label: "Program", type: "select", required: false, options: ["B.Tech", "M.Tech", "MBA", "MCA", "BBA", "B.Sc", "M.Sc", "Ph.D"] },
    { name: "department", label: "Department", type: "select", required: false, options: ["Civil Engineering", "Electronics & Communication Engineering", "Electrical & Electronics Engineering", "Mechanical Engineering", "Basic Sciences & Humanities", "Management Studies", "Computer Applications", "Computer Science & Engineering", "Computer Science & Engineering (Artificial Intelligence)", "Computer Science & Engineering (Cyber Security)", "Computer Science & Technology", "Computer Science & Engineering (Data Science)", "Computer Science and Engineering (Artificial Intelligence and Machine Learning)", "Computer Science and Engineering (Networks)"] },
    { name: "year", label: "Year", type: "select", required: false, options: ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "6th Year", "7th Year", "8th Year", "9th Year", "10th Year", "11th Year", "12th Year", "First Year", "Second Year", "Third Year", "Fourth Year", "Fifth Year", "Sixth Year", "Seventh Year", "Eighth Year", "Ninth Year", "Tenth Year", "Eleventh Year", "Twelfth Year"] },
    { name: "section", label: "Section", type: "select", required: false, options: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi", "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega"] },
    { name: "fatherName", label: "Father's Name", type: "text", required: false },
    { name: "fatherMobile", label: "Father's Mobile", type: "tel", required: false },
    { name: "motherName", label: "Mother's Name", type: "text", required: false },
    { name: "address", label: "Address", type: "textarea", required: false },
    { name: "stateOfOrigin", label: "State", type: "text", required: false },
    { name: "district", label: "District", type: "text", required: false },
    { name: "pincode", label: "Pincode", type: "text", required: false },
    { name: "feeStructure", label: "Fee Structure", type: "select", required: false, options: ["Regular", "Scholarship", "Merit", "Management"] },
    { name: "totalFee", label: "Total Fee", type: "number", required: false },
    { name: "paymentStatus", label: "Payment Status", type: "select", required: false, options: ["Pending", "Partial", "Paid"] },
    // Additional fields from AddStudent component
    { name: "quota", label: "Quota", type: "text", required: false },
    { name: "aadhaar", label: "Aadhaar Number", type: "text", required: false },
    { name: "bloodGroup", label: "Blood Group", type: "select", required: false, options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    { name: "emergencyContact", label: "Emergency Contact", type: "tel", required: false },
    { name: "emergencyContactRelation", label: "Emergency Contact Relation", type: "text", required: false },
    { name: "alternateEmail", label: "Alternate Email", type: "email", required: false },
    { name: "parentEmail", label: "Parent Email", type: "email", required: false },
    { name: "admissionDate", label: "Admission Date", type: "date", required: false },
    { name: "academicYear", label: "Academic Year", type: "text", required: false },
    { name: "semester", label: "Semester", type: "text", required: false },
    { name: "branch", label: "Branch", type: "text", required: false },
    { name: "category", label: "Category", type: "select", required: false, options: ["General", "OBC", "SC", "ST", "EWS", "Other"] },
    { name: "religion", label: "Religion", type: "text", required: false },
    { name: "nationality", label: "Nationality", type: "text", required: false },
    { name: "guardianName", label: "Guardian Name", type: "text", required: false },
    { name: "guardianMobile", label: "Guardian Mobile", type: "tel", required: false },
    { name: "guardianEmail", label: "Guardian Email", type: "email", required: false },
    { name: "guardianAddress", label: "Guardian Address", type: "textarea", required: false },
    { name: "guardianRelation", label: "Guardian Relation", type: "text", required: false },
    { name: "previousInstitution", label: "Previous Institution", type: "text", required: false },
    { name: "previousPercentage", label: "Previous Percentage", type: "number", required: false },
    { name: "entranceExam", label: "Entrance Exam", type: "text", required: false },
    { name: "entranceRank", label: "Entrance Rank", type: "number", required: false },
    { name: "scholarship", label: "Scholarship", type: "text", required: false },
    { name: "hostelRequired", label: "Hostel Required", type: "select", required: false, options: ["Yes", "No"] },
    { name: "transportRequired", label: "Transport Required", type: "select", required: false, options: ["Yes", "No"] },
    { name: "paidAmount", label: "Paid Amount", type: "number", required: false },
    { name: "remainingAmount", label: "Remaining Amount", type: "number", required: false },
    { name: "paymentMethod", label: "Payment Method", type: "text", required: false },
    { name: "feeDueDate", label: "Fee Due Date", type: "date", required: false },
    { name: "installmentPlan", label: "Installment Plan", type: "text", required: false },
    { name: "discountApplied", label: "Discount Applied", type: "number", required: false },
    { name: "discountReason", label: "Discount Reason", type: "text", required: false },
    { name: "remarks", label: "Remarks", type: "textarea", required: false }
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

  // Get short department name for student ID
  const getDepartmentShortName = (department) => {
    const shortNames = {
      'Civil Engineering': 'CIVIL',
      'Electronics & Communication Engineering': 'ECE',
      'Electrical & Electronics Engineering': 'EEE',
      'Mechanical Engineering': 'MECH',
      'Basic Sciences & Humanities': 'BSH',
      'Management Studies': 'MGMT',
      'Computer Applications': 'MCA',
      'Computer Science & Engineering': 'CSE',
      'Computer Science & Engineering (Artificial Intelligence)': 'CSE_AI',
      'Computer Science & Engineering (Cyber Security)': 'CSE_CS',
      'Computer Science & Technology': 'CST',
      'Computer Science & Engineering (Data Science)': 'CSE_DS',
      'Computer Science and Engineering (Artificial Intelligence and Machine Learning)': 'CSE_AIML',
      'Computer Science and Engineering (Networks)': 'CSE_NET'
    };
    return shortNames[department] || 'UNKNOWN';
  };

  // Sanitize department name for Firestore collection paths
  // This function converts department names with spaces and special characters
  // into valid Firestore collection names that don't break the path structure
  const sanitizeDepartmentForPath = (department) => {
    const shortNames = {
      'Civil Engineering': 'CivilEngineering',
      'Electronics & Communication Engineering': 'ElectronicsCommunicationEngineering',
      'Electrical & Electronics Engineering': 'ElectricalElectronicsEngineering',
      'Mechanical Engineering': 'MechanicalEngineering',
      'Basic Sciences & Humanities': 'BasicSciencesHumanities',
      'Management Studies': 'ManagementStudies',
      'Computer Applications': 'ComputerApplications',
      'Computer Science & Engineering': 'ComputerScienceEngineering',
      'Computer Science & Engineering (Artificial Intelligence)': 'ComputerScienceEngineeringAI',
      'Computer Science & Engineering (Cyber Security)': 'ComputerScienceEngineeringCS',
      'Computer Science & Technology': 'ComputerScienceTechnology',
      'Computer Science & Engineering (Data Science)': 'ComputerScienceEngineeringDS',
      'Computer Science and Engineering (Artificial Intelligence and Machine Learning)': 'ComputerScienceEngineeringAIML',
      'Computer Science and Engineering (Networks)': 'ComputerScienceEngineeringNetworks'
    };
    return shortNames[department] || 'Unknown';
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

  // Parse year and section from combined field (e.g., "III A" -> year: "III", section: "A")
  const parseYearAndSection = (value) => {
    if (!value) return { year: '', section: '' };
    
    const str = value.toString().trim();
    
    // Handle patterns like "III A", "II B", "I C", etc. (Roman numerals + single letter)
    const yearSectionMatch = str.match(/^(I{1,3}|IV|V{1,3}|IX|X{1,3}|XI|XII)\s*([A-Z])$/i);
    if (yearSectionMatch) {
      return {
        year: yearSectionMatch[1].toUpperCase(),
        section: yearSectionMatch[2].toUpperCase()
      };
    }
    
    // Handle patterns like "IIIA", "IIB", etc. (Roman numerals + single letter, no space)
    const combinedMatch = str.match(/^(I{1,3}|IV|V{1,3}|IX|X{1,3}|XI|XII)([A-Z])$/i);
    if (combinedMatch) {
      return {
        year: combinedMatch[1].toUpperCase(),
        section: combinedMatch[2].toUpperCase()
      };
    }
    
    // Handle patterns like "1st Year A", "2nd Year B", etc.
    const numericYearMatch = str.match(/^(\d+(?:st|nd|rd|th)\s+Year)\s+([A-Z])$/i);
    if (numericYearMatch) {
      return {
        year: numericYearMatch[1],
        section: numericYearMatch[2].toUpperCase()
      };
    }
    
    // Handle patterns like "First Year A", "Second Year B", etc.
    const writtenYearMatch = str.match(/^(First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth)\s+Year\s+([A-Z])$/i);
    if (writtenYearMatch) {
      return {
        year: writtenYearMatch[1] + ' Year',
        section: writtenYearMatch[2].toUpperCase()
      };
    }
    
    // Handle patterns like "Year I A", "Year II B", etc.
    const yearFirstMatch = str.match(/^Year\s+(I{1,3}|IV|V{1,3}|IX|X{1,3}|XI|XII)\s+([A-Z])$/i);
    if (yearFirstMatch) {
      return {
        year: yearFirstMatch[1].toUpperCase(),
        section: yearFirstMatch[2].toUpperCase()
      };
    }
    
    // If it's just a year (Roman numerals)
    if (/^(I{1,3}|IV|V{1,3}|IX|X{1,3}|XI|XII)$/i.test(str)) {
      return { year: str.toUpperCase(), section: '' };
    }
    
    // If it's just a year (numeric)
    if (/^\d+(?:st|nd|rd|th)\s+Year$/i.test(str)) {
      return { year: str, section: '' };
    }
    
    // If it's just a year (written)
    if (/^(First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth)\s+Year$/i.test(str)) {
      return { year: str, section: '' };
    }
    
    // If it's just a section (single letter)
    if (/^[A-Z]$/i.test(str)) {
      return { year: '', section: str.toUpperCase() };
    }
    
    // If it's just a section (Greek letter)
    const greekLetters = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'];
    if (greekLetters.includes(str)) {
      return { year: '', section: str };
    }
    
    return { year: '', section: '' };
  };

  // Sort data by year and section for better organization
  const sortDataByYearAndSection = (rows, headers) => {
    // Find year and section column indices
    const yearIndex = headers.findIndex(header => 
      header && (header.toLowerCase().includes('year') || header.toLowerCase().includes('class'))
    );
    const sectionIndex = headers.findIndex(header => 
      header && (header.toLowerCase().includes('section') || header.toLowerCase().includes('div'))
    );

    if (yearIndex === -1 && sectionIndex === -1) {
      return rows; // No sorting if columns not found
    }

    return rows.filter(row => Array.isArray(row)).sort((a, b) => {
      // Sort by year first
      if (yearIndex !== -1) {
        let yearA = a[yearIndex] || '';
        let yearB = b[yearIndex] || '';
        
        // Parse year and section if they're combined
        if (yearIndex === sectionIndex) {
          const parsedA = parseYearAndSection(yearA);
          const parsedB = parseYearAndSection(yearB);
          yearA = parsedA.year;
          yearB = parsedB.year;
        }
        
        // Convert year to number for proper sorting
        const yearOrder = { 
          'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12,
          '1ST YEAR': 1, '2ND YEAR': 2, '3RD YEAR': 3, '4TH YEAR': 4, '5TH YEAR': 5, '6TH YEAR': 6, '7TH YEAR': 7, '8TH YEAR': 8, '9TH YEAR': 9, '10TH YEAR': 10, '11TH YEAR': 11, '12TH YEAR': 12,
          'FIRST YEAR': 1, 'SECOND YEAR': 2, 'THIRD YEAR': 3, 'FOURTH YEAR': 4, 'FIFTH YEAR': 5, 'SIXTH YEAR': 6, 'SEVENTH YEAR': 7, 'EIGHTH YEAR': 8, 'NINTH YEAR': 9, 'TENTH YEAR': 10, 'ELEVENTH YEAR': 11, 'TWELFTH YEAR': 12
        };
        const yearAOrder = yearOrder[yearA.toString().toUpperCase()] || 0;
        const yearBOrder = yearOrder[yearB.toString().toUpperCase()] || 0;
        
        if (yearAOrder !== yearBOrder) {
          return yearAOrder - yearBOrder;
        }
      }

      // Then sort by section
      if (sectionIndex !== -1) {
        let sectionA = a[sectionIndex] || '';
        let sectionB = b[sectionIndex] || '';
        
        // Parse year and section if they're combined
        if (yearIndex === sectionIndex) {
          const parsedA = parseYearAndSection(sectionA);
          const parsedB = parseYearAndSection(sectionB);
          sectionA = parsedA.section;
          sectionB = parsedB.section;
        }
        
        if (sectionA !== sectionB) {
          // Handle Greek letters for proper sorting
          const sectionOrder = {
            'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9, 'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17, 'R': 18, 'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25, 'Z': 26,
            'ALPHA': 27, 'BETA': 28, 'GAMMA': 29, 'DELTA': 30, 'EPSILON': 31, 'ZETA': 32, 'ETA': 33, 'THETA': 34, 'IOTA': 35, 'KAPPA': 36, 'LAMBDA': 37, 'MU': 38, 'NU': 39, 'XI': 40, 'OMICRON': 41, 'PI': 42, 'RHO': 43, 'SIGMA': 44, 'TAU': 45, 'UPSILON': 46, 'PHI': 47, 'CHI': 48, 'PSI': 49, 'OMEGA': 50
          };
          const sectionAOrder = sectionOrder[sectionA.toString().toUpperCase()] || 999;
          const sectionBOrder = sectionOrder[sectionB.toString().toUpperCase()] || 999;
          return sectionAOrder - sectionBOrder;
        }
      }

      // Finally sort by admission number or name for consistency
      const admissionIndex = headers.findIndex(header => 
        header && (header.toLowerCase().includes('admission') || header.toLowerCase().includes('roll'))
      );
      const nameIndex = headers.findIndex(header => 
        header && (header.toLowerCase().includes('name') || header.toLowerCase().includes('student'))
      );

      if (admissionIndex !== -1) {
        const admissionA = a[admissionIndex] || '';
        const admissionB = b[admissionIndex] || '';
        return admissionA.localeCompare(admissionB);
      }

      if (nameIndex !== -1) {
        const nameA = a[nameIndex] || '';
        const nameB = b[nameIndex] || '';
        return nameA.localeCompare(nameB);
      }

      return 0;
    });
  };

  // Group data by year and section for better organization
  const groupDataByYearAndSection = (rows, headers) => {
    const yearIndex = headers.findIndex(header => 
      header && (header.toLowerCase().includes('year') || header.toLowerCase().includes('class'))
    );
    const sectionIndex = headers.findIndex(header => 
      header && (header.toLowerCase().includes('section') || header.toLowerCase().includes('div'))
    );

    if (yearIndex === -1 && sectionIndex === -1) {
      return { 'All Students': rows };
    }

    const groups = {};
    
    rows.forEach((row, index) => {
      // Ensure row is an array
      if (!Array.isArray(row)) {
        console.warn('Invalid row data at index', index, row);
        return;
      }

      let year = yearIndex !== -1 ? (row[yearIndex] || 'Unknown') : 'All';
      let section = sectionIndex !== -1 ? (row[sectionIndex] || 'Unknown') : 'All';
      
      // Parse year and section if they're combined
      if (yearIndex === sectionIndex && yearIndex !== -1) {
        const parsed = parseYearAndSection(row[yearIndex]);
        year = parsed.year || 'Unknown';
        section = parsed.section || 'Unknown';
      }
      
      const groupKey = `${year} - Section ${section}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push({ ...row, originalIndex: index });
    });

    return groups;
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
        
        // Process all sheets
        let allData = [];
        let allHeaders = null;
        let sheetInfo = [];

        workbook.SheetNames.forEach((sheetName, sheetIndex) => {
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with proper date handling
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            raw: false,
            dateNF: 'yyyy-mm-dd'
          });

          if (jsonData.length >= 2) {
            const headers = jsonData[0];
            const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));

            if (rows.length > 0) {
              // Parse year and section from sheet name (e.g., "II A", "III B")
              const parsed = parseYearAndSection(sheetName);
              const year = parsed.year || 'Unknown';
              const section = parsed.section || 'Unknown';
              
              // Add year and section info to each row
              const enrichedRows = rows.map(row => {
                const newRow = [...row];
                // Add year and section columns if they don't exist
                if (!headers.includes('Year')) {
                  headers.push('Year');
                  newRow.push(year);
                }
                if (!headers.includes('Section')) {
                  headers.push('Section');
                  newRow.push(section);
                }
                return newRow;
              });
              
              // Store sheet information
              sheetInfo.push({
                name: sheetName,
                year: year,
                section: section,
                rowCount: enrichedRows.length,
                startIndex: allData.length
              });
              
              // Merge headers (use the longest header array)
              if (!allHeaders || headers.length > allHeaders.length) {
                allHeaders = headers;
              }
              
              // Add rows to all data
              allData.push(...enrichedRows);
            }
          }
        });

        if (allData.length === 0) {
          alert('No data found in any sheet of the Excel file');
          return;
        }

        if (allData.length > 1000) {
          alert('Maximum 1000 rows allowed per import');
          return;
        }

        // Normalize row lengths to match header length
        const normalizedData = allData.map(row => {
          const normalizedRow = [...row];
          // Ensure row has same length as headers
          while (normalizedRow.length < allHeaders.length) {
            normalizedRow.push('');
          }
          return normalizedRow;
        });

        // Process dates in the data
        const processedRows = normalizedData.map(row => {
          return row.map((cell, index) => {
            // Check if this column might be a date (based on header)
            const header = allHeaders[index];
            if (header && (header.toLowerCase().includes('date') || header.toLowerCase().includes('dob'))) {
              return normalizeDate(cell);
            }
            return cell;
          });
        });

        // Sort data by year and section for better organization
        const sortedRows = sortDataByYearAndSection(processedRows, allHeaders);
        
        // Filter data to only include the selected year and section if specified
        let filteredRows = sortedRows;
        if (selectedYear && selectedSection) {
          filteredRows = sortedRows.filter(row => {
            const yearIndex = allHeaders.findIndex(header => 
              header && (header.toLowerCase().includes('year') || header.toLowerCase().includes('class'))
            );
            const sectionIndex = allHeaders.findIndex(header => 
              header && (header.toLowerCase().includes('section') || header.toLowerCase().includes('div'))
            );
            
            if (yearIndex !== -1 && sectionIndex !== -1) {
              const rowYear = row[yearIndex] || '';
              const rowSection = row[sectionIndex] || '';
              
              // Check if this row matches the selected year and section
              return rowYear.toString().toUpperCase() === selectedYear.toUpperCase() && 
                     rowSection.toString().toUpperCase() === selectedSection.toUpperCase();
            }
            return true; // Include if we can't determine year/section
          });
        }
        
        const grouped = groupDataByYearAndSection(filteredRows, allHeaders);

        // Ensure data is properly formatted
        const finalData = filteredRows.filter(row => Array.isArray(row) && row.length > 0);
        const finalGrouped = {};
        
        Object.entries(grouped).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            finalGrouped[key] = value.filter(row => Array.isArray(row));
          }
        });

        setData(finalData);
        setGroupedData(finalGrouped);
        setSheetInfo(sheetInfo);
        
        console.log('Processed sheets:', sheetInfo);
        console.log('Total rows:', allData.length);

        // Enhanced auto-mapping with better matching logic
        const autoMapping = {};
        allHeaders.forEach((header, index) => {
          if (!header) return;
          
          const cleanHeader = header.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
          const originalHeader = header.toString().toLowerCase();
          const spaceCleanedHeader = originalHeader.replace(/\s+/g, '');
          
          // Enhanced variations mapping with priority
          const variations = {
            // Admission Number variations - more comprehensive
            'admissionnumber': 'admissionNumber',
            'admissionno': 'admissionNumber',
            'admission': 'admissionNumber',
            'rollno': 'admissionNumber',
            'rollnumber': 'admissionNumber',
            'roll': 'admissionNumber',
            'roll.': 'admissionNumber',
            'roll no': 'admissionNumber',
            'roll number': 'admissionNumber',
            'rollno.': 'admissionNumber',
            'roll.number': 'admissionNumber',
            'regno': 'admissionNumber',
            'registration': 'admissionNumber',
            'studentid': 'admissionNumber',
            'id': 'admissionNumber',
            'student_id': 'admissionNumber',
            
            // Name variations
            'fullname': 'name',
            'studentname': 'name',
            'student_name': 'name',
            'name': 'name',
            'student': 'name',
            'candidate': 'name',
            'student name': 'name',
            
            // Date of Birth variations
            'dob': 'dateOfBirth',
            'birthdate': 'dateOfBirth',
            'dateofbirth': 'dateOfBirth',
            'birth': 'dateOfBirth',
            'date_of_birth': 'dateOfBirth',
            
            // Mobile variations
            'mobilenumber': 'studentMobile',
            'mobile': 'studentMobile',
            'phone': 'studentMobile',
            'contact': 'studentMobile',
            'phonenumber': 'studentMobile',
            'cell': 'studentMobile',
            'student mobile': 'studentMobile',
            'studentmobile': 'studentMobile',
            
            // Gender variations
            'gender': 'gender',
            'sex': 'gender',
            
            // Email variations
            'email': 'email',
            'emailid': 'email',
            'mail': 'email',
            
            // Father's name variations
            'fathername': 'fatherName',
            'father_name': 'fatherName',
            'father': 'fatherName',
            'fathersname': 'fatherName',
            'father name': 'fatherName',
            
            // Father's mobile variations
            'fathermobile': 'fatherMobile',
            'father_mobile': 'fatherMobile',
            'fatherphone': 'fatherMobile',
            'father_phone': 'fatherMobile',
            'father mobile': 'fatherMobile',
            
            // Mother's name variations
            'mothername': 'motherName',
            'mother_name': 'motherName',
            'mother': 'motherName',
            'mothersname': 'motherName',
            'mother name': 'motherName',
            
            // Address variations
            'address': 'address',
            'addr': 'address',
            'location': 'address',
            'permanentaddress': 'address',
            'permanent_address': 'address',
            'permanent address': 'address',
            
            // Aadhaar variations
            'aadhaar': 'aadhaar',
            'aadhar': 'aadhaar',
            'aadhaarnumber': 'aadhaar',
            'aadharno': 'aadhaar',
            
            // Quota variations
            'quota': 'quota',
            'category': 'quota',
            'reservation': 'quota',
            
            // Year variations
            'year': 'year',
            'class': 'year',
            'grade': 'year',
            'standard': 'year',
            
            // Section variations
            'section': 'section',
            'div': 'section',
            'division': 'section',
            'group': 'section',
            
            // Department variations
            'department': 'department',
            'dept': 'department',
            'branch': 'department',
            'stream': 'department',
            
            // Program variations
            'program': 'program',
            'course': 'program',
            'degree': 'program',
            'qualification': 'program'
          };
          
          // Try exact match first
          if (variations[cleanHeader]) {
            autoMapping[variations[cleanHeader]] = index;
            console.log(`✅ Mapped "${header}" to "${variations[cleanHeader]}" (exact match)`);
            return;
          }
          
          // Try space-cleaned match
          if (variations[spaceCleanedHeader]) {
            autoMapping[variations[spaceCleanedHeader]] = index;
            console.log(`✅ Mapped "${header}" to "${variations[spaceCleanedHeader]}" (space-cleaned match)`);
            return;
          }
          
          // Try partial match
          for (const [key, fieldName] of Object.entries(variations)) {
            if (cleanHeader.includes(key) || key.includes(cleanHeader)) {
              autoMapping[fieldName] = index;
              console.log(`✅ Mapped "${header}" to "${fieldName}" (partial match with "${key}")`);
              break;
            }
          }
        });
        
        // Apply auto-mapping
        setMapping(autoMapping);
        setStep(2);

        // Log the mapping results for debugging
        console.log('📋 Auto-mapping results:', autoMapping);
        
        // Auto-detect Year and Section from data if not mapped
        const enhancedMapping = { ...autoMapping };
        
        // Check if we have unmapped columns that might be Year/Section
        allHeaders.forEach((header, index) => {
          const headerLower = header.toString().toLowerCase();
          
          // If we have a column with single letters (A, B, C) and no year mapping, map it to section
          if (!enhancedMapping.section && (headerLower.includes('section') || headerLower.includes('div') || headerLower.includes('group'))) {
            enhancedMapping.section = index;
            console.log(`🔧 Auto-mapped "${header}" to section`);
          }
          
          // If we have a column that might be year but contains letters, it's likely section
          if (!enhancedMapping.section && !enhancedMapping.year) {
            // Check if this column contains mostly single letters
            const sampleValues = allData.slice(0, 10).map(row => row[index]).filter(val => val);
            const letterValues = sampleValues.filter(val => /^[A-Z]$/.test(val.toString().trim()));
            
            if (letterValues.length > sampleValues.length * 0.5) {
              enhancedMapping.section = index;
              console.log(`🔧 Auto-mapped "${header}" to section (contains letters: ${letterValues.join(', ')})`);
            }
          }
        });
        
        if (enhancedMapping.section !== autoMapping.section) {
          console.log('🔧 Applying enhanced mapping with section detection:', enhancedMapping);
          setMapping(enhancedMapping);
        }
        
        // Auto-detect year from sheet names if available
        if (sheetInfo && sheetInfo.length > 0) {
          const firstSheet = sheetInfo[0];
          console.log('📋 Sheet info:', firstSheet);
          
          // Try to extract year from sheet name (e.g., "II A" → Year: "II", Section: "A")
          if (firstSheet.name) {
            const sheetName = firstSheet.name;
            const yearMatch = sheetName.match(/^(I{1,3}|IV|V|VI|VII|VIII|IX|X|XI|XII|1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th|First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth)/i);
            
            if (yearMatch) {
              const detectedYear = yearMatch[1];
              console.log(`🔧 Detected year from sheet name "${sheetName}": ${detectedYear}`);
              
              // Set the detected year for all students in this import
              setSelectedYear(detectedYear);
            }
          }
        }
        
        // Check if required fields are mapped
        const requiredFields = ['admissionNumber', 'name'];
        const missingRequired = requiredFields.filter(field => !autoMapping[field]);
        
        if (missingRequired.length > 0) {
          console.warn('⚠️ Missing required fields:', missingRequired);
          console.log('Available headers:', allHeaders);
          
          // Try to manually map missing required fields
          const manualMapping = { ...autoMapping };
          
          // Manual override for common cases
          allHeaders.forEach((header, index) => {
            const headerLower = header.toString().toLowerCase();
            
            // Manual mapping for "Roll. No" → admissionNumber
            if (headerLower.includes('roll') && !manualMapping.admissionNumber) {
              manualMapping.admissionNumber = index;
              console.log(`🔧 Manual override: "${header}" → admissionNumber`);
            }
            
            // Manual mapping for "Student Name" → name
            if (headerLower.includes('student') && headerLower.includes('name') && !manualMapping.name) {
              manualMapping.name = index;
              console.log(`🔧 Manual override: "${header}" → name`);
            }
          });
          
          if (manualMapping.admissionNumber !== undefined || manualMapping.name !== undefined) {
            console.log('🔧 Applying manual mapping overrides:', manualMapping);
            setMapping(manualMapping);
          }
        } else {
          console.log('✅ All required fields mapped successfully!');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file. Please check the file format and try again.');
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleYearSectionDepartment = () => {
    if (!selectedDepartment || !selectedYear || !selectedSection) {
      alert('Please select Department, Year, and Section before proceeding.');
      return;
    }
    setStep(3);
    // Run validation after a short delay to ensure state is updated
    setTimeout(() => {
      validateData();
    }, 100);
  };

  // Data cleaning function to fix common Excel import issues
  const cleanData = (rawData) => {
    return rawData.map((row, rowIndex) => {
      const cleanedRow = [...row];
      
      // Clean each cell in the row
      Object.keys(mapping).forEach(fieldName => {
        const columnIndex = mapping[fieldName];
        if (columnIndex !== undefined && cleanedRow[columnIndex] !== undefined) {
          let value = cleanedRow[columnIndex];
          
          // Clean phone numbers - allow 9-11 digits, only trim if more than 11
          if (fieldName === 'studentMobile' || fieldName === 'fatherMobile') {
            const cleanPhone = value.toString().replace(/\D/g, '');
            if (cleanPhone.length > 11) {
              // Take only the first 11 digits if more than 11
              cleanedRow[columnIndex] = cleanPhone.substring(0, 11);
              console.log(`🔧 Fixed phone number in row ${rowIndex + 2}: ${value} → ${cleanedRow[columnIndex]}`);
            } else if (cleanPhone.length >= 9 && cleanPhone.length <= 11) {
              // Keep as is if 9-11 digits (valid range)
              cleanedRow[columnIndex] = cleanPhone;
              console.log(`✅ Phone number accepted in row ${rowIndex + 2}: ${cleanPhone} (${cleanPhone.length} digits)`);
            } else if (cleanPhone.length > 0) {
              // Log warning for very short numbers but don't clear them
              console.log(`⚠️ Phone number may be too short in row ${rowIndex + 2}: ${value} (${cleanPhone.length} digits)`);
            }
          }
          
          // Clean year values - if it's a single letter (A, B, C), it's likely a section, not year
          if (fieldName === 'year') {
            const yearValue = value.toString().trim();
            if (yearValue.length === 1 && /^[A-Z]$/.test(yearValue)) {
              // This is likely a section, not a year - clear it
              cleanedRow[columnIndex] = '';
              console.log(`🔧 Cleared year value in row ${rowIndex + 2}: "${value}" (likely a section)`);
            }
          }
          
          // Clean gender values - remove header-like values
          if (fieldName === 'gender') {
            const genderValue = value.toString().trim();
            if (genderValue.toLowerCase() === 'gender') {
              cleanedRow[columnIndex] = '';
              console.log(`🔧 Cleared gender value in row ${rowIndex + 2}: "${value}" (header)`);
            }
          }
        }
      });
      
      return cleanedRow;
    });
  };

  const validateData = () => {
    const newErrors = [];
    
    // Clean the data first
    const cleanedData = cleanData(data);
    
    console.log('🔍 Validation Debug Info:');
    console.log('Current mapping:', mapping);
    console.log('Available fields:', availableFields.map(f => ({ name: f.name, required: f.required })));
    console.log('Data sample (cleaned):', cleanedData.slice(0, 2));

    // First, check for unmapped required fields (only admission number and name)
    availableFields.forEach(field => {
      if (field.required && mapping[field.name] === undefined) {
        console.log(`❌ Required field "${field.name}" (${field.label}) is not mapped!`);
        newErrors.push({
          type: 'mapping',
          field: field.label,
          message: `${field.label} is required but not mapped`,
          value: 'Not mapped'
        });
      } else if (field.required) {
        console.log(`✅ Required field "${field.name}" (${field.label}) is mapped to index ${mapping[field.name]}`);
      }
    });

    // Then validate only required fields and mapped optional fields with cleaned data
    cleanedData.forEach((row, rowIndex) => {
      const rowNumber = rowIndex + 2;

      availableFields.forEach(field => {
        if (mapping[field.name] !== undefined) {
          const value = row[mapping[field.name]];
          
          // Required field validation (only for admission number and name)
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

          // Skip validation for empty optional fields
          if (!value || value.toString().trim() === '') {
            return;
          }

          const stringValue = value.toString().trim();

          // Only validate email if it's not empty and looks like an email
          if (field.type === 'email' && stringValue.includes('@')) {
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

          // Enhanced phone validation with flexible length (9-11 digits)
          if (field.type === 'tel' && /\d/.test(stringValue)) {
            const cleanPhone = stringValue.replace(/\D/g, '');
            
            // Allow 9-11 digits for flexibility
            if (cleanPhone.length < 9 || cleanPhone.length > 11) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
                field: field.label,
                message: `${field.label} must be 9-11 digits (found ${cleanPhone.length} digits)`,
                value: value
              });
            }
            // Only check prefix if it's 10 digits (standard mobile format)
            else if (cleanPhone.length === 10 && !/^[6-9]/.test(cleanPhone)) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
                field: field.label,
                message: `${field.label} must start with 6, 7, 8, or 9`,
                value: value
              });
            }
          }

          // Enhanced select validation with better error handling
          if (field.type === 'select' && field.options && stringValue) {
            // Skip validation if the value looks like a header (case-insensitive match with field label)
            const fieldLabelLower = field.label.toLowerCase();
            const valueLower = stringValue.toLowerCase();
            
            if (fieldLabelLower === valueLower || 
                valueLower === 'gender' || 
                valueLower === 'year' || 
                valueLower === 'section' ||
                valueLower === 'department') {
              // This is likely a header row, skip validation
              console.log(`⚠️ Skipping validation for header-like value: "${stringValue}" in field "${field.label}"`);
              return;
            }
            
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

          // Only validate number fields if the value looks like a number
          if (field.type === 'number' && !isNaN(parseFloat(stringValue))) {
            if (parseFloat(stringValue) < 0) {
              newErrors.push({
                type: 'validation',
                row: rowNumber,
                field: field.label,
                message: `${field.label} must be a valid positive number`,
                value: value
              });
            }
          }

          // Only validate date fields if the value looks like a date
          if (field.type === 'date' && stringValue) {
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

    // Check for duplicate admission numbers with more flexible handling
    const admissionNumbers = new Set();
    const duplicates = [];
    
    if (!skipDuplicateCheck) {
      data.forEach((row, index) => {
        const admissionIndex = mapping.admissionNumber;
        if (admissionIndex !== undefined && row[admissionIndex]) {
          const admissionNumber = row[admissionIndex].toString().trim();
          if (admissionNumbers.has(admissionNumber)) {
            duplicates.push({ row: index + 2, admissionNumber });
          } else {
            admissionNumbers.add(admissionNumber);
          }
        }
      });

      if (duplicates.length > 0) {
        const duplicateList = duplicates.map(d => `Row ${d.row}: ${d.admissionNumber}`).join('\n');
        const shouldContinue = confirm(
          `Found ${duplicates.length} duplicate admission numbers:\n${duplicateList}\n\n` +
          `⚠️ WARNING: Duplicates may cause data conflicts.\n\n` +
          `Do you want to continue with the import anyway?\n` +
          `(Click OK to continue, Cancel to fix duplicates first)`
        );
        
        if (!shouldContinue) {
          return;
        }
        
        console.log(`⚠️ Proceeding with import despite ${duplicates.length} duplicate admission numbers`);
      }
    } else {
      console.log(`⚠️ Skipping duplicate admission number check as requested`);
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let successCount = 0;
      let errorCount = 0;
      let currentBatch = writeBatch(db);
      let batchCount = 0;

             // Use sorted data for import
       const sortedData = [...data];
       
       for (let i = 0; i < sortedData.length; i++) {
         const row = sortedData[i];

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

                     // Override with selected department, year, section if not mapped in Excel
           if (selectedDepartment) studentData.department = selectedDepartment;
           
           // Handle year and section parsing
           if (selectedYear && selectedSection) {
             studentData.year = selectedYear;
             studentData.section = selectedSection;
           } else {
             // Try to parse from Excel data if available
             const yearIndex = mapping.year;
             const sectionIndex = mapping.section;
             
             if (yearIndex !== undefined && sectionIndex !== undefined) {
               if (yearIndex === sectionIndex) {
                 // Combined field like "III A"
                 const parsed = parseYearAndSection(row[yearIndex]);
                 studentData.year = parsed.year || selectedYear || 'Unknown';
                 studentData.section = parsed.section || selectedSection || 'Unknown';
               } else {
                 // Separate fields
                 studentData.year = row[yearIndex] || selectedYear || 'Unknown';
                 studentData.section = row[sectionIndex] || selectedSection || 'Unknown';
               }
             } else {
               studentData.year = selectedYear || 'Unknown';
               studentData.section = selectedSection || 'Unknown';
             }
           }

                               // Create a shorter, more manageable student ID with duplicate handling
          const deptShort = getDepartmentShortName(studentData.department);
          let baseAdmissionNumber = studentData.admissionNumber || `AUTO_${Date.now()}_${i}`;
          
          // Handle duplicate admission numbers by adding a suffix
          let studentId = `${deptShort}_${studentData.year || 'U'}_${studentData.section || 'U'}_${baseAdmissionNumber}`;
          
          // Check if this admission number is a duplicate and add suffix if needed
          if (admissionNumbers.has(baseAdmissionNumber)) {
            let counter = 1;
            let newAdmissionNumber = baseAdmissionNumber;
            
            // Keep trying until we find a unique admission number
            while (admissionNumbers.has(newAdmissionNumber)) {
              newAdmissionNumber = `${baseAdmissionNumber}_${counter}`;
              counter++;
            }
            
            // Update the admission number and student ID
            studentData.admissionNumber = newAdmissionNumber;
            studentId = `${deptShort}_${studentData.year || 'U'}_${studentData.section || 'U'}_${newAdmissionNumber}`;
            console.log(`🔄 Modified duplicate admission number: ${baseAdmissionNumber} → ${newAdmissionNumber}`);
          }
          
          // Add the admission number to the set to track for future duplicates
          admissionNumbers.add(studentData.admissionNumber);
          
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

          // Validate required fields before saving
          if (!finalStudentData.admissionNumber || !finalStudentData.name) {
            console.error(`Row ${i + 1}: Missing required fields - Admission Number: ${finalStudentData.admissionNumber}, Name: ${finalStudentData.name}`);
            errorCount++;
            continue;
          }

          if (finalStudentData.totalFee && finalStudentData.paidAmount) {
            finalStudentData.remainingAmount = parseFloat(finalStudentData.totalFee) - parseFloat(finalStudentData.paidAmount);
          } else if (finalStudentData.totalFee) {
            finalStudentData.remainingAmount = parseFloat(finalStudentData.totalFee);
          }

                               // Store in the hierarchical structure: students/{department}/{year}/{section}/{studentId}
          // This creates a clean department → year → section → student structure
          // Note: We sanitize the department name to avoid Firestore collection path issues
          // with spaces and special characters in department names
          const sanitizedDepartment = sanitizeDepartmentForPath(studentData.department || 'Unknown');
          const sanitizedYear = (studentData.year || 'Unknown').toString().replace(/[^a-zA-Z0-9]/g, '');
          const sanitizedSection = (studentData.section || 'Unknown').toString().replace(/[^a-zA-Z0-9]/g, '');
          
          // Create the full path as a document reference to avoid collection path issues
          const studentDoc = doc(db, `students/${sanitizedDepartment}/${sanitizedYear}/${sanitizedSection}/${studentId}`);
          
          // Debug logging to verify the path structure
          console.log(`Creating document at path: students/${sanitizedDepartment}/${sanitizedYear}/${sanitizedSection}/${studentId}`);
          
          currentBatch.set(studentDoc, finalStudentData);

          // Also store in general students collection for easy querying
          // This is allowed by the security rules for admins, controllers, and HODs
          const generalStudentsRef = collection(db, "students");
          const generalStudentDoc = doc(generalStudentsRef, studentId);
          currentBatch.set(generalStudentDoc, finalStudentData);

          successCount++;
          batchCount++;

          // Commit batch every 50 operations to avoid hitting limits
          if (batchCount >= 50) {
            await currentBatch.commit();
            currentBatch = writeBatch(db);
            batchCount = 0;
          }
                 } catch (error) {
           console.error(`Error processing row ${i + 1}:`, error);
           console.error(`Row data:`, row);
           console.error(`Processed student data:`, studentData);
           
           // Handle errors with better user feedback
           const errorInfo = await FirebaseErrorHandler.handleError(error, `BulkImport-Row${i + 1}`);
           
           if (errorInfo.type === 'connectivity') {
             // Stop the import process for connectivity issues
             setIsUploading(false);
             setUploadProgress(0);
             FirebaseErrorHandler.showUserFriendlyError(errorInfo);
             return;
           }
           
           // Log specific error details for debugging
           if (error.message?.includes('collection reference')) {
             console.error(`Collection reference error for department: ${studentData.department}`);
           }
           
           errorCount++;
         }

        const progress = ((i + 1) / data.length) * 100;
        setUploadProgress(progress);
      }

      // Commit any remaining operations
      if (batchCount > 0) {
        await currentBatch.commit();
      }

      const message = `Import completed!\n\n✅ Successfully imported: ${successCount} students\n❌ Failed: ${errorCount} students`;
      alert(message);
      
      if (onSuccess) {
        onSuccess(successCount);
      }

      setStep(4);
         } catch (error) {
       console.error('Import error:', error);
       
       // Handle import errors with better user feedback
       const errorInfo = await FirebaseErrorHandler.handleError(error, 'BulkImport-Main');
       FirebaseErrorHandler.showUserFriendlyError(errorInfo);
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
         ['TEST001', 'Test Student 1', 'Male', '2000-01-01', 'test1@example.com', '9876543210', 'B.Tech', 'Computer Science & Engineering', 'I', 'A', 'Test Father 1', '9876543211', 'Test Mother 1', 'Test Address 1', 'Test State', 'Test District', '123456', 'Regular', '100000', 'Pending'],
         ['', 'Test Student 2', 'Female', '2000-02-01', 'test2@example.com', '9876543212', 'B.Tech', 'Computer Science & Engineering', 'I', 'A', 'Test Father 2', '9876543213', 'Test Mother 2', 'Test Address 2', 'Test State', 'Test District', '123456', 'Regular', '100000', 'Pending'],
         ['TEST003', 'Test Student 3', 'Male', '2000-03-01', 'test3@example.com', '9876543214', 'B.Tech', 'Computer Science & Engineering', 'I', 'B', 'Test Father 3', '9876543215', 'Test Mother 3', 'Test Address 3', 'Test State', 'Test District', '123456', 'Regular', '100000', 'Pending'],
         ['', 'Test Student 4', 'Female', '2000-04-01', 'test4@example.com', '9876543216', 'B.Tech', 'Computer Science & Engineering', 'II', 'A', 'Test Father 4', '9876543217', 'Test Mother 4', 'Test Address 4', 'Test State', 'Test District', '123456', 'Regular', '100000', 'Pending'],
         ['TEST005', 'Test Student 5', 'Male', '2000-05-01', 'test5@example.com', '9876543218', 'B.Tech', 'Computer Science & Engineering', 'II', 'B', 'Test Father 5', '9876543219', 'Test Mother 5', 'Test Address 5', 'Test State', 'Test District', '123456', 'Regular', '100000', 'Pending']
       ];
     
     const headers = testData[0];
     const rows = testData.slice(1);
     
     // Sort and group the test data
     const sortedRows = sortDataByYearAndSection(rows, headers);
     const grouped = groupDataByYearAndSection(sortedRows, headers);
     
     setData(sortedRows);
     setGroupedData(grouped);
     setMapping({
       admissionNumber: 0, name: 1, gender: 2, dateOfBirth: 3, email: 4, studentMobile: 5,
       program: 6, department: 7, year: 8, section: 9, fatherName: 10, fatherMobile: 11,
       motherName: 12, address: 13, stateOfOrigin: 14, district: 15, pincode: 16,
       feeStructure: 17, totalFee: 18, paymentStatus: 19
     });
     setStep(2);
   };

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload Excel File</h3>
        <p className="text-gray-600 text-lg">Select an Excel file (.xlsx, .xls) or CSV file containing student data</p>
      </div>

      <div className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-3">Click to upload or drag and drop</p>
          <p className="text-gray-500 mb-4">Excel files (.xlsx, .xls) or CSV files only (Max 10MB)</p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Choose File
          </div>
        </label>
      </div>

      <div className="flex justify-center space-x-6">
        <button
          onClick={downloadTemplate}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-semibold">Download Template</span>
        </button>
        <button
          onClick={testBulkImport}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="font-semibold">Test Import</span>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Department, Year & Section</h3>
          <p className="text-gray-600">Choose the department, year, and section for all students in this import</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Department *</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
                         <option value="">Select Department</option>
             <option value="Civil Engineering">Civil Engineering</option>
             <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
             <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
             <option value="Mechanical Engineering">Mechanical Engineering</option>
             <option value="Basic Sciences & Humanities">Basic Sciences & Humanities</option>
             <option value="Management Studies">Management Studies</option>
             <option value="Computer Applications">Computer Applications</option>
             <option value="Computer Science & Engineering">Computer Science & Engineering</option>
             <option value="Computer Science & Engineering (Artificial Intelligence)">Computer Science & Engineering (Artificial Intelligence)</option>
             <option value="Computer Science & Engineering (Cyber Security)">Computer Science & Engineering (Cyber Security)</option>
             <option value="Computer Science & Technology">Computer Science & Technology</option>
             <option value="Computer Science & Engineering (Data Science)">Computer Science & Engineering (Data Science)</option>
             <option value="Computer Science and Engineering (Artificial Intelligence and Machine Learning)">Computer Science and Engineering (Artificial Intelligence and Machine Learning)</option>
             <option value="Computer Science and Engineering (Networks)">Computer Science and Engineering (Networks)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Year *</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Year</option>
            <optgroup label="Roman Numerals">
              <option value="I">I</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
              <option value="V">V</option>
              <option value="VI">VI</option>
              <option value="VII">VII</option>
              <option value="VIII">VIII</option>
              <option value="IX">IX</option>
              <option value="X">X</option>
              <option value="XI">XI</option>
              <option value="XII">XII</option>
            </optgroup>
            <optgroup label="Numeric Years">
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="5th Year">5th Year</option>
              <option value="6th Year">6th Year</option>
              <option value="7th Year">7th Year</option>
              <option value="8th Year">8th Year</option>
              <option value="9th Year">9th Year</option>
              <option value="10th Year">10th Year</option>
              <option value="11th Year">11th Year</option>
              <option value="12th Year">12th Year</option>
            </optgroup>
            <optgroup label="Written Years">
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
              <option value="Third Year">Third Year</option>
              <option value="Fourth Year">Fourth Year</option>
              <option value="Fifth Year">Fifth Year</option>
              <option value="Sixth Year">Sixth Year</option>
              <option value="Seventh Year">Seventh Year</option>
              <option value="Eighth Year">Eighth Year</option>
              <option value="Ninth Year">Ninth Year</option>
              <option value="Tenth Year">Tenth Year</option>
              <option value="Eleventh Year">Eleventh Year</option>
              <option value="Twelfth Year">Twelfth Year</option>
            </optgroup>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Section *</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Section</option>
            <optgroup label="Alphabets">
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
              <option value="G">G</option>
              <option value="H">H</option>
              <option value="I">I</option>
              <option value="J">J</option>
              <option value="K">K</option>
              <option value="L">L</option>
              <option value="M">M</option>
              <option value="N">N</option>
              <option value="O">O</option>
              <option value="P">P</option>
              <option value="Q">Q</option>
              <option value="R">R</option>
              <option value="S">S</option>
              <option value="T">T</option>
              <option value="U">U</option>
              <option value="V">V</option>
              <option value="W">W</option>
              <option value="X">X</option>
              <option value="Y">Y</option>
              <option value="Z">Z</option>
            </optgroup>
            <optgroup label="Greek Letters">
              <option value="Alpha">Alpha</option>
              <option value="Beta">Beta</option>
              <option value="Gamma">Gamma</option>
              <option value="Delta">Delta</option>
              <option value="Epsilon">Epsilon</option>
              <option value="Zeta">Zeta</option>
              <option value="Eta">Eta</option>
              <option value="Theta">Theta</option>
              <option value="Iota">Iota</option>
              <option value="Kappa">Kappa</option>
              <option value="Lambda">Lambda</option>
              <option value="Mu">Mu</option>
              <option value="Nu">Nu</option>
              <option value="Xi">Xi</option>
              <option value="Omicron">Omicron</option>
              <option value="Pi">Pi</option>
              <option value="Rho">Rho</option>
              <option value="Sigma">Sigma</option>
              <option value="Tau">Tau</option>
              <option value="Upsilon">Upsilon</option>
              <option value="Phi">Phi</option>
              <option value="Chi">Chi</option>
              <option value="Psi">Psi</option>
              <option value="Omega">Omega</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <div className="bg-blue-600 rounded-lg p-2 mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-blue-800 font-bold text-lg">Import Information</h4>
        </div>
        <div className="space-y-3">
          <p className="text-blue-700">
            All students will be assigned to: <span className="font-semibold bg-blue-100 px-2 py-1 rounded">{selectedDepartment || 'Department'}</span> → <span className="font-semibold bg-blue-100 px-2 py-1 rounded">{selectedYear || 'Year'}</span> → <span className="font-semibold bg-blue-100 px-2 py-1 rounded">{selectedSection || 'Section'}</span>
          </p>
          <div className="bg-white border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 text-sm font-medium mb-1">Storage Path:</p>
            <code className="bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono text-gray-800 block">
              students/{sanitizeDepartmentForPath(selectedDepartment || 'Department')}/{(selectedYear || 'Year').toString().replace(/[^a-zA-Z0-9]/g, '')}/{(selectedSection || 'Section').toString().replace(/[^a-zA-Z0-9]/g, '')}/[studentId]
            </code>
          </div>
          <p className="text-blue-700 text-sm">
            <strong>Note:</strong> Only <strong>Admission Number</strong> and <strong>Full Name</strong> are required fields. All other fields are optional.
          </p>
        </div>
      </div>
      
      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700 text-xs">
            <strong>Benefits of this structure:</strong> Better organization by department, easier faculty management, improved reporting, and scalable architecture.
          </p>
        </div>
        
        {/* Show processed sheets information */}
        {sheetInfo.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-semibold text-blue-800 mb-2">📊 Processed Sheets:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {sheetInfo.map((sheet, index) => (
                <div key={index} className="text-sm bg-white p-2 rounded border">
                  <div className="font-medium text-blue-700">{sheet.name}</div>
                  <div className="text-gray-600">
                    Year: {sheet.year} | Section: {sheet.section} | Rows: {sheet.rowCount}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-blue-700 font-medium">
              Total Rows: {data.length} | Total Sheets: {sheetInfo.length}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(1)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleYearSectionDepartment}
          disabled={!selectedDepartment || !selectedYear || !selectedSection}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !selectedDepartment || !selectedYear || !selectedSection
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Continue to Mapping
        </button>
      </div>
    </>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Map Columns & Validate Data</h3>
        <p className="text-gray-600">Match your Excel columns to the student data fields and review validation</p>
      </div>

             {/* Data Summary */}
       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
         <div className="flex items-center mb-3">
           <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
           </svg>
           <h4 className="text-blue-800 font-semibold">Data Summary</h4>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="text-center">
             <div className="text-2xl font-bold text-blue-600">{data.length}</div>
             <div className="text-sm text-blue-700">Total Students</div>
           </div>
           <div className="text-center">
             <div className="text-2xl font-bold text-blue-600">{Object.keys(groupedData).length}</div>
             <div className="text-sm text-blue-700">Year-Section Groups</div>
           </div>
           <div className="text-center">
             <div className="text-2xl font-bold text-blue-600">{Array.isArray(data[0]) ? data[0].length : 0}</div>
             <div className="text-sm text-blue-700">Data Columns</div>
           </div>
           <div className="text-center">
             <div className="text-2xl font-bold text-blue-600">{sheetInfo.length}</div>
             <div className="text-sm text-blue-700">Excel Sheets</div>
           </div>
         </div>
         {Object.keys(groupedData).length > 0 && (
           <div className="mt-3 pt-3 border-t border-blue-200">
             <p className="text-sm text-blue-700 mb-2">Distribution by Year & Section:</p>
             <div className="flex flex-wrap gap-2">
               {Object.entries(groupedData).map(([groupKey, groupRows]) => (
                 <span key={groupKey} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                   {groupKey}: {groupRows.length}
                 </span>
               ))}
             </div>
           </div>
         )}
       </div>

       {/* Validation Status */}
       <div className={`border rounded-lg p-4 ${
         errors.length > 0 
           ? 'bg-red-50 border-red-200' 
           : 'bg-green-50 border-green-200'
       }`}>
         <div className="flex items-center mb-3">
           {errors.length > 0 ? (
             <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           ) : (
             <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           )}
           <h4 className={`font-semibold ${
             errors.length > 0 ? 'text-red-800' : 'text-green-800'
           }`}>
             {errors.length > 0 
               ? `${errors.length} Validation Error${errors.length !== 1 ? 's' : ''} Found` 
               : 'All Data Validated Successfully!'
             }
           </h4>
         </div>
         
         {errors.length > 0 && (
           <div className="max-h-40 overflow-y-auto space-y-2">
             {errors.slice(0, 10).map((error, index) => (
               <div key={index} className="text-sm text-red-700 bg-white p-2 rounded border">
                 {error.type === 'mapping' ? (
                   <div>
                     <span className="font-medium text-red-800">🔗 Mapping Error:</span> 
                     <span className="ml-1">{error.message}</span>
                   </div>
                 ) : (
                   <div>
                     <span className="font-medium text-red-800">📋 Row {error.row}:</span> 
                     <span className="ml-1">{error.message}</span>
                   </div>
                 )}
                 {error.value && (
                   <div className="text-red-600 text-xs mt-1">
                     Value: <code className="bg-red-100 px-1 rounded">{error.value}</code>
                   </div>
                 )}
               </div>
             ))}
             {errors.length > 10 && (
               <div className="text-sm text-red-600 font-medium bg-white p-2 rounded border">
                 ... and {errors.length - 10} more errors
               </div>
             )}
           </div>
         )}
         
         {errors.length === 0 && (
           <div className="text-sm text-green-700">
             <p>✅ Required fields (Admission Number & Full Name) are mapped</p>
             <p>✅ Data validation passed</p>
             <p>✅ Ready to import {data.length} students</p>
           </div>
         )}
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Available Fields</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setMapping({})}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                title="Clear all mappings"
              >
                🗑️ Clear All
              </button>
              <button
                onClick={() => validateData()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                title="Run validation"
              >
                🔄 Validate Now
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableFields.map((field) => (
              <div key={field.name} className={`p-3 border rounded-lg ${
                field.required && mapping[field.name] === undefined 
                  ? 'border-red-300 bg-red-50' 
                  : mapping[field.name] !== undefined
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{field.label}</p>
                      {field.required && <span className="text-red-500 text-xs">*</span>}
                      {mapping[field.name] !== undefined && (
                        <span className="text-green-600 text-xs">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{field.type} {field.required && '(Required)'}</p>
                    {mapping[field.name] !== undefined && (
                      <p className="text-xs text-green-600 mt-1">
                        Mapped to: {data[0]?.[mapping[field.name]] || `Column ${mapping[field.name] + 1}`}
                      </p>
                    )}
                  </div>
                  <select
                    value={mapping[field.name] || ''}
                    onChange={(e) => {
                      const newMapping = {
                        ...mapping,
                        [field.name]: e.target.value ? parseInt(e.target.value) : undefined
                      };
                      setMapping(newMapping);
                      // Run validation after mapping change
                      setTimeout(() => {
                        validateData();
                      }, 100);
                    }}
                    className={`px-3 py-1 border rounded text-sm ${
                      field.required && mapping[field.name] === undefined 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Not mapped</option>
                    {Array.isArray(data[0]) ? data[0].map((header, index) => (
                      <option key={index} value={index}>
                        {header || `Column ${index + 1}`}
                      </option>
                    )) : (
                      <option value="">No data available</option>
                    )}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Preview Data (Grouped by Year & Section)</h4>
            <div className="text-sm text-gray-600">
              {Object.keys(mapping).length} of {availableFields.length} fields mapped
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-4">
            {Object.keys(groupedData).length > 0 ? (
              Object.entries(groupedData).map(([groupKey, groupRows]) => (
                <div key={groupKey} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
                    <h5 className="font-medium text-blue-900">{groupKey}</h5>
                    <p className="text-sm text-blue-700">{groupRows.length} student{groupRows.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {Array.isArray(data[0]) ? data[0].map((header, index) => (
                            <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              {header || `Column ${index + 1}`}
                            </th>
                          )) : (
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              No headers available
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {groupRows.slice(0, 3).map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            {Array.isArray(row) ? row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900 border-b">
                                {cell || '-'}
                              </td>
                            )) : (
                              <td className="px-3 py-2 text-sm text-gray-900 border-b text-red-500">
                                Invalid row data
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {groupRows.length > 3 && (
                      <p className="text-sm text-gray-500 p-2 text-center bg-gray-50">
                        Showing first 3 rows of {groupRows.length} students in {groupKey}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No data to preview</p>
              </div>
            )}
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-700">
                Data has been automatically sorted by Year → Section → Admission Number for better organization
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Skip duplicate check option */}
        <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <input
            type="checkbox"
            id="skipDuplicateCheck"
            checked={skipDuplicateCheck}
            onChange={(e) => setSkipDuplicateCheck(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="skipDuplicateCheck" className="text-sm text-yellow-800">
            Skip duplicate admission number check (⚠️ May cause data conflicts)
          </label>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => setStep(2)}
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
    </div>
  );

  const renderStep4 = () => (
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
            setSelectedYear("");
            setSelectedSection("");
            setSelectedDepartment("");
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
       
       <div className="text-center space-y-2">
         <p className="text-sm text-gray-600">
           {Math.round(uploadProgress)}% complete
         </p>
         
         {/* Show current group being processed */}
         {Object.keys(groupedData).length > 0 && (
           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
             <p className="text-sm text-blue-700">
               <strong>Processing:</strong> Students are being imported in order by Year → Section
             </p>
             <p className="text-xs text-blue-600 mt-1">
               Data is organized for optimal storage structure
             </p>
           </div>
         )}
       </div>
     </div>
   );

  // Debug function to test mapping - can be called from browser console
  const debugMapping = () => {
    console.log('🔍 Debug Mapping Function');
    console.log('Current mapping state:', mapping);
    console.log('Current data state:', data);
    console.log('Current step:', step);
    
    // Test with the exact headers from your Excel file
    const testHeaders = [
      'Roll. No',
      'Student Name', 
      'Quota',
      'Gender',
      'Aadhaar',
      'Student Mobile',
      'Father Mobile',
      'Father Name',
      'Mother Name',
      'Permanent Address'
    ];
    
    console.log('Testing with your exact headers:', testHeaders);
    
    // Import and use the enhanced mapping function
    import('../utils/testBulkImport.js').then(({ enhancedMapping }) => {
      const testMapping = enhancedMapping(testHeaders);
      console.log('Enhanced mapping result:', testMapping);
      
      // Check if required fields are mapped
      const requiredFields = ['admissionNumber', 'name'];
      const missingFields = requiredFields.filter(field => !testMapping[field]);
      
      if (missingFields.length > 0) {
        console.log('❌ Missing required fields:', missingFields);
      } else {
        console.log('✅ All required fields mapped successfully!');
      }
    });
  };

  // Expose debug function to window for console access
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.debugBulkImportMapping = debugMapping;
    }
  }, [mapping, data, step]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-xl p-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Bulk Import Students</h2>
                <p className="text-blue-100 text-sm">Import multiple students from Excel/CSV file</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:text-blue-100 transition-colors rounded-xl hover:bg-white hover:bg-opacity-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-center mt-8">
            {[
              { number: 1, title: 'Upload File' },
              { number: 2, title: 'Preview Data' },
              { number: 3, title: 'Map Fields' },
              { number: 4, title: 'Complete' }
            ].map((stepInfo, index) => (
              <div key={stepInfo.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step >= stepInfo.number 
                      ? 'bg-white text-blue-600 shadow-lg scale-110' 
                      : 'bg-white bg-opacity-20 text-white'
                  }`}>
                    {stepInfo.number}
                  </div>
                  <span className={`text-xs mt-2 font-medium transition-colors ${
                    step >= stepInfo.number ? 'text-white' : 'text-blue-100'
                  }`}>
                    {stepInfo.title}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`w-20 h-1 mx-4 rounded-full transition-all duration-300 ${
                    step > stepInfo.number ? 'bg-white' : 'bg-white bg-opacity-30'
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
              {step === 4 && renderStep4()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImport;
