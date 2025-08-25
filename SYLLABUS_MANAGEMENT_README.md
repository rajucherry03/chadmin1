# Syllabus & Courses Management System

A comprehensive academic program and curriculum management system for educational institutions, built with React and Firebase.

## 🎯 Overview

This system provides a complete solution for managing academic programs, courses, syllabi, and curriculum workflows. It includes features for program management, course catalog management, syllabus creation and versioning, CLO-PO mapping, approval workflows, and analytics.

## 🏗️ System Architecture

### Core Entities

#### 1. Program Management
- **Program**: Academic programs (UG/PG/PhD/Diploma)
- **Semester**: Academic semesters within programs
- **Course**: Individual courses with detailed information
- **Syllabus**: Course syllabi with version control

#### 2. Syllabus Components
- **Syllabus Sections**: Objectives, topics, assessment, pedagogy, resources, outcomes
- **Topics**: Detailed course topics with time allocation
- **CLOs**: Course Learning Outcomes with Bloom's taxonomy levels
- **Assessments**: Assessment methods and rubrics
- **POs/PSOs**: Program Outcomes and Program Specific Outcomes

#### 3. Workflow & Approvals
- **Approval Workflow**: Multi-stage approval process
- **Evidence Management**: Documentation for accreditation
- **Audit Trail**: Complete change history and tracking

## 📁 File Structure

```
src/components/SyllabusManagement/
├── SyllabusManagement.jsx          # Main dashboard component
├── ProgramManagement.jsx           # Program CRUD operations
├── CourseManagement.jsx            # Course catalog management
├── SyllabusEditor.jsx              # WYSIWYG syllabus editor
├── CLOPOMapping.jsx                # CLO-PO mapping matrix
├── ApprovalWorkflow.jsx            # Approval workflow management
├── AssessmentBlueprinting.jsx      # Assessment planning
├── ElectiveManagement.jsx          # Elective course management
├── CurriculumAnalytics.jsx         # Analytics and reports
└── ImportExport.jsx                # Bulk import/export utilities
```

## 🚀 Features

### 1. Program Management
- ✅ Create and manage academic programs
- ✅ Define program structure and duration
- ✅ Set intake codes and effective dates
- ✅ Program status management (active/inactive/discontinued)

### 2. Course Catalog Management
- ✅ Comprehensive course information management
- ✅ Course codes, titles, descriptions, and credits
- ✅ L:T:P ratio tracking
- ✅ Prerequisites and co-requisites
- ✅ Course level classification (core/elective/soft)
- ✅ Learning outcomes and assessment methods

### 3. Syllabus Management
- ✅ WYSIWYG syllabus editor with rich text formatting
- ✅ Section-based syllabus structure
- ✅ Topic management with time allocation
- ✅ Learning resources and references
- ✅ Assessment methods and rubrics

### 4. CLO-PO Mapping
- ✅ Visual mapping matrix
- ✅ Weight-based mapping (0.0 to 1.0)
- ✅ Bloom's taxonomy integration
- ✅ Export functionality for accreditation
- ✅ Coverage analysis and gap identification

### 5. Approval Workflow
- ✅ Multi-stage approval process
- ✅ Role-based access control
- ✅ Comments and feedback system
- ✅ Email/SMS/WhatsApp notifications
- ✅ Approval history and audit trail

### 6. Version Control
- ✅ Complete version history
- ✅ Compare and diff functionality
- ✅ Rollback capabilities
- ✅ Effective date management
- ✅ Change tracking and documentation

### 7. Assessment Blueprinting
- ✅ Assessment type definition
- ✅ Weight distribution
- ✅ CLO coverage mapping
- ✅ Rubric management
- ✅ Gap analysis

### 8. Analytics & Reporting
- ✅ Program analytics
- ✅ Course coverage analysis
- ✅ CLO-PO attainment tracking
- ✅ Approval workflow statistics
- ✅ Export capabilities (PDF, CSV, JSON)

## 🛠️ Technical Implementation

### Frontend Technologies
- **React 18**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Comprehensive icon library
- **Firebase**: Backend as a Service

### Firebase Collections

#### Programs
```javascript
{
  id: "string",
  name: "string",
  degree_type: "UG|PG|PhD|Diploma",
  duration_years: "number",
  intake_code: "string",
  effective_from: "date",
  effective_to: "date",
  description: "string",
  total_credits: "number",
  max_students: "number",
  department: "string",
  coordinator: "string",
  status: "active|inactive|discontinued",
  created_at: "timestamp",
  updated_at: "timestamp",
  created_by: "string"
}
```

#### Courses
```javascript
{
  id: "string",
  code: "string",
  title: "string",
  short_desc: "string",
  long_desc: "string",
  credits: "number",
  ltp: "string", // "3:1:2"
  level: "core|elective|soft",
  status: "active|inactive|retired",
  program_id: "string",
  semester_id: "string",
  prerequisites: "string",
  co_requisites: "string",
  learning_outcomes: "string",
  assessment_methods: "string",
  textbooks: "string",
  references: "string",
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

#### Syllabi
```javascript
{
  id: "string",
  course_id: "string",
  version_no: "number",
  status: "draft|under_review|approved|published",
  sections: [
    {
      id: "number",
      type: "objectives|topics|assessment|pedagogy|resources|outcomes",
      content: "string",
      order: "number"
    }
  ],
  topics: [
    {
      id: "number",
      title: "string",
      hours_estimated: "number",
      subtopics: ["string"],
      resources: ["string"]
    }
  ],
  clos: [
    {
      id: "number",
      clo_code: "string",
      description: "string",
      bloom_level: "remember|understand|apply|analyze|evaluate|create"
    }
  ],
  assessments: [
    {
      id: "number",
      name: "string",
      type: "quiz|mid|end|lab|project|assignment",
      weightage: "number",
      rubrics: "string"
    }
  ],
  effective_from: "date",
  created_by: "string",
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

#### CLO-PO Mappings
```javascript
{
  id: "string",
  clo_id: "string",
  po_id: "string",
  weight: "number", // 0.0 to 1.0
  course_id: "string",
  created_at: "timestamp"
}
```

#### Approvals
```javascript
{
  id: "string",
  syllabus_id: "string",
  step: "draft|dept_review|committee_review|academic_council|published",
  approver_id: "string",
  status: "pending|approved|rejected",
  comments: "string",
  timestamp: "timestamp",
  evidence_docs: ["string"]
}
```

## 🔧 Setup Instructions

### 1. Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Set up Firebase configuration
# Add your Firebase config to src/firebase.js
```

### 3. Firebase Setup
1. Create a new Firebase project
2. Enable Firestore Database
3. Set up authentication (if required)
4. Configure security rules
5. Add Firebase config to your project

### 4. Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 5. Run the Application
```bash
npm start
```

## 📊 Usage Guide

### 1. Program Management
1. Navigate to "Programs" tab
2. Click "Add Program" to create new programs
3. Fill in program details (name, degree type, duration, etc.)
4. Set effective dates and status
5. Save the program

### 2. Course Management
1. Go to "Courses" tab
2. Click "Add Course" to create new courses
3. Select program and semester
4. Enter course details (code, title, credits, etc.)
5. Define learning outcomes and assessment methods
6. Save the course

### 3. Syllabus Creation
1. Select a course from the course catalog
2. Click "Create Syllabus" to start syllabus editor
3. Add sections (objectives, topics, assessment, etc.)
4. Define CLOs with Bloom's taxonomy levels
5. Set up assessment methods and rubrics
6. Save as draft or submit for review

### 4. CLO-PO Mapping
1. Open CLO-PO Mapping for a course
2. Use the visual matrix to map CLOs to POs
3. Set appropriate weights (0.0 to 1.0)
4. Review coverage analysis
5. Export mapping for accreditation

### 5. Approval Workflow
1. Submit syllabus for review
2. Track approval status through workflow stages
3. Add comments and feedback
4. Approve or reject with reasons
5. Monitor approval history

## 🔒 Security Considerations

### Firebase Security Rules
```javascript
// Example Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Programs - Read by all, write by admins
    match /programs/{programId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Syllabi - Read by faculty, write by course owner
    match /syllabi/{syllabusId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        resource.data.created_by == request.auth.uid;
    }
    
    // Approvals - Read by approvers, write by authorized users
    match /approvals/{approvalId} {
      allow read, write: if request.auth != null && 
        isApprover(request.auth.uid, resource.data.step);
    }
  }
}
```

### Role-Based Access Control
- **Faculty**: Create and edit syllabi, submit for approval
- **HOD**: Approve department-level reviews
- **Committee**: Approve curriculum committee reviews
- **Academic Council**: Final academic approval
- **Registrar**: Publish approved syllabi
- **Admin**: Full system access

## 📈 Analytics & Reporting

### Key Metrics
- Program enrollment statistics
- Course completion rates
- CLO-PO attainment tracking
- Approval workflow efficiency
- Syllabus version history

### Export Capabilities
- PDF syllabus documents
- CSV data exports
- JSON API responses
- Accreditation reports

## 🔄 Integration Points

### LMS Integration
- Push published syllabi to Moodle/Canvas
- Sync course information
- Update assessment data

### Student Portal
- Display current syllabus versions
- Show CLOs and assessment plans
- Download syllabus documents

### Library System
- Link course readings
- Check resource availability
- Reserve materials

### Assessment System
- Export assessment blueprints
- Sync CLO tags
- Track attainment data

## 🚀 Future Enhancements

### Planned Features
- [ ] AI-powered syllabus suggestions
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Integration with external systems
- [ ] Advanced notification system
- [ ] Document version control
- [ ] Collaborative editing
- [ ] Advanced search and filtering

### Technical Improvements
- [ ] Performance optimization
- [ ] Offline support
- [ ] Advanced caching
- [ ] Real-time collaboration
- [ ] Advanced security features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Academic Standards](https://www.aicte-india.org/)

---

**Note**: This system is designed to be flexible and can be customized for different educational institutions and their specific requirements.
