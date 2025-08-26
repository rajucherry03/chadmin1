import { db, storage } from '../../../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
  GeoPoint
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';

// Collections
const COLLECTIONS = {
  INTERNSHIPS: 'internships',
  INTERNSHIP_APPLICATIONS: 'internship_applications',
  COMPANIES: 'companies',
  JOB_POSTINGS: 'job_postings',
  JOB_APPLICATIONS: 'job_applications',
  STUDENT_PROFILES: 'student_profiles',
  RECRUITMENT_ROUNDS: 'recruitment_rounds',
  OFFER_LETTERS: 'offer_letters',
  CERTIFICATES: 'certificates',
  EVALUATIONS: 'evaluations',
  NOTIFICATIONS: 'notifications',
  PLACEMENT_STATS: 'placement_stats'
};

class InternshipPlacementService {
  // ==================== INTERNSHIP MANAGEMENT ====================

  // Create new internship listing
  async createInternship(internshipData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.INTERNSHIPS), {
        ...internshipData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        applicationsCount: 0,
        viewsCount: 0
      });
      
      // Update company's internship count
      if (internshipData.companyId) {
        await updateDoc(doc(db, COLLECTIONS.COMPANIES, internshipData.companyId), {
          internshipCount: increment(1)
        });
      }
      
      return { id: docRef.id, ...internshipData };
    } catch (error) {
      console.error('Error creating internship:', error);
      throw error;
    }
  }

  // Get internships with filters
  async getInternships(filters = {}, pagination = {}) {
    try {
      let q = collection(db, COLLECTIONS.INTERNSHIPS);
      const constraints = [];

      // Apply filters
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.domain) {
        constraints.push(where('domain', '==', filters.domain));
      }
      if (filters.location) {
        constraints.push(where('location', '==', filters.location));
      }
      if (filters.mode) {
        constraints.push(where('mode', '==', filters.mode));
      }
      if (filters.companyId) {
        constraints.push(where('companyId', '==', filters.companyId));
      }
      if (filters.minStipend) {
        constraints.push(where('stipend', '>=', filters.minStipend));
      }
      if (filters.maxStipend) {
        constraints.push(where('stipend', '<=', filters.maxStipend));
      }

      // Apply sorting
      constraints.push(orderBy('createdAt', 'desc'));

      // Apply pagination
      if (pagination.limit) {
        constraints.push(limit(pagination.limit));
      }
      if (pagination.startAfter) {
        constraints.push(startAfter(pagination.startAfter));
      }

      q = query(q, ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching internships:', error);
      throw error;
    }
  }

  // Get internship by ID
  async getInternshipById(internshipId) {
    try {
      const docRef = doc(db, COLLECTIONS.INTERNSHIPS, internshipId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Internship not found');
      }
    } catch (error) {
      console.error('Error fetching internship:', error);
      throw error;
    }
  }

  // Update internship
  async updateInternship(internshipId, updateData) {
    try {
      const docRef = doc(db, COLLECTIONS.INTERNSHIPS, internshipId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      return { id: internshipId, ...updateData };
    } catch (error) {
      console.error('Error updating internship:', error);
      throw error;
    }
  }

  // Delete internship
  async deleteInternship(internshipId) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.INTERNSHIPS, internshipId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting internship:', error);
      throw error;
    }
  }

  // ==================== INTERNSHIP APPLICATIONS ====================

  // Apply for internship
  async applyForInternship(applicationData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.INTERNSHIP_APPLICATIONS), {
        ...applicationData,
        createdAt: serverTimestamp(),
        status: 'pending',
        facultyApproval: 'pending',
        companyResponse: 'pending'
      });

      // Update internship application count
      await updateDoc(doc(db, COLLECTIONS.INTERNSHIPS, applicationData.internshipId), {
        applicationsCount: increment(1)
      });

      return { id: docRef.id, ...applicationData };
    } catch (error) {
      console.error('Error applying for internship:', error);
      throw error;
    }
  }

  // Get applications with filters
  async getApplications(filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.INTERNSHIP_APPLICATIONS);
      const constraints = [];

      if (filters.studentId) {
        constraints.push(where('studentId', '==', filters.studentId));
      }
      if (filters.internshipId) {
        constraints.push(where('internshipId', '==', filters.internshipId));
      }
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.facultyApproval) {
        constraints.push(where('facultyApproval', '==', filters.facultyApproval));
      }

      constraints.push(orderBy('createdAt', 'desc'));
      q = query(q, ...constraints);
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  }

  // Update application status
  async updateApplicationStatus(applicationId, status, approverRole) {
    try {
      const updateData = {
        updatedAt: serverTimestamp()
      };

      if (approverRole === 'faculty') {
        updateData.facultyApproval = status;
        if (status === 'approved') {
          updateData.status = 'faculty_approved';
        } else if (status === 'rejected') {
          updateData.status = 'rejected';
        }
      } else if (approverRole === 'company') {
        updateData.companyResponse = status;
        if (status === 'accepted') {
          updateData.status = 'accepted';
        } else if (status === 'rejected') {
          updateData.status = 'rejected';
        }
      }

      await updateDoc(doc(db, COLLECTIONS.INTERNSHIP_APPLICATIONS, applicationId), updateData);
      return { success: true };
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  // ==================== COMPANY MANAGEMENT ====================

  // Register company
  async registerCompany(companyData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.COMPANIES), {
        ...companyData,
        createdAt: serverTimestamp(),
        status: 'pending_verification',
        internshipCount: 0,
        jobPostingCount: 0,
        placementCount: 0
      });
      
      return { id: docRef.id, ...companyData };
    } catch (error) {
      console.error('Error registering company:', error);
      throw error;
    }
  }

  // Get companies
  async getCompanies(filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.COMPANIES);
      const constraints = [];

      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.industry) {
        constraints.push(where('industry', '==', filters.industry));
      }

      constraints.push(orderBy('createdAt', 'desc'));
      q = query(q, ...constraints);
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  }

  // Update company status
  async updateCompanyStatus(companyId, status) {
    try {
      await updateDoc(doc(db, COLLECTIONS.COMPANIES, companyId), {
        status,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating company status:', error);
      throw error;
    }
  }

  // ==================== JOB POSTINGS ====================

  // Create job posting
  async createJobPosting(jobData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.JOB_POSTINGS), {
        ...jobData,
        createdAt: serverTimestamp(),
        status: 'active',
        applicationsCount: 0,
        viewsCount: 0
      });

      // Update company's job posting count
      if (jobData.companyId) {
        await updateDoc(doc(db, COLLECTIONS.COMPANIES, jobData.companyId), {
          jobPostingCount: increment(1)
        });
      }

      return { id: docRef.id, ...jobData };
    } catch (error) {
      console.error('Error creating job posting:', error);
      throw error;
    }
  }

  // Get job postings
  async getJobPostings(filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.JOB_POSTINGS);
      const constraints = [];

      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.domain) {
        constraints.push(where('domain', '==', filters.domain));
      }
      if (filters.location) {
        constraints.push(where('location', '==', filters.location));
      }
      if (filters.companyId) {
        constraints.push(where('companyId', '==', filters.companyId));
      }
      if (filters.minPackage) {
        constraints.push(where('package', '>=', filters.minPackage));
      }
      if (filters.maxPackage) {
        constraints.push(where('package', '<=', filters.maxPackage));
      }

      constraints.push(orderBy('createdAt', 'desc'));
      q = query(q, ...constraints);
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching job postings:', error);
      throw error;
    }
  }

  // ==================== STUDENT PROFILES ====================

  // Create/Update student profile
  async updateStudentProfile(studentId, profileData) {
    try {
      const docRef = doc(db, COLLECTIONS.STUDENT_PROFILES, studentId);
      await updateDoc(docRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return { id: studentId, ...profileData };
    } catch (error) {
      console.error('Error updating student profile:', error);
      throw error;
    }
  }

  // Get student profile
  async getStudentProfile(studentId) {
    try {
      const docRef = doc(db, COLLECTIONS.STUDENT_PROFILES, studentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      throw error;
    }
  }

  // ==================== RECRUITMENT ROUNDS ====================

  // Create recruitment round
  async createRecruitmentRound(roundData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.RECRUITMENT_ROUNDS), {
        ...roundData,
        createdAt: serverTimestamp(),
        status: 'scheduled',
        participantsCount: 0
      });
      
      return { id: docRef.id, ...roundData };
    } catch (error) {
      console.error('Error creating recruitment round:', error);
      throw error;
    }
  }

  // Get recruitment rounds
  async getRecruitmentRounds(filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.RECRUITMENT_ROUNDS);
      const constraints = [];

      if (filters.jobPostingId) {
        constraints.push(where('jobPostingId', '==', filters.jobPostingId));
      }
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.type) {
        constraints.push(where('type', '==', filters.type));
      }

      constraints.push(orderBy('scheduledDate', 'asc'));
      q = query(q, ...constraints);
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching recruitment rounds:', error);
      throw error;
    }
  }

  // ==================== OFFER LETTERS ====================

  // Create offer letter
  async createOfferLetter(offerData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.OFFER_LETTERS), {
        ...offerData,
        createdAt: serverTimestamp(),
        status: 'pending_acceptance',
        acceptedAt: null,
        rejectedAt: null
      });

      // Update company's placement count
      if (offerData.companyId) {
        await updateDoc(doc(db, COLLECTIONS.COMPANIES, offerData.companyId), {
          placementCount: increment(1)
        });
      }

      return { id: docRef.id, ...offerData };
    } catch (error) {
      console.error('Error creating offer letter:', error);
      throw error;
    }
  }

  // Get offer letters
  async getOfferLetters(filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.OFFER_LETTERS);
      const constraints = [];

      if (filters.studentId) {
        constraints.push(where('studentId', '==', filters.studentId));
      }
      if (filters.companyId) {
        constraints.push(where('companyId', '==', filters.companyId));
      }
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }

      constraints.push(orderBy('createdAt', 'desc'));
      q = query(q, ...constraints);
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching offer letters:', error);
      throw error;
    }
  }

  // Update offer letter status
  async updateOfferLetterStatus(offerId, status) {
    try {
      const updateData = {
        status,
        updatedAt: serverTimestamp()
      };

      if (status === 'accepted') {
        updateData.acceptedAt = serverTimestamp();
      } else if (status === 'rejected') {
        updateData.rejectedAt = serverTimestamp();
      }

      await updateDoc(doc(db, COLLECTIONS.OFFER_LETTERS, offerId), updateData);
      return { success: true };
    } catch (error) {
      console.error('Error updating offer letter status:', error);
      throw error;
    }
  }

  // ==================== CERTIFICATES ====================

  // Upload certificate
  async uploadCertificate(certificateData, file) {
    try {
      // Upload file to storage
      const storageRef = ref(storage, `certificates/${certificateData.studentId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Create certificate record
      const docRef = await addDoc(collection(db, COLLECTIONS.CERTIFICATES), {
        ...certificateData,
        fileURL: downloadURL,
        fileName: file.name,
        createdAt: serverTimestamp()
      });

      return { id: docRef.id, fileURL: downloadURL, ...certificateData };
    } catch (error) {
      console.error('Error uploading certificate:', error);
      throw error;
    }
  }

  // Get certificates
  async getCertificates(filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.CERTIFICATES);
      const constraints = [];

      if (filters.studentId) {
        constraints.push(where('studentId', '==', filters.studentId));
      }
      if (filters.type) {
        constraints.push(where('type', '==', filters.type));
      }

      constraints.push(orderBy('createdAt', 'desc'));
      q = query(q, ...constraints);
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw error;
    }
  }

  // ==================== EVALUATIONS ====================

  // Create evaluation
  async createEvaluation(evaluationData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.EVALUATIONS), {
        ...evaluationData,
        createdAt: serverTimestamp()
      });
      
      return { id: docRef.id, ...evaluationData };
    } catch (error) {
      console.error('Error creating evaluation:', error);
      throw error;
    }
  }

  // Get evaluations
  async getEvaluations(filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.EVALUATIONS);
      const constraints = [];

      if (filters.studentId) {
        constraints.push(where('studentId', '==', filters.studentId));
      }
      if (filters.internshipId) {
        constraints.push(where('internshipId', '==', filters.internshipId));
      }
      if (filters.evaluatorType) {
        constraints.push(where('evaluatorType', '==', filters.evaluatorType));
      }

      constraints.push(orderBy('createdAt', 'desc'));
      q = query(q, ...constraints);
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      throw error;
    }
  }

  // ==================== NOTIFICATIONS ====================

  // Create notification
  async createNotification(notificationData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        ...notificationData,
        createdAt: serverTimestamp(),
        read: false
      });
      
      return { id: docRef.id, ...notificationData };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications
  async getNotifications(userId, filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.NOTIFICATIONS);
      const constraints = [where('userId', '==', userId)];

      if (filters.read !== undefined) {
        constraints.push(where('read', '==', filters.read));
      }
      if (filters.type) {
        constraints.push(where('type', '==', filters.type));
      }

      constraints.push(orderBy('createdAt', 'desc'));
      q = query(q, ...constraints);
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
        read: true,
        readAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // ==================== STATISTICS & ANALYTICS ====================

  // Get placement statistics
  async getPlacementStats(filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.PLACEMENT_STATS);
      const constraints = [];

      if (filters.year) {
        constraints.push(where('year', '==', filters.year));
      }
      if (filters.department) {
        constraints.push(where('department', '==', filters.department));
      }

      q = query(q, ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching placement stats:', error);
      throw error;
    }
  }

  // Update placement statistics
  async updatePlacementStats(statsData) {
    try {
      const docRef = doc(db, COLLECTIONS.PLACEMENT_STATS, statsData.id);
      await updateDoc(docRef, {
        ...statsData,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating placement stats:', error);
      throw error;
    }
  }

  // ==================== REAL-TIME LISTENERS ====================

  // Listen to internships
  listenToInternships(callback, filters = {}) {
    let q = collection(db, COLLECTIONS.INTERNSHIPS);
    const constraints = [];

    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters.companyId) {
      constraints.push(where('companyId', '==', filters.companyId));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    q = query(q, ...constraints);

    return onSnapshot(q, (snapshot) => {
      const internships = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(internships);
    });
  }

  // Listen to applications
  listenToApplications(callback, filters = {}) {
    let q = collection(db, COLLECTIONS.INTERNSHIP_APPLICATIONS);
    const constraints = [];

    if (filters.studentId) {
      constraints.push(where('studentId', '==', filters.studentId));
    }
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    q = query(q, ...constraints);

    return onSnapshot(q, (snapshot) => {
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(applications);
    });
  }

  // Listen to notifications
  listenToNotifications(userId, callback) {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(notifications);
    });
  }

  // ==================== BULK OPERATIONS ====================

  // Bulk update application status
  async bulkUpdateApplicationStatus(applicationIds, status, approverRole) {
    try {
      const batch = writeBatch(db);
      
      applicationIds.forEach(applicationId => {
        const docRef = doc(db, COLLECTIONS.INTERNSHIP_APPLICATIONS, applicationId);
        const updateData = {
          updatedAt: serverTimestamp()
        };

        if (approverRole === 'faculty') {
          updateData.facultyApproval = status;
          if (status === 'approved') {
            updateData.status = 'faculty_approved';
          } else if (status === 'rejected') {
            updateData.status = 'rejected';
          }
        } else if (approverRole === 'company') {
          updateData.companyResponse = status;
          if (status === 'accepted') {
            updateData.status = 'accepted';
          } else if (status === 'rejected') {
            updateData.status = 'rejected';
          }
        }

        batch.update(docRef, updateData);
      });

      await batch.commit();
      return { success: true, updatedCount: applicationIds.length };
    } catch (error) {
      console.error('Error bulk updating application status:', error);
      throw error;
    }
  }

  // ==================== AUTO-MATCHING SYSTEM ====================

  // Auto-match students with internships
  async autoMatchStudents(internshipId) {
    try {
      const internship = await this.getInternshipById(internshipId);
      const students = await this.getStudentsByCriteria({
        department: internship.eligibleDepartments,
        year: internship.eligibleYears,
        minCGPA: internship.minCGPA,
        skills: internship.requiredSkills
      });

      const matches = students.map(student => ({
        studentId: student.id,
        internshipId,
        matchScore: this.calculateMatchScore(student, internship),
        autoMatched: true
      }));

      return matches.filter(match => match.matchScore >= 0.7); // Only return good matches
    } catch (error) {
      console.error('Error auto-matching students:', error);
      throw error;
    }
  }

  // Calculate match score between student and internship
  calculateMatchScore(student, internship) {
    let score = 0;
    let totalWeight = 0;

    // Department match (weight: 0.3)
    if (internship.eligibleDepartments.includes(student.department)) {
      score += 0.3;
    }
    totalWeight += 0.3;

    // Year match (weight: 0.2)
    if (internship.eligibleYears.includes(student.year)) {
      score += 0.2;
    }
    totalWeight += 0.2;

    // CGPA match (weight: 0.2)
    if (student.cgpa >= internship.minCGPA) {
      score += 0.2;
    }
    totalWeight += 0.2;

    // Skills match (weight: 0.3)
    const studentSkills = student.skills || [];
    const requiredSkills = internship.requiredSkills || [];
    const skillMatches = requiredSkills.filter(skill => 
      studentSkills.includes(skill)
    ).length;
    const skillScore = skillMatches / requiredSkills.length;
    score += skillScore * 0.3;
    totalWeight += 0.3;

    return score / totalWeight;
  }

  // ==================== UTILITY METHODS ====================

  // Get students by criteria (placeholder - implement based on your student data structure)
  async getStudentsByCriteria(criteria) {
    // This would need to be implemented based on your student data structure
    // For now, returning empty array
    return [];
  }

  // Generate unique ID
  generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  // Format date
  formatDate(date) {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  }
}

export default new InternshipPlacementService();
