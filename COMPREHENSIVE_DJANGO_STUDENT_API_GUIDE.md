# Comprehensive Django Student Management API Guide

This document provides a complete guide to all Django API endpoints for student management, including implementation details, usage examples, and frontend integration.

## 🎯 Overview

The Django Student Management API provides comprehensive functionality for managing student data through RESTful endpoints. All endpoints are integrated with JWT authentication and provide detailed error handling.

## 📋 API Endpoints Summary

### Base URLs
- **Development**: `http://127.0.0.1:8000/api/v1/students/`
- **Production**: `https://campushub-backend1.onrender.com/api/v1/students/`

### Complete Endpoint List

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/v1/students/students/` | Students CRUD |
| `GET/PUT/DELETE` | `/api/v1/students/students/{id}/` | Student detail |
| `GET` | `/api/v1/students/students/{id}/documents/` | Student documents |
| `GET` | `/api/v1/students/students/{id}/enrollment-history/` | Enrollment history |
| `GET` | `/api/v1/students/students/{id}/custom-fields/` | Student custom fields |
| `POST` | `/api/v1/students/students/{id}/create-login/` | Create student login |
| `POST` | `/api/v1/students/students/bulk-create/` | Bulk create students |
| `POST` | `/api/v1/students/students/bulk-update/` | Bulk update students |
| `DELETE` | `/api/v1/students/students/bulk-delete/` | Bulk delete students |
| `GET` | `/api/v1/students/students/stats/` | Student statistics |
| `GET` | `/api/v1/students/students/search/` | Search students |

## 🔧 Implementation Details

### 1. DjangoAuthService (`src/utils/djangoAuthService.js`)

The service layer handles all direct API communication:

```javascript
class DjangoAuthService {
  // Basic CRUD Operations
  async getStudents(params = {}) { /* ... */ }
  async getStudentById(studentId) { /* ... */ }
  async createStudent(studentData) { /* ... */ }
  async updateStudent(studentId, studentData) { /* ... */ }
  async deleteStudent(studentId) { /* ... */ }

  // Document Management
  async getStudentDocuments(studentId) { /* ... */ }
  async uploadStudentDocument(studentId, documentData) { /* ... */ }
  async deleteStudentDocument(studentId, documentId) { /* ... */ }

  // Enrollment History
  async getStudentEnrollmentHistory(studentId) { /* ... */ }
  async addEnrollmentRecord(studentId, enrollmentData) { /* ... */ }

  // Custom Fields
  async getStudentCustomFields(studentId) { /* ... */ }
  async updateStudentCustomFields(studentId, customFields) { /* ... */ }

  // Login Management
  async createStudentLogin(studentId, loginData) { /* ... */ }

  // Bulk Operations
  async bulkCreateStudentsEnhanced(studentsData) { /* ... */ }
  async bulkUpdateStudents(updateData) { /* ... */ }
  async bulkDeleteStudents(studentIds) { /* ... */ }

  // Search and Analytics
  async advancedSearchStudents(searchParams = {}) { /* ... */ }
  async getStudentAnalytics(filters = {}) { /* ... */ }

  // Data Import/Export
  async exportStudentsData(filters = {}, format = 'csv') { /* ... */ }
  async importStudentsData(fileData, options = {}) { /* ... */ }
}
```

### 2. DjangoAuthHelpers (`src/utils/djangoAuthHelpers.js`)

Helper functions provide a convenient interface for components:

```javascript
// Basic Operations
export const getStudents = async (params = {}) => { /* ... */ }
export const getStudentById = async (studentId) => { /* ... */ }
export const createStudent = async (studentData) => { /* ... */ }
export const updateStudent = async (studentId, studentData) => { /* ... */ }
export const deleteStudent = async (studentId) => { /* ... */ }

// Document Management
export const getStudentDocuments = async (studentId) => { /* ... */ }
export const uploadStudentDocument = async (studentId, documentData) => { /* ... */ }
export const deleteStudentDocument = async (studentId, documentId) => { /* ... */ }

// Enrollment History
export const getStudentEnrollmentHistory = async (studentId) => { /* ... */ }
export const addEnrollmentRecord = async (studentId, enrollmentData) => { /* ... */ }

// Custom Fields
export const getStudentCustomFields = async (studentId) => { /* ... */ }
export const updateStudentCustomFields = async (studentId, customFields) => { /* ... */ }

// Login Management
export const createStudentLogin = async (studentId, loginData) => { /* ... */ }

// Bulk Operations
export const bulkCreateStudentsEnhanced = async (studentsData) => { /* ... */ }
export const bulkUpdateStudents = async (updateData) => { /* ... */ }
export const bulkDeleteStudents = async (studentIds) => { /* ... */ }

// Search and Analytics
export const advancedSearchStudents = async (searchParams = {}) => { /* ... */ }
export const getStudentAnalytics = async (filters = {}) => { /* ... */ }

// Data Import/Export
export const exportStudentsData = async (filters = {}, format = 'csv') => { /* ... */ }
export const importStudentsData = async (fileData, options = {}) => { /* ... */ }
```

### 3. DjangoAuthContext (`src/contexts/DjangoAuthContext.jsx`)

React context provides global access to all student management functions:

```javascript
const { students } = useDjangoAuth();

// Available methods:
students.getStudents(params)
students.getStudentById(studentId)
students.createStudent(studentData)
students.updateStudent(studentId, studentData)
students.deleteStudent(studentId)

// Document Management
students.getStudentDocuments(studentId)
students.uploadStudentDocument(studentId, documentData)
students.deleteStudentDocument(studentId, documentId)

// Enrollment History
students.getStudentEnrollmentHistory(studentId)
students.addEnrollmentRecord(studentId, enrollmentData)

// Custom Fields
students.getStudentCustomFields(studentId)
students.updateStudentCustomFields(studentId, customFields)

// Login Management
students.createStudentLogin(studentId, loginData)

// Bulk Operations
students.bulkCreateStudentsEnhanced(studentsData)
students.bulkUpdateStudents(updateData)
students.bulkDeleteStudents(studentIds)

// Search and Analytics
students.advancedSearchStudents(searchParams)
students.getStudentAnalytics(filters)

// Data Import/Export
students.exportStudentsData(filters, format)
students.importStudentsData(fileData, options)
```

## 📊 Student Data Structure

### Comprehensive Student Fields

```javascript
const studentData = {
  // Basic Information
  rollNumber: "22695a3208",
  firstName: "Raju",
  lastName: "S",
  middleName: "",
  dateOfBirth: "2003-10-14",
  gender: "Male",

  // Academic Information
  section: "Section B",
  academicYear: "2024-2025",
  gradeLevel: "Grade 12",
  quota: "General",
  rank: 1,

  // Contact Information
  email: "rajusampath.b@gmail.com",
  studentMobile: "6301201156",
  addressLine1: "2-16 sirigiripalle gudupalle",
  addressLine2: "",
  city: "Kuppam",
  state: "Andhra Pradesh",
  postalCode: "517426",
  country: "India",
  village: "sirigiripalle",

  // Identity Information
  aadharNumber: "408222886718",
  religion: "Hindu",
  caste: "BC-A",
  subcaste: "",

  // Parent Information
  fatherName: "M Sampath",
  motherName: "S Bhavani",
  fatherMobile: "8143630426",
  motherMobile: "9676630426",

  // Guardian Information
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  guardianRelationship: "",

  // Emergency Contact
  emergencyContactName: "6301201156",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",

  // Academic Status
  enrollmentDate: "2025-09-05",
  expectedGraduationDate: "2025-09-05",
  status: "Graduated",

  // Medical Information
  medicalConditions: "",
  medications: "",

  // Additional Information
  notes: "",
  profilePicture: null
};
```

## 🎨 Frontend Components

### 1. StudentsApiTest Component

**Location**: `src/components/StudentsApiTest.jsx`

**Features**:
- Complete CRUD interface for students
- Comprehensive form with all student fields
- Search and filtering capabilities
- Statistics dashboard
- Student details view modal
- Bulk operations support

**Usage**:
```jsx
import StudentsApiTest from './components/StudentsApiTest';

function App() {
  return (
    <DjangoAuthProvider>
      <StudentsApiTest />
    </DjangoAuthProvider>
  );
}
```

### 2. EnhancedDjangoStudentManagement Component

**Location**: `src/components/EnhancedDjangoStudentManagement.jsx`

**Features**:
- Tabbed interface (Overview, Students, Analytics, Documents, Bulk Operations, Settings)
- Advanced search and filtering
- Bulk operations (import/export, bulk update/delete)
- Real-time statistics and analytics
- Responsive design
- Dark mode support

**Usage**:
```jsx
import EnhancedDjangoStudentManagement from './components/EnhancedDjangoStudentManagement';

function App() {
  return (
    <DjangoAuthProvider>
      <EnhancedDjangoStudentManagement />
    </DjangoAuthProvider>
  );
}
```

### 3. StudentDetailsView Component

**Location**: `src/components/StudentDetailsView.jsx`

**Features**:
- Comprehensive student information display
- Organized sections with icons
- Edit and close actions
- Responsive modal design

## 🔍 API Usage Examples

### 1. Basic CRUD Operations

```javascript
import { useDjangoAuth } from '../contexts/DjangoAuthContext';

function StudentComponent() {
  const { students } = useDjangoAuth();

  // Get all students
  const loadStudents = async () => {
    const result = await students.getStudents({
      page: 1,
      page_size: 20,
      search: 'john',
      status: 'active'
    });
    
    if (result.success) {
      console.log('Students:', result.data);
    } else {
      console.error('Error:', result.error);
    }
  };

  // Create new student
  const createStudent = async () => {
    const studentData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      rollNumber: 'CS2024001',
      // ... other fields
    };

    const result = await students.createStudent(studentData);
    if (result.success) {
      console.log('Student created:', result.data);
    }
  };

  // Update student
  const updateStudent = async (studentId) => {
    const updateData = {
      status: 'active',
      email: 'newemail@example.com'
    };

    const result = await students.updateStudent(studentId, updateData);
    if (result.success) {
      console.log('Student updated:', result.data);
    }
  };

  // Delete student
  const deleteStudent = async (studentId) => {
    const result = await students.deleteStudent(studentId);
    if (result.success) {
      console.log('Student deleted successfully');
    }
  };
}
```

### 2. Document Management

```javascript
// Get student documents
const getDocuments = async (studentId) => {
  const result = await students.getStudentDocuments(studentId);
  if (result.success) {
    console.log('Documents:', result.data);
  }
};

// Upload document
const uploadDocument = async (studentId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', 'certificate');
  formData.append('description', 'Academic certificate');

  const result = await students.uploadStudentDocument(studentId, formData);
  if (result.success) {
    console.log('Document uploaded:', result.data);
  }
};

// Delete document
const deleteDocument = async (studentId, documentId) => {
  const result = await students.deleteStudentDocument(studentId, documentId);
  if (result.success) {
    console.log('Document deleted successfully');
  }
};
```

### 3. Bulk Operations

```javascript
// Bulk create students
const bulkCreate = async () => {
  const studentsData = [
    {
      firstName: 'Student 1',
      lastName: 'Lastname',
      email: 'student1@example.com',
      rollNumber: 'CS2024001'
    },
    {
      firstName: 'Student 2',
      lastName: 'Lastname',
      email: 'student2@example.com',
      rollNumber: 'CS2024002'
    }
  ];

  const result = await students.bulkCreateStudentsEnhanced(studentsData);
  if (result.success) {
    console.log('Bulk create result:', result.data);
  }
};

// Bulk update students
const bulkUpdate = async () => {
  const updateData = {
    student_ids: [1, 2, 3],
    status: 'active',
    department: 'Computer Science'
  };

  const result = await students.bulkUpdateStudents(updateData);
  if (result.success) {
    console.log('Bulk update completed');
  }
};

// Bulk delete students
const bulkDelete = async () => {
  const studentIds = [1, 2, 3];
  const result = await students.bulkDeleteStudents(studentIds);
  if (result.success) {
    console.log('Bulk delete completed');
  }
};
```

### 4. Search and Analytics

```javascript
// Advanced search
const advancedSearch = async () => {
  const searchParams = {
    search: 'john',
    department: 'Computer Science',
    year: '2024',
    status: 'active',
    page: 1,
    page_size: 50
  };

  const result = await students.advancedSearchStudents(searchParams);
  if (result.success) {
    console.log('Search results:', result.data);
  }
};

// Get analytics
const getAnalytics = async () => {
  const filters = {
    year: '2024',
    department: 'Computer Science'
  };

  const result = await students.getStudentAnalytics(filters);
  if (result.success) {
    console.log('Analytics:', result.data);
  }
};
```

### 5. Data Import/Export

```javascript
// Export data
const exportData = async () => {
  const filters = {
    status: 'active',
    department: 'Computer Science'
  };

  const result = await students.exportStudentsData(filters, 'csv');
  if (result.success) {
    // Handle file download
    if (result.data.download_url) {
      window.open(result.data.download_url, '_blank');
    }
  }
};

// Import data
const importData = async (file) => {
  const options = {
    department: 'Computer Science',
    year: '2024',
    create_logins: true
  };

  const result = await students.importStudentsData(file, options);
  if (result.success) {
    console.log('Import result:', result.data);
  }
};
```

## 🚀 Getting Started

### 1. Prerequisites

- Django backend running on `http://127.0.0.1:8000`
- React frontend with Django authentication setup
- Valid JWT tokens for API access

### 2. Access the Components

#### Via Navigation Menu:
1. Login to your application
2. Navigate to "Students API Test" or "Enhanced Student Management"
3. Start using the comprehensive student management features

#### Via Direct URLs:
- Students API Test: `http://localhost:5173/students-api-test`
- Enhanced Student Management: `http://localhost:5173/enhanced-student-management`

### 3. Testing the API

1. **Basic Operations**: Use the Students API Test component to test CRUD operations
2. **Advanced Features**: Use the Enhanced Student Management component for full functionality
3. **API Endpoints**: All endpoints are documented and ready for backend implementation

## 🔧 Backend Requirements

To make these APIs work, your Django backend needs to implement the following endpoints:

### Required Django Views/Serializers:

```python
# models.py
class Student(models.Model):
    # All the comprehensive fields as shown in the data structure
    pass

class StudentDocument(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    file = models.FileField(upload_to='student_documents/')
    document_type = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

class EnrollmentHistory(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    enrollment_date = models.DateField()
    program = models.CharField(max_length=200)
    status = models.CharField(max_length=50)
    # ... other fields

# views.py
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    # Implement all CRUD operations

class StudentDocumentViewSet(viewsets.ModelViewSet):
    queryset = StudentDocument.objects.all()
    serializer_class = StudentDocumentSerializer
    # Implement document management

# ... other viewsets for enrollment history, custom fields, etc.
```

## 📝 Error Handling

All API calls include comprehensive error handling:

```javascript
const result = await students.getStudents();

if (result.success) {
  // Handle success
  console.log('Data:', result.data);
} else {
  // Handle error
  console.error('Error:', result.error);
  console.error('Status:', result.status);
}
```

## 🎯 Key Features

1. **Complete CRUD Operations**: Create, read, update, delete students
2. **Document Management**: Upload, view, delete student documents
3. **Enrollment History**: Track student enrollment changes
4. **Custom Fields**: Manage additional student data fields
5. **Login Management**: Create student login credentials
6. **Bulk Operations**: Import/export, bulk update/delete
7. **Advanced Search**: Filter and search with multiple criteria
8. **Analytics**: Get statistics and insights
9. **Responsive Design**: Works on all devices
10. **Dark Mode Support**: Modern UI with theme switching

## 🔄 Migration from Firebase

The new Django-based system provides a complete replacement for Firebase-based student management:

1. **Data Migration**: Use the bulk import functionality to migrate existing Firebase data
2. **Component Replacement**: Replace Firebase-based components with Django-based ones
3. **API Integration**: All Firebase operations now use Django REST API
4. **Enhanced Features**: Additional functionality not available in Firebase version

This comprehensive implementation provides a robust, scalable, and feature-rich student management system using Django REST API with React frontend.
