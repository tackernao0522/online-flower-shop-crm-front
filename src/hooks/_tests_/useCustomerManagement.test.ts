import { renderHook, act } from '@testing-library/react';
import { useCustomerManagement } from '../useCustomerManagement';
import { useToast } from '@chakra-ui/react';
import { Customer } from '@/types/customer';

const createMockResponse = (data: any[] = []) => ({
  type: 'customers/fetchCustomers/fulfilled',
  payload: { data },
  meta: { requestStatus: 'fulfilled' },
});

const mockDispatch = jest.fn().mockImplementation((action: any) => {
  if (typeof action === 'function') {
    return action(mockDispatch);
  }
  return Promise.resolve(createMockResponse([]));
});

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn().mockImplementation(() => ({
    status: 'idle',
    error: null,
    customers: [],
  })),
}));

jest.mock('@chakra-ui/react', () => ({
  useToast: jest.fn(() => jest.fn()),
  useDisclosure: jest.fn(() => ({
    isOpen: false,
    onOpen: jest.fn(),
    onClose: jest.fn(),
  })),
  useBreakpointValue: jest.fn(() => false),
}));

jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn(() => [null, false]),
}));

jest.mock('@/features/customers/customersSlice', () => {
  const createMockThunk = (type: string) => {
    const mockFunction = jest.fn() as jest.Mock & {
      fulfilled: { match: (action: any) => boolean };
    };
    mockFunction.mockImplementation(() =>
      Promise.resolve(createMockResponse([])),
    );
    mockFunction.fulfilled = { match: () => true };
    return mockFunction;
  };

  return {
    fetchCustomers: createMockThunk('customers/fetchCustomers'),
    addCustomer: createMockThunk('customers/addCustomer'),
    updateCustomer: createMockThunk('customers/updateCustomer'),
    deleteCustomer: createMockThunk('customers/deleteCustomer'),
  };
});

describe('useCustomerManagement フック', () => {
  let mockToast: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue(mockToast);
    window.scrollTo = jest.fn();

    mockDispatch.mockImplementation((action: any) => {
      if (typeof action === 'function') {
        return action(mockDispatch);
      }
      return Promise.resolve(createMockResponse([]));
    });
  });

  test('初期状態が正しく設定される', async () => {
    const { result } = renderHook(() => useCustomerManagement());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.customers).toEqual([]);
    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.page).toBe(1);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isDeleteAlertOpen).toBe(false);
    expect(result.current.customerToDelete).toBeNull();
    expect(result.current.searchTerm).toBe('');
    expect(result.current.newCustomer).toEqual({
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
      birthDate: '',
    });
    expect(result.current.formErrors).toEqual({});
  });

  test('handleInputChange が正しく動作する', async () => {
    const { result } = renderHook(() => useCustomerManagement());

    await act(async () => {
      result.current.handleInputChange({
        target: { name: 'name', value: 'Test Name' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.newCustomer.name).toBe('Test Name');
  });

  test('scrollToTop が正しく動作する', async () => {
    const { result } = renderHook(() => useCustomerManagement());

    await act(async () => {
      result.current.scrollToTop();
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  test('handleCustomerClick が正しく動作する', async () => {
    const { result } = renderHook(() => useCustomerManagement());
    const mockCustomer = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: '090-1234-5678',
      address: 'Test Address',
      birthDate: '1990-01-01T00:00:00.000Z',
    } as Customer;

    await act(async () => {
      result.current.handleCustomerClick(mockCustomer);
    });

    expect(result.current.activeCustomer).toEqual(mockCustomer);
    expect(result.current.modalMode).toBe('detail');
  });

  test('handleAddCustomer が正しく動作する', async () => {
    const { result } = renderHook(() => useCustomerManagement());

    await act(async () => {
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
  });

  test('validateForm がエラーを正しく検出する', async () => {
    const { result } = renderHook(() => useCustomerManagement());

    await act(async () => {
      result.current.handleAddCustomer();
      await result.current.handleSubmit();
    });

    expect(result.current.formErrors).toEqual({
      name: '名前は必須です',
      email: '有効なメールアドレスを入力してください',
      phoneNumber: '有効な電話番号を入力してください（例: 090-1234-5678）',
      address: '住所は必須です',
      birthDate: '生年月日は必須です',
    });
  });

  test('handleInputChange が無効な電話番号をバリデートする', async () => {
    const { result } = renderHook(() => useCustomerManagement());

    await act(async () => {
      result.current.handleInputChange({
        target: { name: 'phoneNumber', value: '1234567890' },
      } as React.ChangeEvent<HTMLInputElement>);
      await result.current.handleSubmit();
    });

    expect(result.current.formErrors.phoneNumber).toBe(
      '有効な電話番号を入力してください（例: 090-1234-5678）',
    );
  });

  test('handleEditCustomer が正しく動作する', async () => {
    const { result } = renderHook(() => useCustomerManagement());
    const mockCustomer = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: '090-1234-5678',
      address: 'Test Address',
      birthDate: '1990-01-01T00:00:00.000Z',
    } as Customer;

    await act(async () => {
      result.current.handleEditCustomer(mockCustomer);
    });

    expect(result.current.activeCustomer).toEqual(mockCustomer);
    expect(result.current.modalMode).toBe('edit');
    expect(result.current.newCustomer).toEqual({
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: '090-1234-5678',
      address: 'Test Address',
      birthDate: '1990-01-01',
    });
    expect(result.current.formErrors).toEqual({});
  });

  test('handleSubmit が新規顧客追加時に正しく動作する', async () => {
    const mockNewCustomer = {
      name: 'New User',
      email: 'new@example.com',
      phoneNumber: '090-1234-5678',
      address: 'New Address',
      birthDate: '1990-01-01',
    };

    const { result } = renderHook(() => useCustomerManagement());

    await act(async () => {
      result.current.handleAddCustomer();
    });

    await act(async () => {
      Object.entries(mockNewCustomer).forEach(([key, value]) => {
        result.current.handleInputChange({
          target: { name: key, value },
        } as React.ChangeEvent<HTMLInputElement>);
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '顧客を登録しました',
        status: 'success',
      }),
    );
  });

  test('handleSubmit が顧客更新時に正しく動作する', async () => {
    const mockCustomer = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: '090-1234-5678',
      address: 'Test Address',
      birthDate: '1990-01-01T00:00:00.000Z',
    } as Customer;

    const mockUpdatedData = {
      name: 'Updated User',
      email: 'updated@example.com',
      phoneNumber: '090-8765-4321',
      address: 'Updated Address',
      birthDate: '1991-01-01',
    };

    const { result } = renderHook(() => useCustomerManagement());

    await act(async () => {
      result.current.handleEditCustomer(mockCustomer);
    });

    await act(async () => {
      Object.entries(mockUpdatedData).forEach(([key, value]) => {
        result.current.handleInputChange({
          target: { name: key, value },
        } as React.ChangeEvent<HTMLInputElement>);
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '顧客情報を更新しました',
        status: 'success',
      }),
    );
  });

  test('confirmDelete が正しく動作する', async () => {
    const mockCustomer = { id: '1', name: 'Test User' } as Customer;
    const { result } = renderHook(() => useCustomerManagement());

    await act(async () => {
      result.current.handleDeleteCustomer(mockCustomer);
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(result.current.isDeleteAlertOpen).toBe(false);
    expect(result.current.customerToDelete).toBeNull();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '顧客を削除しました',
        status: 'warning',
      }),
    );
  });

  test('confirmDelete がエラー時に適切に処理する', async () => {
    const mockCustomer = { id: '1', name: 'Test User' } as Customer;

    jest.clearAllMocks();

    const deleteError = new Error('Delete failed');
    mockDispatch
      .mockResolvedValueOnce({
        type: 'customers/fetchCustomers/fulfilled',
        payload: { data: [] },
        meta: { requestStatus: 'fulfilled' },
      })
      .mockRejectedValueOnce(deleteError);

    const { result } = renderHook(() => useCustomerManagement());

    await act(async () => {
      result.current.handleDeleteCustomer(mockCustomer);
    });

    await act(async () => {
      await result.current.confirmDelete().catch(error => {
        console.log('Expected error in test:', error);
      });
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '顧客の削除に失敗しました',
        status: 'error',
        description: 'エラーが発生しました。もう一度お試しください。',
      }),
    );
  });

  test('debouncedFetchCustomers が正しく遅延実行される', async () => {
    jest.useFakeTimers();

    mockDispatch.mockClear();

    const { result } = renderHook(() => useCustomerManagement());

    await act(async () => {
      result.current.handleSearch('test');
      jest.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(mockDispatch).toHaveBeenCalled();
    jest.useRealTimers();
  });

  test('空の検索語でhandleSearch が呼ばれた時の動作確認', async () => {
    mockDispatch.mockClear();

    const { result } = renderHook(() => useCustomerManagement());

    await act(async () => {
      await result.current.handleSearch('');
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.page).toBe(1);
    expect(mockDispatch).toHaveBeenCalled();
  });

  test('loadMore が正しく動作する', async () => {
    mockDispatch.mockClear();

    const { result } = renderHook(() => useCustomerManagement());

    Object.defineProperty(result.current, 'hasMore', {
      value: true,
      configurable: true,
    });

    Object.defineProperty(result.current, 'loading', {
      value: false,
      configurable: true,
    });

    await act(async () => {
      result.current.loadMore();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockDispatch).toHaveBeenCalled();
  });
});
