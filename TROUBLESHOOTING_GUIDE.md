# Troubleshooting Guide - Firebase Connectivity & Bulk Import Issues

## 🔧 **Common Issues & Solutions**

### 1. **Internet Connectivity Issues**

#### **Symptoms:**
- `net::ERR_INTERNET_DISCONNECTED` errors
- Firebase services failing to connect
- "Could not reach Cloud Firestore backend" messages

#### **Solutions:**
1. **Check Internet Connection**
   - Verify your internet connection is stable
   - Try accessing other websites to confirm connectivity
   - Restart your router/modem if needed

2. **Firewall/Antivirus Issues**
   - Temporarily disable firewall/antivirus to test
   - Add Firebase domains to whitelist:
     - `*.firebase.googleapis.com`
     - `*.googleapis.com`
     - `*.firebaseapp.com`

3. **Network Configuration**
   - Check if you're behind a corporate firewall
   - Contact your network administrator if needed
   - Try using a different network (mobile hotspot)

### 2. **Firestore Collection Path Errors**

#### **Symptoms:**
- "Invalid collection reference. Collection references must have an odd number of segments"
- Import fails with structure errors

#### **Solutions:**
1. **Fixed Structure**
   - The system now uses proper Firestore structure:
   ```
   students/{department}/years/{year}/sections/{section}/students/{studentId}
   ```

2. **Clear Browser Cache**
   - Clear browser cache and cookies
   - Hard refresh the page (Ctrl+F5)

3. **Check Firestore Rules**
   - Ensure Firestore rules allow the new structure
   - Contact admin if rules need updating

### 3. **Bulk Import Specific Issues**

#### **File Format Issues:**
- **Problem**: Excel file not recognized
- **Solution**: Use `.xlsx`, `.xls`, or `.csv` format only

#### **File Size Issues:**
- **Problem**: File too large
- **Solution**: Keep files under 10MB, split large files

#### **Data Validation Issues:**
- **Problem**: Import fails due to validation errors
- **Solution**: 
  - Check required fields are mapped
  - Verify data formats (emails, phone numbers, dates)
  - Use the provided template

### 4. **Authentication Issues**

#### **Symptoms:**
- "Authentication Error" messages
- Unable to access Firebase services

#### **Solutions:**
1. **Re-login**
   - Log out and log back in
   - Clear browser storage
   - Try incognito/private mode

2. **Check User Permissions**
   - Ensure your account has proper permissions
   - Contact administrator if needed

### 5. **Performance Issues**

#### **Symptoms:**
- Slow import process
- Timeout errors
- Browser becomes unresponsive

#### **Solutions:**
1. **Reduce Batch Size**
   - Import smaller files (max 1000 rows)
   - Split large imports into multiple files

2. **Browser Optimization**
   - Close other tabs/applications
   - Use a modern browser (Chrome, Firefox, Edge)
   - Clear browser cache

3. **Network Optimization**
   - Use a stable, high-speed connection
   - Avoid peak usage times

## 🚀 **Best Practices**

### **For Bulk Import:**
1. **Prepare Your Data**
   - Use the provided template
   - Validate data before import
   - Remove empty rows/columns

2. **Choose Right Time**
   - Import during off-peak hours
   - Ensure stable internet connection
   - Don't interrupt the process

3. **Monitor Progress**
   - Watch the progress bar
   - Don't close browser during import
   - Check error messages carefully

### **For Network Issues:**
1. **Preventive Measures**
   - Use stable internet connection
   - Keep browser updated
   - Clear cache regularly

2. **When Issues Occur**
   - Check network status first
   - Try refreshing the page
   - Contact support if persistent

## 🔍 **Debugging Steps**

### **Step 1: Check Network Status**
```javascript
// Open browser console and run:
navigator.onLine  // Should return true
```

### **Step 2: Test Firebase Connection**
```javascript
// Check if Firebase is accessible
fetch('https://firebase.googleapis.com')
  .then(() => console.log('Firebase accessible'))
  .catch(err => console.log('Firebase not accessible:', err));
```

### **Step 3: Check Browser Console**
- Look for specific error messages
- Check network tab for failed requests
- Identify the exact error type

### **Step 4: Verify File Format**
- Ensure Excel file is not corrupted
- Check file extension is correct
- Validate data structure

## 📞 **Support Contact**

### **When to Contact Support:**
- Persistent connectivity issues
- Data structure errors that persist
- Authentication problems
- Import failures with valid data

### **Information to Provide:**
1. **Error Details**
   - Exact error message
   - Browser console logs
   - Steps to reproduce

2. **Environment Info**
   - Browser type and version
   - Operating system
   - Network environment

3. **File Information**
   - File format and size
   - Number of rows
   - Sample data (anonymized)

## 🛠️ **Technical Details**

### **Firebase Configuration:**
- Project ID: `ch360-erp`
- Database: Firestore
- Authentication: Email/Password

### **Supported File Formats:**
- Excel (.xlsx, .xls)
- CSV (.csv)
- Maximum size: 10MB
- Maximum rows: 1000 per import

### **Data Structure:**
```
students/
├── {department}/
│   ├── years/
│   │   ├── {year}/
│   │   │   ├── sections/
│   │   │   │   ├── {section}/
│   │   │   │   │   ├── students/
│   │   │   │   │   │   ├── {studentId}
```

### **Error Handling:**
- Automatic retry for connectivity issues
- User-friendly error messages
- Offline indicator
- Progress tracking

## ✅ **Quick Fix Checklist**

- [ ] Check internet connection
- [ ] Clear browser cache
- [ ] Verify file format
- [ ] Check file size
- [ ] Validate data structure
- [ ] Ensure proper permissions
- [ ] Try different browser
- [ ] Contact support if needed

---

**Last Updated**: August 26, 2025
**Version**: 2.0
