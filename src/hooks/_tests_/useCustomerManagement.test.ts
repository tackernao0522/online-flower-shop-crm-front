import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { useCustomerManagement } from '../useCustomerManagement';
import { useToast, useDisclosure, useBreakpointValue } from '@chakra-ui/react';
import { useInView } from 'react-intersection-observer';
import { deleteCustomer } from '@/features/customers/customersSlice';
import { Customer } from '@/types/customer';

type DispatchMock = jest.Mock & { mockReturnValue: (value: any) => jest.Mock };
type SelectorMock = jest.Mock & {
  mockImplementation: (value: any) => jest.Mock;
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@chakra-ui/react', () => ({
  useToast: jest.fn(),
  useDisclosure: jest.fn(),
  useBreakpointValue: jest.fn(),
}));

jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn(),
}));

jest.mock('@/features/customers/customersSlice', () => ({
  fetchCustomers: jest.fn(),
  addCustomer: jest.fn(),
  updateCustomer: jest.fn(),
  deleteCustomer: jest.fn(),
}));

describe('useCustomerManagement フック', () => {
  let mockDispatch: DispatchMock;
  let mockSelector: SelectorMock;
  let mockToast: jest.Mock;
  let mockDisclosure: jest.Mock;
  let mockBreakpointValue: jest.Mock;
  let mockInView: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDispatch = jest.fn(action => {
      if (typeof action === 'function') {
        return action(mockDispatch);
      }
      return action;
    }) as DispatchMock;

    mockSelector = jest.fn().mockReturnValue({
      status: 'idle',
      error: null,
      customers: [],
    }) as SelectorMock;

    mockToast = jest.fn();
    mockDisclosure = jest.fn().mockReturnValue({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    });

    mockBreakpointValue = jest.fn().mockReturnValue(false);
    mockInView = jest.fn().mockReturnValue([null, false]);

    // モックの設定
    const dispatchModule = jest.requireMock('react-redux');
    const selectorModule = jest.requireMock('react-redux');
    dispatchModule.useDispatch.mockReturnValue(mockDispatch);
    selectorModule.useSelector.mockImplementation(mockSelector);

    (useToast as jest.Mock).mockReturnValue(mockToast);
    (useDisclosure as jest.Mock).mockImplementation(mockDisclosure);
    (useBreakpointValue as jest.Mock).mockImplementation(mockBreakpointValue);
    (useInView as jest.Mock).mockImplementation(mockInView);

    (deleteCustomer as unknown as jest.Mock).mockImplementation(() => ({
      type: 'customers/deleteCustomer/fulfilled',
      payload: '1',
    }));

    window.scrollTo = jest.fn();
  });

  test('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useCustomerManagement());
    expect(result.current.customers).toEqual([]);
    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.page).toBe(1);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.isDeleteAlertOpen).toBe(false);
    expect(result.current.customerToDelete).toBeNull();
    expect(result.current.searchTerm).toBe('');
    expect(result.current.showScrollTop).toBe(false);
    expect(result.current.newCustomer).toEqual({
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
      birthDate: '',
    });
    expect(result.current.formErrors).toEqual({});
    expect(result.current.isMobile).toBe(false);
  });

  test('handleCustomerClick が正しく動作する', () => {
    const { result } = renderHook(() => useCustomerManagement());
    const mockCustomer = { id: '1', name: 'Test User' } as Customer;

    act(() => {
      result.current.handleCustomerClick(mockCustomer);
    });

    expect(result.current.activeCustomer).toEqual(mockCustomer);
    expect(result.current.modalMode).toBe('detail');
    expect(mockDisclosure().onOpen).toHaveBeenCalled();
  });

  test('handleAddCustomer が正しく動作する', () => {
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.handleAddCustomer();
    });

    expect(result.current.activeCustomer).toBeNull();
    expect(result.current.modalMode).toBe('add');
    expect(result.current.newCustomer).toEqual({
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
      birthDate: '',
    });
    expect(result.current.formErrors).toEqual({});
    expect(mockDisclosure().onOpen).toHaveBeenCalled();
  });

  test('handleEditCustomer が正しく動作する', () => {
    const { result } = renderHook(() => useCustomerManagement());
    const mockCustomer = {
      id: '1',
      name: 'Test User',
      email: 'edit@example.com',
      phoneNumber: '090-1234-5678',
      address: 'Test Address',
      birthDate: '1990-01-01T00:00:00.000Z',
    } as Customer;

    act(() => {
      result.current.handleEditCustomer(mockCustomer);
    });

    expect(result.current.activeCustomer).toEqual(mockCustomer);
    expect(result.current.modalMode).toBe('edit');
    expect(result.current.newCustomer).toEqual({
      name: 'Test User',
      email: 'edit@example.com',
      phoneNumber: '090-1234-5678',
      address: 'Test Address',
      birthDate: '1990-01-01',
    });
    expect(result.current.formErrors).toEqual({});
    expect(mockDisclosure().onOpen).toHaveBeenCalled();
  });

  test('handleDeleteCustomer が正しく動作する', () => {
    const { result } = renderHook(() => useCustomerManagement());
    const mockCustomer = { id: '1', name: 'Test User' } as Customer;

    act(() => {
      result.current.handleDeleteCustomer(mockCustomer);
    });

    expect(result.current.customerToDelete).toEqual(mockCustomer);
    expect(result.current.isDeleteAlertOpen).toBe(true);
  });

  test('confirmDelete が正しく動作する', async () => {
    const mockCustomer = { id: '1', name: 'Test User' } as Customer;
    const mockAction = {
      type: 'customers/deleteCustomer/fulfilled',
      payload: '1',
    };

    (deleteCustomer as unknown as jest.Mock).mockResolvedValue(mockAction);
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.handleDeleteCustomer(mockCustomer);
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(result.current.isDeleteAlertOpen).toBe(false);
    expect(result.current.customerToDelete).toBeNull();
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '顧客を削除しました',
        status: 'warning',
      }),
    );
  });

  test('handleSearch が正しく動作する', async () => {
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.handleSearch('test');
    });

    await waitFor(() => {
      expect(result.current.searchTerm).toBe('test');
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  test('handleKeyDown が正しく動作する', async () => {
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.setSearchTerm('test');
    });

    act(() => {
      result.current.handleKeyDown({
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });

    await waitFor(() => {
      expect(result.current.searchTerm).toBe('test');
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  test('handleInputChange が正しく動作する', () => {
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'name', value: 'New Name' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.newCustomer.name).toBe('New Name');
    expect(result.current.formErrors.name).toBe('');
  });

  test('scrollToTop が正しく動作する', () => {
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.scrollToTop();
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  test('debouncedFetchCustomers が正しく動作する', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.handleSearch('test');
    });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.searchTerm).toBe('test');
    });

    expect(mockDispatch).toHaveBeenCalled();
    jest.useRealTimers();
  });

  test('スクロールイベントリスナーが正しく動作する', () => {
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      window.pageYOffset = 400;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.showScrollTop).toBe(true);

    act(() => {
      window.pageYOffset = 200;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.showScrollTop).toBe(false);
  });

  test('validateForm が正しく動作する', () => {
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.handleAddCustomer();
    });

    act(() => {
      result.current.handleSubmit();
    });

    expect(result.current.formErrors).toEqual({
      name: '名前は必須です',
      email: '有効なメールアドレスを入力してください',
      phoneNumber: '有効な電話番号を入力してください（例: 090-1234-5678）',
      address: '住所は必須です',
      birthDate: '生年月日は必須です',
    });
  });
});
