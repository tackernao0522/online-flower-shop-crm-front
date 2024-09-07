import React from "react";
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
} from "@chakra-ui/react";
import { SearchIcon, BellIcon, HamburgerIcon } from "@chakra-ui/icons";
import LogoutButton from "../molecules/LogoutButton";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useUserOnlineStatus } from "../../hooks/useUserOnlineStatus";

const DashboardHeader: React.FC = () => {
  const isLandscape = useBreakpointValue({ landscape: true });
  const iconSize = useBreakpointValue({
    base: "sm",
    md: "md",
    landscape: "sm",
  });

  const user = useSelector((state: RootState) => state.auth.user);

  const {
    data: onlineStatus,
    isLoading,
    isError,
  } = useUserOnlineStatus(user?.id);

  // オンラインステータスのローディングまたはエラー状態を処理
  const badgeColor = isLoading
    ? "yellow.500"
    : isError
    ? "red.500"
    : onlineStatus?.is_online
    ? "green.500"
    : "gray.500";

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Search query:", event.target.value);
  };

  const handleNotificationClick = () => {
    console.log("Notification clicked");
  };

  const handleOptionSelect = (option: string) => {
    console.log("Selected option:", option);
  };

  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ base: "flex-start", sm: "center" }}
      mb={{ base: 4, md: 5 }}
      gap={4}
      flexWrap="wrap">
      <Heading
        as="h1"
        size={{ base: "lg", md: "xl", landscape: "md" }}
        whiteSpace="nowrap"
        mb={{ base: 2, sm: 0 }}>
        ダッシュボード
      </Heading>
      <Flex
        wrap="wrap"
        gap={{ base: 2, md: 4 }}
        justifyContent={{ base: "flex-start", sm: "flex-end" }}
        alignItems="center"
        width={{ base: "100%", sm: "auto" }}>
        <InputGroup
          size={iconSize}
          maxWidth={{ base: "100%", sm: "200px", landscape: "150px" }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="検索..."
            onChange={handleSearch}
            data-testid="search-input"
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
                {[
                  "配送管理",
                  "顧客対応履歴",
                  "キャンペーン管理",
                  "ユーザー管理",
                  "レポート・分析",
                  "eコマース連携",
                  "API管理",
                  "セキュリティ監査",
                  "バックアップと復旧",
                  "設定",
                  "ヘルプ・サポート",
                ].map((option) => (
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
