import { 
  createUserWithEmailAndPassword, 
  fetchSignInMethodsForEmail,
  updateProfile,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  collectionGroup,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db, workerAuth } from '../firebase';

/**
 * Faculty roles and permissions configuration
 */
export const FACULTY_ROLES = {
  "HOD": {
    level: 0,
    permissions: [
      "view_students", 
      "edit_grades", 
      "manage_courses", 
      "view_reports", 
      "manage_attendance", 
      "manage_faculty", 
      "department_admin",
      "approve_requests",
      "view_analytics"
    ],
    description: "Head of Department - Full department access"
  },
  "Professor": {
    level: 1,
    permissions: [
      "view_students", 
      "edit_grades", 
      "manage_courses", 
      "view_reports", 
      "manage_attendance",
      "approve_requests"
    ],
    description: "Professor - Senior faculty access"
  },
  "Associate Professor": {
    level: 2,
    permissions: [
      "view_students", 
      "edit_grades", 
      "manage_courses", 
      "view_reports"
    ],
    description: "Associate Professor - Mid-level faculty access"
  },
  "Assistant Professor": {
    level: 3,
    permissions: [
      "view_students", 
      "edit_grades", 
      "view_reports"
    ],
    description: "Assistant Professor - Junior faculty access"
  },
  "Lecturer": {
    level: 4,
    permissions: [
      "view_students", 
      "view_reports"
    ],
    description: "Lecturer - Basic faculty access"
  }
};

/**
 * Generate faculty email based on name and employee ID
 * @param {string} name - Faculty name
 * @param {string} empID - Employee ID
 * @returns {string} Generated email address
 */
export const generateFacultyEmail = (name, empID) => {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  const cleanEmpID = empID ? empID.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  return `${cleanName}${cleanEmpID}@faculty.ch360.edu.in`;
};

/**
 * Generate secure password for faculty
 * @param {string} empID - Employee ID
 * @param {string} name - Faculty name
 * @returns {string} Generated password
 */
export const generateFacultyPassword = (empID, name) => {
  const timestamp = Date.now().toString().slice(-6);
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 3);
  return `${cleanName}${empID}@${timestamp}`;
};

/**
 * Create Firebase Authentication account for faculty
 * @param {Object} facultyData - Faculty data object
 * @returns {Object} Result object with success status and user info
 */
export const createFacultyAuthAccount = async (facultyData) => {
  const providedEmail = (facultyData.emailID || '').trim();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(providedEmail);
  const emailToUse = isValidEmail ? providedEmail : generateFacultyEmail(facultyData.name, facultyData.empID);
  try {
    const password = generateFacultyPassword(facultyData.empID, facultyData.name);
    
    // Check if user already exists
    const signInMethods = await fetchSignInMethodsForEmail(workerAuth, emailToUse);
    if (signInMethods.length > 0) {
      return { 
        success: false, 
        error: 'User already exists', 
        uid: null,
        email: emailToUse,
        password 
      };
    }
    
    // Create user with worker auth to avoid session switching
    const userCredential = await createUserWithEmailAndPassword(workerAuth, emailToUse, password);
    
    // Update user profile with display name
    await updateProfile(userCredential.user, {
      displayName: facultyData.name,
      photoURL: null
    });
    
    return { 
      success: true, 
      uid: userCredential.user.uid, 
      email: emailToUse, 
      password,
      displayName: facultyData.name
    };
  } catch (error) {
    console.error('Auth creation error:', error);
    return { 
      success: false, 
      error: error.message, 
      uid: null,
      email: isValidEmail ? providedEmail : null,
      password: null
    };
  }
};

/**
 * Send welcome email with password reset link
 * @param {string} email - Faculty email address
 * @param {string} name - Faculty name
 * @returns {Object} Result object with success status
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    await sendPasswordResetEmail(workerAuth, email);
    console.log(`Password reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.warn('Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get faculty profile by UID
 * @param {string} uid - Faculty UID
 * @param {string} department - Faculty department (optional, will be fetched if not provided)
 * @returns {Object} Faculty profile data
 */
export const getFacultyProfile = async (uid, department = null) => {
  try {
    const facultyRefCandidates = [
      doc(db, 'faculty', 'CSE', 'members', uid),
      doc(db, 'faculty', 'ECE', 'members', uid),
      doc(db, 'faculty', 'EEE', 'members', uid),
      doc(db, 'faculty', 'ME', 'members', uid),
      doc(db, 'faculty', 'CE', 'members', uid)
    ];
    // Try known departments first; if none found, fall back to query by authUid
    for (let i = 0; i < facultyRefCandidates.length; i++) {
      const snap = await getDoc(facultyRefCandidates[i]);
      if (snap.exists()) {
        return { success: true, data: { uid, ...snap.data() } };
      }
    }
    const facultyRef = collection(db, 'faculty');
    const q = query(collectionGroup ? collectionGroup(db, 'members') : facultyRef, where('authUid', '==', uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { success: true, data: { uid: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: 'Faculty not found' };
    const facultyDoc = await getDoc(facultyRef);
    if (facultyDoc.exists()) {
      return { success: true, data: { uid, ...facultyDoc.data() } };
    }
    return { success: false, error: 'Faculty not found' };
  } catch (error) {
    console.error('Error fetching faculty profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get faculty profile by email
 * @param {string} email - Faculty email
 * @returns {Object} Faculty profile data
 */
export const getFacultyByEmail = async (email) => {
  try {
    const q = query(collectionGroup(db, 'members'), where('emailID', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const facultyDoc = querySnapshot.docs[0];
      return { success: true, data: { uid: facultyDoc.id, ...facultyDoc.data() } };
    }
    return { success: false, error: 'Faculty not found' };
  } catch (error) {
    console.error('Error fetching faculty by email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update faculty profile
 * @param {string} uid - Faculty UID
 * @param {string} department - Faculty department
 * @param {Object} updates - Profile updates
 * @returns {Object} Result object
 */
export const updateFacultyProfile = async (uid, department, updates) => {
  try {
    const facultyRef = doc(db, 'faculty', uid);
    await updateDoc(facultyRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      profileComplete: true
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating faculty profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if faculty has permission
 * @param {Array} facultyPermissions - Faculty permissions array
 * @param {string} requiredPermission - Required permission
 * @returns {boolean} Whether faculty has permission
 */
export const hasPermission = (facultyPermissions, requiredPermission) => {
  if (!facultyPermissions || !Array.isArray(facultyPermissions)) {
    return false;
  }
  return facultyPermissions.includes(requiredPermission);
};

/**
 * Check if faculty has role level access
 * @param {number} facultyRoleLevel - Faculty role level
 * @param {number} requiredLevel - Required role level (lower number = higher access)
 * @returns {boolean} Whether faculty has sufficient role level
 */
export const hasRoleLevel = (facultyRoleLevel, requiredLevel) => {
  return facultyRoleLevel <= requiredLevel;
};

/**
 * Faculty login with role validation
 * @param {string} email - Faculty email
 * @param {string} password - Faculty password
 * @returns {Object} Login result with faculty data
 */
export const facultyLogin = async (email, password) => {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(workerAuth, email, password);
    
    // Get faculty profile
    const facultyResult = await getFacultyByEmail(email);
    
    if (!facultyResult.success) {
      await signOut(workerAuth);
      return { success: false, error: 'Faculty profile not found' };
    }
    
    const facultyData = facultyResult.data;
    
    // Update last login on flat collection
    await updateDoc(doc(db, 'faculty', facultyData.uid), {
      lastLogin: serverTimestamp()
    });
    
    return {
      success: true,
      user: userCredential.user,
      faculty: facultyData
    };
  } catch (error) {
    console.error('Faculty login error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get faculty permissions for a specific role
 * @param {string} role - Faculty role
 * @returns {Array} Array of permissions
 */
export const getRolePermissions = (role) => {
  return FACULTY_ROLES[role]?.permissions || FACULTY_ROLES["Lecturer"].permissions;
};

/**
 * Get faculty role level
 * @param {string} role - Faculty role
 * @returns {number} Role level
 */
export const getRoleLevel = (role) => {
  return FACULTY_ROLES[role]?.level || FACULTY_ROLES["Lecturer"].level;
};

/**
 * Validate faculty data before creation
 * @param {Object} facultyData - Faculty data to validate
 * @returns {Object} Validation result
 */
export const validateFacultyData = (facultyData) => {
  const errors = [];
  
  if (!facultyData.name || facultyData.name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!facultyData.emailID || facultyData.emailID.trim() === '') {
    errors.push('Email ID is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(facultyData.emailID)) {
    errors.push('Invalid email format');
  }
  
  if (!facultyData.empID || facultyData.empID.trim() === '') {
    errors.push('Employee ID is required');
  }
  
  if (!facultyData.department || facultyData.department.trim() === '') {
    errors.push('Department is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create faculty profile with enhanced structure
 * @param {Object} facultyData - Basic faculty data
 * @param {string} authUid - Firebase Auth UID
 * @param {string} authEmail - Firebase Auth email
 * @returns {Object} Enhanced faculty profile
 */
export const createFacultyProfile = (facultyData, authUid, authEmail) => {
  const roleInfo = FACULTY_ROLES[facultyData.designation] || FACULTY_ROLES["Lecturer"];
  
  return {
    ...facultyData,
    authUid,
    authEmail,
    role: facultyData.designation || 'Lecturer',
    roleLevel: roleInfo.level,
    permissions: roleInfo.permissions,
    status: "Active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLogin: null,
    profileComplete: false,
    metadata: {
      createdBy: "admin",
      createdFrom: "faculty_management",
      version: "1.0"
    }
  };
};

/**
 * Get all faculty members from a specific department
 * @param {string} department - Department key
 * @returns {Object} Result object with faculty list
 */
export const getFacultyByDepartment = async (department) => {
  try {
    const facultyRef = collection(db, 'faculty');
    const q = query(facultyRef, where('departmentKey', '==', department));
    const querySnapshot = await getDocs(q);
    const facultyList = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    
    return { success: true, data: facultyList };
  } catch (error) {
    console.error('Error fetching faculty by department:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get faculty count by department
 * @param {string} department - Department key
 * @returns {Object} Result object with count
 */
export const getFacultyCountByDepartment = async (department) => {
  try {
    const facultyRef = collection(db, 'faculty');
    const q = query(facultyRef, where('departmentKey', '==', department));
    const querySnapshot = await getDocs(q);
    
    return { success: true, count: querySnapshot.size };
  } catch (error) {
    console.error('Error fetching faculty count by department:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Search faculty across all departments
 * @param {string} searchTerm - Search term (name, email, or empID)
 * @returns {Object} Result object with matching faculty
 */
export const searchFaculty = async (searchTerm) => {
  try {
    const facultyRef = collection(db, 'faculty');
    const q = query(
      facultyRef, 
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    
    const facultyList = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      uid: doc.id
    }));
    
    return { success: true, data: facultyList };
  } catch (error) {
    console.error('Error searching faculty:', error);
    return { success: false, error: error.message };
  }
};
