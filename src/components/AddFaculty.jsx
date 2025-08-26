import React, { useState } from "react";
import { db } from "../firebase"; // Adjust the path to your Firebase config
import { collection, addDoc, query, where, getDocs, doc } from "firebase/firestore";
import * as XLSX from "xlsx";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFacultyData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDepartment) {
      alert("Please select a department first.");
      return;
    }

    if (!facultyData.name || !facultyData.emailID) {
      alert("Name and Email ID are required.");
      return;
    }

    try {
      const deptKey = getDepartmentKey(selectedDepartment);
      const deptRef = doc(db, "faculty", deptKey);
      const facultyCollection = collection(deptRef, "members");
      const q = query(facultyCollection, where("emailID", "==", facultyData.emailID));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("Faculty with this Email ID already exists.");
        return;
      }

      await addDoc(facultyCollection, { ...facultyData, department: selectedDepartment, departmentKey: deptKey });
      alert("Faculty added successfully!");
      setFacultyData(initialFields);
    } catch (error) {
      console.error("Error adding faculty:", error.message);
      alert("Failed to add faculty. Please try again.");
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

        // Remove header row if present
        const processedData = jsonData.filter(row => {
          // Check if row has actual data
          return Object.values(row).some(value => value !== '');
        });

        if (processedData.length === 0) {
          alert('No valid data found in the Excel file.');
          return;
        }

        // Log the first row to check the data structure
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
    try {
      const deptKey = getDepartmentKey(selectedDepartment);
      const deptRef = doc(db, 'faculty', deptKey);
      const facultyCollection = collection(deptRef, 'members');
      let successCount = 0;
      let skipCount = 0;

      for (const faculty of excelData) {
        // Skip rows without required fields: name and emailID
        if (!faculty.name || !faculty.emailID || faculty.name.trim() === '' || faculty.emailID.trim() === '') {
          console.log('Skipping entry due to missing name/emailID:', faculty);
          skipCount++;
          continue;
        }

        // Check if faculty already exists by emailID
        const q = query(facultyCollection, where('emailID', '==', faculty.emailID.trim()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // Clean the data before uploading
          const cleanedFaculty = {
            empID: faculty.empID?.trim() || '',
            name: faculty.name.trim(),
            designation: faculty.designation?.trim() || '',
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
            departmentKey: deptKey,
          };

          await addDoc(facultyCollection, cleanedFaculty);
          successCount++;
        }
      }

      alert(`Upload complete!\nSuccessfully added: ${successCount}\nSkipped entries: ${skipCount}`);
      setExcelData([]);
    } catch (error) {
      console.error('Error uploading faculty data:', error);
      alert('Failed to upload faculty data. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Add Faculty</h1>
      {/* Department selection - required before adding or uploading */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
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
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          {Object.keys(initialFields).map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize">
                {field.replace(/([A-Z])/g, " $1").toLowerCase()}
              </label>
              <input
                type="text"
                id={field}
                name={field}
                value={facultyData[field]}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
                required={field === "empID"}
                disabled={!selectedDepartment}
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          className={`mt-4 px-4 py-2 rounded-lg text-white ${!selectedDepartment ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
          disabled={!selectedDepartment}
        >
          Add Faculty
        </button>
      </form>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Upload Excel File</h2>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="block w-full mb-4"
          disabled={!selectedDepartment}
        />
        <button
          onClick={handleUpload}
          disabled={excelData.length === 0 || !selectedDepartment}
          className={`px-4 py-2 rounded-lg text-white ${
            excelData.length === 0 || !selectedDepartment ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          Upload Bulk Data
        </button>
      </div>
    </div>
  );
};

export default AddFaculty;