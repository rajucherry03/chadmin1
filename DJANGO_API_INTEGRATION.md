# Django API Integration Guide

This document explains how the Django API integration has been implemented in the CampusHub Admin application.

## Overview

The application now supports authentication through Django REST API endpoints while maintaining backward compatibility with Firebase authentication. The integration includes:

- Django API authentication service
- Token management and storage
- Authentication context provider
- Updated login component
- Test utilities

## Files Created/Modified

### New Files Created:

1. **`src/utils/djangoAuthService.js`** - Core Django authentication service
2. **`src/utils/djangoAuthHelpers.js`** - Helper functions for Django authentication
3. **`src/contexts/DjangoAuthContext.jsx`** - React context for Django authentication state
4. **`src/components/DjangoApiTest.jsx`** - Test component for Django API integration

### Modified Files:

1. **`src/components/Login.jsx`** - Updated to use Django API endpoints
2. **`src/App.jsx`** - Added Django authentication provider and updated private routes

## Django API Endpoints

The integration uses the following Django API endpoints:

- **Login**: `POST /api/accounts/token/`
- **Token Refresh**: `POST /api/accounts/token/refresh/`
- **Logout**: `POST /api/accounts/logout/`
- **User Profile**: `GET /api/accounts/profile/`

## Authentication Flow

1. **Primary Authentication**: Django API login is attempted first
2. **Fallback Authentication**: If Django login fails, Firebase authentication is used as fallback
3. **Token Management**: Django tokens are stored in localStorage and automatically refreshed
4. **Route Protection**: Both Django and Firebase authentication are checked for protected routes

## Usage

### Basic Login

The login component now automatically tries Django authentication first:

```jsx
import { useDjangoAuth } from '../contexts/DjangoAuthContext';

const { login, isAuthenticated, user } = useDjangoAuth();

// Login with Django API
const result = await login(email, password);
```

### Making Authenticated Requests

```jsx
import { makeDjangoRequest, handleDjangoResponse } from '../utils/djangoAuthHelpers';

// Make authenticated request
const response = await makeDjangoRequest('/api/students/');
const result = await handleDjangoResponse(response);
```

### Checking Authentication Status

```jsx
import { isDjangoAuthenticated, getDjangoToken } from '../utils/djangoAuthHelpers';

if (isDjangoAuthenticated()) {
  const token = getDjangoToken();
  // User is authenticated
}
```

## Configuration

### Django API Base URL

The Django API base URL is configured in `src/utils/djangoAuthService.js`:

```javascript
const DJANGO_BASE_URL = 'https://campushub-backend1.onrender.com/api';
```

### Admin Email List

Admin emails are configured in `src/components/Login.jsx`:

```javascript
const adminEmails = ["admin@gmail.com", "dshod@mits.ac.in"];
```

## Testing

Use the Django API Test component to verify the integration:

1. Navigate to the test component (you can add it to your routes)
2. Click "Test Connection" to verify API connectivity
3. Click "Test Login" to test authentication
4. Click "Test Auth Request" to test authenticated requests

## Error Handling

The integration includes comprehensive error handling:

- Network connectivity issues
- Invalid credentials
- Token expiration and refresh
- API endpoint errors

## Security Features

- Tokens are stored securely in localStorage
- Automatic token refresh on expiration
- Proper logout functionality that clears all tokens
- Admin authorization checks

## Backward Compatibility

The integration maintains full backward compatibility with Firebase authentication:

- Existing Firebase users can still log in
- Firebase authentication is used as fallback
- All existing functionality remains intact

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure your Django backend has proper CORS configuration
2. **Token Expiration**: Tokens are automatically refreshed, but manual refresh may be needed
3. **Network Issues**: Check if the Django API endpoint is accessible

### Debug Mode:

Enable debug logging by checking the browser console for detailed error messages.

## Future Enhancements

Potential improvements for the Django API integration:

1. Role-based access control using Django user permissions
2. Real-time token refresh with WebSocket connections
3. Offline authentication support
4. Multi-factor authentication integration
5. Session management improvements

## API Documentation

For detailed Django API documentation, refer to your Django backend's API documentation or Swagger/OpenAPI documentation if available.

## Support

If you encounter issues with the Django API integration:

1. Check the browser console for error messages
2. Verify Django API endpoint accessibility
3. Test with the Django API Test component
4. Check network connectivity and CORS configuration
