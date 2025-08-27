/**
 * Firebase Admin SDK Helper Functions for Student Management
 * 
 * This file contains utility functions that should be used on the backend server
 * with Firebase Admin SDK to handle Firebase Auth user deletions.
 * 
 * Note: These functions require Firebase Admin SDK and should NOT be used in the frontend.
 */

// Example backend implementation (Node.js with Firebase Admin SDK)
/*
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./path/to/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com"
});

/**
 * Delete a Firebase Auth user by UID
 * @param {string} uid - Firebase Auth UID
 * @returns {Object} Result object with success status
 */
export const deleteFirebaseAuthUser = async (uid) => {
  try {
    await admin.auth().deleteUser(uid);
    return {
      success: true,
      message: `Firebase Auth user ${uid} deleted successfully`
    };
  } catch (error) {
    console.error('Error deleting Firebase Auth user:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

/**
 * Bulk delete multiple Firebase Auth users
 * @param {Array} uids - Array of Firebase Auth UIDs
 * @returns {Object} Result object with success and failure counts
 */
export const bulkDeleteFirebaseAuthUsers = async (uids) => {
  const results = {
    successful: [],
    failed: []
  };

  for (const uid of uids) {
    try {
      await admin.auth().deleteUser(uid);
      results.successful.push(uid);
    } catch (error) {
      results.failed.push({
        uid: uid,
        error: error.message,
        code: error.code
      });
    }
  }

  return results;
};

/**
 * Get Firebase Auth user information
 * @param {string} uid - Firebase Auth UID
 * @returns {Object} User information or null if not found
 */
export const getFirebaseAuthUser = async (uid) => {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return {
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
        emailVerified: userRecord.emailVerified,
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

/**
 * Disable a Firebase Auth user (instead of deleting)
 * @param {string} uid - Firebase Auth UID
 * @returns {Object} Result object with success status
 */
export const disableFirebaseAuthUser = async (uid) => {
  try {
    await admin.auth().updateUser(uid, {
      disabled: true
    });
    return {
      success: true,
      message: `Firebase Auth user ${uid} disabled successfully`
    };
  } catch (error) {
    console.error('Error disabling Firebase Auth user:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

/**
 * Complete student deletion workflow (Firestore + Firebase Auth)
 * @param {string} studentId - Student document ID
 * @param {string} department - Department
 * @param {string} year - Year
 * @param {string} section - Section
 * @param {string} authUid - Firebase Auth UID (optional)
 * @returns {Object} Result object with deletion details
 */
export const completeStudentDeletion = async (studentId, department, year, section, authUid = null) => {
  const results = {
    firestore: null,
    firebaseAuth: null,
    success: false
  };

  try {
    // 1. Delete from Firestore (this should be done first)
    // Use the deleteStudent function from firebaseAuthHelpers.js
    const firestoreResult = await deleteStudent(studentId, department, year, section, false);
    results.firestore = firestoreResult;

    // 2. Delete from Firebase Auth if UID is provided
    if (authUid) {
      const authResult = await deleteFirebaseAuthUser(authUid);
      results.firebaseAuth = authResult;
    }

    results.success = firestoreResult.success && (!authUid || results.firebaseAuth.success);

    return results;
  } catch (error) {
    console.error('Complete student deletion error:', error);
    return {
      ...results,
      success: false,
      error: error.message
    };
  }
};

/**
 * API endpoint handler for student deletion
 * Example Express.js route handler
 */
/*
app.post('/api/students/delete', async (req, res) => {
  try {
    const { studentId, department, year, section, authUid } = req.body;
    
    // Validate input
    if (!studentId || !department || !year || !section) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    // Perform complete deletion
    const result = await completeStudentDeletion(studentId, department, year, section, authUid);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Student deleted successfully',
        details: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete student',
        details: result
      });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
*/

/**
 * Security Rules for Firestore
 * Add these rules to your firestore.rules file to ensure only admins can delete students
 */
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Students collection - only admins can delete
    match /students/{department}/{yearSection}/{studentId} {
      allow read: if isAuthenticated();
      allow create, update: if isAdmin();
      allow delete: if isAdmin(); // Only admins can delete students
    }
    
    // studentsByUid collection
    match /studentsByUid/{uid} {
      allow read: if isAuthenticated();
      allow create, update: if isAdmin();
      allow delete: if isAdmin(); // Only admins can delete
    }
    
    // studentPortalAccess collection
    match /studentPortalAccess/{accessId} {
      allow read: if isAuthenticated();
      allow create, update: if isAdmin();
      allow delete: if isAdmin(); // Only admins can delete
    }
  }
}
*/

export default {
  deleteFirebaseAuthUser,
  bulkDeleteFirebaseAuthUsers,
  getFirebaseAuthUser,
  disableFirebaseAuthUser,
  completeStudentDeletion
};
