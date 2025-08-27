import { 
  createUserWithEmailAndPassword, 
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  updateProfile,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, writeBatch, query, collection, where, getDocs } from 'firebase/firestore';
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
  
  // Mobile number validation (only if provided)
  if (studentData.studentMobile && studentData.studentMobile.trim() !== '' && !/^[0-9]{10}$/.test(studentData.studentMobile.replace(/\D/g, ''))) {
    errors.push('Student mobile should be 10 digits');
  }
  
  if (studentData.fatherMobile && studentData.fatherMobile.trim() !== '' && !/^[0-9]{10}$/.test(studentData.fatherMobile.replace(/\D/g, ''))) {
    errors.push('Father mobile should be 10 digits');
  }
  
  // Aadhaar validation removed - not present in your Excel format
  
  // Gender validation (only if provided)
  if (studentData.gender && studentData.gender.trim() !== '' && !['Male', 'Female', 'Other'].includes(studentData.gender)) {
    errors.push('Gender should be Male, Female, or Other');
  }
  
  // Quota validation (only if provided) - Updated to match your Excel format (CC, MG)
  if (studentData.quota && studentData.quota.trim() !== '' && !['CC', 'MG', 'COV', 'MGMT'].includes(studentData.quota)) {
    errors.push('Quota should be CC, MG, COV, or MGMT');
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

/**
 * Delete student completely from both Firestore and Firebase Auth
 * @param {string} studentId - Student document ID
 * @param {string} department - Department
 * @param {string} year - Year
 * @param {string} section - Section
 * @param {boolean} deleteAuthUser - Whether to delete Firebase Auth user (requires Admin SDK)
 * @returns {Object} Result object with success status and details
 */
export const deleteStudent = async (studentId, department, year, section, deleteAuthUser = false) => {
  try {
    const deptShort = getDepartmentShortName(department);
    const sanitizedDept = deptShort.replace(/[^A-Z0-9_]/gi, '');
    const sanitizedYear = year.replace(/[^A-Z0-9]/gi, '');
    const sanitizedSection = section.replace(/[^A-Z0-9]/gi, '');
    const groupKey = `${sanitizedYear}-${sanitizedSection}`;
    
    // Get student document first
    const studentRef = doc(db, `students/${sanitizedDept}/${groupKey}`, studentId);
    const studentDoc = await getDoc(studentRef);
    
    if (!studentDoc.exists()) {
      return { success: false, error: 'Student not found' };
    }
    
    const studentData = studentDoc.data();
    const batch = writeBatch(db);
    
    // 1. Delete main student document
    batch.delete(studentRef);
    
    // 2. Delete from studentsByUid collection if authUid exists
    if (studentData.authUid) {
      const byUidRef = doc(db, 'studentsByUid', studentData.authUid);
      batch.delete(byUidRef);
    }
    
    // 3. Delete from studentPortalAccess collection
    // Note: This would require a query to find the document by studentId
    // For now, we'll handle this separately if needed
    
    // 4. Delete from any other related collections
    // - Attendance records
    // - Grades records
    // - Fee records
    // - etc.
    
    // Commit the batch
    await batch.commit();
    
    // 5. Handle Firebase Auth deletion (requires Admin SDK)
    let authDeletionResult = null;
    if (deleteAuthUser && studentData.authUid) {
      try {
        // This would require Firebase Admin SDK on the backend
        // For now, we'll return the authUid for manual deletion
        authDeletionResult = {
          authUid: studentData.authUid,
          email: studentData.email,
          requiresAdminSDK: true,
          message: 'Firebase Auth user needs to be deleted using Admin SDK'
        };
      } catch (error) {
        console.error('Error deleting Firebase Auth user:', error);
        authDeletionResult = {
          error: error.message,
          authUid: studentData.authUid
        };
      }
    }
    
    return {
      success: true,
      message: 'Student deleted successfully',
      deletedStudent: {
        id: studentId,
        name: studentData.studentName || studentData.name || `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim(),
        rollNo: studentData.rollNo,
        authUid: studentData.authUid,
        email: studentData.email
      },
      authDeletion: authDeletionResult
    };
    
  } catch (error) {
    console.error('Delete student error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Bulk delete multiple students
 * @param {Array} students - Array of student objects with id, department, year, section
 * @param {boolean} deleteAuthUsers - Whether to delete Firebase Auth users
 * @returns {Object} Result object with success status and details
 */
export const bulkDeleteStudents = async (students, deleteAuthUsers = false) => {
  const results = {
    successful: [],
    failed: [],
    authDeletions: []
  };
  
  for (const student of students) {
    try {
      const result = await deleteStudent(
        student.id, 
        student.department, 
        student.year, 
        student.section, 
        deleteAuthUsers
      );
      
      if (result.success) {
        results.successful.push(result.deletedStudent);
        if (result.authDeletion) {
          results.authDeletions.push(result.authDeletion);
        }
      } else {
        results.failed.push({
          student: student,
          error: result.error
        });
      }
    } catch (error) {
      results.failed.push({
        student: student,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Delete student portal access records
 * @param {string} studentId - Student ID
 * @returns {Object} Result object with success status
 */
export const deleteStudentPortalAccess = async (studentId) => {
  try {
    // Query for portal access records by studentId
    const portalAccessQuery = query(
      collection(db, 'studentPortalAccess'),
      where('studentId', '==', studentId)
    );
    
    const querySnapshot = await getDocs(portalAccessQuery);
    const batch = writeBatch(db);
    
    querySnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return {
      success: true,
      message: `Deleted ${querySnapshot.docs.length} portal access records`,
      deletedCount: querySnapshot.docs.length
    };
  } catch (error) {
    console.error('Delete portal access error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clean up all student-related data
 * @param {string} studentId - Student ID
 * @param {string} department - Department
 * @param {string} year - Year
 * @param {string} section - Section
 * @returns {Object} Result object with cleanup details
 */
export const cleanupStudentData = async (studentId, department, year, section) => {
  const cleanupResults = {
    studentDocument: null,
    portalAccess: null,
    attendance: null,
    grades: null,
    fees: null,
    otherRecords: null
  };
  
  try {
    // 1. Delete main student document
    const studentResult = await deleteStudent(studentId, department, year, section, false);
    cleanupResults.studentDocument = studentResult;
    
    // 2. Delete portal access records
    const portalResult = await deleteStudentPortalAccess(studentId);
    cleanupResults.portalAccess = portalResult;
    
    // 3. Delete attendance records (if they exist)
    try {
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('studentId', '==', studentId)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendanceBatch = writeBatch(db);
      
      attendanceSnapshot.docs.forEach(doc => {
        attendanceBatch.delete(doc.ref);
      });
      
      await attendanceBatch.commit();
      cleanupResults.attendance = {
        success: true,
        deletedCount: attendanceSnapshot.docs.length
      };
    } catch (error) {
      cleanupResults.attendance = { success: false, error: error.message };
    }
    
    // 4. Delete grades records (if they exist)
    try {
      const gradesQuery = query(
        collection(db, 'grades'),
        where('studentId', '==', studentId)
      );
      const gradesSnapshot = await getDocs(gradesQuery);
      const gradesBatch = writeBatch(db);
      
      gradesSnapshot.docs.forEach(doc => {
        gradesBatch.delete(doc.ref);
      });
      
      await gradesBatch.commit();
      cleanupResults.grades = {
        success: true,
        deletedCount: gradesSnapshot.docs.length
      };
    } catch (error) {
      cleanupResults.grades = { success: false, error: error.message };
    }
    
    // 5. Delete fee records (if they exist)
    try {
      const feesQuery = query(
        collection(db, 'fees'),
        where('studentId', '==', studentId)
      );
      const feesSnapshot = await getDocs(feesQuery);
      const feesBatch = writeBatch(db);
      
      feesSnapshot.docs.forEach(doc => {
        feesBatch.delete(doc.ref);
      });
      
      await feesBatch.commit();
      cleanupResults.fees = {
        success: true,
        deletedCount: feesSnapshot.docs.length
      };
    } catch (error) {
      cleanupResults.fees = { success: false, error: error.message };
    }
    
    return {
      success: true,
      message: 'Student data cleanup completed',
      results: cleanupResults
    };
    
  } catch (error) {
    console.error('Cleanup student data error:', error);
    return { success: false, error: error.message, results: cleanupResults };
  }
};
