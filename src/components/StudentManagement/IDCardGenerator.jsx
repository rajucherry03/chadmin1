import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIdCard,
  faDownload,
  faPrint,
  faEye,
  faPlus,
  faSearch,
  faFilter,
  faQrcode,
  faBarcode,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import { db } from "../../firebase";
import { collection, collectionGroup, getDocs, query, where } from "firebase/firestore";

const IDCardGenerator = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedStudentForPreview, setSelectedStudentForPreview] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collectionGroup(db, "students"));
      const fetchedStudents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(fetchedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = (
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo?.toString().includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesYear = !filterYear || student.Year === filterYear;
    const matchesSection = !filterSection || student.Section === filterSection;
    const matchesDepartment = !filterDepartment || student.department === filterDepartment;

    return matchesSearch && matchesYear && matchesSection && matchesDepartment;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const generateIDCard = (student) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 250;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 250);

    // Border
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 396, 246);

    // Header
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(0, 0, 400, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('UNIVERSITY STUDENT IDENTITY CARD', 200, 25);

    // Student Photo placeholder
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(20, 60, 80, 100);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PHOTO', 60, 115);

    // Student Information
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Name:', 120, 70);
    ctx.font = '12px Arial';
    ctx.fillText(student.name || 'N/A', 180, 70);

    ctx.font = 'bold 14px Arial';
    ctx.fillText('Roll No:', 120, 90);
    ctx.font = '12px Arial';
    ctx.fillText(student.rollNo || 'N/A', 180, 90);

    ctx.font = 'bold 14px Arial';
    ctx.fillText('Department:', 120, 110);
    ctx.font = '12px Arial';
    ctx.fillText(student.department || 'N/A', 180, 110);

    ctx.font = 'bold 14px Arial';
    ctx.fillText('Year:', 120, 130);
    ctx.font = '12px Arial';
    ctx.fillText(student.Year || 'N/A', 180, 130);

    ctx.font = 'bold 14px Arial';
    ctx.fillText('Section:', 120, 150);
    ctx.font = '12px Arial';
    ctx.fillText(student.Section || 'N/A', 180, 150);

    ctx.font = 'bold 14px Arial';
    ctx.fillText('Email:', 120, 170);
    ctx.font = '12px Arial';
    ctx.fillText(student.email || 'N/A', 180, 170);

    // QR Code placeholder
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(300, 60, 80, 80);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR CODE', 340, 105);

    // Footer
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(0, 210, 400, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('This card is valid for the academic year 2024-25', 200, 230);

    return canvas.toDataURL();
  };

  const downloadIDCard = (student) => {
    const dataURL = generateIDCard(student);
    const link = document.createElement('a');
    link.download = `ID_Card_${student.rollNo}.png`;
    link.href = dataURL;
    link.click();
  };

  const downloadMultipleIDCards = () => {
    selectedStudents.forEach(studentId => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        setTimeout(() => downloadIDCard(student), 100);
      }
    });
  };

  const printIDCard = (student) => {
    const dataURL = generateIDCard(student);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>ID Card - ${student.name}</title>
          <style>
            body { margin: 0; padding: 20px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <img src="${dataURL}" alt="Student ID Card" />
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const previewIDCard = (student) => {
    setSelectedStudentForPreview(student);
    setPreviewMode(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ID Card Generator</h2>
          <p className="text-gray-600">Generate and manage student identity cards</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={downloadMultipleIDCards}
            disabled={selectedStudents.length === 0}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              selectedStudents.length > 0
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FontAwesomeIcon icon={faDownload} />
            <span>Download Selected ({selectedStudents.length})</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, roll no, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              <option value="I">1st Year</option>
              <option value="II">2nd Year</option>
              <option value="III">3rd Year</option>
              <option value="IV">4th Year</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Student</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Roll No</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Year & Section</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span>Loading students...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-900 font-medium">{student.rollNo}</td>
                    <td className="py-4 px-6 text-gray-600">{student.department}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {student.Year} Year
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {student.Section}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => previewIDCard(student)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Preview ID Card"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          onClick={() => downloadIDCard(student)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                          title="Download ID Card"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                        </button>
                        <button
                          onClick={() => printIDCard(student)}
                          className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                          title="Print ID Card"
                        >
                          <FontAwesomeIcon icon={faPrint} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewMode && selectedStudentForPreview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">ID Card Preview</h3>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <div className="flex justify-center mb-6">
                <img
                  src={generateIDCard(selectedStudentForPreview)}
                  alt="Student ID Card"
                  className="border border-gray-300 rounded-lg shadow-lg"
                />
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => downloadIDCard(selectedStudentForPreview)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => printIDCard(selectedStudentForPreview)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faPrint} />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IDCardGenerator;
