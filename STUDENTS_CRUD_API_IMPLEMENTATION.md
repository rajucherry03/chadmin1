# Students CRUD API Implementation

This document describes the implementation of the Students CRUD API endpoints for the CampusHub Admin application.

## Overview

The Students CRUD API provides comprehensive functionality for managing student data through RESTful endpoints. The implementation includes both service layer methods and helper functions for easy integration with React components.

## API Endpoints

### Base URL
- **Development**: `http://127.0.0.1:8000/api/v1/students/students/`
- **Production**: `https://campushub-backend1.onrender.com/api/v1/students/students/`

### Endpoints

#### 1. GET `/api/v1/students/students/`
**Description**: Retrieve all students with optional filtering and pagination

**Query Parameters**:
- `search` - Search by name, email, or roll number
- `department` - Filter by department
- `year` - Filter by year
- `section` - Filter by section
- `status` - Filter by status (active, inactive, pending)
- `page` - Page number for pagination
- `page_size` - Number of items per page
- `ordering` - Sort field (e.g., `name`, `-name` for descending)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "rollNo": "CS2024001",
      "department": "Computer Science",
      "year": "2024",
      "section": "A",
      "phone": "+1234567890",
      "address": "123 Main St",
      "status": "active",
      "fatherName": "Robert Doe",
      "motherName": "Jane Doe",
      "dateOfBirth": "2000-01-01",
      "gender": "Male",
      "bloodGroup": "O+",
      "emergencyContact": "+1234567891",
      "admissionDate": "2024-01-15",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 1,
  "next": null,
  "previous": null
}
```

#### 2. GET `/api/v1/students/students/{id}/`
**Description**: Retrieve a specific student by ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    // ... other student fields
  }
}
```

#### 3. POST `/api/v1/students/students/`
**Description**: Create a new student

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "rollNo": "CS2024001",
  "department": "Computer Science",
  "year": "2024",
  "section": "A",
  "phone": "+1234567890",
  "address": "123 Main St",
  "status": "active",
  "fatherName": "Robert Doe",
  "motherName": "Jane Doe",
  "dateOfBirth": "2000-01-01",
  "gender": "Male",
  "bloodGroup": "O+",
  "emergencyContact": "+1234567891",
  "admissionDate": "2024-01-15"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    // ... other student fields with generated ID
  }
}
```

#### 4. PATCH `/api/v1/students/students/{id}/`
**Description**: Update an existing student

**Request Body**: Partial student data (only fields to be updated)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe Updated",
    "email": "john.doe@example.com",
    // ... updated student fields
  }
}
```

#### 5. DELETE `/api/v1/students/students/{id}/`
**Description**: Delete a student

**Response**:
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

#### 6. POST `/api/v1/students/students/bulk/`
**Description**: Bulk create multiple students

**Request Body**:
```json
{
  "students": [
    {
      "name": "Student 1",
      "email": "student1@example.com",
      // ... other fields
    },
    {
      "name": "Student 2",
      "email": "student2@example.com",
      // ... other fields
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "created": 2,
    "failed": 0,
    "results": [
      // ... created student objects
    ]
  }
}
```

## Implementation Details

### 1. DjangoAuthService (`src/utils/djangoAuthService.js`)

The service layer provides the core API communication methods:

#### Methods Added:
- `getStudents(params)` - Fetch students with filtering
- `getStudentById(studentId)` - Fetch single student
- `createStudent(studentData)` - Create new student
- `updateStudent(studentId, studentData)` - Update student
- `deleteStudent(studentId)` - Delete student
- `bulkCreateStudents(studentsData)` - Bulk create students

#### Key Features:
- **Automatic Token Refresh**: All methods use `makeRequest()` which handles token refresh
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Data Validation**: Input validation and data cleaning
- **Response Standardization**: Consistent response format

### 2. DjangoAuthHelpers (`src/utils/djangoAuthHelpers.js`)

Helper functions for easy integration with React components:

#### Functions Added:
- `getStudents(params)` - Wrapper for service method
- `getStudentById(studentId)` - Wrapper for service method
- `createStudent(studentData)` - Wrapper for service method
- `updateStudent(studentId, studentData)` - Wrapper for service method
- `deleteStudent(studentId)` - Wrapper for service method
- `bulkCreateStudents(studentsData)` - Wrapper for service method
- `searchStudents(searchParams)` - Advanced search with filters
- `getStudentsStats()` - Get students statistics

#### Key Features:
- **Parameter Validation**: Input validation before API calls
- **Error Handling**: Consistent error handling across all functions
- **Search Functionality**: Advanced search with multiple filters
- **Statistics**: Get aggregated student data

### 3. DjangoAuthContext (`src/contexts/DjangoAuthContext.jsx`)

React context integration for global state management:

#### Context Methods Added:
- `students.getStudents(params)` - Get students
- `students.getStudentById(studentId)` - Get student by ID
- `students.createStudent(studentData)` - Create student
- `students.updateStudent(studentId, studentData)` - Update student
- `students.deleteStudent(studentId)` - Delete student
- `students.bulkCreateStudents(studentsData)` - Bulk create
- `students.searchStudents(searchParams)` - Search students
- `students.getStudentsStats()` - Get statistics

#### Key Features:
- **Global Access**: Available throughout the React component tree
- **Error Handling**: Centralized error handling
- **State Management**: Integration with authentication state

### 4. StudentsApiTest Component (`src/components/StudentsApiTest.jsx`)

A comprehensive test component demonstrating all CRUD operations:

#### Features:
- **Full CRUD Interface**: Create, Read, Update, Delete operations
- **Search and Filtering**: Advanced search with multiple filters
- **Statistics Display**: Real-time statistics dashboard
- **Form Validation**: Client-side validation
- **Error Handling**: User-friendly error messages
- **Loading States**: Loading indicators for better UX
- **Responsive Design**: Mobile-friendly interface

#### Usage:
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

## Usage Examples

### 1. Using Helper Functions

```javascript
import { getStudents, createStudent, updateStudent, deleteStudent } from '../utils/djangoAuthHelpers';

// Get all students
const students = await getStudents();

// Get students with filters
const filteredStudents = await getStudents({
  department: 'Computer Science',
  year: '2024',
  status: 'active'
});

// Create a new student
const newStudent = await createStudent({
  name: 'John Doe',
  email: 'john.doe@example.com',
  rollNo: 'CS2024001',
  department: 'Computer Science',
  year: '2024',
  section: 'A'
});

// Update a student
const updatedStudent = await updateStudent(1, {
  name: 'John Doe Updated',
  phone: '+1234567890'
});

// Delete a student
const result = await deleteStudent(1);
```

### 2. Using React Context

```javascript
import { useDjangoAuth } from '../contexts/DjangoAuthContext';

function StudentComponent() {
  const { students } = useDjangoAuth();

  const handleCreateStudent = async (studentData) => {
    const result = await students.createStudent(studentData);
    if (result.success) {
      console.log('Student created:', result.data);
    } else {
      console.error('Error:', result.error);
    }
  };

  const handleGetStudents = async () => {
    const result = await students.getStudents();
    if (result.success) {
      console.log('Students:', result.data);
    }
  };

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}
```

### 3. Advanced Search

```javascript
import { searchStudents } from '../utils/djangoAuthHelpers';

const searchParams = {
  search: 'john',
  department: 'Computer Science',
  year: '2024',
  section: 'A',
  status: 'active',
  page: 1,
  pageSize: 20,
  sortBy: 'name',
  sortOrder: 'asc'
};

const result = await searchStudents(searchParams);
```

## Error Handling

All API methods return a consistent response format:

```javascript
{
  success: boolean,
  data?: any,           // Present on success
  error?: string,       // Present on error
  status?: number,      // HTTP status code
  details?: any         // Additional error details
}
```

### Common Error Scenarios:

1. **Authentication Errors** (401):
   - Token expired or invalid
   - Automatic token refresh attempted
   - User redirected to login if refresh fails

2. **Validation Errors** (400):
   - Invalid input data
   - Missing required fields
   - Data format errors

3. **Not Found Errors** (404):
   - Student ID not found
   - Invalid endpoint

4. **Server Errors** (500):
   - Internal server errors
   - Database connection issues

## Security Features

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Role-based access control
3. **Input Validation**: Server-side validation of all inputs
4. **Data Sanitization**: Automatic cleaning of input data
5. **Rate Limiting**: Protection against abuse
6. **CORS**: Proper cross-origin resource sharing configuration

## Performance Considerations

1. **Pagination**: Large datasets are paginated
2. **Filtering**: Server-side filtering reduces data transfer
3. **Caching**: Response caching where appropriate
4. **Optimistic Updates**: UI updates before server confirmation
5. **Loading States**: User feedback during operations

## Testing

The `StudentsApiTest` component provides a comprehensive testing interface:

1. **Manual Testing**: Test all CRUD operations
2. **Error Scenarios**: Test error handling
3. **Search Functionality**: Test filtering and search
4. **Bulk Operations**: Test bulk create functionality
5. **Statistics**: Verify statistics accuracy

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live updates
2. **File Upload**: Support for student photo uploads
3. **Advanced Filtering**: More complex filter combinations
4. **Export Functionality**: Export student data to various formats
5. **Audit Trail**: Track all student data changes
6. **Bulk Operations**: Bulk update and delete operations

## Dependencies

- React 18+
- FontAwesome Icons
- Tailwind CSS (for styling)
- Django REST Framework (backend)

## Configuration

The API endpoints are automatically configured based on the environment:

- **Development**: Uses localhost Django server
- **Production**: Uses deployed Django server

Configuration is handled in `src/config/apiConfig.js`.

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure Django CORS settings allow the frontend domain
2. **Authentication Errors**: Check token validity and refresh mechanism
3. **Network Errors**: Verify Django server is running and accessible
4. **Validation Errors**: Check input data format and required fields

### Debug Mode:

Enable debug logging by setting `console.log` statements in the service methods. All API calls are logged with request/response details.

## Conclusion

The Students CRUD API implementation provides a robust, scalable solution for managing student data in the CampusHub Admin application. The implementation follows best practices for error handling, security, and user experience while maintaining consistency with the existing codebase architecture.
