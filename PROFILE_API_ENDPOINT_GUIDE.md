# User Profile API Endpoint Implementation Guide

This document explains the implementation of the `/api/accounts/me/` endpoint for user profile management in the CampusHub Admin application.

## Overview

The `/api/accounts/me/` endpoint provides a RESTful interface for users to view and update their own profile information. This endpoint supports both GET and PATCH operations and is integrated with the existing Django authentication system.

## Implementation Details

### 1. DjangoAuthService Updates

**File:** `src/utils/djangoAuthService.js`

#### New Methods Added:

- **`getMyProfile()`** - Fetches current user profile using GET `/api/accounts/me/`
- **`updateMyProfile(profileData)`** - Updates current user profile using PATCH `/api/accounts/me/`

#### Key Features:

- **Automatic Token Refresh**: Both methods use the existing `makeRequest()` method which handles token refresh automatically
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Data Validation**: Input validation for profile updates
- **Response Standardization**: Consistent response format with success/error indicators

### 2. DjangoAuthHelpers Updates

**File:** `src/utils/djangoAuthHelpers.js`

#### New Helper Functions:

- **`getMyProfile()`** - Wrapper for the service method with error handling
- **`updateMyProfile(profileData)`** - Wrapper for the service method with error handling

#### Endpoint Configuration:

```javascript
export const DJANGO_ENDPOINTS = {
  // ... existing endpoints
  ME: '/accounts/me/',
  // ... other endpoints
};
```

### 3. DjangoAuthContext Updates

**File:** `src/contexts/DjangoAuthContext.jsx`

#### New Context Methods:

- **`fetchMyProfile()`** - Fetches user profile and returns the data
- **`updateProfile(profileData)`** - Updates user profile and refreshes local state

#### Integration:

- Profile updates automatically refresh the local user state
- Error handling integrated with the context system
- Loading states managed through the context

### 4. User Interface Components

#### UserProfile Component

**File:** `src/components/UserProfile.jsx`

A comprehensive profile management component featuring:

- **View Mode**: Display current profile information
- **Edit Mode**: Form-based profile editing
- **Real-time Updates**: Immediate UI updates after successful changes
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Mobile-friendly layout

#### ProfileApiTest Component

**File:** `src/components/ProfileApiTest.jsx`

A testing component for developers featuring:

- **API Testing**: Direct testing of GET and PATCH endpoints
- **Response Inspection**: Detailed view of API responses
- **Error Debugging**: Clear error messages and debugging information
- **Test Data Management**: Customizable test data for PATCH operations

## API Endpoint Specifications

### GET /api/accounts/me/

**Purpose:** Retrieve current user's profile information

**Authentication:** Required (Bearer token)

**Response Format:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "bio": "User bio text",
  "department": "Computer Science",
  "position": "Student",
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "date_joined": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-15T10:30:00Z"
}
```

### PATCH /api/accounts/me/

**Purpose:** Update current user's profile information

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "bio": "Updated bio text",
  "department": "Computer Science",
  "position": "Student"
}
```

**Response Format:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "bio": "Updated bio text",
  "department": "Computer Science",
  "position": "Student",
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "date_joined": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-15T10:30:00Z"
}
```

## Usage Examples

### 1. Fetching User Profile

```javascript
import { useDjangoAuth } from '../contexts/DjangoAuthContext';

const MyComponent = () => {
  const { fetchMyProfile } = useDjangoAuth();
  
  const loadProfile = async () => {
    const profile = await fetchMyProfile();
    if (profile) {
      console.log('Profile loaded:', profile);
    }
  };
  
  // ... rest of component
};
```

### 2. Updating User Profile

```javascript
import { useDjangoAuth } from '../contexts/DjangoAuthContext';

const MyComponent = () => {
  const { updateProfile } = useDjangoAuth();
  
  const handleUpdate = async () => {
    const result = await updateProfile({
      first_name: 'John',
      last_name: 'Doe',
      bio: 'Updated bio'
    });
    
    if (result.success) {
      console.log('Profile updated:', result.data);
    } else {
      console.error('Update failed:', result.error);
    }
  };
  
  // ... rest of component
};
```

### 3. Direct API Usage

```javascript
import { getMyProfile, updateMyProfile } from '../utils/djangoAuthHelpers';

// Fetch profile
const profileResult = await getMyProfile();
if (profileResult.success) {
  console.log('Profile:', profileResult.data);
}

// Update profile
const updateResult = await updateMyProfile({
  first_name: 'Jane',
  bio: 'New bio'
});
if (updateResult.success) {
  console.log('Updated:', updateResult.data);
}
```

## Error Handling

### Common Error Scenarios

1. **Authentication Errors (401)**
   - Token expired or invalid
   - Automatic token refresh attempted
   - User redirected to login if refresh fails

2. **Validation Errors (400)**
   - Invalid data format
   - Required fields missing
   - Data validation failures

3. **Permission Errors (403)**
   - User not authorized to access endpoint
   - Insufficient permissions

4. **Server Errors (500)**
   - Backend server issues
   - Database connection problems

### Error Response Format

```json
{
  "success": false,
  "error": "Error message description",
  "status": 400,
  "details": {
    "field_name": ["Specific field error message"]
  }
}
```

## Security Considerations

1. **Authentication Required**: All endpoints require valid authentication tokens
2. **User Isolation**: Users can only access their own profile data
3. **Input Validation**: All input data is validated before processing
4. **Token Refresh**: Automatic token refresh prevents session expiration
5. **HTTPS Only**: All API calls should use HTTPS in production

## Testing

### Manual Testing

Use the `ProfileApiTest` component to test the endpoints:

1. Navigate to the test component
2. Run individual GET/PATCH tests
3. Run combined tests
4. Inspect response data and error messages

### Automated Testing

```javascript
// Example test case
describe('Profile API', () => {
  test('should fetch user profile', async () => {
    const result = await getMyProfile();
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('email');
  });
  
  test('should update user profile', async () => {
    const result = await updateMyProfile({
      first_name: 'Test'
    });
    expect(result.success).toBe(true);
    expect(result.data.first_name).toBe('Test');
  });
});
```

## Integration with Existing System

### Backward Compatibility

- Existing `/accounts/profile/` endpoint remains functional
- New `/accounts/me/` endpoint provides enhanced functionality
- Both endpoints can be used simultaneously

### Context Integration

- Profile updates automatically refresh user context
- Loading states managed through existing context system
- Error handling integrated with global error management

## Future Enhancements

1. **Profile Picture Upload**: Add support for profile image uploads
2. **Advanced Validation**: Implement more sophisticated data validation
3. **Audit Logging**: Track profile changes for security purposes
4. **Bulk Updates**: Support for updating multiple fields efficiently
5. **Profile Templates**: Predefined profile templates for different user types

## Troubleshooting

### Common Issues

1. **Profile Not Loading**
   - Check authentication status
   - Verify API endpoint accessibility
   - Check browser console for errors

2. **Update Failures**
   - Validate input data format
   - Check for required fields
   - Verify user permissions

3. **Token Issues**
   - Ensure valid authentication
   - Check token expiration
   - Verify refresh token availability

### Debug Information

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'django-auth');
```

This will provide detailed logging of all API requests and responses.

## Conclusion

The `/api/accounts/me/` endpoint implementation provides a robust, secure, and user-friendly way to manage user profiles in the CampusHub Admin application. The implementation follows best practices for API design, error handling, and user experience while maintaining compatibility with the existing authentication system.
