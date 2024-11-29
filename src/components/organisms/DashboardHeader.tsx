import React from 'react';
import {
  Flex,
  Heading,
  InputGroup,
  InputLeftElement,
  Input,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  AvatarBadge,
  useBreakpointValue,
  Box,
  Portal,
} from '@chakra-ui/react';
import { SearchIcon, BellIcon, HamburgerIcon } from '@chakra-ui/icons';
import LogoutButton from '../molecules/LogoutButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useUserOnlineStatus } from '../../hooks/useUserOnlineStatus';
import { useRouter } from 'next/navigation';
import CommonInput from '../atoms/CommonInput';

// メニューオプションの定義
const menuOptions = [
  'ユーザー管理',
  '顧客管理',
  '注文管理',
  '配送管理',
  '顧客対応履歴',
  'キャンペーン管理',
  'レポート・分析',
  'eコマース連携',
  'API管理',
  'セキュリティ監査',
  'バックアップと復旧',
  '設定',
  'ヘルプ・サポート',
] as const;

type MenuOption = (typeof menuOptions)[number];

// ルーティング情報の定義
const ROUTES: Partial<Record<MenuOption, string>> = {
  ユーザー管理: '/user-management',
  顧客管理: '/customers',
  注文管理: '/orders',
  // 他のルートも必要に応じて追加
};

const DashboardHeader: React.FC = () => {
  const isLandscape = useBreakpointValue({ landscape: true });
  const iconSize = useBreakpointValue({
    base: 'sm',
    md: 'md',
    landscape: 'sm',
  });

  const user = useSelector((state: RootState) => state.auth.user);
  console.log('User role:', user?.role); // roleが正しく取得できているか確認

  const {
    data: onlineStatus,
    isLoading,
    isError,
  } = useUserOnlineStatus(user?.id);

  // オンラインステータスのローディングまたはエラー状態を処理
  const badgeColor = isLoading
    ? 'yellow.500'
    : isError
      ? 'red.500'
      : onlineStatus?.is_online
        ? 'green.500'
        : 'gray.500';

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Search query:', event.target.value);
  };

  const handleNotificationClick = () => {
    console.log('Notification clicked');
  };

  const router = useRouter();

  const handleOptionSelect = (option: MenuOption) => {
    const route = ROUTES[option];
    if (route) {
      console.log(`Navigating to: ${route}`);
      router.push(route);
    } else {
      console.log(`Selected option "${option}" has no route.`);
    }
  };

  // STAFFロールの場合、"ユーザー管理"メニューを表示しない
  const filteredMenuOptions =
    user?.role === 'STAFF'
      ? menuOptions.filter(option => option !== 'ユーザー管理')
      : menuOptions;

  return (
    <Flex
      direction={{ base: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ base: 'flex-start', sm: 'center' }}
      mb={{ base: 4, md: 5 }}
      gap={4}
      flexWrap="wrap">
      <Heading
        as="h1"
        size={{ base: 'lg', md: 'xl', landscape: 'md' }}
        whiteSpace="nowrap"
        mb={{ base: 2, sm: 0 }}>
        ダッシュボード
      </Heading>
      <Flex
        wrap="wrap"
        gap={{ base: 2, md: 4 }}
        justifyContent={{ base: 'flex-start', sm: 'flex-end' }}
        alignItems="center"
        width={{ base: '100%', sm: 'auto' }}>
        <InputGroup
          size={iconSize}
          maxWidth={{ base: '100%', sm: '200px', landscape: '150px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <CommonInput
            type="text"
            placeholder="検索..."
            onChange={handleSearch}
            data-testid="search-input"
            paddingLeft="40px"
          />
        </InputGroup>
        <Flex gap={2} alignItems="center">
          <IconButton
            aria-label="通知"
            icon={<BellIcon />}
            variant="outline"
            size={iconSize}
            onClick={handleNotificationClick}
            data-testid="notification-button"
          />
          <Menu placement="bottom-end" strategy="fixed">
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon />}
              variant="outline"
              size={iconSize}
            />
            <Portal>
              <MenuList>
                {filteredMenuOptions.map(option => (
                  <MenuItem
                    key={option}
                    onClick={() => handleOptionSelect(option)}>
                    {option}
                  </MenuItem>
                ))}
              </MenuList>
            </Portal>
          </Menu>
          <Menu placement="bottom-end" strategy="fixed">
            <MenuButton as={Box} cursor="pointer">
              <Avatar size={iconSize}>
                <AvatarBadge
                  boxSize="1em"
                  bg={badgeColor}
                  data-testid="avatar-badge"
                />
              </Avatar>
            </MenuButton>
            <Portal>
              <MenuList>
                <MenuItem>プロフィール</MenuItem>
                <MenuItem>設定</MenuItem>
                <MenuItem>パスワード変更</MenuItem>
                <LogoutButton />
              </MenuList>
            </Portal>
          </Menu>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default DashboardHeader;
