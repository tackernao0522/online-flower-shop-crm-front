import React from 'react';
import { render } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import {
  useSelector as useSelectorOriginal,
  useDispatch as useDispatchOriginal,
} from 'react-redux';
import AuthCheck from '../AuthCheck';
import { setAuthState, logout } from '../../features/auth/authSlice';
import { isTokenExpired } from '@/utils/tokenUtils';

type MockedFunction<T = any> = jest.Mock<T>;

const useSelector = useSelectorOriginal as unknown as MockedFunction;
const useDispatch = useDispatchOriginal as unknown as MockedFunction;

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('../../features/auth/authSlice', () => ({
  setAuthState: jest.fn(),
  logout: jest.fn(),
}));
jest.mock('@/utils/tokenUtils', () => ({
  isTokenExpired: jest.fn(),
}));

describe('AuthCheck', () => {
  let mockRouter: { push: MockedFunction };
  let mockDispatch: MockedFunction;
  let mockUseSelector: MockedFunction;

  beforeEach(() => {
    mockRouter = { push: jest.fn() };
    (useRouter as MockedFunction).mockReturnValue(mockRouter);

    mockDispatch = jest.fn();
    (useDispatch as MockedFunction).mockReturnValue(mockDispatch);

    mockUseSelector = jest.fn();
    (useSelector as MockedFunction).mockImplementation(mockUseSelector);

    (isTokenExpired as MockedFunction).mockReturnValue(false);

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('認証済みで、トークンとユーザー情報が存在する場合、何も行わない', () => {
    mockUseSelector.mockReturnValue({
      isAuthenticated: true,
      token: 'token',
      user: {},
    });
    (window.localStorage.getItem as MockedFunction).mockImplementation(key => {
      if (key === 'token') return 'token';
      if (key === 'user') return JSON.stringify({});
      return null;
    });

    render(<AuthCheck />);

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('未認証だが、localStorageにトークンとユーザー情報が存在し、トークンが有効な場合、認証状態を設定する', () => {
    mockUseSelector.mockReturnValue({
      isAuthenticated: false,
      token: null,
      user: null,
    });
    (window.localStorage.getItem as MockedFunction).mockImplementation(key => {
      if (key === 'token') return 'token';
      if (key === 'user') return JSON.stringify({});
      return null;
    });
    (isTokenExpired as MockedFunction).mockReturnValue(false);

    render(<AuthCheck />);

    expect(mockDispatch).toHaveBeenCalledWith(setAuthState(true));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('未認証で、localStorageにトークンまたはユーザー情報が存在しない場合、ログアウトしてログインページにリダイレクトする', () => {
    mockUseSelector.mockReturnValue({
      isAuthenticated: false,
      token: null,
      user: null,
    });
    (window.localStorage.getItem as MockedFunction).mockReturnValue(null);

    render(<AuthCheck />);

    expect(mockDispatch).toHaveBeenCalledWith(logout());
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('トークンが期限切れの場合、ログアウトしてログインページにリダイレクトする', () => {
    mockUseSelector.mockReturnValue({
      isAuthenticated: false,
      token: 'expired-token',
      user: null,
    });
    (window.localStorage.getItem as MockedFunction).mockImplementation(key => {
      if (key === 'token') return 'expired-token';
      if (key === 'user') return JSON.stringify({});
      return null;
    });
    (isTokenExpired as MockedFunction).mockReturnValue(true);

    render(<AuthCheck />);

    expect(mockDispatch).toHaveBeenCalledWith(logout());
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('定期チェックでトークンが後から期限切れになった場合、ログアウトとリダイレクトが発生する', () => {
    jest.useFakeTimers();
    mockUseSelector.mockReturnValue({
      isAuthenticated: true,
      token: 'valid-token',
      user: {},
    });
    (window.localStorage.getItem as MockedFunction).mockImplementation(key => {
      if (key === 'token') return 'valid-token';
      if (key === 'user') return JSON.stringify({});
      return null;
    });

    (isTokenExpired as MockedFunction).mockReturnValue(false);

    render(<AuthCheck />);

    (isTokenExpired as MockedFunction).mockReturnValue(true);

    jest.advanceTimersByTime(60000);

    expect(mockDispatch).toHaveBeenCalledWith(logout());
    expect(mockRouter.push).toHaveBeenCalledWith('/login');

    jest.useRealTimers();
  });

  it('認証済みだがlocalStorageに有効なトークン/ユーザー情報がなく、トークンが期限切れの場合、ログアウトとリダイレクトが発生する', () => {
    mockUseSelector.mockReturnValue({
      isAuthenticated: true,
      token: 'expired-token',
      user: {},
    });
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    (isTokenExpired as jest.Mock).mockReturnValue(true);

    render(<AuthCheck />);

    expect(mockDispatch).toHaveBeenCalledWith(logout());
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });
});
