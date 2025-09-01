import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Import Firebase configuration
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    profileLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch faculty list from Firestore
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const facultySnapshot = await getDocs(collection(db, 'faculty'));
        const facultyData = facultySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(), // Include all document fields
        }));
        setFacultyList(facultyData);
      } catch (error) {
        console.error('Error fetching faculty:', error.message);
        setErrorMessage('Failed to fetch faculty list. Please try again.');
      }
    };

    if (formData.role === 'Faculty') {
      fetchFaculty();
    }
  }, [formData.role]);

  // Auto-fill email when a faculty member is selected
  useEffect(() => {
    if (selectedFaculty) {
      const selected = facultyList.find((faculty) => faculty.id === selectedFaculty);
      if (selected && selected.emailID) {
        setFormData((prev) => ({ ...prev, email: selected.emailID }));
      }
    } else {
      setFormData((prev) => ({ ...prev, email: '' }));
    }
  }, [selectedFaculty, facultyList]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.role) {
      errors.role = 'User role is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    if (formData.role === 'Faculty' && !selectedFaculty) {
      errors.faculty = 'Please select a faculty member';
    }
    
    if (formData.profileLink && !/^https?:\/\/.+/.test(formData.profileLink)) {
      errors.profileLink = 'Please enter a valid URL starting with http:// or https://';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'role' && value !== 'Faculty') {
      setSelectedFaculty('');
      setFormData((prev) => ({ ...prev, email: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const userId = userCredential.user.uid;

      if (formData.role === 'Faculty') {
        // Fetch existing faculty data
        const selectedFacultyData = facultyList.find(
          (faculty) => faculty.id === selectedFaculty
        );

        if (!selectedFacultyData) {
          throw new Error('Selected faculty not found in the database.');
        }

        // Delete the old faculty document
        await deleteDoc(doc(db, 'faculty', selectedFaculty));

        // Create a new faculty document with UID as the document ID
        const facultyRef = doc(db, 'faculty', userId); // Use UID as document ID
        await setDoc(facultyRef, {
          ...selectedFacultyData, // Copy the existing faculty details
          userId, // Add UID to the faculty document
        });

        setSuccessMessage(`Faculty user created and linked successfully! User ID: ${userId}`);
      } else {
        // Save non-faculty user data to Firestore
        const userData = {
          role: formData.role,
          email: formData.email,
          profileLink: formData.profileLink,
          createdAt: new Date(),
          status: 'active',
          lastLogin: null,
        };

        await setDoc(doc(db, 'users', userId), userData);

        setSuccessMessage(`User account created successfully! User ID: ${userId}`);
      }

      // Reset the form
      setFormData({
        email: '',
        password: '',
        role: '',
        profileLink: '',
      });
      setSelectedFaculty('');
      setValidationErrors({});
    } catch (error) {
      console.error('Error creating user:', error.message);
      setErrorMessage(error.message || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName] || '';
  };

  const isFieldValid = (fieldName) => {
    return !validationErrors[fieldName] && formData[fieldName];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create User Account</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Establish new user accounts with appropriate roles and permissions. Each user will receive secure authentication credentials.
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">User Information</h2>
              <p className="text-blue-100 text-sm mt-1">Fill in the details below to create a new user account</p>
            </div>

            {/* Form Content */}
            <div className="p-6">
              {successMessage && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-green-800 dark:text-green-200 font-medium">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {errorMessage && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-red-800 dark:text-red-200 font-medium">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      User Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        getFieldError('role') 
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                          : isFieldValid('role')
                          ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                      } text-gray-900 dark:text-white`}
                      required
                    >
                      <option value="">Select User Role</option>
                      <option value="Student">Student</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Admin">Administrator</option>
                    </select>
                    {getFieldError('role') && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('role')}</p>
                    )}
                  </div>

                  {/* Faculty Selection (Conditional) */}
                  {formData.role === 'Faculty' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Faculty Member <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedFaculty}
                        onChange={(e) => setSelectedFaculty(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                          getFieldError('faculty') 
                            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                            : selectedFaculty
                            ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                        } text-gray-900 dark:text-white`}
                        required
                      >
                        <option value="">Select Faculty Member</option>
                        {facultyList.map((faculty) => (
                          <option key={faculty.id} value={faculty.id}>
                            {faculty.name} - {faculty.department || 'No Department'}
                          </option>
                        ))}
                      </select>
                      {getFieldError('faculty') && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('faculty')}</p>
                      )}
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Select an existing faculty member to link their account
                      </p>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="user@example.com"
                    readOnly={formData.role === 'Faculty'}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      getFieldError('email') 
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                        : isFieldValid('email')
                        ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400`}
                    required
                  />
                  {getFieldError('email') && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('email')}</p>
                  )}
                  {formData.role === 'Faculty' && (
                    <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                      Email will be auto-filled from the selected faculty member
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter secure password"
                    required
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      getFieldError('password') 
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                        : isFieldValid('password')
                        ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  />
                  {getFieldError('password') && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('password')}</p>
                  )}
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">6+ characters</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Uppercase</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${/\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Number</span>
                    </div>
                  </div>
                </div>

                {/* Profile Link Field (Conditional) */}
                {formData.role !== 'Faculty' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Profile Link
                    </label>
                    <input
                      type="text"
                      name="profileLink"
                      value={formData.profileLink}
                      onChange={handleInputChange}
                      placeholder="https://example.com/profile"
                      className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        getFieldError('profileLink') 
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                          : formData.profileLink && isFieldValid('profileLink')
                          ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                      } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                    />
                    {getFieldError('profileLink') && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{getFieldError('profileLink')}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Optional profile link for the user (must start with http:// or https://)
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    className={`w-full px-6 py-4 rounded-lg text-white font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                      loading 
                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed transform-none' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating User Account...
                      </div>
                    ) : (
                      'Create User Account'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Security Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Features</h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Firebase Authentication integration
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Email verification required
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Secure password requirements
                </li>
              </ul>
            </div>

            {/* Process Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Process Overview</h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Faculty users linked to existing records
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Student/Admin accounts created fresh
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Automatic data synchronization
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
