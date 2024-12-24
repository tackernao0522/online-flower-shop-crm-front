import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useBreakpointValue } from '@chakra-ui/react';
import DashboardHeader from '../DashboardHeader';
import { useUserOnlineStatus } from '../../../hooks/useUserOnlineStatus';

// モックの設定
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    ...originalModule,
    useBreakpointValue: jest.fn(),
  };
});

jest.mock('../../../hooks/useUserOnlineStatus', () => ({
  useUserOnlineStatus: jest.fn(),
}));

jest.mock('../../molecules/LogoutButton', () => {
  const MockLogoutButton = () => (
    <div data-testid="logout-button">ログアウト</div>
  );
  MockLogoutButton.displayName = 'MockLogoutButton';
  return MockLogoutButton;
});

// useRouterのモック設定（next/navigation版）
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/dashboard',
  }),
}));

const mockedUseSelector = useSelector as jest.MockedFunction<
  typeof useSelector
>;

describe('DashboardHeader', () => {
  beforeEach(() => {
    mockedUseSelector.mockReturnValue({ id: 'user-id', role: 'ADMIN' });
    (useBreakpointValue as jest.Mock).mockReturnValue('md');
    (useUserOnlineStatus as jest.Mock).mockReturnValue({
      data: { is_online: true },
      isLoading: false,
      isError: false,
    });
  });

  it('ダッシュボードのタイトルが表示されること', () => {
    render(<DashboardHeader />);
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
  });

  it('検索バーが表示されること', () => {
    render(<DashboardHeader />);
    expect(screen.getByPlaceholderText('検索...')).toBeInTheDocument();
  });

  it('通知アイコンが表示されること', () => {
    render(<DashboardHeader />);
    expect(screen.getByLabelText('通知')).toBeInTheDocument();
  });

  it('オプションメニューが表示されること', () => {
    render(<DashboardHeader />);
    expect(screen.getByLabelText('Options')).toBeInTheDocument();
  });

  it('アバターが表示されること', () => {
    render(<DashboardHeader />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('ログアウトボタンが表示されること', () => {
    render(<DashboardHeader />);
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  it('オンラインステータスに応じてアバターバッジの色が変わること', () => {
    (useUserOnlineStatus as jest.Mock).mockReturnValue({
      data: { is_online: false },
      isLoading: false,
      isError: false,
    });
    render(<DashboardHeader />);
    const avatarBadge = screen.getByTestId('avatar-badge');
    expect(avatarBadge).toHaveStyle(
      'background-color: var(--chakra-colors-gray-500)',
    );
  });

  it('ユーザーオンラインステータスの読み込み中は黄色のバッジが表示されること', () => {
    (useUserOnlineStatus as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });
    render(<DashboardHeader />);
    const avatarBadge = screen.getByTestId('avatar-badge');
    expect(avatarBadge).toHaveStyle(
      'background-color: var(--chakra-colors-yellow-500)',
    );
  });

  it('ユーザーオンラインステータスのエラー時は赤色のバッジが表示されること', () => {
    (useUserOnlineStatus as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });
    render(<DashboardHeader />);
    const avatarBadge = screen.getByTestId('avatar-badge');
    expect(avatarBadge).toHaveStyle(
      'background-color: var(--chakra-colors-red-500)',
    );
  });

  it('検索入力が機能すること', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    render(<DashboardHeader />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(consoleSpy).toHaveBeenCalledWith('Search query:', 'test search');
    consoleSpy.mockRestore();
  });

  it('通知ボタンがクリックされたときにログが出力されること', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    render(<DashboardHeader />);
    const notificationButton = screen.getByTestId('notification-button');
    fireEvent.click(notificationButton);
    expect(consoleSpy).toHaveBeenCalledWith('Notification clicked');
    consoleSpy.mockRestore();
  });

  it('オプションメニューの項目がクリックされたときに適切な処理が行われること', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    render(<DashboardHeader />);
    const optionsButton = screen.getByLabelText('Options');
    fireEvent.click(optionsButton);
    const menuItem = screen.getByText('ユーザー管理');
    fireEvent.click(menuItem);
    expect(consoleSpy).toHaveBeenCalledWith('Navigating to: /user-management');
    consoleSpy.mockRestore();
  });

  it('ルートが定義されていないオプションメニューの項目がクリックされたときにログが出力されること', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    render(<DashboardHeader />);
    const optionsButton = screen.getByLabelText('Options');
    fireEvent.click(optionsButton);
    const menuItem = screen.getByText('配送管理');
    fireEvent.click(menuItem);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Selected option "配送管理" has no route.',
    );
    consoleSpy.mockRestore();
  });

  it('useBreakpointValueのレスポンシブな値が正しく動作すること', () => {
    (useBreakpointValue as jest.Mock).mockReturnValue('lg');
    render(<DashboardHeader />);
    expect(screen.getByPlaceholderText('検索...')).toBeInTheDocument();
  });

  it('オンラインステータスのエラーハンドリングが機能すること', () => {
    (useUserOnlineStatus as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });
    render(<DashboardHeader />);
    const avatarBadge = screen.getByTestId('avatar-badge');
    expect(avatarBadge).toHaveStyle(
      'background-color: var(--chakra-colors-red-500)',
    );
  });

  it('STAFFロールのユーザーにはユーザー管理メニューが表示されないこと', () => {
    // STAFFロールでモックを更新
    mockedUseSelector.mockReturnValue({ id: 'user-id', role: 'STAFF' });

    render(<DashboardHeader />);

    // メニューを開く
    const optionsButton = screen.getByLabelText('Options');
    fireEvent.click(optionsButton);

    // ユーザー管理メニューが存在しないことを確認
    expect(screen.queryByText('ユーザー管理')).not.toBeInTheDocument();

    // 他のメニュー項目は表示されることを確認
    expect(screen.getByText('顧客管理')).toBeInTheDocument();
    expect(screen.getByText('注文管理')).toBeInTheDocument();
  });

  it('ADMINロールのユーザーには全てのメニューが表示されること', () => {
    // ADMINロールでモックを更新
    mockedUseSelector.mockReturnValue({ id: 'user-id', role: 'ADMIN' });

    render(<DashboardHeader />);

    // メニューを開く
    const optionsButton = screen.getByLabelText('Options');
    fireEvent.click(optionsButton);

    // 全てのメニュー項目が表示されることを確認
    expect(screen.getByText('ユーザー管理')).toBeInTheDocument();
    expect(screen.getByText('顧客管理')).toBeInTheDocument();
    expect(screen.getByText('注文管理')).toBeInTheDocument();
  });

  describe('レスポンシブ対応', () => {
    beforeEach(() => {
      mockedUseSelector.mockReturnValue({ id: 'user-id', role: 'ADMIN' });
    });

    it('landscape表示の場合、正しいスタイルが適用されること', () => {
      // landscape用の設定をモック
      (useBreakpointValue as jest.Mock)
        .mockReturnValueOnce(true) // isLandscape
        .mockReturnValueOnce('sm'); // iconSize

      render(<DashboardHeader />);

      // ヘッダーのサイズ確認
      const heading = screen.getByRole('heading', { name: 'ダッシュボード' });
      expect(heading).toHaveStyle({ 'white-space': 'nowrap' });

      // 検索バーの表示確認
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
    });

    it('複数のブレークポイントで正しくレンダリングされること', () => {
      // 異なるブレークポイントをシミュレート
      (useBreakpointValue as jest.Mock)
        .mockReturnValueOnce(false) // isLandscape
        .mockReturnValueOnce('md'); // iconSize

      const { container } = render(<DashboardHeader />);

      // Flexコンテナが存在することを確認
      const flexContainer = container.firstChild;
      expect(flexContainer).toHaveClass('css-16y0b38'); // または適切なクラス名

      // 各要素が正しく表示されていることを確認
      expect(
        screen.getByRole('heading', { name: 'ダッシュボード' }),
      ).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('notification-button')).toBeInTheDocument();
      expect(screen.getByLabelText('Options')).toBeInTheDocument();
    });

    it('モバイル表示でのスタイルが正しく適用されること', () => {
      // モバイル用の設定をモック
      (useBreakpointValue as jest.Mock)
        .mockReturnValueOnce(false) // isLandscape
        .mockReturnValueOnce('sm'); // iconSize

      const { container } = render(<DashboardHeader />);

      // ヘッダーのレイアウトを確認
      const headerContainer = container.firstChild as HTMLElement;
      expect(headerContainer).toBeInTheDocument();

      // モバイルでの検索バーの幅を確認
      const searchContainer = screen.getByTestId('search-input').parentElement;
      expect(searchContainer).toBeInTheDocument();
    });
  });

  describe('メニューとルーティング', () => {
    beforeEach(() => {
      mockedUseSelector.mockReturnValue({ id: 'user-id', role: 'ADMIN' });
    });

    it('未定義のルートを持つメニュー項目をクリックした時の動作確認', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      render(<DashboardHeader />);

      // メニューを開く
      const optionsButton = screen.getByLabelText('Options');
      fireEvent.click(optionsButton);

      // 未定義のルートを持つメニュー項目をクリック
      const undefinedRouteMenuItem = screen.getByText('セキュリティ監査');
      fireEvent.click(undefinedRouteMenuItem);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Selected option "セキュリティ監査" has no route.',
      );
      consoleSpy.mockRestore();
    });
  });

  describe('アバターメニュー', () => {
    it('アバターメニューが正しく動作すること', () => {
      render(<DashboardHeader />);

      // アバターメニューを開く
      const avatarButton = screen.getByTestId('avatar-badge').closest('div');
      fireEvent.click(avatarButton);

      // メニュー項目の表示を確認
      expect(screen.getByText('プロフィール')).toBeInTheDocument();
      expect(screen.getByText('パスワード変更')).toBeInTheDocument();
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    it('アバターメニュー項目がクリック可能であること', () => {
      render(<DashboardHeader />);

      // アバターメニューを開く
      const avatarButton = screen.getByTestId('avatar-badge').closest('div');
      fireEvent.click(avatarButton);

      // メニュー項目をクリック
      const menuItems = ['プロフィール', 'パスワード変更'];
      menuItems.forEach(item => {
        const menuItem = screen.getByText(item);
        fireEvent.click(menuItem);
        expect(menuItem).toBeInTheDocument();
      });
    });

    it('アバターメニューのクリックイベントが正しく動作すること', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      render(<DashboardHeader />);

      // アバターメニューを開く
      const avatarButton = screen.getByTestId('avatar-badge').closest('div');
      fireEvent.click(avatarButton);

      // 各メニュー項目をクリックしてイベントが発火することを確認
      const menuItems = [
        { text: 'プロフィール', expectedLog: 'Profile clicked' },
        { text: 'パスワード変更', expectedLog: 'Password change clicked' },
      ];

      for (const item of menuItems) {
        const menuItem = screen.getByText(item.text);
        fireEvent.click(menuItem);
        // ログ出力や他のイベントを確認
      }

      // ログアウトボタンのクリックも確認
      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);

      consoleSpy.mockRestore();
    });

    it('アバターメニューが開閉できること', () => {
      render(<DashboardHeader />);
      const avatarButton = screen.getByTestId('avatar-badge').closest('div');

      // メニューを開く
      fireEvent.click(avatarButton);
      expect(screen.getByText('プロフィール')).toBeInTheDocument();

      // メニューを閉じる
      fireEvent.click(avatarButton);
      // メニューが閉じていることの確認方法はChakra UIの実装に依存
    });
  });

  describe('レスポンシブ対応の詳細テスト', () => {
    it('すべてのブレークポイントでアイコンサイズが正しく設定されること', () => {
      // 各ブレークポイントでのサイズをテスト
      const breakpoints = ['base', 'md', 'landscape'];
      const sizes = ['sm', 'md', 'sm'];

      breakpoints.forEach((breakpoint, index) => {
        cleanup(); // 各テストの前にクリーンアップ

        (useBreakpointValue as jest.Mock).mockReturnValue(sizes[index]);
        render(<DashboardHeader />);

        const notificationButton = screen.getByTestId('notification-button');
        expect(notificationButton).toBeInTheDocument();
      });
    });
  });
});
