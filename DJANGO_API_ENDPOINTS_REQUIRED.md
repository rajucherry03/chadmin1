# Required Django API Endpoints for Student Management

## Overview
All Firebase connectivity has been removed from the student management components. The system now uses **only Django APIs**. You need to implement these endpoints on your Django backend.

## Base URL Structure
All endpoints should be prefixed with: `/api/v1/students/`

## Required Endpoints

### 1. Student CRUD Operations

#### GET /api/v1/students/students/
- **Purpose**: Get all students with optional filtering
- **Query Parameters**: 
  - `department` (optional): Filter by department
  - `year` (optional): Filter by year
  - `section` (optional): Filter by section
  - `page` (optional): Page number for pagination
  - `page_size` (optional): Number of items per page
- **Response Format**:
```json
{
  "results": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "roll_number": "CS001",
      "department": "CSE",
      "year": "1",
      "section": "A",
      "phone": "1234567890",
      "address": "123 Main St",
      "date_of_birth": "2000-01-01",
      "gender": "Male",
      "status": "active",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "count": 100,
  "next": "http://api/v1/students/students/?page=2",
  "previous": null
}
```

#### POST /api/v1/students/students/
- **Purpose**: Create a new student
- **Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "roll_number": "CS001",
  "department": "CSE",
  "year": "1",
  "section": "A",
  "phone": "1234567890",
  "address": "123 Main St",
  "date_of_birth": "2000-01-01",
  "gender": "Male",
  "status": "active"
}
```

#### GET /api/v1/students/students/{id}/
- **Purpose**: Get a specific student by ID
- **Response**: Single student object (same format as above)

#### PUT /api/v1/students/students/{id}/
- **Purpose**: Update a specific student
- **Request Body**: Same as POST (partial updates allowed)

#### DELETE /api/v1/students/students/{id}/
- **Purpose**: Delete a specific student
- **Response**: `{"success": true}` or error message

### 2. Student Statistics

#### GET /api/v1/students/students/stats/
- **Purpose**: Get student statistics for dashboard
- **Response Format**:
```json
{
  "total_students": 100,
  "active_students": 95,
  "new_admissions": 10,
  "pending_documents": 5,
  "total_enrollments": 100,
  "recent_imports": 2,
  "by_department": {
    "CSE": 30,
    "IT": 25,
    "ECE": 20,
    "MECH": 15,
    "CIVIL": 10
  },
  "by_year": {
    "1": 25,
    "2": 25,
    "3": 25,
    "4": 25
  },
  "by_status": {
    "active": 95,
    "inactive": 3,
    "graduated": 2
  }
}
```

### 3. Student Search

#### GET /api/v1/students/students/search/
- **Purpose**: Search students by various criteria
- **Query Parameters**:
  - `q` (required): Search query
  - `department` (optional): Filter by department
  - `year` (optional): Filter by year
  - `section` (optional): Filter by section
- **Response**: Same format as GET /students/

### 4. Bulk Operations

#### POST /api/v1/students/students/bulk-create/
- **Purpose**: Create multiple students at once
- **Request Body**:
```json
{
  "students": [
    {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "roll_number": "CS001",
      "department": "CSE",
      "year": "1",
      "section": "A",
      "status": "active"
    }
  ]
}
```

#### POST /api/v1/students/students/bulk-update/
- **Purpose**: Update multiple students at once
- **Request Body**:
```json
{
  "students": [
    {
      "id": 1,
      "first_name": "John Updated",
      "status": "active"
    }
  ]
}
```

#### DELETE /api/v1/students/students/bulk-delete/
- **Purpose**: Delete multiple students at once
- **Request Body**:
```json
{
  "student_ids": [1, 2, 3]
}
```

### 5. Student Documents (Optional)

#### GET /api/v1/students/documents/
- **Purpose**: Get all student documents
- **Response Format**:
```json
{
  "results": [
    {
      "id": 1,
      "student_id": 1,
      "title": "Admission Form",
      "document_type": "admission",
      "file_url": "https://example.com/file.pdf",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/v1/students/documents/
- **Purpose**: Create a new document record
- **Request Body**:
```json
{
  "student_id": 1,
  "title": "Admission Form",
  "document_type": "admission",
  "file_url": "https://example.com/file.pdf"
}
```

### 6. Custom Fields (Optional)

#### GET /api/v1/students/custom-fields/
- **Purpose**: Get all custom field definitions
- **Response Format**:
```json
{
  "results": [
    {
      "id": 1,
      "name": "Emergency Contact",
      "field_type": "text",
      "is_required": true,
      "description": "Emergency contact information"
    }
  ]
}
```

#### POST /api/v1/students/custom-fields/
- **Purpose**: Create a new custom field
- **Request Body**:
```json
{
  "name": "Emergency Contact",
  "field_type": "text",
  "is_required": true,
  "description": "Emergency contact information"
}
```

## Authentication
All endpoints should require JWT authentication. The frontend will send the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Error Handling
All endpoints should return consistent error responses:
```json
{
  "error": "Error message",
  "detail": "Detailed error description"
}
```

## Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Implementation Priority

### High Priority (Required for basic functionality):
1. `GET /api/v1/students/students/` - List students
2. `POST /api/v1/students/students/` - Create student
3. `GET /api/v1/students/students/{id}/` - Get student
4. `PUT /api/v1/students/students/{id}/` - Update student
5. `DELETE /api/v1/students/students/{id}/` - Delete student
6. `GET /api/v1/students/students/stats/` - Get statistics

### Medium Priority (Required for full functionality):
7. `GET /api/v1/students/students/search/` - Search students
8. `POST /api/v1/students/students/bulk-create/` - Bulk create
9. `POST /api/v1/students/students/bulk-update/` - Bulk update
10. `DELETE /api/v1/students/students/bulk-delete/` - Bulk delete

### Low Priority (Optional features):
11. Document management endpoints
12. Custom fields endpoints
13. Enrollment history endpoints
14. Import operations endpoints

## Testing
Once you implement these endpoints, you can test them using:
- `/student-data-test` - Test basic student data fetching
- `/api-test` - Test all API endpoints
- `/student-management-dashboard` - Full dashboard functionality

## Notes
- The frontend expects snake_case field names (e.g., `first_name`, `roll_number`)
- All date fields should be in ISO 8601 format
- Pagination is optional but recommended for large datasets
- The system will work with just the high-priority endpoints
