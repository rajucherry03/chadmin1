import { useEffect, useCallback } from 'react';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';

// Hook to automatically refresh tokens
export const useTokenRefresh = (intervalMinutes = 5) => {
  const { refreshToken, isAuthenticated, ensureValidToken } = useDjangoAuth();

  const refreshTokens = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      console.log('Token refresh hook: Checking token validity...');
      const isValid = await ensureValidToken();
      
      if (!isValid) {
        console.log('Token refresh hook: Token invalid, attempting refresh...');
        const result = await refreshToken();
        
        if (result.success) {
          console.log('Token refresh hook: Token refresh successful');
        } else {
          console.warn('Token refresh hook: Token refresh failed:', result.error);
        }
      } else {
        console.log('Token refresh hook: Token is still valid');
      }
    } catch (error) {
      console.error('Token refresh hook: Error during token refresh:', error);
    }
  }, [isAuthenticated, ensureValidToken, refreshToken]);

  // Set up automatic token refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log(`Token refresh hook: Setting up automatic refresh every ${intervalMinutes} minutes`);
    
    // Initial check
    refreshTokens();
    
    // Set up interval
    const interval = setInterval(refreshTokens, intervalMinutes * 60 * 1000);
    
    return () => {
      console.log('Token refresh hook: Clearing refresh interval');
      clearInterval(interval);
    };
  }, [isAuthenticated, intervalMinutes, refreshTokens]);

  return {
    refreshTokens,
    ensureValidToken,
  };
};

// Hook to check token status
export const useTokenStatus = () => {
  const { isAuthenticated, token } = useDjangoAuth();

  const getTokenInfo = useCallback(() => {
    if (!token) return null;

    try {
      // Decode JWT token to get expiration info
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      
      return {
        expiresAt: new Date(payload.exp * 1000),
        timeUntilExpiry,
        isExpired: timeUntilExpiry <= 0,
        willExpireSoon: timeUntilExpiry <= 300, // 5 minutes
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, [token]);

  return {
    isAuthenticated,
    token,
    tokenInfo: getTokenInfo(),
  };
};
