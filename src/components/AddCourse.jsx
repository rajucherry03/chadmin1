import React, { useState } from "react"; 
import * as XLSX from "xlsx";
import { db } from "../firebase"; // Adjust the path to your Firebase configuration file
import { doc, collection, addDoc } from "firebase/firestore";

const AddCourse = () => {
  const [excelData, setExcelData] = useState([]);
  const [formData, setFormData] = useState({
    department: "Computer Science & Engineering (Data Science)",
    courseName: "",
    courseCode: "",
    instructor: "",
    year: "",
    section: "",
    actualHours: "",
    deviationReasons: "",
    leavesAvailed: "",
    cls: "",
    ods: "",
    permissions: "",
    unitsCompleted: "",
    syllabusCoverage: "",
    coveragePercentage: "",
  });

  // Department options (extend as needed)
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

  // Compact key mapping for departments
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
  const getYearKey = (year) => {
    const raw = String(year || "");
    const firstPart = raw.includes("_") ? raw.split("_")[0] : raw;
    return toKey(firstPart);
  };
  const getSectionKey = (section) => toKey(section || "All_Sections");

  // Handle Excel file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Expect headers: Year, Course Code, Course Name
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const mappedData = rows
        .map((row, index) => {
          const year = row["Year"] || "";
          const courseCode = row["Course Code"] || "";
          const courseName = row["Course Name"] || "";

          const mappedRow = {
            department: formData.department || "",
            year,
            section: "All_Sections",
            courseName,
            courseCode,
          };

          if (!mappedRow.department || !mappedRow.year || !mappedRow.courseCode || !mappedRow.courseName) {
            console.warn(`Invalid row at index ${index}:`, mappedRow);
            return null;
          }
          return mappedRow;
        })
        .filter(Boolean);

      console.log("Validated Excel Data:", mappedData); // Debugging log
      setExcelData(mappedData);
    };

    reader.readAsArrayBuffer(file);
  };

  const buildSectionRef = (deptName, yearName, sectionName) => {
    const deptKey = getDepartmentKey(deptName);
    const yearKey = getYearKey(yearName);
    const sectionKey = getSectionKey(sectionName);
    return doc(db, "courses", deptKey, "years", yearKey, "sections", sectionKey);
  };

  const uploadExcelDataToFirebase = async () => {
    const promises = excelData.map(async (row) => {
      const sectionRef = buildSectionRef(row.department, row.year, row.section);
      const courseCollection = collection(sectionRef, "courseDetails");
      const payload = {
        courseName: row.courseName,
        courseCode: row.courseCode,
        // Store the human-readable context as well
        displayDepartment: row.department,
        displayYear: row.year,
        displaySection: row.section,
      };
      await addDoc(courseCollection, payload);
    });
    await Promise.all(promises);
    alert("Excel data uploaded successfully!");
    setExcelData([]);
  };

  // Handle manual form submission
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { department, year, section, ...courseDetails } = formData;

    if (!department || !year || !section) {
      alert("Please fill in all required fields (department, year, section)");
      return;
    }

    const sectionRef = buildSectionRef(department, year, section);
    const courseCollection = collection(sectionRef, "courseDetails");

    const payload = {
      ...courseDetails,
      displayDepartment: department,
      displayYear: year,
      displaySection: section,
    };

    await addDoc(courseCollection, payload);
    alert("Manual data added successfully!");
    setFormData({
      department: "Computer Science & Engineering (Data Science)",
      year: "",
      section: "",
      courseName: "",
      courseCode: "",
      instructor: "",
      actualHours: "",
      deviationReasons: "",
      leavesAvailed: "",
      cls: "",
      ods: "",
      permissions: "",
      unitsCompleted: "",
      syllabusCoverage: "",
      coveragePercentage: "",
    });
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">Add Course</h1>

      {/* Excel Upload Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Excel File</h2>
        {/* Department selector for Excel import context */}
        <select
          name="department"
          value={formData.department}
          onChange={handleFormChange}
          className="block mb-4 p-2 border rounded w-full"
        >
          {departmentOptions.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="block mb-4 border p-2 rounded w-full"
        />
        {excelData.length > 0 && (
          <button
            onClick={uploadExcelDataToFirebase}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Upload Excel Data
          </button>
        )}
      </div>

      {/* Manual Data Entry Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Add Course Manually</h2>
        <form onSubmit={handleFormSubmit} className="bg-white p-5 rounded shadow">
          <select
            name="department"
            value={formData.department}
            onChange={handleFormChange}
            className="block mb-3 p-2 border rounded w-full"
            required
          >
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <input
            type="text"
            name="year"
            value={formData.year}
            onChange={handleFormChange}
            placeholder="Year (e.g., III or III_DS_All_Sections)"
            className="block mb-3 p-2 border rounded w-full"
            required
          />
          <input
            type="text"
            name="section"
            value={formData.section}
            onChange={handleFormChange}
            placeholder="Section (e.g., All_Sections)"
            className="block mb-3 p-2 border rounded w-full"
            required
          />
          <input
            type="text"
            name="courseName"
            value={formData.courseName}
            onChange={handleFormChange}
            placeholder="Course Name"
            className="block mb-3 p-2 border rounded w-full"
            required
          />
          <input
            type="text"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleFormChange}
            placeholder="Course Code"
            className="block mb-3 p-2 border rounded w-full"
            required
          />
          <input
            type="text"
            name="instructor"
            value={formData.instructor}
            onChange={handleFormChange}
            placeholder="Instructor Name"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="actualHours"
            value={formData.actualHours}
            onChange={handleFormChange}
            placeholder="Actual Hours"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="deviationReasons"
            value={formData.deviationReasons}
            onChange={handleFormChange}
            placeholder="Deviation Reasons"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="leavesAvailed"
            value={formData.leavesAvailed}
            onChange={handleFormChange}
            placeholder="Leaves Availed"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="cls"
            value={formData.cls}
            onChange={handleFormChange}
            placeholder="CLs"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="ods"
            value={formData.ods}
            onChange={handleFormChange}
            placeholder="ODs"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="permissions"
            value={formData.permissions}
            onChange={handleFormChange}
            placeholder="Permissions"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="unitsCompleted"
            value={formData.unitsCompleted}
            onChange={handleFormChange}
            placeholder="Units Completed"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="syllabusCoverage"
            value={formData.syllabusCoverage}
            onChange={handleFormChange}
            placeholder="Syllabus Coverage"
            className="block mb-3 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="coveragePercentage"
            value={formData.coveragePercentage}
            onChange={handleFormChange}
            placeholder="Coverage Percentage"
            className="block mb-3 p-2 border rounded w-full"
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add Course
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;
