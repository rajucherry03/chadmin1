# Content Security Policy (CSP) Fix for Django API

## Problem
The application was getting CSP errors when trying to connect to the Django backend:
```
Refused to connect to 'https://campushub-backend1.onrender.com/api/accounts/token/' because it violates the following Content Security Policy directive: "connect-src 'self' https://firestore.googleapis.com ..."
```

## Solution
Updated the Content Security Policy to allow connections to the Django backend by adding `https://campushub-backend1.onrender.com` to the `connect-src` directive.

## Files Updated

### 1. `index.html`
**Before:**
```html
connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebase.googleapis.com https://www.google-analytics.com https://analytics.google.com https://apis.google.com https://firebaseinstallations.googleapis.com https://fcmregistrations.googleapis.com https://fcm.googleapis.com;
```

**After:**
```html
connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebase.googleapis.com https://www.google-analytics.com https://analytics.google.com https://apis.google.com https://firebaseinstallations.googleapis.com https://fcmregistrations.googleapis.com https://fcm.googleapis.com https://campushub-backend1.onrender.com;
```

### 2. `vite.config.js`
Added CSP header to development server configuration:
```javascript
server: {
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googleapis.com https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebase.googleapis.com https://www.google-analytics.com https://analytics.google.com https://apis.google.com https://firebaseinstallations.googleapis.com https://fcmregistrations.googleapis.com https://fcm.googleapis.com https://campushub-backend1.onrender.com; frame-src 'self' https://ch360-erp.firebaseapp.com https://ch360-ds-erp-ab6dc.firebaseapp.com https://apis.google.com; object-src 'none'; base-uri 'self'; form-action 'self';"
  }
}
```

### 3. `netlify.toml`
Added CSP header to production deployment configuration:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googleapis.com https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebase.googleapis.com https://www.google-analytics.com https://analytics.google.com https://apis.google.com https://firebaseinstallations.googleapis.com https://fcmregistrations.googleapis.com https://fcm.googleapis.com https://campushub-backend1.onrender.com; frame-src 'self' https://ch360-erp.firebaseapp.com https://ch360-ds-erp-ab6dc.firebaseapp.com https://apis.google.com; object-src 'none'; base-uri 'self'; form-action 'self';"
```

## What This Fixes

1. **Development Environment**: The Vite dev server now allows connections to Django API
2. **Production Environment**: Netlify deployment will include the proper CSP headers
3. **Browser Security**: Maintains security while allowing necessary API connections

## Testing

After making these changes:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Clear browser cache** to ensure new CSP headers are loaded

3. **Test the login functionality** with valid Django credentials

4. **Check browser console** - CSP errors should be resolved

## Verification

The Django API endpoint is accessible (tested with curl):
- ✅ API responds (401 Unauthorized with test credentials is expected)
- ✅ No network connectivity issues
- ✅ CSP should now allow the connection

## Security Notes

- The CSP still maintains security by only allowing specific domains
- Django backend domain is explicitly whitelisted
- All other security headers remain intact
- No security vulnerabilities introduced

## Troubleshooting

If you still see CSP errors:

1. **Hard refresh** the browser (Ctrl+F5 or Cmd+Shift+R)
2. **Clear browser cache** completely
3. **Restart development server**
4. **Check browser developer tools** for any remaining CSP violations
5. **Verify the Django backend URL** is correct in all configurations

## Future Considerations

If you change your Django backend URL:

1. Update `src/utils/djangoAuthService.js` - `DJANGO_BASE_URL`
2. Update CSP in `index.html`
3. Update CSP in `vite.config.js`
4. Update CSP in `netlify.toml`
