import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKey, faSave, faDownload, faUndo, faCheckCircle,
  faExclamationTriangle, faEye, faEyeSlash, faEdit, faTrash, faPlus,
  faCog, faHistory, faQrcode, faPrint, faShare, faLock, faUnlock,
  faUserPlus, faEnvelope, faCopy, faArrowsRotate
} from "@fortawesome/free-solid-svg-icons";
import { db } from "../../firebase";
import { doc, updateDoc, writeBatch, addDoc, collection } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const LoginCredentialsManager = ({ students, onClose }) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [generatedCredentials, setGeneratedCredentials] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordPattern, setPasswordPattern] = useState("ROLLNO-DOB");
  const [customPassword, setCustomPassword] = useState("");
  const [emailDomain, setEmailDomain] = useState("@student.edu");
  const [usernamePattern, setUsernamePattern] = useState("ROLLNO");
  const [includeSpecialChars, setIncludeSpecialChars] = useState(false);
  const [passwordLength, setPasswordLength] = useState(8);
  const [bulkAction, setBulkAction] = useState("generate");

  // Password patterns
  const passwordPatterns = [
    { id: "ROLLNO-DOB", name: "Roll Number + DOB", description: "RollNo + Date of Birth" },
    { id: "ROLLNO-YEAR", name: "Roll Number + Year", description: "RollNo + Admission Year" },
    { id: "NAME-DOB", name: "Name + DOB", description: "First Name + Date of Birth" },
    { id: "CUSTOM", name: "Custom Pattern", description: "Define your own pattern" },
    { id: "RANDOM", name: "Random Password", description: "Generate random secure password" }
  ];

  // Username patterns
  const usernamePatterns = [
    { id: "ROLLNO", name: "Roll Number", description: "Use roll number as username" },
    { id: "EMAIL", name: "Email", description: "Use email as username" },
    { id: "NAME-ROLLNO", name: "Name + Roll No", description: "First Name + Roll Number" },
    { id: "CUSTOM", name: "Custom Pattern", description: "Define your own pattern" }
  ];

  // Generate username based on pattern
  const generateUsername = (student, pattern) => {
    const rollNo = student.rollNo || "";
    const email = student.email || "";
    const firstName = (student.firstName || student.name?.split(' ')[0] || "").toLowerCase();
    const lastName = (student.lastName || student.name?.split(' ')[1] || "").toLowerCase();

    switch (pattern) {
      case "ROLLNO":
        return rollNo.toLowerCase().replace(/[^a-z0-9]/g, '');
      case "EMAIL":
        return email.split('@')[0];
      case "NAME-ROLLNO":
        return `${firstName}${rollNo}`.toLowerCase().replace(/[^a-z0-9]/g, '');
      case "CUSTOM":
        return customUsername
          .replace("{ROLLNO}", rollNo)
          .replace("{EMAIL}", email.split('@')[0])
          .replace("{FIRSTNAME}", firstName)
          .replace("{LASTNAME}", lastName)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');
      default:
        return rollNo.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
  };

  // Generate password based on pattern
  const generatePassword = (student, pattern) => {
    const rollNo = student.rollNo || "";
    const dob = student.dateOfBirth || "";
    const year = student.admissionDate ? new Date(student.admissionDate).getFullYear() : new Date().getFullYear();
    const firstName = student.firstName || student.name?.split(' ')[0] || "";

    switch (pattern) {
      case "ROLLNO-DOB":
        const dobPart = dob.replace(/-/g, "").slice(-4);
        return `${rollNo}${dobPart}`;
      case "ROLLNO-YEAR":
        return `${rollNo}${year}`;
      case "NAME-DOB":
        const namePart = firstName.slice(0, 3).toLowerCase();
        const dobPart2 = dob.replace(/-/g, "").slice(-4);
        return `${namePart}${dobPart2}`;
      case "CUSTOM":
        return customPassword
          .replace("{ROLLNO}", rollNo)
          .replace("{DOB}", dob.replace(/-/g, ""))
          .replace("{YEAR}", year)
          .replace("{FIRSTNAME}", firstName);
      case "RANDOM":
        return generateRandomPassword();
      default:
        return `${rollNo}${dob.replace(/-/g, "").slice(-4)}`;
    }
  };

  // Generate random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = includeSpecialChars ? chars + specialChars : chars;
    
    let password = '';
    for (let i = 0; i < passwordLength; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    return password;
  };

  // Generate email
  const generateEmail = (student) => {
    const username = generateUsername(student, usernamePattern);
    return `${username}${emailDomain}`;
  };

  // Generate credentials for selected students
  const generateCredentials = () => {
    setIsGenerating(true);
    
    const studentsToProcess = selectedStudents.length > 0 ? selectedStudents : students;
    const generated = studentsToProcess.map(student => {
      const username = generateUsername(student, usernamePattern);
      const password = generatePassword(student, passwordPattern);
      const email = generateEmail(student);

      return {
        ...student,
        generatedUsername: username,
        generatedPassword: password,
        generatedEmail: email,
        hasLoginCredentials: true
      };
    });

    setGeneratedCredentials(generated);
    setIsGenerating(false);
  };

  // Save credentials to database
  const saveCredentials = async () => {
    setIsSaving(true);
    
    try {
      const batch = writeBatch(db);
      
      for (const student of generatedCredentials) {
        const studentRef = doc(db, "students", student.id);
        batch.update(studentRef, {
          username: student.generatedUsername,
          password: student.generatedPassword, // In production, this should be hashed
          email: student.generatedEmail,
          hasLoginCredentials: true,
          credentialsGeneratedAt: new Date(),
          credentialsPattern: {
            username: usernamePattern,
            password: passwordPattern
          }
        });

        // Create user account in Firebase Auth
        try {
          const auth = getAuth();
          await createUserWithEmailAndPassword(
            auth,
            student.generatedEmail,
            student.generatedPassword
          );
        } catch (authError) {
          console.warn(`Failed to create auth account for ${student.generatedEmail}:`, authError);
        }
      }

      await batch.commit();
      alert("Login credentials saved successfully!");
      setGeneratedCredentials([]);
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving credentials:", error);
      alert("Error saving credentials. Please try again.");
      setIsSaving(false);
    }
  };

  // Export credentials to CSV
  const exportToCSV = () => {
    const csvContent = [
      "Name,Roll Number,Username,Email,Password,Department,Year",
      ...generatedCredentials.map(student => 
        `"${student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}","${student.rollNo}","${student.generatedUsername}","${student.generatedEmail}","${student.generatedPassword}","${student.department}","${student.year}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `login_credentials_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Copy credentials to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  // Select all students
  const selectAllStudents = () => {
    setSelectedStudents(students);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStudents([]);
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Bulk actions
  const performBulkAction = () => {
    switch (bulkAction) {
      case "generate":
        generateCredentials();
        break;
      case "reset":
        // Reset credentials for selected students
        break;
      case "disable":
        // Disable accounts for selected students
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <FontAwesomeIcon icon={faKey} className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Login Credentials Manager</h2>
            <p className="text-gray-600">Generate and manage student login credentials</p>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Username Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username Pattern</label>
            <select
              value={usernamePattern}
              onChange={(e) => setUsernamePattern(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {usernamePatterns.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.description})</option>
              ))}
            </select>
          </div>

          {/* Password Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Pattern</label>
            <select
              value={passwordPattern}
              onChange={(e) => setPasswordPattern(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {passwordPatterns.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.description})</option>
              ))}
            </select>
          </div>

          {/* Email Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Domain</label>
            <input
              type="text"
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              placeholder="@student.edu"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Password Length (for random passwords) */}
          {passwordPattern === "RANDOM" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Length</label>
              <input
                type="number"
                value={passwordLength}
                onChange={(e) => setPasswordLength(parseInt(e.target.value) || 8)}
                min="6"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Include Special Characters */}
          {passwordPattern === "RANDOM" && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeSpecialChars"
                checked={includeSpecialChars}
                onChange={(e) => setIncludeSpecialChars(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="includeSpecialChars" className="ml-2 text-sm text-gray-700">
                Include Special Characters
              </label>
            </div>
          )}

          {/* Custom Username Pattern */}
          {usernamePattern === "CUSTOM" && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Username Pattern</label>
              <input
                type="text"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                placeholder="e.g., {FIRSTNAME}.{ROLLNO}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available placeholders: {"{ROLLNO}"}, {"{EMAIL}"}, {"{FIRSTNAME}"}, {"{LASTNAME}"}
              </p>
            </div>
          )}

          {/* Custom Password Pattern */}
          {passwordPattern === "CUSTOM" && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Password Pattern</label>
              <input
                type="text"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="e.g., {ROLLNO}#{DOB}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available placeholders: {"{ROLLNO}"}, {"{DOB}"}, {"{YEAR}"}, {"{FIRSTNAME}"}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={generateCredentials}
            disabled={isGenerating}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faKey} />
            <span>{isGenerating ? 'Generating...' : 'Generate Credentials'}</span>
          </button>

          <button
            onClick={selectAllStudents}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faUserPlus} />
            <span>Select All Students</span>
          </button>

          <button
            onClick={clearSelection}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faUndo} />
            <span>Clear Selection</span>
          </button>

          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={showPasswords ? faEyeSlash : faEye} />
            <span>{showPasswords ? 'Hide' : 'Show'} Passwords</span>
          </button>
        </div>
      </div>

      {/* Student Selection */}
      {selectedStudents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Students ({selectedStudents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.filter(s => selectedStudents.includes(s.id)).map(student => (
              <div key={student.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => toggleStudentSelection(student.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {student.department} • {student.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Credentials */}
      {generatedCredentials.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Generated Credentials ({generatedCredentials.length})
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={exportToCSV}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <FontAwesomeIcon icon={faDownload} />
                <span>Export CSV</span>
              </button>
              <button
                onClick={saveCredentials}
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faSave} />
                <span>{isSaving ? 'Saving...' : 'Save to Database'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {generatedCredentials.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.department} • {student.year}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-600">{student.generatedUsername}</span>
                        <button
                          onClick={() => copyToClipboard(student.generatedUsername)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FontAwesomeIcon icon={faCopy} className="text-xs" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">{student.generatedEmail}</span>
                        <button
                          onClick={() => copyToClipboard(student.generatedEmail)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FontAwesomeIcon icon={faCopy} className="text-xs" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {showPasswords ? student.generatedPassword : '••••••••'}
                        </span>
                        <button
                          onClick={() => copyToClipboard(student.generatedPassword)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FontAwesomeIcon icon={faCopy} className="text-xs" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                        Generated
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pattern Examples */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pattern Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Username Patterns</h4>
            <div className="space-y-2">
              {usernamePatterns.map(p => (
                <div key={p.id} className="p-2 border border-gray-200 rounded">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-gray-600">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Password Patterns</h4>
            <div className="space-y-2">
              {passwordPatterns.map(p => (
                <div key={p.id} className="p-2 border border-gray-200 rounded">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-gray-600">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCredentialsManager;
