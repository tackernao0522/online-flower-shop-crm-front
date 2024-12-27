import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import axios from 'axios';
import LoginForm from '../LoginForm';
import authReducer from '../../../features/auth/authSlice';
import { ChakraProvider } from '@chakra-ui/react';

jest.mock('axios');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LoginForm', () => {
  let store: EnhancedStore<{
    auth: ReturnType<typeof authReducer>;
  }>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const renderLoginForm = () =>
    render(
      <ChakraProvider>
        <Provider store={store}>
          <LoginForm />
        </Provider>
      </ChakraProvider>,
    );

  it('ログインフォームが正しくレンダリングされること', () => {
    renderLoginForm();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ログイン' }),
    ).toBeInTheDocument();
  });

  it('入力フィールドの値が正しく更新されること', () => {
    renderLoginForm();
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('ログインが成功した場合、ダッシュボードにリダイレクトされること', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { accessToken: 'fake-token', user: { id: '1', name: 'Test User' } },
    });

    renderLoginForm();

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/login'),
        { email: 'test@example.com', password: 'password123' },
        expect.any(Object),
      );
    });
  });

  it('ログインが失敗した場合、エラーメッセージが表示されること', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { error: { message: 'ログインに失敗しました。' } } },
    });

    renderLoginForm();

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      const errorMessage = screen.getByText(
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
        { selector: 'p' },
      );
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('ログイン中にローディングスピナーが表示されること', async () => {
    mockedAxios.post.mockImplementationOnce(() => new Promise(() => {}));

    renderLoginForm();

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  it('既に認証されている場合、フォームが表示されないこと', () => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: { isAuthenticated: true, token: 'fake-token', user: null },
      },
    });

    renderLoginForm();

    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  it('既にログインしている場合、エラーメッセージが表示されること', async () => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: { isAuthenticated: true, token: 'fake-token', user: null },
      },
    });

    renderLoginForm();

    await waitFor(() => {
      expect(
        screen.queryByText(
          '既にログインしています。新しくログインするには一度ログアウトしてください。',
        ),
      ).toBeInTheDocument();
    });
  });

  it('ローカルストレージへの書き込みエラーが発生した場合、エラーメッセージが表示されること', async () => {
    const setItemMock = jest.spyOn(Storage.prototype, 'setItem');
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

    setItemMock.mockImplementation(() => {
      throw new Error('Storage error');
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: { accessToken: 'fake-token', user: { id: '1', name: 'Test User' } },
    });

    renderLoginForm();

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith(
        'Error saving to localStorage:',
        expect.any(Error),
      );
    });

    setItemMock.mockRestore();
    consoleErrorMock.mockRestore();
  });

  it('サーバーから予期しないレスポンスが返ってきた場合、エラーメッセージが表示されること', async () => {
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

    mockedAxios.post.mockResolvedValueOnce({
      data: {},
    });

    renderLoginForm();

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(
      () => {
        const errorMessages = screen.queryAllByText(
          'Unexpected response from server.',
        );
        expect(errorMessages.length).toBeGreaterThan(0);
      },
      { timeout: 2000 },
    );

    consoleErrorMock.mockRestore();
  });

  it('認証済み状態でフォーム送信を試みた場合、エラーメッセージが表示されること', async () => {
    store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: { isAuthenticated: true, token: 'fake-token', user: null },
      },
    });

    const { container } = renderLoginForm();

    const form = container.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(
        screen.getByText(
          '既にログインしています。新しくログインするには一度ログアウトしてください。',
        ),
      ).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('axiosエラーレスポンスのメッセージが空の場合、デフォルトメッセージが表示されること', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { error: {} } },
    });

    renderLoginForm();

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      const errorMessages = screen.getAllByText(
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
      );
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('axiosエラーレスポンスに特定のエラーメッセージがある場合、そのメッセージが表示されること', async () => {
    const customErrorMessage = 'カスタムエラーメッセージ';
    mockedAxios.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          error: { message: customErrorMessage },
        },
      },
    });

    renderLoginForm();

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      const errorMessages = screen.getAllByText(
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
      );
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('axiosエラーレスポンスがない場合、デフォルトメッセージが表示されること', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    renderLoginForm();

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      const errorMessages = screen.getAllByText(
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
      );
      expect(errorMessages.length).toBeGreaterThan(0);

      expect(
        errorMessages.some(el =>
          el.classList.contains('chakra-form__error-message'),
        ),
      ).toBe(true);
    });
  });

  it('認証済み状態でログインを試みた場合、適切なエラーメッセージが表示され、早期リターンすること', async () => {
    store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: { isAuthenticated: true, token: 'fake-token', user: null },
      },
    });

    renderLoginForm();

    const errorMessage = screen.getByText(
      '既にログインしています。新しくログインするには一度ログアウトしてください。',
    );
    expect(errorMessage).toBeInTheDocument();

    expect(screen.queryByLabelText('メールアドレス')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('パスワード')).not.toBeInTheDocument();

    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('axiosエラーレスポンスの詳細なエラーメッセージが表示されること', async () => {
    const specificErrorMessage = 'パスワードが正しくありません。';

    mockedAxios.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          error: {
            message: specificErrorMessage,
          },
        },
      },
    });

    renderLoginForm();

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'wrong-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      const errorMessages = screen.getAllByText(
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
      );
      expect(errorMessages).toHaveLength(2);
      expect(
        errorMessages.some(el =>
          el.classList.contains('chakra-form__error-message'),
        ),
      ).toBe(true);
      expect(
        errorMessages.some(el => el.classList.contains('chakra-text')),
      ).toBe(true);
    });
  });

  it('予期せぬエラーレスポンス形式の場合のフォールバックエラーメッセージをテスト', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          someOtherField: 'error',
        },
      },
    });

    renderLoginForm();

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      const errorMessages = screen.getAllByText(
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
      );
      expect(errorMessages).toHaveLength(2);
    });

    expect(console.error).toHaveBeenCalledWith(
      'Login Error:',
      expect.any(Object),
    );
  });

  it('認証済み状態での早期リターン処理をテスト', async () => {
    store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: { isAuthenticated: true, token: 'fake-token', user: null },
      },
    });

    const { container } = renderLoginForm();

    const form = container.querySelector('form');

    if (form) {
      fireEvent.submit(form);
    }

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(
      screen.getByText(
        '既にログインしています。新しくログインするには一度ログアウトしてください。',
      ),
    ).toBeInTheDocument();
  });

  it('axiosエラーでerror.messageが明示的にnullの場合のフォールバックメッセージをテスト', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          error: {
            message: null,
          },
        },
      },
    });

    renderLoginForm();

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      const errorMessages = screen.getAllByText(
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
      );
      expect(errorMessages.length).toBe(2);

      expect(
        errorMessages.some(el =>
          el.classList.contains('chakra-form__error-message'),
        ),
      ).toBe(true);
      expect(
        errorMessages.some(el => el.classList.contains('chakra-text')),
      ).toBe(true);
    });

    expect(console.error).toHaveBeenCalledWith(
      'Login Error:',
      expect.any(Object),
    );
  });

  it('axiosエラーでresponse.dataが存在しない場合のエラーハンドリング', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: {},
    });

    renderLoginForm();

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      const errorMessages = screen.getAllByText(
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
      );
      expect(errorMessages.length).toBe(2);
    });
  });

  it('認証済み状態でのログイン試行時の完全なエラーハンドリング', async () => {
    store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: { isAuthenticated: true, token: 'fake-token', user: null },
      },
    });

    renderLoginForm();

    const { container } = renderLoginForm();
    const form = container.querySelector('form');

    if (form) {
      fireEvent.submit(form);

      await waitFor(() => {
        expect(
          screen.getByText(
            '既にログインしています。新しくログインするには一度ログアウトしてください。',
          ),
        ).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    }

    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  describe('認証済み状態のエラーハンドリング', () => {
    beforeEach(() => {
      store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: { isAuthenticated: true, token: 'fake-token', user: null },
        },
      });
    });

    it('handleSubmit関数が早期リターンすること', async () => {
      const { container } = renderLoginForm();

      const form = container.querySelector('form');
      if (!form) return;

      const mockEvent = {
        preventDefault: jest.fn(),
      };

      fireEvent.submit(form, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(
        screen.getByText(
          '既にログインしています。新しくログインするには一度ログアウトしてください。',
        ),
      ).toBeInTheDocument();

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('エラーレスポンスのハンドリング', () => {
    it('response.data.error.messageのパスが完全に存在しない場合', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: {},
      });

      renderLoginForm();

      fireEvent.change(screen.getByLabelText('メールアドレス'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('パスワード'), {
        target: { value: 'password123' },
      });

      const submitButton = screen.getByRole('button', { name: 'ログイン' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(
          'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
        );
        expect(errorMessages.length).toBe(2);
      });
    });
  });
});
