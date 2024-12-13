import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserSearchForm from '../UserSearchForm';
import { ChakraProvider } from '@chakra-ui/react';

// モック関数を作成
const mockSetSearchTerm = jest.fn();
const mockSetSearchRole = jest.fn();
const mockHandleSearch = jest.fn();
const mockHandleKeyPress = jest.fn();
const mockHandleResetSearch = jest.fn();

const defaultProps = {
  searchTerm: '',
  setSearchTerm: mockSetSearchTerm,
  searchRole: '',
  setSearchRole: mockSetSearchRole,
  handleSearch: mockHandleSearch,
  handleKeyPress: mockHandleKeyPress,
  handleResetSearch: mockHandleResetSearch,
  isSearchTermEmpty: true,
  isSearchRoleEmpty: true,
  isMobile: false,
};

const renderWithChakra = (props = defaultProps) =>
  render(
    <ChakraProvider>
      <UserSearchForm {...props} />
    </ChakraProvider>,
  );

describe('UserSearchFormのテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('デスクトップ表示', () => {
    test('初期状態で検索ボタンが無効になっていることを確認', () => {
      renderWithChakra();
      const termSearchButton = screen.getByText('名前またはメール検索');
      const roleSearchButton = screen.getByText('役割検索');
      expect(termSearchButton).toBeDisabled();
      expect(roleSearchButton).toBeDisabled();
    });

    test('ユーザー名の入力処理が正しく動作する', () => {
      renderWithChakra();
      const searchInput =
        screen.getByPlaceholderText('ユーザー名またはメールアドレスで検索');
      fireEvent.change(searchInput, { target: { value: 'test user' } });
      expect(mockSetSearchTerm).toHaveBeenCalledWith('test user');
    });

    test('検索ボタンのクリックで正しいハンドラーが呼ばれる', () => {
      renderWithChakra({
        ...defaultProps,
        searchTerm: 'test',
        isSearchTermEmpty: false,
      });
      const searchButton = screen.getByText('名前またはメール検索');
      fireEvent.click(searchButton);
      expect(mockHandleSearch).toHaveBeenCalledWith('term');
    });

    test('役割選択の変更が正しく処理される', () => {
      renderWithChakra();
      const roleSelect = screen.getByRole('combobox');
      fireEvent.change(roleSelect, { target: { value: 'ADMIN' } });
      expect(mockSetSearchRole).toHaveBeenCalledWith('ADMIN');
    });

    test('役割検索ボタンのクリックで正しいハンドラーが呼ばれる', () => {
      renderWithChakra({
        ...defaultProps,
        searchRole: 'ADMIN',
        isSearchRoleEmpty: false,
      });
      const roleSearchButton = screen.getByText('役割検索');
      fireEvent.click(roleSearchButton);
      expect(mockHandleSearch).toHaveBeenCalledWith('role');
    });

    test('すべての役割オプションが表示される', () => {
      renderWithChakra();
      const roleSelect = screen.getByRole('combobox');
      expect(roleSelect).toContainElement(screen.getByText('管理者'));
      expect(roleSelect).toContainElement(screen.getByText('マネージャー'));
      expect(roleSelect).toContainElement(screen.getByText('スタッフ'));
    });

    test('デスクトップレイアウトのスタイル確認', () => {
      const { container } = renderWithChakra();
      const stackElements = container.querySelectorAll('.chakra-stack');
      expect(stackElements).toHaveLength(2); // 2つのStack要素
    });
  });

  describe('モバイル表示', () => {
    test('モバイルレイアウトで正しく表示される', () => {
      renderWithChakra({ ...defaultProps, isMobile: true });
      const vStack = screen.getByTestId('mobile-form');
      expect(vStack).toBeInTheDocument();
    });

    test('モバイルでの検索入力が正しく動作する', () => {
      renderWithChakra({ ...defaultProps, isMobile: true });
      const searchInput =
        screen.getByPlaceholderText('ユーザー名またはメールアドレスで検索');
      fireEvent.change(searchInput, { target: { value: 'mobile test' } });
      expect(mockSetSearchTerm).toHaveBeenCalledWith('mobile test');
    });

    test('モバイルでの役割選択が正しく動作する', () => {
      renderWithChakra({ ...defaultProps, isMobile: true });
      const roleSelect = screen.getByRole('combobox');
      fireEvent.change(roleSelect, { target: { value: 'MANAGER' } });
      expect(mockSetSearchRole).toHaveBeenCalledWith('MANAGER');
    });

    test('モバイルでのボタン配置が正しい', () => {
      renderWithChakra({ ...defaultProps, isMobile: true });
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3); // 名前検索、役割検索、リセットの3つ
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    test('モバイルでの検索実行が正しく動作する', () => {
      renderWithChakra({
        ...defaultProps,
        isMobile: true,
        searchTerm: 'test',
        isSearchTermEmpty: false,
      });
      const searchButton = screen.getByText('名前またはメール検索');
      fireEvent.click(searchButton);
      expect(mockHandleSearch).toHaveBeenCalledWith('term');
    });
  });

  describe('キーボードイベント', () => {
    test('検索フィールドでのEnterキー処理', () => {
      renderWithChakra();
      const searchInput =
        screen.getByPlaceholderText('ユーザー名またはメールアドレスで検索');
      fireEvent.keyPress(searchInput, {
        key: 'Enter',
        code: 'Enter',
        charCode: 13,
      });
      expect(mockHandleKeyPress).toHaveBeenCalledWith(
        expect.any(Object),
        'term',
      );
    });

    test('役割選択でのEnterキー処理', () => {
      renderWithChakra();
      const roleSelect = screen.getByRole('combobox');
      fireEvent.keyPress(roleSelect, {
        key: 'Enter',
        code: 'Enter',
        charCode: 13,
      });
      expect(mockHandleKeyPress).toHaveBeenCalledWith(
        expect.any(Object),
        'role',
      );
    });

    test('キーボードイベントの処理が期待通りに動作する', () => {
      renderWithChakra();
      const searchInput =
        screen.getByPlaceholderText('ユーザー名またはメールアドレスで検索');
      const roleSelect = screen.getByRole('combobox');

      // 検索フィールドでのEnterキー
      fireEvent.keyPress(searchInput, {
        key: 'Enter',
        code: 'Enter',
        charCode: 13,
      });
      expect(mockHandleKeyPress).toHaveBeenLastCalledWith(
        expect.any(Object),
        'term',
      );

      // 役割選択でのEnterキー
      fireEvent.keyPress(roleSelect, {
        key: 'Enter',
        code: 'Enter',
        charCode: 13,
      });
      expect(mockHandleKeyPress).toHaveBeenLastCalledWith(
        expect.any(Object),
        'role',
      );

      // その他のキーの処理
      mockHandleKeyPress.mockClear();
      fireEvent.keyDown(searchInput, { key: 'a', code: 'KeyA' });
      expect(mockHandleKeyPress).not.toHaveBeenCalled();
    });
  });

  describe('フォーム状態の制御', () => {
    test('検索条件が空の場合のリセットボタンの動作', () => {
      renderWithChakra();
      const resetButton = screen.getByText('検索結果をリセット');
      fireEvent.click(resetButton);
      expect(mockHandleResetSearch).toHaveBeenCalledTimes(1);
    });

    test('検索条件が存在する場合のボタンの有効化', () => {
      renderWithChakra({
        ...defaultProps,
        searchTerm: 'test',
        searchRole: 'ADMIN',
        isSearchTermEmpty: false,
        isSearchRoleEmpty: false,
      });
      const termSearchButton = screen.getByText('名前またはメール検索');
      const roleSearchButton = screen.getByText('役割検索');
      expect(termSearchButton).toBeEnabled();
      expect(roleSearchButton).toBeEnabled();
    });

    test('検索フィールドがクリアされた時の状態', () => {
      const { rerender } = renderWithChakra({
        ...defaultProps,
        searchTerm: 'test',
        isSearchTermEmpty: false,
      });

      const searchInput =
        screen.getByPlaceholderText('ユーザー名またはメールアドレスで検索');
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(mockSetSearchTerm).toHaveBeenLastCalledWith('');

      // 空の状態での再レンダリング
      rerender(
        <ChakraProvider>
          <UserSearchForm
            {...defaultProps}
            searchTerm=""
            isSearchTermEmpty={true}
          />
        </ChakraProvider>,
      );

      const termSearchButton = screen.getByText('名前またはメール検索');
      expect(termSearchButton).toBeDisabled();
    });

    test('役割選択がクリアされた時の状態', () => {
      const { rerender } = renderWithChakra({
        ...defaultProps,
        searchRole: 'ADMIN',
        isSearchRoleEmpty: false,
      });

      const roleSelect = screen.getByRole('combobox');
      fireEvent.change(roleSelect, { target: { value: '' } });
      expect(mockSetSearchRole).toHaveBeenLastCalledWith('');

      // 空の状態での再レンダリング
      rerender(
        <ChakraProvider>
          <UserSearchForm
            {...defaultProps}
            searchRole=""
            isSearchRoleEmpty={true}
          />
        </ChakraProvider>,
      );

      const roleSearchButton = screen.getByText('役割検索');
      expect(roleSearchButton).toBeDisabled();
    });
  });

  describe('モバイル表示の詳細テスト', () => {
    test('モバイル表示での全イベントハンドラのテスト', () => {
      // 初期レンダリング
      const { rerender } = renderWithChakra({
        ...defaultProps,
        isMobile: true,
      });

      // 検索入力のテスト
      const searchInput =
        screen.getByPlaceholderText('ユーザー名またはメールアドレスで検索');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      expect(mockSetSearchTerm).toHaveBeenCalledWith('test');

      // 状態を更新して再レンダリング
      rerender(
        <ChakraProvider>
          <UserSearchForm
            {...defaultProps}
            isMobile={true}
            searchTerm="test"
            isSearchTermEmpty={false}
          />
        </ChakraProvider>,
      );

      // data-testidを使用して特定のボタンを取得
      const searchButton = screen.getByTestId('term-search-button');
      fireEvent.click(searchButton);
      expect(mockHandleSearch).toHaveBeenCalledWith('term');

      // 役割選択のテスト
      const roleSelect = screen.getByRole('combobox');
      fireEvent.change(roleSelect, { target: { value: 'ADMIN' } });
      expect(mockSetSearchRole).toHaveBeenCalledWith('ADMIN');

      // リセットボタンのテスト
      const resetButton = screen.getByText('検索結果をリセット');
      fireEvent.click(resetButton);
      expect(mockHandleResetSearch).toHaveBeenCalled();
    });

    test('モバイル表示でのすべてのフォーム要素が正しく表示される', () => {
      renderWithChakra({ ...defaultProps, isMobile: true });

      // 全ての要素の存在確認
      expect(
        screen.getByPlaceholderText('ユーザー名またはメールアドレスで検索'),
      ).toBeInTheDocument();
      expect(screen.getByText('名前またはメール検索')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('役割検索')).toBeInTheDocument();
      expect(screen.getByText('検索結果をリセット')).toBeInTheDocument();

      // スタイルとレイアウトの確認
      const form = screen.getByTestId('mobile-form');
      expect(form).toHaveStyle({ width: '100%' });
    });

    test('モバイル表示での状態遷移のテスト', () => {
      const { rerender } = renderWithChakra({
        ...defaultProps,
        isMobile: true,
      });

      // 初期状態の確認
      expect(screen.getByText('名前またはメール検索')).toBeDisabled();
      expect(screen.getByText('役割検索')).toBeDisabled();

      // 検索条件ありの状態
      rerender(
        <ChakraProvider>
          <UserSearchForm
            {...defaultProps}
            isMobile={true}
            searchTerm="test"
            searchRole="ADMIN"
            isSearchTermEmpty={false}
            isSearchRoleEmpty={false}
          />
        </ChakraProvider>,
      );

      expect(screen.getByText('名前またはメール検索')).toBeEnabled();
      expect(screen.getByText('役割検索')).toBeEnabled();
    });
  });
});
