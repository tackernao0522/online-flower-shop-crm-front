// src/components/organisms/DashboardHeader.tsx

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

const DashboardHeader: React.FC = () => {
  const isLandscape = useBreakpointValue({ landscape: true });
  const iconSize = useBreakpointValue({
    base: "sm",
    md: "md",
    landscape: "sm",
  });

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
          <Input type="text" placeholder="検索..." />
        </InputGroup>
        <Flex gap={2} alignItems="center">
          <IconButton
            aria-label="通知"
            icon={<BellIcon />}
            variant="outline"
            size={iconSize}
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
                <MenuItem>配送管理</MenuItem>
                <MenuItem>顧客対応履歴</MenuItem>
                <MenuItem>キャンペーン管理</MenuItem>
                <MenuItem>ユーザー管理</MenuItem>
                <MenuItem>レポート・分析</MenuItem>
                <MenuItem>eコマース連携</MenuItem>
                <MenuItem>API管理</MenuItem>
                <MenuItem>セキュリティ監査</MenuItem>
                <MenuItem>バックアップと復旧</MenuItem>
                <MenuItem>設定</MenuItem>
                <MenuItem>ヘルプ・サポート</MenuItem>
              </MenuList>
            </Portal>
          </Menu>
          <Menu placement="bottom-end" strategy="fixed">
            <MenuButton as={Box} cursor="pointer">
              <Avatar size={iconSize}>
                <AvatarBadge boxSize="1em" bg="green.500" />
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
