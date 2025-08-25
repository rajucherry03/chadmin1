# Bulk Import Guide - CampusHub360

## Overview
The Bulk Import feature allows administrators to import multiple students simultaneously from Excel (.xlsx, .xls) or CSV files. This guide provides detailed instructions on how to use this feature effectively.

## Features

### ✅ Enhanced Validation
- **Real-time validation** of all data fields
- **Duplicate detection** for admission numbers and emails
- **Format validation** for emails, phone numbers, pincodes, and dates
- **Required field validation** with clear error messages
- **Data type validation** for numbers, dates, and select options

### ✅ Smart Field Mapping
- **Auto-mapping** of Excel columns to form fields
- **Manual mapping** option for custom column names
- **Preview functionality** to verify data before import
- **Template download** with proper field structure

### ✅ Robust Error Handling
- **Detailed error reporting** with row numbers and field names
- **Batch processing** to handle large datasets efficiently
- **Progress tracking** with real-time updates
- **Error recovery** with partial import support

## Supported File Formats

| Format | Extension | Max Size | Max Rows |
|--------|-----------|----------|----------|
| Excel 2007+ | .xlsx | 10MB | 1000 |
| Excel 97-2003 | .xls | 10MB | 1000 |
| CSV | .csv | 10MB | 1000 |

## Required Fields

The following fields are **mandatory** for successful import:

| Field Name | Type | Validation |
|------------|------|------------|
| Admission Number | Text | Unique, required |
| Full Name | Text | Required |
| Gender | Select | Must be: Male, Female, Other |
| Date of Birth | Date | Valid date, not future |
| Email | Email | Valid format, unique |
| Mobile Number | Phone | 10-digit Indian mobile |
| Program | Select | From predefined list |
| Department | Select | From predefined list |
| Year | Select | I, II, III, IV |
| Section | Select | A, B, C |
| Father's Name | Text | Required |
| Father's Mobile | Phone | 10-digit Indian mobile |
| Mother's Name | Text | Required |
| Address | Text | Required |
| State | Text | Required |
| District | Text | Required |
| Pincode | Text | 6-digit valid pincode |
| Fee Structure | Select | Regular, Scholarship, Merit, Management |
| Total Fee | Number | Positive number |

## Optional Fields

| Field Name | Type | Validation |
|------------|------|------------|
| Payment Status | Select | Pending, Partial, Paid |

## Step-by-Step Import Process

### Step 1: Prepare Your Data

1. **Download the template** using the "Download Template" button
2. **Fill in your data** following the template structure
3. **Ensure all required fields** are populated
4. **Validate your data** manually before upload

### Step 2: Upload File

1. **Click "Choose File"** or drag and drop your file
2. **Supported formats**: .xlsx, .xls, .csv
3. **File size limit**: 10MB maximum
4. **Row limit**: 1000 rows maximum

### Step 3: Map Columns

1. **Review auto-mapping** - the system automatically maps common column names
2. **Manual mapping** - select the correct column for each field if needed
3. **Preview data** - verify the first 5 rows are correct
4. **Check validation** - review any validation errors

### Step 4: Validate and Import

1. **Review validation errors** - fix any issues before proceeding
2. **Start import** - click "Start Import" when ready
3. **Monitor progress** - watch the progress bar
4. **Review results** - check success/failure counts

## Validation Rules

### Email Validation
- Must be a valid email format (user@domain.com)
- Must be unique across all students
- Case-insensitive comparison

### Phone Number Validation
- Must be exactly 10 digits
- Must start with 6, 7, 8, or 9 (Indian mobile format)
- Spaces and special characters are automatically removed

### Pincode Validation
- Must be exactly 6 digits
- Must start with a non-zero digit
- Must be a valid Indian pincode format

### Date Validation
- Must be a valid date format
- Cannot be a future date
- Supports multiple date formats (YYYY-MM-DD, DD/MM/YYYY, etc.)

### Select Field Validation
- Must match one of the predefined options exactly
- Case-sensitive matching
- No partial matches allowed

### Number Validation
- Must be a valid positive number
- Decimal values are supported
- Negative values are not allowed

## Error Handling

### Common Validation Errors

| Error Type | Description | Solution |
|------------|-------------|----------|
| Required Field Missing | A required field is empty | Fill in the missing data |
| Invalid Email Format | Email doesn't match required format | Check email format (user@domain.com) |
| Duplicate Email | Email already exists in system | Use a unique email address |
| Invalid Phone Number | Phone number doesn't match format | Ensure 10-digit number starting with 6-9 |
| Invalid Date | Date is invalid or in future | Use valid past date |
| Invalid Select Option | Value not in predefined list | Use exact option from dropdown |
| Duplicate Admission Number | Admission number already exists | Use unique admission number |

### Import Errors

| Error Type | Description | Solution |
|------------|-------------|----------|
| File Too Large | File exceeds 10MB limit | Reduce file size or split into smaller files |
| Too Many Rows | File has more than 1000 rows | Split file into smaller chunks |
| Invalid File Format | File format not supported | Convert to .xlsx, .xls, or .csv |
| Network Error | Connection issues during import | Check internet connection and retry |
| Database Error | Firebase connection issues | Contact administrator |

## Best Practices

### Data Preparation
1. **Use the template** provided by the system
2. **Clean your data** before import (remove extra spaces, fix formatting)
3. **Validate dates** are in correct format
4. **Check for duplicates** in your source data
5. **Ensure unique admission numbers** and emails

### File Management
1. **Backup your data** before import
2. **Test with small files** first
3. **Keep original files** for reference
4. **Use descriptive filenames** with date stamps

### Import Process
1. **Review validation errors** carefully
2. **Fix errors before importing** to avoid partial imports
3. **Monitor progress** during large imports
4. **Verify results** after import completion

## Troubleshooting

### Import Fails
1. **Check file format** - ensure it's .xlsx, .xls, or .csv
2. **Verify file size** - must be under 10MB
3. **Check row count** - must be under 1000 rows
4. **Review validation errors** - fix all errors before retry

### Data Not Imported
1. **Check validation errors** - all errors must be resolved
2. **Verify field mapping** - ensure columns are correctly mapped
3. **Check required fields** - all mandatory fields must be populated
4. **Review duplicate data** - ensure admission numbers and emails are unique

### Performance Issues
1. **Reduce file size** - split large files into smaller chunks
2. **Check internet connection** - ensure stable connection
3. **Close other applications** - free up system resources
4. **Try during off-peak hours** - avoid high-traffic periods

## Support

If you encounter issues with the bulk import feature:

1. **Check this guide** for common solutions
2. **Review validation errors** carefully
3. **Contact system administrator** for technical support
4. **Provide error details** including file format and error messages

## Sample Data Format

```csv
Admission Number,Full Name,Gender,Date of Birth,Email,Mobile Number,Program,Department,Year,Section,Father's Name,Father's Mobile,Mother's Name,Address,State,District,Pincode,Fee Structure,Total Fee,Payment Status
2024001,John Doe,Male,2000-05-15,john.doe@email.com,9876543210,B.Tech,Computer Science & Engineering,I,A,Robert Doe,9876543211,Jane Doe,"123 Main Street, City Center",Maharashtra,Mumbai,400001,Regular,150000,Pending
```

## Version History

- **v2.0.0** - Enhanced validation, better error handling, improved UI
- **v1.0.0** - Initial release with basic import functionality

---

**Note**: This feature is designed for administrators only. Please ensure you have proper authorization before performing bulk imports.
