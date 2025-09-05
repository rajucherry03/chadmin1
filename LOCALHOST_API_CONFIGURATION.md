# Localhost API Configuration

This document explains how the Django API has been configured to use localhost for development.

## Changes Made

### 1. **API Configuration** (`src/config/apiConfig.js`)
Created a centralized configuration file that automatically switches between development and production URLs:

```javascript
const API_CONFIG = {
  development: {
    baseURL: 'http://127.0.0.1:8000/api',
    timeout: 10000,
  },
  production: {
    baseURL: 'https://campushub-backend1.onrender.com/api',
    timeout: 15000,
  }
};
```

**Automatic Environment Detection:**
- Development: `localhost` or `127.0.0.1` hostnames
- Production: All other hostnames

### 2. **Updated Files**

#### `src/utils/djangoAuthService.js`
- Now imports `DJANGO_BASE_URL` from configuration
- Automatically uses localhost in development

#### `src/utils/djangoAuthHelpers.js`
- Updated `buildDjangoURL` function to use configuration
- Consistent URL building across the application

#### `src/components/DjangoApiTest.jsx`
- Test component now uses the configured URL
- Shows current API endpoint being used

### 3. **Content Security Policy Updates**

Updated CSP in all configuration files to allow localhost connections:

#### `index.html`
```html
connect-src 'self' ... http://127.0.0.1:8000 http://localhost:8000;
```

#### `vite.config.js`
```javascript
'Content-Security-Policy': "... http://127.0.0.1:8000 http://localhost:8000; ..."
```

#### `netlify.toml`
```toml
Content-Security-Policy = "... http://127.0.0.1:8000 http://localhost:8000; ..."
```

## Current Configuration

### Development Environment
- **API URL**: `http://127.0.0.1:8000/api`
- **Login Endpoint**: `http://127.0.0.1:8000/api/accounts/token/`
- **Profile Endpoint**: `http://127.0.0.1:8000/api/accounts/profile/`

### Production Environment
- **API URL**: `https://campushub-backend1.onrender.com/api`
- **Login Endpoint**: `https://campushub-backend1.onrender.com/api/accounts/token/`
- **Profile Endpoint**: `https://campushub-backend1.onrender.com/api/accounts/profile/`

## Testing

### 1. **API Connectivity Test**
```bash
# Test localhost API (should return 401 with test credentials)
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/accounts/token/" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"test@example.com","password":"testpassword"}'
```

### 2. **Browser Test**
1. Start your Django backend: `python manage.py runserver`
2. Start your React app: `npm run dev`
3. Open browser console to check for CSP errors
4. Test login functionality

## Django Backend Setup

### 1. **CORS Configuration**
Ensure your Django backend has CORS configured for localhost:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:5173",
]

# For development, you can also use:
CORS_ALLOW_ALL_ORIGINS = True  # Only for development!
```

### 2. **API Endpoints**
Ensure these endpoints are available:
- `POST /api/accounts/token/` - Login
- `POST /api/accounts/token/refresh/` - Token refresh
- `GET /api/accounts/profile/` - User profile
- `POST /api/accounts/logout/` - Logout

### 3. **User Model**
Ensure your Django user model has:
- `is_staff` field for staff users
- `is_superuser` field for superusers
- Standard Django user fields

## Switching Environments

### Manual Override
To force a specific environment, modify `src/config/apiConfig.js`:

```javascript
// Force development
export const DJANGO_BASE_URL = 'http://127.0.0.1:8000/api';

// Force production
export const DJANGO_BASE_URL = 'https://campushub-backend1.onrender.com/api';
```

### Environment Variables
You can also use environment variables:

```javascript
const DJANGO_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://127.0.0.1:8000/api';
```

## Troubleshooting

### 1. **CORS Errors**
```
Access to fetch at 'http://127.0.0.1:8000/api/accounts/token/' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution**: Configure CORS in Django backend

### 2. **CSP Errors**
```
Refused to connect to 'http://127.0.0.1:8000/api/accounts/token/' because it violates the following Content Security Policy directive
```
**Solution**: Restart development server after CSP updates

### 3. **Connection Refused**
```
Failed to fetch
```
**Solution**: Ensure Django backend is running on port 8000

### 4. **API Not Found**
```
404 Not Found
```
**Solution**: Check Django URL patterns and ensure API endpoints are properly configured

## Development Workflow

1. **Start Django Backend**:
   ```bash
   cd your-django-project
   python manage.py runserver
   ```

2. **Start React App**:
   ```bash
   npm run dev
   ```

3. **Test Login**:
   - Open `http://localhost:5173`
   - Use valid Django credentials
   - Check browser console for errors

4. **Debug API Calls**:
   - Use Django API Test component
   - Check Network tab in browser dev tools
   - Verify API responses

## Security Notes

- Localhost configuration is only for development
- Production deployment will automatically use production URLs
- CSP headers prevent unauthorized connections
- All API calls are properly authenticated with JWT tokens
