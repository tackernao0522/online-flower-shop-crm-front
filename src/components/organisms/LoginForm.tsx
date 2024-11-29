'use client';

import React, { useState, useEffect } from 'react';
import {
  VStack,
  Flex,
  Link,
  useColorModeValue,
  Text,
  useBreakpointValue,
  Spinner,
  Box,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import FormField from '../molecules/FormField';
import CommonButton from '../atoms/CommonButton';
import CommonCheckbox from '../atoms/CommonCheckbox';
import { login } from '../../features/auth/authSlice';
import axios from 'axios';
import { RootState } from '../../store';

const LoginForm: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const buttonSize = useBreakpointValue({ base: 'md', md: 'lg' }) as
    | 'sm'
    | 'md'
    | 'lg'
    | undefined;
  const linkColor = useColorModeValue('blue.500', 'blue.300');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isAuthenticated) {
      setError(
        '既にログインしています。新しくログインするには一度ログアウトしてください。',
      );
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
        {
          email,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          withCredentials: true,
        },
      );

      if (response.data && response.data.accessToken) {
        const { accessToken, user } = response.data;

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('userId', user.id);
          } catch (e) {
            console.error('Error saving to localStorage:', e);
            setError('ローカルストレージへの保存中にエラーが発生しました。');
            setLoading(false);
            return;
          }
        }

        dispatch(login({ token: accessToken, user }));
        router.push('/dashboard');
      } else {
        throw new Error('Unexpected response from server.');
      }
    } catch (err) {
      console.error('Login Error:', err);

      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data.error?.message || 'ログインに失敗しました。',
        );
      } else if (
        err instanceof Error &&
        err.message === 'Unexpected response from server.'
      ) {
        setError('Unexpected response from server.');
      } else {
        setError(
          'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <Text color="red.500" fontSize={{ base: 'sm', md: 'md' }}>
        既にログインしています。新しくログインするには一度ログアウトしてください。
      </Text>
    );
  }

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <VStack spacing={{ base: 4, md: 5 }} align="stretch">
        <FormField
          label="メールアドレス"
          name="email"
          type="email"
          placeholder="your-email@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={error}
        />
        <FormField
          label="パスワード"
          name="password"
          type="password"
          placeholder="********"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <CommonCheckbox size={{ base: 'sm', md: 'md' }}>
          ログイン状態を保持する
        </CommonCheckbox>
        <CommonButton
          type="submit"
          variant="primary"
          size={buttonSize}
          isFullWidthMobile
          disabled={loading}
          height={{ base: '40px', md: '48px' }}
          fontSize={{ base: 'md', md: 'lg' }}>
          {loading ? (
            <Spinner size="sm" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          ) : (
            'ログイン'
          )}
        </CommonButton>
        {error && (
          <Text color="red.500" fontSize={{ base: 'sm', md: 'md' }}>
            {error}
          </Text>
        )}
        <Flex
          justify="space-between"
          fontSize={{ base: 'sm', md: 'md' }}
          flexDirection={{ base: 'column', sm: 'row' }}
          align={{ base: 'stretch', sm: 'center' }}
          gap={2}>
          <Link color={linkColor}>パスワードを忘れた場合</Link>
          <Link color={linkColor}>新規登録</Link>
        </Flex>
      </VStack>
    </Box>
  );
};

LoginForm.displayName = 'LoginForm';

export default LoginForm;
