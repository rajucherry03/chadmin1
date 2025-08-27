# Student Deletion Guide

This guide explains how to use the new student deletion functionality in the Student Portal component.

## Overview

The Student Portal now includes comprehensive deletion capabilities that allow you to:

1. **Delete students from Firestore** - Remove student documents and related data
2. **Delete Firebase Auth users** - Remove authentication accounts (requires Admin SDK)
3. **Clean up related data** - Remove attendance, grades, fees, and portal access records

## Features

### 🔴 Basic Deletion
- Deletes student documents from Firestore
- Removes portal access records
- Cleans up `studentsByUid` references
- Provides detailed success/failure feedback

### 🟠 Full Cleanup
- Performs basic deletion plus:
- Removes attendance records
- Deletes grades data
- Cleans up fee records
- Comprehensive data cleanup

### 🔐 Firebase Auth Integration
- Identifies students with Firebase Auth accounts
- Provides UIDs for manual Admin SDK deletion
- Supports both deletion and disabling options

## How to Use

### 1. Access the Student Portal
Navigate to the Student Portal component in your application.

### 2. Select Students
- Choose Department, Year, and Section to load students
- Use the search functionality to find specific students
- Select individual students or use "Select All" for bulk operations

### 3. Choose Deletion Method
Two deletion options are available:

#### Option A: Basic Deletion
- Click the **"Delete Students"** button
- Confirms deletion of student documents and portal access
- Shows results with Firebase Auth UIDs for manual cleanup

#### Option B: Full Cleanup
- Click the **"Full Cleanup"** button in the confirmation modal
- Performs comprehensive data cleanup
- Removes all related records (attendance, grades, fees, etc.)

### 4. Confirm Deletion
- Review the list of students to be deleted
- Read the warning about permanent deletion
- Choose your deletion method
- Click "Delete Permanently" or "Full Cleanup"

## Technical Implementation

### Frontend Components

#### StudentPortal.jsx
```javascript
// Main deletion function
const deleteStudents = async (studentsToDelete) => {
  // Uses bulkDeleteStudents utility function
  const results = await bulkDeleteStudents(studentsForDeletion, false);
  // Shows detailed results including Firebase Auth UIDs
};

// Enhanced cleanup function
const deleteStudentsWithCleanup = async (studentsToDelete) => {
  // Uses cleanupStudentData utility function
  const result = await cleanupStudentData(student.id, dept, year, section);
  // Shows comprehensive cleanup results
};
```

#### Utility Functions (firebaseAuthHelpers.js)
```javascript
// Delete single student
export const deleteStudent = async (studentId, department, year, section, deleteAuthUser = false)

// Bulk delete multiple students
export const bulkDeleteStudents = async (students, deleteAuthUsers = false)

// Complete data cleanup
export const cleanupStudentData = async (studentId, department, year, section)
```

### Backend Integration (Admin SDK)

For Firebase Auth user deletion, implement the backend functions in `adminAuthHelpers.js`:

```javascript
// Delete Firebase Auth user
export const deleteFirebaseAuthUser = async (uid)

// Bulk delete Firebase Auth users
export const bulkDeleteFirebaseAuthUsers = async (uids)

// Complete student deletion workflow
export const completeStudentDeletion = async (studentId, department, year, section, authUid)
```

## Security Considerations

### Firestore Security Rules
Ensure your `firestore.rules` includes proper deletion permissions:

```javascript
// Students collection - only admins can delete
match /students/{department}/{yearSection}/{studentId} {
  allow delete: if isAdmin(); // Only admins can delete students
}

// studentsByUid collection
match /studentsByUid/{uid} {
  allow delete: if isAdmin(); // Only admins can delete
}

// studentPortalAccess collection
match /studentPortalAccess/{accessId} {
  allow delete: if isAdmin(); // Only admins can delete
}
```

### Firebase Auth Deletion
- Firebase Auth user deletion requires Admin SDK
- Should be implemented on a secure backend server
- Never expose Admin SDK credentials in frontend code

## Data Cleanup Details

### What Gets Deleted

#### Basic Deletion:
- ✅ Student document from `students/{dept}/{year-section}/{studentId}`
- ✅ Reference from `studentsByUid/{authUid}`
- ✅ Portal access records from `studentPortalAccess`

#### Full Cleanup (Additional):
- ✅ Attendance records from `attendance` collection
- ✅ Grades records from `grades` collection
- ✅ Fee records from `fees` collection
- ✅ Any other related collections

### What Requires Manual Action:
- 🔐 Firebase Auth user accounts (requires Admin SDK)
- 📧 Email notifications (if implemented)
- 📊 Analytics data (if tracked separately)

## Error Handling

The system provides comprehensive error handling:

### Success Feedback
```
✅ Successfully deleted: 3 students
✅ Successfully cleaned up: 3 students

📊 Cleanup Details:
John Doe (CS001):
   ✅ Student document deleted
   ✅ Portal access records deleted (1)
   ✅ Attendance records deleted (45)
   ✅ Grades records deleted (12)
   ✅ Fee records deleted (8)
```

### Error Feedback
```
❌ Failed to delete: 1 students
   - Jane Smith (CS002): Permission denied

⚠️ 2 students have Firebase Auth accounts that need manual deletion via Admin SDK:
   - abc123def456 (jane.smith@student.ch360.edu.in)
   - xyz789ghi012 (john.doe@student.ch360.edu.in)
```

## Best Practices

### 1. Backup Before Deletion
- Always backup important data before bulk deletions
- Consider implementing soft delete for critical data

### 2. Gradual Rollout
- Test deletion functionality with a small group first
- Monitor for any unexpected data loss

### 3. Audit Trail
- Consider implementing audit logs for deletions
- Track who deleted what and when

### 4. Firebase Auth Cleanup
- Regularly review and clean up orphaned Firebase Auth accounts
- Implement automated cleanup scripts if needed

## Troubleshooting

### Common Issues

#### Permission Denied
- Ensure user has admin privileges
- Check Firestore security rules
- Verify Firebase Auth permissions

#### Firebase Auth Deletion Fails
- Use Admin SDK on backend server
- Check service account permissions
- Verify UID exists in Firebase Auth

#### Incomplete Cleanup
- Check for related collections not covered
- Verify all student references are updated
- Review error logs for specific failures

### Debug Mode
Enable detailed logging by adding console.log statements:

```javascript
// In deleteStudents function
console.log('Deleting students:', studentsToDelete);
console.log('Deletion results:', results);
```

## API Integration

For backend integration, use the provided API endpoint example:

```javascript
POST /api/students/delete
{
  "studentId": "CS001",
  "department": "CSE",
  "year": "II",
  "section": "A",
  "authUid": "abc123def456"
}
```

## Support

For issues or questions:
1. Check the browser console for error messages
2. Review Firestore security rules
3. Verify Firebase Auth permissions
4. Contact system administrator for Admin SDK issues

---

**⚠️ Important**: Student deletion is permanent and cannot be undone. Always double-check before confirming deletion operations.
