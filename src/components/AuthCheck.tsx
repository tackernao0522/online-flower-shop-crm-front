'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setAuthState, logout } from '../features/auth/authSlice';
import { isTokenExpired } from '@/utils/tokenUtils';

const AuthCheck = () => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { isAuthenticated, token, user } = useSelector(
    (state: RootState) => state.auth,
  );

  const checkTokenExpiration = useCallback(() => {
    if (typeof window !== 'undefined' && token) {
      if (isTokenExpired(token)) {
        dispatch(logout());
        router.push('/login');
      }
    }
  }, [token, dispatch, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!isAuthenticated && storedToken && storedUser) {
        if (storedToken && !isTokenExpired(storedToken)) {
          dispatch(setAuthState(true));
        } else {
          dispatch(logout());
          router.push('/login');
        }
      } else if (!storedToken || !storedUser) {
        dispatch(logout());
        router.push('/login');
      }

      const intervalId = setInterval(checkTokenExpiration, 60000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isAuthenticated, token, user, dispatch, router, checkTokenExpiration]);

  return null;
};

export default AuthCheck;
