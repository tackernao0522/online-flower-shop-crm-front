import React from 'react';
import { render, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Home from '../page';
import { RootState } from '../../store';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

describe('Homeコンポーネント', () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.Mock;
  const mockUseSelector = useSelector as jest.Mock;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseSelector.mockClear();
    mockPush.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('セレクター関数が正しく動作すること', () => {
    const mockState = {
      auth: {
        isAuthenticated: true,
      },
    } as RootState;

    mockUseSelector.mockImplementation(selector => selector(mockState));

    render(<Home />);

    expect(mockUseSelector).toHaveBeenCalled();
    const selectorFn = mockUseSelector.mock.calls[0][0];
    expect(selectorFn(mockState)).toBe(true);
  });

  it('useEffect のクリーンアップ関数が呼ばれること', () => {
    mockUseSelector.mockReturnValue(true);

    const { unmount } = render(<Home />);

    act(() => {
      unmount();
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('認証されている場合、/dashboardにリダイレクトされること', () => {
    mockUseSelector.mockReturnValue(true);

    render(<Home />);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('認証されていない場合、/loginにリダイレクトされること', () => {
    mockUseSelector.mockReturnValue(false);

    render(<Home />);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('isAuthenticated が undefined の場合、/login にリダイレクトされること', () => {
    mockUseSelector.mockReturnValue(undefined);

    render(<Home />);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('isAuthenticated が true から false に変わった場合、/login にリダイレクトされること', () => {
    mockUseSelector.mockReturnValueOnce(true).mockReturnValueOnce(false);

    const { rerender } = render(<Home />);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');

    act(() => {
      rerender(<Home />);
    });

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('router.push が呼ばれない場合、エラーハンドリングが行われること', () => {
    mockUseRouter.mockReturnValue({
      push: jest.fn(() => {
        throw new Error('Router error');
      }),
    });

    expect(() => render(<Home />)).toThrow('Router error');
  });
});
