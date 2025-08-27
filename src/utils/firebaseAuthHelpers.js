import { 
  createUserWithEmailAndPassword, 
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  updateProfile,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, workerAuth } from '../firebase';

/**
 * Generate student email based on roll number
 * @param {string} rollNo - Student roll number
 * @returns {string} Generated email address
 */
export const generateStudentEmail = (rollNo) => {
  return `${rollNo.toLowerCase()}@student.ch360.edu.in`;
};

/**
 * Generate secure password for student
 * @param {string} rollNo - Student roll number
 * @returns {string} Generated password
 */
export const generateStudentPassword = (rollNo) => {
  const timestamp = Date.now().toString().slice(-4);
  return `${rollNo}@${timestamp}`;
};

/**
 * Create Firebase Authentication account for student
 * @param {Object} studentData - Student data object
 * @param {string} studentData.rollNo - Student roll number
 * @param {string} studentData.studentName - Student name
 * @returns {Object} Result object with success status and user info
 */
export const createStudentAuthAccount = async (studentData) => {
  try {
    const email = generateStudentEmail(studentData.rollNo);
    const password = generateStudentPassword(studentData.rollNo);
    
    // Check if user already exists
    const signInMethods = await fetchSignInMethodsForEmail(workerAuth, email);
    if (signInMethods.length > 0) {
      return { 
        success: false, 
        error: 'User already exists', 
        uid: null,
        email,
        password 
      };
    }
    
    // Create user with worker auth to avoid session switching
    const userCredential = await createUserWithEmailAndPassword(workerAuth, email, password);
    
    // Update user profile with display name
    await updateProfile(userCredential.user, {
      displayName: studentData.studentName,
      photoURL: null
    });
    
    return { 
      success: true, 
      uid: userCredential.user.uid, 
      email, 
      password,
      displayName: studentData.studentName
    };
  } catch (error) {
    console.error('Auth creation error:', error);
    return { 
      success: false, 
      error: error.message, 
      uid: null,
      email: null,
      password: null
    };
  }
};

/**
 * Send password reset email to student
 * @param {string} email - Student email address
 * @returns {Object} Result object with success status
 */
export const sendStudentPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(workerAuth, email);
    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify student credentials
 * @param {string} email - Student email
 * @param {string} password - Student password
 * @returns {Object} Result object with success status and user info
 */
export const verifyStudentCredentials = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(workerAuth, email, password);
    return { 
      success: true, 
      user: userCredential.user 
    };
  } catch (error) {
    console.error('Credential verification error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Get student document by UID
 * @param {string} uid - Firebase Auth UID
 * @returns {Object} Student document data
 */
export const getStudentByUid = async (uid) => {
  try {
    const studentRef = doc(db, 'studentsByUid', uid);
    const studentDoc = await getDoc(studentRef);
    
    if (studentDoc.exists()) {
      return { 
        success: true, 
        data: studentDoc.data() 
      };
    } else {
      return { 
        success: false, 
        error: 'Student not found' 
      };
    }
  } catch (error) {
    console.error('Get student by UID error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Update student authentication information
 * @param {string} uid - Firebase Auth UID
 * @param {Object} updates - Fields to update
 * @returns {Object} Result object with success status
 */
export const updateStudentAuthInfo = async (uid, updates) => {
  try {
    const studentRef = doc(db, 'studentsByUid', uid);
    await updateDoc(studentRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true, message: 'Student auth info updated successfully' };
  } catch (error) {
    console.error('Update student auth info error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create student document in Firestore with authentication
 * @param {Object} studentData - Student data
 * @param {string} authUid - Firebase Auth UID
 * @param {string} email - Student email
 * @param {string} department - Department
 * @param {string} year - Year
 * @param {string} section - Section
 * @returns {Object} Result object with success status
 */
export const createStudentDocument = async (studentData, authUid, email, department, year, section) => {
  try {
    // Create main student document
    const deptShort = getDepartmentShortName(department);
    const sanitizedDept = deptShort.replace(/[^A-Z0-9_]/gi, '');
    const sanitizedYear = year.replace(/[^A-Z0-9]/gi, '');
    const sanitizedSection = section.replace(/[^A-Z0-9]/gi, '');
    const groupKey = `${sanitizedYear}-${sanitizedSection}`;
    
    const documentId = authUid || studentData.rollNo;
    const studentRef = doc(db, `students/${sanitizedDept}/${groupKey}`, documentId);
    
    const studentDoc = {
      // Basic Information
      rollNo: studentData.rollNo,
      studentName: studentData.studentName,
      quota: studentData.quota || '',
      gender: studentData.gender || '',
      aadhaar: studentData.aadhaar || '',
      
      // Contact Information
      studentMobile: studentData.studentMobile || '',
      fatherMobile: studentData.fatherMobile || '',
      fatherName: studentData.fatherName || '',
      motherName: studentData.motherName || '',
      permanentAddress: studentData.permanentAddress || '',
      
      // Academic Information
      department,
      year,
      section,
      
      // Authentication Information
      authUid,
      email,
      
      // Metadata
      status: 'Active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      importedAt: serverTimestamp(),
      importSource: 'bulk_import'
    };
    
    await setDoc(studentRef, studentDoc);

    // Create reference in studentsByUid collection
    if (authUid) {
      const byUidRef = doc(db, 'studentsByUid', authUid);
      await setDoc(byUidRef, {
        authUid,
        authEmail: email,
        department,
        year,
        section,
        rollNo: studentData.rollNo,
        studentName: studentData.studentName,
        primaryDocPath: `students/${sanitizedDept}/${groupKey}/${documentId}`,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    
    return { 
      success: true, 
      message: 'Student document created successfully',
      documentPath: `students/${sanitizedDept}/${groupKey}/${documentId}`
    };
  } catch (error) {
    console.error('Create student document error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get department short name
 * @param {string} department - Full department name
 * @returns {string} Short department name
 */
const getDepartmentShortName = (department) => {
  const departmentMap = {
    'CSE': 'CSE',
    'ECE': 'ECE', 
    'EEE': 'EEE',
    'MECH': 'MECH',
    'CIVIL': 'CIVIL',
    'IT': 'IT'
  };
  
  return departmentMap[department] || 'UNK';
};

/**
 * Validate student data before import
 * @param {Object} studentData - Student data to validate
 * @returns {Object} Validation result with errors array
 */
export const validateStudentData = (studentData) => {
  const errors = [];
  
  // Required fields
  if (!studentData.rollNo) errors.push('Roll number is required');
  if (!studentData.studentName) errors.push('Student name is required');
  
  // Roll number format validation
  if (studentData.rollNo && !/^[0-9A-Za-z]+$/.test(studentData.rollNo)) {
    errors.push('Roll number should contain only letters and numbers');
  }
  
  // Mobile number validation
  if (studentData.studentMobile && !/^[0-9]{10}$/.test(studentData.studentMobile.replace(/\D/g, ''))) {
    errors.push('Student mobile should be 10 digits');
  }
  
  if (studentData.fatherMobile && !/^[0-9]{10}$/.test(studentData.fatherMobile.replace(/\D/g, ''))) {
    errors.push('Father mobile should be 10 digits');
  }
  
  // Aadhaar validation
  if (studentData.aadhaar && !/^[0-9]{12}$/.test(studentData.aadhaar.replace(/\D/g, ''))) {
    errors.push('Aadhaar should be 12 digits');
  }
  
  // Gender validation
  if (studentData.gender && !['Male', 'Female', 'Other'].includes(studentData.gender)) {
    errors.push('Gender should be Male, Female, or Other');
  }
  
  // Quota validation
  if (studentData.quota && !['COV', 'MGMT'].includes(studentData.quota)) {
    errors.push('Quota should be COV or MGMT');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if student already exists in the system
 * @param {string} rollNo - Student roll number
 * @param {string} department - Department
 * @param {string} year - Year
 * @param {string} section - Section
 * @returns {Object} Result object with existence status
 */
export const checkStudentExists = async (rollNo, department, year, section) => {
  try {
    const deptShort = getDepartmentShortName(department);
    const sanitizedDept = deptShort.replace(/[^A-Z0-9_]/gi, '');
    const sanitizedYear = year.replace(/[^A-Z0-9]/gi, '');
    const sanitizedSection = section.replace(/[^A-Z0-9]/gi, '');
    const groupKey = `${sanitizedYear}-${sanitizedSection}`;
    
    const studentRef = doc(db, `students/${sanitizedDept}/${groupKey}`, rollNo);
    const studentDoc = await getDoc(studentRef);
    
    return {
      exists: studentDoc.exists(),
      data: studentDoc.exists() ? studentDoc.data() : null
    };
  } catch (error) {
    console.error('Check student exists error:', error);
    return {
      exists: false,
      error: error.message
    };
  }
};
