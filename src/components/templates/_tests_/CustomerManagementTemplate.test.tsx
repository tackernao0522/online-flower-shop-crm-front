import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import CustomerManagementTemplate from '../CustomerManagementTemplate';
import { useCustomerManagement } from '@/hooks/useCustomerManagement';
import { useRouter } from 'next/navigation';
import type { Customer } from '@/types/customer';

jest.mock('@/hooks/useCustomerManagement');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseCustomerManagement = useCustomerManagement as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe('CustomerManagementTemplate コンポーネント', () => {
  const mockCustomers: Customer[] = [
    {
      id: '1',
      name: '山田太郎',
      email: 'taro@example.com',
      phoneNumber: '090-1234-5678',
      address: '東京都渋谷区',
      birthDate: '1990-01-01T00:00:00.000Z',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: '佐藤花子',
      email: 'hanako@example.com',
      phoneNumber: '080-9876-5432',
      address: '東京都新宿区',
      birthDate: '1985-12-31T00:00:00.000Z',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
    },
  ];

  const mockCustomerManagement = {
    isOpen: false,
    onOpen: jest.fn(),
    onClose: jest.fn(),
    activeCustomer: null as Customer | null,
    modalMode: 'detail' as const,
    customers: mockCustomers,
    status: 'succeeded' as const,
    error: null,
    loading: false,
    page: 1,
    hasMore: false,
    isDeleteAlertOpen: false,
    customerToDelete: null as Customer | null,
    searchTerm: '',
    showScrollTop: false,
    newCustomer: {
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
      birthDate: '',
    },
    formErrors: {},
    isMobile: false,
    handleCustomerClick: jest.fn(),
    handleAddCustomer: jest.fn(),
    handleEditCustomer: jest.fn(),
    handleDeleteCustomer: jest.fn(),
    confirmDelete: jest.fn(),
    cancelDelete: jest.fn(),
    handleSearch: jest.fn(),
    handleKeyDown: jest.fn(),
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn(),
    scrollToTop: jest.fn(),
    lastElementRef: jest.fn(),
    setSearchTerm: jest.fn(),
    fetchCustomersData: jest.fn(),
    loadMore: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCustomerManagement.mockReturnValue(mockCustomerManagement);
    mockUseRouter.mockReturnValue({ push: jest.fn() });
  });

  const renderComponent = () =>
    render(
      <ChakraProvider>
        <CustomerManagementTemplate />
      </ChakraProvider>,
    );

  test('顧客管理画面のヘッダーが正しく表示される', () => {
    renderComponent();
    expect(screen.getByText('顧客管理')).toBeInTheDocument();
    expect(screen.getByText('新規顧客登録')).toBeInTheDocument();
    expect(screen.getByText('ダッシュボードへ戻る')).toBeInTheDocument();
  });

  test('検索フォームが正しく表示される', () => {
    renderComponent();
    expect(
      screen.getByPlaceholderText('顧客名または電話番号( - は除く)'),
    ).toBeInTheDocument();
    expect(screen.getByText('検索')).toBeInTheDocument();
  });

  test('顧客テーブルが正しく表示される', () => {
    renderComponent();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('名前')).toBeInTheDocument();
    expect(screen.getByText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByText('電話番号')).toBeInTheDocument();
    expect(screen.getByText('アクション')).toBeInTheDocument();
  });

  test('顧客データが正しく表示される', () => {
    renderComponent();
    expect(screen.getByText('山田太郎')).toBeInTheDocument();
    expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    expect(screen.getByText('taro@example.com')).toBeInTheDocument();
    expect(screen.getByText('090-1234-5678')).toBeInTheDocument();
  });

  test('新規顧客登録ボタンをクリックするとハンドラーが呼ばれる', () => {
    renderComponent();
    fireEvent.click(screen.getByText('新規顧客登録'));
    expect(mockCustomerManagement.handleAddCustomer).toHaveBeenCalled();
  });

  test('ダッシュボードへ戻るボタンをクリックするとルーターが呼ばれる', () => {
    renderComponent();
    fireEvent.click(screen.getByText('ダッシュボードへ戻る'));
    expect(mockUseRouter().push).toHaveBeenCalledWith('/dashboard');
  });

  test('検索ボタンをクリックするとハンドラーが呼ばれる', () => {
    renderComponent();
    fireEvent.click(screen.getByText('検索'));
    expect(mockCustomerManagement.handleSearch).toHaveBeenCalled();
  });

  test('購入履歴のレンダリングが正しく動作する', async () => {
    const customerWithHistory: Customer = {
      ...mockCustomers[0],
      purchaseHistory: [
        { id: 'p1', date: '2023-01-01', amount: 5000 },
        { id: 'p2', date: '2023-02-01', amount: 3000 },
      ],
    };

    mockUseCustomerManagement.mockReturnValue({
      ...mockCustomerManagement,
      isOpen: true,
      activeCustomer: customerWithHistory,
      modalMode: 'detail' as const,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('顧客詳細')).toBeInTheDocument();
    });

    const purchaseHistoryTab = await screen.findByRole('tab', {
      name: '購入履歴',
    });
    fireEvent.click(purchaseHistoryTab);

    const cells = await screen.findAllByRole('cell');
    const amountCells = cells.filter(
      cell =>
        cell.textContent?.includes('¥5,000') ||
        cell.textContent?.includes('¥3,000'),
    );

    expect(amountCells).toHaveLength(2);
    expect(amountCells[0]).toHaveTextContent('¥5,000');
    expect(amountCells[1]).toHaveTextContent('¥3,000');
  });

  test('編集モードでの購入履歴表示が正しく動作する', async () => {
    const customerWithHistory: Customer = {
      ...mockCustomers[0],
      purchaseHistory: [{ id: 'p1', date: '2023-01-01', amount: 5000 }],
    };

    mockUseCustomerManagement.mockReturnValue({
      ...mockCustomerManagement,
      isOpen: true,
      activeCustomer: customerWithHistory,
      modalMode: 'edit' as const,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('顧客情報編集')).toBeInTheDocument();
    });

    const purchaseHistoryTab = await screen.findByRole('tab', {
      name: '購入履歴',
    });
    fireEvent.click(purchaseHistoryTab);

    await waitFor(() => {
      const addButtons = screen.getAllByRole('button', {
        name: /購入履歴を追加/,
      });
      expect(addButtons[0]).toBeInTheDocument();
      const deleteButtons = screen.getAllByLabelText('Delete purchase');
      expect(deleteButtons[0]).toBeInTheDocument();
    });
  });

  test('モバイル表示時の動作が正しく機能する', async () => {
    const customerWithHistory: Customer = {
      ...mockCustomers[0],
      purchaseHistory: [{ id: 'p1', date: '2023-01-01', amount: 5000 }],
    };

    mockUseCustomerManagement.mockReturnValue({
      ...mockCustomerManagement,
      isOpen: true,
      activeCustomer: customerWithHistory,
      isMobile: true,
      modalMode: 'detail' as const,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const purchaseHistoryTab = await screen.findByRole('tab', {
      name: '購入履歴',
    });
    fireEvent.click(purchaseHistoryTab);

    await waitFor(() => {
      const amountCells = screen.getAllByRole('cell');
      const amountCell = amountCells.find(
        cell => cell.textContent === '¥5,000',
      );
      expect(amountCell).toBeInTheDocument();
    });
  });

  test('各モーダルモードで正しく表示される', async () => {
    mockUseCustomerManagement.mockReturnValue({
      ...mockCustomerManagement,
      isOpen: true,
      modalMode: 'add' as const,
    });

    const { rerender } = renderComponent();

    await waitFor(() => {
      const modalHeaderText = screen
        .getAllByText('新規顧客登録')
        .find(element => element.tagName === 'HEADER');
      expect(modalHeaderText).toBeInTheDocument();

      const modalButton = screen.getByRole('button', { name: '登録' });
      expect(modalButton).toBeInTheDocument();
    });

    mockUseCustomerManagement.mockReturnValue({
      ...mockCustomerManagement,
      isOpen: true,
      activeCustomer: mockCustomers[0],
      modalMode: 'edit' as const,
    });

    rerender(
      <ChakraProvider>
        <CustomerManagementTemplate />
      </ChakraProvider>,
    );

    await waitFor(() => {
      const editModalHeader = screen.getByText('顧客情報編集');
      expect(editModalHeader).toBeInTheDocument();

      const updateButton = screen.getByRole('button', { name: '更新' });
      expect(updateButton).toBeInTheDocument();
    });
  });

  test('購入履歴テーブルのサイズが正しく設定される', async () => {
    const customerWithHistory: Customer = {
      ...mockCustomers[0],
      purchaseHistory: [{ id: 'p1', date: '2023-01-01', amount: 5000 }],
    };

    mockUseCustomerManagement.mockReturnValue({
      ...mockCustomerManagement,
      isOpen: true,
      activeCustomer: customerWithHistory,
      isMobile: false,
      modalMode: 'detail' as const,
    });

    const { rerender } = renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const purchaseHistoryTab = await screen.findByRole('tab', {
      name: '購入履歴',
    });
    fireEvent.click(purchaseHistoryTab);

    await waitFor(() => {
      const cells = screen.getAllByRole('cell');
      const amountCell = cells.find(cell => cell.textContent === '¥5,000');
      expect(amountCell).toBeInTheDocument();
    });

    mockUseCustomerManagement.mockReturnValue({
      ...mockCustomerManagement,
      isOpen: true,
      activeCustomer: customerWithHistory,
      isMobile: true,
      modalMode: 'detail' as const,
    });

    rerender(
      <ChakraProvider>
        <CustomerManagementTemplate />
      </ChakraProvider>,
    );

    await waitFor(() => {
      const cells = screen.getAllByRole('cell');
      const amountCell = cells.find(cell => cell.textContent === '¥5,000');
      expect(amountCell).toBeInTheDocument();
    });
  });
});
