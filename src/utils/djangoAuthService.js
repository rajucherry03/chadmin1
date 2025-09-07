// Django API Authentication Service
import { DJANGO_BASE_URL } from '../config/apiConfig.js';

class DjangoAuthService {
  constructor() {
    this.baseURL = DJANGO_BASE_URL;
    this.token = localStorage.getItem('django_token') || localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('django_refresh_token') || localStorage.getItem('refresh_token');
  }

  // Set authentication tokens
  setTokens(accessToken, refreshToken) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('django_token', accessToken);
    localStorage.setItem('access_token', accessToken); // Store in both formats for compatibility
    if (refreshToken) {
      localStorage.setItem('django_refresh_token', refreshToken);
      localStorage.setItem('refresh_token', refreshToken); // Store in both formats for compatibility
    }
  }

  // Clear authentication tokens
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('django_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('django_refresh_token');
    localStorage.removeItem('refresh_token');
  }

  // Get authorization headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Make authenticated API request
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log('Making request to URL:', url);
    console.log('Request headers:', this.getAuthHeaders());
    let config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      console.log(`Making API request to: ${endpoint}`);
      let response = await fetch(url, config);
      
      // Handle token refresh if needed
      if (response.status === 401 && this.refreshToken) {
        console.log('Received 401, attempting token refresh...');
        const refreshed = await this.refreshAccessToken();
        
        if (refreshed) {
          console.log('Token refreshed successfully, retrying original request...');
          // Retry the original request with new token
          config.headers = this.getAuthHeaders();
          response = await fetch(url, config);
          console.log(`Retry request status: ${response.status}`);
        } else {
          console.warn('Token refresh failed, request will return 401');
        }
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Login with email and password
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/accounts/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      console.log('Raw login response from Django:', data);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        // Store tokens
        this.setTokens(data.access, data.refresh);
        
        console.log('Login response data:', data);
        
        // Extract user data from login response
        let userData = null;
        
        console.log('Available fields in login response:', Object.keys(data));
        
        // Check if user data is directly in the response
        if (data.user) {
          userData = data.user;
          console.log('User data from login response:', userData);
        } else if (data.user_data) {
          userData = data.user_data;
          console.log('User data from user_data field:', userData);
        } else if (data.profile) {
          userData = data.profile;
          console.log('User data from profile field:', userData);
        } else {
          console.log('No user data found in login response fields');
          
          // Check for other possible field names
          const possibleUserFields = ['username', 'email', 'id', 'user_id', 'user_info'];
          for (const field of possibleUserFields) {
            if (data[field]) {
              console.log(`Found potential user field '${field}':`, data[field]);
            }
          }
        }
        
        // If no user data in login response, try alternative endpoints
        if (!userData) {
          console.log('No user data in login response, trying alternative endpoints...');
          
          // Try different possible endpoints
          const possibleEndpoints = [
            '/accounts/profile/',
            '/accounts/user/',
            '/accounts/me/',
            '/user/',
            '/profile/',
            '/accounts/user/profile/'
          ];
          
          for (const endpoint of possibleEndpoints) {
            try {
              console.log(`Trying endpoint: ${endpoint}`);
              const profileResponse = await this.makeRequest(endpoint);
              if (profileResponse.ok) {
                userData = await profileResponse.json();
                console.log(`User data fetched successfully from ${endpoint}:`, userData);
                break; // Exit loop if successful
              } else {
                console.log(`${endpoint} returned ${profileResponse.status}: ${profileResponse.statusText}`);
              }
            } catch (profileError) {
              console.log(`${endpoint} failed:`, profileError.message);
            }
          }
        }
        
        // Fallback: create basic user object with email
        if (!userData) {
          // Check if this is a known admin email
          const knownAdminEmails = ['admin1@gmail.com', 'admin@gmail.com', 'superuser@gmail.com'];
          const isKnownAdmin = knownAdminEmails.includes(email.toLowerCase());
          
          userData = { 
            email: email,
            // Add some default values for debugging
            username: email.split('@')[0], // Extract username from email
            is_superuser: isKnownAdmin, // Set based on known admin emails
            is_staff: isKnownAdmin, // Set based on known admin emails
            is_active: true,
            // Add additional info for known admin
            ...(isKnownAdmin && {
              role: 'admin',
              permissions: ['admin_access']
            })
          };
          console.log('Using fallback user data with email:', userData);
          if (isKnownAdmin) {
            console.log('✅ Known admin email detected, setting admin privileges');
          }
        }

        return {
          success: true,
          user: userData,
          accessToken: data.access,
          refreshToken: data.refresh,
          rawResponse: data, // Include raw response for debugging
        };
      } else {
        return {
          success: false,
          error: data.detail || data.message || 'Login failed',
          status: response.status,
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Refresh access token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      console.warn('No refresh token available for refresh');
      return false;
    }

    try {
      console.log('Attempting to refresh access token...');
      
      const response = await fetch(`${this.baseURL}/accounts/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: this.refreshToken,
        }),
      });

      console.log('Token refresh response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Token refresh successful, updating tokens...');
        
        // Update tokens with new access token
        this.setTokens(data.access, this.refreshToken);
        
        console.log('Tokens updated successfully');
        return true;
      } else {
        console.warn('Token refresh failed with status:', response.status);
        
        // Try to get error details
        try {
          const errorData = await response.json();
          console.warn('Token refresh error details:', errorData);
        } catch (e) {
          console.warn('Could not parse token refresh error response');
        }
        
        // Clear tokens if refresh fails
        this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error('Token refresh network error:', error);
      this.clearTokens();
      return false;
    }
  }

  // Logout
  async logout() {
    let backendLogoutSuccess = false;
    let backendError = null;
    
    try {
      console.log('Starting logout process...');
      
      if (this.token) {
        console.log('Sending logout request to backend...');
        try {
          const response = await this.makeRequest('/accounts/logout/', {
            method: 'POST',
          });
          
          if (response.ok) {
            console.log('Backend logout successful');
            backendLogoutSuccess = true;
            
            // Try to get response data for logging
            try {
              const responseData = await response.json();
              if (responseData && Object.keys(responseData).length > 0) {
                console.log('Logout response data:', responseData);
              }
            } catch (e) {
              // Empty response is expected for logout
              console.log('Logout endpoint returned empty response (expected)');
            }
          } else {
            console.warn(`Backend logout failed with status: ${response.status}`);
            backendError = `HTTP ${response.status}: ${response.statusText}`;
            
            // Try to get error details
            try {
              const errorData = await response.json();
              console.warn('Logout error details:', errorData);
              backendError = errorData.detail || errorData.message || backendError;
            } catch (e) {
              console.warn('Could not parse logout error response');
            }
          }
        } catch (logoutError) {
          console.warn('Backend logout request failed:', logoutError);
          backendError = logoutError.message || 'Network error during logout';
          // Continue with local logout even if backend fails
        }
      } else {
        console.log('No token found, performing local logout only');
      }
    } catch (error) {
      console.error('Logout process error:', error);
      backendError = error.message || 'Unexpected error during logout';
    } finally {
      console.log('Clearing local tokens and session data...');
      this.clearTokens();
      console.log('Logout completed successfully');
    }
    
    // Return result information
    return {
      success: true, // Always return success since we clear local tokens
      backendLogoutSuccess,
      backendError,
      message: backendLogoutSuccess 
        ? 'Logged out successfully from server and local session'
        : backendError 
          ? `Logged out locally (server logout failed: ${backendError})`
          : 'Logged out locally (no server session)'
    };
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await this.makeRequest('/accounts/profile/');
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Current user data:', userData);
        return userData;
      } else {
        console.warn('getCurrentUser failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          console.warn('getCurrentUser error details:', errorData);
        } catch (e) {
          console.warn('Could not parse getCurrentUser error response');
        }
        return null;
      }
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  // Get current user profile using /accounts/me/ endpoint
  async getMyProfile() {
    try {
      console.log('Fetching user profile from /accounts/me/ endpoint...');
      const response = await this.makeRequest('/accounts/me/');
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User profile data from /me/ endpoint:', userData);
        return {
          success: true,
          data: userData
        };
      } else {
        console.warn('getMyProfile failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          console.warn('getMyProfile error details:', errorData);
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to fetch profile',
            status: response.status
          };
        } catch (e) {
          console.warn('Could not parse getMyProfile error response');
          return {
            success: false,
            error: 'Failed to fetch profile',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Get my profile error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Update current user profile using /accounts/me/ endpoint
  async updateMyProfile(profileData) {
    try {
      console.log('Updating user profile via /accounts/me/ endpoint...', profileData);
      
      // Validate profile data
      if (!profileData || typeof profileData !== 'object') {
        return {
          success: false,
          error: 'Invalid profile data provided'
        };
      }

      // Filter out any undefined or null values
      const cleanProfileData = Object.fromEntries(
        Object.entries(profileData).filter(([_, value]) => value !== undefined && value !== null)
      );

      if (Object.keys(cleanProfileData).length === 0) {
        return {
          success: false,
          error: 'No valid profile data to update'
        };
      }

      const response = await this.makeRequest('/accounts/me/', {
        method: 'PATCH',
        body: JSON.stringify(cleanProfileData)
      });
      
      if (response.ok) {
        const updatedData = await response.json();
        console.log('Profile updated successfully:', updatedData);
        return {
          success: true,
          data: updatedData
        };
      } else {
        console.warn('updateMyProfile failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          console.warn('updateMyProfile error details:', errorData);
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to update profile',
            status: response.status,
            details: errorData
          };
        } catch (e) {
          console.warn('Could not parse updateMyProfile error response');
          return {
            success: false,
            error: 'Failed to update profile',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Update my profile error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Check if access token is expired (basic JWT expiration check)
  isTokenExpired() {
    if (!this.token) return true;
    
    try {
      // Decode JWT token (basic decode without verification)
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired (with 5 minute buffer)
      const isExpired = payload.exp < (currentTime + 300);
      
      if (isExpired) {
        console.log('Access token is expired or will expire soon');
      }
      
      return isExpired;
    } catch (error) {
      console.warn('Could not decode token, assuming expired:', error);
      return true;
    }
  }

  // Ensure valid token (refresh if needed)
  async ensureValidToken() {
    if (!this.token) {
      console.log('No access token available');
      return false;
    }

    if (this.isTokenExpired()) {
      console.log('Token is expired, attempting refresh...');
      return await this.refreshAccessToken();
    }

    return true;
  }

  // Get stored token
  getToken() {
    // Always get the most current token from localStorage
    return this.token || localStorage.getItem('django_token') || localStorage.getItem('access_token');
  }

  // Students CRUD Operations

  // Get all students
  async getStudents(params = {}) {
    try {
      console.log('Fetching students from API...', params);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      const endpoint = `/v1/students/students/${queryString ? `?${queryString}` : ''}`;
      console.log('Making request to endpoint:', endpoint);
      console.log('Full URL will be:', `${this.baseURL}${endpoint}`);
      const response = await this.makeRequest(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Students fetched successfully:', data);
        return {
          success: true,
          data: data.results || data,
          count: data.count || (Array.isArray(data) ? data.length : 0),
          next: data.next,
          previous: data.previous
        };
      } else {
        console.warn('getStudents failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          console.warn('getStudents error details:', errorData);
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to fetch students',
            status: response.status
          };
        } catch (e) {
          console.warn('Could not parse getStudents error response');
          return {
            success: false,
            error: 'Failed to fetch students',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Get students error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Get student by ID
  async getStudentById(studentId) {
    try {
      console.log(`Fetching student with ID: ${studentId}`);
      const response = await this.makeRequest(`/v1/students/students/${studentId}/`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Student fetched successfully:', data);
        return {
          success: true,
          data: data
        };
      } else {
        console.warn('getStudentById failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          console.warn('getStudentById error details:', errorData);
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to fetch student',
            status: response.status
          };
        } catch (e) {
          console.warn('Could not parse getStudentById error response');
          return {
            success: false,
            error: 'Failed to fetch student',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Get student by ID error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Create new student
  async createStudent(studentData) {
    try {
      console.log('Creating new student...', studentData);
      
      // Validate student data
      if (!studentData || typeof studentData !== 'object') {
        return {
          success: false,
          error: 'Invalid student data provided'
        };
      }

      // Filter out any undefined or null values
      const cleanStudentData = Object.fromEntries(
        Object.entries(studentData).filter(([_, value]) => value !== undefined && value !== null)
      );

      if (Object.keys(cleanStudentData).length === 0) {
        return {
          success: false,
          error: 'No valid student data to create'
        };
      }

      const response = await this.makeRequest('/v1/students/students/', {
        method: 'POST',
        body: JSON.stringify(cleanStudentData)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Student created successfully:', data);
        return {
          success: true,
          data: data
        };
      } else {
        console.warn('createStudent failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          console.warn('createStudent error details:', errorData);
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to create student',
            status: response.status,
            details: errorData
          };
        } catch (e) {
          console.warn('Could not parse createStudent error response');
          return {
            success: false,
            error: 'Failed to create student',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Create student error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Update student
  async updateStudent(studentId, studentData) {
    try {
      console.log(`Updating student with ID: ${studentId}`, studentData);
      
      // Validate student data
      if (!studentData || typeof studentData !== 'object') {
        return {
          success: false,
          error: 'Invalid student data provided'
        };
      }

      // Filter out any undefined or null values
      const cleanStudentData = Object.fromEntries(
        Object.entries(studentData).filter(([_, value]) => value !== undefined && value !== null)
      );

      if (Object.keys(cleanStudentData).length === 0) {
        return {
          success: false,
          error: 'No valid student data to update'
        };
      }

      const response = await this.makeRequest(`/v1/students/students/${studentId}/`, {
        method: 'PATCH',
        body: JSON.stringify(cleanStudentData)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Student updated successfully:', data);
        return {
          success: true,
          data: data
        };
      } else {
        console.warn('updateStudent failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          console.warn('updateStudent error details:', errorData);
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to update student',
            status: response.status,
            details: errorData
          };
        } catch (e) {
          console.warn('Could not parse updateStudent error response');
          return {
            success: false,
            error: 'Failed to update student',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Update student error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Delete student
  async deleteStudent(studentId) {
    try {
      console.log(`Deleting student with ID: ${studentId}`);
      const response = await this.makeRequest(`/v1/students/students/${studentId}/`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        console.log('Student deleted successfully');
        return {
          success: true,
          message: 'Student deleted successfully'
        };
      } else {
        console.warn('deleteStudent failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          console.warn('deleteStudent error details:', errorData);
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to delete student',
            status: response.status
          };
        } catch (e) {
          console.warn('Could not parse deleteStudent error response');
          return {
            success: false,
            error: 'Failed to delete student',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Delete student error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Bulk create students
  async bulkCreateStudents(studentsData) {
    try {
      console.log('Bulk creating students...', studentsData);
      
      // Validate students data
      if (!Array.isArray(studentsData) || studentsData.length === 0) {
        return {
          success: false,
          error: 'Invalid students data provided. Expected an array of student objects.'
        };
      }

      // Filter out any invalid entries
      const cleanStudentsData = studentsData.filter(student => 
        student && typeof student === 'object' && Object.keys(student).length > 0
      );

      if (cleanStudentsData.length === 0) {
        return {
          success: false,
          error: 'No valid student data to create'
        };
      }

      const response = await this.makeRequest('/v1/students/students/bulk/', {
        method: 'POST',
        body: JSON.stringify({ students: cleanStudentsData })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Students bulk created successfully:', data);
        return {
          success: true,
          data: data,
          created: data.created || cleanStudentsData.length,
          failed: data.failed || 0
        };
      } else {
        console.warn('bulkCreateStudents failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          console.warn('bulkCreateStudents error details:', errorData);
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to bulk create students',
            status: response.status,
            details: errorData
          };
        } catch (e) {
          console.warn('Could not parse bulkCreateStudents error response');
          return {
            success: false,
            error: 'Failed to bulk create students',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Bulk create students error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // ===== COMPREHENSIVE STUDENT MANAGEMENT METHODS =====

  // Get students statistics
  async getStudentsStats() {
    try {
      console.log('Fetching students statistics...');
      const response = await this.makeRequest('/v1/students/students/stats/');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Students stats fetched successfully:', data);
        return {
          success: true,
          data: data
        };
      } else {
        console.warn('getStudentsStats failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to fetch students statistics',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to fetch students statistics',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Get students stats error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Get student documents
  async getStudentDocuments(studentId) {
    try {
      console.log('Fetching student documents...', studentId);
      const endpoint = `/v1/students/students/${studentId}/documents/`;
      const response = await this.makeRequest(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Student documents fetched successfully:', data);
        return {
          success: true,
          data: data.results || data,
          count: data.count || (Array.isArray(data) ? data.length : 0)
        };
      } else {
        console.warn('getStudentDocuments failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to fetch student documents',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to fetch student documents',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Get student documents error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Upload student document
  async uploadStudentDocument(studentId, documentData) {
    try {
      console.log('Uploading student document...', studentId, documentData);
      const endpoint = `/v1/students/students/${studentId}/documents/`;
      
      // Create FormData for file upload
      const formData = new FormData();
      Object.entries(documentData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let browser set it with boundary for FormData
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Student document uploaded successfully:', data);
        return {
          success: true,
          data: data
        };
      } else {
        console.warn('uploadStudentDocument failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to upload student document',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to upload student document',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Upload student document error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Delete student document
  async deleteStudentDocument(studentId, documentId) {
    try {
      console.log('Deleting student document...', studentId, documentId);
      const endpoint = `/v1/students/students/${studentId}/documents/${documentId}/`;
      const response = await this.makeRequest(endpoint, { method: 'DELETE' });
      
      if (response.ok) {
        console.log('Student document deleted successfully');
        return {
          success: true,
          message: 'Document deleted successfully'
        };
      } else {
        console.warn('deleteStudentDocument failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to delete student document',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to delete student document',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Delete student document error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Get student enrollment history
  async getStudentEnrollmentHistory(studentId) {
    try {
      console.log('Fetching student enrollment history...', studentId);
      const endpoint = `/v1/students/students/${studentId}/enrollment-history/`;
      const response = await this.makeRequest(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Student enrollment history fetched successfully:', data);
        return {
          success: true,
          data: data.results || data,
          count: data.count || (Array.isArray(data) ? data.length : 0)
        };
      } else {
        console.warn('getStudentEnrollmentHistory failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to fetch enrollment history',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to fetch enrollment history',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Get student enrollment history error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Add enrollment record
  async addEnrollmentRecord(studentId, enrollmentData) {
    try {
      console.log('Adding enrollment record...', studentId, enrollmentData);
      const endpoint = `/v1/students/students/${studentId}/enrollment-history/`;
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(enrollmentData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Enrollment record added successfully:', data);
        return {
          success: true,
          data: data
        };
      } else {
        console.warn('addEnrollmentRecord failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to add enrollment record',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to add enrollment record',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Add enrollment record error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Get student custom fields
  async getStudentCustomFields(studentId) {
    try {
      console.log('Fetching student custom fields...', studentId);
      const endpoint = `/v1/students/students/${studentId}/custom-fields/`;
      const response = await this.makeRequest(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Student custom fields fetched successfully:', data);
        return {
          success: true,
          data: data
        };
      } else {
        console.warn('getStudentCustomFields failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to fetch custom fields',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to fetch custom fields',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Get student custom fields error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Update student custom fields
  async updateStudentCustomFields(studentId, customFields) {
    try {
      console.log('Updating student custom fields...', studentId, customFields);
      const endpoint = `/v1/students/students/${studentId}/custom-fields/`;
      const response = await this.makeRequest(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(customFields),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Student custom fields updated successfully:', data);
        return {
          success: true,
          data: data
        };
      } else {
        console.warn('updateStudentCustomFields failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to update custom fields',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to update custom fields',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Update student custom fields error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Create student login credentials
  async createStudentLogin(studentId, loginData) {
    try {
      console.log('Creating student login...', studentId, loginData);
      const endpoint = `/v1/students/students/${studentId}/create-login/`;
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(loginData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Student login created successfully:', data);
        return {
          success: true,
          data: data
        };
      } else {
        console.warn('createStudentLogin failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to create student login',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to create student login',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Create student login error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Bulk create students (enhanced version)
  async bulkCreateStudentsEnhanced(studentsData) {
    try {
      console.log('Bulk creating students (enhanced)...', studentsData);
      const response = await this.makeRequest('/v1/students/students/bulk-create/', {
        method: 'POST',
        body: JSON.stringify(studentsData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Students bulk created successfully:', data);
        return {
          success: true,
          data: data
        };
      } else {
        console.warn('bulkCreateStudentsEnhanced failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to bulk create students',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to bulk create students',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Bulk create students enhanced error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Bulk update students
  async bulkUpdateStudents(updateData) {
    try {
      console.log('Bulk updating students...', updateData);
      const response = await this.makeRequest('/v1/students/students/bulk-update/', {
        method: 'POST',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Students bulk updated successfully:', data);
        return {
          success: true,
          data: data
        };
      } else {
        console.warn('bulkUpdateStudents failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to bulk update students',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to bulk update students',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Bulk update students error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Bulk delete students
  async bulkDeleteStudents(studentIds) {
    try {
      console.log('Bulk deleting students...', studentIds);
      const response = await this.makeRequest('/v1/students/students/bulk-delete/', {
        method: 'DELETE',
        body: JSON.stringify({ student_ids: studentIds }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Students bulk deleted successfully:', data);
        return {
          success: true,
          data: data
        };
      } else {
        console.warn('bulkDeleteStudents failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to bulk delete students',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to bulk delete students',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Bulk delete students error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Advanced search students
  async advancedSearchStudents(searchParams = {}) {
    try {
      console.log('Advanced searching students...', searchParams);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const endpoint = `/v1/students/students/search/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Advanced search completed successfully:', data);
        return {
          success: true,
          data: data.results || data,
          count: data.count || (Array.isArray(data) ? data.length : 0),
          next: data.next,
          previous: data.previous
        };
      } else {
        console.warn('advancedSearchStudents failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to search students',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to search students',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Advanced search students error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Get student analytics
  async getStudentAnalytics(filters = {}) {
    try {
      console.log('Fetching student analytics...', filters);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const endpoint = `/v1/students/students/stats/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Student analytics fetched successfully:', data);
        return {
          success: true,
          data: data
        };
      } else {
        console.warn('getStudentAnalytics failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to fetch student analytics',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to fetch student analytics',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Get student analytics error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Export students data
  async exportStudentsData(filters = {}, format = 'csv') {
    try {
      console.log('Exporting students data...', filters, format);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      queryParams.append('format', format);
      
      const endpoint = `/v1/students/students/export/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.makeRequest(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Students data exported successfully:', data);
        return {
          success: true,
          data: data
        };
      } else {
        console.warn('exportStudentsData failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to export students data',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to export students data',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Export students data error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }

  // Import students data
  async importStudentsData(fileData, options = {}) {
    try {
      console.log('Importing students data...', fileData, options);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', fileData);
      
      // Add options
      Object.entries(options).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      const response = await this.makeRequest('/v1/students/students/import/', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let browser set it with boundary for FormData
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Students data imported successfully:', data);
        return {
          success: true,
          data: data
        };
      } else {
        console.warn('importStudentsData failed:', response.status, response.statusText);
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.detail || errorData.message || 'Failed to import students data',
            status: response.status
          };
        } catch (e) {
          return {
            success: false,
            error: 'Failed to import students data',
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error('Import students data error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }
}

// Create and export a singleton instance
const djangoAuthService = new DjangoAuthService();
export default djangoAuthService;
