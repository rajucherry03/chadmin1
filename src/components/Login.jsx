import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDjangoAuth } from "../contexts/DjangoAuthContext";
import { isDjangoSuperuser } from "../utils/djangoAuthHelpers";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: djangoLogin, isAuthenticated } = useDjangoAuth();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    // Validate input fields
    if (!email.trim()) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }
    
    if (!password.trim()) {
      setError("Please enter your password.");
      setLoading(false);
      return;
    }

    try {
      const sanitizedEmail = email.trim().toLowerCase();
      
      // Django API login
      const djangoResult = await djangoLogin(sanitizedEmail, password);
      
      if (djangoResult.success) {
        // Django login successful
        console.log('Django login successful:', djangoResult.user);
        console.log('Raw login response:', djangoResult.rawResponse);
        
        // Check if the user is a Django superuser
        const user = djangoResult.user;
        console.log('Login result user data:', user);
        console.log('User data structure:', {
          email: user?.email,
          username: user?.username,
          is_superuser: user?.is_superuser,
          is_staff: user?.is_staff,
          is_active: user?.is_active,
          fullUserObject: user
        });
        
        if (!user) {
          // Create a basic user object if none exists
          const fallbackUser = {
            email: sanitizedEmail,
            username: sanitizedEmail.split('@')[0],
            is_superuser: false,
            is_staff: false,
            is_active: true
          };
          console.log('No user data received, using fallback user:', fallbackUser);
          // Continue with fallback user instead of failing
        }
        
        // Use fallback user if original user is null
        const currentUser = user || {
          email: sanitizedEmail,
          username: sanitizedEmail.split('@')[0],
          is_superuser: false,
          is_staff: false,
          is_active: true
        };
        
        console.log('Using user for validation:', currentUser);
        
        // Check superuser status with multiple approaches
        let isSuperuser = false;
        
        // Method 1: Direct check from user object
        if (currentUser.is_superuser !== undefined) {
          isSuperuser = currentUser.is_superuser === true;
          console.log('Superuser status from direct field:', isSuperuser);
        }
        // Method 2: Check alternative field names
        else if (currentUser.superuser !== undefined) {
          isSuperuser = currentUser.superuser === true;
          console.log('Superuser status from alternative field:', isSuperuser);
        }
        // Method 3: Check if user has admin role
        else if (currentUser.role === 'superuser' || currentUser.role === 'admin') {
          isSuperuser = true;
          console.log('Superuser status from role field:', isSuperuser);
        }
        // Method 4: Try to fetch complete profile (only if we have a real user object)
        else if (user && user.email) {
          console.log('User data missing superuser field, attempting to fetch complete profile...');
          try {
            const { getDjangoCurrentUser } = await import('../utils/djangoAuthHelpers');
            const completeUserData = await getDjangoCurrentUser();
            if (completeUserData) {
              console.log('Complete user data:', completeUserData);
              isSuperuser = isDjangoSuperuser(completeUserData);
              console.log('Superuser status from profile fetch:', isSuperuser);
            } else {
              console.warn('Could not fetch user profile');
            }
          } catch (fetchError) {
            console.error('Error fetching complete user data:', fetchError);
          }
        }
        
        // Method 5: Allow known admin emails (staff users with admin privileges)
        if (!isSuperuser && currentUser.email) {
          const knownAdminEmails = [
            'admin1@gmail.com',
            'admin@gmail.com',
            'superuser@gmail.com'
          ];
          
          if (knownAdminEmails.includes(currentUser.email.toLowerCase())) {
            isSuperuser = true;
            console.log('Admin access granted for known email:', currentUser.email);
            console.log('Superuser status from known email list:', isSuperuser);
            console.warn('⚠️ Using email-based admin validation for:', currentUser.email);
          }
        }
        
        // Final superuser check
        if (!isSuperuser) {
          // Show detailed error with user data for debugging
          const errorMessage = `Access denied. Only authorized admin users can access this panel. 

Debug Info:
- User email: ${currentUser?.email || 'Not provided'}
- Username: ${currentUser?.username || 'Not provided'}
- is_superuser: ${currentUser?.is_superuser || 'Not provided'}
- is_staff: ${currentUser?.is_staff || 'Not provided'}
- User object: ${JSON.stringify(currentUser, null, 2)}

Authorized emails: admin1@gmail.com, admin@gmail.com, superuser@gmail.com

Contact your system administrator if you believe this is an error.`;
          
          setError(errorMessage);
          setLoading(false);
          return;
        }
        
        console.log('Superuser validation passed, proceeding to dashboard');

        // Login successful
        navigate("/dashboard");
        return;
      } else {
        // Django login failed
        setError(djangoResult.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white p-8 shadow-lg rounded-md w-96">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Admin Login
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Authorized Admin Access
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="block w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleLogin()}
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="block w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleLogin()}
              disabled={loading}
            />
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className={`block w-full py-2 rounded text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } transition`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;


